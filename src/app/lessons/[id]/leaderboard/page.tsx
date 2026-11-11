"use client";

import { Suspense, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { getLeaderboardGame, usesLocalLeaderboard } from "@/lib/leaderboard";
import { useLeaderboardBoard } from "@/lib/useLeaderboardBoard";
import {
  leaderboardNameSchema,
  type LeaderboardNameInput,
  type LeaderboardPlayer,
} from "@/lib/validations";
import { leaderboardPlayerService } from "@/services/leaderboardPlayerService";
import Button3D from "@/components/Button3D";
import LeaderboardGamePicker from "@/components/LeaderboardGamePicker";
import { BOARD_BAR, BoardEmpty, BoardError, BoardRow, BoardRowSkeleton } from "@/components/LeaderboardRows";
import { finishFunGame } from "@/lib/funGameFinish";
import { loggingService } from "@/services/loggingService";

type ViewState = "loading" | "name-entry" | "leaderboard";

function LeaderboardPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  // US-CF-52: โหมดดูกระดานคะแนนจากเมนู — ไม่ผูกกับผู้เล่น (ไม่มีชื่อ/ไฮไลต์), เหรียญบนเป็น trophy
  const isBrowse = searchParams.get("view") === "browse";
  // From a fun game's "เก็บคะแนนไหม?" popup (game page): step=save → name entry (Figma 3157:15657),
  // then the board once saved · skipped=1 → the board without the player's row (old links: "ไม่" now skips this page)
  const isSaveStep = searchParams.get("step") === "save";
  const skipped = searchParams.get("skipped") === "1";
  const lessonId = params.id;
  const game = getLeaderboardGame(lessonId);
  const gid = game?.gid;
  // กระดานคะแนนในเครื่อง ไม่ส่ง/ดึงจากฐานข้อมูล: เกม localOnly หรือทุกเกมตอนรันบน localhost (usesLocalLeaderboard)
  const localOnly = usesLocalLeaderboard(game);
  const localName = game?.name ?? "";
  const [player, setPlayer] = useState<LeaderboardPlayer | null | undefined>(undefined);
  const [pickerOpen, setPickerOpen] = useState(false); // US-CF-52: popup เลือกเกมบนหน้า browse
  // empty name on "ยืนยัน": the name field shakes (gp1-shake) instead of showing a message
  const [nameShaking, setNameShaking] = useState(false);
  const viewState: ViewState = isBrowse
    ? "leaderboard"
    : player === undefined
      ? "loading"
      : isSaveStep
        ? "name-entry"
        : "leaderboard";

  const { boardStatus, entries, displayEntries, gameName, climbPlan, listRef, ownEntry, retry: handleRetry } =
    useLeaderboardBoard({ gid, lessonId, player, enabled: viewState === "leaderboard", isBrowse, skipped, localOnly, localName });

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

  // ปุ่มจบของเกมสนุกที่มาหน้านี้ตรงจากเกม (G13 + G18–G20K)
  const handleFinishFunGame = () => {
    router.push(finishFunGame(gid));
  };

  if (viewState === "loading") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
        <span className="text-body text-[var(--text-secondary)]">กำลังเตรียมกระดานคะแนน...</span>
      </div>
    );
  }

  if (!game) {
    return (
      <main className="scroll-region bg-[var(--bg-app)]">
        <div className="flex min-h-full flex-col items-center justify-center gap-4 px-5 py-8 text-center">
          <Trophy size={52} className="text-[var(--text-secondary)]" aria-hidden="true" />
          <h1 className="text-h1 text-[var(--text-primary)]">ไม่พบเกมนี้</h1>
          <p className="text-body text-[var(--text-secondary)]">
            กรุณาเปิดกระดานคะแนนจากหน้าจบเกมที่รองรับ
          </p>
        </div>
      </main>
    );
  }

  if (viewState === "leaderboard") {
    return (
      <main className={`gp-compact flex h-full min-h-0 flex-col bg-white`}>
        <div className="mx-auto flex min-h-0 w-full max-w-[400px] flex-1 flex-col gp-px-24 pt-[24px]">
          {/* gap = the bar's mt: the game name sits midway between the title and the purple bar */}
          <header className="flex shrink-0 flex-col items-center gap-[8px] text-center">
            <h1 className="text-h3 text-black">กระดานคะแนน</h1>
            {/* icon + name centred as one unit; the icon is sized in em so it stays about the text's size */}
            <p className="flex items-center justify-center gap-[8px] text-body text-black">
              {game?.icon && (gameName || localName) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.icon} alt="" aria-hidden="true" className="h-[1.2em] w-[1.2em] shrink-0 object-contain" />
              )}
              <span>{gameName || localName}</span>
            </p>
            {!isBrowse && (skipped || !player) && (
              <p className="text-body text-[#4B4B4B]">ดูอันดับโดยไม่เก็บคะแนน</p>
            )}
          </header>

          <div
            className="mt-[8px] flex h-[60px] shrink-0 items-center rounded-[12px] px-[16px] text-body text-white"
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
              Array.from({ length: 4 }, (_, index) => <BoardRowSkeleton key={index} />)}

            {boardStatus === "error" && <BoardError onRetry={handleRetry} />}

            {boardStatus === "ready" && entries.length === 0 && <BoardEmpty />}

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
    <main className={`gp-compact flex h-full min-h-0 flex-col bg-white`}>
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

              <h1 className="text-h2 text-[#4B4B4B]">กรอกชื่อเพื่อเก็บคะแนน</h1>
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
                  className={`${nameShaking ? "gp1-shake" : ""} h-[64px] w-full rounded-[24px] border-2 border-solid bg-white px-4 text-center text-button text-[#4B4B4B] shadow-[0px_2px_0px_0px_#D9D9D9] outline-none placeholder:text-[#A5A5A5] ${
                    errors.name
                      ? "border-[var(--accent-error)] focus:ring-4 focus:ring-[rgba(220,38,38,0.18)]"
                      : "border-[#D9D9D9] focus:border-[#00A3E0] focus:ring-4 focus:ring-[rgba(0,163,224,0.18)]"
                  }`}
                />
                {errors.name && (
                  <p
                    id="leaderboard-name-error"
                    role="alert"
                    className="mt-3 text-button text-[var(--accent-error)]"
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
