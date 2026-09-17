"use client";

import { Star } from "lucide-react";
import { notoLoopedThai } from "@/lib/fonts";

interface GameScoreCardProps {
  /** ดาวที่ได้ (0-3) */
  stars: number;
  onNext: () => void;
  title?: string;
  subtitle?: string;
  nextLabel?: string;
}

// Figma node 2065:7012 "Score2" — การ์ดคะแนนหลังจบเกม ใช้ร่วมกันทุกเกม (เกมเพื่อการเรียนรู้ + เกมสนุก)
export default function GameScoreCard({
  stars,
  onNext,
  title = "เก่งมาก",
  subtitle = "คุณทำสำเร็จ",
  nextLabel = "ต่อไป",
}: GameScoreCardProps) {
  return (
    <div
      className={`${notoLoopedThai.className} flex w-full max-w-[352px] flex-col items-center gap-[24px] rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white px-[24px] py-[32px] shadow-[0px_2px_0px_0px_#D9D9D9]`}
    >
      <div className="flex flex-col items-center gap-[8px] text-center">
        <p className="text-[28px] font-bold leading-[36px] text-[#4B4B4B]">{title}</p>
        <p className="text-[20px] font-normal leading-[30px] text-[#7F7F7F]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-[12px]" role="img" aria-label={`ได้ ${stars} จาก 3 ดาว`}>
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            size={56}
            strokeWidth={1.5}
            fill={n <= stars ? "#F0AE03" : "#D9D9D9"}
            color={n <= stars ? "#C38D00" : "#D9D9D9"}
            aria-hidden="true"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="group relative block h-[64px] w-full max-w-[220px] cursor-pointer overflow-clip rounded-[20px] bg-[#0078A8]"
      >
        <span className="absolute inset-x-0 top-0 flex h-[56px] items-center justify-center rounded-[20px] bg-[#00A3E0] text-[20px] font-semibold leading-[30px] text-white group-active:top-[6px]">
          {nextLabel}
        </span>
      </button>
    </div>
  );
}
