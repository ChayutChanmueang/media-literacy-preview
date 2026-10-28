"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";
import { apiClient } from "@/services/apiClient";
import { leaderboardScoreService } from "@/services/leaderboardScoreService";
import { selfAssessmentService } from "@/services/selfAssessmentService";
import { FLOW_G13_ID, FLOW_POST_TEST_ID, FLOW_POST_TEST_PATH, nextFlowLessonAfterGame } from "@/lib/flow";
import { useDevSkip } from "@/lib/devSkip";
import { TEMP_AWARDED_STARS } from "@/lib/gameScore";
import { getLeaderboardGame } from "@/lib/leaderboard";
import SaveScorePopup from "@/components/SaveScorePopup";

// Dynamic imports with SSR disabled to prevent window/speechSynthesis undefined crashes
const G1FactCheck = dynamic(() => import("@/components/G1FactCheck"), { ssr: false });
const G2ScamSpotter = dynamic(() => import("@/components/G2ScamSpotter"), { ssr: false });
const G3AIOrNot = dynamic(() => import("@/components/G3AIOrNot"), { ssr: false });
const G5DigitalShield = dynamic(() => import("@/components/G5DigitalShield"), { ssr: false });
const G6LineSimulation = dynamic(() => import("@/components/G6LineSimulation"), { ssr: false });
const G13ScoopStacker = dynamic(() => import("@/components/G13ScoopStacker"), { ssr: false });
// G15–G20 (เดิม prototype GP3/4/6/7/8/9): เปิดเฉพาะโหมดอิสระ ใช้ lesson id = รหัสเกมตัวเล็ก (g15…g20)
const G15AIChatSimulator = dynamic(() => import("@/components/G15AIChatSimulator"), { ssr: false });
const G16ThinkBeforePost = dynamic(() => import("@/components/G16ThinkBeforePost"), { ssr: false });
const G17ScamBreaker = dynamic(() => import("@/components/G17ScamBreaker"), { ssr: false });
const G18MemoryPads = dynamic(() => import("@/components/G18MemoryPads"), { ssr: false });
const G19FruitMatch = dynamic(() => import("@/components/G19FruitMatch"), { ssr: false });
const G20VeggieToss = dynamic(() => import("@/components/G20VeggieToss"), { ssr: false });
// รุ่นทดลองของ G20 (ไม่มีลูกศรแรงโยน) — โหมดอิสระ › เกมสนุก "ผักบุ้งลอยฟ้า (ทดลอง)"
const G20KVeggieTossKitchen = dynamic(() => import("@/components/G20KVeggieTossKitchen"), { ssr: false });

const getGameId = (lessonId: string) => {
  switch (lessonId) {
    case "topic-1": return "G1";
    case "topic-2": return "G2";
    case "topic-3": return "G3";
    case "topic-5": return "G5";
    case "topic-6": return "G6";
    case FLOW_G13_ID: return "G13";
    case "g15": return "G15";
    case "g16": return "G16";
    case "g17": return "G17";
    case "g18": return "G18";
    case "g19": return "G19";
    case "g20": return "G20";
    case "g20k": return "G20K";
    default: return "G1";
  }
};

