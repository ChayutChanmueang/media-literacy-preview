// @vitest-environment node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getExportMode, hasExporterRole, isDataExportEnabled, safeAdminNext } from "@/lib/adminAuth";
import { csvCell, toCsv } from "@/lib/export/csv";
import { readCounts, readDbFacts, type Queryable } from "@/lib/export/queries";
import { DATASETS } from "@/lib/export/registry";
import { buildReadme, datasetAvailability, dbMatchesMode, ExportError, runExport } from "@/lib/export/run";
import { dataExportRequestSchema, type DataExportRequest } from "@/lib/validations";
import ITEMS from "@/data/self-assessment-items.json";

const require = createRequire(import.meta.url);
const root = path.resolve(__dirname, "../../..");
const { readMigrationSql } = require(path.join(root, "scripts/migrate-data-export.cjs"));
const { matchScores, writeMatches } = require(path.join(root, "scripts/backfill-leaderboard-session.cjs"));
const { longQuery, toWide } = require(path.join(root, "scripts/export-self-assessment.cjs"));

const schema = fs.readFileSync(path.join(root, "docs/supabase-schema.sql"), "utf8");
const RESEARCH_BLOCK = /^-- =+\r?\n-- Research mode: pre\/post self-assessment\r?$/m;
const schemaWithoutResearch = schema.slice(0, RESEARCH_BLOCK.exec(schema)!.index);

/** Minimal RFC 4180 parser for the CSV the export writes (BOM, CRLF, quoted cells). */
function parseCsv(text: string): Record<string, string>[] {
  const body = text.replace(/^﻿/, "");
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quoted) {
      if (ch === '"' && body[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      record.push(field);
      field = "";
    } else if (ch === "\r" && body[i + 1] === "\n") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
      i++;
    } else field += ch;
  }
  const [header, ...rows] = records;
  return rows.map((row) => Object.fromEntries(header.map((column, i) => [column, row[i]])));
}
const headerOf = (text: string) => text.replace(/^﻿/, "").split("\r\n")[0].split(",");

const ids = ITEMS.map((item) => item.id);
const PAIR = "11111111-1111-4111-8111-111111111111"; // registered, pre + post complete
const PRE_ONLY = "22222222-2222-4222-8222-222222222222"; // registered, pre only, plus a dev-skip run
const LOG_ONLY = "33333333-3333-4333-8333-333333333333"; // events before consent → placeholder sessions row
const LANDING = "44444444-4444-4444-8444-444444444444"; // landed, never registered
const NOBODY = "55555555-5555-4555-8555-555555555555";

const base = (r: DataExportRequest | Record<string, unknown>) => dataExportRequestSchema.parse(r);

