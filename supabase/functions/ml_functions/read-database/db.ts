import postgres from "postgres";

/**
 * One pool for this isolate. Each export checks out a connection and keeps every statement
 * in one read-only snapshot, same as the Next route used to do with `pg`.
 */
let pool: ReturnType<typeof postgres> | null = null;

function getPool() {
  const url = Deno.env.get("SUPABASE_DB_URL");
  if (!url) throw new Error("SUPABASE_DB_URL is not set");
  pool ??= postgres(url, {
    max: 4,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return pool;
}

export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
}

export async function withReadOnlyDb<T>(fn: (db: Queryable) => Promise<T>): Promise<T> {
  return await getPool().begin("isolation level repeatable read read only", async (tx) => {
    await tx.unsafe("SET LOCAL statement_timeout = '60s'");
    const db: Queryable = {
      async query(text, values) {
        const rows = await tx.unsafe(text, (values ?? []) as never[]);
        return { rows: [...rows] };
      },
    };
    return await fn(db);
  });
}
