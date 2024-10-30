/**
 * Start an express server for a user (imin) to connect their Stripe account to
 * Decathlon.
 *
 * The OAuth token response will be logged to the console. You may want to make
 * a note of it but it has no immediate use.
 */
import express from 'express';
import Stripe from 'stripe';

// Assert env vars
if (!process.env.BASE_URL) {
  throw new Error(
    'Env var BASE_URL is required (e.g. BASE_URL=https://example.com)',
  );
}
if (!process.env.STRIPE_CONNECT_CLIENT_ID) {
  throw new Error(
    'Env var STRIPE_CONNECT_CLIENT_ID is required (e.g. STRIPE_CONNECT_CLIENT_ID=ca_...)',
  );
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'Env var STRIPE_SECRET_KEY is required (e.g. STRIPE_SECRET_KEY=sk_test_...)',
  );
}
if (!process.env.PORT) {
  throw new Error('Env var PORT is required (e.g. PORT=3000)');
}

const BASE_URL = process.env.BASE_URL;
const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PORT = process.env.PORT;

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Setup app
const app = express();

app.get('/', (_req, res) => {
  res.type('text/html').send(`
    <html>
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: xx-large;
          color: white;
        }
        button {
          font-size: xx-large;
          padding: 20px 40px;
          border-radius: 10px;
          border: 2px solid white;
          background: transparent;
          color: white;
          cursor: pointer;
        }
        .stars {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000 url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
          z-index: -1;
          animation: movingstars 200s linear infinite;
        }
        @keyframes movingstars {
          from { background-position: 0 0; }
          to { background-position: -10000px 5000px; }
        }
      </style>
      <body>
        <div class="stars"></div>
        <form action="/stripe-connect/start" method="POST">
          <button type="submit">Connect to Decathlon</button>
        </form>
      </body>
    </html>
    `);
});

app.post('/stripe-connect/start', (_req, res) => {
  const urlQueryObj = {
    client_id: STRIPE_CONNECT_CLIENT_ID,
    scope: 'read_write',
    response_type: 'code',
    redirect_uri: `${BASE_URL}/stripe-connect/cb`,
  };
  const url = `https://connect.stripe.com/oauth/authorize?${new URLSearchParams(urlQueryObj).toString()}`;
  res.redirect(url);
});

app.get('/stripe-connect/cb', async (req, res) => {
  if (!req.query.code || typeof req.query.code !== 'string') {
    res.status(400).send('Missing `code`');
    return;
  }

  const stripeOauthTokenResponse = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code: req.query.code,
  });
  console.log('stripeOauthTokenResponse', stripeOauthTokenResponse);
  res.type('text/html').send(`
    <html>
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: xx-large;
        }
      </style>
      <body>
        <p>You are now successfully connected to Decathlon's stripe account!</p>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKSCQsmPCaUEmzq5eEOJ6jW6mFP5_lNsA7Qg&s" alt="Basket of kittens" />
      </body>
    </html>
    `);
});

// Run app
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
