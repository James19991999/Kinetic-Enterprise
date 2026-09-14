'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Shoutout } from '@/types';

/** Subscribes to the org's 20 most recent peer-recognition posts, live. */
export function useShoutouts(orgId: string | null) {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'organizations', orgId, 'shoutouts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setShoutouts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Shoutout));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('useShoutouts onSnapshot error', err);
        setError('The live team pulse feed is unavailable right now.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [orgId]);

  return { shoutouts, loading, error };
}
