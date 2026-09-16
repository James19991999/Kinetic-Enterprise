# E2E tests (Playwright)

Smoke-level browser tests for what's reachable **without** a live Firebase
or Stripe project: public pages, the login form's static markup and
mode-switching, the signed-out middleware redirect, and `/api/health`.

## Intentionally out of scope

Anything that needs real Firebase Auth or Stripe to actually complete:
- Signing in/up and reaching an authenticated dashboard
- Stripe Checkout and the billing pages
- Any RBAC-gated page's real content (admin, settings, analytics data)

These need a real Firebase project's test-mode credentials (and ideally the
Firebase Auth Emulator) to test safely — wire that up once this app has a
Firebase project attached, rather than mocking Auth in a way that could
drift from real behavior.

## Running locally

```bash
npx playwright install chromium   # one-time browser download
npm run test:e2e                  # runs against `npm run dev`
```

## Running in CI

`.github/workflows/ci.yml` runs these against a production build using the
same build-safe placeholder env vars as the rest of CI (see
`src/lib/firebase/client.ts`), so no real credentials are ever needed for
this scope of tests.
