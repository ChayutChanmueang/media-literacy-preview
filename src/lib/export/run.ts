import type { AppMode } from "@/services/progressService";
import type { DataExportRequest } from "@/lib/validations";
import { toCsv, type CsvRow } from "./csv";
import {
  COLUMN_DICTIONARY,
  DATASETS,
  FILE_IDS,
  GROUP_IDS,
  MODE_LABEL,
  TIME_NOTE,
  type DatasetAvailability,
  type DatasetId,
  type GroupId,
} from "./registry";
import {
  readCompletionFunnel,
  readEventBreakdown,
  readEventLog,
  readLeaderboard,
  readLessonProgress,
  readRegistration,
  readSelfAssessment,
  readSelfAssessmentItems,
  readUsageDaily,
  readUsageMonthly,
  readUsageSummary,
  selectSessions,
  type DbFacts,
  type GroupResult,
  type Queryable,
  type SelfAssessmentItem,
} from "./queries";

/** Which datasets this site can export, and why not (docs/software/12 §6, §7.1). */
export function datasetAvailability(mode: AppMode, facts: DbFacts): DatasetAvailability[] {
  return DATASETS.map((info) => {
    if (info.onlyIn && info.onlyIn !== mode) return { id: info.id, available: false, reason: "other_mode" };
    if (info.id === "self_assessment" && !facts.hasSelfAssessment) return { id: info.id, available: false, reason: "missing_in_db" };
    if (info.id === "leaderboard" && !facts.hasLeaderboardSessionColumn) return { id: info.id, available: false, reason: "missing_in_db" };
    return { id: info.id, available: true };
  });
}

/** A research site whose DB has no self-assessment tables is probably pointed at the wrong server. */
export function dbMatchesMode(mode: AppMode, facts: DbFacts): boolean {
  return mode !== "research" || facts.hasSelfAssessment;
}

export interface ExportFile {
  /** Base name without the mode/scope/time suffix, e.g. "participants". */
  name: string;
  csv: string;
  rowCount: number;
}

export interface ExportResult {
  files: ExportFile[];
  sessionCount: number;
  notes: string[];
  items: SelfAssessmentItem[];
}

export class ExportError extends Error {
  constructor(
    readonly code: "session_not_found" | "dataset_unavailable",
    readonly dataset?: DatasetId,
  ) {
    super(code);
  }
}

/**
 * Runs one export on `db` (the caller opens the read-only transaction). Every file has session_id
 * as its first column and covers the same people.
 */
