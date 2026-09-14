import { getServerSession } from '@/lib/firebase/session';
import { hasRole } from '@/lib/rbac';
import { getParticipationGaps } from '@/lib/firebase/participation';
import { adminDb } from '@/lib/firebase/admin';
import { EquityBar } from '@/components/dashboard/EquityBar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import type { MetricsSummary } from '@/types';

export default async function EquityPage() {
  const session = await getServerSession();
  if (!session) return null;

  const canSeeGaps = hasRole(session.role, 'manager');

  const [summarySnap, gaps] = await Promise.all([
    adminDb()
      .collection('organizations')
      .doc(session.orgId)
      .collection('metricsSummaries')
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get(),
    canSeeGaps ? getParticipationGaps(session.orgId) : Promise.resolve([]),
  ]);

  const summary = summarySnap.docs[0]?.data() as MetricsSummary | undefined;

  return (
    <div className="space-y-lg">
      <h1 className="text-headline-lg">Equity &amp; Fairness</h1>

      <EquityBar
        label="Equity Signals"
        data={[
          { label: 'Equity Gap Score', value: summary?.equityGapScore ?? 0 },
          { label: 'Engagement Score', value: summary?.engagementScore ?? 0 },
        ]}
      />

      <section>
        <h2 className="text-headline-sm">Promotion Velocity</h2>
        <div className="mt-sm rounded-lg bg-surface-container-low p-md shadow-level2">
          <p className="text-body-sm text-on-surface-variant">
            Sample data — an HRIS/payroll integration is needed to compute real promotion velocity by office
            location. Not shown as a real number yet.
          </p>
        </div>
      </section>

      {canSeeGaps && (
        <section>
          <h2 className="text-headline-sm">Participation Gaps</h2>
          {gaps.length === 0 ? (
            <p className="mt-sm rounded-md bg-surface-container-low p-md text-body-sm text-on-surface-variant">
              No participation gaps flagged — either everyone&apos;s checking in regularly, or there&apos;s no
              check-in data yet.
            </p>
          ) : (
            <ul className="mt-sm space-y-sm">
              {gaps.map((gap) => (
                <li
                  key={gap.uid}
                  className="flex items-center justify-between rounded-lg bg-surface-container-low p-md shadow-level2"
                >
                  <div className="flex items-center gap-sm">
                    <Icon name={gap.icon} className={gap.severity === 'critical' ? 'text-error' : 'text-tertiary'} />
                    <div>
                      <p className="text-body-md text-on-surface">{gap.displayName}</p>
                      <p className="text-body-sm text-on-surface-variant">{gap.reason}</p>
                    </div>
                  </div>
                  <Badge tone={gap.severity === 'critical' ? 'danger' : 'warning'}>{gap.severity}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
