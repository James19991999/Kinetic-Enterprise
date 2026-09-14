import { NextResponse } from 'next/server';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerSession } from '@/lib/firebase/session';
import { requireSession, UnauthorizedError } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { logUsage } from '@/lib/usage';
import type { UserProfile } from '@/types';

// Mass-assignment guard: only these fields can ever come from the client.
const bodySchema = z
  .object({
    toDisplayName: z.string().min(1).max(100),
    message: z.string().min(1).max(280),
  })
  .strict();

export async function POST(request: Request) {
  const session = await getServerSession();
  try {
    requireSession(session);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'A shout-out needs a recipient and a short message.' }, { status: 400 });
  }

  try {
    const profileSnap = await adminDb().collection('users').doc(session.uid).get();
    const profile = profileSnap.data() as UserProfile | undefined;

    await adminDb().collection('organizations').doc(session.orgId).collection('shoutouts').add({
      fromUid: session.uid,
      fromDisplayName: profile?.displayName ?? session.email,
      toDisplayName: parsed.data.toDisplayName,
      message: parsed.data.message,
      createdAt: FieldValue.serverTimestamp(),
    });

    await logUsage({ orgId: session.orgId, uid: session.uid, type: 'shoutout_posted', route: '/api/shoutouts' });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/shoutouts failed', error);
    return NextResponse.json({ error: 'Could not post your shout-out.' }, { status: 500 });
  }
}
