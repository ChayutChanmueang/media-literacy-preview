import dns from "node:dns";
import pg, { type QueryResult, type QueryResultRow } from "pg";

declare global {
  var mediaLiteracyDatabasePool: pg.Pool | undefined;
}

let productionPool: pg.Pool | undefined;

// Node normally preserves the DNS answer order. Prefer IPv4 when a Supabase
// pooler returns both A and AAAA records because some deployment networks do
// not provide an IPv6 route.
dns.setDefaultResultOrder("ipv4first");

export function validateDatabaseConnectionString(connectionString: string): string {
  const trimmedConnectionString = connectionString.trim();
  let databaseUrl: URL;

  try {
    databaseUrl = new URL(trimmedConnectionString);
  } catch {
    throw new Error("[Database] DATABASE_URL is not a valid PostgreSQL URL.");
  }

  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    throw new Error("[Database] DATABASE_URL must use the postgres:// or postgresql:// protocol.");
  }

  // db.<project-ref>.supabase.co is Supabase's direct host. It is IPv6-only
  // for many projects and does not become a transaction pooler by changing
  // its port to 6543.
  if (databaseUrl.hostname.startsWith("db.") && databaseUrl.port === "6543") {
    throw new Error(
      "[Database] Invalid Supabase host/port combination: db.<project-ref>.supabase.co is the direct host. " +
        "For IPv4, copy the Transaction pooler connection string from Supabase Dashboard (pooler.supabase.com:6543).",
    );
  }

  return trimmedConnectionString;
}

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[Database] DATABASE_URL is not defined. Add the Supabase Postgres connection string to .env.",
    );
  }

  return validateDatabaseConnectionString(connectionString);
}

function createDatabasePool(): pg.Pool {
  const isProduction = process.env.NODE_ENV === "production";
  const pool = new pg.Pool({
    connectionString: getConnectionString(),
    max: isProduction ? 3 : 10,
    idleTimeoutMillis: isProduction ? 15_000 : 30_000,
    connectionTimeoutMillis: isProduction ? 4_000 : 3_000,
  });

  pool.on("error", (error) => {
    console.error("[Database] Unexpected idle client error:", error);
  });

  return pool;
}

export function getDatabasePool(): pg.Pool {
  if (process.env.NODE_ENV === "production") {
    productionPool ??= createDatabasePool();
    return productionPool;
  }

  if (!globalThis.mediaLiteracyDatabasePool) {
    globalThis.mediaLiteracyDatabasePool = createDatabasePool();
  }

  return globalThis.mediaLiteracyDatabasePool;
}

export async function queryDatabase<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<QueryResult<Row>> {
  return getDatabasePool().query<Row>(text, [...values]);
}

export async function checkDatabaseConnection(): Promise<void> {
  await queryDatabase("SELECT 1");
}
