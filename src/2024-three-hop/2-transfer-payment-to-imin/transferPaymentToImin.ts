/**
 * A script which transfers a payment from Decathlon's Stripe account to imin's
 * Stripe account.
 *
 * After the transfer, the destination charge is updated to set the metadata.
 *
 * Pre-requisites to running:
 * - Directory has `stripe` NPM dependency installed.
 * - Node.js is version 18
 */
import 'dotenv/config';
import Stripe from 'stripe';

// Assert env vars
if (!process.env.PAYMENT_INTENT_ID) {
  throw new Error(
    'Env var PAYMENT_INTENT_ID is required (e.g. PAYMENT_INTENT_ID=pi_...)',
  );
}
if (!process.env.DECATHLON_STRIPE_SECRET_KEY) {
  throw new Error(
    'Env var DECATHLON_STRIPE_SECRET_KEY is required (e.g. DECATHLON_STRIPE_SECRET_KEY=sk_test_...)',
  );
}
if (!process.env.IMIN_STRIPE_ACCOUNT_ID) {
  throw new Error(
    'Env var IMIN_STRIPE_ACCOUNT_ID is required (e.g. IMIN_STRIPE_ACCOUNT_ID=acct_...)',
  );
}

const PAYMENT_INTENT_ID = process.env.PAYMENT_INTENT_ID;
const IMIN_STRIPE_ACCOUNT_ID = process.env.IMIN_STRIPE_ACCOUNT_ID;
const decathlonStripe = new Stripe(process.env.DECATHLON_STRIPE_SECRET_KEY);

// Run
main();

async function main() {
  const paymentIntent = await decathlonStripe.paymentIntents.retrieve(
    PAYMENT_INTENT_ID,
    {
      // The charge's balance transaction gives us the net amount after Stripe fees
      expand: ['latest_charge.balance_transaction'],
    },
  );

  console.log('retrieved paymentIntent:', paymentIntent);

  if (!paymentIntent.amount) {
    throw new Error(
      'Payment intent must have a non-zero `.amount` for a transfer',
    );
  }
  if (!paymentIntent.latest_charge) {
    throw new Error(
      'Payment intent has no `.latest_charge`, which is required for a transfer',
    );
  }
  if (typeof paymentIntent.latest_charge === 'string') {
    throw new Error(
      'Payment intent `.latest_charge` must be expanded to a charge object',
    );
  }

  const charge = paymentIntent.latest_charge;

  if (!charge.balance_transaction) {
    throw new Error(
      'Payment intent `.latest_charge.balance_transaction` must not be null',
    );
  }
  if (typeof charge.balance_transaction === 'string') {
    throw new Error(
      'Payment intent `.latest_charge.balance_transaction` must be expanded to a balance transaction object',
    );
  }
  const balanceTransaction = charge.balance_transaction;
  const chargeId = paymentIntent.latest_charge.id;
  // We transfer the net amount rather than the full amount.
  // If we sent the full amount, then Decathlon's account would go into negative balance.
  const amountPenceAfterStripeProcessingFee = balanceTransaction.net;

  await transferAndSetDestinationChargeMetadata(
    decathlonStripe,
    amountPenceAfterStripeProcessingFee,
    balanceTransaction.currency,
    chargeId,
    paymentIntent.metadata,
    IMIN_STRIPE_ACCOUNT_ID,
  );
}

async function transferAndSetDestinationChargeMetadata(
  stripe: Stripe,
  chargeAmountPence: number,
  currency: string,
  chargeId: string,
  metadata: Record<string, string>,
  destinationStripeAccountId: string,
) {
  const transfer = await stripe.transfers.create({
    amount: chargeAmountPence,
    currency,
    // Link the transfer to the original charge
    source_transaction: chargeId,
    destination: destinationStripeAccountId,
    metadata: metadata,
  });

  console.log('Created transfer:', transfer);

  // Set metadata in the destination payment
  // This is because the transfer metadata does not carry over to the destination account
  // This approach came from here: https://support.stripe.com/questions/how-can-you-carry-over-the-description-or-metadata-to-the-payment-on-the-connected-account-for-a-destination-charge
  if (!transfer.destination_payment) {
    throw new Error('Transfer must have a `.destination_payment`');
  }
  const destinationPayment =
    typeof transfer.destination_payment === 'string'
      ? transfer.destination_payment
      : transfer.destination_payment.id;

  const updatedDestinationCharge = await stripe.charges.update(
    destinationPayment,
    {
      metadata: metadata,
    },
    {
      // This updates a charge that's in imin's account
      stripeAccount: destinationStripeAccountId,
    },
  );
  console.log('Updated destination charge:', updatedDestinationCharge);
  return {
    transfer,
    updatedDestinationCharge,
  };
}
