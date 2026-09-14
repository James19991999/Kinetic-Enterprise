import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession, revokeSession } from '@/lib/firebase/session';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export async function POST() {
  const session = await getServerSession();
  if (session) {
    try {
      await revokeSession(session.uid);
    } catch (error) {
      console.error('revokeSession failed', error);
    }
  }
  cookies().delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
