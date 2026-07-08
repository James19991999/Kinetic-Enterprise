import {
  hasRole,
  requireSession,
  assertRole,
  assertSameOrg,
  UnauthorizedError,
  ForbiddenError,
} from '@/lib/rbac';
import type { SessionClaims } from '@/types';

const employee: SessionClaims = { uid: 'u1', orgId: 'org1', role: 'employee', email: 'e@x.com' };
const manager: SessionClaims = { uid: 'u2', orgId: 'org1', role: 'manager', email: 'm@x.com' };
const admin: SessionClaims = { uid: 'u3', orgId: 'org1', role: 'admin', email: 'a@x.com' };
const owner: SessionClaims = { uid: 'u4', orgId: 'org1', role: 'owner', email: 'o@x.com' };

describe('hasRole', () => {
  it('ranks roles correctly', () => {
    expect(hasRole('owner', 'admin')).toBe(true);
    expect(hasRole('admin', 'owner')).toBe(false);
    expect(hasRole('employee', 'employee')).toBe(true);
    expect(hasRole('manager', 'admin')).toBe(false);
  });
});

describe('requireSession', () => {
  it('throws UnauthorizedError for a null session', () => {
    expect(() => requireSession(null)).toThrow(UnauthorizedError);
  });

  it('does not throw for a valid session', () => {
    expect(() => requireSession(employee)).not.toThrow();
  });
});

describe('assertRole', () => {
  it('allows a role that meets the minimum', () => {
    expect(() => assertRole(admin, 'manager')).not.toThrow();
    expect(() => assertRole(owner, 'owner')).not.toThrow();
  });

  it('throws ForbiddenError when the role is below the minimum', () => {
    expect(() => assertRole(employee, 'admin')).toThrow(ForbiddenError);
    expect(() => assertRole(manager, 'owner')).toThrow(ForbiddenError);
  });
});

describe('assertSameOrg', () => {
  it('allows access to a resource in the same org', () => {
    expect(() => assertSameOrg(employee, 'org1')).not.toThrow();
  });

  it('blocks cross-tenant access', () => {
    expect(() => assertSameOrg(employee, 'org2')).toThrow(ForbiddenError);
  });
});
