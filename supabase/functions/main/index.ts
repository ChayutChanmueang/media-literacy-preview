import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

/**
 * Entrypoint the self-hosted edge runtime calls. It checks the JWT, then hands the request
 * to the function named by the first path segment (`/ml_functions/...`).
 */

console.log("main function started");

const JWT_SECRET = Deno.env.get("JWT_SECRET");
const VERIFY_JWT = Deno.env.get("VERIFY_JWT") === "true";

function getAuthToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("Missing authorization header");
  const [bearer, token] = authHeader.split(" ");
  if (bearer !== "Bearer" || !token) throw new Error("Auth header is not 'Bearer {token}'");
  return token;
}

async function verifyJWT(jwt: string): Promise<boolean> {
  if (!JWT_SECRET) return false;
  try {
    await jose.jwtVerify(jwt, new TextEncoder().encode(JWT_SECRET));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method !== "OPTIONS" && VERIFY_JWT) {
    try {
      const ok = await verifyJWT(getAuthToken(req));
      if (!ok) {
        return new Response(JSON.stringify({ error: "unauthenticated" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const pathParts = new URL(req.url).pathname.split("/");
  const serviceName = pathParts[1];
  if (!serviceName) {
    return new Response(JSON.stringify({ error: "missing function name in request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const servicePath = `/home/deno/supabase/functions/${serviceName}`;
  const envVarsObj = Deno.env.toObject();
  const envVars = Object.keys(envVarsObj).map((key) => [key, envVarsObj[key]]);

  try {
    // EdgeRuntime is injected by the self-hosted edge-runtime image.
    // @ts-ignore EdgeRuntime is not a Deno standard global
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath,
      memoryLimitMb: 256,
      workerTimeoutMs: 120_000,
      noModuleCache: false,
      importMapPath: `${servicePath}/deno.json`,
      envVars,
    });
    return await worker.fetch(req);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "export_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
