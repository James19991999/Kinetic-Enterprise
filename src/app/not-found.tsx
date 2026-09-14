import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-md px-margin-mobile text-center">
      <Icon name="explore_off" className="text-display-md text-primary" />
      <h1 className="text-headline-lg">Page not found</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className="rounded-md bg-primary px-lg py-sm text-label-md text-on-primary hover:opacity-90">
        Back to home
      </Link>
    </div>
  );
}
