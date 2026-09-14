import type { Metadata } from 'next';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset the password for your WorkPulse account.',
  alternates: { canonical: `${APP_URL}/reset-password` },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
