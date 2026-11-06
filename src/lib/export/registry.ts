import type { AppMode } from "./mode.ts";

/**
 * Datasets of the staff data export (docs/software/12) — shared by the API and the form.
 * "group" = columns in participants.csv (one row per person); "file" = its own CSV (many rows per person).
 */

export const GROUP_IDS = [
  "age",
  "location",
  "self_assessment",
  "usage_summary",
  "event_breakdown",
  "completion_funnel",
  "lesson_progress",
] as const;
export const FILE_IDS = ["event_log", "usage_detail", "leaderboard"] as const;

export type GroupId = (typeof GROUP_IDS)[number];
export type FileId = (typeof FILE_IDS)[number];
export type DatasetId = GroupId | FileId;
export type DatasetKind = "group" | "file";

export interface DatasetInfo {
  id: DatasetId;
  kind: DatasetKind;
  label: string;
  hint?: string;
  /** Modes whose server has this data; absent = both. */
  onlyIn?: AppMode;
}

export const DATASETS: readonly DatasetInfo[] = [
  { id: "age", kind: "group", label: "อายุ" },
  { id: "location", kind: "group", label: "ที่อยู่", hint: "จังหวัด / อำเภอ / ตำบล" },
  { id: "self_assessment", kind: "group", label: "แบบประเมินตนเองก่อน/หลังเรียน", onlyIn: "research" },
  {
    id: "usage_summary",
    kind: "group",
    label: "สรุปการใช้งาน",
    hint: "วันแรก/ล่าสุด, จำนวน event, จำนวนวัน/เดือนที่ใช้",
  },
  { id: "event_breakdown", kind: "group", label: "จำนวน event แยกตามประเภท", hint: "1 คอลัมน์ต่อ 1 ประเภท event" },
  { id: "completion_funnel", kind: "group", label: "Completion funnel", hint: "เวลาที่ไปถึงแต่ละขั้นครั้งแรก" },
  { id: "lesson_progress", kind: "group", label: "ความคืบหน้าบทเรียน", hint: "เวลาที่ดูคลิป/เล่นเกมจบ ต่อบท" },
  { id: "event_log", kind: "file", label: "Event log ทุก event", hint: "event_log.csv — 1 แถวต่อ 1 event" },
  {
    id: "usage_detail",
    kind: "file",
    label: "การใช้งานแยกรายวัน + รายเดือน",
    hint: "usage_daily.csv + usage_monthly.csv",
  },
  { id: "leaderboard", kind: "file", label: "คะแนน Leaderboard", hint: "leaderboard.csv — 1 แถวต่อการเล่น 1 รอบ", onlyIn: "normal" },
];

export const MODE_LABEL: Record<AppMode, string> = {
  normal: "โหมดปกติ",
  research: "โหมดวิจัย",
};

export const MODE_SITE_LABEL: Record<AppMode, string> = {
  normal: "เว็บโหมดปกติ (202)",
  research: "เว็บโหมดวิจัย (233)",
};

export type UnavailableReason = "other_mode" | "missing_in_db";

export interface DatasetAvailability {
  id: DatasetId;
  available: boolean;
  reason?: UnavailableReason;
}

/** What the export page knows about this site's DB (computed on the server for each page load). */
export interface ExportPageMeta {
  generatedAt: string;
  sessionCount: number;
  eventCount: number;
  datasets: DatasetAvailability[];
  /** false = a research site whose DB has no self-assessment tables (probably the wrong server). */
  dbMatchesMode: boolean;
  leaderboardWithoutSession: number | null;
}

/** Note shown after a disabled checkbox. */
export function unavailableNote(info: DatasetInfo, reason: UnavailableReason | undefined): string {
  if (reason === "other_mode" && info.onlyIn) return `เว็บนี้ไม่มีข้อมูลชุดนี้ — มีเฉพาะ${MODE_SITE_LABEL[info.onlyIn]}`;
  return "เว็บนี้ไม่มีข้อมูลชุดนี้ — ไม่พบตารางในฐานข้อมูลของเซิร์ฟเวอร์นี้";
}

/** participants.csv columns that don't depend on the data (for the preview in the form). */
export const STATIC_GROUP_COLUMNS: Record<GroupId, string[]> = {
  age: ["age_range"],
  location: ["province", "district", "sub_district"],
  self_assessment: [
    "sa_item_set",
    "sa_pre_submitted_at",
    "sa_pre_duration_sec",
    "sa_pre_total",
    "sa_pre_straight_line",
    "sa_post_submitted_at",
    "sa_post_duration_sec",
    "sa_post_total",
    "sa_post_straight_line",
    "sa_diff",
    "sa_has_pair",
  ],
  usage_summary: [
    "usage_first_seen_at",
    "usage_last_seen_at",
    "usage_total_events",
    "usage_active_days",
    "usage_active_months",
  ],
  event_breakdown: [],
  completion_funnel: [],
  lesson_progress: ["lessons_completed"],
};

