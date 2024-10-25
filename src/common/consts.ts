import { z } from 'zod';
import Stripe from 'stripe';

export const DECATHLON_STRIPE_ACCOUNT_ID = z
  .string()
  .min(1)
  .parse(process.env.DECATHLON_STRIPE_ACCOUNT_ID);
export const IMIN_STRIPE_ACCOUNT_ID = z
  .string()
  .min(1)
  .parse(process.env.IMIN_STRIPE_ACCOUNT_ID);
export const SELLER_STRIPE_ACCOUNT_ID = z
  .string()
  .min(1)
  .parse(process.env.SELLER_STRIPE_ACCOUNT_ID);

export const decathlonStripe = new Stripe(
  z.string().min(1).parse(process.env.DECATHLON_STRIPE_SECRET_KEY),
);

export const iminStripe = new Stripe(
  z.string().min(1).parse(process.env.IMIN_STRIPE_SECRET_KEY),
);
