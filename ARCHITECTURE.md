# WorkPulse — Architecture Overview

WorkPulse is a multi-tenant SaaS that helps distributed teams close the four
gaps hybrid work creates: **communication gaps** (missed syncs, undocumented
decisions), **uneven productivity tracking** (unfair comparisons between
in-office and remote output), **employee isolation** (remote staff quietly
disengaging), and **fairness** (promotion/recognition bias toward whoever is
physically in the room). Each of the four main app sections maps directly to
one of those problems: **Analytics** (gaps), **Equity & Fairness**
(fairness/tracking), **Engagement** (isolation), and **Home** (a daily
rollup of all three).

## 1. High-level architecture

```
┌────────────────────────────┐        ┌──────────────────────────┐
│  Next.js 14 App Router      │        │  Firebase                │
│  ─ Server Components (RSC)  │◄──────►│  ─ Auth (email + Google) │
│  ─ Client Components        │        │  ─ Firestore (multi-     │
│  ─ API Route Handlers       │        │    tenant, real-time)    │
│  ─ Edge Middleware          │        │  ─ Admin SDK (server)    │
└────────────┬────────────────┘        └──────────────────────────┘
             │
             ▼
      ┌─────────────┐
      │   Stripe     │  Checkout Sessions + Webhooks
      │  (billing)   │  → keeps organizations.plan in sync
      └─────────────┘
```

- **Rendering strategy**: pages that need the caller's session (everything
  under the `(dashboard)` route group) are server components that call
  `getServerSession()` and fetch data directly with the Admin SDK — no
  client-side waterfall for the first paint. Live-updating widgets (metric
  cards fed by Firestore `onSnapshot`) hydrate on the client via
  `useMetrics()`/`useAuth()`.
- **Multi-tenancy**: every document that isn't a top-level user or org record
  lives under `organizations/{orgId}/...`. `orgId` is *never* accepted from
  the client — it's always resolved server-side from the verified session
  (see §4).

## 2. Directory structure

```
src/
  app/
    (auth)/login/page.tsx          Sign in / create account
    (dashboard)/                   Protected route group (force-dynamic)
      layout.tsx                   Verifies session, renders DashboardShell
      dashboard/page.tsx           Home — 4 metric cards + daily gaps
      analytics/page.tsx           Productivity & collaboration gaps
      equity/page.tsx              Equity & fairness dashboard
      engagement/page.tsx          Daily check-in + team pulse
      settings/page.tsx            Profile, workspace, billing plans
      admin/                       Admin-only scaffolding
        page.tsx                  Overview (seats, plan, activity)
        users/page.tsx            Role management table
        billing/page.tsx          Seat usage + subscription status
    api/
      login/route.ts               POST — exchange ID token for session cookie
      signup/route.ts              POST — provision org + owner profile
      logout/route.ts              POST — clear cookie, revoke tokens
      metrics/route.ts             GET/POST — org metrics, pulse entries
      settings/route.ts            GET/PATCH — org settings (admin+)
      admin/users/route.ts         GET/PATCH — list/role-manage teammates
      admin/tenants/route.ts       GET — org profile + usage for admin UI
      stripe/create-checkout-session/route.ts
      stripe/webhook/route.ts      Subscription lifecycle sync
  components/
    layout/   Sidebar, TopBar, DashboardShell
    dashboard/ MetricCard, GapCard, PresenceToggle, EquityBar, PulseTrend
    ui/       Button, Badge, Icon
  lib/
    firebase/ client.ts (browser SDK), admin.ts (Admin SDK, lazy-init),
              session.ts (session cookie helpers)
    rbac.ts   requireSession / assertRole / assertSameOrg chokepoints
    pulse.ts  Pure scoring helpers (isolation risk, slugify) — unit tested
    stripe.ts Stripe client + plan/price mapping
    usage.ts  Usage/activity event logging
  middleware.ts  Edge-layer redirect for signed-out users
  types/index.ts Shared domain types
```

