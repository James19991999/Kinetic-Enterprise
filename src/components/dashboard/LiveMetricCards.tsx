'use client';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { useMetrics } from '@/hooks/useMetrics';
import type { MetricsSummary } from '@/types';

/**
 * Server components fetch the initial summary directly via the Admin SDK
 * (no client-side waterfall for first paint). This wrapper then hydrates on
 * the client and subscribes to Firestore onSnapshot, so the four Home cards
 * update live as a new metricsSummaries doc is written — without a page
 * refresh — per ARCHITECTURE.md §1's rendering strategy.
 */
export function LiveMetricCards({
  orgId,
  initialSummary,
}: {
  orgId: string;
  initialSummary: MetricsSummary | null;
}) {
  const { summary: liveSummary, error } = useMetrics(orgId);
  const summary = liveSummary ?? initialSummary;

  return (
    <div className="space-y-sm">
      {error && (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      )}
      {!summary && (
        <p className="rounded-md bg-surface-container-low p-md text-body-sm text-on-surface-variant">
          No metrics yet — numbers will appear here once your team starts submitting daily check-ins.
        </p>
      )}
      <div className="grid grid-cols-1 gap-md md:grid-cols-4">
        <MetricCard
          label="Office Utilization"
          value={summary ? `${summary.officeUtilization}%` : '—'}
          icon="apartment"
          href="/analytics"
        />
        <MetricCard
          label="Avg. Focus Hours"
          value={summary ? `${summary.avgFocusHours}h` : '—'}
          icon="schedule"
          href="/analytics"
        />
        <MetricCard
          label="Engagement Score"
          value={summary ? String(summary.engagementScore) : '—'}
          icon="favorite"
          href="/engagement"
        />
        <MetricCard
          label="Equity Gap Score"
          value={summary ? String(summary.equityGapScore) : '—'}
          icon="balance"
          href="/equity"
        />
      </div>
    </div>
  );
}
