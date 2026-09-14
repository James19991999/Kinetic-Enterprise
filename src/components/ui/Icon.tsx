import clsx from 'clsx';

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={clsx('material-symbols-outlined select-none', className)} aria-hidden="true">
      {name}
    </span>
  );
}
