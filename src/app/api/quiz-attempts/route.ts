import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, test_type, score, completed_at } = body;

    const pool = getDatabasePool();
    const queryText = `
      INSERT INTO quiz_attempts (session_id, test_type, score, completed_at, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (session_id, test_type) DO UPDATE SET
        score = EXCLUDED.score,
        completed_at = EXCLUDED.completed_at
      RETURNING *;
    `;

    const result = await pool.query(queryText, [
      session_id,
      test_type,
      score,
      completed_at || new Date().toISOString(),
    ]);

    return NextResponse.json({ success: true, attempt: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/quiz-attempts:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
