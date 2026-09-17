import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      age_range,
      role,
      location_consent,
      selected_district,
      selected_sub_district,
      gps_latitude,
      gps_longitude,
      user_agent,
      device_metadata,
    } = body;

    const pool = getDatabasePool();
    const queryText = `
      INSERT INTO sessions (id, age_range, role, location_consent, selected_district, selected_sub_district, gps_latitude, gps_longitude, user_agent, device_metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (id) DO UPDATE SET
        age_range = EXCLUDED.age_range,
        role = EXCLUDED.role,
        location_consent = EXCLUDED.location_consent,
        selected_district = EXCLUDED.selected_district,
        selected_sub_district = EXCLUDED.selected_sub_district,
        gps_latitude = EXCLUDED.gps_latitude,
        gps_longitude = EXCLUDED.gps_longitude,
        user_agent = EXCLUDED.user_agent,
        device_metadata = EXCLUDED.device_metadata
      RETURNING *;
    `;

    const result = await pool.query(queryText, [
      id,
      age_range,
      role || "elder",
      location_consent,
      selected_district || null,
      selected_sub_district || null,
      gps_latitude || null,
      gps_longitude || null,
      user_agent || null,
      device_metadata ? JSON.stringify(device_metadata) : null,
    ]);

    return NextResponse.json({ success: true, session: result.rows[0] });
  } catch (error: any) {
    console.error("Error in POST /api/sessions:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
