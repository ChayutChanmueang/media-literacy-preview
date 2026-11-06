import { strToU8, zipSync } from "fflate";
import { NextRequest, NextResponse } from "next/server";
import { getExportMode, isDataExportEnabled } from "@/lib/adminAuth";
import { getDatabasePool } from "@/lib/database";
import { readDbFacts } from "@/lib/export/queries";
import { buildReadme, dbMatchesMode, ExportError, runExport, type ExportResult } from "@/lib/export/run";
import { createSupabaseServerClient, getAdminIdentity } from "@/lib/supabase/server";
import { dataExportRequestSchema, type DataExportRequest } from "@/lib/validations";

/**
 * POST /api/admin/export — staff-only data export as .csv (one file) or .zip (several).
 * docs/software/12 §7.2. Reads this site's own DB in one read-only snapshot and logs every
 * successful export to data_export_audit; no file is sent if the audit row can't be written.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const json = (body: unknown, status: number) => NextResponse.json(body, { status, headers: BASE_HEADERS });

/** CSRF guard: the browser's Origin must be this site (the host may come through the reverse proxy). */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** "20261106-1405" in Thai time. */
function bangkokStamp(date: Date): string {
  const iso = new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString();
  return `${iso.slice(0, 10).replace(/-/g, "")}-${iso.slice(11, 16).replace(":", "")}`;
}

function bangkokIso(date: Date): string {
  return `${new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19)}+07:00`;
}

function describeRequest(request: DataExportRequest) {
  const scopeTag = request.scope.type === "all" ? "all" : `session-${request.scope.session_id.slice(0, 8)}`;
  const scopeText = request.scope.type === "all" ? "ทุกคน" : `เฉพาะ session ${request.scope.session_id}`;
  const filters = [
    ...(request.row_filter.registered_only ? ["เฉพาะคนที่ลงทะเบียนแล้ว"] : []),
    ...(request.row_filter.self_assessment_pair_only ? ["เฉพาะคนที่ทำแบบประเมินครบทั้งก่อนและหลังเรียน"] : []),
  ];
  return { scopeTag, scopeText, filters };
}

export async function POST(request: NextRequest) {
  if (!isDataExportEnabled()) return new NextResponse(null, { status: 404, headers: BASE_HEADERS });
  if (!isSameOrigin(request)) return json({ error: "forbidden" }, 403);

  const supabase = await createSupabaseServerClient();
  const identity = await getAdminIdentity(supabase, { fresh: true });
  if (identity.status === "anonymous") return json({ error: "unauthenticated" }, 401);
  if (identity.status === "forbidden") return json({ error: "forbidden" }, 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  const parsed = dataExportRequestSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  const exportRequest = parsed.data;

  const mode = getExportMode();
  const now = new Date();
  const pool = getDatabasePool();
  const client = await pool.connect();
  let result: ExportResult;
  try {
    await client.query("BEGIN READ ONLY ISOLATION LEVEL REPEATABLE READ");
    await client.query("SET LOCAL statement_timeout = '60s'");
    const facts = await readDbFacts(client);
    if (!dbMatchesMode(mode, facts)) {
      await client.query("ROLLBACK");
      return json({ error: "db_mode_mismatch" }, 422);
    }
    if (!facts.hasAuditTable) {
      await client.query("ROLLBACK");
      console.error("[DataExport] data_export_audit is missing — run scripts/migrate-data-export.cjs");
      return json({ error: "not_migrated" }, 503);
    }
    result = await runExport(client, exportRequest, { mode, facts });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error instanceof ExportError) {
      return error.code === "session_not_found"
        ? json({ error: "session_not_found" }, 404)
        : json({ error: "dataset_unavailable", dataset: error.dataset }, 422);
    }
    console.error("[DataExport] Export failed:", error);
    return json({ error: "export_failed" }, 500);
  } finally {
    client.release();
  }

  const { scopeTag, scopeText, filters } = describeRequest(exportRequest);
  const stamp = bangkokStamp(now);
  const fileNames = result.files.map((file) => `${file.name}_${mode}_${scopeTag}_${stamp}.csv`);
  const rowCounts = Object.fromEntries(result.files.map((file, i) => [fileNames[i], file.rowCount]));

  try {
    await pool.query(
      `INSERT INTO data_export_audit
         (auth_user_id, auth_email, app_mode, scope, session_id, request, row_counts, client_ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        identity.userId,
        identity.email,
        mode,
        exportRequest.scope.type,
        exportRequest.scope.type === "session" ? exportRequest.scope.session_id : null,
        JSON.stringify(exportRequest),
        JSON.stringify(rowCounts),
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        request.headers.get("user-agent"),
      ],
    );
  } catch (error) {
    console.error("[DataExport] Could not write data_export_audit — export not sent:", error);
    return json({ error: "export_failed" }, 500);
  }

  const headers: Record<string, string> = {
    ...BASE_HEADERS,
    "X-Export-Row-Counts": JSON.stringify(rowCounts),
    "X-Export-Notes": encodeURIComponent(JSON.stringify(result.notes)),
  };

  if (result.files.length === 1) {
    return new NextResponse(result.files[0].csv, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileNames[0]}"`,
      },
    });
  }

  const readme = buildReadme(result, fileNames, {
    mode,
    generatedAt: bangkokIso(now),
    exportedBy: identity.email ?? identity.userId,
    scopeText,
    filters,
  });
  const entries: Record<string, Uint8Array> = { "README.txt": strToU8(readme) };
  result.files.forEach((file, i) => (entries[fileNames[i]] = strToU8(file.csv)));
  const zipName = `media-literacy-export_${mode}_${scopeTag}_${stamp}.zip`;
  return new NextResponse(Buffer.from(zipSync(entries)), {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
    },
  });
}
