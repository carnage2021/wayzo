import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { processUpload } from "@/lib/tickets/process";
import { memberAccess } from "@/lib/trips/access";

// Free AI models take 15–70 s per ticket (two calls when a leg looks missing).
export const maxDuration = 120;

const schema = z.object({
  key: z
    .string()
    .min(8)
    .max(200)
    .regex(/^[\w.-]+$/),
});

/** POST /api/trips/:tripId/tickets/process  { key } — reads an uploaded ticket into bookings. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const access = await memberAccess(tripId);
  if (!access) return NextResponse.json({ ok: false, error: "Trip not found." }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });

  const result = await processUpload({
    trip: access.trip,
    userId: access.user.id,
    uploadKey: parsed.data.key,
  });
  if (result.ok && (result.added.length || result.autofilled)) {
    revalidatePath(`/trips/${tripId}`, "layout");
    revalidatePath("/trips");
  }
  return NextResponse.json(result, {
    status: result.ok ? 200 : result.code === "cap_reached" ? 429 : 502,
  });
}
