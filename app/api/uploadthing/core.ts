import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { memberAccess } from "@/lib/trips/access";

const f = createUploadthing();

/**
 * Upload routes. The middleware checks the user is a member of the trip; the completion
 * callback records the file so /api/trips/:id/tickets/process can trust who uploaded it.
 */
export const fileRouter = {
  ticket: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    image: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .input(z.object({ tripId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const access = await memberAccess(input.tripId);
      if (!access) throw new UploadThingError("You're not a member of this trip.");
      return { userId: access.user.id, tripId: input.tripId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db()
        .insert(uploads)
        .values({
          key: file.key,
          tripId: metadata.tripId,
          userId: metadata.userId,
          kind: "ticket",
          url: file.ufsUrl,
          name: file.name.slice(0, 200),
          mime: file.type,
          size: file.size,
        })
        .onConflictDoNothing();
      return { key: file.key };
    }),
} satisfies FileRouter;

export type WayzoFileRouter = typeof fileRouter;
