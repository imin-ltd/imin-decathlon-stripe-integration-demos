import Stripe from 'stripe';

export async function transferAndSetDestinationChargeMetadata(
  stripe: Stripe,
  chargeAmountPence: number,
  chargeId: string,
  metadata: Record<string, string>,
  destinationStripeAccountId: string,
) {
  const transfer = await stripe.transfers.create({
    amount: chargeAmountPence,
    currency: 'gbp',
    source_transaction: chargeId,
    destination: destinationStripeAccountId,
    metadata: metadata,
  });

  console.log('Created transfer:', transfer);

  if (!transfer.destination_payment) {
    throw new Error('Transfer must have a `.destination_payment`');
  }
  const destinationPayment =
    typeof transfer.destination_payment === 'string'
      ? transfer.destination_payment
      : transfer.destination_payment.id;

  // Set metadata in the destination payment
  // This is because the transfer metadata does not carry over to the destination account
  // This approach came from here: https://support.stripe.com/questions/how-can-you-carry-over-the-description-or-metadata-to-the-payment-on-the-connected-account-for-a-destination-charge
  const updatedDestinationCharge = await stripe.charges.update(
    destinationPayment,
    {
      metadata: metadata,
    },
    {
      stripeAccount: destinationStripeAccountId,
    },
  );
  console.log('Updated destination charge:', updatedDestinationCharge);
  return {
    transfer,
    updatedDestinationCharge,
  };
}