export default function GameShellPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = (params.id as string) || "topic-1";
  const [loading, setLoading] = useState(true);
  // โหมดอิสระ: ปุ่มจบเกม G13 ในหน้าสรุปคะแนนของตัวเกมเองใช้ข้อความ "ต่อไป" แทน "เสร็จสิ้นบทเรียน"
  const [learningMode, setLearningMode] = useState<"flow" | "manual">("flow");
  // เกมสนุกที่มีกระดานคะแนน (G13, G18–G20K): จบเกมแล้วถามก่อนว่าจะเก็บคะแนนไหม (Figma 3157:15321)
  // คะแนนรอไว้เป็น pending score — "ใช่" ไปหน้ากรอกชื่อ, "ไม่" ทิ้งคะแนนแล้วไปกระดานคะแนนของเกมนี้
  const [scorePrompt, setScorePrompt] = useState<{ gid: string; score: number } | null>(null);

  useEffect(() => {
    // Verification of session
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }

    // Session data is only available in browser storage after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLearningMode(progressService.getProgress()?.learningMode === "manual" ? "manual" : "flow");

    loggingService.logEvent("game_start", {
      game_id: getGameId(lessonId),
      lesson_id: lessonId,
    });
    setLoading(false);
  }, [lessonId, router]);

  // score: คะแนนสำหรับกระดานคะแนน — ส่งมาเฉพาะเกมที่มีกระดาน (G18–G20 ส่งสถิติดีที่สุด)
  const handleFinishGame = async (starsEarned: number, score?: number) => {
    const session = progressService.getOrCreateSession();
    const sessionId = session?.sessionId || "";
    const progress = progressService.getProgress();
    const learningMode = progress?.learningMode || "manual";

    loggingService.logEvent("game_finish", {
      game_id: getGameId(lessonId),
      lesson_id: lessonId,
      stars_earned: starsEarned,
      stars_awarded: TEMP_AWARDED_STARS,
    });

    // US-CF-XX: ทุกเกมแวะหน้าคะแนน (GameScorePage) ก่อนไปต่อ — `next` คือปลายทางจริงที่คำนวณไว้ด้านล่าง
    const goToScore = (next: string) => {
      router.push(`/lessons/${lessonId}/score?next=${encodeURIComponent(next)}`);
    };

    // G13 ใช้ความสูงหอเป็นคะแนน เก็บไว้ชั่วคราวจนผู้เล่นยืนยันชื่อบน Leaderboard (คนละความหมายกับดาว จึงไม่ทับด้วย TEMP_AWARDED_STARS)
    if (lessonId === FLOW_G13_ID) {
      leaderboardScoreService.savePendingScore("G13", starsEarned);
      progressService.saveProgress({
        ...progress,
        currentStep: "leaderboard",
        currentLessonId: FLOW_G13_ID,
      });
      // TEMP: ข้ามหน้าคะแนนกลาง (GameScorePage) — G13 มีหน้าคะแนนของตัวเองอยู่แล้ว ถามเก็บคะแนนแล้วไปกระดานคะแนน
      setScorePrompt({ gid: "G13", score: starsEarned });
      return;
    }

    // บันทึกดาว + ความคืบหน้าเกมลง DB (เกมจบแล้ว)
    try {
      await apiClient.saveLessonProgress(
        sessionId,
        lessonId,
        undefined, // video_completed_at ถูกบันทึกในสเตปคลิปแยกต่างหาก
        new Date().toISOString()
      );
    } catch (err) {
      console.error("[GameShell] Network error saving progress, local caching covers this:", err);
    }

    const withStars = {
      ...progress,
      stars: { ...progress.stars, [lessonId]: TEMP_AWARDED_STARS },
    };

    // เกมที่มีกระดานคะแนนและส่ง score มา (ตอนนี้ G18–G20K) — ข้ามหน้าคะแนนกลางแบบ G13 เพราะตัวเกมมีหน้าสรุปคะแนนของตัวเองแล้ว
    // ถามเก็บคะแนนแล้วไปกระดานคะแนน; ปุ่มจบบนกระดานพากลับหน้าหมวดหมู่ (เกมพวกนี้มีเฉพาะโหมดอิสระ)
    // ⚠️ เกมในสาย Flow ที่จะเริ่มส่ง score ต้องดูข้อ 4.3 ใน docs/software/08-leaderboard-add-game.md ก่อน
    const leaderboardGame = getLeaderboardGame(lessonId);
    if (leaderboardGame && typeof score === "number") {
      leaderboardScoreService.savePendingScore(leaderboardGame.gid, score);
      progressService.saveProgress({ ...withStars, currentStep: "leaderboard", currentLessonId: lessonId });
      setScorePrompt({ gid: leaderboardGame.gid, score });
      return;
    }

    if (learningMode === "flow") {
      // US-CF-32: flow ไม่มีหน้าสรุปคะแนนคั่นแล้ว → จบเกมไป "หน้าชื่อคลิป" ของบทถัดไปเลย (video intro) หรือด่านปิดท้าย
      const nextId = nextFlowLessonAfterGame(lessonId);
      if (nextId === FLOW_POST_TEST_ID) {
        if (progressService.getAppMode() === "research" && selfAssessmentService.hasCompleted("post")) {
          // โหมดวิจัย เล่น Flow จบซ้ำ: ทำแบบทดสอบหลังเรียนได้ครั้งเดียว → ข้ามไปหน้าจบเลย (US-DATA-03)
          progressService.saveProgress({ ...withStars, currentStep: "complete", currentLessonId: undefined });
          goToScore("/lessons/complete");
        } else if (progressService.getAppMode() === "research") {
          // โหมดวิจัย: ปิดท้ายด้วยแบบทดสอบหลังเรียน
          progressService.saveProgress({ ...withStars, currentStep: "post-test", currentLessonId: undefined });
          goToScore(FLOW_POST_TEST_PATH);
        } else {
          // โหมดปกติ: ไม่มีแบบทดสอบหลังเรียน → ปิดท้ายด้วยเกมสนุก (ต่อไอติม) + กระดานคะแนนแทน
          progressService.saveProgress({ ...withStars, currentStep: "game", currentLessonId: FLOW_G13_ID });
          goToScore(`/lessons/${FLOW_G13_ID}/game`);
        }
      } else {
        progressService.saveProgress({ ...withStars, currentStep: "video", currentLessonId: nextId });
        goToScore(`/lessons/${nextId}/video`);
      }
    } else {
      // Manual: ไม่มีหน้าสรุปคั่นแล้ว → จบเกมไปหน้าคะแนนแล้วกลับหน้าหลักแผนผังเรียนเลย
      progressService.saveProgress({ ...withStars, currentStep: "lessons" });
      goToScore(`/lessons`);
    }
  };

  useDevSkip(() => handleFinishGame(0));

  // "ใช่" → หน้ากรอกชื่อเพื่อเก็บคะแนน (Figma 3157:15657) เก็บเสร็จแล้วไปกระดานคะแนน
  // "ไม่" → ทิ้งคะแนนรอบนี้ แล้วไปดูกระดานคะแนนของเกมนี้เลย
  const handleSaveScoreChoice = (save: boolean) => {
    if (!scorePrompt) return;
    loggingService.logEvent(save ? "leaderboard_save_chosen" : "leaderboard_save_declined", {
      game_id: scorePrompt.gid,
      lesson_id: lessonId,
      score: scorePrompt.score,
    });
    if (save) {
      router.push(`/lessons/${lessonId}/leaderboard?step=save`);
    } else {
      leaderboardScoreService.clearPendingScore(scorePrompt.gid);
      router.push(`/lessons/${lessonId}/leaderboard?skipped=1`);
    }
  };

  const renderGameContent = () => {
    const logEventBound = loggingService.logEvent.bind(loggingService);
    switch (lessonId) {
      case "topic-1":
        return <G1FactCheck onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "topic-2":
        return <G2ScamSpotter onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "topic-3":
        return <G3AIOrNot onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "topic-5":
        return <G5DigitalShield onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "topic-6":
        return <G6LineSimulation onFinish={handleFinishGame} logEvent={logEventBound} />;
      case FLOW_G13_ID:
        return <G13ScoopStacker onFinish={handleFinishGame} logEvent={logEventBound} learningMode={learningMode} />;
      case "g15":
        return <G15AIChatSimulator onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "g16":
        return <G16ThinkBeforePost onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "g17":
        return <G17ScamBreaker onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "g18":
        return <G18MemoryPads onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "g19":
        return <G19FruitMatch onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "g20":
        return <G20VeggieToss onFinish={handleFinishGame} logEvent={logEventBound} />;
      case "g20k":
        return <G20KVeggieTossKitchen onFinish={handleFinishGame} logEvent={logEventBound} />;
      default:
        return <G1FactCheck onFinish={handleFinishGame} logEvent={logEventBound} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังโหลดระบมเกมจำลอง...</span>
      </div>
    );
  }

  return (
    <div className="screen-container p-0 gap-0">
      {/* Game Screen */}
      <div className="flex flex-col flex-1 min-h-0">
        {renderGameContent()}
      </div>
      {scorePrompt && (
        <SaveScorePopup onYes={() => handleSaveScoreChoice(true)} onNo={() => handleSaveScoreChoice(false)} />
      )}
    </div>
  );
}
