'use client';

import { useState, type FormEvent } from 'react';
import { useShoutouts } from '@/hooks/useShoutouts';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function TeamPulse({ orgId }: { orgId: string }) {
  const { shoutouts, loading, error } = useShoutouts(orgId);
  const [toDisplayName, setToDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPosting(true);
    setPostError(null);
    try {
      const res = await fetch('/api/shoutouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toDisplayName, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPostError(body.error ?? "Couldn't post your shout-out.");
      } else {
        setToDisplayName('');
        setMessage('');
      }
    } catch {
      setPostError("Couldn't post your shout-out.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-lg bg-surface-container-low p-md shadow-level2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-sm md:flex-row md:items-end">
        <div className="flex-1">
          <label htmlFor="toDisplayName" className="text-label-md text-on-surface-variant">
            Who are you recognizing?
          </label>
          <input
            id="toDisplayName"
            required
            maxLength={100}
            value={toDisplayName}
            onChange={(e) => setToDisplayName(e.target.value)}
            className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
          />
        </div>
        <div className="flex-[2]">
          <label htmlFor="message" className="text-label-md text-on-surface-variant">
            Shout-out
          </label>
          <input
            id="message"
            required
            maxLength={280}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Great work covering the on-call rotation this week!"
            className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
          />
        </div>
        <Button type="submit" isLoading={posting}>
          Post
        </Button>
      </form>
      {postError && (
        <p role="alert" className="mt-sm text-body-sm text-error">
          {postError}
        </p>
      )}

      <div className="mt-md space-y-sm">
        {loading && <p className="text-body-sm text-on-surface-variant">Loading team pulse…</p>}
        {error && (
          <p role="alert" className="text-body-sm text-error">
            {error}
          </p>
        )}
        {!loading && !error && shoutouts.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">
            No shout-outs yet — be the first to recognize a teammate.
          </p>
        )}
        {shoutouts.map((s) => (
          <div key={s.id} className="flex items-start gap-sm rounded-md bg-surface-container px-sm py-sm">
            <Icon name="celebration" className="mt-xs text-tertiary" />
            <p className="text-body-sm">
              <span className="font-semibold">{s.fromDisplayName}</span> to{' '}
              <span className="font-semibold">{s.toDisplayName}</span>: {s.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
