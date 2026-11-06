import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import * as readDatabase from "./read-database/actions.ts";

/**
 * Router for the staff data export. Pattern follows the MCI `mci_functions` router
 * (path → service → action). Auth does not: MCI accepts the anon key, this function
 * requires a signed-in user whose app_metadata.role is data_exporter. Research rows
 * are not readable with the anon key.
 */

console.log("ml_functions started");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const SERVICE_MAP: Record<string, Record<string, (body: unknown) => Promise<Response>>> = {
  "read-database": readDatabase,
};

const DATA_EXPORTER_ROLE = "data_exporter";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function requireExporter(authHeader: string): Promise<Response | null> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("ANON_KEY") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!url || !anonKey || !token) return json({ error: "unauthenticated" }, 401);

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  const role = data.user?.app_metadata?.role;
  if (error || !data.user || role !== DATA_EXPORTER_ROLE) {
    return json({ error: data.user ? "forbidden" : "unauthenticated" }, data.user ? 403 : 401);
  }
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "invalid_request" }, 400);

  try {
    const pathParts = new URL(req.url).pathname.split("/").filter(Boolean);
    const serviceIndex = pathParts.findIndex((part) => SERVICE_MAP[part] !== undefined);
    const serviceName = pathParts[serviceIndex] ?? "";
    const actionName = pathParts[serviceIndex + 1] ?? "";
    if (!serviceName) return json({ error: "Missing service name in path" }, 400);

    const module = SERVICE_MAP[serviceName];
    if (!module) return json({ error: `Service not found: ${serviceName}` }, 404);
    if (!actionName) return json({ error: "Missing action name in path" }, 400);
    if (typeof module[actionName] !== "function") return json({ error: `Action not found: ${actionName}` }, 404);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthenticated" }, 401);
    const denied = await requireExporter(authHeader);
    if (denied) return denied;

    const params = await req.json().catch(() => null);
    const result = await module[actionName](params);
    const body = await result.text();
    return new Response(body, {
      status: result.status,
      headers: { ...Object.fromEntries(result.headers), ...CORS_HEADERS },
    });
  } catch (error) {
    console.error(error);
    return json({ error: "export_failed" }, 500);
  }
});
