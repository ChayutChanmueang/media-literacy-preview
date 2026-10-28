/** Anything that can run a parameterised query: a pg Pool or a checked-out PoolClient. */
export interface SqlQueryable {
  query(text: string, values?: unknown[]): Promise<unknown>;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value);

/**
 * Makes sure a sessions row exists so rows that reference it don't break the FK.
 * Logs can arrive before POST /api/sessions (offline queue, consent not finished), so the
 * placeholder has age_range 'unknown'; /api/sessions fills in the real values later.
 */
export async function ensureSessionRow(db: SqlQueryable, sessionId: string): Promise<void> {
  await db.query(
    `INSERT INTO sessions (id, age_range, role, location_consent, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [sessionId, "unknown", "elder", false],
  );
}
