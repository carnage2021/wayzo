import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon Postgres over HTTP (works in serverless functions without a connection pool).
 * Multi-statement writes use db.batch([...]), which runs as one transaction.
 */
let instance: NeonHttpDatabase<typeof schema> | undefined;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function db(): NeonHttpDatabase<typeof schema> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  instance ??= drizzle(neon(process.env.DATABASE_URL), { schema });
  return instance;
}

export { schema };
