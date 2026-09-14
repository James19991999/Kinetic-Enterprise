import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { deriveParticipationStatus } from '@/lib/pulse';
import type { ParticipationGap, PulseEntry, UserProfile } from '@/types';

const LOOKBACK_DAYS = 14;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Reads all pulseEntries in the last 14 days, reduces to each user's latest
 * entry, and derives a participation flag per user via the pure decision
 * logic in lib/pulse.ts. Gated to manager role and above by the caller.
 */
export async function getParticipationGaps(orgId: string): Promise<ParticipationGap[]> {
  const db = adminDb();
  const today = todayISO();
  const lookbackDate = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString().slice(0, 10);

  const [usersSnap, entriesSnap] = await Promise.all([
    db.collection('users').where('orgId', '==', orgId).get(),
    db
      .collection('organizations')
      .doc(orgId)
      .collection('pulseEntries')
      .where('date', '>=', lookbackDate)
      .orderBy('date', 'desc')
      .get(),
  ]);

  const latestByUser = new Map<string, PulseEntry>();
  for (const doc of entriesSnap.docs) {
    const entry = doc.data() as PulseEntry;
    if (!latestByUser.has(entry.uid)) {
      latestByUser.set(entry.uid, entry);
    }
  }

  const gaps: ParticipationGap[] = [];
  for (const doc of usersSnap.docs) {
    const user = doc.data() as UserProfile;
    const latest = latestByUser.get(user.uid);
    const status = deriveParticipationStatus({
      lastEntryDate: latest?.date ?? null,
      latestRisk: latest?.isolationRisk ?? null,
      today,
    });
    if (status) {
      gaps.push({ ...status, uid: user.uid, displayName: user.displayName });
    }
  }

  return gaps.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1));
}
