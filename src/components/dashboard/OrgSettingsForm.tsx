'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function OrgSettingsForm({
  initialName,
  initialLocations,
}: {
  initialName: string;
  initialLocations: string[];
}) {
  const [name, setName] = useState(initialName);
  const [locations, setLocations] = useState(initialLocations);
  const [newLocation, setNewLocation] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  function addLocation() {
    const trimmed = newLocation.trim();
    if (trimmed && !locations.includes(trimmed)) {
      setLocations([...locations, trimmed]);
      setNewLocation('');
    }
  }

  function removeLocation(location: string) {
    setLocations(locations.filter((l) => l !== location));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, officeLocations: locations }),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <div>
        <label htmlFor="orgName" className="text-label-md text-on-surface-variant">
          Organization name
        </label>
        <input
          id="orgName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-xs w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
        />
      </div>

      <div>
        <span className="text-label-md text-on-surface-variant">Office locations</span>
        <ul className="mt-xs space-y-xs">
          {locations.map((location) => (
            <li key={location} className="flex items-center justify-between rounded-md bg-surface-container px-sm py-xs">
              <span className="text-body-sm">{location}</span>
              <button
                type="button"
                onClick={() => removeLocation(location)}
                aria-label={`Remove ${location}`}
                className="text-on-surface-variant hover:text-error"
              >
                <Icon name="close" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-sm flex gap-sm">
          <input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Add a location"
            className="flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-sm"
          />
          <Button type="button" variant="secondary" onClick={addLocation}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-md">
        <Button type="submit" isLoading={status === 'saving'}>
          Save workspace settings
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
