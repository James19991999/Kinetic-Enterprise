import { NextResponse } from 'next/server';

// Deliberately doesn't call Firebase/Stripe itself, so this stays fast and
// dependency-free — useful for verifying a fresh deployment before wiring
// up real monitoring. Reports which vars are missing, never their values.
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

export async function GET() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  return NextResponse.json({
    status: missing.length === 0 ? 'ok' : 'degraded',
    missingEnvVars: missing,
    timestamp: new Date().toISOString(),
  });
}
