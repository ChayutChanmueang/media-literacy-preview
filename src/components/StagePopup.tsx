import React from "react";
import { mali } from "@/lib/fonts";

/**
 * Big outlined popup text over a game's play area, in the style of the fun games' finish text
 * (G19 เรียงผลไม้, G20/G20K ผักบุ้งลอยฟ้า): white bold Mali text with a dark-brown outline, no panel,
 * a large title and a smaller line under it. It zooms/fades in, holds, then grows a little and fades
 * out — the game drives `stage` ("enter" = mounted hidden, so the change to "show" transitions in).
 * Sized to the box it covers (cqw), so it still fits on a small screen or a small board.
 * Used by G13 (time's up) and G18 (after each turn).
 */
export type StagePopupStage = "enter" | "show" | "leave";

/** G19/G20's timings: zoom/fade in, hold, fade out */
export const STAGE_POPUP_MS = { in: 500, hold: 1800, out: 450 };

export default function StagePopup({
  stage,
  title,
  subtitle,
  inMs = STAGE_POPUP_MS.in,
  outMs = STAGE_POPUP_MS.out,
  className = "z-20",
}: {
  stage: StagePopupStage;
  title: string;
  subtitle?: string;
  inMs?: number;
  outMs?: number;
  /** stacking (z-index) inside the play area */
  className?: string;
}) {
  return (
    // aria-hidden: each game says the same thing in its own screen-reader status line
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ containerType: "inline-size" }}
    >
      <div
        className={`${mali.className} flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center text-white`}
        style={{
          opacity: stage === "show" ? 1 : 0,
          transform: stage === "enter" ? "scale(0.7)" : stage === "leave" ? "scale(1.08)" : "scale(1)",
          transition:
            stage === "leave"
              ? `opacity ${outMs}ms ease-in, transform ${outMs}ms ease-in`
              : `opacity ${inMs}ms ease-out, transform ${inMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
          WebkitTextStroke: "8px #7C2D12",
          paintOrder: "stroke fill",
          textShadow: "0 4px 12px rgba(0,0,0,0.35)",
        }}
      >
        <p className="font-bold leading-[1.3]" style={{ fontSize: "clamp(24px, 16cqw, 56px)" }}>
          {title}
        </p>
        {subtitle && (
          <p className="font-bold leading-[1.4]" style={{ fontSize: "clamp(20px, 9cqw, 32px)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
