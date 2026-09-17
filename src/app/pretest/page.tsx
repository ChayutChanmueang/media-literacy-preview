"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizScreen from "@/components/QuizScreen";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";

export default function PretestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic guard: verify session exists
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }
    // Mark session as testing group since they are accessing pretest directly
    if (!session.isTestingGroup) {
      session.isTestingGroup = true;
      progressService.saveSession(session);
    }
    setLoading(false);
  }, [router]);

  const handleComplete = (score: number) => {
    // Save completion state in local progress
    const progress = progressService.getProgress();
    const updatedProgress = {
      ...progress,
      pretest_completed: true,
      currentStep: "lessons",
    };
    progressService.saveProgress(updatedProgress);

    loggingService.logEvent("pretest_completed_screen_transition", { score });
    
    // Set a custom cookie that middleware can read
    document.cookie = "naplab_ml_pretest_completed=true; path=/; max-age=31536000; SameSite=Lax";

    // Direct transition to lessonsselector
    router.push("/lessons");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังตรวจสอบข้อมูลผู้เรียน...</span>
      </div>
    );
  }

  return (
    <QuizScreen
      testType="pretest"
      title="แบบทดสอบวัดความรู้ก่อนเรียน"
      onComplete={handleComplete}
    />
  );
}
