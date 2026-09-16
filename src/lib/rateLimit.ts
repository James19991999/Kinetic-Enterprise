// Rate limiter with two backends, selected automatically:
//
// - Redis (Upstash), used whenever UPSTASH_REDIS_REST_URL and
//   UPSTASH_REDIS_REST_TOKEN are set. Shares state across every serverless
//   instance, so limits hold under real multi-instance production traffic.
// - In-memory fixed-window fallback, used otherwise (local dev, or any
//   deployment that hasn't wired up Upstash yet). Does NOT share state
//   across instances — fine for a single dev server, not for production
//   at scale behind more than one instance.
//
// Both backends return the same RateLimitResult shape, so call sites never
// need to know which one is active. The Upstash SDK is imported dynamically
// and only when the env vars are present, so a deployment (or test run)
// without Upstash configured never loads it at all.

import type { Ratelimit } from '@upstash/ratelimit';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, Bucket>();

/** In-memory fixed-window limiter — see file header for when this is used. */
function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return { success: existing.count <= limit, remaining, resetAt: existing.resetAt };
}

const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// One Ratelimit instance per distinct (limit, windowMs) pair, created lazily,
// since the Upstash client wants the window baked in at construction time.
const redisLimiters = new Map<string, Ratelimit>();

async function getRedisLimiter(limit: number, windowMs: number): Promise<Ratelimit> {
  const cacheKey = `${limit}:${windowMs}`;
  const existing = redisLimiters.get(cacheKey);
  if (existing) return existing;

  const [{ Ratelimit: RatelimitCtor }, { Redis }] = await Promise.all([
    import('@upstash/ratelimit'),
    import('@upstash/redis'),
  ]);

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const limiter = new RatelimitCtor({
    redis,
    limiter: RatelimitCtor.slidingWindow(limit, `${windowMs} ms`),
    analytics: false,
  });
  redisLimiters.set(cacheKey, limiter);
  return limiter;
}

/**
 * Rate limiter. `key` should uniquely identify the caller + route (e.g.
 * `login:1.2.3.4`). Returns success=false once `limit` requests have been
 * made within `windowMs`. Backed by Redis when Upstash env vars are present,
 * otherwise falls back to an in-memory limiter (see file header).
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (!hasUpstashConfig) {
    return memoryRateLimit(key, limit, windowMs);
  }

  try {
    const limiter = await getRedisLimiter(limit, windowMs);
    const result = await limiter.limit(key);
    return {
      success: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch (error) {
    // Redis unreachable — fail open to the in-memory limiter rather than
    // taking down login/signup because of a rate-limiter outage. This is
    // strictly a resilience fallback, not the normal path.
    console.error('Upstash rate limit request failed, falling back to in-memory limiter:', error);
    return memoryRateLimit(key, limit, windowMs);
  }
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
