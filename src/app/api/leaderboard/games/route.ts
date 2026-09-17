import { NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";
import { BROWSABLE_LEADERBOARD_GAMES } from "@/lib/leaderboard";

interface BrowsableGamePayload {
  gid: string;
  lessonId: string;
  name: string;
  icon: string | null;
}

/**
 * US-CF-52: รายชื่อเกมที่เปิดให้ browse กระดานคะแนน โดย "ชื่อเกมมาจากฐานข้อมูลเท่านั้น"
 * ใช้โดย popup เลือกเกม (LeaderboardGamePicker) — lessonId/icon มาจาก config, name มาจากตาราง game_id
 * (ไม่มีชื่อ hardcode ใน config เพื่อกันชื่อในแอปหลุดจากชื่อใน DB)
 */
export async function GET() {
  try {
    const gids = BROWSABLE_LEADERBOARD_GAMES.map((game) => game.gid);
    const pool = getDatabasePool();
    const result = await pool.query<{ gid: string; name: string }>(
      `SELECT gid, name FROM game_id WHERE gid = ANY($1)`,
      [gids],
    );
    const nameByGid = new Map(result.rows.map((row) => [row.gid, row.name]));

    // แสดงเฉพาะเกมที่มีชื่อในฐานข้อมูลจริง
    const games: BrowsableGamePayload[] = BROWSABLE_LEADERBOARD_GAMES.flatMap((game) => {
      const name = nameByGid.get(game.gid);
      if (!name) return [];
      return [{ gid: game.gid, lessonId: game.lessonId, name, icon: game.icon ?? null }];
    });

    return NextResponse.json({ games }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error in GET /api/leaderboard/games:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดรายชื่อเกมได้" }, { status: 500 });
  }
}
