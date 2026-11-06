import { strToU8, zipSync } from "fflate";
import type { DataExportRequest } from "@/lib/validations";
import { buildReadme, type ExportResult } from "./run";

/** "20261106-1405" in Thai time. */
export function bangkokStamp(date: Date): string {
  const iso = new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString();
  return `${iso.slice(0, 10).replace(/-/g, "")}-${iso.slice(11, 16).replace(":", "")}`;
}

export function bangkokIso(date: Date): string {
  return `${new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19)}+07:00`;
}

export function describeRequest(request: DataExportRequest) {
  const scopeTag = request.scope.type === "all" ? "all" : `session-${request.scope.session_id.slice(0, 8)}`;
  const scopeText = request.scope.type === "all" ? "ทุกคน" : `เฉพาะ session ${request.scope.session_id}`;
  const filters = [
    ...(request.row_filter.registered_only ? ["เฉพาะคนที่ลงทะเบียนแล้ว"] : []),
    ...(request.row_filter.self_assessment_pair_only ? ["เฉพาะคนที่ทำแบบประเมินครบทั้งก่อนและหลังเรียน"] : []),
  ];
  return { scopeTag, scopeText, filters };
}

export interface ExportDownload {
  body: Blob | string;
  contentType: string;
  filename: string;
  rowCounts: Record<string, number>;
  notes: string[];
}

/** Turns an export result into one CSV, or a zip of CSVs plus README.txt. */
export function buildExportDownload(
  result: ExportResult,
  request: DataExportRequest,
  { mode, now, exportedBy }: { mode: "normal" | "research"; now: Date; exportedBy: string },
): ExportDownload {
  const { scopeTag, scopeText, filters } = describeRequest(request);
  const stamp = bangkokStamp(now);
  const fileNames = result.files.map((file) => `${file.name}_${mode}_${scopeTag}_${stamp}.csv`);
  const rowCounts = Object.fromEntries(result.files.map((file, i) => [fileNames[i], file.rowCount]));

  if (result.files.length === 1) {
    return {
      body: result.files[0].csv,
      contentType: "text/csv; charset=utf-8",
      filename: fileNames[0],
      rowCounts,
      notes: result.notes,
    };
  }

  const readme = buildReadme(result, fileNames, {
    mode,
    generatedAt: bangkokIso(now),
    exportedBy,
    scopeText,
    filters,
  });
  const entries: Record<string, Uint8Array> = { "README.txt": strToU8(readme) };
  result.files.forEach((file, i) => (entries[fileNames[i]] = strToU8(file.csv)));
  return {
    body: new Blob([zipSync(entries)]),
    contentType: "application/zip",
    filename: `media-literacy-export_${mode}_${scopeTag}_${stamp}.zip`,
    rowCounts,
    notes: result.notes,
  };
}
