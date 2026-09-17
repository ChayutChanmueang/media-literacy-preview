import React from "react";
import { notoLoopedThai } from "@/lib/fonts";

/**
 * การ์ดชื่อคลิป (US-CF-22 / US-CF-24) — ใช้ร่วมกันที่ Start Menu และหน้า intro ของวิดีโอ
 * บรรทัดบน (เกริ่น) + บรรทัดกลาง (ชื่อคลิป) ตัวใหญ่หนา — Figma node 2065:7208 "รับชมคลิป"
 */
export interface ClipTitleCardProps {
  /** ข้อความบรรทัดบน (เช่น "พร้อมแล้วไปดูคลิป" / "รับชมคลิป") */
  topLine: string;
  /** ชื่อคลิป (จะใส่ " " ครอบให้เอง) แสดงตัวใหญ่หนา */
  clipName: string;
  /** คลาสเพิ่มของกรอบนอก (เช่น margin) */
  className?: string;
}

export default function ClipTitleCard({
  topLine,
  clipName,
  className = "",
}: ClipTitleCardProps) {
  return (
    <div
      className={`${notoLoopedThai.className} flex w-full flex-col items-center gap-[48px] px-[12px] text-center text-[#4B4B4B] ${className}`}
    >
      <p className="text-[24px] font-semibold leading-[32px]">{topLine}</p>
      <p className="text-[32px] font-bold leading-[40px] [word-break:break-word]">{`"${clipName}"`}</p>
    </div>
  );
}
