import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";

type QuizQuestionRow = { id: string } & Record<string, unknown>;
type QuizOptionRow = { question_id: string } & Record<string, unknown>;

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
    const questionsResult = await pool.query<QuizQuestionRow>(questionsQuery, [type]);
    const questions = questionsResult.rows;

    if (questions.length === 0) {
      return NextResponse.json([]);
    }

    const questionIds = questions.map((q) => q.id);
    const optionsQuery = `
      SELECT * FROM quiz_options 
      WHERE question_id = ANY($1) 
      ORDER BY created_at ASC;
    `;
    const optionsResult = await pool.query<QuizOptionRow>(optionsQuery, [questionIds]);
    const options = optionsResult.rows;

    const quiz = questions.map((q) => ({
      ...q,
      options: options.filter((o) => o.question_id === q.id),
    }));

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error in GET /api/quiz-questions:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
