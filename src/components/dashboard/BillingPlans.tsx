'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Plan } from '@/types';

const PLANS: { id: Plan; label: string; price: string }[] = [
  { id: 'basic', label: 'Basic', price: '$9/mo' },
  { id: 'pro', label: 'Pro', price: '$29/mo' },
  { id: 'enterprise', label: 'Enterprise', price: 'Custom' },
];

export function BillingPlans({ currentPlan }: { currentPlan: Plan }) {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChoose(plan: Plan) {
    setLoadingPlan(plan);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? 'Could not start checkout.');
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout.');
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        {PLANS.map((plan) => (
          <div key={plan.id} className="rounded-md border border-outline-variant p-md text-center">
            <p className="text-label-md font-semibold">{plan.label}</p>
            <p className="mt-xs text-headline-sm">{plan.price}</p>
            <Button
              variant={plan.id === currentPlan ? 'ghost' : 'primary'}
              disabled={plan.id === currentPlan}
              isLoading={loadingPlan === plan.id}
              onClick={() => handleChoose(plan.id)}
              className="mt-sm w-full"
            >
              {plan.id === currentPlan ? 'Current plan' : `Choose ${plan.label}`}
            </Button>
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-sm text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
