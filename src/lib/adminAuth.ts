import type { AppMode } from "@/services/progressService";

/**
 * Staff-only data export (docs/software/12-data-export-page.md). Server code only.
 *
 * Accounts live in the Supabase Auth of the server the site runs on and are created by staff in
 * Supabase Studio. Any non-anonymous account may export (no role check since 2026-11-06), so
 * sign-ups must stay disabled in that Supabase Auth.
 */

export interface SupabaseAuthConfig {
  url: string;
  key: string;
}

/** Runtime env (not NEXT_PUBLIC_*): one Docker image serves both servers, each with its own Supabase. */
export function getSupabaseAuthConfig(): SupabaseAuthConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

let warnedMissingConfig = false;

/** The page and its API exist only when Supabase Auth is configured; otherwise they answer 404. */
export function isDataExportEnabled(): boolean {
  const enabled = getSupabaseAuthConfig() !== null;
  if (!enabled && !warnedMissingConfig) {
    warnedMissingConfig = true;
    console.info("[DataExport] SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY not set — /admin is disabled.");
  }
  return enabled;
}

/**
 * Which server's data this site holds. Read from APP_MODE only — the dev mode-switch cookie that
 * getServerAppMode() honours must not change where exported data is said to come from.
 */
export function getExportMode(): AppMode {
  return process.env.APP_MODE?.trim().toLowerCase() === "research" ? "research" : "normal";
}

/** `next` after login: only paths inside /admin, so the login form can't be used as an open redirect. */
export function safeAdminNext(next: unknown): string {
  if (typeof next !== "string") return "/admin/data-export";
  if (!/^\/admin(\/[A-Za-z0-9/_-]*)?$/.test(next) || next.startsWith("/admin/login")) return "/admin/data-export";
  return next;
}
