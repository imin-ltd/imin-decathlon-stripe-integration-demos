/**
 * For the imin stripe account.
 *
 * A Stripe webhook that waits for payments received from the Dummy Decathlon
 * Stripe account, and forwards them to the Dummy Seller Stripe account.
 */
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { handleChargeEvent } from './forwardTransfer.js';

const app = express();

// Match the raw body to content type application/json
// If you are using Express v4 - v4.16 you need to use body-parser, not express, to retrieve the request body
app.post(
  '/webhook',
  express.json({ type: 'application/json' }),
  async (request, response) => {
    const event = request.body as Stripe.Event;

    console.log(`event (type=${event.type})`, JSON.stringify(event, null, 2));

    await handleChargeEvent(event);

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  },
);

app.listen(4242, () => console.log('Running on port 4242'));

// async function handleTransferSent(paymentId: string) {
//   console.log(
//     'this appears to be a transfer from Decathlon to imin. Payment ID:',
//     paymentId,
//   );
// }
