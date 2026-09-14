'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Icon } from '@/components/ui/Icon';
import { hasRole } from '@/lib/rbac';
import type { Role } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const BASE_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/analytics', label: 'Analytics', icon: 'bar_chart' },
  { href: '/equity', label: 'Equity & Fairness', icon: 'balance' },
  { href: '/engagement', label: 'Engagement', icon: 'favorite' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

const ADMIN_ITEM: NavItem = { href: '/admin', label: 'Admin', icon: 'admin_panel_settings' };

export function Sidebar({
  displayName,
  role,
  officeLocation,
}: {
  displayName: string;
  role: Role;
  officeLocation?: string;
}) {
  const pathname = usePathname();
  const items = hasRole(role, 'admin') ? [...BASE_NAV, ADMIN_ITEM] : BASE_NAV;

  return (
    <nav className="flex h-full w-64 flex-col gap-lg bg-surface-container-lowest p-md" aria-label="Main">
      <div className="flex items-center gap-sm px-sm">
        <Icon name="hub" className="text-headline-sm text-primary" />
        <span className="text-headline-sm font-semibold text-on-surface">WorkPulse</span>
      </div>

      <ul className="flex flex-1 flex-col gap-xs">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex items-center gap-sm rounded-md px-sm py-sm text-body-md',
                  active
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container'
                )}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-outline-variant px-sm pt-md">
        <p className="text-body-sm font-medium text-on-surface">{displayName}</p>
        {officeLocation && <p className="text-label-sm text-on-surface-variant">{officeLocation}</p>}
      </div>
    </nav>
  );
}
