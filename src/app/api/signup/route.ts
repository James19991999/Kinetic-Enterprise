import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { createSessionCookie, sessionCookieOptions } from '@/lib/firebase/session';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { slugify } from '@/lib/pulse';
import { PLAN_SEAT_LIMITS } from '@/lib/stripe';
import { logUsage } from '@/lib/usage';

const bodySchema = z.object({
  idToken: z.string().min(1),
  orgName: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`signup:${ip}`, 5, 15 * 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please fill in every field.' }, { status: 400 });
  }

  const { idToken, orgName, displayName } = parsed.data;

  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    const db = adminDb();

    const existing = await db.collection('users').doc(decoded.uid).get();
    if (existing.exists) {
      return NextResponse.json({ error: 'An account already exists for this user.' }, { status: 409 });
    }

    const orgRef = db.collection('organizations').doc();
    const userRef = db.collection('users').doc(decoded.uid);

    const batch = db.batch();
    batch.set(orgRef, {
      name: orgName,
      slug: slugify(orgName),
      ownerUid: decoded.uid,
      plan: 'basic',
      seatLimit: PLAN_SEAT_LIMITS.basic,
      subscriptionStatus: 'none',
      officeLocations: [],
      createdAt: FieldValue.serverTimestamp(),
    });
    batch.set(userRef, {
      orgId: orgRef.id,
      email: decoded.email ?? '',
      displayName,
      role: 'owner',
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    // organizations/{orgId}/auditLog — owner/admin-readable, never
    // client-writable at any role (see firestore.rules).
    await orgRef.collection('auditLog').add({
      type: 'org_created',
      uid: decoded.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    const sessionCookie = await createSessionCookie(idToken);
    cookies().set({ ...sessionCookieOptions(), value: sessionCookie });

    await logUsage({ orgId: orgRef.id, uid: decoded.uid, type: 'signup', route: '/api/signup' });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/signup failed', error);
    return NextResponse.json({ error: 'Sign-up failed. Please try again.' }, { status: 400 });
  }
}
