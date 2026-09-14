'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { MetricsSummary } from '@/types';

/** Subscribes to the most recent metrics summary for live-updating widgets. */
export function useMetrics(orgId: string | null) {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'organizations', orgId, 'metricsSummaries'),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const doc = snapshot.docs[0];
        setSummary(doc ? ({ id: doc.id, ...doc.data() } as MetricsSummary) : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('useMetrics onSnapshot error', err);
        setError('Live metrics are unavailable right now.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [orgId]);

  return { summary, loading, error };
}
