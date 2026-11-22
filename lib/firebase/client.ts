"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  inMemoryPersistence,
  initializeAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { firebaseConfig } from "@/lib/env";

/**
 * Browser Firebase Auth, used ONLY to sign in. The browser keeps no auth state
 * (in-memory persistence): we swap the ID token for an httpOnly session cookie
 * and sign the browser out again. All data access happens on the server.
 */
let auth: Auth | undefined;
function clientAuth(): Auth {
  if (auth) return auth;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  return auth;
}

const EMAIL_KEY = "wayzo:signin-email";

export async function sendEmailLink(email: string, next: string) {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", next);
  await sendSignInLinkToEmail(clientAuth(), email, { url: url.toString(), handleCodeInApp: true });
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function isEmailLink(href: string) {
  return isSignInWithEmailLink(clientAuth(), href);
}

export function rememberedEmail(): string | null {
  return window.localStorage.getItem(EMAIL_KEY);
}

export async function completeEmailLink(email: string, href: string) {
  const cred = await signInWithEmailLink(clientAuth(), email, href);
  window.localStorage.removeItem(EMAIL_KEY);
  return createSession(cred.user);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(clientAuth(), provider);
  return createSession(cred.user);
}

/** Exchanges the fresh ID token for the server session cookie. Returns where to go next. */
async function createSession(user: User): Promise<{ onboarded: boolean }> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  await signOut(clientAuth()).catch(() => undefined);
  if (!res.ok) throw new Error("session");
  return (await res.json()) as { onboarded: boolean };
}

/** Maps Firebase error codes to friendly copy. */
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow pop-ups and try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
    case "auth/quota-exceeded":
      return "Too many tries. Please wait a minute and try again.";
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "That sign-in link has expired or was already used. Send yourself a new one.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled yet in Firebase.";
    case "auth/unauthorized-domain":
    case "auth/unauthorized-continue-uri":
      return "This website isn't on Firebase's list of authorised domains yet.";
    case "auth/network-request-failed":
      return "You seem to be offline. Check your connection and try again.";
    default:
      return "We couldn't sign you in. Please try again.";
  }
}
