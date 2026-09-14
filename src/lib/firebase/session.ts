import 'server-only';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import type { SessionClaims, UserProfile } from '@/types';

const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

/** Verifies a fresh Firebase ID token and mints an httpOnly session cookie. */
export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS });
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  };
}

/**
 * The single source of truth for every protected server component and API
 * route: reads the session cookie, verifies it (checking revocation), and
 * resolves { uid, orgId, role, email } from the user's own profile doc.
 */
export async function getServerSession(): Promise<SessionClaims | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    const profileSnap = await adminDb().collection('users').doc(decoded.uid).get();
    if (!profileSnap.exists) return null;
    const profile = profileSnap.data() as UserProfile;
    return { uid: decoded.uid, orgId: profile.orgId, role: profile.role, email: profile.email };
  } catch {
    return null;
  }
}

export async function revokeSession(uid: string): Promise<void> {
  await adminAuth().revokeRefreshTokens(uid);
}
