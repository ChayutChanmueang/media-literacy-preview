"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizScreen from "@/components/QuizScreen";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";

export default function PosttestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Posttest is accessible only after completing all lessons (stars collected)
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }

    // Mark session as testing group since they are accessing posttest directly
    if (!session.isTestingGroup) {
      session.isTestingGroup = true;
      progressService.saveSession(session);
    }

    const progress = progressService.getProgress();
    if (!progress.pretest_completed) {
      router.push("/pretest");
      return;
    }

    // Verify all 5 key topics have stars (topic-1, topic-2, topic-3, topic-5, topic-6)
    const requiredLessons = ["topic-1", "topic-2", "topic-6", "topic-5", "topic-3"];
    const allCompleted = requiredLessons.every((id) => progress.stars[id] !== undefined);
    
    if (!allCompleted) {
      // Send back to dashboard if not finished yet
      alert("กรุณาสะสมดาวให้ครบทุกบทเรียนก่อนเข้าทำแบบทดสอบหลังเรียน");
      router.push("/lessons");
      return;
    }

    setLoading(false);
  }, [router]);

  const handleComplete = (score: number) => {
    const progress = progressService.getProgress();
    const updatedProgress = {
      ...progress,
      posttest_completed: true,
      currentStep: "certificate",
    };
    progressService.saveProgress(updatedProgress);

    loggingService.logEvent("posttest_completed_screen_transition", { score });
    
    // Set a custom cookie that middleware can read
    document.cookie = "naplab_ml_posttest_completed=true; path=/; max-age=31536000; SameSite=Lax";

    // Navigate to certificate page
    router.push("/certificate");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังตรวจสอบความพร้อมสำหรับแบบทดสอบหลังเรียน...</span>
      </div>
    );
  }

  return (
    <QuizScreen
      testType="posttest"
      title="แบบทดสอบวัดความรู้หลังเรียน"
      onComplete={handleComplete}
    />
  );
}
