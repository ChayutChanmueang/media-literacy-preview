// Copy pre/post self-assessment answers that were only logged to action_logs (event
// self_assessment_submitted, since v0.13.0) into self_assessment_submissions / self_assessment_answers.
//
// Usage:
//   DATABASE_URL=postgres://... node scripts/backfill-self-assessment.cjs           # dry run: report only
//   DATABASE_URL=postgres://... node scripts/backfill-self-assessment.cjs --apply   # write the rows
//
// Rows get source='backfill', app_mode NULL, item_set 'sa-v1', and submission_uuid = source_log_id =
// action_logs.id, so running it again inserts nothing new. Caveat for the research team: logs that sat in
// the offline queue carry the time they synced, not the time they were answered.
const fs = require("fs");
const path = require("path");
const pg = require("pg");
require("dotenv").config();

const ITEM_SET = "sa-v1";
const ITEM_IDS = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "src", "data", "self-assessment-items.json"), "utf8"),
).map((item) => item.id);
// The dev-skip button logs self_assessment_dev_skip right before the (random) submission
const DEV_SKIP_WINDOW_MS = 5000;

const time = (value) => new Date(value).getTime();

function checkAnswers(payload) {
  const answers = payload && payload.answers;
  const order = payload && payload.order;
  if (!answers || typeof answers !== "object" || !Array.isArray(order)) return "missing answers or order";
  const keys = Object.keys(answers);
  if (keys.length !== ITEM_IDS.length || !ITEM_IDS.every((id) => keys.includes(id))) return "answers do not match sa-v1";
  if (order.length !== ITEM_IDS.length || new Set(order).size !== order.length || !ITEM_IDS.every((id) => order.includes(id))) {
    return "order does not match sa-v1";
  }
  if (!keys.every((id) => Number.isInteger(answers[id]) && answers[id] >= 1 && answers[id] <= 5)) return "value outside 1-5";
  return null;
}

/**
 * Turns action_logs rows (self_assessment_submitted / _dev_skip / _start, any order) into backfill rows.
 * Pure: no DB access, so it is unit-tested directly.
 */
function buildBackfillRows(logs) {
  const sorted = [...logs].sort((a, b) => time(a.created_at) - time(b.created_at));
  const rows = [];
  const skipped = [];
  const seen = new Set();
  let duplicatesRemoved = 0;

  for (const log of sorted) {
    if (log.event_name !== "self_assessment_submitted") continue;
    const payload = log.payload || {};
    const phase = payload.phase;
    if (!log.session_id) {
      skipped.push({ id: log.id, reason: "no session_id" });
      continue;
    }
    if (phase !== "pre" && phase !== "post") {
      skipped.push({ id: log.id, reason: `unknown phase ${JSON.stringify(phase)}` });
      continue;
    }
    const problem = checkAnswers(payload);
    if (problem) {
      skipped.push({ id: log.id, reason: problem });
      continue;
    }

    // Offline-queue resends repeat the same answers in the same order: keep the oldest
    const fingerprint = JSON.stringify([log.session_id, phase, ITEM_IDS.map((id) => payload.answers[id]), payload.order]);
    if (seen.has(fingerprint)) {
      duplicatesRemoved++;
      continue;
    }
    seen.add(fingerprint);

    const submittedAt = time(log.created_at);
    const sameSessionPhase = (event) =>
      sorted.filter(
        (other) =>
          other.event_name === event &&
          other.session_id === log.session_id &&
          (other.payload || {}).phase === phase &&
          time(other.created_at) <= submittedAt,
      );
    const isDevSkip = sameSessionPhase("self_assessment_dev_skip").some(
      (other) => submittedAt - time(other.created_at) <= DEV_SKIP_WINDOW_MS,
    );
    const starts = sameSessionPhase("self_assessment_start");
    const startedAt = starts.length ? starts[starts.length - 1].created_at : null;

    rows.push({
      submission_uuid: log.id,
      session_id: log.session_id,
      phase,
      item_set: ITEM_SET,
      started_at: startedAt,
      submitted_at: log.created_at,
      is_dev_skip: isDevSkip,
      source_log_id: log.id,
      client_meta: {
        ...(payload.userAgent ? { userAgent: payload.userAgent } : {}),
        ...(payload.screenSize ? { screenSize: payload.screenSize } : {}),
      },
      answers: payload.order.map((itemId, index) => ({ item_id: itemId, value: payload.answers[itemId], shown_position: index + 1 })),
    });
  }

  const perPhase = {};
  for (const row of rows.filter((r) => !r.is_dev_skip)) {
    const key = `${row.session_id}:${row.phase}`;
    perPhase[key] = (perPhase[key] || 0) + 1;
  }
  const repeatedSessions = { pre: 0, post: 0 };
  for (const [key, count] of Object.entries(perPhase)) if (count > 1) repeatedSessions[key.split(":")[1]]++;

  return { rows, skipped, duplicatesRemoved, repeatedSessions };
}

