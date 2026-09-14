import { NextResponse } from 'next/server';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerSession } from '@/lib/firebase/session';
import { requireSession, UnauthorizedError, ForbiddenError } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { deriveIsolationRisk } from '@/lib/pulse';
import { logUsage } from '@/lib/usage';

const postSchema = z.object({
  presence: z.enum(['in_office', 'remote']),
  focusHours: z.number().min(0).max(24).optional(),
  meetingHours: z.number().min(0).max(24).optional(),
  collaborationScore: z.number().min(0).max(100).optional(),
  moodScore: z.number().min(0).max(100).optional(),
});

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession();
  try {
    requireSession(session);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const summarySnap = await adminDb()
    .collection('organizations')
    .doc(session.orgId)
    .collection('metricsSummaries')
    .orderBy('updatedAt', 'desc')
    .limit(1)
    .get();

  const summary = summarySnap.docs[0] ? { id: summarySnap.docs[0].id, ...summarySnap.docs[0].data() } : null;

  return NextResponse.json({ summary });
}

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

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid pulse entry.' }, { status: 400 });
  }

  const { presence, focusHours = 0, meetingHours = 0, collaborationScore = 70, moodScore = 70 } = parsed.data;
  const isolationRisk = deriveIsolationRisk({ presence, collaborationScore });
  const date = todayISO();
  const docId = `${session.uid}_${date}`;

  try {
    await adminDb()
      .collection('organizations')
      .doc(session.orgId)
      .collection('pulseEntries')
      .doc(docId)
      .set(
        {
          uid: session.uid,
          date,
          presence,
          focusHours,
          meetingHours,
          collaborationScore,
          moodScore,
          isolationRisk,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    await logUsage({ orgId: session.orgId, uid: session.uid, type: 'pulse_entry', route: '/api/metrics' });

    return NextResponse.json({ ok: true, isolationRisk });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('POST /api/metrics failed', error);
    return NextResponse.json({ error: 'Could not save your check-in.' }, { status: 500 });
  }
}
