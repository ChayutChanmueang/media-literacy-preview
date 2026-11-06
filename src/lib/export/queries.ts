import { FLOW_SEQUENCE } from "@/lib/flow";
import type { AppMode } from "@/services/progressService";
import type { CsvRow } from "./csv";

/**
 * SQL behind the staff data export (docs/software/12 §8–9). Every function takes the session ids
 * picked by selectSessions() and returns rows keyed by session_id, so each output row has an owner.
 * Works with a pg PoolClient and with PGlite (tests).
 */

export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
}

async function rowsOf<T>(db: Queryable, text: string, values: unknown[] = []): Promise<T[]> {
  return (await db.query(text, values)).rows as T[];
}

/** timestamptz → "2026-11-06T14:05:00+07:00" (Thai time). */
const bkk = (expr: string) => `to_char((${expr}) AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD"T"HH24:MI:SS"+07:00"')`;

/** "topic-1" → "topic_1", "Leaderboard View" → "leaderboard_view" — safe in a CSV header. */
export const columnSlug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "unknown";

// ---------------------------------------------------------------------------------------------
// What this database has
// ---------------------------------------------------------------------------------------------

export interface DbFacts {
  hasSelfAssessment: boolean;
  hasLeaderboardSessionColumn: boolean;
  hasAuditTable: boolean;
}

export async function readDbFacts(db: Queryable): Promise<DbFacts> {
  const [row] = await rowsOf<{ sa: boolean; lb: boolean; audit: boolean }>(
    db,
    `SELECT to_regclass('public.self_assessment_submissions') IS NOT NULL AS sa,
            to_regclass('public.data_export_audit') IS NOT NULL AS audit,
            EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'player_info' AND column_name = 'session_id') AS lb`,
  );
  return { hasSelfAssessment: row.sa, hasLeaderboardSessionColumn: row.lb, hasAuditTable: row.audit };
}

// ---------------------------------------------------------------------------------------------
// Who is in the export (§8.1)
// ---------------------------------------------------------------------------------------------

export interface SessionFilter {
  sessionId: string | null;
  registeredOnly: boolean;
  /** Only people with a complete pre + post self-assessment (needs the research tables). */
  pairOnly: boolean;
}

const SEEN_SESSIONS = `
  WITH seen AS (
    SELECT id AS session_id, created_at FROM sessions
    UNION ALL
    SELECT session_id, created_at FROM action_logs WHERE session_id IS NOT NULL
  ), base AS (
    SELECT session_id, min(created_at) AS first_seen FROM seen GROUP BY session_id
  )`;

/** Every session in `sessions` or `action_logs`, oldest first, narrowed by the filter. */
export async function selectSessions(db: Queryable, filter: SessionFilter): Promise<string[]> {
  const rows = await rowsOf<{ session_id: string }>(
    db,
    `${SEEN_SESSIONS}
     SELECT b.session_id::text AS session_id FROM base b
     WHERE ($1::uuid IS NULL OR b.session_id = $1::uuid)
       AND (NOT $2::boolean OR EXISTS (
             SELECT 1 FROM action_logs c WHERE c.session_id = b.session_id AND c.event_name = 'consent_submitted'))
       ${filter.pairOnly ? "AND EXISTS (SELECT 1 FROM self_assessment_pairs p WHERE p.session_id = b.session_id)" : ""}
     ORDER BY b.first_seen, b.session_id`,
    [filter.sessionId, filter.registeredOnly],
  );
  return rows.map((row) => row.session_id);
}

export async function readCounts(db: Queryable): Promise<{ sessionCount: number; eventCount: number }> {
  const [row] = await rowsOf<{ sessions: number; events: number }>(
    db,
    `${SEEN_SESSIONS}
     SELECT (SELECT count(*) FROM base)::int AS sessions, (SELECT count(*) FROM action_logs)::int AS events`,
  );
  return { sessionCount: row.sessions, eventCount: row.events };
}

// ---------------------------------------------------------------------------------------------
// participants.csv column groups (§8.2)
// ---------------------------------------------------------------------------------------------

export interface GroupResult {
  columns: string[];
  values: Map<string, CsvRow>;
}

const byId = (rows: CsvRow[]) => new Map(rows.map(({ session_id, ...rest }) => [String(session_id), rest]));

