import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'pretest' or 'posttest'

    if (!type || (type !== "pretest" && type !== "posttest")) {
      return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
    }

    const pool = getDatabasePool();
    const questionsQuery = `
      SELECT * FROM quiz_questions 
      WHERE test_type = $1 
      ORDER BY sort_order ASC;
    `;
    const questionsResult = await pool.query(questionsQuery, [type]);
    const questions = questionsResult.rows;

    if (questions.length === 0) {
      return NextResponse.json([]);
    }

    const questionIds = questions.map((q: any) => q.id);
    const optionsQuery = `
      SELECT * FROM quiz_options 
      WHERE question_id = ANY($1) 
      ORDER BY created_at ASC;
    `;
    const optionsResult = await pool.query(optionsQuery, [questionIds]);
    const options = optionsResult.rows;

    const quiz = questions.map((q: any) => ({
      ...q,
      options: options.filter((o: any) => o.question_id === q.id),
    }));

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("Error in GET /api/quiz-questions:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
