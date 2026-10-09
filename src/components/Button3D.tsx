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
  /** Grey like disabled but still pressable — e.g. a form that highlights what is missing when pressed.
   *  Announced as unavailable (aria-disabled) while onClick still fires. */
  inactive?: boolean;
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
  inactive = false,
  ...props
}: Button3DProps) {
  const autoAdvanceRef = useRef(onAutoAdvance);
  useEffect(() => {
    autoAdvanceRef.current = onAutoAdvance;
  });

  const counting = !!autoAdvanceMs && !disabled && !inactive;
  // grey = Figma "Def-def" colours: disabled (no press) or inactive (grey but still slides when pressed)
  const grey = disabled || inactive;
  const pressBase = "transition-opacity duration-0 group-active:opacity-0 group-active:delay-[90ms]";
  const pressFace = "transition-transform duration-[90ms] ease-out group-active:translate-y-[calc(8px*var(--gp-s,1))]";

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
      aria-disabled={inactive || undefined}
      className={`${notoLoopedThai.className} group relative block gp-h-104 w-full shrink-0 cursor-pointer rounded-[24px] disabled:cursor-not-allowed ${className}`}
    >
      {/* Base (the dark "side"): its own layer at the bottom, so pressing never swaps colours mid-frame.
          Pressed, it hides only after the face has fully covered it (delay = slide time), so no dark
          sliver shows around the face's rounded corners; on release it comes back at once. */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 gp-h-96 rounded-[24px] ${
          disabled ? "bg-[#7F7F7F]" : `${grey ? "bg-[#7F7F7F]" : "bg-[#0078A8]"} ${pressBase}`
        }`}
      />
      {/* Face: slides down by the base height (8px × --gp-s, matching gp-h-104 − gp-h-96) */}
      <span
        className={`absolute inset-x-0 top-0 flex gp-h-96 items-center justify-center overflow-clip rounded-[24px] gp-text-28 font-bold gp-leading-36 text-white ${
          disabled ? "bg-[#A5A5A5]" : `${grey ? "bg-[#A5A5A5]" : "bg-[#00A3E0]"} ${pressFace}`
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
