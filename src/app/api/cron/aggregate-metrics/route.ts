import { NextResponse } from 'next/server';
import { aggregateAllOrgMetrics } from '@/lib/firebase/metricsAggregation';

/**
 * Scheduled endpoint that rolls up every org's recent pulseEntries into a
 * fresh metricsSummaries doc (see lib/firebase/metricsAggregation.ts). Wire
 * this up to any scheduler that can call an authenticated HTTP endpoint —
 * vercel.json already configures it as a Vercel Cron job. Not meant to be
 * called by end users, hence the shared-secret check below rather than a
 * user session.
 */
export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not set — refusing to run the aggregation job.' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const results = await aggregateAllOrgMetrics();
    return NextResponse.json({
      ok: true,
      orgsAggregated: results.length,
      results,
    });
  } catch (error) {
    console.error('GET /api/cron/aggregate-metrics failed', error);
    return NextResponse.json({ error: 'Aggregation job failed.' }, { status: 500 });
  }
}
