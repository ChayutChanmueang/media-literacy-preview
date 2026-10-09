import type { AppMode } from "@/services/progressService";

/**
 * โหมดของแอปสำหรับ deployment นี้ อ่านจาก env `APP_MODE` ("research" | "normal")
 * - research = มีแบบทดสอบก่อน/หลังเรียน (pre-post test) + เข้าสายเนื้อเรื่องอัตโนมัติ
 * - normal   = ไม่มี pre-post test ผู้เล่นเลือกโหมดเนื้อเรื่อง/โหมดอิสระเอง (ค่าเริ่มต้น)
 *
 * เรียกจาก Server Component เท่านั้น — อ่านตอน runtime จึงใช้ Docker image เดียวกัน
 * deploy คนละเว็บคนละโหมดได้ แค่ตั้ง env แล้ว restart container (ไม่ต้อง rebuild)
 */
export function getServerAppMode(): AppMode {
  return process.env.APP_MODE?.trim().toLowerCase() === "research" ? "research" : "normal";
}
