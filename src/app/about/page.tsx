import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description: 'WorkPulse exists to make hybrid work fair and visible for every team, wherever they sit.',
  alternates: { canonical: `${APP_URL}/about` },
};

export default function AboutPage() {
  return (
    <>
      <header className="px-margin-mobile py-md md:px-margin-desktop">
        <Link href="/" className="text-headline-sm font-semibold text-primary">
          WorkPulse
        </Link>
      </header>
      <main id="main-content" className="mx-auto max-w-3xl px-margin-mobile py-xl md:px-margin-desktop">
        <h1 className="text-headline-lg">Our mission</h1>
        <p className="mt-md text-body-lg text-on-surface-variant">
          Hybrid work made office presence a proxy for commitment. WorkPulse exists to replace that proxy with
          real signal — so distributed teams are measured on outcomes and collaboration, not who happens to be
          in the building.
        </p>
        <h2 className="mt-xl text-headline-md">Principles</h2>
        <ul className="mt-md list-disc space-y-sm pl-lg text-body-md text-on-surface-variant">
          <li>Real data over sample dashboards — every number in the product is computed, not decorative.</li>
          <li>Fairness signals go to managers, not surveillance of individuals.</li>
          <li>Every organization&apos;s data is strictly isolated from every other tenant.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
