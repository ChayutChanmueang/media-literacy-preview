// Export raw rows from `action_logs` to a local CSV/JSON file for offline analysis.
//
// Usage:
//   node scripts/export-action-logs.cjs [--from=2026-07-01] [--to=2026-07-19] [--event=tap_hotspot]
//                                       [--session=<uuid>] [--format=csv|json] [--out=path/to/file]
const pg = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(raw);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  let str;
  if (value instanceof Date) str = value.toISOString();
  else if (typeof value === "object") str = JSON.stringify(value);
  else str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => csvEscape(row[col])).join(","));
  return [header, ...lines].join("\n");
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  for (const key of ["from", "to"]) {
    if (args[key] && Number.isNaN(new Date(args[key]).getTime())) {
      console.error(`Error: --${key} is not a valid date (${args[key]})`);
      process.exit(1);
    }
  }

  const format = args.format === "json" ? "json" : "csv";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = args.out || path.join(process.cwd(), `action-logs-export-${timestamp}.${format}`);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
  }

  const conditions = [];
  const params = [];
  if (args.from) {
    params.push(args.from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (args.to) {
    params.push(args.to);
    conditions.push(`created_at <= $${params.length}`);
  }
  if (args.event) {
    params.push(args.event);
    conditions.push(`event_name = $${params.length}`);
  }
  if (args.session) {
    params.push(args.session);
    conditions.push(`session_id = $${params.length}`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 10000, max: 1 });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    const result = await pool.query(
      `SELECT id, session_id, event_name, page_url, payload, created_at
       FROM action_logs
       ${whereClause}
       ORDER BY created_at ASC;`,
      params
    );

    const output = format === "json" ? JSON.stringify(result.rows, null, 2) : toCsv(result.rows);
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`Exported ${result.rows.length} row(s) to ${outPath}`);
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Export failed:", error.message);
  process.exit(1);
});
