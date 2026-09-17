import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabasePool } from "@/lib/database";
import { isSupportedLeaderboardGid, type LeaderboardEntry } from "@/lib/leaderboard";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const gid = request.nextUrl.searchParams.get("gid")?.toUpperCase() ?? "";
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const requestedPlayerUuid = request.nextUrl.searchParams.get("player_uuid");

  if (!isSupportedLeaderboardGid(gid)) {
    return NextResponse.json({ error: "ไม่พบเกมที่ต้องการดูอันดับ" }, { status: 400 });
  }

  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > MAX_LIMIT) {
    return NextResponse.json(
      { error: `limit ต้องเป็นจำนวนเต็มระหว่าง 1–${MAX_LIMIT}` },
      { status: 400 },
    );
  }

  const parsedPlayerUuid = requestedPlayerUuid
    ? z.string().uuid().safeParse(requestedPlayerUuid)
    : null;
  if (parsedPlayerUuid && !parsedPlayerUuid.success) {
    return NextResponse.json({ error: "player_uuid ไม่ถูกต้อง" }, { status: 400 });
  }
  const playerUuid = parsedPlayerUuid?.data ?? null;

  try {
    const pool = getDatabasePool();

    // อันดับจริงของผู้เล่นปัจจุบัน คำนวณ DENSE_RANK ข้ามทั้งเกม (ไม่ติด LIMIT)
    // เพื่อให้รู้อันดับแม้จะหลุดจาก top-N ที่แสดงบนกระดาน (เลือกแถวคะแนนดีที่สุดของผู้เล่น)
    const currentPlayerQuery = playerUuid
      ? pool.query<LeaderboardEntry>(
          `SELECT id, rank, name, score, created_at
           FROM (
             SELECT
               id,
               player_uuid,
               name,
               score,
               created_at,
               DENSE_RANK() OVER (ORDER BY score DESC)::integer AS rank
             FROM player_info
             WHERE gid = $1
               AND score IS NOT NULL
           ) ranked
           WHERE player_uuid = $2::uuid
           ORDER BY score DESC, created_at ASC
           LIMIT 1`,
          [gid, playerUuid],
        )
      : Promise.resolve(null);

    const [gameResult, leaderboardResult, currentPlayerResult] = await Promise.all([
      pool.query<{ gid: string; name: string }>(
        `SELECT gid, name
         FROM game_id
         WHERE gid = $1
         LIMIT 1`,
        [gid],
      ),
      pool.query<LeaderboardEntry>(
        `SELECT
           id,
           DENSE_RANK() OVER (ORDER BY score DESC)::integer AS rank,
           name,
           score,
           created_at,
           CASE
             WHEN $3::uuid IS NULL THEN false
             ELSE player_uuid = $3::uuid
           END AS is_current_player
         FROM player_info
         WHERE gid = $1
           AND score IS NOT NULL
         ORDER BY score DESC, created_at ASC
         LIMIT $2`,
        [gid, requestedLimit, playerUuid],
      ),
      currentPlayerQuery,
    ]);

    const currentPlayerRow = currentPlayerResult?.rows[0];
    const currentPlayer: LeaderboardEntry | null = currentPlayerRow
      ? { ...currentPlayerRow, is_current_player: true }
      : null;

    if (gameResult.rowCount === 0) {
      return NextResponse.json({ error: "ยังไม่ได้เปิดใช้ Leaderboard สำหรับเกมนี้" }, { status: 404 });
    }

    return NextResponse.json(
      {
        game: gameResult.rows[0],
        entries: leaderboardResult.rows,
        currentPlayer,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error in GET /api/leaderboard:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดกระดานคะแนนได้" }, { status: 500 });
  }
}
