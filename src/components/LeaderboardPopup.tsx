"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { getLeaderboardGame, usesLocalLeaderboard } from "@/lib/leaderboard";
import { useLeaderboardBoard } from "@/lib/useLeaderboardBoard";
import { leaderboardPlayerService } from "@/services/leaderboardPlayerService";
import { loggingService } from "@/services/loggingService";
import Button3D from "./Button3D";
import { BOARD_BAR, BoardEmpty, BoardError, BoardRow, BoardRowSkeleton } from "./LeaderboardRows";

/**
 * The leaderboard as a popup over the game, after the name entry popup (every fun game: G13, G18–G20K)
 * — also opened from the game picker in browse mode (see below). Content from Figma "Leaderboard" (Scammer Game Prototype, node 3774:8834):
 * game icon beside "กระดานคะแนน" + game name · rounded purple column bar · compact 48px rows that scroll ·
 * the player's own row pinned in yellow under them — inside one card (as wide as the games' continue button,
 * G1 grey border like the game's other end-of-round popups (GamePopupShell), 16px inner padding), and the blue "กดเพื่อเสร็จสิ้น" under it at the games' continue-button
 * position. The card stretches from the old centred top (572px card) down to the button, so the list gets taller.
 *
 * Same data as the page (useLeaderboardBoard): saves the round's pending score for the stored profile,
 * loads the top 10, and runs the new-personal-best climb.
 *
 * browse: opened from the game picker (main-menu drawer / fun-game page) instead of after a round — the board
 * only (no score saved, no player's row, like the page's ?view=browse), and the button closes the popup.
 */
// Temporary: browse mode closes with an ✕ at the card's top-right instead of the bottom "ปิด" button.
// Set to true to bring the bottom button back (the ✕ then goes away).
const BROWSE_BOTTOM_CLOSE = false;

interface LeaderboardPopupProps {
  lessonId: string;
  onFinish: () => void;
  browse?: boolean;
}

