import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { SUPPORT_EMAIL, APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing use of WorkPulse.',
  alternates: { canonical: `${APP_URL}/terms` },
};

export default function TermsPage() {
  return (
    <>
      <header className="px-margin-mobile py-md md:px-margin-desktop">
        <Link href="/" className="text-headline-sm font-semibold text-primary">
          WorkPulse
        </Link>
      </header>
      <main id="main-content" className="mx-auto max-w-3xl px-margin-mobile py-xl md:px-margin-desktop">
        <h1 className="text-headline-lg">Terms of Service</h1>
        <p className="mt-md text-body-md text-on-surface-variant">Last updated: 2026.</p>

        <h2 className="mt-lg text-headline-sm">Using WorkPulse</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          By creating an account you agree to use WorkPulse only for lawful workplace-analytics purposes and to
          keep your login credentials confidential.
        </p>

        <h2 className="mt-lg text-headline-sm">Billing</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          Subscriptions are billed in advance on a recurring basis via Stripe and can be canceled at any time
          from Settings.
        </p>

        <h2 className="mt-lg text-headline-sm">Termination</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          We may suspend accounts that violate these terms. You may stop using WorkPulse at any time.
        </p>

        <h2 className="mt-lg text-headline-sm">Contact</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">
          Questions about these terms? Email{' '}
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
