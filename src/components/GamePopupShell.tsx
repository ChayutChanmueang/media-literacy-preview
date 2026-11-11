"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Dim layer + white card shared by the fun-game popups (GameResultPopup, NameEntryPopup) so they are the
 * same size — card from Figma "Scammer Game Prototype" 3157:15331: max 352px wide, G1 grey border,
 * 24px corners, 2px bottom shadow. Scrolls on a short screen (overflow-y-auto + min-h-full), centred
 * when it fits.
 *
 * position "absolute": fills the nearest positioned box (G13's play area, so it takes the game's scale)
 * · "fixed": covers the screen from page level (add a gp-compact ancestor/class for the stepped scale).
 */
interface GamePopupShellProps {
  labelledBy: string;
  position?: "absolute" | "fixed";
  className?: string;
  /** false: clear backdrop (still blocks taps). Only the topmost popup dims, so the popups under it sit
   *  beneath that one dim layer with the game; the colour fades so handing the dim over doesn't flash */
  dim?: boolean;
  children: ReactNode;
}

export default function GamePopupShell({ labelledBy, position = "absolute", className = "", dim = true, children }: GamePopupShellProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // move focus into the dialog so keyboard / screen-reader users land on it, not on the frozen game
  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      className={`result-backdrop ${position === "fixed" ? "fixed z-50" : "absolute z-40"} inset-0 overflow-y-auto transition-colors duration-300 ${dim ? "bg-black/40" : "bg-transparent"} ${className}`}
    >
      <div className="flex min-h-full items-center justify-center gp-px-16 gp-py-24">
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className="result-card relative flex w-full max-w-[352px] flex-col items-center gp-gap-8 overflow-hidden rounded-[24px] border-2 border-solid border-[#A5A5A5] bg-white gp-px-22 gp-py-24 text-center shadow-[0px_2px_0px_0px_#D9D9D9] outline-none"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