async function makeDb(withResearch: boolean) {
  const db = new PGlite();
  await db.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
  await db.exec(withResearch ? schema : schemaWithoutResearch);
  await db.query(
    `INSERT INTO sessions (id, age_range, selected_district, selected_sub_district, created_at) VALUES
       ($1, '60-69', 'เมืองเชียงใหม่', 'สุเทพ', '2026-11-02T02:00:00Z'),
       ($2, '70-79', NULL, NULL, '2026-11-02T03:00:00Z'),
       ($3, 'unknown', NULL, NULL, '2026-11-02T04:00:00Z'),
       ($4, 'unknown', NULL, NULL, '2026-11-01T01:00:00Z')`,
    [PAIR, PRE_ONLY, LOG_ONLY, LANDING],
  );
  const log = (session: string, event: string, at: string, payload: Record<string, unknown> = {}) =>
    db.query("INSERT INTO action_logs (session_id, event_name, created_at, payload) VALUES ($1, $2, $3, $4)", [
      session,
      event,
      at,
      JSON.stringify(payload),
    ]);
  await log(PAIR, "landing_page_view", "2026-11-02T02:00:01Z");
  await log(PAIR, "consent_page_view", "2026-11-02T02:00:10Z");
  await log(PAIR, "consent_submitted", "2026-11-02T02:01:00Z", {
    age_range: "60-69",
    province: "เชียงใหม่",
    district: "เมืองเชียงใหม่",
    sub_district: "สุเทพ",
  });
  await log(PAIR, "play_video", "2026-11-02T02:10:00Z", { note: '=HYPERLINK("x"), with "quotes"' });
  await log(PAIR, "course_completion_view", "2026-11-03T02:00:00Z");
  await log(PRE_ONLY, "consent_submitted", "2026-11-02T03:01:00Z", {
    age_range: "70-79",
    province: "แพร่",
    district: "เมืองแพร่",
    sub_district: "ในเวียง",
  });
  await log(PRE_ONLY, "lessons_dashboard_view", "2026-11-02T03:02:00Z");
  await log(LOG_ONLY, "play_video", "2026-11-02T04:00:00Z");
  await log(LANDING, "landing_page_view", "2026-11-01T01:00:00Z");
  await db.query("INSERT INTO action_logs (session_id, event_name) VALUES (NULL, 'orphan')");

  await db.query(
    `INSERT INTO lesson_progress (session_id, lesson_id, video_completed_at, game_completed_at) VALUES
       ($1, 'topic-1', '2026-11-02T02:10:00Z', '2026-11-02T02:20:00Z'),
       ($1, 'topic-6', '2026-11-02T02:30:00Z', '2026-11-02T02:40:00Z'),
       ($1, 'topic-3', '2026-11-02T02:50:00Z', '2026-11-02T03:00:00Z'),
       ($1, 'topic-2', '2026-11-02T03:10:00Z', NULL)`,
    [PAIR],
  );

  // Leaderboard: one linked play, one old play the export can't attribute
  await db.query(
    `INSERT INTO player_info (name, gid, score, player_uuid, attempt_uuid, session_id, session_link, created_at) VALUES
       ('=cmd', 'G13', 120, gen_random_uuid(), gen_random_uuid(), $1, 'exact', '2026-11-02T05:00:00Z'),
       ('old', 'G13', 80, gen_random_uuid(), gen_random_uuid(), NULL, NULL, '2026-10-01T05:00:00Z')`,
    [PRE_ONLY],
  );

  if (withResearch) {
    const submit = async (session: string, phase: string, at: string, value: (i: number) => number, devSkip = false) => {
      const uuid = (
        await db.query<{ u: string }>(
          `INSERT INTO self_assessment_submissions
             (submission_uuid, session_id, phase, item_set, started_at, submitted_at, app_mode, is_dev_skip)
           VALUES (gen_random_uuid(), $1, $2, 'sa-v1', $3::timestamptz - interval '90 seconds', $3, 'research', $4)
           RETURNING submission_uuid::text AS u`,
          [session, phase, at, devSkip],
        )
      ).rows[0].u;
      for (const [i, id] of ids.entries()) {
        await db.query(
          "INSERT INTO self_assessment_answers (submission_uuid, item_set, item_id, value, shown_position) VALUES ($1, 'sa-v1', $2, $3, $4)",
          [uuid, id, value(i), i + 1],
        );
      }
    };
    await submit(PAIR, "pre", "2026-11-02T02:05:00Z", (i) => (i === 0 ? 1 : 3));
    await submit(PAIR, "post", "2026-11-03T01:55:00Z", () => 4);
    await submit(PRE_ONLY, "pre", "2026-11-02T03:05:00Z", () => 5);
    await submit(PRE_ONLY, "post", "2026-11-02T03:06:00Z", () => 1, true); // dev skip — never exported
  }
  return db;
}

describe("csv", () => {
  it("writes BOM, CRLF and RFC 4180 quoting", () => {
    const text = toCsv(["a", "b"], [{ a: 'x,"y"', b: null }, { a: { k: 1 }, b: true }]);
    expect(text).toBe('﻿a,b\r\n"x,""y""",\r\n"{""k"":1}",true\r\n');
  });

  it("neutralises spreadsheet formulas but keeps numbers", () => {
    expect(csvCell("=cmd|' /C calc'!A0")).toBe("'=cmd|' /C calc'!A0");
    expect(csvCell("+1")).toBe("'+1");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvCell("-1")).toBe("-1");
    expect(csvCell(-1)).toBe("-1");
    expect(csvCell("-x")).toBe("'-x");
  });
});