## 3. Firestore schema (multi-tenant)

```
organizations/{orgId}
  ├─ name, slug, ownerUid, plan, seatLimit
  ├─ stripeCustomerId, stripeSubscriptionId, subscriptionStatus
  ├─ officeLocations: string[]
  │
  ├─ metricsSummaries/{summaryId}        (real-time, read-only from client)
  │    officeUtilization, avgFocusHours, engagementScore, equityGapScore
  │
  ├─ pulseEntries/{uid_YYYY-MM-DD}        (one per employee per day)
  │    uid, presence, focusHours, meetingHours,
  │    collaborationScore, moodScore, isolationRisk
  │
  └─ usageEvents/{eventId}                (append-only, admin-read-only)
       uid, type, route, createdAt

users/{uid}                               (top-level; orgId is the tenant key)
  ├─ orgId, email, displayName, role (employee|manager|admin|owner)
  └─ officeLocation, team, photoURL
```

Design choices:
- `users` is top-level (not nested under `organizations`) so a user document
  can be read by its own `uid` in exactly one round trip during session
  verification — nesting would require a collection-group query on every
  request.
- `pulseEntries` doc IDs are deterministic (`{uid}_{date}`) so a resubmitted
  check-in for the same day overwrites rather than duplicates.
- `metricsSummaries` is written by a trusted aggregation job (Cloud Function
  or scheduled server task, out of scope here) — clients only ever read it,
  enforced by `firestore.rules`.

## 4. Authentication + RBAC

- **Sign-in**: client calls Firebase Auth (`signInWithEmailAndPassword` or
  `signInWithPopup(googleProvider)`), gets an ID token, and POSTs it to
  `/api/login`. The server verifies the token with the Admin SDK, then mints
  an **httpOnly, secure session cookie** (`createSessionCookie`) — the app
  never stores a raw ID token client-side for authorization purposes.
- **Sign-up**: `/api/signup` verifies the ID token, then atomically creates
  an `organizations/{orgId}` doc and a `users/{uid}` doc (`role: 'owner'`) in
  one Firestore batch.
- **Session resolution**: `getServerSession()` reads the cookie, verifies it
  (checking revocation), and resolves `{ uid, orgId, role, email }` from the
  user's own profile doc — this is the single source of truth for every
  protected server component and API route.
- **RBAC chokepoints** (`src/lib/rbac.ts`):
  1. `requireSession(session)` — throws `UnauthorizedError` if signed out.
  2. `assertRole(session, minRole)` — throws `ForbiddenError` if the role is
     below `employee < manager < admin < owner`.
  3. `assertSameOrg(session, resourceOrgId)` — throws if a resource belongs
     to a different tenant than the caller's session.
  Every API route calls (1) first, then (2)/(3) as needed, before touching
  Firestore — this is what the codebase's existing convention calls the
  single RBAC "chokepoint" pattern.
- **Edge middleware** (`src/middleware.ts`) does a cheap cookie-presence
  check to redirect signed-out users before they even reach a protected
  route; it is a UX fast-path, not the security boundary — real
  verification always happens server-side via `getServerSession()`.
- **Firestore Security Rules** (`firestore.rules`) enforce the same
  same-org + role checks at the database layer, so a compromised or buggy
  client can't bypass the API and hit Firestore directly.

## 5. Billing (Stripe)

- `POST /api/stripe/create-checkout-session` — owner-only; creates a Stripe
  Checkout Session for `basic` / `pro` / `enterprise` and redirects to it.
- `POST /api/stripe/webhook` — verifies the Stripe signature, then updates
  `organizations/{orgId}` on `checkout.session.completed`,
  `customer.subscription.updated|created|deleted`, and
  `invoice.payment_failed`, keeping `plan`, `seatLimit`, and
  `subscriptionStatus` in sync without any client involvement.

## 6. Usage tracking

