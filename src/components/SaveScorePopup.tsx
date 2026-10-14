"use client";

import type { ReactNode } from "react";
import { notoLoopedThai } from "@/lib/fonts";

// Figma "เลือกเก็บคะแนนหรือไม่1" (Scammer Game Prototype, node 3157:15321) — asked when a fun game ends:
// save the score (→ name entry) or not (→ the game's leaderboard). No close button / backdrop dismiss on
// purpose: the player has to pick one of the two.

// Built like GameAnswerButton: the darker base is its own layer at the bottom and the face sits above it.
// Pressed, the face slides down over the base in 90ms and the base hides once fully covered; on release it
// comes back at once. "ไม่" (Component 30): white face with a grey edge, 2px lift · "ใช่" (Component 29):
// blue face, 4px lift — heights as in Figma (64px button, 62 / 60px face).
function PopupButton({
  lift,
  base,
  face,
  onClick,
  children,
}: {
  lift: 2 | 4;
  base: string;
  face: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const pressed = lift === 2 ? "group-active:translate-y-[2px]" : "group-active:translate-y-[4px]";
  return (
    <button type="button" onClick={onClick} className="group relative block h-[64px] min-w-0 flex-1 cursor-pointer rounded-[20px] bg-transparent p-0">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 rounded-[20px] transition-opacity duration-0 group-active:opacity-0 group-active:delay-[90ms] ${base}`}
        style={{ top: lift }}
      />
      <span
        className={`absolute inset-x-0 top-0 flex items-center justify-center rounded-[20px] text-[20px] font-semibold leading-[30px] transition-transform duration-[90ms] ease-out ${pressed} ${face}`}
        style={{ height: 64 - lift }}
      >
        {children}
      </span>
    </button>
  );
}

export default function SaveScorePopup({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className={`${notoLoopedThai.className} fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4`}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="save-score-popup-title"
        className="w-full max-w-[352px] rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white px-[20px] pt-[42px] pb-[48px] shadow-[0px_2px_0px_0px_#D9D9D9]"
      >
        <h2 id="save-score-popup-title" className="text-center text-[20px] font-semibold leading-[30px] text-[#4B4B4B]">
          ต้องการเก็บคะแนนหรือไม่?
        </h2>
        <div className="mt-[14px] flex gap-[8px]">
          <PopupButton lift={2} base="bg-[#A5A5A5]" face="border-2 border-solid border-[#A5A5A5] bg-white text-[#7F7F7F]" onClick={onNo}>
            ไม่
          </PopupButton>
          <PopupButton lift={4} base="bg-[#0078A8]" face="bg-[#00A3E0] text-white" onClick={onYes}>
            ใช่
          </PopupButton>
        </div>
      </div>
    </div>
  );
}
