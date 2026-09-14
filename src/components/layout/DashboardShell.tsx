import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import type { Role } from '@/types';

export function DashboardShell({
  displayName,
  email,
  role,
  officeLocation,
  children,
}: {
  displayName: string;
  email: string;
  role: Role;
  officeLocation?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar displayName={displayName} role={role} officeLocation={officeLocation} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar displayName={displayName} email={email} />
        <main id="main-content" className="flex-1 overflow-y-auto p-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
