import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { aggregatePulseEntries, type AggregatedMetrics } from '@/lib/metricsAggregation';

/** How far back to look when rolling pulseEntries into a summary. */
const AGGREGATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface OrgAggregationResult extends AggregatedMetrics {
  orgId: string;
  entryCount: number;
}

/**
 * Rolls up the last 24h of one org's pulseEntries into a new
 * metricsSummaries doc. Skips orgs with no check-ins in the window rather
 * than writing an all-zero summary, so the dashboard keeps showing the last
 * real summary instead of flashing to zero between check-ins.
 */
async function aggregateOrg(orgId: string): Promise<OrgAggregationResult | null> {
  const db = adminDb();
  const since = new Date(Date.now() - AGGREGATION_WINDOW_MS);

  const entriesSnap = await db
    .collection('organizations')
    .doc(orgId)
    .collection('pulseEntries')
    .where('createdAt', '>=', since)
    .get();

  if (entriesSnap.empty) return null;

  const inputs = entriesSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      presence: data.presence,
      focusHours: data.focusHours ?? 0,
      collaborationScore: data.collaborationScore ?? 0,
      moodScore: data.moodScore ?? 0,
    };
  });

  const metrics = aggregatePulseEntries(inputs);

  await db
    .collection('organizations')
    .doc(orgId)
    .collection('metricsSummaries')
    .add({
      ...metrics,
      entryCount: inputs.length,
      updatedAt: FieldValue.serverTimestamp(),
    });

  return { orgId, entryCount: inputs.length, ...metrics };
}

/**
 * Runs the metrics aggregation job across every organization. Intended to
 * be called from a scheduled trigger (see /api/cron/aggregate-metrics) —
 * a Vercel Cron job, a Firebase scheduled function, or any other scheduler
 * that can hit an authenticated HTTP endpoint on an interval.
 */
export async function aggregateAllOrgMetrics(): Promise<OrgAggregationResult[]> {
  const db = adminDb();
  const orgsSnap = await db.collection('organizations').select().get();

  const results = await Promise.all(orgsSnap.docs.map((doc) => aggregateOrg(doc.id)));
  return results.filter((result): result is OrgAggregationResult => result !== null);
}
