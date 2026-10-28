import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";
import { ensureSessionRow, isUuid } from "@/lib/sessionRows";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, page_path, referrer, duration_seconds } = body;

    const pool = getDatabasePool();

    // Ensure session exists to avoid foreign key violations
    if (isUuid(session_id)) {
      await ensureSessionRow(pool, session_id);
    }

    const queryText = `
      INSERT INTO page_views (session_id, page_path, referrer, duration_seconds, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;

    const result = await pool.query(queryText, [
      isUuid(session_id) ? session_id : null,
      page_path,
      referrer || null,
      duration_seconds || 0,
    ]);

    return NextResponse.json({ success: true, page_view: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/page-views:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
