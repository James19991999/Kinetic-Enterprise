import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from '@/lib/firebase/session';
import { Footer } from '@/components/layout/Footer';
import { Icon } from '@/components/ui/Icon';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'WorkPulse — Hybrid Work Analytics',
  description:
    'Real-time presence, productivity, equity, and engagement analytics for hybrid teams. Close the four gaps hybrid work creates.',
  alternates: { canonical: APP_URL },
};

const PILLARS = [
  {
    icon: 'forum',
    title: 'Communication Gaps',
    problem: 'Missed syncs and undocumented decisions leave remote teammates out of the loop.',
  },
  {
    icon: 'insights',
    title: 'Productivity Tracking',
    problem: 'Unfair comparisons between in-office and remote output skew performance reviews.',
  },
  {
    icon: 'groups',
    title: 'Employee Isolation',
    problem: 'Remote staff quietly disengage without a clear early-warning signal.',
  },
  {
    icon: 'balance',
    title: 'Fairness',
    problem: 'Promotion and recognition bias creeps toward whoever is physically in the room.',
  },
];

const FAQS = [
  {
    q: 'How does WorkPulse detect isolation risk?',
    a: 'Each daily check-in scores presence and collaboration signals. Employees who go quiet for 14+ days, or whose recent scores show high isolation risk, are surfaced to managers automatically — no manual review needed.',
  },
  {
    q: 'Is WorkPulse GDPR-compliant?',
    a: 'WorkPulse stores only the data your organization submits, scoped per-tenant with strict access controls. Account and org deletion tooling is on our roadmap; contact support for manual data requests today.',
  },
  {
    q: 'Can I try WorkPulse before paying?',
    a: 'Yes — create a free account to provision your organization and explore the dashboard before choosing a plan.',
  },
  {
    q: 'What integrations does WorkPulse support?',
    a: 'WorkPulse works standalone today. Calendar and Slack integrations for automatic communication-gap detection are on our roadmap.',
  },
];

export default async function HomePage() {
  const session = await getServerSession();
  if (session) {
    redirect('/dashboard');
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'WorkPulse',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', priceCurrency: 'USD', price: '0' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="flex items-center justify-between px-margin-mobile py-md md:px-margin-desktop">
        <div className="flex items-center gap-sm">
          <Icon name="hub" className="text-headline-sm text-primary" />
          <span className="text-headline-sm font-semibold">WorkPulse</span>
        </div>
        <nav className="flex items-center gap-md">
          <Link href="/about" className="text-body-md text-on-surface-variant hover:text-primary">
            About
          </Link>
          <Link href="/login" className="text-body-md text-on-surface-variant hover:text-primary">
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-primary px-md py-sm text-label-md text-on-primary hover:opacity-90"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="px-margin-mobile py-xl text-center md:px-margin-desktop">
          <h1 className="mx-auto max-w-3xl text-display-md text-on-surface md:text-display-lg">
            Close the four gaps hybrid work creates
          </h1>
          <p className="mx-auto mt-md max-w-2xl text-body-lg text-on-surface-variant">
            Real-time presence, productivity, equity, and engagement analytics — built for distributed teams,
            not just the people in the room.
          </p>
          <div className="mt-lg flex justify-center gap-md">
            <Link
              href="/login"
              className="rounded-md bg-primary px-lg py-sm text-label-md text-on-primary hover:opacity-90"
            >
              Start free
            </Link>
            <Link
              href="#pricing"
              className="rounded-md border border-outline px-lg py-sm text-label-md text-on-surface hover:bg-surface-container"
            >
              See pricing
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-md px-margin-mobile py-xl md:grid-cols-4 md:px-margin-desktop">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-lg bg-surface-container-low p-lg shadow-level2">
              <Icon name={p.icon} className="text-headline-md text-primary" />
              <h2 className="mt-md text-headline-sm">{p.title}</h2>
              <p className="mt-sm text-body-sm text-on-surface-variant">{p.problem}</p>
            </div>
          ))}
        </section>

        <section className="px-margin-mobile py-xl md:px-margin-desktop" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-headline-lg-mobile text-center md:text-headline-lg">
            How it works
          </h2>
          <ol className="mx-auto mt-lg grid max-w-4xl grid-cols-1 gap-lg md:grid-cols-3">
            <li>
              <span className="text-headline-md text-primary">1</span>
              <p className="mt-sm text-body-md">Teammates submit a 30-second daily pulse check-in.</p>
            </li>
            <li>
              <span className="text-headline-md text-primary">2</span>
              <p className="mt-sm text-body-md">
                WorkPulse scores presence, focus, collaboration, and isolation risk automatically.
              </p>
            </li>
            <li>
              <span className="text-headline-md text-primary">3</span>
              <p className="mt-sm text-body-md">Managers see real gaps and equity signals — not guesswork.</p>
            </li>
          </ol>
        </section>

        <section id="pricing" className="px-margin-mobile py-xl md:px-margin-desktop">
          <h2 className="text-headline-lg-mobile text-center md:text-headline-lg">Pricing</h2>
          <div className="mx-auto mt-lg grid max-w-5xl grid-cols-1 gap-lg md:grid-cols-3">
            {[
              { name: 'Basic', price: '$9', seats: 'Up to 10 seats' },
              { name: 'Pro', price: '$29', seats: 'Up to 50 seats' },
              { name: 'Enterprise', price: 'Custom', seats: 'Unlimited seats' },
            ].map((plan) => (
              <div key={plan.name} className="rounded-lg bg-surface-container-low p-lg text-center shadow-level2">
                <h3 className="text-headline-sm">{plan.name}</h3>
                <p className="mt-sm text-display-md">{plan.price}</p>
                <p className="mt-xs text-body-sm text-on-surface-variant">{plan.seats}</p>
                <Link
                  href="/login"
                  className="mt-md inline-block rounded-md bg-primary px-md py-sm text-label-md text-on-primary hover:opacity-90"
                >
                  Choose {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="px-margin-mobile py-xl md:px-margin-desktop" aria-labelledby="faq">
          <h2 id="faq" className="text-headline-lg-mobile text-center md:text-headline-lg">
            Frequently asked questions
          </h2>
          <div className="mx-auto mt-lg max-w-3xl space-y-md">
            {FAQS.map((f) => (
              <details key={f.q} className="rounded-lg bg-surface-container-low p-md shadow-level2">
                <summary className="cursor-pointer text-body-lg font-semibold">{f.q}</summary>
                <p className="mt-sm text-body-md text-on-surface-variant">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
