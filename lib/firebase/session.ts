/** Shared by middleware (edge, presence check only) and server code (full verification). */
export const SESSION_COOKIE = "__session";

/** Firebase allows session cookies of 5 minutes to 14 days. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
