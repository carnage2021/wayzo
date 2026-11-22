import "server-only";
import { inArray } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { uploads } from "@/lib/db/schema";

/**
 * Deletes the stored files for these trips from UploadThing. Call BEFORE deleting the trips
 * (their uploads rows cascade away with them). Best effort: never blocks the deletion.
 */
export async function deleteTripFiles(tripIds: string[]): Promise<void> {
  if (!tripIds.length || !process.env.UPLOADTHING_TOKEN) return;
  try {
    const rows = await db().select({ key: uploads.key }).from(uploads).where(inArray(uploads.tripId, tripIds));
    if (rows.length) await new UTApi().deleteFiles(rows.map((r) => r.key));
  } catch (e) {
    console.error("[uploads] file cleanup failed", e instanceof Error ? e.message : e);
  }
}
