import type { IsolationRisk, ParticipationStatus, Presence } from '@/types';

const STALE_THRESHOLD_DAYS = 14;

/** Pure isolation-risk scoring. Remote + low collaboration is the highest-risk combo. */
export function deriveIsolationRisk(input: {
  presence: Presence;
  collaborationScore: number;
}): IsolationRisk {
  const { presence, collaborationScore } = input;
  if (presence === 'remote' && collaborationScore < 40) return 'high';
  if (collaborationScore < 60) return 'medium';
  return 'low';
}

/** Lowercases, hyphenates, and trims a name into a URL-safe org slug. */
export function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `org-${Date.now()}`;
}

function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00Z`).getTime();
  const to = new Date(`${toDate}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

/**
 * Pure decision logic for the Equity page's "Participation Gaps" list.
 * Returns null when the employee is healthy (shouldn't be flagged).
 */
export function deriveParticipationStatus(input: {
  lastEntryDate: string | null;
  latestRisk: IsolationRisk | null;
  today: string;
}): ParticipationStatus | null {
  const { lastEntryDate, latestRisk, today } = input;

  if (lastEntryDate === null) {
    return {
      severity: 'critical',
      reason: "Hasn't submitted a single check-in yet.",
      icon: 'event_busy',
      daysSinceCheckIn: null,
    };
  }

  const daysSinceCheckIn = daysBetween(lastEntryDate, today);

  if (daysSinceCheckIn >= STALE_THRESHOLD_DAYS) {
    return {
      severity: 'critical',
      reason: `No check-in in ${daysSinceCheckIn} days.`,
      icon: 'event_busy',
      daysSinceCheckIn,
    };
  }

  if (latestRisk === 'high') {
    return {
      severity: 'critical',
      reason: 'Recent check-ins show high isolation risk.',
      icon: 'location_on',
      daysSinceCheckIn,
    };
  }

  if (latestRisk === 'medium') {
    return {
      severity: 'moderate',
      reason: 'Recent check-ins show reduced collaboration.',
      icon: 'group_off',
      daysSinceCheckIn,
    };
  }

  return null;
}
