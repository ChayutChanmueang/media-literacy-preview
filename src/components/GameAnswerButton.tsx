"use client";

import type { ButtonHTMLAttributes } from "react";
import { notoLoopedThai } from "@/lib/fonts";

// The 3D edge is a solid shadow under the face, not a second box behind it:
// stacking two rounded boxes leaves the darker one's anti-aliased edge showing around the white border.
const TONES = {
  green: "bg-[#2FB84E] shadow-[0_8px_0_0_#1E8A38]",
  red: "bg-[#FF4B4B] shadow-[0_8px_0_0_#CC3A3A]",
  yellow: "bg-[#F0AE03] shadow-[0_8px_0_0_#C38D00]",
} as const;

interface GameAnswerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: keyof typeof TONES;
  /** ไอคอนสีขาวขนาด 24px (ไฟล์ SVG จาก Figma) */
  iconSrc: string;
  label: string;
}

// Figma "Component 24" variants G_def / Red-def / Yellow-def — ปุ่มตอบของเกม
// Sizes are px, not rem: the app's root font-size is 20px.
export default function GameAnswerButton({
  tone,
  iconSrc,
  label,
  className = "",
  ...props
}: GameAnswerButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`${notoLoopedThai.className} group block h-[104px] min-w-0 flex-1 cursor-pointer bg-transparent disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span
        className={`flex h-[96px] flex-col items-center justify-center rounded-[24px] border-2 border-solid border-white text-[24px] font-semibold leading-[32px] text-white group-active:translate-y-[8px] group-active:shadow-none ${TONES[tone]}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" aria-hidden="true" className="size-[24px] shrink-0" />
        {label}
      </span>
    </button>
  );
}
