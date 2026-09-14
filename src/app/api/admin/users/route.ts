import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/firebase/session';
import { requireSession, assertRole, hasRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { logUsage } from '@/lib/usage';
import type { UserProfile } from '@/types';

const patchSchema = z
  .object({
    uid: z.string().min(1),
    role: z.enum(['employee', 'manager', 'admin']), // owner role can't be granted via this endpoint
  })
  .strict();

function handleAuthError(error: unknown) {
  if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
  throw error;
}

export async function GET() {
  const session = await getServerSession();
  try {
    requireSession(session);
    assertRole(session, 'admin');
  } catch (error) {
    return handleAuthError(error);
  }

  const snap = await adminDb().collection('users').where('orgId', '==', session.orgId).get();
  const users = snap.docs.map((doc) => doc.data() as UserProfile);

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  try {
    requireSession(session);
    assertRole(session, 'admin');
  } catch (error) {
    return handleAuthError(error);
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid role update.' }, { status: 400 });
  }

  const { uid, role } = parsed.data;

  if (uid === session.uid) {
    return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
  }

  try {
    const targetRef = adminDb().collection('users').doc(uid);
    const targetSnap = await targetRef.get();
    if (!targetSnap.exists) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    const target = targetSnap.data() as UserProfile;
    if (target.orgId !== session.orgId) {
      return NextResponse.json({ error: 'This user belongs to a different organization.' }, { status: 403 });
    }
    if (target.role === 'owner') {
      return NextResponse.json({ error: "The organization owner's role can't be changed here." }, { status: 400 });
    }
    // Only the owner can promote someone to admin.
    if (role === 'admin' && !hasRole(session.role, 'owner')) {
      return NextResponse.json({ error: 'Only the owner can grant admin access.' }, { status: 403 });
    }

    await targetRef.update({ role });
    await logUsage({ orgId: session.orgId, uid: session.uid, type: 'role_change', route: '/api/admin/users' });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/admin/users failed', error);
    return NextResponse.json({ error: 'Could not update the role.' }, { status: 500 });
  }
}