export default function LeaderboardPopup({ lessonId, onFinish, browse = false }: LeaderboardPopupProps) {
  const titleId = useId();
  const showBottomButton = !browse || BROWSE_BOTTOM_CLOSE;
  const cardRef = useRef<HTMLDivElement>(null);
  const game = getLeaderboardGame(lessonId);
  // the name entry popup has just stored the profile (browse: not tied to a player)
  const [player] = useState(() => (browse ? null : leaderboardPlayerService.getProfile()));

  const { boardStatus, entries, displayEntries, gameName, climbPlan, listRef, ownEntry, retry } = useLeaderboardBoard({
    gid: game?.gid,
    lessonId,
    player,
    enabled: true,
    isBrowse: browse,
    localOnly: usesLocalLeaderboard(game), // localOnly games, or every game on localhost
    localName: game?.name ?? "",
  });

  // The player's row inside the list: yellow and sticky (sticks to the list's bottom/top edge while out of view,
  // see LeaderboardRows), so the list keeps one height. The yellow bar under the list is only for a player
  // who isn't in the top 10 — it never toggles while scrolling.
  const ownRowId = boardStatus === "ready" && ownEntry && displayEntries.some((entry) => entry.id === ownEntry.id) ? ownEntry.id : null;

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
    loggingService.logEvent("leaderboard_popup_view", { lesson_id: lessonId, has_player_profile: Boolean(player), browse });
  }, [lessonId, player, browse]);

  return (
    // topmost popup: its dim covers the game and the popups under it. gp-compact: stepped small-screen scale
    <div className="result-backdrop gp-compact fixed inset-0 z-50 overflow-y-auto bg-black/40">
      {/* Same column as the games' "กดเพื่อไปต่อ" (480px app frame, gp-px-24), so card and button match its width.
          Bottom: gp-pb-action-bar, so the button sits where the games' continue button does.
          Top: where the card's top was when a 572px card + 16px gap + 104px button were centred on the screen
          (24px at least) — the card fills everything between, so a taller screen shows more rows.
          Without the bottom button (browse + ✕): the 572px card centred on the screen instead, 24px from the
          top/bottom at least (shrinks to fit a short screen) */}
      <div
        className={`mx-auto flex h-full min-h-[480px] w-full max-w-[480px] flex-col items-center gp-gap-16 gp-px-24 ${
          showBottomButton ? "gp-pb-action-bar" : "justify-center"
        }`}
        style={
          showBottomButton
            ? { paddingTop: "max(calc(24px * var(--gp-s, 1)), calc((100dvh - 572px - 120px * var(--gp-s, 1)) / 2))" }
            : { paddingBlock: "calc(24px * var(--gp-s, 1))" }
        }
      >
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`result-card relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[24px] border-2 border-solid border-[#A5A5A5] bg-white px-[16px] pb-[16px] outline-none ${
            showBottomButton ? "" : "max-h-[572px]"
          }`}
        >
          {!showBottomButton && (
            // 44px tap target, same ✕ as the game picker popup
            <button
              type="button"
              onClick={onFinish}
              aria-label="ปิด"
              className="absolute right-[8px] top-[8px] z-[1] flex size-[44px] cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-app)] focus-visible:outline-2 focus-visible:outline-black"
            >
              <X size={24} aria-hidden="true" />
            </button>
          )}

          {/* 100px header: game icon beside the title + game name, centred as one unit
              (with the ✕: 44px kept clear on both sides so a long name truncates before it) */}
          <header className={`flex h-[100px] shrink-0 items-center justify-center gap-[12px] ${showBottomButton ? "" : "px-[44px]"}`}>
            {game?.icon && (
              // eslint-disable-next-line @next/next/no-img-element -- the game's own icon (data from LEADERBOARD_GAMES)
              <img src={game.icon} alt="" aria-hidden="true" width={48} height={48} className="block size-[48px] shrink-0 object-cover" />
            )}
            <div className="flex min-w-0 flex-col items-start text-left">
              {/* styles swapped from the Figma: the game name is the big line, "กระดานคะแนน" the small one */}
              <h2 id={titleId} className="text-body text-black">
                กระดานคะแนน
              </h2>
              <p className="truncate text-h3 text-black">{gameName || game?.name}</p>
            </div>
          </header>

          {/* 48px like the rows (Figma: 60px) */}
          <div className="flex h-[48px] shrink-0 items-center rounded-[12px] px-[16px] text-body text-white" style={{ backgroundColor: BOARD_BAR }}>
            <span className="w-[72px]">อันดับ</span>
            <span className="flex-1">ชื่อ</span>
            <span>คะแนน</span>
          </div>

          {/* the list scrolls between the bar and the pinned row (only when the player isn't in the list) */}
          <section
            ref={listRef}
            aria-live="polite"
            aria-busy={boardStatus === "loading" || climbPlan !== null}
            // 8px between rows, as in the old popup's list (the Figma rows touch), and the same 8px under the bar
            className="relative flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto pt-[8px]"
          >
            {boardStatus === "loading" && Array.from({ length: 5 }, (_, index) => <BoardRowSkeleton key={index} compact />)}
            {boardStatus === "error" && <BoardError onRetry={retry} />}
            {boardStatus === "ready" && entries.length === 0 && <BoardEmpty />}
            {boardStatus === "ready" &&
              displayEntries.map((entry) => (
                <BoardRow
                  key={entry.id}
                  entry={entry}
                  compact
                  mine={entry.id === ownRowId}
                  climbing={climbPlan !== null && entry.id === climbPlan.rowId}
                />
              ))}
          </section>

          {boardStatus === "ready" && ownEntry && !ownRowId && (
            // only when the player isn't in the list (outside the top 10) · 8px above it, same as the gap between the rows
            <div className="shrink-0 pt-[8px]">
              <BoardRow entry={ownEntry} own compact />
            </div>
          )}
        </div>

        {showBottomButton && (
          <div className="result-actions w-full shrink-0">
            <Button3D onClick={onFinish}>{browse ? "ปิด" : "กดเพื่อเสร็จสิ้น"}</Button3D>
          </div>
        )}
      </div>
    </div>
  );
}
