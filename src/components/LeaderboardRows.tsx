"use client";

import { RefreshCw } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard";

// Leaderboard rows shared by the leaderboard page and LeaderboardPopup (moved out of
// src/app/lessons/[id]/leaderboard/page.tsx unchanged).
// Figma "Leaderboard" (Scammer Game Prototype, node 3157:15491): title + game name (trophy dropped), a purple
// column bar, white rows (rank badge · name · score pill), and the player's own row pinned in yellow under
// the list. Ranks 1–3 show a medal instead of the number badge (🥇🥈🥉, as in the design's rows).
const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
export const BOARD_BAR = "#A855D4"; // Figma "Primary Purple"
export const OWN_ROW = { bg: "#F0AE03", border: "#C38D00" }; // Figma "Primary Yellow" / "Yellow Pressed"
// white on yellow is below 4.5:1 on its own — same dark text shadow the old podium rows used
const ON_YELLOW_SHADOW = "0px 2px 4px rgba(0, 0, 0, 0.5)";

// 52px white circle with a grey ring (rank) — medals for 1–3
export function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank];
  if (medal) {
    return (
      <span className="flex size-[52px] shrink-0 items-center justify-center text-[40px] leading-none" aria-label={`อันดับ ${rank}`} data-type-exempt="medal emoji">
        {medal}
      </span>
    );
  }
  return (
    <span
      className="flex size-[52px] shrink-0 items-center justify-center rounded-full border-4 border-solid border-[#D9D9D9] bg-white text-button text-black tabular-nums"
      aria-label={`อันดับ ${rank}`}
    >
      {rank}
    </span>
  );
}

// 52px tall white pill with a grey ring, at least 56px wide (grows with longer scores)
export function ScorePill({ score }: { score: number }) {
  return (
    <span className="flex h-[52px] min-w-[56px] shrink-0 items-center justify-center rounded-[24px] border-4 border-solid border-[#D9D9D9] bg-white px-[6px] text-button text-black tabular-nums">
      {score.toLocaleString("th-TH")}
    </span>
  );
}

// Compact list rows of LeaderboardPopup — Figma "Leaderboard" (Scammer Game Prototype, node 3774:8834):
// Figma has 60px rows touching each other; here they are 48px with an 8px gap (LeaderboardPopup). 12px corners, 2px G0 border; 36px medal SVG (1–3, scaled down from 40px to sit with the 20px name; neck strap and clasp removed, viewBox re-centred on the disc) or plain number badge,
// plain score (no ring). The player's own pinned row and their climbing row are this same 48px row in yellow.
const MEDAL_SVGS: Record<number, string> = {
  1: "/assets/result/medal-gold.svg",
  2: "/assets/result/medal-silver.svg",
  3: "/assets/result/medal-bronze.svg",
};

// own: the pinned row under the list (not a list row, so no data-row-id) · climbing: the player's row in the list
// while their new best counts up · mine: the player's row in the list — yellow like the pinned row, and sticky:
// while it is below (or above) the scroll view it sticks to that edge, then settles into place as it is reached,
// so the list never changes height
function CompactBoardRow({ entry, own, climbing, mine }: { entry: LeaderboardEntry; own: boolean; climbing: boolean; mine: boolean }) {
  const medal = MEDAL_SVGS[entry.rank];
  const yellow = own || climbing || mine;
  return (
    <article
      data-row-id={own ? undefined : entry.id}
      className={`${mine ? "sticky top-0 bottom-0 z-10" : climbing ? "relative z-10" : "relative"} flex h-[48px] shrink-0 items-center gap-[38px] rounded-[12px] border-2 border-solid pl-[16px] pr-[20px] ${yellow ? "" : "bg-white"}`}
      style={yellow ? { backgroundColor: OWN_ROW.bg, borderColor: OWN_ROW.border } : { borderColor: "#D9D9D9" }}
      aria-label={own ? `อันดับของคุณ ${entry.rank} ${entry.name} ${entry.score} คะแนน` : undefined}
    >
      {medal ? (
        // eslint-disable-next-line @next/next/no-img-element -- static medal SVG from the Figma design
        <img src={medal} alt={`อันดับ ${entry.rank}`} width={36} height={36} className="block size-[36px] shrink-0" />
      ) : (
        <span className="flex size-[36px] shrink-0 items-center justify-center text-button text-black tabular-nums" aria-label={`อันดับ ${entry.rank}`}>
          {entry.rank}
        </span>
      )}
      <p
        className={`min-w-0 flex-1 truncate text-body ${yellow ? "text-white" : "text-black"}`}
        style={yellow ? { textShadow: ON_YELLOW_SHADOW } : undefined}
        title={entry.name}
      >
        {entry.name}
      </p>
      <span className={`flex min-w-[40px] shrink-0 items-center justify-center text-button tabular-nums ${yellow ? "text-white" : "text-black"}`} style={yellow ? { textShadow: ON_YELLOW_SHADOW } : undefined}>
        {entry.score.toLocaleString("th-TH")}
      </span>
    </article>
  );
}

