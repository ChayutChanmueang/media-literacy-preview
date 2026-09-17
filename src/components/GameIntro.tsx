"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";

interface GameIntroProps {
  /** ชื่อเกม */
  title: string;
  /** วัตถุประสงค์ของเกม */
  objective: string;
  /** บรรทัดตัวเลือกคำตอบ เช่น "จริง · ปลอม · ไม่แน่ใจ" */
  choices?: string;
  /** เรียกเมื่อกดปุ่มเริ่มเล่น (ปิดหน้าแนะนำ → เข้าสู่ gameplay) */
  onStart: () => void;
  /** ป้ายปุ่มเริ่ม (ค่าเริ่มต้น "กดเพื่อเริ่ม") */
  startLabel?: string;
  /** ไอคอนหัวเรื่อง (ใช้เมื่อไม่ได้ส่ง mediaSlot/imageSrc) */
  icon?: LucideIcon;
  /** visual หัวเรื่องแบบกำหนดเอง (เช่นรูปภาพ) — override icon/imageSrc */
  mediaSlot?: React.ReactNode;
  /** รูปไอคอนเกม (US-CF-31) — override icon */
  imageSrc?: string;
  /** alt ของ imageSrc (ค่าเริ่ม "") */
  imageAlt?: string;
  /** class พื้นหลังของแผงแนะนำ */
  containerClassName?: string;
}

/**
 * หน้าแนะนำเกม (Intro Panel) — ไอคอนเกม + ชื่อเกม + วัตถุประสงค์ + ตัวเลือกคำตอบ ก่อนเริ่ม gameplay
 * US-CF-03: ใช้ร่วมกันใน G1/G3/G6/G13 — Figma node 2065:7174 "เกมเพื่อการเรียนรู้"
 */
export default function GameIntro({
  title,
  objective,
  choices,
  onStart,
  startLabel = "กดเพื่อเริ่ม",
  icon: Icon,
  mediaSlot,
  imageSrc,
  imageAlt = "",
  containerClassName = "bg-white",
}: GameIntroProps) {
  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col ${containerClassName}`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gap-[40px] px-[24px] py-[28px] text-center">
          {mediaSlot ? (
            <div className="mb-[24px] shrink-0">{mediaSlot}</div>
          ) : imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imageSrc} alt={imageAlt} className="mb-[24px] size-[120px] shrink-0 object-contain" />
          ) : Icon ? (
            <Icon size={120} className="mb-[24px] shrink-0 text-[var(--primary)]" aria-hidden="true" />
          ) : null}

          <p className="text-[32px] font-bold leading-[40px] text-black">{title}</p>
          <p className="text-[24px] font-semibold leading-[32px] text-[#4B4B4B]">{objective}</p>
          {choices && <p className="text-[24px] font-semibold leading-[32px] text-[#4B4B4B]">{choices}</p>}
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D onClick={onStart}>{startLabel}</Button3D>
      </div>
    </div>
  );
}
