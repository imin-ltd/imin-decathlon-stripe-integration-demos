/**
 * For the imin stripe account.
 *
 * Listen for transfer reversals from Decathlon-enabled sellers. For each of
 * these, reverse them back to Decathlon.
 */
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { handleEvent } from './handleEvent.js';

const app = express();

// Match the raw body to content type application/json
// If you are using Express v4 - v4.16 you need to use body-parser, not express, to retrieve the request body
app.post(
  '/webhook',
  express.json({ type: 'application/json' }),
  async (request, response) => {
    const event = request.body as Stripe.Event;

    console.log(`event (type=${event.type})`, JSON.stringify(event, null, 2));

    await handleEvent(event);

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  },
);

app.listen(4242, () => console.log('Running on port 4242'));
