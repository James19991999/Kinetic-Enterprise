import type { Metadata, Viewport } from 'next';
import './globals.css';
import { APP_URL } from '@/lib/constants';

// Intentionally NOT using next/font/google here: this sandbox blocks
// fonts.googleapis.com at build time. On Vercel (open network), switch to
// next/font/google for self-hosted, zero-layout-shift fonts.
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'WorkPulse — Hybrid Work Analytics',
    template: '%s | WorkPulse',
  },
  description:
    'WorkPulse helps distributed teams close the communication, productivity, isolation, and fairness gaps hybrid work creates.',
  openGraph: {
    title: 'WorkPulse — Hybrid Work Analytics',
    description: 'Real-time presence, productivity, equity, and engagement analytics for hybrid teams.',
    url: APP_URL,
    siteName: 'WorkPulse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkPulse — Hybrid Work Analytics',
    description: 'Real-time presence, productivity, equity, and engagement analytics for hybrid teams.',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a146b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface font-sans text-on-surface antialiased">{children}</body>
    </html>
  );
}
