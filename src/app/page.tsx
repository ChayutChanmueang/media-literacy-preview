"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { FLOW_SEQUENCE, firstIncompleteFlowLesson } from "@/lib/flow";
import { notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";

// Figma node 2065:7228 "รู้ทันสื่อ"
export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Log page entry
    const sess = progressService.getOrCreateSession();
    setSession(sess);
    loggingService.logEvent("landing_page_view");
    setLoading(false);
  }, []);

  const handleNext = () => {
    if (!session?.consentGiven || !session?.ageGroup) {
      router.push("/consent");
      return;
    }
    // US-CF-33: ถ้าเล่น flow ค้างกลางคัน (ผ่านบางบทแต่ยังไม่ครบ) → resume เข้าบทที่ค้างเลย
    // ข้าม Start Menu (ที่โชว์คลิปแรก "ใคร ๆ ก็ทำสื่อได้" เสมอ) ซึ่งทำให้เห็นหน้าชื่อคลิปซ้ำ/งง
    const progress = progressService.getProgress();
    const stars = progress?.stars || {};
    const doneCount = FLOW_SEQUENCE.filter((id) => stars[id] !== undefined).length;
    if (doneCount > 0 && doneCount < FLOW_SEQUENCE.length) {
      const targetLesson = firstIncompleteFlowLesson(stars);
      progressService.saveProgress({
        ...progress,
        currentStep: "video",
        currentLessonId: targetLesson,
        learningMode: "flow",
      });
      loggingService.logEvent("resume_flow", { lesson_id: targetLesson });
      router.push(`/lessons/${targetLesson}/video`);
    } else {
      // fresh (ยังไม่เริ่ม) หรือ เล่นครบแล้ว → Start Menu ตามเดิม
      router.push("/lessons");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-[var(--text-secondary)] text-lg">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gap-[20px] px-[24px] py-[28px] text-center">
          <Image
            src="/assets/app-logo.jpg"
            alt="สานพลัง สังคมสูงวัย ใส่ใจสุขภาพ แพร่ น่าน เชียงใหม่"
            width={1254}
            height={1254}
            priority
            sizes="172px"
            className="size-[172px] shrink-0 object-contain"
          />

          {/* globals.css styles h1 unlayered, so Tailwind utilities lose to it — Figma's type is set inline */}
          <h1
            style={{
              fontFamily: "inherit",
              fontSize: "40px",
              lineHeight: "48px",
              fontWeight: 700,
              color: "#4B4B4B",
              marginBottom: 0,
            }}
          >
            รู้ทันสื่อ
          </h1>

          <p className="w-full text-[24px] font-semibold leading-[32px]">หยุด · คิด · ถาม · ทำ</p>

          <p className="w-full text-[22px] font-normal leading-[32px]">
            เรียนรู้ความปลอดภัยออนไลน์
            <br />
            ด้วยตัวคุณเอง
          </p>

          <p className="w-full text-[18px] font-normal leading-[26px] text-[#595959]">
            ยินดีต้อนรับ ชวนทุกท่านมาดูคลิปสั้นสนุก ๆ และเล่นเกมฝึกจับกลโกงแยกแยะข่าวจริง-ข่าวปลอม และสังเกตสื่อ AI เพื่อป้องกันพวกมิจฉาชีพในมือถือกัน
          </p>
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <Button3D onClick={handleNext}>กดเพื่อเริ่ม</Button3D>
      </div>
    </div>
  );
}
