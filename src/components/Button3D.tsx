"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { notoLoopedThai } from "@/lib/fonts";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Press automatically after this many ms, with a fill bar on the button face. Restarts when it goes from unset to set. */
  autoAdvanceMs?: number;
  onAutoAdvance?: () => void;
  /** Hold the countdown (US-UX-07: while the player is reading/scrolling the explanation) */
  autoAdvancePaused?: boolean;
}

// Figma "Component 24": variant "1"/"2" = enabled/pressed, "Def-def" = disabled.
// Sizes are px, not rem: the app's root font-size is 20px.
export default function Button3D({
  children,
  disabled,
  className = "",
  autoAdvanceMs,
  onAutoAdvance,
  autoAdvancePaused = false,
  ...props
}: Button3DProps) {
  const autoAdvanceRef = useRef(onAutoAdvance);
  useEffect(() => {
    autoAdvanceRef.current = onAutoAdvance;
  });

  const counting = !!autoAdvanceMs && !disabled;

  // Time left, kept across pauses so the countdown resumes where it stopped
  const remainingRef = useRef(autoAdvanceMs ?? 0);
  const startedAtRef = useRef(0);
  useEffect(() => {
    remainingRef.current = autoAdvanceMs ?? 0;
  }, [autoAdvanceMs]);

  useEffect(() => {
    if (!counting || autoAdvancePaused) return;
    startedAtRef.current = Date.now();
    const timer = setTimeout(() => autoAdvanceRef.current?.(), remainingRef.current);
    return () => {
      clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    };
  }, [counting, autoAdvancePaused]);

  return (
    <button
      type="button"
      {...props}
      disabled={disabled}
      className={`${notoLoopedThai.className} group relative block h-[104px] w-full shrink-0 cursor-pointer overflow-clip rounded-[24px] disabled:cursor-not-allowed ${
        disabled ? "bg-[#7F7F7F]" : "bg-[#0078A8] active:bg-transparent"
      } ${className}`}
    >
      <span
        className={`absolute inset-x-0 top-0 flex h-[96px] items-center justify-center overflow-clip rounded-[24px] text-[28px] font-bold leading-[36px] text-white ${
          disabled ? "bg-[#A5A5A5]" : "bg-[#00A3E0] group-active:top-[8px]"
        }`}
      >
        {counting && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 bg-white/25"
            style={{
              animation: `autoAdvanceProgress ${autoAdvanceMs}ms linear forwards`,
              animationPlayState: autoAdvancePaused ? "paused" : "running",
            }}
          />
        )}
        <span className="relative">{children}</span>
      </span>
    </button>
  );
}
