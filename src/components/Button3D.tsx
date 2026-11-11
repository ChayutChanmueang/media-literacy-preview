"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";

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
  /** "secondary": smaller white face with a light-grey side (e.g. "เล่นอีกครั้ง" under a primary "จบเกม") — same press motion */
  variant?: "primary" | "secondary";
  /** "md": the 64px buttons of the result popup (GameResultPopup, Figma "Component 30/31") — Button text,
   *  20px corners, 4px side; the secondary gets the G1 grey (#A5A5A5) border/side */
  size?: "lg" | "md";
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
  variant = "primary",
  size = "lg",
  ...props
}: Button3DProps) {
  const secondary = variant === "secondary";
  const md = size === "md";
  // side = outer − face height (primary 8px, secondary 6px, md 4px); the face's press slide below must match it
  // md: 64px scaled with the stage but floored at the 48px tap target; fixed 4px side so face + press stay in step
  const outerSize = md
    ? "h-[max(48px,calc(64px*var(--gp-s,1)))] rounded-[20px]"
    : secondary
      ? "gp-h-64 rounded-[16px]"
      : "gp-h-104 rounded-[24px]";
  const faceSize = md
    ? "h-[calc(max(48px,calc(64px*var(--gp-s,1)))-4px)] rounded-[20px]" : secondary ? "gp-h-58 rounded-[16px]" : "gp-h-96 rounded-[24px]";
  const baseColour = secondary ? (md ? "bg-[#A5A5A5]" : "bg-[#CBD5E1]") : "bg-[#0078A8]";
  const faceText = secondary || md ? "gp-type-button" : "gp-type-h2";
  // md secondary text stays #4B4B4B, not Figma's #7F7F7F (3.9:1 on white — under the 4.5:1 rule)
  const faceColour = secondary
    ? `border-2 border-solid bg-white ${md ? "border-[#A5A5A5] text-[#4B4B4B]" : "border-[#CBD5E1] text-[#1a1a1a]"}`
    : "bg-[#00A3E0] text-white";
  const autoAdvanceRef = useRef(onAutoAdvance);
  useEffect(() => {
    autoAdvanceRef.current = onAutoAdvance;
  });

  const counting = !!autoAdvanceMs && !disabled && !inactive;
  // grey = Figma "Def-def" colours: disabled (no press) or inactive (grey but still slides when pressed)
  const grey = disabled || inactive;
  const pressBase = "transition-opacity duration-0 group-active:opacity-0 group-active:delay-[90ms]";
  const pressFace = `transition-transform duration-[90ms] ease-out ${
    md
      ? "group-active:translate-y-[4px]"
      : secondary
        ? "group-active:translate-y-[calc(6px*var(--gp-s,1))]"
        : "group-active:translate-y-[calc(8px*var(--gp-s,1))]"
  }`;

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
      className={`group relative block ${outerSize} w-full shrink-0 cursor-pointer disabled:cursor-not-allowed ${className}`}
    >
      {/* Base (the dark "side"): its own layer at the bottom, so pressing never swaps colours mid-frame.
          Pressed, it hides only after the face has fully covered it (delay = slide time), so no dark
          sliver shows around the face's rounded corners; on release it comes back at once. */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 ${faceSize} ${
          disabled ? "bg-[#7F7F7F]" : `${grey ? "bg-[#7F7F7F]" : baseColour} ${pressBase}`
        }`}
      />
      {/* Face: slides down by the base height (× --gp-s): 8px = gp-h-104 − gp-h-96, secondary 6px = gp-h-64 − gp-h-58 */}
      <span
        className={`absolute inset-x-0 top-0 flex ${faceSize} items-center justify-center overflow-clip ${faceText} ${
          grey ? "bg-[#A5A5A5] text-white" : faceColour
        } ${disabled ? "" : pressFace}`}
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
