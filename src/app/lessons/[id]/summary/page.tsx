"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Star, RefreshCw, Share2, BookOpen, ArrowRight } from "lucide-react";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";
import { FLOW_POST_TEST_ID, FLOW_POST_TEST_PATH, nextFlowLessonAfterGame } from "@/lib/flow";

const LESSON_CONGRATS: Record<string, { title: string; desc: string }> = {
  "topic-1": {
    title: "คุณเรียนจบวิชาที่ 1 แล้ว!",
    desc: "คุณเก่งมากที่รู้วิธีแยกแยะข่าวสาร และระวังอารมณ์ตนเองก่อนตัดสินใจแชร์",
  },
  "topic-2": {
    title: "คุณเรียนจบวิชาที่ 2 แล้ว!",
    desc: "คุณยอดเยี่ยมมากที่รู้จักสังเกตสัญญาณเตือนมิจฉาชีพ ทั้งแชทลวงและลิงก์ปลอม",
  },
  "topic-3": {
    title: "คุณเรียนจบวิชาที่ 3 แล้ว!",
    desc: "คุณเก่งที่สุดที่สามารถระบุจุดผิดปกติของรูปภาพที่สังเคราะห์จากระบบ AI",
  },
  "topic-5": {
    title: "คุณเรียนจบวิชาที่ 4 แล้ว!",
    desc: "คุณยอดเยี่ยมมากที่รู้วิธีกางโล่ป้องกันสแกมและข้อความล่อลวงภัยออนไลน์",
  },
  "topic-6": {
    title: "คุณเรียนจบวิชาที่ 5 แล้ว!",
    desc: "คุณยอดเยี่ยมมากที่จับสัญญาณมิจฉาชีพในแชทไลน์จำลองได้อย่างแม่นยำ",
  },
};