describe("request validation", () => {
  it("accepts a minimal request and fills defaults", () => {
    expect(base({ scope: { type: "all" }, groups: ["age"] })).toEqual({
      scope: { type: "all" },
      row_filter: { registered_only: false, self_assessment_pair_only: false },
      groups: ["age"],
      group_options: { self_assessment_items: true },
      files: [],
    });
  });

  it.each([
    [{ scope: { type: "all" } }, "nothing selected"],
    [{ scope: { type: "session", session_id: "nope" }, groups: ["age"] }, "bad uuid"],
    [{ scope: { type: "all" }, groups: ["gender"] }, "unknown group"],
    [{ scope: { type: "all" }, groups: ["age", "age"] }, "duplicate"],
    [{ scope: { type: "all" }, groups: ["age"], extra: 1 }, "extra field"],
  ])("rejects %j (%s)", (body) => {
    expect(dataExportRequestSchema.safeParse(body).success).toBe(false);
  });

  it("trims a pasted session id", () => {
    expect(base({ scope: { type: "session", session_id: `  ${PAIR} ` }, groups: ["age"] }).scope).toEqual({
      type: "session",
      session_id: PAIR,
    });
  });
});

describe("admin auth helpers", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("needs app_metadata.role = data_exporter", () => {
    expect(hasExporterRole({ role: "data_exporter" })).toBe(true);
    expect(hasExporterRole({ role: "admin" })).toBe(false);
    expect(hasExporterRole(undefined)).toBe(false);
  });

  it("only redirects inside /admin after login", () => {
    expect(safeAdminNext("/admin/data-export")).toBe("/admin/data-export");
    expect(safeAdminNext("https://evil.example")).toBe("/admin/data-export");
    expect(safeAdminNext("//evil.example")).toBe("/admin/data-export");
    expect(safeAdminNext("/admin/login")).toBe("/admin/data-export");
    expect(safeAdminNext(undefined)).toBe("/admin/data-export");
  });

  it("is enabled only when Supabase Auth is configured", () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "key");
    expect(isDataExportEnabled()).toBe(false);
    vi.stubEnv("SUPABASE_URL", "http://supabase:8000");
    expect(isDataExportEnabled()).toBe(true);
  });

  it("takes the mode from APP_MODE only", () => {
    vi.stubEnv("APP_MODE", "research");
    expect(getExportMode()).toBe("research");
    vi.stubEnv("APP_MODE", "");
    expect(getExportMode()).toBe("normal");
  });
});

