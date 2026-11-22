import { defineConfig } from "drizzle-kit";

/** Migrations for Neon: `pnpm db:generate` writes SQL to drizzle/, `pnpm db:migrate` applies it. */
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});