/** age_range, province, district, sub_district — from the first consent_submitted, then `sessions`. */
export async function readRegistration(db: Queryable, ids: string[]): Promise<Map<string, CsvRow>> {
  const rows = await rowsOf<CsvRow>(
    db,
    `WITH fc AS (
       SELECT DISTINCT ON (session_id) session_id, payload FROM action_logs
       WHERE event_name = 'consent_submitted' AND session_id = ANY($1::uuid[])
       ORDER BY session_id, created_at
     )
     SELECT t.session_id::text AS session_id,
            COALESCE(NULLIF(s.age_range, 'unknown'), NULLIF(NULLIF(fc.payload->>'age_range', ''), 'unknown')) AS age_range,
            NULLIF(fc.payload->>'province', '') AS province,
            COALESCE(NULLIF(fc.payload->>'district', ''), s.selected_district) AS district,
            COALESCE(NULLIF(fc.payload->>'sub_district', ''), s.selected_sub_district) AS sub_district
     FROM unnest($1::uuid[]) AS t(session_id)
     LEFT JOIN sessions s ON s.id = t.session_id
     LEFT JOIN fc ON fc.session_id = t.session_id`,
    [ids],
  );
  return byId(rows);
}

export interface SelfAssessmentItem {
  item_set: string;
  item_id: string;
  sort_order: number;
  text: string;
}

export async function readSelfAssessmentItems(db: Queryable): Promise<SelfAssessmentItem[]> {
  return rowsOf<SelfAssessmentItem>(
    db,
    "SELECT item_set, item_id, sort_order::int AS sort_order, text FROM self_assessment_items ORDER BY item_set, sort_order",
  );
}

interface PhaseAnswers {
  itemSet: string;
  submittedAt: string | null;
  durationSec: number | null;
  answers: Map<string, number>;
}

/**
 * Pre/post self-assessment, one row per person. Same rules as scripts/export-self-assessment.cjs:
 * dev-skip runs left out, first submission per session and phase. A total is given only when every
 * item of the set was answered.
 */
export async function readSelfAssessment(
  db: Queryable,
  ids: string[],
  items: SelfAssessmentItem[],
  { includeItems }: { includeItems: boolean },
): Promise<GroupResult> {
  const rows = await rowsOf<{
    session_id: string;
    phase: "pre" | "post";
    item_set: string;
    submitted_at: string | null;
    duration_sec: number | null;
    item_id: string | null;
    value: number | null;
  }>(
    db,
    `WITH picked AS (
       SELECT DISTINCT ON (s.session_id, s.phase) s.submission_uuid, s.session_id, s.phase, s.item_set,
              s.started_at, s.submitted_at
       FROM self_assessment_submissions s
       WHERE NOT s.is_dev_skip AND s.session_id = ANY($1::uuid[])
       ORDER BY s.session_id, s.phase, s.submitted_at, s.received_at
     )
     SELECT p.session_id::text AS session_id, p.phase, p.item_set, ${bkk("p.submitted_at")} AS submitted_at,
            EXTRACT(EPOCH FROM (p.submitted_at - p.started_at))::int AS duration_sec,
            a.item_id, a.value::int AS value
     FROM picked p
     LEFT JOIN self_assessment_answers a ON a.submission_uuid = p.submission_uuid`,
    [ids],
  );

  const people = new Map<string, Partial<Record<"pre" | "post", PhaseAnswers>>>();
  for (const row of rows) {
    const person = people.get(row.session_id) ?? {};
    people.set(row.session_id, person);
    const phase = (person[row.phase] ??= {
      itemSet: row.item_set,
      submittedAt: row.submitted_at,
      durationSec: row.duration_sec,
      answers: new Map(),
    });
    if (row.item_id !== null && row.value !== null) phase.answers.set(row.item_id, Number(row.value));
  }

  const itemsBySet = new Map<string, SelfAssessmentItem[]>();
  for (const item of items) itemsBySet.set(item.item_set, [...(itemsBySet.get(item.item_set) ?? []), item]);

  // Item columns: sa_pre_01… for one item set; sa_<set>_pre_01… when the data spans several sets
  const usedSets = [...new Set(rows.map((row) => row.item_set))].sort();
  const multiSet = usedSets.length > 1;
  const itemColumn = (set: string, phase: string, item: SelfAssessmentItem) =>
    `sa_${multiSet ? `${columnSlug(set)}_` : ""}${phase}_${String(item.sort_order).padStart(2, "0")}`;
  const itemColumns: string[] = [];
  if (includeItems) {
    const sets = usedSets.length ? usedSets : [...itemsBySet.keys()].slice(-1);
    for (const set of sets) {
      for (const phase of ["pre", "post"]) {
        for (const item of itemsBySet.get(set) ?? []) itemColumns.push(itemColumn(set, phase, item));
      }
    }
  }

  const summarise = (phase: PhaseAnswers | undefined) => {
    if (!phase) return { total: null, straightLine: null };
    const setItems = itemsBySet.get(phase.itemSet) ?? [];
    const complete = setItems.length > 0 && setItems.every((item) => phase.answers.has(item.item_id));
    const values = [...phase.answers.values()];
    return {
      total: complete ? setItems.reduce((sum, item) => sum + (phase.answers.get(item.item_id) ?? 0), 0) : null,
      straightLine: values.length ? new Set(values).size === 1 : null,
    };
  };

  const values = new Map<string, CsvRow>();
  for (const [sessionId, { pre, post }] of people) {
    const preSummary = summarise(pre);
    const postSummary = summarise(post);
    const hasPair =
      preSummary.total !== null && postSummary.total !== null && pre?.itemSet === post?.itemSet;
    const row: CsvRow = {
      sa_item_set: pre?.itemSet ?? post?.itemSet ?? null,
      sa_pre_submitted_at: pre?.submittedAt ?? null,
      sa_pre_duration_sec: pre?.durationSec ?? null,
      sa_pre_total: preSummary.total,
      sa_pre_straight_line: preSummary.straightLine,
      sa_post_submitted_at: post?.submittedAt ?? null,
      sa_post_duration_sec: post?.durationSec ?? null,
      sa_post_total: postSummary.total,
      sa_post_straight_line: postSummary.straightLine,
      sa_diff: hasPair ? (postSummary.total as number) - (preSummary.total as number) : null,
      sa_has_pair: hasPair,
    };
    if (includeItems) {
      for (const [phaseName, phase] of [["pre", pre], ["post", post]] as const) {
        if (!phase) continue;
        for (const item of itemsBySet.get(phase.itemSet) ?? []) {
          row[itemColumn(phase.itemSet, phaseName, item)] = phase.answers.get(item.item_id) ?? null;
        }
      }
    }
    values.set(sessionId, row);
  }
  for (const id of ids) if (!values.has(id)) values.set(id, { sa_has_pair: false });

  return {
    columns: [
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
      ...itemColumns,
    ],
    values,
  };
}

