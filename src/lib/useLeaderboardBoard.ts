"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import type { LeaderboardPlayer } from "@/lib/validations";
import { apiClient } from "@/services/apiClient";
import { leaderboardScoreService, type PendingLeaderboardScore } from "@/services/leaderboardScoreService";
import { localLeaderboardService } from "@/services/localLeaderboardService";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";

/**
 * A game's leaderboard as the player sees it after a round — shared by the leaderboard page and
 * LeaderboardPopup (moved out of src/app/lessons/[id]/leaderboard/page.tsx unchanged):
 * saves the round's pending score for `player` (then clears it), loads the top 10, runs the new-personal-best
 * climb (count-up + rows sliding, FLIP on `listRef`), and works out the player's pinned own row.
 */
export type BoardStatus = "loading" | "ready" | "error";

// New personal best: the player's score counts up from their old best to the new one, and their row
// (yellow while it climbs) moves up past each row it overtakes — rows only move while the number runs.
// Skipped with prefers-reduced-motion (the final board shows straight away).
const CLIMB_DELAY_MS = 700; // let the board settle before the count starts
const CLIMB_MS_PER_POINT = 60;
const CLIMB_MIN_MS = 1200;
const CLIMB_MAX_MS = 3000;
const ROW_MOVE_MS = 320; // a row sliding into its new place

type ClimbPlan = { rowId: string | null; from: number; to: number };

interface UseLeaderboardBoardOptions {
  gid: string | undefined;
  lessonId: string;
  /** undefined = profile not read yet */
  player: LeaderboardPlayer | null | undefined;
  /** load (and save the pending score) only while true */
  enabled: boolean;
  isBrowse?: boolean;
  skipped?: boolean;
  localOnly?: boolean;
  localName?: string;
}

