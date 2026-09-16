import { defineConfig, devices } from '@playwright/test';

// E2E smoke tests. Deliberately limited to what's reachable without a real
// Firebase/Stripe project (public pages, the login form's static markup,
// middleware redirects, the health endpoint) — see e2e/README.md for what's
// intentionally out of scope and why.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Reuses a dev server you already have running locally; in CI it builds
  // and starts a production server against the same build-safe placeholder
  // env vars used by .github/workflows/ci.yml.
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
