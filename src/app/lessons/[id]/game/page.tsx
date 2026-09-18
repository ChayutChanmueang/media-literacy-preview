"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";
import { apiClient } from "@/services/apiClient";
import { leaderboardScoreService } from "@/services/leaderboardScoreService";
import { FLOW_G13_ID, FLOW_POST_TEST_ID, FLOW_POST_TEST_PATH, nextFlowLessonAfterGame } from "@/lib/flow";
import { useDevSkip } from "@/lib/devSkip";
import { TEMP_AWARDED_STARS } from "@/lib/gameScore";

// Dynamic imports with SSR disabled to prevent window/speechSynthesis undefined crashes
const G1FactCheck = dynamic(() => import("@/components/G1FactCheck"), { ssr: false });
const G2ScamSpotter = dynamic(() => import("@/components/G2ScamSpotter"), { ssr: false });
const G3AIOrNot = dynamic(() => import("@/components/G3AIOrNot"), { ssr: false });
const G5DigitalShield = dynamic(() => import("@/components/G5DigitalShield"), { ssr: false });
const G6LineSimulation = dynamic(() => import("@/components/G6LineSimulation"), { ssr: false });
const G13ScoopStacker = dynamic(() => import("@/components/G13ScoopStacker"), { ssr: false });

const getGameId = (lessonId: string) => {
  switch (lessonId) {
    case "topic-1": return "G1";
    case "topic-2": return "G2";
    case "topic-3": return "G3";
    case "topic-5": return "G5";
    case "topic-6": return "G6";
    case FLOW_G13_ID: return "G13";
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

  const handleFinishGame = async (starsEarned: number) => {
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
      // TEMP: ข้ามหน้าคะแนนกลาง (GameScorePage) ไปกระดานคะแนนตรงๆ — กระดานคะแนนของ G13 มีหน้าคะแนนของตัวเองอยู่แล้ว
      router.push(`/lessons/${FLOW_G13_ID}/leaderboard`);
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

    if (learningMode === "flow") {
      // US-CF-32: flow ไม่มีหน้าสรุปคะแนนคั่นแล้ว → จบเกมไป "หน้าชื่อคลิป" ของบทถัดไปเลย (video intro) หรือด่านปิดท้าย
      const nextId = nextFlowLessonAfterGame(lessonId);
      if (nextId === FLOW_POST_TEST_ID) {
        if (progressService.getAppMode() === "research") {
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
    </div>
  );
}
