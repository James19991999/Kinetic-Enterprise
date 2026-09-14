'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { Presence } from '@/types';

const LABELS: Record<Presence, string> = {
  in_office: 'In the Office',
  remote: 'Working From Home',
};

export function PresenceToggle({ initial }: { initial: Presence }) {
  const [presence, setPresence] = useState<Presence>(initial);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const previous = presence;
    const next: Presence = previous === 'in_office' ? 'remote' : 'in_office';
    setPresence(next);
    setError(null);

    try {
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presence: next }),
      });
      if (!res.ok) {
        setPresence(previous);
        setError("We couldn't save your presence. Please try again.");
      }
    } catch {
      setPresence(previous);
      setError("We couldn't save your presence. Please try again.");
    }
  }

  return (
    <div className="flex items-center gap-md">
      <button
        type="button"
        role="switch"
        aria-checked={presence === 'remote'}
        aria-label="Toggle work-from-home presence"
        onClick={handleToggle}
        className={clsx(
          'relative h-8 w-14 rounded-full transition-colors',
          presence === 'remote' ? 'bg-primary' : 'bg-outline-variant'
        )}
      >
        <span
          className={clsx(
            'absolute top-1 h-6 w-6 rounded-full bg-surface transition-transform',
            presence === 'remote' ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
      <span className="text-body-md text-on-surface">{LABELS[presence]}</span>
      {error && (
        <span role="alert" className="text-body-sm text-error">
          {error}
        </span>
      )}
    </div>
  );
}