export async function readUsageSummary(db: Queryable, ids: string[]): Promise<GroupResult> {
  const rows = await rowsOf<CsvRow>(
    db,
    `SELECT t.session_id::text AS session_id,
            ${bkk("LEAST(min(l.created_at), min(s.created_at))")} AS usage_first_seen_at,
            ${bkk("GREATEST(max(l.created_at), min(s.created_at))")} AS usage_last_seen_at,
            count(l.id)::int AS usage_total_events,
            count(DISTINCT (l.created_at AT TIME ZONE 'Asia/Bangkok')::date)::int AS usage_active_days,
            count(DISTINCT to_char(l.created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM'))::int AS usage_active_months
     FROM unnest($1::uuid[]) AS t(session_id)
     LEFT JOIN sessions s ON s.id = t.session_id
     LEFT JOIN action_logs l ON l.session_id = t.session_id
     GROUP BY t.session_id`,
    [ids],
  );
  return {
    columns: ["usage_first_seen_at", "usage_last_seen_at", "usage_total_events", "usage_active_days", "usage_active_months"],
    values: byId(rows),
  };
}

/** One ev_<event_name> column per event name found in this export; 0 when a person has none. */
export async function readEventBreakdown(db: Queryable, ids: string[]): Promise<GroupResult> {
  const rows = await rowsOf<{ session_id: string; event_name: string; n: number }>(
    db,
    `SELECT session_id::text AS session_id, event_name, count(*)::int AS n
     FROM action_logs WHERE session_id = ANY($1::uuid[]) GROUP BY session_id, event_name`,
    [ids],
  );
  const columns = [...new Set(rows.map((row) => `ev_${columnSlug(row.event_name)}`))].sort();
  const values = new Map<string, CsvRow>(ids.map((id) => [id, Object.fromEntries(columns.map((c) => [c, 0]))]));
  for (const row of rows) {
    const target = values.get(row.session_id);
    const column = `ev_${columnSlug(row.event_name)}`;
    if (target) target[column] = Number(target[column] ?? 0) + row.n;
  }
  return { columns, values };
}

