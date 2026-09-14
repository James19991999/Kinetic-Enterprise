import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/firebase/session';
import { hasRole } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { Badge } from '@/components/ui/Badge';
import { UserRoleTable } from '@/components/dashboard/UserRoleTable';
import type { UserProfile } from '@/types';

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session) return null;
  if (!hasRole(session.role, 'admin')) {
    redirect('/dashboard');
  }

  const snap = await adminDb().collection('users').where('orgId', '==', session.orgId).get();
  const users = snap.docs.map((d) => d.data() as UserProfile);

  return (
    <div className="space-y-lg">
      <div className="flex items-center gap-sm">
        <h1 className="text-headline-lg">Users</h1>
        <Badge>{users.length} total</Badge>
      </div>
      <UserRoleTable users={users} currentUid={session.uid} isOwner={hasRole(session.role, 'owner')} />
    </div>
  );
}
