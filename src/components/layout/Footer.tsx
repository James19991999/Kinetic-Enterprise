import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/lib/constants';

const PRODUCT_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/equity', label: 'Equity & Fairness' },
  { href: '/engagement', label: 'Engagement' },
];

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest px-margin-mobile py-xl md:px-margin-desktop">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-lg md:grid-cols-4">
        <div>
          <h3 className="text-label-md font-semibold text-on-surface">Product</h3>
          <ul className="mt-sm space-y-xs">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-body-sm text-on-surface-variant hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-label-md font-semibold text-on-surface">Company</h3>
          <ul className="mt-sm space-y-xs">
            <li>
              <Link href="/about" className="text-body-sm text-on-surface-variant hover:text-primary">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-label-md font-semibold text-on-surface">Legal</h3>
          <ul className="mt-sm space-y-xs">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-body-sm text-on-surface-variant hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-label-md font-semibold text-on-surface">Support</h3>
          <ul className="mt-sm space-y-xs">
            <li>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                aria-label="Email WorkPulse support"
                className="text-body-sm text-on-surface-variant hover:text-primary"
              >
                {SUPPORT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-xl max-w-6xl text-label-sm text-on-surface-variant">
        © {year} WorkPulse. All rights reserved.
      </p>
    </footer>
  );
}