export async function runExport(
  db: Queryable,
  request: DataExportRequest,
  { mode, facts }: { mode: AppMode; facts: DbFacts },
): Promise<ExportResult> {
  const availability = new Map(datasetAvailability(mode, facts).map((a) => [a.id, a]));
  for (const id of [...request.groups, ...request.files]) {
    if (!availability.get(id)?.available) throw new ExportError("dataset_unavailable", id);
  }
  const wantsSelfAssessment = request.groups.includes("self_assessment");
  if (request.row_filter.self_assessment_pair_only && !wantsSelfAssessment) {
    throw new ExportError("dataset_unavailable", "self_assessment");
  }

  const sessionId = request.scope.type === "session" ? request.scope.session_id : null;
  const ids = await selectSessions(db, {
    sessionId,
    registeredOnly: request.row_filter.registered_only,
    pairOnly: request.row_filter.self_assessment_pair_only,
  });
  if (sessionId && ids.length === 0) {
    // Distinguish "no such session" from "the session exists but the row filter left it out"
    const exists = await selectSessions(db, { sessionId, registeredOnly: false, pairOnly: false });
    if (exists.length === 0) throw new ExportError("session_not_found");
  }

  const files: ExportFile[] = [];
  const notes: string[] = [];
  const items = facts.hasSelfAssessment ? await readSelfAssessmentItems(db) : [];

  if (request.groups.length) {
    const groups = new Set<GroupId>(request.groups);
    const results: GroupResult[] = [];
    if (groups.has("age") || groups.has("location")) {
      const registration = await readRegistration(db, ids);
      const columns = [
        ...(groups.has("age") ? ["age_range"] : []),
        ...(groups.has("location") ? ["province", "district", "sub_district"] : []),
      ];
      results.push({ columns, values: registration });
    }
    for (const group of GROUP_IDS) {
      if (!groups.has(group)) continue;
      if (group === "self_assessment") {
        results.push(await readSelfAssessment(db, ids, items, { includeItems: request.group_options.self_assessment_items }));
      } else if (group === "usage_summary") {
        results.push(await readUsageSummary(db, ids));
      } else if (group === "event_breakdown") {
        results.push(await readEventBreakdown(db, ids));
      } else if (group === "completion_funnel") {
        results.push(await readCompletionFunnel(db, ids, { mode, hasSelfAssessment: facts.hasSelfAssessment }));
      } else if (group === "lesson_progress") {
        results.push(await readLessonProgress(db, ids));
      }
    }

    const columns = ["session_id", ...results.flatMap((result) => result.columns)];
    const rows: CsvRow[] = ids.map((id) => {
      const row: CsvRow = { session_id: id };
      for (const result of results) {
        const values = result.values.get(id) ?? {};
        for (const column of result.columns) row[column] = values[column] ?? null;
      }
      return row;
    });
    files.push({ name: "participants", csv: toCsv(columns, rows), rowCount: rows.length });
  }

  for (const file of FILE_IDS) {
    if (!request.files.includes(file)) continue;
    if (file === "event_log") {
      const { columns, rows } = await readEventLog(db, ids);
      files.push({ name: "event_log", csv: toCsv(columns, rows), rowCount: rows.length });
    } else if (file === "usage_detail") {
      const daily = await readUsageDaily(db, ids);
      const monthly = await readUsageMonthly(db, ids);
      files.push({ name: "usage_daily", csv: toCsv(daily.columns, daily.rows), rowCount: daily.rows.length });
      files.push({ name: "usage_monthly", csv: toCsv(monthly.columns, monthly.rows), rowCount: monthly.rows.length });
    } else if (file === "leaderboard") {
      const includeUnlinked =
        request.scope.type === "all" && !request.row_filter.registered_only && !request.row_filter.self_assessment_pair_only;
      const result = await readLeaderboard(db, ids, { includeUnlinked });
      files.push({ name: "leaderboard", csv: toCsv(result.columns, result.rows), rowCount: result.rows.length });
      if (result.unlinkedLeftOut > 0) {
        notes.push(
          `leaderboard: ไม่รวมคะแนนเก่า ${result.unlinkedLeftOut} แถวที่ผูกกับ session ไม่ได้ (รวมเฉพาะตอนดึงทุกคนโดยไม่มีตัวกรอง)`,
        );
      }
    }
  }

  return { files, sessionCount: ids.length, notes, items };
}

export interface ReadmeContext {
  mode: AppMode;
  generatedAt: string;
  exportedBy: string;
  scopeText: string;
  filters: string[];
}

export function buildReadme(result: ExportResult, fileNames: string[], ctx: ReadmeContext): string {
  const lines = [
    "ข้อมูลส่งออก — รู้ทันสื่อ (NAPLAB Media Literacy)",
    "",
    `เว็บ: ${MODE_LABEL[ctx.mode]}`,
    `เวลาที่ดึง: ${ctx.generatedAt}`,
    `ผู้ดึง: ${ctx.exportedBy}`,
    `ขอบเขต: ${ctx.scopeText}`,
    `ตัวกรอง: ${ctx.filters.length ? ctx.filters.join(", ") : "ไม่มี"}`,
    `จำนวนคน: ${result.sessionCount}`,
    "",
    "ไฟล์:",
    ...result.files.map((file, i) => `  ${fileNames[i]} — ${file.rowCount} แถว`),
    ...(result.notes.length ? ["", "หมายเหตุ:", ...result.notes.map((note) => `  - ${note}`)] : []),
    "",
    "⚠️ ข้อมูลวิจัย — ห้าม commit เข้า repo และห้ามแชร์สาธารณะ",
    "",
    "คำอธิบายคอลัมน์:",
    `  ${TIME_NOTE}`,
    ...COLUMN_DICTIONARY.map((entry) => `  [${entry.file}] ${entry.column} — ${entry.meaning}`),
  ];
  if (result.items.length) {
    lines.push("", "ข้อความคำถามแบบประเมิน (sa_pre_<nn> / sa_post_<nn>):");
    for (const item of result.items) {
      lines.push(`  ${item.item_set} ข้อ ${String(item.sort_order).padStart(2, "0")} (${item.item_id}): ${item.text}`);
    }
  }
  return `﻿${lines.join("\r\n")}\r\n`;
}
