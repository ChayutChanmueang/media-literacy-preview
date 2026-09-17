import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";
import { getActionLogAnalytics } from "@/lib/analytics";

const isValidIsoDate = (value: string) => !Number.isNaN(new Date(value).getTime());

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    if ((from && !isValidIsoDate(from)) || (to && !isValidIsoDate(to))) {
      return NextResponse.json({ error: "Invalid 'from' or 'to' date" }, { status: 400 });
    }

    const analytics = await getActionLogAnalytics({
      from,
      to,
      eventName: searchParams.get("event_name") || undefined,
      sessionId: searchParams.get("session_id") || undefined,
    });

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("Error in GET /api/action-logs:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, event_name, page_url, payload } = body;

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
      INSERT INTO action_logs (session_id, event_name, page_url, payload, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;

    const result = await pool.query(queryText, [
      session_id && isUuid(session_id) ? session_id : null,
      event_name,
      page_url || null,
      payload ? JSON.stringify(payload) : null,
    ]);

    return NextResponse.json({ success: true, log: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/action-logs:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
