import { getServerSession } from '@/lib/firebase/session';
import { adminDb } from '@/lib/firebase/admin';
import { LiveMetricCards } from '@/components/dashboard/LiveMetricCards';
import { GapCard, type Gap } from '@/components/dashboard/GapCard';
import { PresenceToggle } from '@/components/dashboard/PresenceToggle';
import type { MetricsSummary, PulseEntry } from '@/types';

// Illustrative — would need a calendar/Slack integration to detect real
// missed syncs. Clearly labeled below rather than presented as real data.
const SAMPLE_GAPS: Gap[] = [
  {
    id: 'sample-1',
    icon: 'sync_problem',
    title: 'Missed Team Sync',
    description: 'Frontend architecture review from 09:00 AM — no recording linked yet.',
    actionLabel: 'Catch up on recording',
    severity: 'critical',
  },
  {
    id: 'sample-2',
    icon: 'forum',
    title: 'Undocumented Decision',
    description: 'A scope change was discussed in a hallway conversation, not written down anywhere.',
    actionLabel: 'Ask for a written summary',
    severity: 'moderate',
  },
];

async function getTodayPresence(orgId: string, uid: string) {
  const today = new Date().toISOString().slice(0, 10);
  const snap = await adminDb()
    .collection('organizations')
    .doc(orgId)
    .collection('pulseEntries')
    .doc(`${uid}_${today}`)
    .get();
  return snap.exists ? (snap.data() as PulseEntry).presence : 'in_office';
}

export default async function DashboardHomePage() {
  const session = await getServerSession();
  if (!session) return null;

  const [summarySnap, presence] = await Promise.all([
    adminDb()
      .collection('organizations')
      .doc(session.orgId)
      .collection('metricsSummaries')
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get(),
    getTodayPresence(session.orgId, session.uid),
  ]);

  const summary = (summarySnap.docs[0]?.data() as MetricsSummary | undefined) ?? null;

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="text-headline-lg">Home</h1>
        <PresenceToggle initial={presence} />
      </div>

      <LiveMetricCards orgId={session.orgId} initialSummary={summary} />

      <section>
        <div className="mb-sm flex items-center justify-between">
          <h2 className="text-headline-sm">Daily Gaps</h2>
          <span className="text-label-sm text-on-surface-variant">Sample data — calendar integration coming soon</span>
        </div>
        <div className="grid grid-cols-1 gap-md md:grid-cols-2">
          {SAMPLE_GAPS.map((gap) => (
            <GapCard key={gap.id} gap={gap} />
          ))}
        </div>
      </section>
    </div>
  );
}
