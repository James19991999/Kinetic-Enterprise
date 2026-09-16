// Pure aggregation logic for rolling pulseEntries up into an org-wide
// metricsSummary. Kept separate from Firestore I/O (see
// lib/firebase/metricsAggregation.ts) so it can be unit tested without a
// database, the same pattern lib/pulse.ts already uses for isolation risk.

export interface AggregationInput {
  presence: 'in_office' | 'remote';
  focusHours: number;
  collaborationScore: number; // 0-100
  moodScore: number; // 0-100
}

export interface AggregatedMetrics {
  officeUtilization: number; // 0-100, % of entries that were in_office
  avgFocusHours: number;
  engagementScore: number; // 0-100
  equityGapScore: number; // 0-100, lower is more equitable
}

const EMPTY_METRICS: AggregatedMetrics = {
  officeUtilization: 0,
  avgFocusHours: 0,
  engagementScore: 0,
  equityGapScore: 0,
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Population standard deviation, used as the equity-gap signal below. */
function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const variance = mean(values.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}

/**
 * Rolls a window of pulse check-ins up into org-wide metric-card numbers.
 *
 * - officeUtilization: share of check-ins that were in-office, as a percent.
 * - avgFocusHours: mean self-reported focus hours.
 * - engagementScore: mean of collaboration and mood scores — both are
 *   0-100 self-reported signals of how engaged someone felt that day.
 * - equityGapScore: how unevenly collaboration is distributed across the
 *   org, using the population standard deviation of collaborationScore.
 *   0 means everyone reported the same collaboration level (no visible
 *   gap); higher means some people are far more/less included than others.
 *
 * Returns all-zero metrics for an empty window rather than NaN, since the
 * UI renders these directly onto metric cards.
 */
export function aggregatePulseEntries(entries: AggregationInput[]): AggregatedMetrics {
  if (entries.length === 0) return EMPTY_METRICS;

  const inOfficeCount = entries.filter((e) => e.presence === 'in_office').length;
  const officeUtilization = round1((inOfficeCount / entries.length) * 100);

  const avgFocusHours = round1(mean(entries.map((e) => e.focusHours)));

  const engagementScore = round1(
    mean(entries.map((e) => (e.collaborationScore + e.moodScore) / 2))
  );

  const equityGapScore = round1(stdDev(entries.map((e) => e.collaborationScore)));

  return { officeUtilization, avgFocusHours, engagementScore, equityGapScore };
}