describe("export on a research DB (PGlite)", () => {
  let db: PGlite;
  let q: Queryable;
  beforeAll(async () => {
    db = await makeDb(true);
    q = { query: (text, values) => db.query(text, values as unknown[]) };
  });

  const run = async (request: Record<string, unknown>) => {
    const facts = await readDbFacts(q);
    return runExport(q, base(request), { mode: "research", facts });
  };

  it("knows what this DB has", async () => {
    const facts = await readDbFacts(q);
    expect(facts).toEqual({ hasSelfAssessment: true, hasLeaderboardSessionColumn: true, hasAuditTable: true });
    expect(dbMatchesMode("research", facts)).toBe(true);
    const availability = Object.fromEntries(datasetAvailability("research", facts).map((a) => [a.id, a]));
    expect(availability.self_assessment.available).toBe(true);
    expect(availability.leaderboard).toEqual({ id: "leaderboard", available: false, reason: "other_mode" });
    expect(await readCounts(q)).toEqual({ sessionCount: 4, eventCount: 10 });
  });

  it("age + location + pre/post → one participants.csv, one row per person, columns as in the spec", async () => {
    const result = await run({
      scope: { type: "all" },
      groups: ["self_assessment", "location", "age"],
      group_options: { self_assessment_items: false },
    });
    expect(result.files.map((f) => f.name)).toEqual(["participants"]);
    const csv = result.files[0].csv;
    expect(headerOf(csv)).toEqual([
      "session_id",
      "age_range",
      "province",
      "district",
      "sub_district",
      "sa_item_set",
      "sa_pre_submitted_at",
      "sa_pre_duration_sec",
      "sa_pre_total",
      "sa_pre_straight_line",
      "sa_post_submitted_at",
      "sa_post_duration_sec",
      "sa_post_total",
      "sa_post_straight_line",
      "sa_diff",
      "sa_has_pair",
    ]);
    const rows = parseCsv(csv);
    expect(rows.map((r) => r.session_id)).toEqual([LANDING, PAIR, PRE_ONLY, LOG_ONLY]); // oldest first
    const pair = rows.find((r) => r.session_id === PAIR)!;
    expect(pair).toMatchObject({
      age_range: "60-69",
      province: "เชียงใหม่",
      district: "เมืองเชียงใหม่",
      sa_pre_submitted_at: "2026-11-02T09:05:00+07:00",
      sa_pre_duration_sec: "90",
      sa_pre_total: String(1 + 3 * 11),
      sa_pre_straight_line: "false",
      sa_post_total: "48",
      sa_post_straight_line: "true",
      sa_diff: String(48 - 34),
      sa_has_pair: "true",
    });
    const preOnly = rows.find((r) => r.session_id === PRE_ONLY)!;
    expect(preOnly).toMatchObject({ province: "แพร่", sa_pre_total: "60", sa_post_total: "", sa_has_pair: "false" });
    expect(rows.find((r) => r.session_id === LOG_ONLY)).toMatchObject({ age_range: "", province: "", sa_has_pair: "false" });
  });

  it("matches scripts/export-self-assessment.cjs totals", async () => {
    const long = (await db.query<Record<string, unknown>>(longQuery(), [null, null])).rows;
    const script = Object.fromEntries(
      toWide(long, ids).rows.map((r: Record<string, unknown>) => [r.session_id, [r.pre_total, r.post_total]]),
    );
    const rows = parseCsv((await run({ scope: { type: "all" }, groups: ["self_assessment"] })).files[0].csv);
    for (const row of rows.filter((r) => script[r.session_id])) {
      const [pre, post] = script[row.session_id];
      expect([row.sa_pre_total, row.sa_post_total]).toEqual([pre ?? "", post ?? ""].map(String));
    }
    expect(headerOf((await run({ scope: { type: "all" }, groups: ["self_assessment"] })).files[0].csv)).toContain("sa_post_12");
  });

  it("filters rows the same way in every file", async () => {
    const result = await run({
      scope: { type: "all" },
      row_filter: { registered_only: true, self_assessment_pair_only: true },
      groups: ["age", "self_assessment"],
      files: ["event_log", "usage_detail"],
    });
    for (const file of result.files) {
      const owners = new Set(parseCsv(file.csv).map((r) => r.session_id));
      expect(owners).toEqual(new Set([PAIR]));
    }
  });

  it("scope = session returns only that person, in every file", async () => {
    const result = await run({
      scope: { type: "session", session_id: PRE_ONLY },
      groups: ["age", "usage_summary", "event_breakdown", "completion_funnel", "lesson_progress"],
      files: ["event_log", "usage_detail"],
    });
    expect(result.files.map((f) => f.name)).toEqual(["participants", "event_log", "usage_daily", "usage_monthly"]);
    for (const file of result.files) {
      const rows = parseCsv(file.csv);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every((r) => r.session_id === PRE_ONLY)).toBe(true);
    }
  });

  it("every row of every file has an owner", async () => {
    const result = await run({
      scope: { type: "all" },
      groups: ["age", "location", "self_assessment", "usage_summary", "event_breakdown", "completion_funnel", "lesson_progress"],
      files: ["event_log", "usage_detail"],
    });
    for (const file of result.files) {
      expect(headerOf(file.csv)[0]).toBe("session_id");
      expect(parseCsv(file.csv).every((r) => /^[0-9a-f-]{36}$/.test(r.session_id))).toBe(true);
    }
    expect(parseCsv(result.files.find((f) => f.name === "event_log")!.csv)).toHaveLength(9); // orphan event left out
  });

  it("builds the research funnel, event counts and lesson columns", async () => {
    const result = await run({
      scope: { type: "all" },
      groups: ["event_breakdown", "completion_funnel", "lesson_progress"],
    });
    const csv = result.files[0].csv;
    const header = headerOf(csv);
    expect(header).toContain("funnel_sa_pre_at");
    expect(header).not.toContain("funnel_lessons_dashboard_at");
    expect(header.filter((c) => c.startsWith("lesson_topic_")).slice(0, 6)).toEqual([
      "lesson_topic_1_video_at",
      "lesson_topic_1_game_at",
      "lesson_topic_6_video_at",
      "lesson_topic_6_game_at",
      "lesson_topic_3_video_at",
      "lesson_topic_3_game_at",
    ]);
    const pair = parseCsv(csv).find((r) => r.session_id === PAIR)!;
    expect(pair).toMatchObject({
      ev_play_video: "1",
      ev_lessons_dashboard_view: "0",
      funnel_landing_at: "2026-11-02T09:00:01+07:00",
      funnel_sa_pre_at: "2026-11-02T09:05:00+07:00",
      funnel_all_lessons_done_at: "2026-11-02T10:00:00+07:00",
      funnel_sa_post_at: "2026-11-03T08:55:00+07:00",
      funnel_furthest_step: "completion_view",
      lessons_completed: "3",
      lesson_topic_2_game_at: "",
    });
  });

  it("neutralises formulas that came from user input", async () => {
    const result = await run({ scope: { type: "session", session_id: PAIR }, files: ["event_log"] });
    const video = parseCsv(result.files[0].csv).find((r) => r.event_name === "play_video")!;
    expect(JSON.parse(video.payload)).toEqual({ note: '=HYPERLINK("x"), with "quotes"' });
  });

  it("refuses a dataset this site doesn't have, and an unknown session", async () => {
    await expect(run({ scope: { type: "all" }, files: ["leaderboard"] })).rejects.toMatchObject({
      code: "dataset_unavailable",
      dataset: "leaderboard",
    });
    await expect(run({ scope: { type: "session", session_id: NOBODY }, groups: ["age"] })).rejects.toBeInstanceOf(ExportError);
  });

  it("writes a README with the column dictionary and item texts", async () => {
    const result = await run({ scope: { type: "all" }, groups: ["age"], files: ["event_log"] });
    const readme = buildReadme(result, ["a.csv", "b.csv"], {
      mode: "research",
      generatedAt: "2026-11-06T14:05:00+07:00",
      exportedBy: "staff@example.com",
      scopeText: "ทุกคน",
      filters: [],
    });
    expect(readme).toContain("a.csv — 4 แถว");
    expect(readme).toContain("session_id");
    expect(readme).toContain(ITEMS[0].text);
  });
});

