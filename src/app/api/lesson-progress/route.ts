import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, lesson_id, video_completed_at, game_completed_at } = body;

    const pool = getDatabasePool();
    const queryText = `
      INSERT INTO lesson_progress (session_id, lesson_id, video_completed_at, game_completed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (session_id, lesson_id) DO UPDATE SET
        video_completed_at = COALESCE(EXCLUDED.video_completed_at, lesson_progress.video_completed_at),
        game_completed_at = COALESCE(EXCLUDED.game_completed_at, lesson_progress.game_completed_at)
      RETURNING *;
    `;

    const result = await pool.query(queryText, [
      session_id,
      lesson_id,
      video_completed_at || null,
      game_completed_at || null,
    ]);

    return NextResponse.json({ success: true, progress: result.rows[0] });
  } catch (error: any) {
    console.error("Error in POST /api/lesson-progress:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
