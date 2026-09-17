"use client";

import React, { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { useDevSkip } from "@/lib/devSkip";
import { TEMP_AWARDED_STARS } from "@/lib/gameScore";
import GameScoreCard from "@/components/GameScoreCard";

// Figma node 2065:7012 "Score2" — หน้าคะแนนหลังจบเกม ใช้ร่วมกันทุกเกม (เรียกจาก game/page.tsx หลัง onFinish)
// `next` มาจาก query string เป็นปลายทางจริงที่ game/page.tsx คำนวณไว้แล้ว (บทถัดไป/แบบทดสอบหลังเรียน/สรุปผล/กระดานคะแนน)
export default function GameScorePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = (params.id as string) || "topic-1";
  const next = searchParams.get("next") || "/lessons";

  useEffect(() => {
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }
    loggingService.logEvent("game_score_view", { lesson_id: lessonId, stars: TEMP_AWARDED_STARS });
  }, [lessonId, router]);

  const handleNext = () => {
    loggingService.logEvent("game_score_continue", { lesson_id: lessonId, next });
    router.push(next);
  };

  useDevSkip(handleNext);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-[24px] py-[28px]">
        <GameScoreCard stars={TEMP_AWARDED_STARS} onNext={handleNext} />
      </div>
    </div>
  );
}
