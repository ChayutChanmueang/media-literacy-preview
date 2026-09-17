"use client";

import type { ReactNode } from "react";
import CustomScrollArea from "@/components/CustomScrollArea";
import { notoLoopedThai } from "@/lib/fonts";

interface GameSolutionCardProps {
  /** correct = แถบเขียว, wrong = แถบแดง */
  tone: "correct" | "wrong";
  /** ข้อความบนแถบสี เช่น "ปลอดภัย" / "ไม่ปลอดภัย" (ตัวใหญ่ 40px — ใช้คำสั้น) */
  banner: string;
  /** หัวข้อคำอธิบาย เช่น "ทำไมแชทนี้ถึงอันตราย" */
  heading: string;
  /** เนื้อหาคำอธิบาย (18px) */
  children: ReactNode;
  /** แจ้งเมื่อผู้เล่นกำลังเลื่อนอ่าน — ใช้หยุดตัวนับ auto-advance (US-UX-07) */
  onReadingChange?: (active: boolean) => void;
}

// Figma nodes 2065:7021 (Answer ถูก) / 2065:7033 (Answer ผิด) — ใช้ร่วมกันทุกเกมที่มีหน้าเฉลย
export default function GameSolutionCard({
  tone,
  banner,
  heading,
  children,
  onReadingChange,
}: GameSolutionCardProps) {
  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col px-[24px] pt-[24px]`}>
      <div
        className={`flex h-[92px] shrink-0 items-center justify-center rounded-t-[24px] [animation:fadeIn_0.3s_ease-out] ${
          tone === "correct" ? "bg-[#2FB84E]" : "bg-[#FF4B4B]"
        }`}
      >
        <p className="text-[40px] font-bold leading-[48px] text-white">{banner}</p>
      </div>

      <div className="relative min-h-0 flex-1 rounded-b-[24px] border-2 border-solid border-[#D9D9D9] bg-white shadow-[0px_2px_0px_0px_#D9D9D9] [animation:fadeIn_0.3s_ease-out]">
        <CustomScrollArea
          className="h-full"
          contentClassName="pl-[24px] pr-[44px] py-[22px] text-left"
          trackClassName="absolute top-[18px] bottom-[18px] right-[14px] w-[8px] rounded-[12px] bg-[#D9D9D9] pointer-events-none"
          thumbClassName="absolute left-0 w-full rounded-[12px] bg-[#7F7F7F]"
          onActiveChange={onReadingChange}
        >
          <p className="text-[24px] font-semibold leading-[32px] text-[#4B4B4B]">{heading}</p>
          <div className="mt-[26px] text-[18px] font-normal leading-[26px] text-[#4B4B4B]">{children}</div>
        </CustomScrollArea>
      </div>
    </div>
  );
}