/** Funnel steps in the order each mode's flow reaches them (docs/software/12 §8.2). */
export const FUNNEL_STEPS: Record<AppMode, readonly string[]> = {
  normal: [
    "landing",
    "consent_view",
    "consent_submitted",
    "lessons_dashboard",
    "started_content",
    "all_lessons_done",
    "leaderboard_view",
    "completion_view",
    "back_home",
  ],
  research: [
    "landing",
    "consent_view",
    "consent_submitted",
    "sa_pre",
    "started_content",
    "all_lessons_done",
    "sa_post",
    "completion_view",
    "back_home",
  ],
};

const FUNNEL_EVENT_FILTERS: Record<string, string> = {
  landing: "event_name = 'landing_page_view'",
  consent_view: "event_name = 'consent_page_view'",
  consent_submitted: "event_name = 'consent_submitted'",
  lessons_dashboard: "event_name = 'lessons_dashboard_view'",
  started_content: "event_name IN ('game_start', 'play_video', 'enter_video')",
  leaderboard_view: "event_name = 'leaderboard_page_view'",
  completion_view: "event_name = 'course_completion_view'",
  back_home: "event_name = 'course_completion_back_home'",
};

export async function readCompletionFunnel(
  db: Queryable,
  ids: string[],
  { mode, hasSelfAssessment }: { mode: AppMode; hasSelfAssessment: boolean },
): Promise<GroupResult> {
  const steps = FUNNEL_STEPS[mode];
  const eventSteps = steps.filter((step) => FUNNEL_EVENT_FILTERS[step]);
  const reached = new Map<string, Record<string, string | null>>(ids.map((id) => [id, {}]));

  const eventRows = await rowsOf<Record<string, string | null>>(
    db,
    `SELECT session_id::text AS session_id,
            ${eventSteps.map((step) => `${bkk(`min(created_at) FILTER (WHERE ${FUNNEL_EVENT_FILTERS[step]})`)} AS "${step}"`).join(",\n            ")}
     FROM action_logs WHERE session_id = ANY($1::uuid[]) GROUP BY session_id`,
    [ids],
  );
  for (const row of eventRows) Object.assign(reached.get(row.session_id as string) ?? {}, row);

  const doneRows = await rowsOf<{ session_id: string; at: string }>(
    db,
    `SELECT session_id::text AS session_id, ${bkk("max(GREATEST(video_completed_at, game_completed_at))")} AS at
     FROM lesson_progress
     WHERE session_id = ANY($1::uuid[]) AND lesson_id = ANY($2::text[])
       AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL
     GROUP BY session_id
     HAVING count(DISTINCT lesson_id) = cardinality($2::text[])`,
    [ids, [...FLOW_SEQUENCE]],
  );
  for (const row of doneRows) reached.get(row.session_id)!.all_lessons_done = row.at;

  if (steps.includes("sa_pre") && hasSelfAssessment) {
    const saRows = await rowsOf<{ session_id: string; phase: string; at: string }>(
      db,
      `SELECT session_id::text AS session_id, phase, ${bkk("min(submitted_at)")} AS at
       FROM self_assessment_submissions
       WHERE NOT is_dev_skip AND session_id = ANY($1::uuid[])
       GROUP BY session_id, phase`,
      [ids],
    );
    for (const row of saRows) reached.get(row.session_id)![`sa_${row.phase}`] = row.at;
  }

  const values = new Map<string, CsvRow>();
  for (const id of ids) {
    const at = reached.get(id) ?? {};
    const row: CsvRow = {};
    let furthest: string | null = null;
    for (const step of steps) {
      row[`funnel_${step}_at`] = at[step] ?? null;
      if (at[step]) furthest = step;
    }
    row.funnel_furthest_step = furthest;
    values.set(id, row);
  }
  return { columns: [...steps.map((step) => `funnel_${step}_at`), "funnel_furthest_step"], values };
}

export async function readLessonProgress(db: Queryable, ids: string[]): Promise<GroupResult> {
  const rows = await rowsOf<{ session_id: string; lesson_id: string; video_at: string | null; game_at: string | null; done: boolean }>(
    db,
    `SELECT session_id::text AS session_id, lesson_id,
            ${bkk("video_completed_at")} AS video_at, ${bkk("game_completed_at")} AS game_at,
            (video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL) AS done
     FROM lesson_progress WHERE session_id = ANY($1::uuid[])`,
    [ids],
  );
  const flow: string[] = [...FLOW_SEQUENCE];
  const others = [...new Set(rows.map((row) => row.lesson_id))].filter((id) => !flow.includes(id)).sort();
  const lessons = [...flow, ...others];
  const columns = ["lessons_completed"];
  for (const lesson of lessons) columns.push(`lesson_${columnSlug(lesson)}_video_at`, `lesson_${columnSlug(lesson)}_game_at`);

  const values = new Map<string, CsvRow>(ids.map((id) => [id, { lessons_completed: 0 }]));
  for (const row of rows) {
    const target = values.get(row.session_id);
    if (!target) continue;
    target[`lesson_${columnSlug(row.lesson_id)}_video_at`] = row.video_at;
    target[`lesson_${columnSlug(row.lesson_id)}_game_at`] = row.game_at;
    if (row.done) target.lessons_completed = Number(target.lessons_completed) + 1;
  }
  return { columns, values };
}