/** Inserts the rows (each with its answers in one transaction). `client` is a connected pg.Client. */
async function writeBackfillRows(client, rows) {
  let inserted = 0;
  for (const row of rows) {
    await client.query("BEGIN");
    try {
      const result = await client.query(
        `INSERT INTO self_assessment_submissions
           (submission_uuid, session_id, phase, item_set, started_at, submitted_at, received_at,
            app_mode, is_dev_skip, source, source_log_id, client_meta)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NULL, $7, 'backfill', $8, $9)
         ON CONFLICT DO NOTHING
         RETURNING submission_uuid`,
        [
          row.submission_uuid, row.session_id, row.phase, row.item_set,
          row.started_at && time(row.started_at) <= time(row.submitted_at) ? row.started_at : null,
          row.submitted_at, row.is_dev_skip, row.source_log_id, JSON.stringify(row.client_meta),
        ],
      );
      if (result.rows.length > 0) {
        await client.query(
          `INSERT INTO self_assessment_answers (submission_uuid, item_set, item_id, value, shown_position)
           SELECT $1, $2, t.item_id, t.value, t.shown_position
           FROM unnest($3::text[], $4::smallint[], $5::smallint[]) AS t(item_id, value, shown_position)`,
          [
            row.submission_uuid, row.item_set,
            row.answers.map((a) => a.item_id), row.answers.map((a) => a.value), row.answers.map((a) => a.shown_position),
          ],
        );
        inserted++;
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    }
  }
  return { inserted, alreadyPresent: rows.length - inserted };
}

async function run() {
  const apply = process.argv.includes("--apply");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10000 });
  await client.connect();
  try {
    const { rows: logs } = await client.query(
      `SELECT id, session_id, event_name, payload, created_at
       FROM action_logs
       WHERE event_name IN ('self_assessment_submitted', 'self_assessment_dev_skip', 'self_assessment_start')
       ORDER BY created_at ASC`,
    );
    const plan = buildBackfillRows(logs);
    console.log(`Found ${logs.filter((l) => l.event_name === "self_assessment_submitted").length} self_assessment_submitted log(s).`);
    console.log(`  → ${plan.rows.length} to backfill (${plan.rows.filter((r) => r.is_dev_skip).length} dev skip)`);
    console.log(`  → ${plan.duplicatesRemoved} offline-queue duplicate(s) dropped, ${plan.skipped.length} skipped`);
    for (const skip of plan.skipped) console.log(`     skipped ${skip.id}: ${skip.reason}`);
    console.log(`  → sessions that did a phase more than once: pre ${plan.repeatedSessions.pre}, post ${plan.repeatedSessions.post}`);

    if (!apply) {
      console.log("Dry run — nothing written. Re-run with --apply to insert.");
      return;
    }
    const result = await writeBackfillRows(client, plan.rows);
    console.log(`✅ Inserted ${result.inserted}, already present ${result.alreadyPresent}.`);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error("❌ Backfill failed:", error.message);
    process.exit(1);
  });
}

module.exports = { buildBackfillRows, writeBackfillRows };
