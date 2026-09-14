'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finishSignIn(idToken: string, isSignup: boolean, extra?: Record<string, string>) {
    const endpoint = isSignup ? '/api/signup' : '/api/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, ...extra }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? 'Something went wrong. Please try again.');
    }
    router.push(next);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken();
        await finishSignIn(idToken, true, { orgName, displayName: displayName || email });
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken();
        await finishSignIn(idToken, false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();
      // Try sign-in first; if the profile doesn't exist yet, provision one.
      try {
        await finishSignIn(idToken, false);
      } catch {
        await finishSignIn(idToken, true, {
          orgName: `${credential.user.displayName ?? 'My'}'s Organization`,
          displayName: credential.user.displayName ?? credential.user.email ?? 'New user',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
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

        <div className="mb-md flex gap-sm rounded-md bg-surface-container p-xs">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-md py-sm text-label-md ${mode === 'signin' ? 'bg-surface-container-lowest shadow-level2' : ''}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-md py-sm text-label-md ${mode === 'signup' ? 'bg-surface-container-lowest shadow-level2' : ''}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="displayName" className="text-label-md text-on-surface-variant">
                  Your name
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
                />
              </div>
              <div>
                <label htmlFor="orgName" className="text-label-md text-on-surface-variant">
                  Organization name
                </label>
                <input
                  id="orgName"
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
                />
              </div>
            </>
          )}

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

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-label-md text-on-surface-variant">
                Password
              </label>
              {mode === 'signin' && (
                <Link href="/reset-password" className="text-label-sm text-primary">
                  Forgot password?
                </Link>
              )}
            </div>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
            />
          </div>

          {error && (
            <p role="alert" className="text-body-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            {mode === 'signup' ? 'Create Account' : 'Sign in'}
          </Button>
        </form>

        <div className="my-md flex items-center gap-sm text-label-sm text-on-surface-variant">
          <div className="h-px flex-1 bg-outline-variant" />
          or
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        <Button variant="secondary" onClick={handleGoogle} isLoading={loading} className="w-full">
          <Icon name="account_circle" />
          Continue with Google
        </Button>
      </div>
    </main>
  );
}
