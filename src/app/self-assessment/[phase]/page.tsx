"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { loggingService } from "@/services/loggingService";
import { notoLoopedThai } from "@/lib/fonts";
import { useDevSkip } from "@/lib/devSkip";
import { SELF_ASSESSMENT_PHASES, type SelfAssessmentPhase } from "@/lib/selfAssessmentPhase";
import Button3D from "@/components/Button3D";

// Figma node 2065:9345 "หน้าPre test". Text uses <p>, not headings: globals.css styles h1/h2 unlayered, which overrides Tailwind utilities.
export default function SelfAssessmentStartPage() {
  const router = useRouter();
  const { phase } = useParams<{ phase: SelfAssessmentPhase }>();

  useEffect(() => {
    loggingService.logEvent("self_assessment_intro_view", { phase });
  }, [phase]);

  const handleStart = () => {
    loggingService.logEvent("self_assessment_start", { phase });
    router.push(`/self-assessment/${phase}/questions`);
  };

  useDevSkip(handleStart);

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gap-[64px] px-[24px] py-[28px] text-center">
          <p className="w-full text-[32px] font-bold leading-[40px] text-black">{SELF_ASSESSMENT_PHASES[phase].title}</p>
          <p className="w-full text-[24px] font-semibold leading-[32px] text-[#4B4B4B]">
            เลือกคำตอบที่ตรงกับความ
            <br />
            คิดของคุณมากที่สุด
          </p>
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D onClick={handleStart}>กดเพื่อเริ่ม</Button3D>
      </div>
    </div>
  );
}
