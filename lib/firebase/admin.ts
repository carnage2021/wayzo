import "server-only";
import { cert, getApp, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig, isFirebaseAdminConfigured } from "@/lib/env";

/**
 * Firebase Admin SDK (server only). Bypasses Firestore security rules, so every
 * caller must check access itself (see `lib/trips/access.ts`).
 *
 * Credentials, either:
 *   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'   (whole JSON)
 * or
 *   FIREBASE_CLIENT_EMAIL=... and FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
 */
function credentials(): ServiceAccount | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) {
    try {
      const parsed = JSON.parse(json) as { project_id?: string; client_email?: string; private_key?: string };
      return {
        projectId: parsed.project_id ?? firebaseConfig.projectId,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      };
    } catch {
      console.error("[firebase] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON");
      return null;
    }
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) return null;
  return { projectId: process.env.FIREBASE_PROJECT_ID ?? firebaseConfig.projectId, clientEmail, privateKey };
}

function adminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;
  if (getApps().length) return getApp();
  const creds = credentials();
  if (!creds) return null;
  return initializeApp({
    credential: cert(creds),
    projectId: creds.projectId,
    storageBucket: firebaseConfig.storageBucket || undefined,
  });
}

let settingsApplied = false;

/** Firestore, or null when credentials are missing. */
export function adminDb() {
  const app = adminApp();
  if (!app) return null;
  const db = getFirestore(app);
  if (!settingsApplied) {
    // Optional fields are written as absent instead of throwing on `undefined`.
    // settings() throws if the instance was already used (e.g. after a dev hot reload).
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      /* already configured */
    }
    settingsApplied = true;
  }
  return db;
}

/** Firebase Auth admin, or null when credentials are missing. */
export function adminAuth() {
  const app = adminApp();
  return app ? getAuth(app) : null;
}

/** Same as adminDb() but throws: for code paths that already required a signed-in user. */
export function db() {
  const d = adminDb();
  if (!d) throw new Error("Firebase Admin is not configured");
  return d;
}
