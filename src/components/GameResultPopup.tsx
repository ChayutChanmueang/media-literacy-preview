"use client";

import { useId, type ReactNode } from "react";
import Button3D from "./Button3D";
import GamePopupShell from "./GamePopupShell";

/**
 * Fun-game end result as a popup over the (frozen) game scene, instead of a separate summary screen.
 * Layout from Figma "Scammer Game Prototype" node 3157:15331: white card, badge → praise line (Body) →
 * headline (H2) → score (H1, Primary Green) → "จบเกม" (primary) over "เล่นอีกครั้ง" (secondary).
 * The badge is the Figma trophy badge (Group 76) — public/assets/result/trophy-badge.svg.
 *
 * Used by every fun game with a leaderboard: G13 (ice cream) and G18–G20K.
 * Render it inside a `position: relative` box that covers the scene — it fills that box.
 */
interface GameResultPopupProps {
  /** small line above the headline, e.g. "เก่งมาก!" */
  praise: ReactNode;
  headline: ReactNode;
  /** the big green line (score) — leave out when there is nothing to show */
  score?: ReactNode;
  /** extra lines under the score (best-score notes) */
  children?: ReactNode;
  finishLabel: string;
  onFinish: () => void;
  onReplay: () => void;
  /** false while another popup is open on top — that one's dim covers this card too */
  dim?: boolean;
}

export default function GameResultPopup({
  praise,
  headline,
  score,
  children,
  finishLabel,
  onFinish,
  onReplay,
  dim = true,
}: GameResultPopupProps) {
  const titleId = useId();

  return (
    <GamePopupShell labelledBy={titleId} dim={dim}>
      {/* Figma badge: 60×60 slot, the SVG is 60×64 (its drop shadow hangs 4px below — inset bottom −6.67%) */}
      <div className="result-badge relative shrink-0 gp-size-60" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
        <img src="/assets/result/trophy-badge.svg" alt="" width={60} height={64} className="absolute inset-x-0 top-0 block h-[106.67%] w-full max-w-none" />
      </div>
      <div id={titleId} className="flex w-full flex-col items-center gp-gap-8 text-[#4B4B4B]">
        <p className="result-pop gp-type-body">{praise}</p>
        <p className="result-rise gp-type-h2">{headline}</p>
        {score !== undefined && <p className="result-rise gp-type-h1 text-[#15803D]">{score}</p>}
      </div>
      {children}
      <div className="result-actions flex w-full flex-col gp-gap-20 gp-pt-12">
        <Button3D size="md" onClick={onFinish}>
          {finishLabel}
        </Button3D>
        <Button3D size="md" variant="secondary" onClick={onReplay}>
          เล่นอีกครั้ง
        </Button3D>
      </div>
    </GamePopupShell>
  );
}
