import { rateLimit, getClientIp } from '@/lib/rateLimit';

// No UPSTASH_REDIS_REST_URL / TOKEN are set in the test environment, so
// rateLimit() exercises its in-memory fallback path here. The Redis-backed
// path is exercised by rateLimit.redis.test.ts using a mocked Upstash client.

describe('rateLimit (in-memory fallback)', () => {
  it('allows requests under the limit', async () => {
    const key = `test-${Math.random()}`;
    const first = await rateLimit(key, 3, 60_000);
    const second = await rateLimit(key, 3, 60_000);
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it('blocks requests once the limit is exceeded', async () => {
    const key = `test-${Math.random()}`;
    await rateLimit(key, 2, 60_000);
    await rateLimit(key, 2, 60_000);
    const third = await rateLimit(key, 2, 60_000);
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it('tracks separate keys independently', async () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    await rateLimit(keyA, 1, 60_000);
    const resultB = await rateLimit(keyB, 1, 60_000);
    expect(resultB.success).toBe(true);
  });

  it('resets after the window expires', async () => {
    const key = `test-${Math.random()}`;
    await rateLimit(key, 1, 10); // 10ms window
    await new Promise((resolve) => setTimeout(resolve, 20));
    const result = await rateLimit(key, 1, 10);
    expect(result.success).toBe(true);
  });
});

describe('getClientIp', () => {
  function fakeRequest(headers: Record<string, string>): Request {
    return { headers: { get: (key: string) => headers[key.toLowerCase()] ?? null } } as unknown as Request;
  }

  it('reads the first address from x-forwarded-for', () => {
    const request = fakeRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(request)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const request = fakeRequest({ 'x-real-ip': '9.9.9.9' });
    expect(getClientIp(request)).toBe('9.9.9.9');
  });

  it('falls back to "unknown" when no IP headers are present', () => {
    const request = fakeRequest({});
    expect(getClientIp(request)).toBe('unknown');
  });
});
