"use client";

import type { ButtonHTMLAttributes } from "react";
import { notoLoopedThai } from "@/lib/fonts";

// No white stroke — built like Button3D (the blue continue button): the darker "side" is its own layer
// at the bottom and the face sits 8px × --gp-s above it (gp-h-104 − gp-h-96). Pressed, the face slides
// down over the base in 90ms and the base hides only once fully covered (no dark sliver at the rounded
// corners); on release it comes back at once.
const TONES = {
  green: { face: "bg-[#2FB84E]", base: "bg-[#1E8A38]" },
  red: { face: "bg-[#FF4B4B]", base: "bg-[#CC3A3A]" },
  yellow: { face: "bg-[#F0AE03]", base: "bg-[#C38D00]" },
} as const;

interface GameAnswerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone: keyof typeof TONES;
  /** ไอคอนสีขาวขนาด 24px (ไฟล์ SVG จาก Figma) */
  iconSrc: string;
  label: string;
}

// Figma "Component 24" variants G_def / Red-def / Yellow-def — ปุ่มตอบของเกม (ไม่มีขอบขาว แบบปุ่มไปต่อสีฟ้า)
// Sizes are px, not rem: the app's root font-size is 20px.
export default function GameAnswerButton({
  tone,
  iconSrc,
  label,
  className = "",
  ...props
}: GameAnswerButtonProps) {
  const { face, base } = TONES[tone];
  return (
    <button
      type="button"
      {...props}
      className={`${notoLoopedThai.className} group relative block gp-h-104 min-w-0 flex-1 cursor-pointer rounded-[24px] bg-transparent disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 gp-h-96 rounded-[24px] ${base} transition-opacity duration-0 group-active:opacity-0 group-active:delay-[90ms] group-disabled:opacity-100`}
      />
      <span
        className={`absolute inset-x-0 top-0 flex gp-h-96 flex-col items-center justify-center rounded-[24px] gp-text-24 font-semibold gp-leading-32 text-white transition-transform duration-[90ms] ease-out group-active:translate-y-[calc(8px*var(--gp-s,1))] group-disabled:translate-y-0 ${face}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" aria-hidden="true" className="gp-size-24 shrink-0" />
        {label}
      </span>
    </button>
  );
}
