# WorkPulse

A multi-tenant SaaS for hybrid work: real-time presence, productivity gaps,
equity/fairness, and engagement — built from a Stitch design export
("Kinetic Enterprise" design system) into a production-ready Next.js app.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full architecture
overview, Firestore schema, and RBAC model.

## Stack

Next.js 14 (App Router, TypeScript) · TailwindCSS · Firebase (Auth +
Firestore + Admin SDK) · Stripe · Jest + React Testing Library

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in Firebase + Stripe credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected
to `/login`. Use "Create Account" to provision your first organization
(you'll be the `owner`).

### Required environment variables

See `.env.local.example` for the full list. You need:
- A Firebase project with **Email/Password** and **Google** sign-in enabled
  (Authentication → Sign-in method).
- A Firebase Admin service account (Project Settings → Service Accounts →
  Generate new private key) for `FIREBASE_ADMIN_*`.
- A Stripe account with three recurring Prices created for the `basic` /
  `pro` / `enterprise` tiers, and a webhook endpoint pointed at
  `/api/stripe/webhook` (use `stripe listen --forward-to localhost:3000/api/stripe/webhook` locally).

### Deploying Firestore rules & indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Scripts

| Command                | Description                          |
|-------------------------|---------------------------------------|
| `npm run dev`           | Start the dev server                  |
| `npm run build`         | Production build                      |
| `npm run start`         | Start the production server           |
| `npm run lint`          | ESLint                                |
| `npm test`              | Run the Jest suite                    |
| `npm run test:coverage` | Run tests with coverage               |

## Notes for deployment (Vercel)

This project builds and runs fully in a network-restricted sandbox by using
`<link>` tags for Google Fonts instead of `next/font/google` (which needs
build-time network access) and build-safe fallback values for the Firebase
client config. Once deploying somewhere with open network access:
1. Switch `src/app/layout.tsx` to `next/font/google` for `Inter`.
2. Make sure real `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`, and
   `STRIPE_*` env vars are set in your hosting provider — the app will
   throw clear, descriptive errors if any Firebase Admin credential is
   missing at request time.