// ---------------------------------------------------------------------------------------------
// Separate files (§9)
// ---------------------------------------------------------------------------------------------

export interface FileResult {
  columns: string[];
  rows: CsvRow[];
}

export async function readEventLog(db: Queryable, ids: string[]): Promise<FileResult> {
  const rows = await rowsOf<CsvRow>(
    db,
    `SELECT session_id::text AS session_id, id::text AS event_id, ${bkk("created_at")} AS created_at,
            event_name, page_url, payload
     FROM action_logs WHERE session_id = ANY($1::uuid[])
     ORDER BY session_id, created_at, id`,
    [ids],
  );
  return { columns: ["session_id", "event_id", "created_at", "event_name", "page_url", "payload"], rows };
}

export async function readUsageDaily(db: Queryable, ids: string[]): Promise<FileResult> {
  const rows = await rowsOf<CsvRow>(
    db,
    `SELECT session_id::text AS session_id,
            to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') AS date,
            count(*)::int AS event_count,
            ${bkk("min(created_at)")} AS first_event_at,
            ${bkk("max(created_at)")} AS last_event_at,
            round(EXTRACT(EPOCH FROM (max(created_at) - min(created_at))) / 60)::int AS span_minutes
     FROM action_logs WHERE session_id = ANY($1::uuid[])
     GROUP BY session_id, 2 ORDER BY session_id, 2`,
    [ids],
  );
  return { columns: ["session_id", "date", "event_count", "first_event_at", "last_event_at", "span_minutes"], rows };
}

export async function readUsageMonthly(db: Queryable, ids: string[]): Promise<FileResult> {
  const rows = await rowsOf<CsvRow>(
    db,
    `SELECT session_id::text AS session_id,
            to_char(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM') AS month,
            count(*)::int AS event_count,
            count(DISTINCT (created_at AT TIME ZONE 'Asia/Bangkok')::date)::int AS active_days
     FROM action_logs WHERE session_id = ANY($1::uuid[])
     GROUP BY session_id, 2 ORDER BY session_id, 2`,
    [ids],
  );
  return { columns: ["session_id", "month", "event_count", "active_days"], rows };
}

/**
 * Leaderboard plays. Rows with no session (old scores the backfill couldn't match) have no owner, so
 * they are only included when exporting everyone with no row filter (`includeUnlinked`).
 */
export async function readLeaderboard(
  db: Queryable,
  ids: string[],
  { includeUnlinked }: { includeUnlinked: boolean },
): Promise<FileResult & { unlinkedLeftOut: number }> {
  const rows = await rowsOf<CsvRow>(
    db,
    `SELECT p.session_id::text AS session_id,
            CASE WHEN p.session_id IS NULL THEN 'none' ELSE COALESCE(p.session_link, 'exact') END AS session_link,
            p.attempt_uuid::text AS attempt_uuid, p.player_uuid::text AS player_uuid, p.name AS player_name,
            p.gid AS game_id, g.name AS game_name, p.score, ${bkk("p.created_at")} AS played_at
     FROM player_info p LEFT JOIN game_id g ON g.gid = p.gid
     WHERE p.session_id = ANY($1::uuid[]) OR ($2::boolean AND p.session_id IS NULL)
     ORDER BY p.created_at, p.id`,
    [ids, includeUnlinked],
  );
  let unlinkedLeftOut = 0;
  if (!includeUnlinked) {
    const [row] = await rowsOf<{ n: number }>(db, "SELECT count(*)::int AS n FROM player_info WHERE session_id IS NULL");
    unlinkedLeftOut = row.n;
  }
  return {
    columns: ["session_id", "session_link", "attempt_uuid", "player_uuid", "player_name", "game_id", "game_name", "score", "played_at"],
    rows,
    unlinkedLeftOut,
  };
}

export async function countLeaderboardWithoutSession(db: Queryable): Promise<number> {
  const [row] = await rowsOf<{ n: number }>(db, "SELECT count(*)::int AS n FROM player_info WHERE session_id IS NULL");
  return row.n;
}
