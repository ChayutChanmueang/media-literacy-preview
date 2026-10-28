// Export research pre/post self-assessment data for analysis.
// Exported files contain research data — keep them out of the repo (docs/software/09 §9.5).
//
// Usage:
//   node scripts/export-self-assessment.cjs [--from=2026-11-01] [--to=2026-11-30] [--shape=long|wide|items]
//                                           [--include-dev-skip] [--all-attempts] [--format=csv|json] [--out=path]
//
//   --shape=long   (default) one row per answered item, with item text and the session's age/area
//   --shape=wide   one row per session: pre_* and post_* answers side by side, totals, has_pair
//   --shape=items  the item_id → text table of every item set
//   --from/--to    filter on submitted_at
//   By default dev-skip runs are left out and only the first submission per session and phase is used.
const fs = require("fs");
const path = require("path");
const pg = require("pg");
require("dotenv").config();

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = /^--([^=]+)(?:=(.*))?$/.exec(raw);
    if (match) args[match[1]] = match[2] === undefined ? true : match[2];
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

function toCsv(rows, columns = rows.length ? Object.keys(rows[0]) : []) {
  if (columns.length === 0) return "";
  const lines = rows.map((row) => columns.map((col) => csvEscape(row[col])).join(","));
  return [columns.join(","), ...lines].join("\n");
}

/** SQL for the long shape; $1/$2 are the optional from/to bounds. */
function longQuery({ includeDevSkip = false, allAttempts = false } = {}) {
  return `
    WITH picked AS (
      SELECT ${allAttempts ? "" : "DISTINCT ON (s.session_id, s.phase)"} s.*
      FROM self_assessment_submissions s
      WHERE ${includeDevSkip ? "TRUE" : "NOT s.is_dev_skip"}
        AND ($1::timestamptz IS NULL OR s.submitted_at >= $1::timestamptz)
        AND ($2::timestamptz IS NULL OR s.submitted_at <= $2::timestamptz)
      ORDER BY s.session_id, s.phase, s.submitted_at, s.received_at
    )
    SELECT p.session_id, p.submission_uuid, p.phase, p.item_set, p.source, p.is_dev_skip,
           p.started_at, p.submitted_at,
           EXTRACT(EPOCH FROM (p.submitted_at - p.started_at))::int AS duration_sec,
           a.item_id, i.text AS item_text, a.value, a.shown_position,
           ses.age_range, ses.selected_district, ses.selected_sub_district
    FROM picked p
    JOIN self_assessment_answers a ON a.submission_uuid = p.submission_uuid
    JOIN self_assessment_items i ON i.item_set = a.item_set AND i.item_id = a.item_id
    LEFT JOIN sessions ses ON ses.id = p.session_id
    ORDER BY p.session_id, p.phase DESC, a.shown_position`;
}

const iso = (value) => (value instanceof Date ? value.toISOString() : value ?? null);

/**
 * Pivots long rows (first submission per session/phase) into one row per session.
 * `itemIds` fixes the column order. Pure, so it is unit-tested directly.
 */
function toWide(longRows, itemIds) {
  const sessions = new Map();
  for (const row of longRows) {
    if (!sessions.has(row.session_id)) {
      sessions.set(row.session_id, {
        session_id: row.session_id,
        age_range: row.age_range ?? null,
        selected_district: row.selected_district ?? null,
        selected_sub_district: row.selected_sub_district ?? null,
        demographics_unknown: !row.age_range || row.age_range === "unknown",
      });
    }
    const out = sessions.get(row.session_id);
    const p = row.phase;
    out[`${p}_item_set`] = row.item_set;
    out[`${p}_source`] = row.source;
    out[`${p}_submitted_at`] = iso(row.submitted_at);
    out[`${p}_duration_sec`] = row.duration_sec ?? null;
    out[`${p}_${row.item_id}`] = Number(row.value);
  }

  const columns = ["session_id", "age_range", "selected_district", "selected_sub_district", "demographics_unknown"];
  for (const p of ["pre", "post"]) {
    columns.push(`${p}_item_set`, `${p}_source`, `${p}_submitted_at`, `${p}_duration_sec`);
    columns.push(...itemIds.map((id) => `${p}_${id}`), `${p}_total`);
  }
  columns.push("has_pair", "diff_total");

  const rows = [...sessions.values()].map((row) => {
    for (const p of ["pre", "post"]) {
      const values = itemIds.map((id) => row[`${p}_${id}`]);
      row[`${p}_total`] = values.every((v) => typeof v === "number") ? values.reduce((a, b) => a + b, 0) : null;
    }
    row.has_pair = row.pre_total !== null && row.post_total !== null;
    row.diff_total = row.has_pair ? row.post_total - row.pre_total : null;
    return row;
  });
  return { columns, rows };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  for (const key of ["from", "to"]) {
    if (args[key] && Number.isNaN(new Date(args[key]).getTime())) {
      console.error(`Error: --${key} is not a valid date (${args[key]})`);
      process.exit(1);
    }
  }
  const shape = args.shape || "long";
  if (!["long", "wide", "items"].includes(shape)) {
    console.error("Error: --shape must be long, wide or items");
    process.exit(1);
  }
  if (shape === "wide" && args["all-attempts"]) {
    console.error("Error: --shape=wide uses one submission per phase; drop --all-attempts");
    process.exit(1);
  }

  const format = args.format === "json" ? "json" : "csv";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = args.out || path.join(process.cwd(), `self-assessment-${shape}-${timestamp}.${format}`);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 10000, max: 1 });
  try {
    let rows;
    let columns;
    if (shape === "items") {
      ({ rows } = await pool.query(
        "SELECT item_set, item_id, sort_order, text FROM self_assessment_items ORDER BY item_set, sort_order",
      ));
    } else {
      const { rows: longRows } = await pool.query(
        longQuery({ includeDevSkip: !!args["include-dev-skip"], allAttempts: !!args["all-attempts"] }),
        [args.from || null, args.to || null],
      );
      if (shape === "long") {
        rows = longRows.map((row) => ({ ...row, started_at: iso(row.started_at), submitted_at: iso(row.submitted_at) }));
      } else {
        const itemSets = [...new Set(longRows.map((row) => row.item_set))];
        if (itemSets.length > 1) {
          console.error(`Error: rows span item sets ${itemSets.join(", ")} — export them separately with --from/--to`);
          process.exit(1);
        }
        const { rows: items } = await pool.query(
          "SELECT item_id FROM self_assessment_items WHERE item_set = $1 ORDER BY sort_order",
          [itemSets[0] || "sa-v1"],
        );
        ({ rows, columns } = toWide(longRows, items.map((item) => item.item_id)));
      }
    }

    const output = format === "json" ? JSON.stringify(rows, null, 2) : toCsv(rows, columns);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf8");
    console.log(`Exported ${rows.length} row(s) (${shape}) to ${outPath}`);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("Export failed:", error.message);
    process.exit(1);
  });
}

module.exports = { longQuery, toWide, toCsv };
