import Link from 'next/link';
import clsx from 'clsx';
import { Icon } from '@/components/ui/Icon';

export interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  delta?: number;
  helpText?: string;
  href?: string;
}

export function MetricCard({ label, value, icon, delta, helpText, href }: MetricCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-label-md text-on-surface-variant">{label}</span>
        <Icon name={icon} className="text-primary" />
      </div>
      <div className="mt-sm text-headline-md text-on-surface">{value}</div>
      {typeof delta === 'number' && (
        <div
          className={clsx(
            'mt-xs flex items-center gap-xs text-label-sm',
            delta >= 0 ? 'text-secondary' : 'text-error'
          )}
        >
          <Icon name={delta >= 0 ? 'trending_up' : 'trending_down'} />
          <span>{Math.abs(delta)}%</span>
        </div>
      )}
      {helpText && <p className="mt-xs text-body-sm text-on-surface-variant">{helpText}</p>}
    </>
  );

  const className = 'block rounded-lg bg-surface-container-low p-md shadow-level2';

  if (href) {
    return (
      <Link href={href} className={className} aria-label={`${label}: ${value}`}>
        {content}
      </Link>
    );
  }

  return (
    <div role="figure" aria-label={`${label}: ${value}`} className={className}>
      {content}
    </div>
  );
}
