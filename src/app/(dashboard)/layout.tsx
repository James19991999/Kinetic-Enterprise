import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from '@/lib/firebase/session';
import { adminDb } from '@/lib/firebase/admin';
import { DashboardShell } from '@/components/layout/DashboardShell';
import type { UserProfile } from '@/types';

// force-dynamic: every page under this group depends on the caller's
// session and must never be statically cached across users.
export const dynamic = 'force-dynamic';

// noindex as defense-in-depth on top of robots.txt's disallow rule — there's
// nothing for a crawler to index here anyway, since it all requires login.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }

  const profileSnap = await adminDb().collection('users').doc(session.uid).get();
  const profile = profileSnap.data() as UserProfile | undefined;

  return (
    <DashboardShell
      displayName={profile?.displayName ?? session.email}
      email={session.email}
      role={session.role}
      officeLocation={profile?.officeLocation}
    >
      {children}
    </DashboardShell>
  );
}
