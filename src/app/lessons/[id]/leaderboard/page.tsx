"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Pencil, RefreshCw, Trophy, UserRound, X } from "lucide-react";
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
import BottomActionButton from "@/components/BottomActionButton";
import LeaderboardGamePicker from "@/components/LeaderboardGamePicker";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";

type ViewState = "loading" | "name-entry" | "leaderboard";
type BoardStatus = "loading" | "ready" | "error";
type ConfirmAction = "save" | "skip";

function ConfirmPopup({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="ปิดหน้าต่างยืนยัน"
        onClick={onCancel}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-confirm-title"
        className="relative w-full max-w-md rounded-[32px] border-2 border-[var(--primary)] bg-[var(--bg-card)] px-5 py-8 text-center shadow-[var(--shadow-md)]"
      >
        <h2
          id="leaderboard-confirm-title"
          className="mb-6 text-[28px] font-bold leading-tight text-[var(--text-primary)]"
        >
          {title}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn min-h-[68px] px-3 text-[22px] bg-transparent text-[var(--primary)] border-2 border-[var(--primary)]"
          >
            ไม่ใช่
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn min-h-[68px] px-3 text-[22px] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
          >
            ใช่
          </button>
        </div>
      </div>
    </div>
  );
}

const PODIUM = {
  1: { bg: "#FFCC5D", circle: "#FFAB2D", score: "#D88E1F" },
  2: { bg: "#BEC2D8", circle: "#9B9FBD", score: "#8487A2" },
  3: { bg: "#FFA967", circle: "#FD8E2D", score: "#CA7831" },
} as const;

const RANK_4_SCORE_BG = "#9F9F9F";
const RANK_4_BORDER = "#C8C8C8";
const RANK_4_MEDAL_BORDER = "#787878"; // ขอบเหรียญหัวของอันดับ >3 (เทาเข้ม ให้เห็นวงบนพื้นสว่าง)
const ON_COLOR = "#FFFFFF";

function getPodium(rank: number) {
  if (rank === 1 || rank === 2 || rank === 3) return PODIUM[rank];
  return null;
}

function RankBadge({ rank }: { rank: number }) {
  const podium = getPodium(rank);

  if (!podium) {
    return (
      <span className="text-[26px] font-black text-[var(--text-primary)]" aria-label={`อันดับ ${rank}`}>
        {rank}
      </span>
    );
  }

  return (
    <span
      className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-[26px] font-black"
      style={{ backgroundColor: podium.circle, borderColor: podium.bg, color: ON_COLOR }}
      aria-label={`อันดับ ${rank}`}
    >
      {rank}
    </span>
  );
}

function HeaderRankBadge({ rank }: { rank: number }) {
  const podium = getPodium(rank);
  return (
    <div
      className="mx-auto mb-3 flex h-[100px] w-[100px] items-center justify-center rounded-full border-2 text-[44px] font-black"
      style={{
        backgroundColor: podium ? podium.circle : RANK_4_SCORE_BG,
        borderColor: podium ? podium.score : RANK_4_MEDAL_BORDER,
        color: ON_COLOR,
      }}
      aria-label={`อันดับของคุณ ${rank}`}
    >
      {rank}
    </div>
  );
}

function LeaderboardPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  // US-CF-52: โหมดดูกระดานคะแนนจากเมนู — ไม่ผูกกับผู้เล่น (ไม่มีชื่อ/ไฮไลต์), เหรียญบนเป็น trophy
  const isBrowse = searchParams.get("view") === "browse";
  const lessonId = params.id;
  const game = getLeaderboardGame(lessonId);
  const gid = game?.gid;
  const [player, setPlayer] = useState<LeaderboardPlayer | null | undefined>(undefined);
  const [browseOnly, setBrowseOnly] = useState(false);
  const [boardStatus, setBoardStatus] = useState<BoardStatus>("loading");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<LeaderboardEntry | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false); // US-CF-52: popup เลือกเกมบนหน้า browse
  const [gameName, setGameName] = useState(""); // ชื่อเกมมาจาก DB (response.game.name) เสมอ ไม่ hardcode
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [pendingSave, setPendingSave] = useState<LeaderboardNameInput | null>(null);
  const [nameHintVisible, setNameHintVisible] = useState(false);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  const nameHintTimerRef = useRef<number | null>(null);
  const viewState: ViewState = isBrowse
    ? "leaderboard"
    : player === undefined
      ? "loading"
      : player || browseOnly
        ? "leaderboard"
        : "name-entry";

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
    loggingService.logEvent("leaderboard_page_view", {
      has_player_profile: Boolean(storedPlayer),
      lesson_id: lessonId,
    });
  }, [lessonId]);

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

        if (pendingScore && player) {
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

        const response = await apiClient.getLeaderboard(
          targetGid,
          10,
          isBrowse ? undefined : player?.player_uuid,
        );
        if (cancelled) return;
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
  }, [gid, lessonId, player, reloadKey, viewState, isBrowse]);

  const closeConfirm = () => {
    setConfirmAction(null);
    setPendingSave(null);
  };

  const handleSaveName = (data: LeaderboardNameInput) => {
    const savedPlayer = leaderboardPlayerService.createProfile(data.name);
    setPlayer(savedPlayer);
    setBrowseOnly(false);
    loggingService.logEvent("leaderboard_name_saved", { lesson_id: lessonId });
  };

  const requestSave = (data: LeaderboardNameInput) => {
    setPendingSave(data);
    setConfirmAction("save");
  };

  const showMissingNameHint = () => {
    setNameHintVisible(true);
    if (nameHintTimerRef.current) window.clearTimeout(nameHintTimerRef.current);
    nameHintTimerRef.current = window.setTimeout(() => setNameHintVisible(false), 3000);
  };

  const handleSaveClick = () => {
    if (isSubmitting) return;
    const name = getValues("name")?.trim() ?? "";
    if (!name) {
      setError("name", { type: "manual", message: "กรุณากรอกชื่อของคุณ" });
      showMissingNameHint();
      document.getElementById("leaderboard-name")?.focus();
      return;
    }
    setNameHintVisible(false);
    void handleSubmit(requestSave)();
  };

  useEffect(() => {
    return () => {
      if (nameHintTimerRef.current) window.clearTimeout(nameHintTimerRef.current);
    };
  }, []);

  const handleBrowseOnly = () => {
    // Keep the pending score while this page is open so the player can change
    // their mind and use "กรอกชื่อเพื่อเก็บคะแนน" without losing the result.
    setBrowseOnly(true);
    loggingService.logEvent("leaderboard_name_skipped", { lesson_id: lessonId });
  };

  const confirmChoice = () => {
    if (confirmAction === "save" && pendingSave) {
      handleSaveName(pendingSave);
    } else if (confirmAction === "skip") {
      handleBrowseOnly();
    }
    closeConfirm();
  };

  const handleOpenNameEntry = () => {
    setBrowseOnly(false);
    reset({ name: player?.name ?? "" });
  };

  const handleRetry = () => {
    setBoardStatus("loading");
    setReloadKey((currentKey) => currentKey + 1);
  };

  const handleFinishG13 = () => {
    // "ไม่เก็บคะแนน" becomes final only when the player leaves this flow.
    if (browseOnly && gid) {
      leaderboardScoreService.clearPendingScore(gid);
    }
    const progress = progressService.getProgress();
    progressService.saveProgress({
      ...progress,
      currentStep: "complete",
      currentLessonId: undefined,
    });
    router.push("/lessons/complete");
  };

  const currentRank =
    entries.find((entry) => entry.is_current_player)?.rank ?? currentPlayer?.rank ?? null;

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
      <main className="flex h-full min-h-0 flex-col bg-[var(--bg-app)]">
        <div className="scroll-region mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
          <header className="text-center">
            {isBrowse ? (
              <div className="mx-auto mb-3 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]">
                <Trophy size={52} aria-hidden="true" />
              </div>
            ) : player && !browseOnly && currentRank ? (
              <HeaderRankBadge rank={currentRank} />
            ) : null}
            <h1 className="mb-1 text-[32px] font-bold text-[var(--primary-dark)]">กระดานคะแนน</h1>
            <p className="text-[22px] font-bold text-[var(--text-primary)]">{gameName}</p>
            {!isBrowse &&
              (player && !browseOnly ? (
                <div
                  className="mx-auto mt-3 flex w-fit max-w-full items-center rounded-full border-2 border-[var(--primary)] bg-[var(--bg-card)] px-4 py-2 text-[22px] font-bold text-[var(--primary-dark)]"
                  role="status"
                  aria-label={`${player.name} ได้รับ ${playerScore?.toLocaleString("th-TH") ?? "ยังไม่มี"} คะแนน`}
                >
                  <span className="min-w-0 truncate">{player.name}</span>
                  <span className="shrink-0 whitespace-nowrap">
                    {" "}ได้รับ {playerScore?.toLocaleString("th-TH") ?? "–"} คะแนน
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-[20px] text-[var(--text-secondary)]">
                  ดูอันดับโดยไม่เก็บคะแนน
                </p>
              ))}
          </header>

          <div className="grid grid-cols-[72px_minmax(0,1fr)_minmax(100px,auto)] items-center gap-2 rounded-[20px] bg-[var(--primary)] px-3 py-3 text-white">
            <span className="text-center text-[20px] font-bold">อันดับ</span>
            <span className="text-left text-[20px] font-bold">ชื่อ</span>
            <span className="text-right text-[20px] font-bold">คะแนน</span>
          </div>

          <section aria-live="polite" aria-busy={boardStatus === "loading"} className="flex flex-col gap-2.5">
            {boardStatus === "loading" &&
              Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="grid min-h-[60px] animate-pulse grid-cols-[72px_minmax(0,1fr)_minmax(100px,auto)] items-center gap-2 rounded-[22px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2"
                >
                  <div className="mx-auto h-10 w-10 rounded-full bg-[var(--border)]" />
                  <div className="h-6 rounded-full bg-[var(--border)]" />
                  <div className="h-12 rounded-full bg-[var(--primary-light)]" />
                </div>
              ))}

            {boardStatus === "error" && (
              <div className="rounded-[24px] border-2 border-[var(--border)] bg-[var(--bg-card)] px-5 py-8 text-center">
                <p className="text-[22px] font-bold text-[var(--text-primary)]">
                  โหลดกระดานคะแนนไม่สำเร็จ
                </p>
                <p className="mt-2 text-[20px] text-[var(--text-secondary)]">
                  กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="btn mt-5 min-h-[60px] w-full text-[22px] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                >
                  <RefreshCw size={24} aria-hidden="true" />
                  ลองใหม่
                </button>
              </div>
            )}

            {boardStatus === "ready" && entries.length === 0 && (
              <div className="rounded-[24px] border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] px-5 py-8 text-center">
                <p className="text-[22px] font-bold text-[var(--text-primary)]">ยังไม่มีคะแนนในเกมนี้</p>
                <p className="mt-2 text-[20px] text-[var(--text-secondary)]">
                  มาเป็นผู้เล่นคนแรกบนกระดานคะแนนกันเลย
                </p>
              </div>
            )}

            {boardStatus === "ready" &&
              entries.map((entry) => {
                const podium = getPodium(entry.rank);
                // กรอบไฮไลต์แถวของผู้เล่นปัจจุบัน: อันดับ 1-3 ใช้สีสว่างของอันดับ (bg), ต่ำกว่า 3 ใช้สีหลักของแอป
                const borderColor = entry.is_current_player
                  ? podium?.bg ?? "var(--primary)"
                  : podium?.score ?? RANK_4_BORDER;
                return (
                <article
                  key={entry.id}
                  className="grid min-h-[60px] grid-cols-[72px_minmax(0,1fr)_minmax(100px,auto)] items-center gap-2 rounded-[22px] border-2 pl-[5px] pr-[10px] py-[10px]"
                  style={{
                    background: podium
                      ? `linear-gradient(to right, ${podium.score}, ${podium.bg})`
                      : "var(--bg-card)",
                    borderColor,
                  }}
                >
                  <div className="flex justify-center">
                    <RankBadge rank={entry.rank} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p
                      className="truncate text-[26px] font-bold"
                      style={{
                        color: podium ? ON_COLOR : "var(--text-primary)",
                        textShadow: podium ? "0px 2px 4px rgba(0, 0, 0, 0.5)" : undefined,
                      }}
                      title={entry.name}
                    >
                      {entry.name}
                    </p>
                    {entry.is_current_player && (
                      <span
                        className="mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[20px] font-bold"
                        style={{
                          backgroundColor: podium ? podium.score : "var(--primary-light)",
                          color: podium ? ON_COLOR : "var(--primary-dark)",
                        }}
                      >
                        คุณ
                      </span>
                    )}
                  </div>
                  <p
                    className="rounded-full px-3 py-2 text-center text-[22px] font-black tabular-nums"
                    style={{
                      backgroundColor: podium ? podium.score : RANK_4_SCORE_BG,
                      color: ON_COLOR,
                    }}
                  >
                    {entry.score.toLocaleString("th-TH")}
                  </p>
                </article>
                );
              })}
          </section>
        </div>

        {isBrowse ? (
          <div className="shrink-0">
            <BottomActionButton type="button" onClick={() => setPickerOpen(true)}>
              <Trophy size={28} aria-hidden="true" />
              เลือกเกม
            </BottomActionButton>
          </div>
        ) : gid === "G13" ? (
          <div className="shrink-0">
            {browseOnly ? (
              <div className="flex overflow-hidden rounded-t-[25px] rounded-b-none border-2 border-b-0 border-[var(--border)] divide-x-2 divide-[var(--border)] bg-[var(--bg-card)] shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
                <button
                  type="button"
                  onClick={handleOpenNameEntry}
                  className="flex min-h-[100px] flex-1 flex-col items-center justify-center gap-1.5 bg-[var(--bg-card)] px-1 py-3 text-[var(--text-secondary)] transition-colors active:bg-[var(--primary-light)]"
                >
                  <Pencil size={34} strokeWidth={2.25} aria-hidden="true" />
                  <span className="text-center text-[clamp(15px,4.78vw,22px)] font-bold leading-tight">
                    กรอกชื่อเพื่อเก็บคะแนน
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishG13}
                  className="flex min-h-[100px] flex-1 flex-col items-center justify-center gap-1.5 bg-[var(--bg-card)] px-1 py-3 text-[var(--primary-dark)] transition-colors active:bg-[var(--primary-light)]"
                >
                  <ArrowRight size={34} strokeWidth={2.25} aria-hidden="true" />
                  <span className="text-center text-[clamp(15px,4.78vw,22px)] font-bold leading-tight">
                    เสร็จสิ้นบทเรียน
                  </span>
                </button>
              </div>
            ) : (
              <BottomActionButton type="button" onClick={handleFinishG13}>
                เสร็จสิ้นบทเรียน
                <ArrowRight size={28} aria-hidden="true" />
              </BottomActionButton>
            )}
          </div>
        ) : null}

        <LeaderboardGamePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-col bg-[var(--bg-app)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSaveClick();
        }}
        className="flex h-full min-h-0 flex-col"
        noValidate
      >
        <div className="scroll-region flex-1">
          <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-8">
            <section className="rounded-[32px] border-2 border-[var(--primary)] bg-[var(--bg-card)] px-5 py-8 text-center shadow-[var(--shadow-md)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]">
                <UserRound size={36} aria-hidden="true" />
              </div>

              <h1 className="mb-3 text-[32px] font-bold leading-tight text-[var(--text-primary)]">
                กรอกชื่อเพื่อเก็บคะแนน
              </h1>
              <p id="leaderboard-name-help" className="mb-5 text-[20px] leading-relaxed text-[var(--text-secondary)]">
                ชื่อนี้จะแสดงพร้อมคะแนนของคุณบนกระดานคะแนนของเกมนี้
              </p>

              <label htmlFor="leaderboard-name" className="mb-2 block text-left text-[20px] font-bold">
                ชื่อที่ต้องการแสดง
              </label>
              <input
                id="leaderboard-name"
                type="text"
                autoComplete="nickname"
                maxLength={30}
                placeholder="กรอกชื่อของคุณ"
                aria-describedby={errors.name || nameHintVisible ? "leaderboard-name-error" : "leaderboard-name-help"}
                aria-invalid={Boolean(errors.name)}
                {...register("name", {
                  onChange: () => setNameHintVisible(false),
                })}
                className={`min-h-[64px] w-full rounded-2xl border-2 bg-[var(--bg-card)] px-4 py-3 text-center text-[22px] font-bold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/60 ${
                  errors.name
                    ? "border-[var(--accent-error)] focus:border-[var(--accent-error)] focus:ring-4 focus:ring-[rgba(220,38,38,0.18)]"
                    : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(var(--primary-rgb),0.18)]"
                }`}
              />
              {errors.name && (
                <p
                  id="leaderboard-name-error"
                  role="alert"
                  className="mt-3 text-left text-[20px] font-semibold text-[var(--accent-error)]"
                >
                  {errors.name.message}
                </p>
              )}
            </section>
          </div>
        </div>

        <div className="flex shrink-0 overflow-hidden rounded-t-[25px] rounded-b-none border-2 border-b-0 border-[var(--border)] divide-x-2 divide-[var(--border)] bg-[var(--bg-card)] shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
          <button
            type="button"
            onClick={() => setConfirmAction("skip")}
            className="flex min-h-[100px] flex-1 flex-col items-center justify-center gap-1.5 bg-[var(--bg-card)] px-1 py-3 text-[var(--text-secondary)] transition-colors active:bg-[var(--primary-light)]"
          >
            <X size={34} strokeWidth={2.25} aria-hidden="true" />
            <span className="text-center text-[clamp(15px,4.78vw,22px)] font-bold leading-tight">
              ไม่เก็บคะแนน
            </span>
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            aria-disabled={!isValid || isSubmitting}
            className={`flex min-h-[100px] flex-1 flex-col items-center justify-center gap-1.5 px-1 py-3 transition-colors ${
              isValid && !isSubmitting
                ? "bg-[var(--btn-bg)] text-white active:bg-[var(--btn-bg-hover)]"
                : "bg-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            <Check size={34} strokeWidth={2.25} aria-hidden="true" />
            <span className="text-center text-[clamp(15px,4.78vw,22px)] font-bold leading-tight">
              เก็บคะแนน
            </span>
          </button>
        </div>
      </form>
      {nameHintVisible && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-4 bottom-[156px] z-50 flex justify-center"
        >
          <p className="toast-float-up max-w-md min-h-[58px] rounded-full bg-slate-800/95 px-6 py-[15px] text-center text-[24px] font-bold leading-snug text-white shadow-[var(--shadow-lg)]">
            ยังไม่ได้กรอกชื่อ
          </p>
        </div>
      )}
      {confirmAction && (
        <ConfirmPopup
          title={
            confirmAction === "save"
              ? "ต้องการเก็บคะแนนหรือไม่?"
              : "ไม่ต้องการเก็บคะแนนทั้งหมด?"
          }
          onConfirm={confirmChoice}
          onCancel={closeConfirm}
        />
      )}
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
