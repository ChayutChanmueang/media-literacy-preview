import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuthConfig } from "@/lib/adminAuth";

/**
 * Supabase Auth for the staff-only /admin pages (docs/software/12). The browser never talks to
 * Supabase: login and session checks run here, so the auth cookies can be httpOnly.
 * A new client per request — never share one between requests.
 */

type CookieOptions = Record<string, unknown>;

/** Every auth cookie is httpOnly + SameSite=Lax, and Secure outside dev. */
export function hardenCookieOptions(options: CookieOptions | undefined): CookieOptions {
  return {
    ...options,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
  };
}

function requireConfig() {
  const config = getSupabaseAuthConfig();
  if (!config) throw new Error("[DataExport] Supabase Auth is not configured");
  return config;
}

/** For Server Components, Server Actions and Route Handlers. */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const { url, key } = requireConfig();
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) store.set(name, value, hardenCookieOptions(options));
        } catch {
          // Server Components can't write cookies; proxy.ts refreshes the session before they run.
        }
      },
    },
  });
}

/** For proxy.ts: refreshes the session and writes the new cookies to both the request and `response`. */
export function createSupabaseProxyClient(request: NextRequest, getResponse: () => NextResponse) {
  const { url, key } = requireConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        const response = getResponse();
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, hardenCookieOptions(options));
        for (const [header, value] of Object.entries(headers ?? {})) response.headers.set(header, value);
      },
    },
  });
}

export type AdminIdentity =
  | { status: "anonymous" }
  | { status: "forbidden"; userId: string; email: string | null }
  | { status: "ok"; userId: string; email: string | null };

/**
 * Who is signed in. `fresh: false` verifies the JWT (getClaims) — for pages. `fresh: true` asks the
 * Auth server (getUser) so a deleted user stops working at once — for the export API.
 * Never getSession(): it does not verify the token.
 *
 * Any real account of this server's Supabase Auth may export (the data_exporter role check was dropped
 * 2026-11-06 — docs/software/12 §5.2), so sign-ups MUST stay disabled in Supabase Auth. Anonymous
 * Supabase sessions are always refused: with anonymous sign-ins on, anyone could get one without credentials.
 */
export async function getAdminIdentity(supabase: SupabaseClient, { fresh }: { fresh: boolean }): Promise<AdminIdentity> {
  if (fresh) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { status: "anonymous" };
    const base = { userId: data.user.id, email: data.user.email ?? null };
    return data.user.is_anonymous ? { status: "forbidden", ...base } : { status: "ok", ...base };
  }

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return { status: "anonymous" };
  const base = { userId: String(claims.sub), email: typeof claims.email === "string" ? claims.email : null };
  return claims.is_anonymous === true ? { status: "forbidden", ...base } : { status: "ok", ...base };
}
