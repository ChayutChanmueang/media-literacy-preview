"use client";

import type React from "react";

// 3D press for card-style buttons (lessons page cards/back button, leaderboard game picker) — same feel as
// Button3D: the grey base is its own layer exactly `depth` px under the face (so it stays visible however tall
// the face grows with its text), the face slides down over it in 90ms, and the base hides only once fully
// covered (no grey sliver at the rounded corners) and comes back at once on release. Face (children) carries
// the white fill, the #D9D9D9 2px border and the rounding; baseRadius must match that rounding.
// depth: how far below the face the base shows (8px like Button3D; the mode cards use Figma's 2px shadow).
// Full class strings per depth so Tailwind can see them.
// (moved out of src/app/lessons/page.tsx unchanged)
const PRESS_DEPTH = {
  8: { pad: "pb-[8px]", base: "top-[8px]", press: "group-active:translate-y-[8px]" },
  2: { pad: "pb-[2px]", base: "top-[2px]", press: "group-active:translate-y-[2px]" },
} as const;

export default function Press3D({
  onClick,
  className = "",
  baseRadius,
  depth = 8,
  baseColor = "#D9D9D9",
  children,
}: {
  onClick: () => void;
  className?: string;
  baseRadius: string;
  depth?: keyof typeof PRESS_DEPTH;
  /** colour of the drop-shadow base under the face (default: the page's grey) */
  baseColor?: string;
  children: React.ReactNode;
}) {
  const d = PRESS_DEPTH[depth];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block cursor-pointer border-0 bg-transparent p-0 ${d.pad} text-left ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 ${d.base} ${baseRadius} transition-opacity duration-0 group-active:opacity-0 group-active:delay-[90ms]`}
        style={{ backgroundColor: baseColor }}
      />
      <span className={`relative block transition-transform duration-[90ms] ease-out ${d.press}`}>
        {children}
      </span>
    </button>
  );
}
