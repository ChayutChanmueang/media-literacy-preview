"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { notoLoopedThai } from "@/lib/fonts";
import { useDevSkip } from "@/lib/devSkip";
import type { SelfAssessmentPhase } from "@/lib/selfAssessmentPhase";
import Button3D from "@/components/Button3D";
import CompletionCard from "@/components/CompletionCard";

// Figma node 2008:8795 "หน้าทำแบบทดสอบเสร็จ"
export default function SelfAssessmentCompletePage() {
  const router = useRouter();
  const { phase } = useParams<{ phase: SelfAssessmentPhase }>();

  useEffect(() => {
    loggingService.logEvent("self_assessment_complete_view", { phase });
  }, [phase]);

  const handleContinue = () => {
    loggingService.logEvent("self_assessment_continue", { phase });

    // Post-test ends the learning flow (it replaced the G13 game + leaderboard, which used to lead here).
    if (phase === "post") {
      const progress = progressService.getProgress();
      progressService.saveProgress({ ...progress, currentStep: "complete", currentLessonId: undefined });
      router.push("/lessons/complete");
      return;
    }

    const session = progressService.getOrCreateSession();
    router.push(session?.isTestingGroup ? "/pretest" : "/lessons");
  };

  useDevSkip(handleContinue);

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-[24px] py-[28px]">
          <CompletionCard
            icon={
              <div className="absolute left-[20px] top-[20px] size-[60px] overflow-clip">
                <div className="absolute inset-[12.5%_8.33%]">
                  <div className="absolute inset-[-4.17%_-3.75%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/self-assessment/mortarboard.svg" alt="" className="block size-full max-w-none" />
                  </div>
                </div>
              </div>
            }
            eyebrow="ทำแบบประเมินเสร็จแล้ว!"
            title={
              phase === "pre" ? (
                "ขอบคุณสำหรับคำตอบของคุณ"
              ) : (
                <>
                  ขอบคุณที่ร่วมเรียนรู้
                  <br />
                  กับเรา
                </>
              )
            }
            caption={
              phase === "pre" ? (
                "พร้อมแล้ว มาเริ่มเรียนรู้กันเลย"
              ) : (
                <>
                  ขอให้ความรู้ที่ได้รับ
                  <br />
                  ช่วยให้คุณรู้ทันสื่อได้อย่างมั่นใจ
                </>
              )
            }
          />
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D onClick={handleContinue}>ตกลง</Button3D>
      </div>
    </div>
  );
}
