// In-memory, per-instance rate limiter. Good enough for a single deployment
// but does NOT share state across serverless instances — see the note in
// ARCHITECTURE.md §10. A production deployment at scale should swap this
// for Upstash Redis (@upstash/ratelimit) behind the same function signature.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Fixed-window rate limiter. `key` should uniquely identify the caller +
 * route (e.g. `login:1.2.3.4`). Returns success=false once `limit` requests
 * have been made within `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return { success: existing.count <= limit, remaining, resetAt: existing.resetAt };
}

/** Reads the caller's IP from standard proxy headers, falling back to 'unknown'. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]!.trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
