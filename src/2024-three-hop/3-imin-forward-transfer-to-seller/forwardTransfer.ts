import Stripe from 'stripe';
import {
  DECATHLON_STRIPE_ACCOUNT_ID,
  IMIN_STRIPE_ACCOUNT_ID,
  iminStripe,
} from '../../common/consts.js';
import { transferAndSetDestinationChargeMetadata } from '../../common/transferAndSetDestinationChargeMetadata.js';

export async function handleChargeEvent(event: Stripe.Event) {
  // payment.created when the transfer is sent in the first place.
  // charge.updated when the transfer is updated to include metadata
  if (
    // payment.created is not documented :/
    (event.type as string) !== 'payment.created' &&
    event.type !== 'charge.updated'
  ) {
    return;
  }
  if (event.account && event.account !== IMIN_STRIPE_ACCOUNT_ID) {
    console.warn(
      `This is a connected account's (${event.account}) transfer reversal, rather than ours (${IMIN_STRIPE_ACCOUNT_ID}), so we are ignoring`,
    );
    return;
  }
  if (event.data.object.object !== 'charge') {
    console.warn(
      `Unexpectedly, a non-charge object (${event.data.object.object}) was received for event type (${event.type}):`,
      event.data.object,
    );
    return;
  }
  const charge = event.data.object as Stripe.Charge;
  if (charge.source?.id !== DECATHLON_STRIPE_ACCOUNT_ID) {
    // This hasn't come from Decathlon
    return;
  }
  const chargeId = charge.id;
  const metadata = charge.metadata;
  if (!metadata.sellerStripeAccountId) {
    // TODO(later) in future this should be persisted somewhere and actioned on if the metadata never arrives
    console.log(
      `Seen charge from Decathlon (${chargeId}), but it does not (yet) have metadata`,
    );
    return;
  }
  console.log(
    `Seen charge from Decathlon (${chargeId}) with metadata`,
    metadata,
  );

  await transferAndSetDestinationChargeMetadata(
    iminStripe,
    charge.amount,
    charge.currency,
    chargeId,
    metadata,
    metadata.sellerStripeAccountId,
  );
  // TODO(later) we can now de-persist any earlier notice of charge without metadata
}
