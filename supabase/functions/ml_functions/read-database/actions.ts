import { dbMatchesMode, ExportError, runExport } from "../../../../src/lib/export/run.ts";
import { readDbFacts } from "../../../../src/lib/export/queries.ts";
import type { AppMode } from "../../../../src/lib/export/mode.ts";
import type { ExportRequest } from "../../../../src/lib/export/run.ts";
import { withReadOnlyDb } from "./db.ts";

/**
 * Live read of the tables the app already writes (sessions, action_logs, lesson_progress,
 * self-assessment, player_info). Nothing is stored for the report.
 *
 * Adapted from the MCI `read-database` export actions, which page an RPC and return `{ rows }`.
 * This action runs the same query engine the unit tests cover, then returns the shaped files.
 */

const GROUPS = [
  "age",
  "location",
  "self_assessment",
  "usage_summary",
  "event_breakdown",
  "completion_funnel",
  "lesson_progress",
] as const;
const FILES = ["event_log", "usage_detail", "leaderboard"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unique<T extends string>(values: unknown, allowed: readonly T[]): T[] | null {
  if (values === undefined) return [];
  if (!Array.isArray(values)) return null;
  const out: T[] = [];
  for (const value of values) {
    if (typeof value !== "string" || !(allowed as readonly string[]).includes(value) || out.includes(value as T)) return null;
    out.push(value as T);
  }
  return out;
}

/** Same shape as the Next route's zod schema, without pulling zod into the edge runtime. */
function parseExportBody(body: unknown): ExportRequest | null {
  if (!isRecord(body)) return null;
  const top = new Set(["scope", "row_filter", "groups", "group_options", "files"]);
  if (Object.keys(body).some((key) => !top.has(key))) return null;

  if (!isRecord(body.scope) || (body.scope.type !== "all" && body.scope.type !== "session")) return null;
  const scopeKeys = Object.keys(body.scope);
  let scope: ExportRequest["scope"];
  if (body.scope.type === "all") {
    if (scopeKeys.length !== 1) return null;
    scope = { type: "all" };
  } else {
    if (scopeKeys.length !== 2 || typeof body.scope.session_id !== "string" || !UUID.test(body.scope.session_id.trim())) return null;
    scope = { type: "session", session_id: body.scope.session_id.trim() };
  }

  const filter = body.row_filter === undefined ? {} : body.row_filter;
  if (!isRecord(filter)) return null;
  if (Object.keys(filter).some((key) => key !== "registered_only" && key !== "self_assessment_pair_only")) return null;
  if (filter.registered_only !== undefined && typeof filter.registered_only !== "boolean") return null;
  if (filter.self_assessment_pair_only !== undefined && typeof filter.self_assessment_pair_only !== "boolean") return null;

  const options = body.group_options === undefined ? {} : body.group_options;
  if (!isRecord(options) || Object.keys(options).some((key) => key !== "self_assessment_items")) return null;
  if (options.self_assessment_items !== undefined && typeof options.self_assessment_items !== "boolean") return null;

  const groups = unique(body.groups, GROUPS);
  const files = unique(body.files, FILES);
  if (!groups || !files || groups.length + files.length === 0) return null;

  return {
    scope,
    row_filter: {
      registered_only: filter.registered_only === true,
      self_assessment_pair_only: filter.self_assessment_pair_only === true,
    },
    groups,
    group_options: { self_assessment_items: options.self_assessment_items !== false },
    files,
  };
}

class DbModeMismatch extends Error {}

function exportMode(): AppMode {
  return Deno.env.get("APP_MODE")?.trim().toLowerCase() === "research" ? "research" : "normal";
}

export async function exportDataset(body: unknown) {
  const request = parseExportBody(body);
  if (!request) return json({ error: "invalid_request" }, 400);

  const mode = exportMode();
  try {
    const result = await withReadOnlyDb(async (db) => {
      const facts = await readDbFacts(db);
      if (!dbMatchesMode(mode, facts)) throw new DbModeMismatch();
      return await runExport(db, request, { mode, facts });
    });
    return json({ result }, 200);
  } catch (error) {
    if (error instanceof DbModeMismatch) return json({ error: "db_mode_mismatch" }, 422);
    if (error instanceof ExportError) {
      return json(
        { error: error.code, ...(error.dataset ? { dataset: error.dataset } : {}) },
        error.code === "session_not_found" ? 404 : 422,
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ml_functions] export failed:", message.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://***"));
    return json({ error: "export_failed" }, 500);
  }
}
