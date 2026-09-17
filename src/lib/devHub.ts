/**
 * ตรวจว่า Dev Game Hub (/dev/games) ควรเปิดใช้หรือไม่
 * เรียกจาก Server Component / Route Handler เท่านั้น
 * (Client Component อ่าน NEXT_PUBLIC_* ไม่ได้แบบ runtime หลัง Docker build)
 */
export function isDevHubEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return (
    process.env.ENABLE_DEV_HUB === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_DEV_HUB === "true"
  );
}
