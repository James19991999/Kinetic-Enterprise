import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/firebase/session';
import { requireSession, assertRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';
import { getStripe, priceIdForPlan } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase/admin';
import { APP_URL } from '@/lib/constants';
import type { Organization } from '@/types';

const bodySchema = z.object({ plan: z.enum(['basic', 'pro', 'enterprise']) });

export async function POST(request: Request) {
  const session = await getServerSession();
  try {
    requireSession(session);
    assertRole(session, 'owner');
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
    throw error;
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan selection.' }, { status: 400 });
  }

  try {
    const orgRef = adminDb().collection('organizations').doc(session.orgId);
    const orgSnap = await orgRef.get();
    const org = orgSnap.data() as Organization | undefined;

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: org?.stripeCustomerId,
      customer_email: org?.stripeCustomerId ? undefined : session.email,
      line_items: [{ price: priceIdForPlan(parsed.data.plan), quantity: 1 }],
      success_url: `${APP_URL}/settings?checkout=success`,
      cancel_url: `${APP_URL}/settings?checkout=canceled`,
      client_reference_id: session.orgId,
      metadata: { orgId: session.orgId, plan: parsed.data.plan },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('POST /api/stripe/create-checkout-session failed', error);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
