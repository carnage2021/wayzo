"use client";

import { createAuthClient } from "better-auth/react";

/** Browser auth client (talks to /api/auth/*). No secrets here. */
export const authClient = createAuthClient();

/** Better Auth error codes -> friendly copy. */
export function authErrorMessage(
  code: string | undefined,
  fallback = "We couldn't sign you in. Please try again.",
): string {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "That email and password don't match. Try again or reset your password.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Sign in instead.";
    case "PASSWORD_TOO_SHORT":
      return "Use at least 8 characters.";
    case "PASSWORD_TOO_LONG":
      return "That password is too long.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "INVALID_TOKEN":
      return "This reset link has expired or was already used. Ask for a new one.";
    case "TOO_MANY_REQUESTS":
      return "Too many tries. Please wait a minute and try again.";
    default:
      return fallback;
  }
}
