// Deletes the demo trip (and its UploadThing files) of the demo account only.
const fs = require("fs");
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim(); });
const { neon } = require("@neondatabase/serverless");
const { UTApi } = require("uploadthing/server");
const id = process.argv[2];
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const t = await sql`select t.id from trips t join profiles p on p.id = t.owner_id where t.id = ${id} and p.email = 'maya.wayzo.demo@example.com'`;
  if (!t.length) throw new Error("not a demo trip");
  const keys = (await sql`select key from uploads where trip_id = ${id}`).map((r) => r.key);
  if (keys.length) await new UTApi().deleteFiles(keys);
  await sql`delete from trips where id = ${id}`;
  console.log("deleted trip", id, "files", keys.length);
})();