/** Column dictionary for README.txt and the "คำอธิบายคอลัมน์" panel. Patterns use <...>. */
export const COLUMN_DICTIONARY: { file: string; column: string; meaning: string }[] = [
  { file: "ทุกไฟล์", column: "session_id", meaning: "รหัสผู้ใช้ (1 เครื่อง/เบราว์เซอร์) — ใช้เชื่อมทุกไฟล์" },
  { file: "participants", column: "age_range", meaning: "ช่วงอายุที่เลือกตอนลงทะเบียน" },
  { file: "participants", column: "province / district / sub_district", meaning: "จังหวัด / อำเภอ / ตำบล ที่เลือกตอนลงทะเบียน" },
  { file: "participants", column: "sa_item_set", meaning: "ชุดคำถามแบบประเมิน (เช่น sa-v1)" },
  { file: "participants", column: "sa_pre_* / sa_post_*", meaning: "ก่อนเรียน / หลังเรียน: submitted_at เวลาส่ง, duration_sec วินาทีที่ใช้, total คะแนนรวม (ว่างถ้าตอบไม่ครบ), straight_line ตอบค่าเดียวกันทุกข้อ" },
  { file: "participants", column: "sa_pre_<nn> / sa_post_<nn>", meaning: "คำตอบข้อที่ nn (1–5) — ข้อความคำถามอยู่ท้ายไฟล์นี้" },
  { file: "participants", column: "sa_diff", meaning: "sa_post_total − sa_pre_total (เฉพาะคนที่มีครบคู่)" },
  { file: "participants", column: "sa_has_pair", meaning: "ทำแบบประเมินครบทุกข้อทั้งก่อนและหลังเรียน (ชุดคำถามเดียวกัน)" },
  { file: "participants", column: "usage_first_seen_at / usage_last_seen_at", meaning: "เวลาที่พบครั้งแรก / ล่าสุด" },
  { file: "participants", column: "usage_total_events", meaning: "จำนวน event ทั้งหมด" },
  { file: "participants", column: "usage_active_days / usage_active_months", meaning: "จำนวนวัน / เดือน (เวลาไทย) ที่มี event" },
  { file: "participants", column: "ev_<event_name>", meaning: "จำนวนครั้งของ event ชนิดนั้น (0 = ไม่มี)" },
  { file: "participants", column: "funnel_<step>_at", meaning: "เวลาที่ไปถึงขั้นนั้นครั้งแรก (ว่าง = ไม่ถึง)" },
  { file: "participants", column: "funnel_furthest_step", meaning: "ขั้นที่ไกลที่สุดที่ไปถึง" },
  { file: "participants", column: "lessons_completed", meaning: "จำนวนบทที่จบทั้งคลิปและเกม" },
  { file: "participants", column: "lesson_<id>_video_at / lesson_<id>_game_at", meaning: "เวลาที่ดูคลิป / เล่นเกมของบทนั้นจบ" },
  { file: "event_log", column: "event_id, created_at, event_name, page_url, payload", meaning: "event ดิบ 1 แถวต่อ 1 event — payload เป็น JSON" },
  { file: "usage_daily", column: "date, event_count, first_event_at, last_event_at, span_minutes", meaning: "ต่อคนต่อวัน — span_minutes = ระยะ event แรก–สุดท้ายของวัน (ค่าประมาณ ไม่ใช่เวลาใช้งานจริง)" },
  { file: "usage_monthly", column: "month, event_count, active_days", meaning: "ต่อคนต่อเดือน" },
  { file: "leaderboard", column: "session_link", meaning: "exact = บันทึกพร้อม session id, matched = จับคู่ย้อนหลัง, none = ผูกไม่ได้ (session_id ว่าง)" },
  { file: "leaderboard", column: "attempt_uuid, player_uuid, player_name, game_id, game_name, score, played_at", meaning: "การเล่น 1 รอบ — player_name เป็นชื่อที่ผู้ใช้พิมพ์เอง" },
];

export const TIME_NOTE = "เวลาทุกช่องเป็นเวลาไทย (ISO 8601, +07:00)";
