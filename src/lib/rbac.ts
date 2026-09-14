import type { Role, SessionClaims } from '@/types';

const ROLE_RANK: Record<Role, number> = {
  employee: 0,
  manager: 1,
  admin: 2,
  owner: 3,
};

export class UnauthorizedError extends Error {
  constructor(message = 'You must be signed in to do that.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** Returns true if `role` meets or exceeds `minRole` in the hierarchy. */
export function hasRole(role: Role, minRole: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

/** Chokepoint 1 — throws if the caller is signed out. */
export function requireSession(
  session: SessionClaims | null
): asserts session is SessionClaims {
  if (!session) {
    throw new UnauthorizedError();
  }
}

/** Chokepoint 2 — throws if the caller's role is below `minRole`. */
export function assertRole(session: SessionClaims, minRole: Role): void {
  if (!hasRole(session.role, minRole)) {
    throw new ForbiddenError();
  }
}

/** Chokepoint 3 — throws if the resource belongs to a different tenant. */
export function assertSameOrg(session: SessionClaims, resourceOrgId: string): void {
  if (session.orgId !== resourceOrgId) {
    throw new ForbiddenError('This resource belongs to a different organization.');
  }
}
