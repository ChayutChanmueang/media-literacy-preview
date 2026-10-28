import { ensureSessionRow } from "@/lib/sessionRows";
import type { SelfAssessmentPhase } from "@/lib/selfAssessmentPhase";
import type { SelfAssessmentSubmissionInput } from "@/lib/validations";

// Server-side reads/writes for the research pre/post self-assessment tables
// (self_assessment_submissions + self_assessment_answers, DDL in docs/supabase-schema.sql).

export interface DbResult<Row> {
  rows: Row[];
}

export interface DbClient {
  query<Row extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<DbResult<Row>>;
  release(): void;
}

/** The subset of pg.Pool used here (tests pass a PGlite-backed stand-in). */
export interface DbPool {
  connect(): Promise<DbClient>;
  query<Row extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<DbResult<Row>>;
}

export interface SavedSubmission {
  submission_uuid: string;
  phase: SelfAssessmentPhase;
  received_at: string;
}

export type DuplicateReason = "same_submission" | "phase_already_done";

export type SaveResult =
  | { status: "created"; submission: SavedSubmission }
  | { status: "duplicate"; reason: DuplicateReason };

export type SelfAssessmentStatus = Record<SelfAssessmentPhase, boolean>;

/**
 * Saves one submission and its answers in a single transaction, so a submission row never
 * exists without its answers. Expects input already checked by selfAssessmentSubmissionSchema
 * and findItemSetProblem().
 *
 * Resending the same submission_uuid, or a second non-dev-skip submission for a phase the
 * session already did, saves nothing and reports a duplicate (uq_sa_submissions_once_per_phase).
 */
export async function saveSelfAssessmentSubmission(
  pool: DbPool,
  input: SelfAssessmentSubmissionInput,
): Promise<SaveResult> {
  // A wrong device clock must not lose the answers: drop started_at rather than fail the CHECK.
  const startedAt =
    input.started_at && Date.parse(input.started_at) <= Date.parse(input.submitted_at)
      ? input.started_at
      : null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await ensureSessionRow(client, input.session_id);

    const inserted = await client.query<SavedSubmission & Record<string, unknown>>(
      `INSERT INTO self_assessment_submissions
         (submission_uuid, session_id, phase, item_set, started_at, submitted_at,
          app_mode, app_version, is_dev_skip, source, client_meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'client', $10)
       ON CONFLICT DO NOTHING
       RETURNING submission_uuid, phase, received_at`,
      [
        input.submission_uuid,
        input.session_id,
        input.phase,
        input.item_set,
        startedAt,
        input.submitted_at,
        input.app_mode,
        input.app_version ?? null,
        input.is_dev_skip,
        JSON.stringify(input.client_meta ?? {}),
      ],
    );

    if (inserted.rows.length === 0) {
      await client.query("ROLLBACK");
      return { status: "duplicate", reason: await findDuplicateReason(pool, input.submission_uuid) };
    }

    // item_order is the on-screen order, so position i (0-based) becomes shown_position i + 1
    await client.query(
      `INSERT INTO self_assessment_answers (submission_uuid, item_set, item_id, value, shown_position)
       SELECT $1, $2, t.item_id, t.value, t.shown_position
       FROM unnest($3::text[], $4::smallint[], $5::smallint[]) AS t(item_id, value, shown_position)`,
      [
        input.submission_uuid,
        input.item_set,
        input.item_order,
        input.item_order.map((itemId) => input.answers[itemId]),
        input.item_order.map((_, index) => index + 1),
      ],
    );

    await client.query("COMMIT");
    return { status: "created", submission: normaliseSaved(inserted.rows[0]) };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function findDuplicateReason(pool: DbPool, submissionUuid: string): Promise<DuplicateReason> {
  const existing = await pool.query(
    "SELECT 1 FROM self_assessment_submissions WHERE submission_uuid = $1",
    [submissionUuid],
  );
  return existing.rows.length > 0 ? "same_submission" : "phase_already_done";
}

function normaliseSaved(row: SavedSubmission & Record<string, unknown>): SavedSubmission {
  const receivedAt = row.received_at as unknown;
  return {
    submission_uuid: row.submission_uuid,
    phase: row.phase,
    received_at: receivedAt instanceof Date ? receivedAt.toISOString() : String(receivedAt),
  };
}

/** Which phases a session has already submitted (dev-skip rows don't count; backfilled rows do). */
export async function getSelfAssessmentStatus(
  pool: DbPool,
  sessionId: string,
): Promise<SelfAssessmentStatus> {
  const result = await pool.query<{ phase: SelfAssessmentPhase }>(
    `SELECT DISTINCT phase FROM self_assessment_submissions
     WHERE session_id = $1 AND NOT is_dev_skip`,
    [sessionId],
  );
  const done = new Set(result.rows.map((row) => row.phase));
  return { pre: done.has("pre"), post: done.has("post") };
}
