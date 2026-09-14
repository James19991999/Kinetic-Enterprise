'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      // Deliberately swallowed: showing the same "sent" response whether or
      // not the address has an account avoids leaking which emails are
      // registered (anti-enumeration).
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-surface px-margin-mobile">
      <div className="w-full max-w-md rounded-lg bg-surface-container-low p-lg shadow-level3">
        <div className="mb-lg flex items-center gap-sm">
          <Icon name="hub" className="text-headline-sm text-primary" />
          <Link href="/" className="text-headline-sm font-semibold text-on-surface">
            WorkPulse
          </Link>
        </div>

        <h1 className="text-headline-sm">Reset your password</h1>

        {sent ? (
          <p className="mt-md text-body-md text-on-surface-variant" role="status">
            If an account exists for {email}, we&apos;ve sent a password reset link to it.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-md space-y-md">
            <div>
              <label htmlFor="email" className="text-label-md text-on-surface-variant">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
              />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              Send reset link
            </Button>
          </form>
        )}

        <Link href="/login" className="mt-md inline-block text-label-md text-primary">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
