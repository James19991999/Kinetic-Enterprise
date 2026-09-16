// Exercises the Redis-backed path of rateLimit() with a mocked Upstash
// client, since the sandbox/CI environment has no real Upstash instance.
// The plain rateLimit.test.ts file covers the in-memory fallback path.

describe('rateLimit (Redis-backed path)', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.dontMock('@upstash/ratelimit');
    jest.dontMock('@upstash/redis');
  });

  it('uses the Redis limiter and maps its result shape', async () => {
    const limitMock = jest.fn().mockResolvedValue({ success: true, remaining: 4, reset: 123456 });

    jest.doMock('@upstash/redis', () => ({
      Redis: jest.fn().mockImplementation(() => ({})),
    }));
    jest.doMock('@upstash/ratelimit', () => ({
      Ratelimit: Object.assign(
        jest.fn().mockImplementation(() => ({ limit: limitMock })),
        { slidingWindow: jest.fn().mockReturnValue('sliding-window-config') }
      ),
    }));

    const { rateLimit } = await import('@/lib/rateLimit');
    const result = await rateLimit('login:1.2.3.4', 10, 5 * 60_000);

    expect(limitMock).toHaveBeenCalledWith('login:1.2.3.4');
    expect(result).toEqual({ success: true, remaining: 4, resetAt: 123456 });
  });

  it('falls back to the in-memory limiter if Redis throws', async () => {
    const limitMock = jest.fn().mockRejectedValue(new Error('upstash unreachable'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.doMock('@upstash/redis', () => ({
      Redis: jest.fn().mockImplementation(() => ({})),
    }));
    jest.doMock('@upstash/ratelimit', () => ({
      Ratelimit: Object.assign(
        jest.fn().mockImplementation(() => ({ limit: limitMock })),
        { slidingWindow: jest.fn().mockReturnValue('sliding-window-config') }
      ),
    }));

    const { rateLimit } = await import('@/lib/rateLimit');
    const result = await rateLimit(`login:fallback-${Math.random()}`, 10, 5 * 60_000);

    // Redis failed, so this should still succeed via the in-memory fallback
    // rather than throwing or hard-failing the request.
    expect(result.success).toBe(true);
  });
});
