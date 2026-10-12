export interface LeaderboardGame {
  lessonId: string;
  gid: string;
  // ไอคอนเกม (path ของ asset หรือ emoji) — ใช้ใน popup เลือกเกม (US-CF-52); optional เพราะเกมที่ไม่ browse ไม่ต้องมี
  icon?: string;
  // เกมที่ยังไม่ต่อฐานข้อมูล: คะแนนเก็บ/อ่านจากเครื่องผู้เล่นเท่านั้น (localLeaderboardService) ไม่ยิง API
  localOnly?: boolean;
  // ชื่อเกม — ใส่เฉพาะเกม localOnly (ยังไม่มีแถวในตาราง game_id); เกมที่ต่อ DB แล้วต้องดึงชื่อจาก DB
  name?: string;
}
// หมายเหตุ: ชื่อเกมของเกมที่ต่อ DB ไม่เก็บใน config (กัน hardcode หลุดจาก DB) — ดึงจากตาราง game_id เสมอ

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  created_at: string;
  is_current_player?: boolean;
}

export interface LeaderboardResponse {
  game: {
    gid: string;
    name: string;
  };
  entries: LeaderboardEntry[];
  // อันดับจริงของผู้เล่นปัจจุบัน แม้จะหลุดจาก top-N ที่แสดงในกระดาน (null เมื่อไม่ระบุ player_uuid หรือยังไม่มีคะแนน)
  currentPlayer?: LeaderboardEntry | null;
}

const LEADERBOARD_GAMES: Record<string, LeaderboardGame> = {
  "topic-1": { lessonId: "topic-1", gid: "G1" },
  "topic-2": { lessonId: "topic-2", gid: "G2" },
  "topic-3": { lessonId: "topic-3", gid: "G3" },
  "topic-5": { lessonId: "topic-5", gid: "G5" },
  "topic-6": { lessonId: "topic-6", gid: "G6" },
  "flow-g13": {
    lessonId: "flow-g13",
    gid: "G13",
    icon: "/assets/icons/g13-ice-cream.jpg",
  },
};

// เกมสนุกที่ยังไม่ต่อฐานข้อมูล (G18–G20): มีกระดานคะแนนแต่เก็บในเครื่องอย่างเดียว ไม่ส่ง/ไม่ดึงจาก DB
// ตอนต่อ DB: เพิ่มแถวในตาราง game_id, ย้ายเข้า LEADERBOARD_GAMES + BROWSABLE + MAX_SCORE_BY_GID แล้วลบ localOnly/name ออก
// ไม่รวมใน SUPPORTED_GIDS โดยตั้งใจ — API จะยังปฏิเสธ gid เหล่านี้อยู่
const LOCAL_LEADERBOARD_GAMES: Record<string, LeaderboardGame> = {
  g18: { lessonId: "g18", gid: "G18", localOnly: true, name: "จำให้ขึ้นใจ", icon: "/images/lessons/category-fun.png" },
  g19: { lessonId: "g19", gid: "G19", localOnly: true, name: "เรียงผลไม้", icon: "/images/lessons/category-fun.png" },
  g20: { lessonId: "g20", gid: "G20", localOnly: true, name: "ผักบุ้งลอยฟ้า", icon: "/images/lessons/category-fun.png" },
};

export const LOCAL_BROWSABLE_LEADERBOARD_GAMES: LeaderboardGame[] = Object.values(LOCAL_LEADERBOARD_GAMES);

// US-CF-52: เกมที่เก็บคะแนนจริงและเปิดให้ browse กระดานคะแนนจากเมนู (ตอนนี้พร้อมเฉพาะ G13)
// เพิ่มเกมใหม่ที่นี่เมื่อพร้อมเล่น+เก็บคะแนน โดยไม่ต้องแก้ UI
export const BROWSABLE_LEADERBOARD_GAMES: LeaderboardGame[] = [LEADERBOARD_GAMES["flow-g13"]];

const SUPPORTED_GIDS = new Set(Object.values(LEADERBOARD_GAMES).map((game) => game.gid));
const MAX_SCORE_BY_GID: Record<string, number> = {
  G1: 1_000,
  G2: 1_000,
  G3: 1_000,
  G5: 1_000,
  G6: 1_000,
  G13: 500,
};

export function getLeaderboardGame(lessonId: string): LeaderboardGame | null {
  return LEADERBOARD_GAMES[lessonId] ?? LOCAL_LEADERBOARD_GAMES[lessonId] ?? null;
}

export function isSupportedLeaderboardGid(gid: string): boolean {
  return SUPPORTED_GIDS.has(gid);
}

export function getLeaderboardMaxScore(gid: string): number | null {
  return MAX_SCORE_BY_GID[gid] ?? null;
}
