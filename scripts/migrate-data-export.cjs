// Prepare a database for the staff data export page (docs/software/12-data-export-page.md):
// adds player_info.session_id / session_link and the data_export_audit table.
// Runs the "Staff data export" block of docs/supabase-schema.sql in one transaction; every statement is
// IF NOT EXISTS, so re-running is safe. Run on BOTH databases (normal 202 + research 233) BEFORE deploying
// the image that writes player_info.session_id.
//
// Usage:
//   DATABASE_URL=postgres://... node scripts/migrate-data-export.cjs [--print]
//   --print   print the SQL instead of running it (e.g. to paste into Supabase Studio)
const fs = require("fs");
const path = require("path");
const pg = require("pg");
require("dotenv").config();

const SCHEMA_PATH = path.join(__dirname, "..", "docs", "supabase-schema.sql");
// \r? because a Windows checkout gives the schema file CRLF line endings
const BLOCK_START = /^-- =+\r?\n-- Staff data export\b.*\r?$/m;
const NEXT_BLOCK = /^-- =+\r?\n-- Research mode: pre\/post self-assessment\r?$/m;

function readMigrationSql(schemaSql = fs.readFileSync(SCHEMA_PATH, "utf8")) {
  const start = BLOCK_START.exec(schemaSql);
  if (!start) throw new Error(`Staff data export block not found in ${SCHEMA_PATH}`);
  const rest = schemaSql.slice(start.index);
  const end = NEXT_BLOCK.exec(rest);
  return end ? rest.slice(0, end.index) : rest;
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
      `SELECT (SELECT count(*) FROM player_info)::int AS scores,
              (SELECT count(*) FROM player_info WHERE session_id IS NULL)::int AS without_session`,
    );
    console.log(
      `✅ Data export schema ready: player_info has ${rows[0].scores} row(s), ${rows[0].without_session} without session_id` +
        (rows[0].without_session ? " — run scripts/backfill-leaderboard-session.cjs --dry-run next." : "."),
    );
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
