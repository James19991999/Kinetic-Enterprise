import { getServerSession } from '@/lib/firebase/session';
import { adminDb } from '@/lib/firebase/admin';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PulseTrend } from '@/components/dashboard/PulseTrend';
import type { MetricsSummary, PulseEntry } from '@/types';

export default async function AnalyticsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const [summarySnap, entriesSnap] = await Promise.all([
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
      .orderBy('date', 'asc')
      .limitToLast(14)
      .get(),
  ]);

  const summary = summarySnap.docs[0]?.data() as MetricsSummary | undefined;
  const entries = entriesSnap.docs.map((d) => d.data() as PulseEntry);

  const byDate = new Map<string, { total: number; count: number }>();
  for (const entry of entries) {
    const bucket = byDate.get(entry.date) ?? { total: 0, count: 0 };
    bucket.total += entry.focusHours;
    bucket.count += 1;
    byDate.set(entry.date, bucket);
  }
  const trend = Array.from(byDate.entries()).map(([date, { total, count }]) => ({
    date,
    value: Number((total / count).toFixed(1)),
  }));

  return (
    <div className="space-y-lg">
      <h1 className="text-headline-lg">Analytics</h1>

      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        <MetricCard label="Office Utilization" value={summary ? `${summary.officeUtilization}%` : '—'} icon="apartment" />
        <MetricCard label="Avg. Focus Hours" value={summary ? `${summary.avgFocusHours}h` : '—'} icon="schedule" />
        <MetricCard
          label="Check-ins Logged"
          value={String(entries.length)}
          icon="fact_check"
          helpText="Last 14 days"
        />
      </div>

      {trend.length > 0 ? (
        <PulseTrend title="Average Focus Hours (last 14 days)" data={trend} />
      ) : (
        <p className="rounded-md bg-surface-container-low p-md text-body-sm text-on-surface-variant">
          No check-in data yet — the focus-hours trend will appear once your team starts submitting daily pulses.
        </p>
      )}

      <section>
        <div className="mb-sm flex items-center justify-between">
          <h2 className="text-headline-sm">Communication Blind Spots</h2>
          <span className="text-label-sm text-on-surface-variant">Sample data — Slack/calendar integration coming soon</span>
        </div>
        <div className="rounded-lg bg-surface-container-low p-md shadow-level2">
          <p className="text-body-sm text-on-surface-variant">
            No missed-sync detection is wired up yet. Once a calendar integration is connected, this section will
            surface real meetings that lacked notes or a recording.
          </p>
        </div>
      </section>
    </div>
  );
}
