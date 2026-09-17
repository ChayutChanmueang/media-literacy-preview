import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";
import {
  getLeaderboardMaxScore,
  isSupportedLeaderboardGid,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { leaderboardResultSchema } from "@/lib/validations";

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const submissionTimes = new Map<string, number[]>();

function isRateLimited(key: string, now = Date.now()): boolean {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recentSubmissions = (submissionTimes.get(key) ?? []).filter(
    (submittedAt) => submittedAt > windowStart,
  );

  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    submissionTimes.set(key, recentSubmissions);
    return true;
  }

  recentSubmissions.push(now);
  submissionTimes.set(key, recentSubmissions);
  return false;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลคะแนนไม่ถูกต้อง" }, { status: 400 });
  }

  const parsedResult = leaderboardResultSchema.safeParse(body);
  if (!parsedResult.success) {
    return NextResponse.json(
      { error: "ชื่อ ผู้เล่น เกม หรือคะแนนไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const { attempt_uuid, player_uuid, name, gid, score } = parsedResult.data;
  const maxScore = getLeaderboardMaxScore(gid);
  if (!isSupportedLeaderboardGid(gid) || maxScore === null || score > maxScore) {
    return NextResponse.json({ error: "คะแนนหรือรหัสเกมอยู่นอกช่วงที่กำหนด" }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rateLimitKey = `${forwardedFor ?? "unknown"}:${player_uuid}:${gid}`;
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: "ส่งคะแนนถี่เกินไป กรุณารอสักครู่แล้วลองใหม่" },
      { status: 429 },
    );
  }

  try {
    const result = await getDatabasePool().query<LeaderboardEntry>(
      `INSERT INTO player_info (attempt_uuid, player_uuid, name, gid, score)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (attempt_uuid) DO NOTHING
       RETURNING id, name, gid, score, created_at`,
      [attempt_uuid, player_uuid, name, gid, score],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ duplicate: true }, { status: 200 });
    }

    return NextResponse.json({ result: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/game-results:", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกคะแนนได้" }, { status: 500 });
  }
}
