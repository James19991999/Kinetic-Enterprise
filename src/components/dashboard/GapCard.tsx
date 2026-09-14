import Link from 'next/link';
import clsx from 'clsx';
import { Icon } from '@/components/ui/Icon';
import { SUPPORT_EMAIL } from '@/lib/constants';

export interface Gap {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  severity: 'critical' | 'moderate';
}

export function GapCard({ gap }: { gap: Gap }) {
  const href = gap.actionHref ?? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(gap.title)}`;
  const isExternal = !gap.actionHref;

  return (
    <div className="flex items-start gap-md rounded-lg bg-surface-container-low p-md shadow-level2">
      <Icon
        name={gap.icon}
        className={clsx('mt-xs text-headline-sm', gap.severity === 'critical' ? 'text-error' : 'text-tertiary')}
      />
      <div className="flex-1">
        <h3 className="text-body-lg font-semibold text-on-surface">{gap.title}</h3>
        <p className="mt-xs text-body-sm text-on-surface-variant">{gap.description}</p>
        {isExternal ? (
          <a href={href} className="mt-sm inline-block text-label-md text-primary underline">
            {gap.actionLabel}
          </a>
        ) : (
          <Link href={href} className="mt-sm inline-block text-label-md text-primary underline">
            {gap.actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
