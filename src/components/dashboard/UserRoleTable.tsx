'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import type { Role, UserProfile } from '@/types';

const ASSIGNABLE_ROLES: Role[] = ['employee', 'manager', 'admin'];

export function UserRoleTable({
  users,
  currentUid,
  isOwner,
}: {
  users: UserProfile[];
  currentUid: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [savingUid, setSavingUid] = useState<string | null>(null);

  async function handleRoleChange(uid: string, role: Role) {
    setSavingUid(uid);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? 'Could not update role.');
      } else {
        router.refresh();
      }
    } catch {
      setError('Could not update role.');
    } finally {
      setSavingUid(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg bg-surface-container-low shadow-level2">
      {error && (
        <p role="alert" className="px-md py-sm text-body-sm text-error">
          {error}
        </p>
      )}
      <table className="w-full text-left text-body-sm">
        <thead className="bg-surface-container text-label-md text-on-surface-variant">
          <tr>
            <th className="px-md py-sm">Name</th>
            <th className="px-md py-sm">Email</th>
            <th className="px-md py-sm">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid} className="border-t border-outline-variant">
              <td className="px-md py-sm">{user.displayName}</td>
              <td className="px-md py-sm text-on-surface-variant">{user.email}</td>
              <td className="px-md py-sm">
                {user.role === 'owner' || user.uid === currentUid || (!isOwner && user.role === 'admin') ? (
                  <Badge>{user.role}</Badge>
                ) : (
                  <select
                    aria-label={`Change role for ${user.displayName}`}
                    value={user.role}
                    disabled={savingUid === user.uid}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as Role)}
                    className="rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-xs"
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role} disabled={role === 'admin' && !isOwner}>
                        {role}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
