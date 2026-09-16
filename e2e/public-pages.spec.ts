import { test, expect } from '@playwright/test';

// Statically rendered marketing/legal pages — no auth involved, so these
// are safe to check against a real browser without any Firebase/Stripe
// credentials.
const PUBLIC_PAGES = ['/', '/about', '/privacy', '/terms'];

test.describe('Public pages', () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} loads without error`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBe(true);
    });
  }
});
