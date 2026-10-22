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
  // เกมสนุก G18–G20 (โหมดอิสระ) — เดิมเป็นกระดานในเครื่อง (localOnly) ย้ายมาใช้ DB แล้ว ชื่อเกมดึงจาก game_id
  g18: { lessonId: "g18", gid: "G18", icon: "/assets/icons/g18-simon.png" },
  g19: { lessonId: "g19", gid: "G19", icon: "/assets/icons/g19-fruit-match.png" },
  g20: { lessonId: "g20", gid: "G20", icon: "/assets/icons/g20-veggie-tross.png" },
  // G20K = อีกรุ่นของ G20 (ของจริงจะเหลือรุ่นเดียว) จึงใช้กระดานเดียวกับ G20 (gid "G20")
  // ไม่อยู่ใน BROWSABLE_LEADERBOARD_GAMES — เมนูเลือกเกมเปิดกระดาน G20 ผ่าน g20 อยู่แล้ว
  g20k: { lessonId: "g20k", gid: "G20", icon: "/assets/icons/g20-veggie-tross.png" },
};

// เกมที่ยังไม่ต่อฐานข้อมูล: มีกระดานคะแนนแต่เก็บในเครื่องอย่างเดียว ไม่ส่ง/ไม่ดึงจาก DB (ใส่ localOnly + name)
// ตอนนี้ไม่มีเกมในกลุ่มนี้แล้ว (G18–G20K ย้ายไป DB) — เก็บกลไกไว้สำหรับเกมทดลองในอนาคต
// ไม่รวมใน SUPPORTED_GIDS โดยตั้งใจ — API จะปฏิเสธ gid เหล่านี้
const LOCAL_LEADERBOARD_GAMES: Record<string, LeaderboardGame> = {};

export const LOCAL_BROWSABLE_LEADERBOARD_GAMES: LeaderboardGame[] = Object.values(LOCAL_LEADERBOARD_GAMES);

// US-CF-52: เกมที่เก็บคะแนนจริงและเปิดให้ browse กระดานคะแนนจากเมนู
// เพิ่มเกมใหม่ที่นี่เมื่อพร้อมเล่น+เก็บคะแนน โดยไม่ต้องแก้ UI
export const BROWSABLE_LEADERBOARD_GAMES: LeaderboardGame[] = [
  LEADERBOARD_GAMES["flow-g13"],
  LEADERBOARD_GAMES["g18"],
  LEADERBOARD_GAMES["g19"],
  LEADERBOARD_GAMES["g20"],
];

const SUPPORTED_GIDS = new Set(Object.values(LEADERBOARD_GAMES).map((game) => game.gid));
const MAX_SCORE_BY_GID: Record<string, number> = {
  G1: 1_000,
  G2: 1_000,
  G3: 1_000,
  G5: 1_000,
  G6: 1_000,
  G13: 500,
  // G18 เล่นได้ไม่สิ้นสุด (คะแนน = จำนวนด่านที่ผ่าน) — ตั้งสูงกว่าที่คนจำลำดับไฟได้จริงพอสมควร
  G18: 100,
  // G19 สลับได้ 20 ครั้ง ครั้งละไม่เกินราว 500 (🌟+🌟 ล้างทั้งกระดาน 25 ชิ้น × 20) + เรียงต่อ — เผื่อไว้
  G19: 20_000,
  // G20/G20K โยนได้ 15 ครั้งต่อรอบ คะแนน = จำนวนจานที่เสิร์ฟได้
  G20: 15,
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