describe("export on a normal-mode DB (PGlite, no self-assessment tables)", () => {
  let q: Queryable;
  beforeAll(async () => {
    const db = await makeDb(false);
    q = { query: (text, values) => db.query(text, values as unknown[]) };
  });

  const run = async (request: Record<string, unknown>) =>
    runExport(q, base(request), { mode: "normal", facts: await readDbFacts(q) });

  it("lists every dataset, with self-assessment unavailable (other mode)", async () => {
    const facts = await readDbFacts(q);
    expect(facts.hasSelfAssessment).toBe(false);
    const availability = datasetAvailability("normal", facts);
    expect(availability.map((a) => a.id)).toEqual(DATASETS.map((d) => d.id));
    expect(availability.find((a) => a.id === "self_assessment")).toEqual({
      id: "self_assessment",
      available: false,
      reason: "other_mode",
    });
    expect(availability.find((a) => a.id === "leaderboard")?.available).toBe(true);
    await expect(run({ scope: { type: "all" }, groups: ["self_assessment"] })).rejects.toMatchObject({
      code: "dataset_unavailable",
    });
  });

  it("flags a research site pointed at a DB without the research tables", async () => {
    expect(dbMatchesMode("research", await readDbFacts(q))).toBe(false);
  });

  it("exports leaderboard plays; unattributed rows only when exporting everyone", async () => {
    const all = await run({ scope: { type: "all" }, files: ["leaderboard"] });
    const rows = parseCsv(all.files[0].csv);
    expect(rows.map((r) => r.session_link).sort()).toEqual(["exact", "none"]);
    expect(rows.find((r) => r.session_link === "exact")).toMatchObject({ session_id: PRE_ONLY, player_name: "'=cmd" });

    const filtered = await run({ scope: { type: "all" }, row_filter: { registered_only: true }, files: ["leaderboard"] });
    expect(parseCsv(filtered.files[0].csv).map((r) => r.session_link)).toEqual(["exact"]);
    expect(filtered.notes[0]).toContain("1 แถว");
  });

  it("builds the normal-mode funnel", async () => {
    const result = await run({ scope: { type: "session", session_id: PRE_ONLY }, groups: ["completion_funnel"] });
    const header = headerOf(result.files[0].csv);
    expect(header).toContain("funnel_lessons_dashboard_at");
    expect(header).toContain("funnel_leaderboard_view_at");
    expect(header).not.toContain("funnel_sa_pre_at");
    expect(parseCsv(result.files[0].csv)[0].funnel_furthest_step).toBe("lessons_dashboard");
  });
});