// own = the pinned row under the list · climbing = the player's row in the list while their new best counts up
// (yellow like the pinned row, but the list rows' size so the list doesn't jump)
// compact: LeaderboardPopup's 48px rows (own row included — the page keeps the full-size rows)
export function BoardRow({
  entry,
  own = false,
  climbing = false,
  compact = false,
  mine = false,
}: {
  entry: LeaderboardEntry;
  own?: boolean;
  climbing?: boolean;
  compact?: boolean;
  /** compact only: the player's own row inside the list, painted yellow like the pinned row */
  mine?: boolean;
}) {
  if (compact) return <CompactBoardRow entry={entry} own={own} climbing={climbing} mine={mine} />;
  const yellow = own || climbing;
  return (
    <article
      data-row-id={entry.id}
      className={`relative flex shrink-0 items-center gap-[24px] rounded-[24px] border-solid ${
        own ? "h-[80px] border-4 pl-[8px] pr-[12px]" : `h-[84px] border-2 pl-[12px] pr-[16px] ${climbing ? "z-10" : "bg-white"}`
      }`}
      style={yellow ? { backgroundColor: OWN_ROW.bg, borderColor: OWN_ROW.border } : { borderColor: "#D9D9D9" }}
      aria-label={own ? `อันดับของคุณ ${entry.rank} ${entry.name} ${entry.score} คะแนน` : undefined}
    >
      <RankBadge rank={entry.rank} />
      <p
        className={`min-w-0 flex-1 truncate text-body ${yellow ? "text-white" : "text-black"}`}
        style={yellow ? { textShadow: ON_YELLOW_SHADOW } : undefined}
        title={entry.name}
      >
        {entry.name}
      </p>
      <ScorePill score={entry.score} />
    </article>
  );
}

/** grey placeholder row while the board loads (compact: LeaderboardPopup's 48px row) */
export function BoardRowSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex h-[48px] shrink-0 animate-pulse items-center gap-[38px] rounded-[12px] border-2 border-solid border-[#D9D9D9] pl-[16px] pr-[20px]">
        <div className="size-[36px] rounded-full bg-[#D9D9D9]" />
        <div className="h-6 flex-1 rounded-full bg-[#D9D9D9]" />
        <div className="h-[30px] w-[40px] rounded-[12px] bg-[#D9D9D9]" />
      </div>
    );
  }
  return (
    <div className="flex h-[84px] shrink-0 animate-pulse items-center gap-[24px] rounded-[24px] border-2 border-solid border-[#D9D9D9] pl-[12px] pr-[16px]">
      <div className="size-[52px] rounded-full bg-[#D9D9D9]" />
      <div className="h-6 flex-1 rounded-full bg-[#D9D9D9]" />
      <div className="h-[52px] w-[56px] rounded-[24px] bg-[#D9D9D9]" />
    </div>
  );
}

export function BoardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[24px] border-2 border-solid border-[#D9D9D9] px-5 py-8 text-center">
      <p className="text-h3 text-[#4B4B4B]">โหลดกระดานคะแนนไม่สำเร็จ</p>
      <p className="mt-2 text-body text-[#4B4B4B]">กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[20px] border-2 border-solid border-[#00A3E0] bg-white px-6 text-button text-[#0078A8]"
      >
        <RefreshCw size={24} aria-hidden="true" />
        ลองใหม่
      </button>
    </div>
  );
}

export function BoardEmpty() {
  return (
    <div className="rounded-[24px] border-2 border-dashed border-[#D9D9D9] px-5 py-8 text-center">
      <p className="text-h3 text-[#4B4B4B]">ยังไม่มีคะแนนในเกมนี้</p>
      <p className="mt-2 text-body text-[#4B4B4B]">มาเป็นผู้เล่นคนแรกบนกระดานคะแนนกันเลย</p>
    </div>
  );
}
