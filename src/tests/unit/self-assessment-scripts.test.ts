// @vitest-environment node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import ITEMS from "@/data/self-assessment-items.json";

const require = createRequire(import.meta.url);
const root = path.resolve(__dirname, "../../..");
const { buildBackfillRows, writeBackfillRows } = require(path.join(root, "scripts/backfill-self-assessment.cjs"));
const { longQuery, toWide, toCsv } = require(path.join(root, "scripts/export-self-assessment.cjs"));
const { readMigrationSql } = require(path.join(root, "scripts/migrate-self-assessment.cjs"));

const ids = ITEMS.map((item) => item.id);
const S1 = "b6209be8-a9be-46ed-8ed5-db73912a8fd3";
const S2 = "35b245bb-c642-43eb-8c66-e9a693a3bedf";
const all = (value: number) => Object.fromEntries(ids.map((id) => [id, value]));
let n = 0;
const log = (event_name: string, session_id: string | null, created_at: string, payload: Record<string, unknown>) => ({
  id: `cccccccc-cccc-4ccc-8ccc-${String(++n).padStart(12, "0")}`,
  event_name,
  session_id,
  created_at,
  payload,
});
const submitted = (session: string | null, phase: string, at: string, answers: Record<string, number>, order = ids) =>
  log("self_assessment_submitted", session, at, { phase, answers, order, userAgent: "UA", screenSize: "402x714" });

// Shaped like the 5 real rows on the 233 research DB, plus the edge cases the backfill must handle
const logs = [
  log("self_assessment_start", S1, "2026-10-20T07:52:00Z", { phase: "pre" }),
  submitted(S1, "pre", "2026-10-20T07:54:01Z", { ...all(4), "sa-01": 1 }, [...ids].reverse()),
  submitted(S1, "post", "2026-10-20T07:58:53Z", all(4)),
  submitted(S2, "pre", "2026-10-21T07:59:18Z", all(5)),
  submitted(S2, "post", "2026-10-21T08:03:36Z", all(5)),
  submitted(S2, "post", "2026-10-21T08:10:46Z", all(5), [...ids].reverse()), // repeat post (before the once-only rule)
  submitted(S2, "post", "2026-10-21T08:10:50Z", all(5), [...ids].reverse()), // offline-queue resend of the line above
  log("self_assessment_dev_skip", S2, "2026-10-21T09:00:00Z", { phase: "pre" }),
  submitted(S2, "pre", "2026-10-21T09:00:01Z", all(2)),
  submitted(S2, "pre", "2026-10-21T09:05:00Z", { ...all(3), "sa-02": 7 }),
  submitted(null, "pre", "2026-10-21T09:06:00Z", all(3)),
];

describe("backfill plan from action_logs", () => {
  const plan = buildBackfillRows(logs);

  it("keeps valid submissions, drops resends, and flags dev skips", () => {
    expect(plan.rows.map((r: { phase: string; is_dev_skip: boolean }) => [r.phase, r.is_dev_skip])).toEqual([
      ["pre", false],
      ["post", false],
      ["pre", false],
      ["post", false],
      ["post", false],
      ["pre", true],
    ]);
    expect(plan.duplicatesRemoved).toBe(1);
    expect(plan.skipped.map((s: { reason: string }) => s.reason)).toEqual(["value outside 1-5", "no session_id"]);
    expect(plan.repeatedSessions).toEqual({ pre: 0, post: 1 });
  });

  it("maps answers by item id with the on-screen position and takes started_at from the start event", () => {
    const first = plan.rows[0];
    expect(first.submission_uuid).toBe(first.source_log_id);
    expect(first.started_at).toBe("2026-10-20T07:52:00Z");
    expect(first.answers.find((a: { item_id: string }) => a.item_id === "sa-01")).toEqual({
      item_id: "sa-01",
      value: 1,
      shown_position: 12,
    });
    expect(first.client_meta).toEqual({ userAgent: "UA", screenSize: "402x714" });
  });
});

describe("backfill → export on the real schema (PGlite)", () => {
  let db: PGlite;
  const client = { query: (text: string, values?: unknown[]) => db.query(text, values) };

  beforeAll(async () => {
    db = new PGlite();
    await db.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
    const schema = fs.readFileSync(path.join(root, "docs/supabase-schema.sql"), "utf8");
    const migration = readMigrationSql(schema);
    expect(migration.startsWith("-- ====")).toBe(true);
    await db.exec(schema.slice(0, schema.indexOf(migration))); // existing tables only
    await db.exec(migration);
    await db.exec(migration); // re-runnable
    await db.query("INSERT INTO sessions (id, age_range, selected_district) VALUES ($1, '70-79', 'สันทราย'), ($2, 'unknown', NULL)", [S1, S2]);
  });

  it("writes once and is idempotent on re-run", async () => {
    const { rows } = buildBackfillRows(logs);
    expect(await writeBackfillRows(client, rows)).toEqual({ inserted: 6, alreadyPresent: 0 });
    expect(await writeBackfillRows(client, rows)).toEqual({ inserted: 0, alreadyPresent: 6 });
    expect((await db.query("SELECT count(*)::int AS n FROM self_assessment_answers")).rows).toEqual([{ n: 72 }]);
  });

  it("exports long rows (first attempt, no dev skip) and pivots them to one row per session", async () => {
    const long = (await db.query<Record<string, unknown>>(longQuery(), [null, null])).rows;
    expect(long).toHaveLength(4 * 12);
    expect(new Set(long.map((r) => r.source))).toEqual(new Set(["backfill"]));

    const { columns, rows } = toWide(long, ids);
    const byId = Object.fromEntries(rows.map((r: { session_id: string }) => [r.session_id, r]));
    expect(byId[S1]).toMatchObject({ pre_total: 45, post_total: 48, diff_total: 3, has_pair: true, demographics_unknown: false });
    expect(byId[S2]).toMatchObject({ pre_total: 60, post_total: 60, has_pair: true, demographics_unknown: true });
    expect(columns).toContain("pre_sa-12");
    expect(toCsv(rows, columns).split("\n")[0]).toBe(columns.join(","));

    const everything = (await db.query(longQuery({ includeDevSkip: true, allAttempts: true }), [null, null])).rows;
    expect(everything).toHaveLength(6 * 12);
    const filtered = (await db.query(longQuery(), ["2026-10-21T00:00:00Z", null])).rows;
    expect(new Set(filtered.map((r: Record<string, unknown>) => r.session_id))).toEqual(new Set([S2]));
  });
});
