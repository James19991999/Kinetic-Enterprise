'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useDismissableMenu } from '@/hooks/useDismiss';

export function TopBar({ displayName, email }: { displayName: string; email: string }) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useDismissableMenu<HTMLDivElement>(notifOpen, () => setNotifOpen(false));
  const profileRef = useDismissableMenu<HTMLDivElement>(profileOpen, () => setProfileOpen(false));

  async function handleSignOut() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-md focus:top-md focus:z-50 focus:rounded-md focus:bg-primary focus:px-sm focus:py-xs focus:text-on-primary"
      >
        Skip to content
      </a>

      <div />

      <div className="flex items-center gap-md">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            className="rounded-full p-sm hover:bg-surface-container"
          >
            <Icon name="notifications" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-xs w-72 rounded-md bg-surface-container-lowest p-md shadow-level3">
              <p className="text-body-sm text-on-surface-variant">You&apos;re all caught up.</p>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            aria-label="Account menu"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-sm rounded-full p-xs hover:bg-surface-container"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-label-sm text-on-primary-container">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-xs w-56 rounded-md bg-surface-container-lowest p-sm shadow-level3">
              <p className="px-sm py-xs text-body-sm font-medium text-on-surface">{displayName}</p>
              <p className="px-sm pb-sm text-label-sm text-on-surface-variant">{email}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full rounded-md px-sm py-xs text-left text-body-sm text-error hover:bg-error-container"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
