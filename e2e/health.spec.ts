import { test, expect } from '@playwright/test';

test.describe('GET /api/health', () => {
  test('reports status and which required env vars are missing', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('missingEnvVars');
    expect(body).toHaveProperty('timestamp');
    expect(Array.isArray(body.missingEnvVars)).toBe(true);
  });
});
