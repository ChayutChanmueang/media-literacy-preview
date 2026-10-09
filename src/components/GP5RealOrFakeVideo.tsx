"use client";

import React, { useEffect, useRef, useState } from "react";
import { Clapperboard, Maximize2, Volume2, VolumeX, VideoOff, X } from "lucide-react";
import Button3D from "@/components/Button3D";
import GameAnswerButton from "@/components/GameAnswerButton";
import GameIntro from "@/components/GameIntro";
import GameSolutionCard from "@/components/GameSolutionCard";
import QUESTION_POOL from "@/data/gp5-video-items.json";

/**
 * GP5 — คลิปจริง หรือ คลิปปลอม (Real or fake video) — PROTOTYPE
 *
 * Same layout/flow as G3 "AI หรือ ของจริง" but the question media is a short
 * video clip instead of a still image: clip on a black stage → จริง / ปลอม /
 * ไม่แน่ใจ → GameSolutionCard explaining the tell-tale signs (lip-sync, blinking,
 * morphing objects…) → Button3D auto-advance.
 * Clips autoplay muted + looped (browsers block autoplay with sound); a large
 * sound toggle and fullscreen button sit in a strip under the clip.
 * A clip is either a local file (`media`) or an embedded YouTube video
 * (`youtubeId`) — YouTube is muted/unmuted through its postMessage API, and
 * fullscreen just pins the same stage to the viewport so the clip keeps playing.
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Category = "ai" | "deepfake" | "edited" | "real";

type VideoItem = {
  id: string;
  media?: string;
  youtubeId?: string;
  source?: { channel: string; url: string };
  claim: string;
  isAi: boolean;
  category: Category;
  aiDisclosure: string | null;
  explanation: string;
  speakerText: string;
};

type Choice = "real" | "ai" | "unsure";

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

const POOL = QUESTION_POOL.pool as VideoItem[];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// เหมือน G3: แบ่งครึ่งคลิปปลอม/คลิปจริง แล้วสลับลำดับ; pool ฝั่งใดไม่พอก็เติมจากที่เหลือ
const pickRoundQuestions = (): VideoItem[] => {
  const n = Math.min(QUESTION_POOL.questionsPerRound, POOL.length);
  const fake = POOL.filter((q) => q.isAi);
  const real = POOL.filter((q) => !q.isAi);
  const nFake = Math.min(Math.ceil(n / 2), fake.length);
  const nReal = Math.min(n - nFake, real.length);
  let picked = [...shuffle(fake).slice(0, nFake), ...shuffle(real).slice(0, nReal)];
  if (picked.length < n) {
    const rest = shuffle(POOL.filter((q) => !picked.includes(q))).slice(0, n - picked.length);
    picked = picked.concat(rest);
  }
  return shuffle(picked);
};

const youtubeSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}` +
  "&playsinline=1&controls=0&rel=0&modestbranding=1&enablejsapi=1";

const HEADING: Record<Category, string> = {
  ai: "ทำไมคลิปนี้ถึงเป็นคลิปที่ AI สร้าง?",
  deepfake: "ทำไมคลิปนี้ถึงเป็นคลิปปลอมหน้า-เสียง (Deepfake)?",
  edited: "ทำไมคลิปนี้ถึงเป็นคลิปตัดต่อ?",
  real: "ทำไมคลิปนี้เป็นของจริง",
};

// ปุ่มกลมบนคลิป — ≥ 48px ตามกติกา touch target
const OVERLAY_BUTTON =
  "flex min-h-[48px] gp-h-56 min-w-[56px] items-center justify-center gp-gap-8 rounded-full bg-[#3A3A3A] gp-px-16 gp-text-20 font-semibold text-white cursor-pointer";

export default function GP5RealOrFakeVideo({ onFinish, logEvent }: Props) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [questions] = useState(pickRoundQuestions);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentQuestion = questions[currentIdx];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("flowStepProgress", { detail: currentIdx / questions.length }));
  }, [currentIdx, questions.length]);

  const handleAnswer = (choice: Choice) => {
    setSelected(choice);
    setFullscreen(false);
    const isCorrect = choice !== "unsure" && (choice === "ai") === currentQuestion.isAi;
    if (isCorrect) setCorrectAnswers((prev) => prev + 1);

    logEvent("answer_question", {
      game_id: "GP5",
      question_id: currentQuestion.id,
      answer: choice,
      is_correct: isCorrect,
    });
  };

  const handleNext = () => {
    setFullscreen(false);
    setAutoPaused(false);
    setVideoError(false);
    setMuted(true); // คลิปถัดไปต้องเริ่มแบบปิดเสียง ไม่งั้นเบราว์เซอร์ไม่ยอม autoplay

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelected(null);
      logEvent("enter_question", { game_id: "GP5", question_id: questions[nextIdx].id });
    } else {
      // เกณฑ์ดาวเดียวกับ G3
      const total = questions.length;
      const ratio = total > 0 ? correctAnswers / total : 0;
      const starRating = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
      logEvent("game_complete", { game_id: "GP5", score: correctAnswers, total, stars: starRating });
      onFinish(starRating);
    }
  };

  const toggleMuted = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: muted ? "unMute" : "mute", args: [] }),
      "*"
    );
    setMuted((m) => !m);
    logEvent("toggle_video_sound", { question_id: currentQuestion.id, muted: !muted });
  };

  const isAnswered = selected !== null;
  // "ไม่แน่ใจ" ไม่นับเป็นถูก (G3 เดิมนับถูกถ้าเป็นภาพจริง) แต่ได้การ์ดเขียว "รอบคอบมาก" เสมอ
  const isCurrentCorrect = selected !== "unsure" && (selected === "ai") === currentQuestion.isAi;

  if (showIntro) {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="คลิปจริง หรือ คลิปปลอม"
        objective="ดูคลิปวิดีโอแล้วช่วยกันสังเกตว่าเป็นคลิปที่ถ่ายจริง หรือคลิปที่ AI สร้าง/ปลอมหน้าและเสียงขึ้นมา"
        choices="จริง · ปลอม · ไม่แน่ใจ"
        icon={Clapperboard}
        onStart={() => {
          setShowIntro(false);
          logEvent("game_intro_start", { game_id: "GP5" });
        }}
      />
    );
  }

  // ไฟล์คลิปยังไม่มี/โหลดไม่ได้ — prototype ยังเล่นต่อได้ โดยแสดงคำบรรยายคลิปแทน
  const missingClip = (
    <div className="flex h-full w-full flex-col items-center justify-center gp-gap-16 gp-p-24 text-center text-white">
      <VideoOff size={56} aria-hidden />
      <p className="gp-text-22 font-semibold gp-leading-32">{currentQuestion.claim}</p>
      <p className="gp-text-20 gp-leading-28 text-white/80">
        (ยังไม่มีไฟล์คลิป: {currentQuestion.media ?? currentQuestion.youtubeId})
      </p>
    </div>
  );

  return (
    <div className={`gp-compact flex flex-col flex-1 min-h-0 ${isAnswered ? "bg-white" : "bg-[#D9D9D9]"}`}>
      {!isAnswered ? (
        <>
          {/* ดูเต็มจอ = ตรึงเวทีเดิมทับทั้งจอ (ไม่ mount คลิปใหม่ คลิปจึงเล่นต่อไม่เริ่มใหม่) */}
          <div
            className={
              fullscreen
                ? "fixed inset-0 z-[100] flex flex-col bg-black"
                : "flex flex-1 min-h-0 flex-col overflow-hidden bg-black"
            }
          >
            <div className="min-h-0 flex-1">
              {videoError ? (
                missingClip
              ) : currentQuestion.youtubeId ? (
                <iframe
                  key={currentQuestion.id}
                  ref={iframeRef}
                  src={youtubeSrc(currentQuestion.youtubeId)}
                  title={currentQuestion.claim}
                  className="h-full w-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                />
              ) : (
                /* object-contain: เห็นเฟรมเต็มเสมอ (จุดสังเกตของคลิป AI มักอยู่ริมภาพ) */
                <video
                  key={currentQuestion.id}
                  src={currentQuestion.media}
                  aria-label={currentQuestion.claim}
                  className="h-full w-full object-contain"
                  autoPlay
                  loop
                  playsInline
                  controls={fullscreen}
                  muted={muted}
                  preload="auto"
                  onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
                  onError={() => {
                    setVideoError(true);
                    logEvent("video_load_error", { question_id: currentQuestion.id });
                  }}
                />
              )}
            </div>

            {!videoError && (
              <div className="shrink-0 flex justify-between gp-p-12">
                <button
                  onClick={toggleMuted}
                  className={OVERLAY_BUTTON}
                  aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
                >
                  {muted ? <VolumeX size={28} aria-hidden /> : <Volume2 size={28} aria-hidden />}
                  {muted ? "เปิดเสียง" : "ปิดเสียง"}
                </button>
                {fullscreen ? (
                  <button onClick={() => setFullscreen(false)} className={OVERLAY_BUTTON}>
                    <X size={28} aria-hidden /> ปิด
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setFullscreen(true);
                      logEvent("open_fullscreen_video", { question_id: currentQuestion.id });
                    }}
                    className={OVERLAY_BUTTON}
                  >
                    <Maximize2 size={28} aria-hidden /> เต็มจอ
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 flex gp-gap-8 gp-px-24 gp-pb-64 gp-pt-48">
            <GameAnswerButton
              tone="green"
              iconSrc="/images/games/answer-true.svg"
              label="จริง"
              onClick={() => handleAnswer("real")}
            />
            <GameAnswerButton
              tone="red"
              iconSrc="/images/games/answer-fake.svg"
              label="ปลอม"
              onClick={() => handleAnswer("ai")}
            />
            <GameAnswerButton
              tone="yellow"
              iconSrc="/images/games/answer-unsure.svg"
              label="ไม่แน่ใจ"
              onClick={() => handleAnswer("unsure")}
            />
          </div>
        </>
      ) : (
        <>
          <GameSolutionCard
            tone={isCurrentCorrect || selected === "unsure" ? "correct" : "wrong"}
            banner={isCurrentCorrect ? "ถูกต้อง" : selected === "unsure" ? "รอบคอบมาก" : "ไม่ถูกต้อง"}
            heading={HEADING[currentQuestion.category]}
            onReadingChange={setAutoPaused}
          >
            {selected === "unsure" && (
              <p className="gp-mb-16 font-semibold">
                การหยุดดูและไม่แน่ใจไว้ก่อนเมื่อเห็นสิ่งผิดปกติ คือทักษะการรู้เท่าทันสื่อที่ยอดเยี่ยม!
              </p>
            )}
            <p>{currentQuestion.explanation}</p>
            {currentQuestion.source && (
              <p className="gp-mt-16 gp-text-20 gp-leading-28">
                ที่มาคลิป: YouTube ช่อง {currentQuestion.source.channel}
              </p>
            )}
            {/* นโยบาย ai_disclosure: สื่อที่สร้างจาก AI ต้องบอกหลังเฉลยเสมอ */}
            {currentQuestion.aiDisclosure && (
              <p className="gp-mt-16 rounded-[12px] bg-[#F3F3F3] gp-px-16 gp-py-12 gp-text-20 gp-leading-28">
                🤖 {currentQuestion.aiDisclosure}
              </p>
            )}
          </GameSolutionCard>

          <div className="shrink-0 gp-px-24 gp-pb-64 gp-pt-22">
            <Button3D
              key={`gp5-next-${currentIdx}`}
              onClick={handleNext}
              onAutoAdvance={handleNext}
              autoAdvanceMs={30000}
              autoAdvancePaused={autoPaused}
            >
              กดเพื่อไปต่อ
            </Button3D>
          </div>
        </>
      )}
    </div>
  );
}
