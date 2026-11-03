import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // ไฟล์เสียงไม่ precache — ไม่งั้นทุกเครื่องใหม่โหลดเสียงของทุกเกมตั้งแต่เปิดแอปครั้งแรก (docs/software/11 ข้อ 10.2)
  // "!noprecache/**/*" เป็นค่า default ของ next-pwa ต้องใส่ซ้ำเพราะกำลัง override
  publicExcludes: ["!noprecache/**/*", "!audio/**/*"],
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      // cacheName เดียวกับกฎ default จึงแทนที่กฎนั้น (32 ไฟล์ / 1 วัน) และอยู่ลำดับแรก
      // ชื่อไฟล์เสียงมีเวอร์ชัน (ห้ามแก้เนื้อหาใต้ชื่อเดิม) จึงเก็บนานได้
      {
        urlPattern: /\/audio\/.*\.(?:mp3|wav|ogg)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-audio-assets",
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // อ่าน dev origins จาก env (คั่นด้วย comma) หรือใช้ default สำหรับ WSL/Local Dev IP
  allowedDevOrigins: (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "172.23.64.1,localhost")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  // เครื่องที่ไม่มี Service Worker (in-app browser บางรุ่น) — Next.js เสิร์ฟ public/ ด้วย max-age=0 เป็นค่าเริ่มต้น
  async headers() {
    return [
      { source: "/audio/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default withPWA(nextConfig);
