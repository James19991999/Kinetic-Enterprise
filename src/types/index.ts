export type Role = 'employee' | 'manager' | 'admin' | 'owner';

export type Plan = 'basic' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'none';

export type Presence = 'in_office' | 'remote';

export type IsolationRisk = 'low' | 'medium' | 'high';

export interface SessionClaims {
  uid: string;
  orgId: string;
  role: Role;
  email: string;
}

export interface UserProfile {
  uid: string;
  orgId: string;
  email: string;
  displayName: string;
  role: Role;
  officeLocation?: string;
  team?: string;
  photoURL?: string;
  createdAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerUid: string;
  plan: Plan;
  seatLimit: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;
  officeLocations: string[];
  createdAt?: string;
}

export interface PulseEntry {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  presence: Presence;
  focusHours: number;
  meetingHours: number;
  collaborationScore: number; // 0-100
  moodScore: number; // 0-100
  isolationRisk: IsolationRisk;
  createdAt?: string;
}

export interface MetricsSummary {
  id: string;
  officeUtilization: number;
  avgFocusHours: number;
  engagementScore: number;
  equityGapScore: number;
  updatedAt?: string;
}

export interface UsageEvent {
  id: string;
  uid: string;
  type: string;
  route: string;
  createdAt: string;
}

export type ParticipationSeverity = 'critical' | 'moderate';

export interface ParticipationStatus {
  severity: ParticipationSeverity;
  reason: string;
  icon: string;
  daysSinceCheckIn: number | null;
}

export interface ParticipationGap extends ParticipationStatus {
  uid: string;
  displayName: string;
}
