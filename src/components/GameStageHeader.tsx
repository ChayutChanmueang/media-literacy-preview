import React from "react";

/**
 * Header card of the restyled fun games (G17 โล่กันโกง, G18 จำให้ขึ้นใจ) — Figma "Scammer Game Prototype"
 * (frame "Frame 463"): white card, rounded bottom corners, a label + big number on each side.
 * Must sit inside a `.gp-compact` root so the gp-* sizes shrink on small phones.
 * `left` is optional — Figma leaves that slot empty; a same-width spacer keeps `right` in place.
 * `children` goes in the middle (dev-only QA buttons).
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
    <div className="relative z-10 flex shrink-0 items-end justify-between rounded-b-[24px] border-2 border-t-0 border-solid border-[#D9D9D9] bg-white gp-px-34 gp-pt-16 gp-pb-20 text-center">
      {left ? <StageSlot {...left} /> : <div className="w-[85px]" aria-hidden="true" />}
      {children}
      <StageSlot {...right} />
    </div>
  );
}

type StageValue = { label: string; value: React.ReactNode; ariaLabel?: string };

function StageSlot({ label, value, ariaLabel }: StageValue) {
  return (
    <div className="flex w-[85px] flex-col items-center" aria-label={ariaLabel}>
      <span className="gp-text-20 font-semibold gp-leading-30 text-[#4B4B4B]">{label}</span>
      <span className="gp-text-32 font-bold gp-leading-40 text-[#00A3E0] tabular-nums">{value}</span>
    </div>
  );
}
