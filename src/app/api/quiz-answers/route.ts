import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pool = getDatabasePool();

    if (Array.isArray(body)) {
      // Batch answers insertion
      const insertedRows = [];
      for (const ans of body) {
        const { attempt_id, question_id, selected_option_id, is_correct } = ans;
        const queryText = `
          INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct, created_at)
          VALUES ($1, $2, $3, $4, NOW())
          RETURNING *;
        `;
        const res = await pool.query(queryText, [attempt_id, question_id, selected_option_id, is_correct]);
        insertedRows.push(res.rows[0]);
      }
      return NextResponse.json({ success: true, answers: insertedRows }, { status: 201 });
    } else {
      // Single answer insertion (original compatibility)
      const { attempt_id, question_id, selected_option_id, is_correct } = body;
      const queryText = `
        INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
      `;
      const result = await pool.query(queryText, [attempt_id, question_id, selected_option_id, is_correct]);
      return NextResponse.json({ success: true, answer: result.rows[0] }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error in POST /api/quiz-answers:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
