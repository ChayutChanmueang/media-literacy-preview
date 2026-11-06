// Link old leaderboard rows (player_info.session_id IS NULL) to the session that played them, using the
// leaderboard_score_saved event each play logged (docs/software/12-data-export-page.md §11.2).
// A row is linked only when the match is unambiguous: same game and score, logged within ±10 s, and
// neither the row nor the event fits anything else. Linked rows get session_link = 'matched'.
// Rows saved after the data-export release already carry session_id ('exact') and are not touched.
//
// Usage:
//   DATABASE_URL=postgres://... node scripts/backfill-leaderboard-session.cjs [--dry-run] [--window-sec=10]
const pg = require("pg");
require("dotenv").config();

const DEFAULT_WINDOW_MS = 10_000;

/**
 * Pure matcher. `scores`: { id, attempt_uuid, gid, score, created_at } without a session.
 * `events`: { session_id, created_at, payload } of leaderboard_score_saved.
 * Returns { matches: [{ id, session_id }], ambiguous, unmatched }.
 */
function matchScores(scores, events, windowMs = DEFAULT_WINDOW_MS) {
  const usable = events.filter((event) => event.session_id && event.payload && !event.payload.local_only);
  const time = (value) => new Date(value).getTime();

  const candidates = new Map(); // score id -> events
  const claimedBy = new Map(); // event -> score ids
  for (const score of scores) {
    // An event that recorded attempt_uuid identifies its row exactly
    const byAttempt = usable.filter((event) => event.payload.attempt_uuid && event.payload.attempt_uuid === score.attempt_uuid);
    const fits = byAttempt.length
      ? byAttempt
      : usable.filter(
          (event) =>
            !event.payload.attempt_uuid &&
            String(event.payload.game_id ?? "").toUpperCase() === String(score.gid).toUpperCase() &&
            Number(event.payload.score) === Number(score.score) &&
            Math.abs(time(event.created_at) - time(score.created_at)) <= windowMs,
        );
    candidates.set(score.id, fits);
    for (const event of fits) claimedBy.set(event, [...(claimedBy.get(event) ?? []), score.id]);
  }

  const matches = [];
  let ambiguous = 0;
  let unmatched = 0;
  for (const score of scores) {
    const fits = candidates.get(score.id);
    if (fits.length === 0) {
      unmatched += 1;
    } else if (fits.length === 1 && claimedBy.get(fits[0]).length === 1) {
      matches.push({ id: score.id, session_id: fits[0].session_id });
    } else {
      ambiguous += 1;
    }
  }
  return { matches, ambiguous, unmatched };
}

async function readInputs(db) {
  const scores = (
    await db.query(
      `SELECT id::text AS id, attempt_uuid::text AS attempt_uuid, gid, score, created_at
       FROM player_info WHERE session_id IS NULL ORDER BY created_at`,
    )
  ).rows;
  const events = (
    await db.query(
      `SELECT session_id::text AS session_id, created_at, payload
       FROM action_logs WHERE event_name = 'leaderboard_score_saved' AND session_id IS NOT NULL`,
    )
  ).rows;
  return { scores, events };
}

async function writeMatches(db, matches) {
  let updated = 0;
  for (const match of matches) {
    const result = await db.query(
      "UPDATE player_info SET session_id = $1, session_link = 'matched' WHERE id = $2 AND session_id IS NULL",
      [match.session_id, match.id],
    );
    updated += result.rowCount ?? result.affectedRows ?? 0;
  }
  return updated;
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  const windowArg = process.argv.find((arg) => arg.startsWith("--window-sec="));
  const windowMs = windowArg ? Number(windowArg.split("=")[1]) * 1000 : DEFAULT_WINDOW_MS;
  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    console.error("Error: --window-sec must be a positive number");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10000 });
  await client.connect();
  try {
    const { rows } = await client.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_schema = 'public' AND table_name = 'player_info' AND column_name = 'session_id') AS ok`,
    );
    if (!rows[0].ok) throw new Error("player_info.session_id is missing — run scripts/migrate-data-export.cjs first");

    const { scores, events } = await readInputs(client);
    const { matches, ambiguous, unmatched } = matchScores(scores, events, windowMs);
    console.log(
      `Rows without session: ${scores.length} — matched ${matches.length}, ambiguous ${ambiguous}, no match ${unmatched} ` +
        `(${events.length} leaderboard_score_saved event(s), window ±${windowMs / 1000}s)`,
    );
    if (dryRun) {
      console.log("Dry run — nothing written.");
      return;
    }
    await client.query("BEGIN");
    const updated = await writeMatches(client, matches);
    await client.query("COMMIT");
    console.log(`✅ Linked ${updated} row(s) (session_link = 'matched').`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
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

module.exports = { matchScores, readInputs, writeMatches };
