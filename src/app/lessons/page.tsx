"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { firstIncompleteFlowLesson } from "@/lib/flow";
import { notoLoopedThai } from "@/lib/fonts";
import { getOrderedLessonIds, getVideoByLessonId } from "@/lib/videos";

// Figma node "เลือกโหมด" — การ์ดเลือกโหมดเดินเรื่อง (คลิกได้ทั้งใบ ไม่มีปุ่มยืนยันแยก)
// ช่อง "image 27" ในดีไซน์เป็น checker placeholder ของ Figma เอง (ยังไม่มีภาพจริงให้) จึงคงไว้เป็น placeholder
function ModeCard({
  name,
  body,
  caption,
  onClick,
}: {
  name: string;
  /** ขึ้นบรรทัดตามที่ Figma ตั้งใจตัดไว้เอง — ภาษาไทยไม่มีเว้นวรรคระหว่างคำ เบราว์เซอร์บางตัว
   * (โดยเฉพาะเบราว์เซอร์ในแอป LINE ที่กลุ่มผู้ใช้หลักเข้าเว็บผ่าน) ตัดคำผิดกลางคำได้ถ้าปล่อยให้ wrap เอง */
  body: string[];
  caption: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[264px] w-full max-w-[352px] cursor-pointer flex-col overflow-clip rounded-[24px] border-0 bg-[#D9D9D9] p-0 text-left active:translate-y-[2px]"
    >
      {/* min-h, not h: on narrow screens the wrapped text can need more room than the 152px image — the card must grow, never clip */}
      <div className="flex min-h-[256px] items-center gap-[16px] rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white px-[24px] py-[20px]">
        <div
          className="h-[152px] w-[132px] shrink-0 rounded-[12px]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #E5E5E5 25%, transparent 25%), linear-gradient(-45deg, #E5E5E5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E5E5E5 75%), linear-gradient(-45deg, transparent 75%, #E5E5E5 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          }}
          aria-hidden="true"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
          <p className="text-[28px] font-bold leading-[36px] text-[#4B4B4B]">{name}</p>
          <p className="text-[20px] font-normal leading-[30px] text-[#4B4B4B]">
            {body.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>
          <div className="h-[2px] w-full bg-[#4B4B4B]" />
          <p className="text-[18px] font-normal leading-[26px] text-[#4B4B4B]">
            {caption.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
    </button>
  );
}

// Figma node "อิสระ" (หมวดหมู่) — การ์ดหมวดหมู่แถวเดียว ไอคอน+ชื่อ (Component 30/31/32)
function CategoryCard({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[104px] w-full cursor-pointer flex-col overflow-clip rounded-[24px] border-0 bg-[#D9D9D9] p-0 text-left active:translate-y-[2px]"
    >
      {/* min-h, not h: some labels (video titles) run longer than the short category names this card was designed around */}
      <div className="flex min-h-[96px] items-center gap-[28px] rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white py-[8px] pl-[20px] pr-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" aria-hidden="true" className="size-[60px] shrink-0 rounded-[12px] object-cover" />
        <p className="min-w-0 flex-1 text-[24px] font-semibold leading-[32px] text-[#4B4B4B]">{label}</p>
      </div>
    </button>
  );
}

// Figma node "Component 29" — ปุ่มย้อนกลับรอง ตัวเล็ก กึ่งกลาง ตัวอักษรสีเทา (ไม่ใช่ Button3D หลักสีฟ้า)
function BackPillButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto flex h-[64px] w-fit min-w-[172px] cursor-pointer flex-col overflow-clip rounded-[20px] border-0 bg-[#D9D9D9] p-0 active:translate-y-[2px]"
    >
      <div className="flex h-[56px] items-center justify-center rounded-[20px] border-2 border-solid border-[#D9D9D9] bg-white px-[24px]">
        <span className="text-[20px] font-semibold leading-[30px] text-[#A5A5A5]">ย้อนกลับ</span>
      </div>
    </button>
  );
}

const CATEGORIES = [
  { id: "learning", icon: "/images/lessons/category-learning.png", label: "เกมเพื่อการเรียนรู้" },
  { id: "fun", icon: "/images/lessons/category-fun.png", label: "เกมสนุก" },
  { id: "video", icon: "/images/lessons/category-video.png", label: "วิดีโอ" },
] as const;

// เกมสนุก (นอกสาย Flow) — ตอนนี้มีแค่ G13 ตัวเดียว โครงสร้างรองรับเพิ่มเกมสนุกอื่นในอนาคต
const FUN_GAMES = [
  { id: "flow-g13", icon: "/assets/g13-waffle-cone.svg", label: "ต่อไอติมฝึกสมอง" },
];

// Figma node "เกมเพื่อการเรียนรู้" — mockup มี 3 แถว (แถวสุดท้ายซ้ำข้อความแถวแรกในต้นฉบับ ดูเป็น
// placeholder พลาด) ใช้ 3 เกมที่มีอยู่จริงในสาย Flow แทน (G2/G5 ยังเล่นได้จาก /dev/games เท่านั้น)
const LEARNING_GAMES = [
  { id: "topic-1", icon: "/assets/icon-game/g1-icon.png", label: "เกมจริงหรือมั่ว" },
  { id: "topic-6", icon: "/assets/icon-game/line-icon.png", label: "เกมจำลองแชทไลน์" },
  { id: "topic-3", icon: "/assets/icon-game/g3-icon.png", label: "เอไอ หรือ ของจริง" },
];

// รายการวิดีโอ — ดึงจาก videos.json แหล่งเดียวกับหน้าคลิปจริง ไม่พิมพ์ชื่อซ้ำเอง กันข้อมูลสองที่ไม่ตรงกัน
// ไม่มีภาพปกต่อคลิปในโปรเจกต์ จึงใช้ไอคอนกล้องเดียวกับหมวด "วิดีโอ" ซ้ำทุกแถวไปก่อน
const VIDEOS = getOrderedLessonIds().map((lessonId) => {
  const video = getVideoByLessonId(lessonId);
  return { id: lessonId, icon: "/images/lessons/category-video.png", label: video.clipIntro };
});

export default function LessonSelectorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [activeSubPage, setActiveSubPage] = useState<"modes" | "categories" | "lessons" | "fun-games" | "videos">("modes");

  useEffect(() => {
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }

    const currentProgress = progressService.getProgress();
    setProgress(currentProgress);

    // เคยเลือกโหมดอิสระค้างไว้ → กลับเข้าหน้าหมวดหมู่เลย ไม่ต้องเลือกโหมดซ้ำ
    if (currentProgress.learningMode === "manual") {
      setActiveSubPage("categories");
    } else {
      setActiveSubPage("modes");
    }

    loggingService.logEvent("lessons_dashboard_view");
    setLoading(false);
  }, [router]);

  // โหมดอิสระ: เลือกเล่นเกมไหนก่อนก็ได้ ไม่มีการล็อกตามลำดับอีกต่อไป (คั่นด้วยหน้าคลิปเหมือนเดิม)
  const handleGameClick = (lessonId: string) => {
    loggingService.logEvent("select_lesson", { lesson_id: lessonId, mode: "manual" });
    const updatedProgress = {
      ...progress,
      currentStep: "video",
      currentLessonId: lessonId,
      learningMode: "manual",
    };
    progressService.saveProgress(updatedProgress);
    router.push(`/lessons/${lessonId}/video`);
  };

  const handleStartFlowMode = () => {
    // US-CF-07: flow เป็น "คลิปนำ → เกม" จึงเข้าที่หน้า video ก่อน
    // และ resume จากบทแรกที่ยังไม่ผ่านในลำดับ flow (topic-1 → topic-3 → topic-6)
    const targetLesson = firstIncompleteFlowLesson(progress?.stars || {});

    loggingService.logEvent("select_lesson", { lesson_id: targetLesson, mode: "flow" });

    const updatedProgress = {
      ...progress,
      currentStep: "video",
      currentLessonId: targetLesson,
      learningMode: "flow",
    };
    progressService.saveProgress(updatedProgress);

    router.push(`/lessons/${targetLesson}/video`);
  };

  const handleStartManualMode = () => {
    const updatedProgress = {
      ...progress,
      learningMode: "manual",
    };
    progressService.saveProgress(updatedProgress);
    setProgress(updatedProgress);
    setActiveSubPage("categories");
  };

  const handleBackToModes = () => {
    const updatedProgress = {
      ...progress,
      learningMode: undefined,
    };
    progressService.saveProgress(updatedProgress);
    setProgress(updatedProgress);
    setActiveSubPage("modes");
  };

  // จากหน้าย่อยของโหมดอิสระ (รายวิชา/เกมสนุก/วิดีโอ) กลับขึ้นมาหน้าหมวดหมู่ — ไม่รีเซ็ต learningMode
  // เพราะยังอยู่ในโหมดอิสระเหมือนเดิม ต่างจาก handleBackToModes ที่ออกจากโหมดอิสระไปเลือกโหมดใหม่
  const handleBackToCategories = () => {
    setActiveSubPage("categories");
  };

  const handleSelectCategory = (categoryId: (typeof CATEGORIES)[number]["id"]) => {
    loggingService.logEvent("select_category", { category: categoryId });
    if (categoryId === "learning") setActiveSubPage("lessons");
    else if (categoryId === "fun") setActiveSubPage("fun-games");
    else setActiveSubPage("videos");
  };

  const handleFunGameClick = (gameId: string) => {
    loggingService.logEvent("select_lesson", { lesson_id: gameId, mode: "manual", category: "fun" });
    const updatedProgress = {
      ...progress,
      currentStep: "game",
      currentLessonId: gameId,
      learningMode: "manual",
    };
    progressService.saveProgress(updatedProgress);
    router.push(`/lessons/${gameId}/game`);
  };

  if (loading || !progress) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังโหลดแผนผังบทเรียน...</span>
      </div>
    );
  }

  if (activeSubPage === "modes") {
    return (
      <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center gap-[32px] px-[24px] py-[28px]">
            <p className="text-center text-[28px] font-bold leading-[36px]">
              โปรดเลือกรูปแบบการเรียนรู้
              <br />
              ของคุณ
            </p>

            <div className="flex w-full flex-col items-center gap-[24px]">
              <ModeCard
                name="เนื้อเรื่อง"
                body={["การเรียนรู้เรียง", "ต่อไปเรื่อยๆ"]}
                caption={["เรียนรู้ตามลำดับ", "ขั้นตอนเนื้อหาเข้าใจ", "ง่าย"]}
                onClick={handleStartFlowMode}
              />
              <ModeCard
                name="อิสระ"
                body={["เลือกการเรียนรู้ได้", "อย่างอิสระ"]}
                caption={["เลือกหัวข้อที่สนใจ", "เรียนรู้ด้วยตัวเอง"]}
                onClick={handleStartManualMode}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Figma node "อิสระ" (หมวดหมู่) — หน้าหมวดหมู่ของโหมดอิสระ คั่นก่อนเข้ารายวิชา/เกมสนุก/วิดีโอ
  if (activeSubPage === "categories") {
    return (
      <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col gap-[24px] px-[24px] py-[28px]">
            <p className="text-[28px] font-bold leading-[36px]">หมวดหมู่</p>

            <div className="flex w-full flex-col gap-[16px]">
              {CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  onClick={() => handleSelectCategory(category.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
          <BackPillButton onClick={handleBackToModes} />
        </div>
      </div>
    );
  }

  // เกมสนุก (นอกสาย Flow) — ยังไม่มีดีไซน์เฉพาะ จึงใช้ลิสต์การ์ดสไตล์เดียวกับหน้าหมวดหมู่
  if (activeSubPage === "fun-games") {
    return (
      <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col gap-[24px] px-[24px] py-[28px]">
            <p className="text-[28px] font-bold leading-[36px]">เกมสนุก</p>

            <div className="flex w-full flex-col gap-[16px]">
              {FUN_GAMES.map((game) => (
                <CategoryCard
                  key={game.id}
                  icon={game.icon}
                  label={game.label}
                  onClick={() => handleFunGameClick(game.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
          <BackPillButton onClick={handleBackToCategories} />
        </div>
      </div>
    );
  }

  // วิดีโอ — รอดีไซน์รายการวิดีโอจริง ตอนนี้เป็นหน้าชั่วคราวกันปุ่มพาไปหน้าที่ไม่มีอะไรเลย
  // Figma node "เกมเพื่อการเรียนรู้" — ใช้รูปแบบการ์ดเดียวกันซ้ำสำหรับทั้ง 3 รายการย่อยของโหมดอิสระ
  if (activeSubPage === "videos") {
    return (
      <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col gap-[24px] px-[24px] py-[28px]">
            <p className="text-[28px] font-bold leading-[36px]">วิดีโอ</p>

            <div className="flex w-full flex-col gap-[16px]">
              {VIDEOS.map((video) => (
                <CategoryCard
                  key={video.id}
                  icon={video.icon}
                  label={video.label}
                  onClick={() => handleGameClick(video.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
          <BackPillButton onClick={handleBackToCategories} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col gap-[24px] px-[24px] py-[28px]">
          <p className="text-[28px] font-bold leading-[36px]">เกมเพื่อการเรียนรู้</p>

          <div className="flex w-full flex-col gap-[16px]">
            {LEARNING_GAMES.map((game) => (
              <CategoryCard
                key={game.id}
                icon={game.icon}
                label={game.label}
                onClick={() => handleGameClick(game.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-[24px] pb-[64px] pt-[24px]">
        <BackPillButton onClick={handleBackToCategories} />
      </div>
    </div>
  );
}
