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
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col gp-px-24 gp-pt-24`}>
      <div
        className={`flex gp-h-92 shrink-0 items-center justify-center rounded-t-[24px] [animation:fadeIn_0.3s_ease-out] ${
          tone === "correct" ? "bg-[#2FB84E]" : "bg-[#FF4B4B]"
        }`}
      >
        <p className="gp-text-40 font-bold gp-leading-48 text-white">{banner}</p>
      </div>

      <div className="relative min-h-0 flex-1 rounded-b-[24px] border-2 border-solid border-[#D9D9D9] bg-white shadow-[0px_2px_0px_0px_#D9D9D9] [animation:fadeIn_0.3s_ease-out]">
        <CustomScrollArea
          className="h-full"
          contentClassName="gp-pl-24 gp-pr-44 gp-py-22 text-left"
          trackClassName="absolute top-[18px] bottom-[18px] right-[14px] w-[8px] rounded-[12px] bg-[#D9D9D9] pointer-events-none"
          thumbClassName="absolute left-0 w-full rounded-[12px] bg-[#7F7F7F]"
          onActiveChange={onReadingChange}
        >
          <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">{heading}</p>
          <div className="gp-mt-26 gp-text-18 font-normal gp-leading-26 text-[#4B4B4B]">{children}</div>
        </CustomScrollArea>
      </div>
    </div>
  );
}
