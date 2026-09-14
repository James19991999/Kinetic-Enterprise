'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import type { Presence, PulseEntry } from '@/types';

export function CheckInForm({ initial }: { initial: PulseEntry | null }) {
  const [presence, setPresence] = useState<Presence>(initial?.presence ?? 'in_office');
  const [focusHours, setFocusHours] = useState(initial?.focusHours ?? 6);
  const [meetingHours, setMeetingHours] = useState(initial?.meetingHours ?? 2);
  const [collaborationScore, setCollaborationScore] = useState(initial?.collaborationScore ?? 70);
  const [moodScore, setMoodScore] = useState(initial?.moodScore ?? 70);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presence, focusHours, meetingHours, collaborationScore, moodScore }),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-md rounded-lg bg-surface-container-low p-md shadow-level2">
      <div>
        <label className="text-label-md text-on-surface-variant" htmlFor="presence">
          Where are you working from today?
        </label>
        <select
          id="presence"
          value={presence}
          onChange={(e) => setPresence(e.target.value as Presence)}
          className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
        >
          <option value="in_office">In the Office</option>
          <option value="remote">Working From Home</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div>
          <label className="text-label-md text-on-surface-variant" htmlFor="focusHours">
            Focus hours
          </label>
          <input
            id="focusHours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={focusHours}
            onChange={(e) => setFocusHours(Number(e.target.value))}
            className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
          />
        </div>
        <div>
          <label className="text-label-md text-on-surface-variant" htmlFor="meetingHours">
            Meeting hours
          </label>
          <input
            id="meetingHours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={meetingHours}
            onChange={(e) => setMeetingHours(Number(e.target.value))}
            className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
          />
        </div>
        <div>
          <label className="text-label-md text-on-surface-variant" htmlFor="collaborationScore">
            Collaboration (0-100)
          </label>
          <input
            id="collaborationScore"
            type="number"
            min={0}
            max={100}
            value={collaborationScore}
            onChange={(e) => setCollaborationScore(Number(e.target.value))}
            className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
          />
        </div>
        <div>
          <label className="text-label-md text-on-surface-variant" htmlFor="moodScore">
            Mood (0-100)
          </label>
          <input
            id="moodScore"
            type="number"
            min={0}
            max={100}
            value={moodScore}
            onChange={(e) => setMoodScore(Number(e.target.value))}
            className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-md">
        <Button type="submit" isLoading={status === 'saving'}>
          {initial ? 'Update check-in' : 'Submit check-in'}
        </Button>
        {status === 'saved' && <span className="text-body-sm text-secondary">Saved.</span>}
        {status === 'error' && (
          <span role="alert" className="text-body-sm text-error">
            Couldn&apos;t save. Please try again.
          </span>
        )}
      </div>
    </form>
  );
}
