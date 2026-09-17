/**
 * Flow mode sequence (US-FLOW-01, ปรับทิศตาม US-CF-07 → video-first)
 *
 * โหมด "เรียนต่อเนื่องอัตโนมัติ (Flow)": **คลิปสั้นนำ → เกม** สลับกันไป
 * แล้วปิดท้ายด้วยแบบทดสอบหลังเรียน (แทนมินิเกม G13 + กระดานคะแนนเดิม):
 *
 *   คลิป(topic-1) → G1 → คลิป(topic-6) → G6 → คลิป(topic-3) → G3 → แบบทดสอบหลังเรียน → Completion → Start Menu
 *
 * Flow ใช้เฉพาะ 3 บทนี้ — **ข้าม G2 (topic-2) และ G5 (topic-5)** (ยังเล่นได้ใน Manual mode)
 * ดู docs/agile/user-stories/US-FLOW-01.md
 */

/** ลำดับบทใน Flow mode (แต่ละบท = ดูคลิปก่อน แล้วตามด้วยเกม) */
export const FLOW_SEQUENCE = ["topic-1", "topic-6", "topic-3"] as const;

/** lesson id สังเคราะห์ของเกม G13 (ไม่อยู่ในสาย Flow แล้ว — ยังใช้กับหน้าเกม/กระดานคะแนนที่เปิดตรง) */
export const FLOW_G13_ID = "flow-g13";

/** ด่านปิดท้าย Flow: แบบทดสอบหลังเรียน */
export const FLOW_POST_TEST_ID = "post-test";
export const FLOW_POST_TEST_PATH = "/self-assessment/post";

/** lessonId นี้เป็นด่านเกมในสาย Flow หรือไม่ */
export function isFlowGame(lessonId: string): boolean {
  return (FLOW_SEQUENCE as readonly string[]).includes(lessonId);
}

/**
 * หลังเล่นเกมของ `lessonId` จบใน Flow mode → step ถัดไปที่ต้องไป
 * - ถ้าเป็นบทสุดท้ายในลำดับ (หรือหา index ไม่เจอ) → แบบทดสอบหลังเรียน
 * - มิฉะนั้น → บทถัดไป (จะเริ่มที่ "คลิป" ของบทนั้น)
 */
export function nextFlowLessonAfterGame(lessonId: string): string {
  const idx = (FLOW_SEQUENCE as readonly string[]).indexOf(lessonId);
  if (idx === -1 || idx === FLOW_SEQUENCE.length - 1) return FLOW_POST_TEST_ID;
  return FLOW_SEQUENCE[idx + 1];
}

/**
 * หา flow step แรกที่ยังไม่ผ่าน (อิงดาวที่บันทึกไว้) สำหรับ resume เมื่อกลับเข้ามาเล่นต่อ
 * ถ้าเล่นครบทุกบทแล้ว → เริ่มบทแรก (เล่นทวนได้)
 */
export function firstIncompleteFlowLesson(stars: Record<string, number> = {}): string {
  for (const id of FLOW_SEQUENCE) {
    if (stars[id] === undefined) return id;
  }
  return FLOW_SEQUENCE[0];
}
