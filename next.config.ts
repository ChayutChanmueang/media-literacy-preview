import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // อ่าน dev origins จาก env (คั่นด้วย comma) หรือใช้ default สำหรับ WSL/Local Dev IP
  allowedDevOrigins: (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "172.23.64.1,localhost")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};

export default withPWA(nextConfig);
