import { NextResponse } from 'next/server';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerSession } from '@/lib/firebase/session';
import { requireSession, assertRole, UnauthorizedError, ForbiddenError } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { logUsage } from '@/lib/usage';

// Mass-assignment guard: only these fields can ever be PATCHed from the
// client, regardless of what else is present in the request body.
const patchSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    officeLocations: z.array(z.string().min(1).max(100)).max(50).optional(),
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
  } catch (error) {
    return handleAuthError(error);
  }

  const orgSnap = await adminDb().collection('organizations').doc(session.orgId).get();
  if (!orgSnap.exists) {
    return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
  }

  return NextResponse.json({ organization: { id: orgSnap.id, ...orgSnap.data() } });
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
    return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  try {
    const orgRef = adminDb().collection('organizations').doc(session.orgId);
    await orgRef.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
    await orgRef.collection('auditLog').add({
      type: 'org_settings_updated',
      uid: session.uid,
      fields: Object.keys(parsed.data),
      createdAt: FieldValue.serverTimestamp(),
    });
    await logUsage({ orgId: session.orgId, uid: session.uid, type: 'settings_update', route: '/api/settings' });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/settings failed', error);
    return NextResponse.json({ error: 'Could not save settings.' }, { status: 500 });
  }
}
