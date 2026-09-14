import Stripe from 'stripe';
import type { Plan, SubscriptionStatus } from '@/types';

let _stripe: Stripe | null = null;

/** Lazily-initialized Stripe server client (never bundled to the client). */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set.');
  }
  _stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  return _stripe;
}

export const PLAN_SEAT_LIMITS: Record<Plan, number> = {
  basic: 10,
  pro: 50,
  enterprise: 1000,
};

export function priceIdForPlan(plan: Plan): string {
  const map: Record<Plan, string | undefined> = {
    basic: process.env.STRIPE_PRICE_BASIC,
    pro: process.env.STRIPE_PRICE_PRO,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  };
  const priceId = map[plan];
  if (!priceId) {
    throw new Error(`No Stripe price configured for plan "${plan}".`);
  }
  return priceId;
}

export function planForPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';
  return 'basic';
}

export function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    case 'incomplete':
      return 'incomplete';
    default:
      return 'none';
  }
}
