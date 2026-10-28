// Create the research pre/post self-assessment tables, views and the sa-v1 item seed on an existing DB.
// Runs the "Research mode: pre/post self-assessment" block at the end of docs/supabase-schema.sql in one
// transaction; every statement is IF NOT EXISTS / CREATE OR REPLACE / ON CONFLICT DO NOTHING, so re-running is safe.
//
// Usage:
//   DATABASE_URL=postgres://... node scripts/migrate-self-assessment.cjs [--print]
//   --print   print the SQL instead of running it (e.g. to paste into Supabase Studio)
const fs = require("fs");
const path = require("path");
const pg = require("pg");
require("dotenv").config();

const SCHEMA_PATH = path.join(__dirname, "..", "docs", "supabase-schema.sql");
// \r? because a Windows checkout gives the schema file CRLF line endings
const BLOCK_START = /^-- =+\r?\n-- Research mode: pre\/post self-assessment\r?$/m;

function readMigrationSql(schemaSql = fs.readFileSync(SCHEMA_PATH, "utf8")) {
  const match = BLOCK_START.exec(schemaSql);
  if (!match) throw new Error(`Self-assessment block not found in ${SCHEMA_PATH}`);
  return schemaSql.slice(match.index);
}

async function run() {
  const sql = readMigrationSql();
  if (process.argv.includes("--print")) {
    process.stdout.write(sql);
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10000 });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    const { rows } = await client.query(
      `SELECT (SELECT count(*) FROM self_assessment_items WHERE item_set = 'sa-v1')::int AS items,
              (SELECT count(*) FROM self_assessment_submissions)::int AS submissions`,
    );
    console.log(`✅ Self-assessment schema ready: sa-v1 has ${rows[0].items} items, ${rows[0].submissions} submission(s) stored.`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  });
}

module.exports = { readMigrationSql };
