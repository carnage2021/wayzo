import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiUsage } from "@/lib/db/schema";
import { AiError } from "./client";

/** Per-user daily AI call cap (docs/AI_SPEC.md guardrail 6). One row per user per UTC day. */
export function dailyCap(): number {
  const n = Number(process.env.AI_DAILY_CALL_CAP_FREE);
  return Number.isFinite(n) && n > 0 ? n : 40;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Reserves one AI call for the user, or throws AiError("cap_reached").
 * Atomic: the increment only happens while calls < cap, so parallel requests can't overshoot.
 */
export async function reserveAiCall(userId: string, job: string): Promise<void> {
  const cap = dailyCap();
  const rows = await db()
    .insert(aiUsage)
    .values({ userId, day: today(), calls: 1, jobs: { [job]: 1 } })
    .onConflictDoUpdate({
      target: [aiUsage.userId, aiUsage.day],
      set: {
        calls: sql`${aiUsage.calls} + 1`,
        jobs: sql`jsonb_set(${aiUsage.jobs}, ${`{${job}}`}::text[], to_jsonb(coalesce((${aiUsage.jobs}->>${job})::int, 0) + 1))`,
        updatedAt: new Date(),
      },
      setWhere: sql`${aiUsage.calls} < ${cap}`,
    })
    .returning({ calls: aiUsage.calls });
  if (rows.length === 0) throw new AiError("cap_reached", `Daily AI limit of ${cap} reached`);
}

/** Adds token counts after a call (best effort; never blocks the user). */
export async function recordAiUsage(
  userId: string,
  usage: { prompt_tokens?: number; completion_tokens?: number },
  model: string,
): Promise<void> {
  try {
    await db()
      .update(aiUsage)
      .set({
        inputTokens: sql`${aiUsage.inputTokens} + ${usage.prompt_tokens ?? 0}`,
        outputTokens: sql`${aiUsage.outputTokens} + ${usage.completion_tokens ?? 0}`,
        lastModel: model,
      })
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, today())));
  } catch {
    /* usage logging must not fail the request */
  }
}
