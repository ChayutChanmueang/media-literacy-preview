"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loggingService } from "@/services/loggingService";
import { progressService } from "@/services/progressService";
import { notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";
import CompletionCard from "@/components/CompletionCard";

// Figma node 2065:9382 "End"
export default function LessonCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const session = progressService.getOrCreateSession();
    if (!session?.consentGiven || !session.ageGroup) {
      router.replace("/consent");
      return;
    }

    loggingService.logEvent("course_completion_view");
  }, [router]);

  const handleBackHome = () => {
    // โหมดวิจัย: ไม่มีหน้าหมวดหมู่ "/lessons" ให้กลับ (เข้าไปจะเจอ auto-redirect เข้าบทเรียนซ้ำ)
    // จึงกลับไปหน้าแรกของแอปแทน ต่างจากโหมดปกติที่ "/lessons" คือหน้าหลักจริงๆ
    const isResearch = progressService.getAppMode() === "research";
    const progress = progressService.getProgress();
    progressService.saveProgress({
      ...progress,
      currentStep: isResearch ? "landing" : "lessons",
      currentLessonId: undefined,
    });
    loggingService.logEvent("course_completion_back_home");
    router.push(isResearch ? "/" : "/lessons");
  };

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-[24px] py-[28px]">
          <CompletionCard
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/course-complete/medal.svg" alt="" className="absolute inset-0 block size-full" />
            }
            eyebrow="ยินดีด้วย!"
            title={
              <>
                เก่งมากท่านได้เรียนรู้
                <br />
                ครบถ้วน
              </>
            }
            caption="ท่านเรียนรู้ครบทุกกิจกรรมแล้ว ขอชื่นชมในความตั้งใจของท่าน"
          />
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D onClick={handleBackHome}>กดเพื่อกลับไปหน้าหลัก</Button3D>
      </div>
    </div>
  );
}
