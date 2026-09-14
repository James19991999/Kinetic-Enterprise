import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { SUPPORT_EMAIL, APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How WorkPulse collects, uses, and protects your data.',
  alternates: { canonical: `${APP_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <>
      <header className="px-margin-mobile py-md md:px-margin-desktop">
        <Link href="/" className="text-headline-sm font-semibold text-primary">
          WorkPulse
        </Link>
      </header>
      <main id="main-content" className="mx-auto max-w-3xl px-margin-mobile py-xl md:px-margin-desktop">
        <h1 className="text-headline-lg">Privacy Policy</h1>
        <p className="mt-md text-body-md text-on-surface-variant">Last updated: 2026.</p>

        <h2 className="mt-lg text-headline-sm">What we collect</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          Account details (name, email), organization details, and the pulse check-in data (presence, focus and
          collaboration self-reports) your organization&apos;s members submit inside the product.
        </p>

        <h2 className="mt-lg text-headline-sm">How we use it</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          To operate the product: computing metrics dashboards, isolation-risk flags, and billing. We never sell
          your data or use it to train third-party models.
        </p>

        <h2 className="mt-lg text-headline-sm">Data isolation</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          Every organization&apos;s data is scoped to that organization alone, enforced at both the application
          and database layer.
        </p>

        <h2 className="mt-lg text-headline-sm">Contact</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          Questions about this policy or a data request? Email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
