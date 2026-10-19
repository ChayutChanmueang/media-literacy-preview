import React from "react";
import { notoLoopedThai } from "@/lib/fonts";

/**
 * Header card of the fun games (G13 ต่อไอติม, G17 โล่กันโกง, G18 จำให้ขึ้นใจ, G19 เรียงผลไม้,
 * G20 ผักบุ้งลอยฟ้า) — Figma "Scammer Game Prototype" (frame "Frame 463"): white card, rounded
 * bottom corners, a label + big number on each side.
 * Inside a `.gp-compact` root the gp-* sizes shrink on small phones (outside it they stay 1×).
 * `left` is optional — Figma leaves that slot empty; a same-width spacer keeps `right` in place.
 * `children` goes in the middle (dev-only QA buttons, styled with HUD_DEV_BUTTON_CLASS).
 */
export default function GameStageHeader({
  left,
  right,
  children,
}: {
  left?: StageValue;
  right: StageValue;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${notoLoopedThai.className} relative z-10 flex shrink-0 items-end justify-between rounded-b-[24px] border-2 border-t-0 border-solid border-[#D9D9D9] bg-white gp-px-34 gp-pt-16 gp-pb-20 text-center`}>
      {left ? <StageSlot {...left} /> : <div className="w-[85px]" aria-hidden="true" />}
      {children}
      <StageSlot {...right} />
    </div>
  );
}

type StageValue = { label: string; value: React.ReactNode; ariaLabel?: string };

function StageSlot({ label, value, ariaLabel }: StageValue) {
  return (
    // 85px like Figma; grows for a longer value (G13's "ฝึกเล่น" / "12 ชั้น")
    <div className="flex min-w-[85px] flex-col items-center whitespace-nowrap" aria-label={ariaLabel}>
      <span className="gp-text-20 font-semibold gp-leading-30 text-[#4B4B4B]">{label}</span>
      {/* gp-mt-5: keeps Thai marks of the value (ฝึ / ชั้) clear of the label above */}
      <span className="gp-mt-5 gp-text-32 font-bold gp-leading-40 text-[#00A3E0] tabular-nums">{value}</span>
    </div>
  );
}

/** Dev-only QA button in the middle of the header (skip level / end run …), vertically centred */
export const HUD_DEV_BUTTON_CLASS =
  "min-h-12 self-center rounded-xl border-2 border-dashed border-violet-500 bg-violet-50 px-3 text-[20px] font-bold text-violet-800";
