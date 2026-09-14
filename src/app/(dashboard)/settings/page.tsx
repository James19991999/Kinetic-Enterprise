import { getServerSession } from '@/lib/firebase/session';
import { adminDb } from '@/lib/firebase/admin';
import { hasRole } from '@/lib/rbac';
import { Badge } from '@/components/ui/Badge';
import { OrgSettingsForm } from '@/components/dashboard/OrgSettingsForm';
import { BillingPlans } from '@/components/dashboard/BillingPlans';
import type { Organization, UserProfile } from '@/types';

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const [profileSnap, orgSnap] = await Promise.all([
    adminDb().collection('users').doc(session.uid).get(),
    adminDb().collection('organizations').doc(session.orgId).get(),
  ]);

  const profile = profileSnap.data() as UserProfile | undefined;
  const org = orgSnap.data() as Organization | undefined;
  const isAdmin = hasRole(session.role, 'admin');

  return (
    <div className="max-w-2xl space-y-lg">
      <h1 className="text-headline-lg">Settings</h1>

      <section className="rounded-lg bg-surface-container-low p-md shadow-level2">
        <h2 className="text-headline-sm">Profile</h2>
        <div className="mt-sm space-y-xs text-body-md">
          <p>
            <span className="text-on-surface-variant">Name: </span>
            {profile?.displayName}
          </p>
          <p>
            <span className="text-on-surface-variant">Email: </span>
            {session.email}
          </p>
          <p className="flex items-center gap-sm">
            <span className="text-on-surface-variant">Role: </span>
            <Badge>{session.role}</Badge>
          </p>
        </div>
      </section>

      <section className="rounded-lg bg-surface-container-low p-md shadow-level2">
        <h2 className="text-headline-sm">Workspace</h2>
        <p className="mt-xs text-body-sm text-on-surface-variant">
          {org?.name} · {org?.officeLocations?.length ?? 0} office location(s)
        </p>
        {isAdmin ? (
          <div className="mt-md">
            <OrgSettingsForm initialName={org?.name ?? ''} initialLocations={org?.officeLocations ?? []} />
          </div>
        ) : (
          <p className="mt-md text-body-sm text-on-surface-variant">
            Only admins and the owner can change workspace settings.
          </p>
        )}
      </section>

      <section className="rounded-lg bg-surface-container-low p-md shadow-level2">
        <h2 className="text-headline-sm">Billing</h2>
        <p className="mt-xs text-body-sm text-on-surface-variant">
          Current plan: <span className="font-semibold">{org?.plan ?? 'basic'}</span> · Status:{' '}
          {org?.subscriptionStatus ?? 'none'}
        </p>
        {hasRole(session.role, 'owner') ? (
          <div className="mt-md">
            <BillingPlans currentPlan={org?.plan ?? 'basic'} />
          </div>
        ) : (
          <p className="mt-md text-body-sm text-on-surface-variant">Only the owner can manage billing.</p>
        )}
      </section>
    </div>
  );
}