export function useLeaderboardBoard({
  gid,
  lessonId,
  player,
  enabled,
  isBrowse = false,
  skipped = false,
  localOnly = false,
  localName = "",
}: UseLeaderboardBoardOptions) {
  const [boardStatus, setBoardStatus] = useState<BoardStatus>("loading");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<LeaderboardEntry | null>(null);
  const [gameName, setGameName] = useState(""); // ชื่อเกมมาจาก DB (response.game.name) เสมอ ไม่ hardcode
  const [reloadKey, setReloadKey] = useState(0);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  // new personal best: which row climbs, from/to (set by the loader) and the running number
  const [climbPlan, setClimbPlan] = useState<ClimbPlan | null>(null);
  const [climbValue, setClimbValue] = useState(0);
  const listRef = useRef<HTMLElement | null>(null);
  const rowTopsRef = useRef<Map<string, number>>(new Map());
  // attempt_uuid → the save in flight/done for that round, so the effect never sends a round twice
  const savesRef = useRef<Map<string, Promise<number | null>>>(new Map());

  useEffect(() => {
    const activeGid = gid;
    if (!enabled || !activeGid) return;

    let cancelled = false;

    // the player's best before this round (for the personal-best animation; a failed read just skips it),
    // then the round's score saved for them and the pending score cleared — resolves to that previous best
    async function saveRound(targetGid: string, activePlayer: LeaderboardPlayer, round: PendingLeaderboardScore): Promise<number | null> {
      let previousBest: number | null = null;
      try {
        const before = localOnly
          ? localLeaderboardService.getLeaderboard(targetGid, localName, 10, activePlayer.player_uuid)
          : await apiClient.getLeaderboard(targetGid, 10, activePlayer.player_uuid);
        previousBest = before.currentPlayer?.score ?? null;
      } catch {
        previousBest = null;
      }

      if (localOnly) {
        localLeaderboardService.saveScore(targetGid, activePlayer, round.score);
        leaderboardScoreService.clearPendingScore(targetGid);
        loggingService.logEvent("leaderboard_score_saved", {
          game_id: targetGid,
          lesson_id: lessonId,
          score: round.score,
          local_only: true,
        });
      } else {
        // session_id ties the score to its player for the staff data export (docs/software/12 §11.2)
        const sessionId = progressService.getOrCreateSession()?.sessionId;
        await apiClient.saveGameResult({
          ...activePlayer,
          attempt_uuid: round.attempt_uuid,
          gid: targetGid,
          score: round.score,
          ...(sessionId ? { session_id: sessionId } : {}),
        });
        leaderboardScoreService.clearPendingScore(targetGid);
        loggingService.logEvent("leaderboard_score_saved", {
          game_id: targetGid,
          lesson_id: lessonId,
          score: round.score,
          attempt_uuid: round.attempt_uuid,
        });
      }
      return previousBest;
    }

    async function loadLeaderboard(targetGid: string) {
      try {
        const pendingScore = !isBrowse && player
          ? leaderboardScoreService.getPendingScore(targetGid)
          : null;
        // Save this round once per attempt: React may run this effect twice (StrictMode in dev, or a re-render
        // before the save lands) — the second run waits for the same save instead of sending it again, and gets
        // the same "best before this round" for the personal-best animation.
        let latestScore: number | null = null;
        let previousBest: number | null = null;
        if (pendingScore && player) {
          let saving = savesRef.current.get(pendingScore.attempt_uuid);
          if (!saving) {
            saving = saveRound(targetGid, player, pendingScore);
            savesRef.current.set(pendingScore.attempt_uuid, saving);
            // a failed save can be sent again ("ลองใหม่")
            saving.catch(() => savesRef.current.delete(pendingScore.attempt_uuid));
          }
          previousBest = await saving;
          latestScore = pendingScore.score;
          setPlayerScore(pendingScore.score);
        }

        const viewerUuid = isBrowse ? undefined : player?.player_uuid;
        const response = localOnly
          ? localLeaderboardService.getLeaderboard(targetGid, localName, 10, viewerUuid)
          : await apiClient.getLeaderboard(targetGid, 10, viewerUuid);
        if (cancelled) return;

        // beat their own best → count up from the old best; the climbing row is this round's entry (local boards
        // keep one row per player; the server keeps every play, so pick the newest row with this score)
        const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        if (latestScore !== null && previousBest !== null && latestScore > previousBest && !reducedMotion) {
          const newScore = latestScore;
          const mine = response.entries
            .filter((entry) => entry.is_current_player && entry.score === newScore)
            .sort((a, b) => b.created_at.localeCompare(a.created_at));
          setClimbValue(previousBest);
          setClimbPlan({ rowId: mine[0]?.id ?? null, from: previousBest, to: newScore });
          loggingService.logEvent("leaderboard_personal_best", {
            game_id: targetGid,
            lesson_id: lessonId,
            previous_best: previousBest,
            score: newScore,
          });
        }
        setEntries(response.entries);
        setCurrentPlayer(response.currentPlayer ?? null);
        setGameName(response.game.name);
        setBoardStatus("ready");
        if (!isBrowse && latestScore === null) {
          const currentPlayerEntry =
            response.entries.find((entry) => entry.is_current_player) ?? response.currentPlayer;
          if (currentPlayerEntry) setPlayerScore(currentPlayerEntry.score);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("[Leaderboard] Unable to load scores:", error);
        setBoardStatus("error");
      }
    }

    void loadLeaderboard(activeGid);
    return () => {
      cancelled = true;
    };
  }, [gid, lessonId, player, reloadKey, enabled, isBrowse, localOnly, localName]);

  // Count from the old best to the new score (ease-out), then hand back to the final board
  useEffect(() => {
    if (!climbPlan) return;
    const { from, to } = climbPlan;
    const duration = Math.min(CLIMB_MAX_MS, Math.max(CLIMB_MIN_MS, (to - from) * CLIMB_MS_PER_POINT));
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setClimbValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(() => setClimbPlan(null), ROW_MOVE_MS);
    };
    const delay = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, CLIMB_DELAY_MS);
    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [climbPlan]);

  // While counting: the climbing row sits below every row with a score ≥ the running number (ties stay
  // with whoever got there first, as on the real board), ranks follow the order. At the end this is the
  // board as loaded, so nothing jumps when the animation hands over.
  const climbingRow = climbPlan?.rowId ? entries.find((entry) => entry.id === climbPlan.rowId) ?? null : null;
  const displayEntries = useMemo(() => {
    if (!climbPlan || !climbingRow) return entries;
    const others = entries.filter((entry) => entry.id !== climbingRow.id);
    const above = others.filter((entry) => entry.score >= climbValue).length;
    const ordered = [...others.slice(0, above), { ...climbingRow, score: climbValue }, ...others.slice(above)];
    return ordered.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [entries, climbPlan, climbingRow, climbValue]);

  // FLIP: when the order changes, slide each moved row from where it was to its new place, and keep the
  // climbing row in view
  const orderKey = displayEntries.map((entry) => entry.id).join("|");
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const tops = new Map<string, number>();
    list.querySelectorAll<HTMLElement>("[data-row-id]").forEach((row) => {
      const id = row.dataset.rowId ?? "";
      const top = row.offsetTop;
      tops.set(id, top);
      const before = rowTopsRef.current.get(id);
      if (!climbPlan || before === undefined || before === top) return;
      row.style.transition = "none";
      row.style.transform = `translateY(${before - top}px)`;
      void row.offsetHeight; // apply the offset before animating it away
      row.style.transition = `transform ${ROW_MOVE_MS}ms ease-out`;
      row.style.transform = "";
      if (id === climbPlan.rowId) row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    rowTopsRef.current = tops;
  }, [orderKey, climbPlan]);

  const retry = () => {
    setBoardStatus("loading");
    setReloadKey((currentKey) => currentKey + 1);
  };

  // the player's own row, pinned under the list: the entry for this round's score if it's on the board,
  // else their best row on the board, else their rank from outside the top 10 — not in browse mode or
  // after "ไม่" (skipped)
  const ownEntries = entries.filter((entry) => entry.is_current_player);
  const finalOwnEntry =
    !isBrowse && player && !skipped
      ? ownEntries.find((entry) => entry.score === playerScore) ?? ownEntries[0] ?? currentPlayer
      : null;
  // while the new best counts up, the pinned row shows the running number (and the climbing row's rank)
  const climbingDisplay = climbPlan?.rowId ? displayEntries.find((entry) => entry.id === climbPlan.rowId) : undefined;
  const ownEntry =
    finalOwnEntry && climbPlan
      ? { ...finalOwnEntry, score: climbValue, rank: climbingDisplay?.rank ?? finalOwnEntry.rank }
      : finalOwnEntry;

  return { boardStatus, entries, displayEntries, gameName, climbPlan, listRef, ownEntry, retry };
}