`lib/usage.ts#logUsage()` appends an event to
`organizations/{orgId}/usageEvents` on every meaningful API call (metrics
reads/writes, settings changes, admin actions). This powers both the admin
dashboard's "Recent Activity" feed and, in production, would feed a metered
billing job.

## 8. Isolation detection (real data, not sample)

The Equity & Fairness page's "Participation Gaps" list is computed from
actual `pulseEntries`, not sample data:

- `lib/pulse.ts#deriveParticipationStatus()` — pure, unit-tested decision
  logic. Given an employee's most recent check-in date and its isolation
  risk, it returns `null` (healthy — omitted from the list) or a
  `{ severity, reason, icon }` flag. A 14-day-silent employee is flagged
  even if their last known risk was "low" — staleness itself is a signal.
- `lib/firebase/participation.ts#getParticipationGaps()` — the Firestore
  I/O layer. Reads all `pulseEntries` in the last 14 days, reduces to each
  user's latest entry, and calls the pure function per user.
- Access is gated to `manager` role and above (`hasRole(session.role,
  'manager')`), matching the same restriction already encoded in
  `firestore.rules` for reading `pulseEntries` directly — individual
  employees don't see which named colleagues are flagged as isolated.
- On a fresh workspace with no check-ins yet, the page shows an honest
  "no data yet" state instead of a fake list.

## 9. SEO

The public surface (everything a logged-out visitor or search engine can
reach) is now a real, crawlable marketing site, not just a redirect to the
login wall:

- **`/` is the homepage**, not a redirect. It only redirects to `/dashboard`
  for *already-authenticated* visitors; logged-out visitors and crawlers see
  a full page — hero, the four problem/solution pillars, how-it-works,
  pricing, and an FAQ section.
- **`/about`** carries distinct content (mission/principles) rather than
  repeating the homepage, to avoid duplicate-content dilution.
- **Structured data**: the homepage emits `SoftwareApplication` and
  `FAQPage` JSON-LD (`src/app/page.tsx`) — the FAQ schema is what can earn
  rich-result snippets directly in search results.
- **`robots.ts`** allows the marketing pages and explicitly disallows the
  authenticated app surface (`/dashboard`, `/analytics`, etc.) — there's
  nothing for a crawler to index there anyway, since it all requires login.
