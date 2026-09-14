import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import type Stripe from 'stripe';
import { getStripe, mapStripeStatus, planForPriceId, PLAN_SEAT_LIMITS } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed', error);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const orgId = checkoutSession.metadata?.orgId ?? checkoutSession.client_reference_id;
        if (orgId && checkoutSession.customer) {
          await syncOrg(orgId, {
            stripeCustomerId: String(checkoutSession.customer),
            stripeSubscriptionId: checkoutSession.subscription ? String(checkoutSession.subscription) : undefined,
          });
          await auditLifecycleEvent(orgId, 'checkout_completed');
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = await orgIdForCustomer(String(subscription.customer));
        if (orgId) {
          const priceId = subscription.items.data[0]?.price.id;
          const plan = priceId ? planForPriceId(priceId) : 'basic';
          await syncOrg(orgId, {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: mapStripeStatus(subscription.status),
            plan,
            seatLimit: PLAN_SEAT_LIMITS[plan],
          });
          await auditLifecycleEvent(orgId, 'subscription_updated');
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = await orgIdForCustomer(String(subscription.customer));
        if (orgId) {
          await syncOrg(orgId, { subscriptionStatus: 'canceled' });
          await auditLifecycleEvent(orgId, 'subscription_canceled');
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const orgId = await orgIdForCustomer(String(invoice.customer));
        if (orgId) {
          await syncOrg(orgId, { subscriptionStatus: 'past_due' });
          await auditLifecycleEvent(orgId, 'payment_failed');
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handler failed', error);
    return NextResponse.json({ error: 'Webhook handler error.' }, { status: 500 });
  }
}

async function orgIdForCustomer(customerId: string): Promise<string | null> {
  const snap = await adminDb()
    .collection('organizations')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  return snap.docs[0]?.id ?? null;
}

async function syncOrg(
  orgId: string,
  fields: Partial<{
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    subscriptionStatus: string;
    plan: string;
    seatLimit: number;
  }>
): Promise<void> {
  await adminDb()
    .collection('organizations')
    .doc(orgId)
    .set({ ...fields, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function auditLifecycleEvent(orgId: string, type: string): Promise<void> {
  await adminDb().collection('organizations').doc(orgId).collection('auditLog').add({
    type,
    uid: 'stripe_webhook',
    createdAt: FieldValue.serverTimestamp(),
  });
}