describe("migration + leaderboard backfill", () => {
  it("the data-export block runs on an existing DB and is re-runnable", async () => {
    const db = new PGlite();
    await db.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
    const block = readMigrationSql(schema);
    expect(block).toMatch(/^-- =+\r?\n-- Staff data export/);
    expect(block).not.toMatch(/Research mode/);
    await db.exec(schemaWithoutResearch.slice(0, schemaWithoutResearch.indexOf(block)));
    await db.exec(block);
    await db.exec(block);
    expect((await readDbFacts({ query: (t, v) => db.query(t, v as unknown[]) })).hasAuditTable).toBe(true);
  });

  it("links only unambiguous matches", () => {
    const at = (s: number) => new Date(Date.UTC(2026, 9, 1, 5, 0, s)).toISOString();
    const scores = [
      { id: "a", attempt_uuid: "x1", gid: "G13", score: 100, created_at: at(0) }, // one event fits
      { id: "b", attempt_uuid: "x2", gid: "G13", score: 50, created_at: at(0) }, // two events fit → ambiguous
      { id: "c", attempt_uuid: "x3", gid: "G17", score: 10, created_at: at(0) }, // event too late
      { id: "d", attempt_uuid: "x4", gid: "G18", score: 7, created_at: at(0) }, // event carries attempt_uuid
    ];
    const events = [
      { session_id: "s1", created_at: at(2), payload: { game_id: "G13", score: 100 } },
      { session_id: "s2", created_at: at(1), payload: { game_id: "G13", score: 50 } },
      { session_id: "s3", created_at: at(3), payload: { game_id: "G13", score: 50 } },
      { session_id: "s4", created_at: at(30), payload: { game_id: "G17", score: 10 } },
      { session_id: "s5", created_at: at(59), payload: { game_id: "G18", score: 7, attempt_uuid: "x4" } },
      { session_id: "s6", created_at: at(0), payload: { game_id: "G13", score: 100, local_only: true } },
    ];
    expect(matchScores(scores, events)).toEqual({
      matches: [
        { id: "a", session_id: "s1" },
        { id: "d", session_id: "s5" },
      ],
      ambiguous: 1,
      unmatched: 1,
    });
  });

  it("writes matches without touching rows that already have a session", async () => {
    const db = await makeDb(false);
    const q = { query: (text: string, values?: unknown[]) => db.query(text, values) };
    const old = (await db.query<{ id: string }>("SELECT id::text AS id FROM player_info WHERE session_id IS NULL")).rows[0];
    expect(await writeMatches(q, [{ id: old.id, session_id: LANDING }])).toBe(1);
    expect(await writeMatches(q, [{ id: old.id, session_id: PAIR }])).toBe(0);
    const row = (await db.query("SELECT session_id::text AS s, session_link FROM player_info WHERE id = $1", [old.id])).rows[0];
    expect(row).toEqual({ s: LANDING, session_link: "matched" });
  });
});

describe("/admin is reachable by URL only", () => {
  it("no page or component outside the admin area links to /admin", () => {
    const src = path.join(root, "src");
    const allowed = ["app/admin/", "app/api/admin/", "components/admin/", "lib/", "proxy.ts", "tests/", "components/AppLayout.tsx"];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (/\.(tsx?|jsx?)$/.test(name)) {
          const rel = path.relative(src, full).split(path.sep).join("/");
          if (allowed.some((prefix) => rel.startsWith(prefix))) continue;
          if (/["'`]\/admin(?:[/"'`?]|$)/m.test(fs.readFileSync(full, "utf8"))) offenders.push(rel);
        }
      }
    };
    walk(src);
    expect(offenders).toEqual([]);
  });
});
