import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { createSessionCookie, sessionCookieOptions } from '@/lib/firebase/session';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logUsage } from '@/lib/usage';
import { adminDb } from '@/lib/firebase/admin';
import type { UserProfile } from '@/types';

const bodySchema = z.object({ idToken: z.string().min(1) });

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`login:${ip}`, 10, 5 * 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const decoded = await adminAuth().verifyIdToken(parsed.data.idToken);
    const profileSnap = await adminDb().collection('users').doc(decoded.uid).get();
    if (!profileSnap.exists) {
      return NextResponse.json({ error: 'No account found for this user.' }, { status: 404 });
    }
    const profile = profileSnap.data() as UserProfile;

    const sessionCookie = await createSessionCookie(parsed.data.idToken);
    cookies().set({ ...sessionCookieOptions(), value: sessionCookie });

    await logUsage({ orgId: profile.orgId, uid: decoded.uid, type: 'login', route: '/api/login' });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/login failed', error);
    return NextResponse.json({ error: 'Sign-in failed. Please try again.' }, { status: 401 });
  }
}
