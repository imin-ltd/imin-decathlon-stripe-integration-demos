/**
 * Transfer a payment from the Dummy Decathlon Stripe account to the Dummy Imin
 * Stripe account.
 */
import 'dotenv/config';
import { decathlonStripe, IMIN_STRIPE_ACCOUNT_ID } from '../common/consts.js';
import { transferAndSetDestinationChargeMetadata } from '../common/transferAndSetDestinationChargeMetadata.js';

main();

async function main() {
  if (!process.env.PAYMENT_INTENT_ID) {
    throw new Error('Must set env vars PAYMENT_INTENT_ID');
  }
  const PAYMENT_INTENT_ID = process.env.PAYMENT_INTENT_ID;

  const paymentIntent = await decathlonStripe.paymentIntents.retrieve(
    PAYMENT_INTENT_ID,
    {
      // The charge's balance transaction gives us the net amount after Stripe fees
      expand: ['latest_charge.balance_transaction'],
    },
  );

  console.log('retrieved paymentIntent:', paymentIntent);

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

  if (typeof charge.balance_transaction === 'string') {
    throw new Error(
      'Payment intent `.latest_charge.balance_transaction` must be expanded to a balance transaction object',
    );
  }
  if (!charge.balance_transaction) {
    throw new Error(
      'Payment intent `.latest_charge.balance_transaction` must not be null',
    );
  }
  const balanceTransaction = charge.balance_transaction;
  const chargeId = paymentIntent.latest_charge.id;

  // if (!paymentIntent.amount) {
  //   throw new Error(
  //     'Payment intent must have a non-zero `.amount` for a transfer',
  //   );
  // }
  const amountPenceAfterStripeFee = balanceTransaction.net;

  // if (!process.env.CHARGE_ID || !process.env.CHARGE_AMOUNT_PENCE) {
  //   throw new Error('Must set env vars CHARGE_ID and CHARGE_AMOUNT_PENCE');
  // }
  // const CHARGE_ID = process.env.CHARGE_ID;
  // const CHARGE_AMOUNT_PENCE = Number(process.env.CHARGE_AMOUNT_PENCE);

  await transferAndSetDestinationChargeMetadata(
    decathlonStripe,
    amountPenceAfterStripeFee,
    chargeId,
    paymentIntent.metadata,
    IMIN_STRIPE_ACCOUNT_ID,
  );
}
