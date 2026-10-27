"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Trophy } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  getLeaderboardGame,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import {
  leaderboardNameSchema,
  type LeaderboardNameInput,
  type LeaderboardPlayer,
} from "@/lib/validations";
import { apiClient } from "@/services/apiClient";
import { leaderboardPlayerService } from "@/services/leaderboardPlayerService";
import { leaderboardScoreService } from "@/services/leaderboardScoreService";
import { localLeaderboardService } from "@/services/localLeaderboardService";
import Button3D from "@/components/Button3D";
import { notoLoopedThai } from "@/lib/fonts";
import LeaderboardGamePicker from "@/components/LeaderboardGamePicker";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";

type ViewState = "loading" | "name-entry" | "leaderboard";
type BoardStatus = "loading" | "ready" | "error";
// Figma "Leaderboard" (Scammer Game Prototype, node 3157:15491): title + game name (trophy dropped), a purple
// column bar, white rows (rank badge · name · score pill), and the player's own row pinned in yellow under
// the list. Ranks 1–3 show a medal instead of the number badge (🥇🥈🥉, as in the design's rows).
const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const BOARD_BAR = "#A855D4"; // Figma "Primary Purple"
const OWN_ROW = { bg: "#F0AE03", border: "#C38D00" }; // Figma "Primary Yellow" / "Yellow Pressed"
// white on yellow is below 4.5:1 on its own — same dark text shadow the old podium rows used
const ON_YELLOW_SHADOW = "0px 2px 4px rgba(0, 0, 0, 0.5)";

// New personal best: the player's score counts up from their old best to the new one, and their row
// (yellow while it climbs) moves up past each row it overtakes — rows only move while the number runs.
// Skipped with prefers-reduced-motion (the final board shows straight away).
const CLIMB_DELAY_MS = 700; // let the board settle before the count starts
const CLIMB_MS_PER_POINT = 60;
const CLIMB_MIN_MS = 1200;
const CLIMB_MAX_MS = 3000;
const ROW_MOVE_MS = 320; // a row sliding into its new place

type ClimbPlan = { rowId: string | null; from: number; to: number };

// 52px white circle with a grey ring (rank) — medals for 1–3
function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank];
  if (medal) {
    return (
      <span className="flex size-[52px] shrink-0 items-center justify-center text-[40px] leading-none" aria-label={`อันดับ ${rank}`}>
        {medal}
      </span>
    );
  }
  return (
    <span
      className="flex size-[52px] shrink-0 items-center justify-center rounded-full border-4 border-solid border-[#D9D9D9] bg-white text-[20px] font-semibold leading-[30px] text-black tabular-nums"
      aria-label={`อันดับ ${rank}`}
    >
      {rank}
    </span>
  );
}

// 52px tall white pill with a grey ring, at least 56px wide (grows with longer scores)
function ScorePill({ score }: { score: number }) {
  return (
    <span className="flex h-[52px] min-w-[56px] shrink-0 items-center justify-center rounded-[24px] border-4 border-solid border-[#D9D9D9] bg-white px-[6px] text-[20px] font-semibold leading-[30px] text-black tabular-nums">
      {score.toLocaleString("th-TH")}
    </span>
  );
}

// own = the pinned row under the list · climbing = the player's row in the list while their new best counts up
// (yellow like the pinned row, but the list rows' size so the list doesn't jump)
function BoardRow({ entry, own = false, climbing = false }: { entry: LeaderboardEntry; own?: boolean; climbing?: boolean }) {
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
        className={`min-w-0 flex-1 truncate text-[20px] font-normal leading-[30px] ${yellow ? "text-white" : "text-black"}`}
        style={yellow ? { textShadow: ON_YELLOW_SHADOW } : undefined}
        title={entry.name}
      >
        {entry.name}
      </p>
      <ScorePill score={entry.score} />
    </article>
  );
}

function LeaderboardPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  // US-CF-52: โหมดดูกระดานคะแนนจากเมนู — ไม่ผูกกับผู้เล่น (ไม่มีชื่อ/ไฮไลต์), เหรียญบนเป็น trophy
  const isBrowse = searchParams.get("view") === "browse";
  // From a fun game's "เก็บคะแนนไหม?" popup (game page): step=save → name entry (Figma 3157:15657),
  // then the board once saved · skipped=1 → straight to the board, score not kept
  const isSaveStep = searchParams.get("step") === "save";
  const skipped = searchParams.get("skipped") === "1";
  const lessonId = params.id;
  const game = getLeaderboardGame(lessonId);
  const gid = game?.gid;
  // เกม localOnly: กระดานคะแนนในเครื่อง ไม่ส่ง/ดึงจากฐานข้อมูล (ดู LOCAL_LEADERBOARD_GAMES — ตอนนี้ยังไม่มีเกมในกลุ่มนี้)
  const localOnly = Boolean(game?.localOnly);
  const localName = game?.name ?? "";
  const [player, setPlayer] = useState<LeaderboardPlayer | null | undefined>(undefined);
  const [boardStatus, setBoardStatus] = useState<BoardStatus>("loading");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<LeaderboardEntry | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false); // US-CF-52: popup เลือกเกมบนหน้า browse
  const [gameName, setGameName] = useState(""); // ชื่อเกมมาจาก DB (response.game.name) เสมอ ไม่ hardcode
  const [reloadKey, setReloadKey] = useState(0);
  // empty name on "ยืนยัน": the name field shakes (gp1-shake) instead of showing a message
  const [nameShaking, setNameShaking] = useState(false);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  // new personal best: which row climbs, from/to (set by the loader) and the running number
  const [climbPlan, setClimbPlan] = useState<ClimbPlan | null>(null);
  const [climbValue, setClimbValue] = useState(0);
  const listRef = useRef<HTMLElement | null>(null);
  const rowTopsRef = useRef<Map<string, number>>(new Map());
  const viewState: ViewState = isBrowse
    ? "leaderboard"
    : player === undefined
      ? "loading"
      : isSaveStep
        ? "name-entry"
        : "leaderboard";

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LeaderboardNameInput>({
    resolver: zodResolver(leaderboardNameSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  useEffect(() => {
    const storedPlayer = leaderboardPlayerService.getProfile();
    // localStorage is unavailable during SSR, so initialize this external state after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayer(storedPlayer);
    // a returning player starts with their name filled in (they can still change it)
    if (storedPlayer) reset({ name: storedPlayer.name });
    loggingService.logEvent("leaderboard_page_view", {
      has_player_profile: Boolean(storedPlayer),
      lesson_id: lessonId,
    });
  }, [lessonId, reset]);

  useEffect(() => {
    const activeGid = gid;
    if (viewState !== "leaderboard" || !activeGid) return;

    let cancelled = false;

    async function loadLeaderboard(targetGid: string) {
      try {
        const pendingScore = !isBrowse && player
          ? leaderboardScoreService.getPendingScore(targetGid)
          : null;
        let latestScore: number | null = null;

        // the player's best before this round (for the personal-best animation); a failed read just skips it
        let previousBest: number | null = null;
        if (pendingScore && player) {
          try {
            const before = localOnly
              ? localLeaderboardService.getLeaderboard(targetGid, localName, 10, player.player_uuid)
              : await apiClient.getLeaderboard(targetGid, 10, player.player_uuid);
            previousBest = before.currentPlayer?.score ?? null;
          } catch {
            previousBest = null;
          }
        }

        if (pendingScore && player && localOnly) {
          latestScore = pendingScore.score;
          setPlayerScore(pendingScore.score);
          localLeaderboardService.saveScore(targetGid, player, pendingScore.score);
          leaderboardScoreService.clearPendingScore(targetGid);
          loggingService.logEvent("leaderboard_score_saved", {
            game_id: targetGid,
            lesson_id: lessonId,
            score: pendingScore.score,
            local_only: true,
          });
        } else if (pendingScore && player) {
          latestScore = pendingScore.score;
          setPlayerScore(pendingScore.score);
          await apiClient.saveGameResult({
            ...player,
            attempt_uuid: pendingScore.attempt_uuid,
            gid: targetGid,
            score: pendingScore.score,
          });
          leaderboardScoreService.clearPendingScore(targetGid);
          loggingService.logEvent("leaderboard_score_saved", {
            game_id: targetGid,
            lesson_id: lessonId,
            score: pendingScore.score,
          });
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
  }, [gid, lessonId, player, reloadKey, viewState, isBrowse, localOnly, localName]);

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

  // "ยืนยัน": keep the profile if the name is unchanged (a new name = a new player), then show the board —
  // its loader saves the pending score for this player, so the board appears once the score is saved
  const handleSaveName = (data: LeaderboardNameInput) => {
    const reused = Boolean(player && player.name === data.name);
    const savedPlayer = reused && player ? player : leaderboardPlayerService.createProfile(data.name);
    setPlayer(savedPlayer);
    loggingService.logEvent("leaderboard_name_saved", { lesson_id: lessonId, reused_profile: reused });
    router.replace(`/lessons/${lessonId}/leaderboard`);
  };

  const handleSaveClick = () => {
    if (isSubmitting) return;
    const name = getValues("name")?.trim() ?? "";
    if (!name) {
      // red border + "กรุณากรอกชื่อของคุณ" under the field + shake + focus
      setError("name", { type: "manual", message: "กรุณากรอกชื่อของคุณ" });
      setNameShaking(true);
      document.getElementById("leaderboard-name")?.focus();
      return;
    }
    void handleSubmit(handleSaveName)();
  };

  const handleRetry = () => {
    setBoardStatus("loading");
    setReloadKey((currentKey) => currentKey + 1);
  };

  // ปุ่มจบของเกมสนุกที่มาหน้านี้ตรงจากเกม (G13 + G18–G20K)
  const handleFinishFunGame = () => {
    // nothing should be left pending once the player leaves (the popup's "ไม่" already dropped it)
    if (gid) leaderboardScoreService.clearPendingScore(gid);
    const progress = progressService.getProgress();
    // โหมดอิสระ: เกมสนุกเป็นหมวดเดี่ยว ไม่ใช่ปลายทาง Flow จึงกลับหน้าหมวดหมู่แทนหน้าจบคอร์ส
    if (progress?.learningMode === "manual") {
      progressService.saveProgress({
        ...progress,
        currentStep: "lessons",
        currentLessonId: undefined,
      });
      router.push("/lessons");
      return;
    }
    progressService.saveProgress({
      ...progress,
      currentStep: "complete",
      currentLessonId: undefined,
    });
    router.push("/lessons/complete");
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

  if (viewState === "loading") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
        <span className="text-[20px] text-[var(--text-secondary)]">กำลังเตรียมกระดานคะแนน...</span>
      </div>
    );
  }

  if (!game) {
    return (
      <main className="scroll-region bg-[var(--bg-app)]">
        <div className="flex min-h-full flex-col items-center justify-center gap-4 px-5 py-8 text-center">
          <Trophy size={52} className="text-[var(--text-secondary)]" aria-hidden="true" />
          <h1 className="text-[32px] font-bold text-[var(--text-primary)]">ไม่พบเกมนี้</h1>
          <p className="text-[20px] text-[var(--text-secondary)]">
            กรุณาเปิดกระดานคะแนนจากหน้าจบเกมที่รองรับ
          </p>
        </div>
      </main>
    );
  }

  if (viewState === "leaderboard") {
    return (
      <main className={`${notoLoopedThai.className} gp-compact flex h-full min-h-0 flex-col bg-white`}>
        <div className="mx-auto flex min-h-0 w-full max-w-[400px] flex-1 flex-col gp-px-24 pt-[24px]">
          {/* gap = the bar's mt: the game name sits midway between the title and the purple bar */}
          <header className="flex shrink-0 flex-col items-center gap-[8px] text-center">
            <h1 className="text-[24px] font-semibold leading-[32px] text-black">กระดานคะแนน</h1>
            {/* icon + name centred as one unit; the icon is sized in em so it stays about the text's size */}
            <p className="flex items-center justify-center gap-[8px] text-[20px] font-normal leading-[30px] text-black">
              {game?.icon && (gameName || localName) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.icon} alt="" aria-hidden="true" className="h-[1.2em] w-[1.2em] shrink-0 object-contain" />
              )}
              <span>{gameName || localName}</span>
            </p>
            {!isBrowse && (skipped || !player) && (
              <p className="text-[20px] font-normal leading-[30px] text-[#4B4B4B]">ดูอันดับโดยไม่เก็บคะแนน</p>
            )}
          </header>

          <div
            className="mt-[8px] flex h-[60px] shrink-0 items-center rounded-[12px] px-[16px] text-[20px] font-normal leading-[30px] text-white"
            style={{ backgroundColor: BOARD_BAR }}
          >
            <span className="w-[72px]">อันดับ</span>
            <span className="flex-1">ชื่อ</span>
            <span>คะแนน</span>
          </div>

          {/* the list scrolls between the bar and the pinned row, so the page itself doesn't */}
          <section
            ref={listRef}
            aria-live="polite"
            aria-busy={boardStatus === "loading" || climbPlan !== null}
            className="mt-[4px] flex min-h-0 flex-1 flex-col gap-[4px] overflow-y-auto"
          >
            {boardStatus === "loading" &&
              Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="flex h-[84px] shrink-0 animate-pulse items-center gap-[24px] rounded-[24px] border-2 border-solid border-[#D9D9D9] pl-[12px] pr-[16px]"
                >
                  <div className="size-[52px] rounded-full bg-[#D9D9D9]" />
                  <div className="h-6 flex-1 rounded-full bg-[#D9D9D9]" />
                  <div className="h-[52px] w-[56px] rounded-[24px] bg-[#D9D9D9]" />
                </div>
              ))}

            {boardStatus === "error" && (
              <div className="rounded-[24px] border-2 border-solid border-[#D9D9D9] px-5 py-8 text-center">
                <p className="text-[22px] font-bold text-[#4B4B4B]">โหลดกระดานคะแนนไม่สำเร็จ</p>
                <p className="mt-2 text-[20px] text-[#4B4B4B]">กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-5 inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[20px] border-2 border-solid border-[#00A3E0] bg-white px-6 text-[20px] font-semibold text-[#0078A8]"
                >
                  <RefreshCw size={24} aria-hidden="true" />
                  ลองใหม่
                </button>
              </div>
            )}

            {boardStatus === "ready" && entries.length === 0 && (
              <div className="rounded-[24px] border-2 border-dashed border-[#D9D9D9] px-5 py-8 text-center">
                <p className="text-[22px] font-bold text-[#4B4B4B]">ยังไม่มีคะแนนในเกมนี้</p>
                <p className="mt-2 text-[20px] text-[#4B4B4B]">มาเป็นผู้เล่นคนแรกบนกระดานคะแนนกันเลย</p>
              </div>
            )}

            {boardStatus === "ready" &&
              displayEntries.map((entry) => (
                <BoardRow key={entry.id} entry={entry} climbing={climbPlan !== null && entry.id === climbPlan.rowId} />
              ))}
          </section>

          {boardStatus === "ready" && ownEntry && (
            <div className="shrink-0">
              <BoardRow entry={ownEntry} own />
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-[400px] shrink-0 gp-px-24 gp-pb-action-bar pt-[17px]">
          {isBrowse ? (
            <Button3D onClick={() => setPickerOpen(true)}>เลือกเกม</Button3D>
          ) : (
            <Button3D onClick={handleFinishFunGame}>กดเพื่อเสร็จสิ้น</Button3D>
          )}
        </div>

        <LeaderboardGamePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
      </main>
    );
  }

  // Figma "Insert Name" (Scammer Game Prototype, node 3347:15533): no card — the avatar, title and name field
  // (344px wide, 28px from the screen edges) sit centred in the space above the blue "ยืนยัน" button
  // (Button3D = Figma Component 24; Figma still says "กดเพื่อยืนยัน", shortened at the team's request).
  return (
    <main className={`${notoLoopedThai.className} gp-compact flex h-full min-h-0 flex-col bg-white`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSaveClick();
        }}
        className="flex h-full min-h-0 flex-col"
        noValidate
      >
        <div className="scroll-region flex-1">
          <div className="mx-auto flex min-h-full w-full max-w-[400px] flex-col justify-center gp-px-24 gp-py-24">
            <section className="flex flex-col items-center gap-[16px] px-[4px] text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG from the Figma design */}
              <img src="/assets/icons/leaderboard-avatar.svg" alt="" aria-hidden="true" width={100} height={100} className="block shrink-0" />

              <h1 className="text-[28px] font-bold leading-[36px] text-[#4B4B4B]">กรอกชื่อเพื่อเก็บคะแนน</h1>
              <div className="w-full">
                <label htmlFor="leaderboard-name" className="sr-only">
                  ชื่อที่ต้องการแสดง
                </label>
                <input
                  id="leaderboard-name"
                  type="text"
                  autoComplete="nickname"
                  maxLength={30}
                  placeholder="กรอกชื่อของคุณ"
                  aria-describedby={errors.name ? "leaderboard-name-error" : undefined}
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                  onAnimationEnd={() => setNameShaking(false)}
                  className={`${nameShaking ? "gp1-shake" : ""} h-[64px] w-full rounded-[24px] border-2 border-solid bg-white px-4 text-center text-[20px] font-semibold leading-[30px] text-[#4B4B4B] shadow-[0px_2px_0px_0px_#D9D9D9] outline-none placeholder:text-[#A5A5A5] ${
                    errors.name
                      ? "border-[var(--accent-error)] focus:ring-4 focus:ring-[rgba(220,38,38,0.18)]"
                      : "border-[#D9D9D9] focus:border-[#00A3E0] focus:ring-4 focus:ring-[rgba(0,163,224,0.18)]"
                  }`}
                />
                {errors.name && (
                  <p
                    id="leaderboard-name-error"
                    role="alert"
                    className="mt-3 text-[20px] font-semibold text-[var(--accent-error)]"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="shrink-0 gp-px-24 gp-pb-action-bar gp-pt-22">
          {/* grey (inactive) until a valid name is typed — still pressable, so an empty name shakes the field */}
          <Button3D type="submit" inactive={!isValid || isSubmitting}>
            ยืนยัน
          </Button3D>
        </div>
      </form>
    </main>
  );
}

export default function LessonLeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      }
    >
      <LeaderboardPageInner />
    </Suspense>
  );
}
