import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;

/**
 * Lazily initializes the Admin SDK on first use (not at module load) so
 * that routes/pages which don't need Firebase — like /api/health — never
 * throw just because env vars are missing. Every function below throws a
 * clear, descriptive error identifying exactly which env var is absent.
 */
function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0]!;
    return _app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId) throw new Error('FIREBASE_ADMIN_PROJECT_ID is not set.');
  if (!clientEmail) throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL is not set.');
  if (!privateKeyRaw) throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set.');

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return _app;
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}
