import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90',
  secondary: 'bg-secondary-container text-on-secondary-container hover:opacity-90',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-container',
  danger: 'bg-error text-on-error hover:opacity-90',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export function Button({ variant = 'primary', isLoading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-xs rounded-md px-md py-sm text-label-md font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  );
}
