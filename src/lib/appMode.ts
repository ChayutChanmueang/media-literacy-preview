import type { AppMode } from "@/services/progressService";

/**
 * Dev-only: cookie set by the mode switch in the drawer (AppLayout) to try the other mode without
 * restarting the server. Only honoured in dev builds or with NEXT_PUBLIC_ENABLE_DEV_HUB=true (same as
 * the other dev buttons, see devSkip.ts) — production always follows APP_MODE.
 * Not "naplab_ml_app_mode": that is the old stored mode, which progressService.clearLegacyAppMode() deletes.
 */
export const DEV_APP_MODE_COOKIE = "naplab_ml_dev_app_mode";

const DEV_MODE_SWITCH_ENABLED =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEV_HUB === "true";

/**
 * โหมดของแอปสำหรับ deployment นี้ อ่านจาก env `APP_MODE` ("research" | "normal")
 * - research = มีแบบทดสอบก่อน/หลังเรียน (pre-post test) + เข้าสายเนื้อเรื่องอัตโนมัติ
 * - normal   = ไม่มี pre-post test ผู้เล่นเลือกโหมดเนื้อเรื่อง/โหมดอิสระเอง (ค่าเริ่มต้น)
 *
 * เรียกจาก Server Component / proxy เท่านั้น — อ่านตอน runtime จึงใช้ Docker image เดียวกัน
 * deploy คนละเว็บคนละโหมดได้ แค่ตั้ง env แล้ว restart container (ไม่ต้อง rebuild)
 *
 * `devOverride` = ค่า cookie `DEV_APP_MODE_COOKIE` (ใช้ได้เฉพาะ dev build)
 */
export function getServerAppMode(devOverride?: string): AppMode {
  if (DEV_MODE_SWITCH_ENABLED && (devOverride === "research" || devOverride === "normal")) {
    return devOverride;
  }
  return process.env.APP_MODE?.trim().toLowerCase() === "research" ? "research" : "normal";
}
