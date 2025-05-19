/**
 * For the imin stripe account.
 *
 * Listen for transfer reversals from Decathlon-enabled sellers. For each of
 * these, reverse them back to Decathlon.
 */
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { handleChargeEvent as handleForwardChargeEvent } from '../3-imin-forward-transfer-to-seller/forwardTransfer.js';
import { handleEvent as handleReverseTransferEvent } from '../4-imin-reverse-transfer-listener/handleEvent.js';

const app = express();

app.post(
  '/webhook',
  express.json({ type: 'application/json' }),
  async (request, response) => {
    const event = request.body as Stripe.Event;

    console.log(`event (type=${event.type})`, JSON.stringify(event, null, 2));

    // Each of these will early-return if the event is not relevant to them, so
    // we can happily run them both.
    await handleForwardChargeEvent(event);
    await handleReverseTransferEvent(event);

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  },
);

app.listen(4242, () => console.log('Running on port 4242'));
