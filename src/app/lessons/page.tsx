"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { firstIncompleteFlowLesson } from "@/lib/flow";
import { notoLoopedThai } from "@/lib/fonts";
import CustomScrollArea from "@/components/CustomScrollArea";
import { PAGE_SCROLL_TRACK_CLASS, SCROLL_THUMB_CLASS } from "@/lib/scrollbarStyles";
import { getOrderedLessonIds, getVideoByLessonId } from "@/lib/videos";

// 3D press shared by the cards and back button below — same feel as Button3D: the grey base is its own
// layer exactly 8px under the face (so it stays visible however tall the face grows with its text),
// the face slides down over it in 90ms, and the base hides only once fully covered (no grey sliver at
// the rounded corners) and comes back at once on release. Face (children) carries the white fill,
// the #D9D9D9 2px border and the rounding; baseRadius must match that rounding.
function Press3D({
  onClick,
  className = "",
  baseRadius,
  children,
}: {
  onClick: () => void;
  className?: string;
  baseRadius: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block cursor-pointer border-0 bg-transparent p-0 pb-[8px] text-left ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 top-[8px] ${baseRadius} bg-[#D9D9D9] transition-opacity duration-0 group-active:opacity-0 group-active:delay-[90ms]`}
      />
      <span className="relative block transition-transform duration-[90ms] ease-out group-active:translate-y-[8px]">
        {children}
      </span>
    </button>
  );
}

// Figma node "เลือกโหมด" — การ์ดเลือกโหมดเดินเรื่อง (คลิกได้ทั้งใบ ไม่มีปุ่มยืนยันแยก)
// ช่อง "image 27" (132×152) ใช้ไอคอนโหมดจาก public/images/mode-selection — ภาพสี่เหลี่ยมจัตุรัส จึงวางขนาด 132×132 กึ่งกลางช่อง
function ModeCard({
  name,
  icon,
  body,
  caption,
  onClick,
}: {
  name: string;
  icon: string;
  /** ขึ้นบรรทัดตามที่ Figma ตั้งใจตัดไว้เอง — ภาษาไทยไม่มีเว้นวรรคระหว่างคำ เบราว์เซอร์บางตัว
   * (โดยเฉพาะเบราว์เซอร์ในแอป LINE ที่กลุ่มผู้ใช้หลักเข้าเว็บผ่าน) ตัดคำผิดกลางคำได้ถ้าปล่อยให้ wrap เอง */
  body: string[];
  caption: string[];
  onClick: () => void;
}) {
  return (
    <Press3D onClick={onClick} className="w-full max-w-[352px]" baseRadius="rounded-[24px]">
      {/* min-h, not h: on narrow screens the wrapped text can need more room than the 152px image — the card must grow, never clip */}
      <div className="flex min-h-[256px] items-center gap-[16px] rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white px-[24px] py-[20px]">
        <div className="flex h-[152px] w-[132px] shrink-0 items-center justify-center" aria-hidden="true">
          {/* next/image: the source PNGs are 1254px / ~0.6–0.9 MB — served resized for the 132px slot */}
          <Image src={icon} alt="" width={132} height={132} className="h-[132px] w-[132px] object-contain" />
        </div>
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
    </Press3D>
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
    <Press3D onClick={onClick} className="w-full" baseRadius="rounded-[24px]">
      {/* min-h, not h: some labels (video titles) run longer than the short category names this card was designed around */}
      <div className="flex min-h-[96px] items-center gap-[28px] rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white py-[8px] pl-[20px] pr-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" aria-hidden="true" className="size-[60px] shrink-0 rounded-[12px] object-cover" />
        <p className="min-w-0 flex-1 text-[24px] font-semibold leading-[32px] text-[#4B4B4B]">{label}</p>
      </div>
    </Press3D>
  );
}

// Figma node "Component 29" — ปุ่มย้อนกลับรอง ตัวเล็ก กึ่งกลาง ตัวอักษรสีเทา (ไม่ใช่ Button3D หลักสีฟ้า)
function BackPillButton({ onClick }: { onClick: () => void }) {
  return (
    <Press3D onClick={onClick} className="mx-auto w-fit min-w-[172px]" baseRadius="rounded-[20px]">
      <div className="flex h-[56px] items-center justify-center rounded-[20px] border-2 border-solid border-[#D9D9D9] bg-white px-[24px]">
        <span className="text-[20px] font-semibold leading-[30px] text-[#A5A5A5]">ย้อนกลับ</span>
      </div>
    </Press3D>
  );
}

const CATEGORIES = [
  { id: "learning", icon: "/images/lessons/category-learning.png", label: "เกมเพื่อการเรียนรู้" },
  { id: "fun", icon: "/images/lessons/category-fun.png", label: "เกมสนุก" },
  { id: "video", icon: "/images/lessons/category-video.png", label: "วิดีโอ" },
] as const;

// เกมสนุก (นอกสาย Flow) — G13 + G18–G20 (เดิม prototype GP7–GP9) เปิดเฉพาะโหมดอิสระ
// G18–G20 ยังไม่มีไอคอนเฉพาะเกม จึงใช้ไอคอนหมวด "เกมสนุก" ไปก่อน
const FUN_GAMES = [
  { id: "flow-g13", icon: "/assets/icons/g13-ice-cream.jpg", label: "ต่อไอติมฝึกสมอง" },
  { id: "g18", icon: "/images/lessons/category-fun.png", label: "จำให้ขึ้นใจ" },
  { id: "g19", icon: "/images/lessons/category-fun.png", label: "เรียงผลไม้" },
  { id: "g20", icon: "/images/lessons/category-fun.png", label: "ผักบุ้งลอยฟ้า" },
  // รุ่นทดลอง (ฉากร้านอาหาร) ให้ผู้ทดสอบเล่นเทียบกับ G20 — ชื่อมี "(ทดลอง)" กำกับ
  { id: "g20k", icon: "/images/lessons/category-fun.png", label: "ผักบุ้งลอยฟ้า (ทดลอง)" },
];

// Figma node "เกมเพื่อการเรียนรู้" — mockup มี 3 แถว (แถวสุดท้ายซ้ำข้อความแถวแรกในต้นฉบับ ดูเป็น
// placeholder พลาด) ใช้ 3 เกมที่มีอยู่จริงในสาย Flow แทน (G2/G5 ยังเล่นได้จาก /dev/games เท่านั้น)
// + G15–G17 (เดิม prototype GP3/GP4/GP6) เปิดเฉพาะโหมดอิสระ ไม่อยู่ในสาย Flow/โหมดวิจัย
// G15–G17 ยังไม่มีไอคอนเฉพาะเกม จึงใช้ไอคอนหมวด "เกมเพื่อการเรียนรู้" ไปก่อน
const LEARNING_GAMES = [
  { id: "topic-1", icon: "/assets/icons/g1-right-o-wrong.jpg", label: "เกมจริงหรือมั่ว" },
  { id: "topic-6", icon: "/assets/icons/g6-line-sim.jpg", label: "เกมจำลองแชทไลน์" },
  { id: "topic-3", icon: "/assets/icons/g3-ai-o-fake.jpg", label: "เอไอ หรือ ของจริง" },
  { id: "g15", icon: "/images/lessons/category-learning.png", label: "ลองถาม AI" },
  { id: "g16", icon: "/images/lessons/category-learning.png", label: "คิดก่อนโพสต์" },
  { id: "g17", icon: "/images/lessons/category-learning.png", label: "โล่กันโกง" },
];

// รายการวิดีโอ — ดึงจาก videos.json แหล่งเดียวกับหน้าคลิปจริง ไม่พิมพ์ชื่อซ้ำเอง กันข้อมูลสองที่ไม่ตรงกัน
// ไม่มีภาพปกต่อคลิปในโปรเจกต์ จึงใช้ไอคอนกล้องเดียวกับหมวด "วิดีโอ" ซ้ำทุกแถวไปก่อน
// บทที่ตั้ง skip (ยังไม่มีคลิปจริง) ไม่แสดงในรายการ เพราะกดเข้าไปจะข้ามไปเกมทันที
const VIDEOS = getOrderedLessonIds()
  .map((lessonId) => getVideoByLessonId(lessonId))
  .filter((video) => !video.skip)
  .map((video) => ({ id: video.lessonId, icon: "/images/lessons/category-video.png", label: video.clipIntro }));

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

    // โหมดวิจัย: ไม่มีหน้าเลือกโหมด/โหมดอิสระ/เกมสนุก — เข้าสาย "เนื้อเรื่อง" อัตโนมัติเสมอ
    if (progressService.getAppMode() === "research") {
      const targetLesson = firstIncompleteFlowLesson(currentProgress?.stars || {});
      loggingService.logEvent("select_lesson", { lesson_id: targetLesson, mode: "flow" });
      progressService.saveProgress({
        ...currentProgress,
        currentStep: "video",
        currentLessonId: targetLesson,
        learningMode: "flow",
      });
      router.push(`/lessons/${targetLesson}/video`);
      return;
    }

    // เคยเลือกโหมดอิสระค้างไว้ → กลับเข้าหน้าหมวดหมู่เลย ไม่ต้องเลือกโหมดซ้ำ
    if (currentProgress.learningMode === "manual") {
      setActiveSubPage("categories");
    } else {
      setActiveSubPage("modes");
    }

    loggingService.logEvent("lessons_dashboard_view");
    setLoading(false);
  }, [router]);

  // โหมดอิสระ (วิดีโอ): เลือกดูคลิปไหนก่อนก็ได้ ไม่มีการล็อกตามลำดับอีกต่อไป
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

  // โหมดอิสระ (เกมเพื่อการเรียนรู้): เข้าเกมตรงๆ ไม่ผ่านหน้าคลิปนำก่อน
  const handleLearningGameClick = (lessonId: string) => {
    loggingService.logEvent("select_lesson", { lesson_id: lessonId, mode: "manual" });
    const updatedProgress = {
      ...progress,
      currentStep: "game",
      currentLessonId: lessonId,
      learningMode: "manual",
    };
    progressService.saveProgress(updatedProgress);
    router.push(`/lessons/${lessonId}/game`);
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
                icon="/images/mode-selection/story_mode_ico.png"
                body={["การเรียนรู้เรียง", "ต่อไปเรื่อยๆ"]}
                caption={["เรียนรู้ตามลำดับ", "ขั้นตอนเนื้อหาเข้าใจ", "ง่าย"]}
                onClick={handleStartFlowMode}
              />
              <ModeCard
                name="อิสระ"
                icon="/images/mode-selection/free_mode_ico.png"
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

        <div className="shrink-0 px-[24px] pb-action-bar pt-[24px]">
          <BackPillButton onClick={handleBackToModes} />
        </div>
      </div>
    );
  }

  // เกมสนุก (นอกสาย Flow) — ยังไม่มีดีไซน์เฉพาะ จึงใช้ลิสต์การ์ดสไตล์เดียวกับหน้าหมวดหมู่
  if (activeSubPage === "fun-games") {
    return (
      <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
        {/* scroll bar วาดเอง ให้เห็นตลอดเมื่อรายการยาวเกินจอ (native scrollbar บนมือถือซ่อนตัวเอง) */}
        <CustomScrollArea className="min-h-0 flex-1" trackClassName={PAGE_SCROLL_TRACK_CLASS} thumbClassName={SCROLL_THUMB_CLASS}>
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
        </CustomScrollArea>

        <div className="shrink-0 px-[24px] pb-action-bar pt-[24px]">
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
        {/* scroll bar วาดเอง ให้เห็นตลอดเมื่อรายการยาวเกินจอ (native scrollbar บนมือถือซ่อนตัวเอง) */}
        <CustomScrollArea className="min-h-0 flex-1" trackClassName={PAGE_SCROLL_TRACK_CLASS} thumbClassName={SCROLL_THUMB_CLASS}>
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
        </CustomScrollArea>

        <div className="shrink-0 px-[24px] pb-action-bar pt-[24px]">
          <BackPillButton onClick={handleBackToCategories} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
      {/* scroll bar วาดเอง ให้เห็นตลอดเมื่อรายการยาวเกินจอ (native scrollbar บนมือถือซ่อนตัวเอง) */}
      <CustomScrollArea className="min-h-0 flex-1" trackClassName={PAGE_SCROLL_TRACK_CLASS} thumbClassName={SCROLL_THUMB_CLASS}>
        <div className="flex min-h-full flex-col gap-[24px] px-[24px] py-[28px]">
          <p className="text-[28px] font-bold leading-[36px]">เกมเพื่อการเรียนรู้</p>

          <div className="flex w-full flex-col gap-[16px]">
            {LEARNING_GAMES.map((game) => (
              <CategoryCard
                key={game.id}
                icon={game.icon}
                label={game.label}
                onClick={() => handleLearningGameClick(game.id)}
              />
            ))}
          </div>
        </div>
      </CustomScrollArea>

      <div className="shrink-0 px-[24px] pb-action-bar pt-[24px]">
        <BackPillButton onClick={handleBackToCategories} />
      </div>
    </div>
  );
}
