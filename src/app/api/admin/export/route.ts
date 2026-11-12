import { NextRequest, NextResponse } from "next/server";
import { getExportMode, getSupabaseAuthConfig, isDataExportEnabled } from "@/lib/adminAuth";
import { getDatabasePool } from "@/lib/database";
import { buildExportDownload } from "@/lib/export/download";
import { exportFunctionUrl, isDirectExportEnabled } from "@/lib/export/edge";
import { readDbFacts } from "@/lib/export/queries";
import { dbMatchesMode, ExportError, runExport, type ExportResult } from "@/lib/export/run";
import { createSupabaseServerClient, getAdminIdentity, type AdminIdentity } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dataExportRequestSchema, type DataExportRequest } from "@/lib/validations";

/**
 * POST /api/admin/export — staff-only data export as .csv (one file) or .zip (several).
 * docs/software/12. The rows are read from tables that already exist. By default this route
 * asks the ml_functions edge function to run that read. It does not write a report table.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const json = (body: unknown, status: number) => NextResponse.json(body, { status, headers: BASE_HEADERS });

class ExportRouteError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
  }
}

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

async function runDirect(request: DataExportRequest, mode: "normal" | "research"): Promise<ExportResult> {
  const pool = getDatabasePool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY ISOLATION LEVEL REPEATABLE READ");
    await client.query("SET LOCAL statement_timeout = '60s'");
    const facts = await readDbFacts(client);
    if (!dbMatchesMode(mode, facts)) {
      await client.query("ROLLBACK");
      throw new ExportRouteError("db_mode_mismatch", 422);
    }
    const result = await runExport(client, request, { mode, facts });
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error instanceof ExportRouteError) throw error;
    if (error instanceof ExportError) {
      throw new ExportRouteError(
        error.code === "session_not_found" ? "session_not_found" : "dataset_unavailable",
        error.code === "session_not_found" ? 404 : 422,
      );
    }
    throw error;
  } finally {
    client.release();
  }
}

async function runViaEdge(supabase: SupabaseClient, request: DataExportRequest): Promise<ExportResult> {
  const config = getSupabaseAuthConfig();
  if (!config) throw new ExportRouteError("export_failed", 500);

  // getUser() already authorised this request. getSession() only forwards that access token.
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new ExportRouteError("unauthenticated", 401);

  let response: Response;
  try {
    response = await fetch(exportFunctionUrl(config.url), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: config.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (error) {
    console.error("[DataExport] Edge function unreachable:", error);
    throw new ExportRouteError("edge_function_unavailable", 503);
  }

  const payload = (await response.json().catch(() => null)) as { error?: string; result?: ExportResult } | null;
  if (!response.ok || !payload?.result) {
    const code = payload?.error ?? "export_failed";
    const status = response.status >= 400 && response.status < 600 ? response.status : 500;
    if (code === "edge_function_unavailable" || response.status === 404) {
      throw new ExportRouteError("edge_function_unavailable", 503);
    }
    throw new ExportRouteError(code, status);
  }
  return payload.result;
}

function sendDownload(download: ReturnType<typeof buildExportDownload>) {
  return new NextResponse(download.body, {
    status: 200,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": download.contentType,
      "Content-Disposition": `attachment; filename="${download.filename}"`,
      "X-Export-Row-Counts": JSON.stringify(download.rowCounts),
      "X-Export-Notes": encodeURIComponent(JSON.stringify(download.notes)),
    },
  });
}

export async function POST(request: NextRequest) {
  if (!isDataExportEnabled()) return new NextResponse(null, { status: 404, headers: BASE_HEADERS });
  if (!isSameOrigin(request)) return json({ error: "forbidden" }, 403);

  const supabase = await createSupabaseServerClient();
  const identity: AdminIdentity = await getAdminIdentity(supabase, { fresh: true });
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

  try {
    const result = isDirectExportEnabled() ? await runDirect(exportRequest, mode) : await runViaEdge(supabase, exportRequest);
    return sendDownload(
      buildExportDownload(result, exportRequest, {
        mode,
        now: new Date(),
        exportedBy: identity.email ?? identity.userId,
      }),
    );
  } catch (error) {
    if (error instanceof ExportRouteError) return json({ error: error.code }, error.status);
    if (error instanceof ExportError) {
      return error.code === "session_not_found"
        ? json({ error: "session_not_found" }, 404)
        : json({ error: "dataset_unavailable" }, 422);
    }
    console.error("[DataExport] Export failed:", error);
    return json({ error: "export_failed" }, 500);
  }
}
