"use client";

import type { ButtonHTMLAttributes } from "react";
import { notoLoopedThai } from "@/lib/fonts";

// The 3D edge is a solid shadow under the face, not a second box behind it:
// stacking two rounded boxes leaves the darker one's anti-aliased edge showing around the white border.
// Edge = 8px × --gp-s (matches gp-h-104 − gp-h-96 on compact screens too). Pressed, the shadow shrinks
// to 0 in the same colour while the face slides down by the same amount, at the same speed — so the
// edge's bottom stays put and nothing flashes mid-press (same feel as Button3D).
const TONES = {
  green: "bg-[#2FB84E] shadow-[0_calc(8px*var(--gp-s,1))_0_0_#1E8A38] group-active:shadow-[0_0_0_0_#1E8A38]",
  red: "bg-[#FF4B4B] shadow-[0_calc(8px*var(--gp-s,1))_0_0_#CC3A3A] group-active:shadow-[0_0_0_0_#CC3A3A]",
  yellow: "bg-[#F0AE03] shadow-[0_calc(8px*var(--gp-s,1))_0_0_#C38D00] group-active:shadow-[0_0_0_0_#C38D00]",
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
      className={`${notoLoopedThai.className} group block gp-h-104 min-w-0 flex-1 cursor-pointer bg-transparent disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span
        className={`flex gp-h-96 flex-col items-center justify-center rounded-[24px] border-2 border-solid border-white gp-text-24 font-semibold gp-leading-32 text-white transition-[translate,box-shadow] duration-[90ms] ease-out group-active:translate-y-[calc(8px*var(--gp-s,1))] ${TONES[tone]}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" aria-hidden="true" className="gp-size-24 shrink-0" />
        {label}
      </span>
    </button>
  );
}
