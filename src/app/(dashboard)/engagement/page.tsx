import { getServerSession } from '@/lib/firebase/session';
import { adminDb } from '@/lib/firebase/admin';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CheckInForm } from '@/components/dashboard/CheckInForm';
import { TeamPulse } from '@/components/dashboard/TeamPulse';
import type { MetricsSummary, PulseEntry } from '@/types';

export default async function EngagementPage() {
  const session = await getServerSession();
  if (!session) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [summarySnap, todaySnap] = await Promise.all([
    adminDb()
      .collection('organizations')
      .doc(session.orgId)
      .collection('metricsSummaries')
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get(),
    adminDb()
      .collection('organizations')
      .doc(session.orgId)
      .collection('pulseEntries')
      .doc(`${session.uid}_${today}`)
      .get(),
  ]);

  const summary = summarySnap.docs[0]?.data() as MetricsSummary | undefined;
  const todayEntry = todaySnap.exists ? (todaySnap.data() as PulseEntry) : null;

  return (
    <div className="space-y-lg">
      <h1 className="text-headline-lg">Engagement</h1>

      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <MetricCard label="Engagement Score" value={summary ? String(summary.engagementScore) : '—'} icon="favorite" />
        <MetricCard
          label="Today's Mood"
          value={todayEntry ? String(todayEntry.moodScore) : 'Not submitted'}
          icon="mood"
        />
      </div>

      <section>
        <h2 className="text-headline-sm">Daily Pulse Check-in</h2>
        <div className="mt-sm">
          <CheckInForm initial={todayEntry} />
        </div>
      </section>

      <section>
        <h2 className="text-headline-sm">Team Pulse</h2>
        <p className="mt-xs text-body-sm text-on-surface-variant">
          Real-time peer recognition — visible to your whole organization.
        </p>
        <div className="mt-sm">
          <TeamPulse orgId={session.orgId} />
        </div>
      </section>
    </div>
  );
}
