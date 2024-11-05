/**
 * Serve a demo Stripe Checkout.
 *
 * This allows a customer to put a payment into the Dummy Decathlon Stripe
 * account.
 *
 * When it's running, go to http://localhost:4242/checkout.html.
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { SELLER_STRIPE_ACCOUNT_ID, decathlonStripe } from '../common/consts.js';

const PORT = process.env.PORT ?? 4242;

const app = express();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const publicDir = path.join(__dirname, 'public');
console.log('publicDir:', publicDir);
app.use(express.static(publicDir));

const YOUR_DOMAIN = `http://localhost:${PORT}`;

app.post('/create-checkout-session', async (_req, res) => {
  const session = await decathlonStripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Football lesson',
          },
          unit_amount: 1000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    payment_intent_data: {
      metadata: {
        orderUuid: uuidv4(),
        sellerStripeAccountId: SELLER_STRIPE_ACCOUNT_ID,
        // isDecathlon: true,
        // isTransferModel: true,
      },
    },
  });

  if (!session.url) {
    throw new Error('No session.url found');
  }

  res.redirect(303, session.url);
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