export default function LessonSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = (params.id as string) || "topic-1";
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [stars, setStars] = useState(3);

  useEffect(() => {
    // Session check
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }

    const currentProgress = progressService.getProgress();
    setProgress(currentProgress);

    // Read stars from search params or fallback to local state progress
    const starsParam = searchParams.get("stars");
    if (starsParam) {
      setStars(parseInt(starsParam, 10) || 3);
    } else {
      setStars(currentProgress.stars[lessonId] || 3);
    }

    loggingService.logEvent("reward_view", { lesson_id: lessonId });
    setLoading(false);
  }, [lessonId, searchParams, router]);

  const congrats = LESSON_CONGRATS[lessonId] || LESSON_CONGRATS["topic-1"];
  const learningMode = progress?.learningMode || "manual";
  
  const shareText = `ฉันเล่นผ่านบทเรียน "${congrats.title}" ของเกม "รู้ทันสื่อ" แล้ว ได้คะแนน ${stars} ดาวเลย! มาลองเล่นฝึกสมองเพื่อป้องกันมิจฉาชีพด้วยกันนะ`;
  
  // Construct dynamic share link
  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/?lesson=${lessonId}`;
    }
    return "";
  };
  const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText + " " + getShareUrl())}`;

  const handleShareClick = () => {
    loggingService.logEvent("share_click", { lesson_id: lessonId, stars_earned: stars });
  };

  const handleDashboardClick = () => {
    loggingService.logEvent("reward_goto_dashboard", { lesson_id: lessonId });
    
    // Save state before redirecting
    const updatedProgress = {
      ...progress,
      currentStep: "lessons",
    };
    progressService.saveProgress(updatedProgress);

    router.push("/lessons");
  };

  const handleNextLessonFlow = () => {
    // US-CF-24: ใช้ลำดับ flow ปัจจุบัน (G1→topic-3, G3→topic-6, G6→G13) ผ่าน flow.ts
    const nextId = nextFlowLessonAfterGame(lessonId);
    if (nextId === FLOW_POST_TEST_ID) {
      // บทสุดท้าย → แบบทดสอบหลังเรียน (แทนเกมปิดท้าย G13 เดิม)
      const updatedProgress = {
        ...progress,
        currentStep: "post-test",
        currentLessonId: undefined,
        learningMode: "flow",
      };
      progressService.saveProgress(updatedProgress);
      router.push(FLOW_POST_TEST_PATH);
    } else {
      // → คลิปของบทถัดไป (video page จะแสดงหน้าชื่อคลิปก่อน)
      const updatedProgress = {
        ...progress,
        currentStep: "video",
        currentLessonId: nextId,
        learningMode: "flow",
      };
      progressService.saveProgress(updatedProgress);
      router.push(`/lessons/${nextId}/video`);
    }
  };

  const handleRestart = () => {
    loggingService.logEvent("replay_lesson", { lesson_id: lessonId });
    
    const updatedProgress = {
      ...progress,
      currentStep: "video",
      currentLessonId: lessonId,
    };
    progressService.saveProgress(updatedProgress);

    router.push(`/lessons/${lessonId}/video`);
  };

  if (loading || !progress) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังประมวลผลรางวัลความสำเร็จ...</span>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="content-area my-auto">
        <h1 className="text-4xl text-[var(--primary)] font-extrabold mb-2">🎉 ยินดีด้วย!</h1>
        <h2 className="text-2xl font-bold">{congrats.title}</h2>
        <p className="text-lead text-lg mt-2 leading-relaxed">{congrats.desc}</p>

        {/* Stars display with bounce delay animations */}
        <div className="flex justify-center gap-4 my-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              style={{ animation: `bounce 0.5s ease-out ${s * 0.2}s both` }}
            >
              <Star 
                size={54} 
                fill={s <= stars ? "#eab308" : "none"} 
                color={s <= stars ? "#eab308" : "var(--border)"}
                style={{
                  filter: s <= stars ? "drop-shadow(0 0 12px rgba(234, 179, 8, 0.6))" : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Reward Message Box */}
        <div className="premium-card p-5">
          <strong className="text-[22px] text-[var(--primary-dark)] block mb-1">
            คุณได้รับ {stars} ดาวความสำเร็จ!
          </strong>
          <span className="text-[18px] text-[var(--text-secondary)]">
            ดาวดวงนี้บันทึกไว้ในเบราว์เซอร์ของท่านแล้วอย่างปลอดภัย เพื่อปลดล็อกเข้าสู่บทเรียนถัดไป
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto w-full">
        {learningMode === "flow" ? (
          <>
            {/* Next Lesson in flow */}
            <button 
              onClick={handleNextLessonFlow}
              className="btn btn-primary text-[22px] min-h-[64px]"
            >
              <ArrowRight size={24} />
              <span>{nextFlowLessonAfterGame(lessonId) === FLOW_POST_TEST_ID ? "ไปทำแบบทดสอบหลังเรียน" : "ดูคลิปบทถัดไป"}</span>
            </button>

            {/* LINE Share Button */}
            <a 
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleShareClick}
              className="btn flex items-center justify-center bg-[#06c755] hover:bg-[#05b04b] text-white text-[22px] min-h-[64px] no-underline"
            >
              <Share2 size={24} />
              <span>แชร์ผลงานเข้าไลน์กลุ่ม</span>
            </a>

            {/* Exit to map */}
            <button 
              onClick={handleDashboardClick}
              className="btn btn-outline text-[18px] min-h-[52px] border-[var(--primary)] text-[var(--primary)]"
            >
              <BookOpen size={20} />
              <span>ออกไปยังหน้าหลักแผนผัง</span>
            </button>
          </>
        ) : (
          <>
            {/* Go to Dashboard */}
            <button 
              onClick={handleDashboardClick}
              className="btn btn-primary text-[22px] min-h-[64px]"
            >
              <BookOpen size={24} />
              <span>กลับหน้าหลักแผนผังเรียน</span>
            </button>

            {/* LINE Share Button */}
            <a 
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleShareClick}
              className="btn flex items-center justify-center bg-[#06c755] hover:bg-[#05b04b] text-white text-[22px] min-h-[64px] no-underline"
            >
              <Share2 size={24} />
              <span>แชร์ผลงานเข้าไลน์กลุ่ม</span>
            </a>
          </>
        )}

        {/* Play Again Button */}
        <button 
          onClick={handleRestart}
          className="btn btn-outline text-[18px] min-h-[52px]"
        >
          <RefreshCw size={18} />
          <span>ทบทวนเนื้อหาวิชานี้อีกครั้ง</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0% { transform: translateY(0) scale(0.3); opacity: 0; }
          50% { transform: translateY(-16px) scale(1.1); }
          80% { transform: translateY(4px) scale(0.95); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
