import "server-only";
import type { z } from "zod";

/**
 * Server-only AI client for any OpenAI-compatible Chat Completions API
 * (OpenRouter by default; Anthropic/Gemini/OpenAI work through their compatible endpoints).
 *
 * - Tries each model in AI_MODELS in order; moves on when a model is rate-limited, down or times out.
 * - Asks for JSON via structured outputs, validates with Zod, and retries a model once with the errors.
 *
 * Env: AI_BASE_URL, AI_API_KEY, AI_MODELS (comma-separated, first = preferred).
 */
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string | ContentPart[] };

export type AiErrorCode = "not_configured" | "cap_reached" | "unavailable" | "invalid_output";
export class AiError extends Error {
  constructor(
    public code: AiErrorCode,
    message: string,
  ) {
    super(message);
  }
}

const DEFAULT_MODELS = [
  "nvidia/nemotron-3.5-super-vl:free",
  "particle-ai/particle-1:free",
  "openrouter/free",
];

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

export function modelChain(): string[] {
  const list = (process.env.AI_MODELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : DEFAULT_MODELS;
}

type Usage = { prompt_tokens?: number; completion_tokens?: number };
type CompletionResponse = {
  choices?: { message?: { content?: string | null } }[];
  usage?: Usage;
  error?: { message?: string; code?: number | string };
};

/** Pulls the first JSON object out of a reply (handles ```json fences and chatty prefixes). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text) ?? "";
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object in reply");
  return JSON.parse(body.slice(start, end + 1));
}

async function callModel(
  model: string,
  messages: ChatMessage[],
  opts: { jsonSchema: object; schemaName: string; plugins?: object[]; timeoutMs: number },
): Promise<{ ok: true; content: string; usage: Usage } | { ok: false; retryable: boolean; reason: string }> {
  let res: Response;
  try {
    res = await fetch(`${process.env.AI_BASE_URL ?? "https://openrouter.ai/api/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Wayzo",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: { name: opts.schemaName, strict: true, schema: opts.jsonSchema },
        },
        ...(opts.plugins ? { plugins: opts.plugins } : {}),
      }),
      signal: AbortSignal.timeout(opts.timeoutMs),
      cache: "no-store",
    });
  } catch (e) {
    return { ok: false, retryable: true, reason: e instanceof Error ? e.message : "network error" };
  }
  const data = (await res.json().catch(() => ({}))) as CompletionResponse;
  if (!res.ok || data.error) {
    const status = res.ok ? Number(data.error?.code) || 500 : res.status;
    // 4xx other than rate limits means this request can't work on this model (e.g. no image support).
    return { ok: false, retryable: true, reason: `${status} ${data.error?.message ?? ""}`.trim() };
  }
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { ok: false, retryable: true, reason: "empty reply" };
  return { ok: true, content, usage: data.usage ?? {} };
}

export type JsonResult<T> = { data: T; model: string; usage: Usage; attempts: string[] };

/**
 * Runs a JSON task across the model chain. Throws AiError("unavailable") if every model fails,
 * or AiError("invalid_output") if models answered but never produced valid output.
 */
export async function chatJson<T>(args: {
  messages: ChatMessage[];
  schema: z.ZodType<T>;
  jsonSchema: object;
  schemaName: string;
  plugins?: object[];
  timeoutMs?: number;
  models?: string[];
}): Promise<JsonResult<T>> {
  if (!isAiConfigured()) throw new AiError("not_configured", "AI_API_KEY is not set");
  const attempts: string[] = [];
  let sawInvalid = false;

  for (const model of args.models ?? modelChain()) {
    let messages = args.messages;
    for (let pass = 0; pass < 2; pass++) {
      const r = await callModel(model, messages, {
        jsonSchema: args.jsonSchema,
        schemaName: args.schemaName,
        plugins: args.plugins,
        timeoutMs: args.timeoutMs ?? 45_000,
      });
      if (!r.ok) {
        attempts.push(`${model}: ${r.reason.slice(0, 120)}`);
        break; // next model
      }
      try {
        const parsed = args.schema.safeParse(extractJson(r.content));
        if (parsed.success) return { data: parsed.data, model, usage: r.usage, attempts };
        sawInvalid = true;
        const issues = parsed.error.issues
          .slice(0, 6)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        attempts.push(`${model}: invalid (${issues.slice(0, 120)})`);
        messages = [
          ...args.messages,
          { role: "assistant", content: r.content.slice(0, 8000) },
          {
            role: "user",
            content: `That JSON did not match the schema (${issues}). Return only the corrected JSON.`,
          },
        ];
      } catch (e) {
        sawInvalid = true;
        attempts.push(`${model}: unparseable (${e instanceof Error ? e.message : "?"})`);
        messages = [
          ...args.messages,
          {
            role: "user",
            content: "Return only one JSON object that matches the schema, with no other text.",
          },
        ];
      }
    }
  }
  console.error("[ai] all models failed", attempts);
  throw new AiError(sawInvalid ? "invalid_output" : "unavailable", attempts.join(" | "));
}
