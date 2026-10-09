import React from "react";
import type { LucideIcon } from "lucide-react";

/**
 * แถบหัวจอระหว่างเล่นของเกมสนุก (G13 ต่อไอติม, G18, G19, G20) — ใช้ร่วมกันให้หน้าตาเหมือนกันทุกเกม
 * ซ้าย = สิ่งที่เหลือ/สถานะ (เวลา, ครั้งที่เหลือ), ขวา = ผลงาน (ไอคอนถ้วย), กลาง = ปุ่ม QA เฉพาะ dev (children)
 * ตัวอักษร 20px (จอแคบมากย่อได้ถึง 17px) ความสูงอย่างน้อย 48px
 */
export default function GameHudBar({
  left,
  right,
  children,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="shrink-0 min-h-12 px-4 py-2 flex items-center justify-between bg-white border-b border-amber-200 text-[clamp(17px,4.35vw,20px)] font-bold font-sans">
      {left}
      {children}
      {right}
    </div>
  );
}

/** ค่าหนึ่งช่องในแถบหัวจอ: ไอคอน + ข้อความ (สีเริ่มต้นตาม G13 — ซ้ายเทาเข้ม, ขวาใช้ tone="score") */
export function GameHudItem({
  icon: Icon,
  tone = "status",
  className = "",
  children,
}: {
  icon: LucideIcon;
  tone?: "status" | "tutorial" | "score";
  className?: string;
  children: React.ReactNode;
}) {
  const color = tone === "score" ? "text-amber-900" : tone === "tutorial" ? "text-teal-800" : "text-slate-700";
  return (
    <span className={`relative flex items-center gap-2 tabular-nums ${color} ${className}`}>
      <Icon size={21} aria-hidden="true" /> {children}
    </span>
  );
}

/** สไตล์ปุ่ม QA (เฉพาะ dev) กลางแถบหัวจอ — เหมือนปุ่ม "ข้ามเวลา" ของ G13 */
export const HUD_DEV_BUTTON_CLASS =
  "min-h-12 rounded-xl border-2 border-dashed border-violet-500 bg-violet-50 px-3 text-[20px] font-bold text-violet-800";
