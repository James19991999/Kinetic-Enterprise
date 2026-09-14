import type { Metadata } from 'next';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your WorkPulse workspace or create a new organization.',
  alternates: { canonical: `${APP_URL}/login` },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