- **`sitemap.ts`** lists every public URL.
- **Per-page metadata**: title, description, Open Graph, Twitter card, and
  `alternates.canonical` on every public route, including the client-rendered
  `/login` and `/reset-password` pages (via small server-component
  `layout.tsx` wrappers, since `metadata` can't be exported from a `'use
  client'` file).
- **Generated icon + OG image** (`app/icon.tsx`, `app/opengraph-image.tsx`)
  via `next/og`, so social shares and browser tabs get a real image with no
  external asset files needed.
- **`noindex`** is set explicitly on the entire authenticated route group as
  defense-in-depth on top of `robots.txt`.

**What this can't do**: technical SEO makes the app *indexable and
well-formed* — it does not and cannot guarantee ranking position. Ranking
also depends on backlinks, domain age/authority, real traffic and
engagement signals, and competition for the target keywords — none of which
exist yet for a newly-deployed domain. The realistic next steps for ranking
(not code) are: publish the site on a real domain, submit the sitemap in
Google Search Console, and build genuine content/backlinks over time.

## 10. Production hardening added in this pass

- **Error handling**: `error.tsx` (route-level boundary, keeps nav/layout
  intact), `global-error.tsx` (root-layout failures, renders its own
  `<html>`), and `not-found.tsx` (branded 404) replace Next's unbranded
  defaults. Every unhandled error now shows a recoverable UI, not a blank
  screen.
- **Loading states**: `(dashboard)/loading.tsx` gives a skeleton while
  server-fetched dashboard pages load, instead of a blank pause.
- **Accessibility**: a skip-to-content link (`#main-content`, present on
  every page) for keyboard/screen-reader users; the TopBar's notification
  and profile dropdowns now close on outside click or Escape
  (`hooks/useDismiss.ts`) — previously they only closed via their own
  trigger button, which is non-standard menu behavior.
- **Health check**: `GET /api/health` reports which required env vars are
  missing (not their values) — useful for verifying a fresh deployment
  before wiring up monitoring. Deliberately doesn't call Firebase/Stripe
  itself, so it stays fast and dependency-free.
- **Rate limiting**: `lib/rateLimit.ts` throttles `/api/login` (10/5min/IP)
  and `/api/signup` (5/15min/IP) against brute-force and mass-signup abuse.
  This is in-memory and therefore per-instance — see the limitation comment
  in the file for why a real multi-instance production deployment should
  swap in Upstash Redis (`@upstash/ratelimit`) instead.
- **PWA basics**: `manifest.ts` + `apple-icon.tsx` + a `viewport` theme
  color, so the app can be added to a home screen with a real icon.
- **Dead code removed**: the unused `/api/admin/tenants` route (the admin
  overview page already fetches the same data directly via `adminDb` in its
  server component, which is the more idiomatic App Router pattern — the
  API route existed but nothing ever called it).
- **DRY**: `lib/constants.ts` centralizes `SUPPORT_EMAIL`, previously
  hardcoded as a literal string in seven different files.
- **Closed a schema-to-UI gap**: `Organization.officeLocations` existed in
  the type and was read by the admin overview card, but there was no UI to
  ever set it. The Settings page now has an admin-gated add/remove list
  wired to the existing `PATCH /api/settings` endpoint.

## 11. What's intentionally still not built, and why

These were considered and deliberately left out rather than half-built:

- **Account/org deletion (GDPR-style)**: genuinely complex to get right —
  what happens to an org when its sole owner deletes their account, how
  Stripe cancellation should sequence with data deletion — these are
  product decisions, not just code. Shipping a partial version risked
  orphaned orgs or silent data loss, which is worse than not having it yet.
- **Real, shared-store rate limiting**: the current in-memory limiter is a
  real improvement over nothing but is per-instance; production at scale
  needs Redis-backed limiting.
- **Content Security Policy header**: not added, because getting a CSP
  right for a Firebase-Auth-popup + Stripe-Checkout-redirect + Google-Fonts
  app requires testing against live credentials to avoid silently breaking
  sign-in — better to add and tune this after a real Firebase project is
  wired up than ship an untested policy.
- **CI/CD pipeline, e2e tests (Playwright), dark mode toggle, i18n**: all
  reasonable next steps for a maturing product, but each is a substantial
  scope addition in its own right rather than a "fix."

## 12. Known gaps / next steps for production deployment

- `next/font/google` is intentionally not used — this sandbox blocks
  `fonts.googleapis.com` at build time, so the layout uses `<link>` tags
  instead (documented in `src/app/layout.tsx`). On Vercel (open network),
  switch to `next/font/google` for self-hosted, zero-layout-shift fonts.
- `metricsSummaries` aggregation (rolling up `pulseEntries` into org-wide
  numbers for the Home dashboard's metric cards) is intentionally left as a
  stub for a scheduled Cloud Function — this is the next-highest-value piece
  to wire up after isolation detection (§8), which is already real.
- **Still sample/illustrative, not computed**: the Home and Analytics pages'
  "Daily Gaps" / "Communication Blind Spots" lists (would need a
  calendar/Slack integration to detect real missed syncs), and the Equity
  page's "Promotion Velocity" chart (would need an HRIS/payroll
  integration). Both are clearly labeled in the UI rather than presented as
  real numbers.
- Microsoft OAuth was in the original Stitch mock but is out of scope per
  the stated requirements (Email/Password + Google only); the UI has a
  clear place to add it (`googleProvider` pattern in `lib/firebase/client.ts`).
