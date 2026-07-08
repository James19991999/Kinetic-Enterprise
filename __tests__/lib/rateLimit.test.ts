import { rateLimit, getClientIp } from '@/lib/rateLimit';

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const key = `test-${Math.random()}`;
    const first = rateLimit(key, 3, 60_000);
    const second = rateLimit(key, 3, 60_000);
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it('blocks requests once the limit is exceeded', () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const third = rateLimit(key, 2, 60_000);
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it('tracks separate keys independently', () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    rateLimit(keyA, 1, 60_000);
    const resultB = rateLimit(keyB, 1, 60_000);
    expect(resultB.success).toBe(true);
  });

  it('resets after the window expires', () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 1, 10); // 10ms window
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = rateLimit(key, 1, 10);
        expect(result.success).toBe(true);
        resolve();
      }, 20);
    });
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
