import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/firebase/session';
import { hasRole } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { BillingPlans } from '@/components/dashboard/BillingPlans';
import { Badge } from '@/components/ui/Badge';
import type { Organization } from '@/types';

const STATUS_TONE = {
  active: 'success',
  trialing: 'success',
  past_due: 'warning',
  canceled: 'danger',
  incomplete: 'warning',
  none: 'neutral',
} as const;

export default async function AdminBillingPage() {
  const session = await getServerSession();
  if (!session) return null;
  if (!hasRole(session.role, 'admin')) {
    redirect('/dashboard');
  }

  const [orgSnap, usersSnap] = await Promise.all([
    adminDb().collection('organizations').doc(session.orgId).get(),
    adminDb().collection('users').where('orgId', '==', session.orgId).get(),
  ]);

  const org = orgSnap.data() as Organization | undefined;
  const seatCount = usersSnap.size;

  return (
    <div className="space-y-lg">
      <h1 className="text-headline-lg">Billing</h1>

      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        <MetricCard label="Seats Used" value={`${seatCount} / ${org?.seatLimit ?? '—'}`} icon="group" />
        <MetricCard label="Plan" value={org?.plan ?? 'basic'} icon="workspace_premium" />
        <div className="rounded-lg bg-surface-container-low p-md shadow-level2">
          <p className="text-label-md text-on-surface-variant">Subscription Status</p>
          <div className="mt-sm">
            <Badge tone={STATUS_TONE[org?.subscriptionStatus ?? 'none']}>{org?.subscriptionStatus ?? 'none'}</Badge>
          </div>
        </div>
      </div>

      {hasRole(session.role, 'owner') ? (
        <section>
          <h2 className="text-headline-sm">Change Plan</h2>
          <div className="mt-sm">
            <BillingPlans currentPlan={org?.plan ?? 'basic'} />
          </div>
        </section>
      ) : (
        <p className="text-body-sm text-on-surface-variant">Only the owner can change the subscription plan.</p>
      )}
    </div>
  );
}
