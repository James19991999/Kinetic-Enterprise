import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/firebase/session';
import { hasRole } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { MetricCard } from '@/components/dashboard/MetricCard';
import type { Organization, UsageEvent } from '@/types';

export default async function AdminOverviewPage() {
  const session = await getServerSession();
  if (!session) return null;
  if (!hasRole(session.role, 'admin')) {
    redirect('/dashboard');
  }

  const [orgSnap, usersSnap, activitySnap] = await Promise.all([
    adminDb().collection('organizations').doc(session.orgId).get(),
    adminDb().collection('users').where('orgId', '==', session.orgId).get(),
    adminDb()
      .collection('organizations')
      .doc(session.orgId)
      .collection('usageEvents')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get(),
  ]);

  const org = orgSnap.data() as Organization | undefined;
  const seatCount = usersSnap.size;
  const activity = activitySnap.docs.map((d) => ({ id: d.id, ...d.data() }) as UsageEvent & { id: string });

  return (
    <div className="space-y-lg">
      <h1 className="text-headline-lg">Admin</h1>

      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        <MetricCard label="Seats Used" value={`${seatCount} / ${org?.seatLimit ?? '—'}`} icon="group" />
        <MetricCard label="Plan" value={org?.plan ?? 'basic'} icon="workspace_premium" href="/admin/billing" />
        <MetricCard label="Office Locations" value={String(org?.officeLocations?.length ?? 0)} icon="apartment" />
      </div>

      <div className="flex gap-md text-label-md text-primary">
        <Link href="/admin/users" className="underline">
          Manage users
        </Link>
        <Link href="/admin/billing" className="underline">
          Billing details
        </Link>
      </div>

      <section>
        <h2 className="text-headline-sm">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="mt-sm rounded-md bg-surface-container-low p-md text-body-sm text-on-surface-variant">
            No activity recorded yet.
          </p>
        ) : (
          <ul className="mt-sm divide-y divide-outline-variant rounded-lg bg-surface-container-low shadow-level2">
            {activity.map((event) => (
              <li key={event.id} className="flex items-center justify-between px-md py-sm text-body-sm">
                <span>{event.type.replace(/_/g, ' ')}</span>
                <span className="text-on-surface-variant">{event.route}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
