import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, page_path, referrer, duration_seconds } = body;

    const pool = getDatabasePool();

    // Ensure session exists to avoid foreign key violations
    const isUuid = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (session_id && isUuid(session_id)) {
      await pool.query(
        `INSERT INTO sessions (id, age_range, role, location_consent, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [session_id, "unknown", "elder", false]
      );
    }

    const queryText = `
      INSERT INTO page_views (session_id, page_path, referrer, duration_seconds, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;

    const result = await pool.query(queryText, [
      session_id && isUuid(session_id) ? session_id : null,
      page_path,
      referrer || null,
      duration_seconds || 0,
    ]);

    return NextResponse.json({ success: true, page_view: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/page-views:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
