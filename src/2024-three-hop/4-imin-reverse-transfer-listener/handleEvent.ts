import Stripe from 'stripe';
import { IMIN_STRIPE_ACCOUNT_ID, iminStripe } from '../../common/consts.js';

export async function handleEvent(event: Stripe.Event) {
  if (event.type !== 'transfer.reversed') {
    return;
  }
  if (event.account && event.account !== IMIN_STRIPE_ACCOUNT_ID) {
    console.warn(
      `This is a connected account's (${event.account}) transfer reversal, rather than ours (${IMIN_STRIPE_ACCOUNT_ID}), so we are ignoring`,
    );
    return;
  }
  if (event.data.object.object !== 'transfer') {
    console.warn(
      `Unexpectedly, a non-transfer object (${event.data.object.object}) was received for event type (${event.type}):`,
      event.data.object,
    );
    return;
  }
  const transfer = event.data.object as Stripe.Transfer;
  // TODO(later) these throws need to be raised for human action
  if (!transfer.metadata.orderUuid) {
    throw new Error(
      `No orderUuid found in transfer metadata. Don't know how to reconcile this`,
    );
  }
  if (!transfer.source_transaction) {
    throw new Error(
      `No source_transaction found in transfer, which means we cannot find the charge to refund`,
    );
  }
  const sourceChargeId =
    typeof transfer.source_transaction === 'string'
      ? transfer.source_transaction
      : transfer.source_transaction.id;
  const isPartialRefund = transfer.amount_reversed !== transfer.amount;
  // if (transfer.amount_reversed !== transfer.amount) {
  //   // TODO(later)
  //   throw new Error('This is a partial refund, which we do not yet support');
  // }
  /* TODO(later) we may want to do some checks here to confirm that this is a
  transfer whose reversal should lead to a charge refund e.g. retrieve the order
  from the booking db and check that it is a Decathlon order, etc */
  const refund = await iminStripe.refunds.create({
    charge: sourceChargeId,
    ...(isPartialRefund ? { amount: transfer.amount_reversed } : {}),
  });
  console.log('Created refund:', refund);
}
