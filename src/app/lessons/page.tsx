"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { progressService, type UserProgress } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import { firstIncompleteFlowLesson } from "@/lib/flow";
import { useIsClient } from "@/lib/useIsClient";
import { notoLoopedThai } from "@/lib/fonts";
import CustomScrollArea from "@/components/CustomScrollArea";
import { PAGE_SCROLL_TRACK_CLASS, SCROLL_THUMB_CLASS } from "@/lib/scrollbarStyles";
import { getOrderedLessonIds, getVideoByLessonId } from "@/lib/videos";

// 3D press shared by the cards and back button below — same feel as Button3D: the grey base is its own
// layer exactly 8px under the face (so it stays visible however tall the face grows with its text),
// the face slides down over it in 90ms, and the base hides only once fully covered (no grey sliver at
// the rounded corners) and comes back at once on release. Face (children) carries the white fill,
// the #D9D9D9 2px border and the rounding; baseRadius must match that rounding.
// depth: how far below the face the base shows (8px like Button3D; the mode cards use Figma's 2px shadow).
// Full class strings per depth so Tailwind can see them.
const PRESS_DEPTH = {
  8: { pad: "pb-[8px]", base: "top-[8px]", press: "group-active:translate-y-[8px]" },
  2: { pad: "pb-[2px]", base: "top-[2px]", press: "group-active:translate-y-[2px]" },
} as const;

function Press3D({
  onClick,
  className = "",
  baseRadius,
  depth = 8,
  children,
}: {
  onClick: () => void;
  className?: string;
  baseRadius: string;
  depth?: keyof typeof PRESS_DEPTH;
  children: React.ReactNode;
}) {
  const d = PRESS_DEPTH[depth];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block cursor-pointer border-0 bg-transparent p-0 ${d.pad} text-left ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 ${d.base} ${baseRadius} bg-[#D9D9D9] transition-opacity duration-0 group-active:opacity-0 group-active:delay-[90ms]`}
      />
      <span className={`relative block transition-transform duration-[90ms] ease-out ${d.press}`}>
        {children}
      </span>
    </button>
  );
}

// Figma node 3347:15420 "เลือกโหมด1" — การ์ดเลือกโหมด 352×256 (คลิกได้ทั้งใบ ไม่มีปุ่มยืนยันแยก):
// ภาพซ้าย (ห่างขอบ 20) · ชื่อโหมด + คำอธิบาย กึ่งกลางแนวตั้ง (คอลัมน์ 148) · ลูกศรฟ้า 44px มุมขวาล่าง (ห่างขอบ 20)
// The image slot keeps Figma's size and crop (art = the image's box inside the slot, as % of the slot) and
// shrinks with its aspect ratio on narrow phones, so the text column never has to re-wrap.
function ModeCard({
  name,
  body,
  art,
  onClick,
}: {
  name: string;
  /** ขึ้นบรรทัดใหม่เองตามความกว้างคอลัมน์ข้อความ (148px) */
  body: string;
  art: {
    src: string;
    /** source image size (px) — for next/image */
    width: number;
    height: number;
    /** Figma slot size (px) */
    slotW: number;
    slotH: number;
    /** image box inside the slot, % of the slot (Figma's crop) */
    left: number;
    top: number;
    w: number;
    h: number;
  };
  onClick: () => void;
}) {
  return (
    <Press3D onClick={onClick} className="w-full max-w-[352px]" baseRadius="rounded-[20px]" depth={2}>
      {/* min-h, not h: if the text ever needs more room the card grows, never clips */}
      <div className="relative flex min-h-[256px] items-center gap-[20px] rounded-[20px] border-2 border-solid border-[#D9D9D9] bg-white py-[20px] pl-[20px] pr-[16px]">
        <div
          className="relative min-w-0 flex-1 overflow-hidden"
          style={{ maxWidth: art.slotW, aspectRatio: `${art.slotW} / ${art.slotH}` }}
          aria-hidden="true"
        >
          <Image
            src={art.src}
            alt=""
            width={art.width}
            height={art.height}
            sizes={`${Math.round((art.slotW * art.w) / 100)}px`}
            className="absolute max-w-none"
            style={{ left: `${art.left}%`, top: `${art.top}%`, width: `${art.w}%`, height: `${art.h}%` }}
          />
        </div>
        <div className="w-[148px] shrink-0 text-[#4B4B4B]">
          <p className="text-[28px] font-bold leading-[36px]">{name}</p>
          <p className="text-[20px] font-normal leading-[30px]">{body}</p>
        </div>
        {/* decorative: the whole card is the button */}
        {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG from the Figma design */}
        <img
          src="/images/mode-selection/mode_arrow.svg"
          alt=""
          aria-hidden="true"
          width={44}
          height={44}
          className="absolute bottom-[18px] right-[18px] block"
        />
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
  { id: "learning", icon: "/assets/icons/edu-game.png", label: "เกมเพื่อการเรียนรู้" },
  { id: "fun", icon: "/assets/icons/fun-game.png", label: "เกมสนุก" },
  { id: "video", icon: "/images/lessons/category-video.png", label: "วิดีโอ" },
] as const;

// เกมสนุก (นอกสาย Flow) — G13 + G18–G20 (เดิม prototype GP7–GP9) เปิดเฉพาะโหมดอิสระ
// G18–G20 (รวมรุ่นทดลอง G20K) มีไอคอนเฉพาะเกมแล้ว
const FUN_GAMES = [
  { id: "flow-g13", icon: "/assets/icons/g13-ice-cream.jpg", label: "ต่อไอติมฝึกสมอง" },
  { id: "g18", icon: "/assets/icons/g18-simon.png", label: "จำให้ขึ้นใจ" },
  { id: "g19", icon: "/assets/icons/g19-fruit-match.png", label: "เรียงผลไม้" },
  { id: "g20", icon: "/assets/icons/g20-veggie-tross.png", label: "ผักบุ้งลอยฟ้า" },
  // รุ่นทดลอง (ไม่มีลูกศรแรงโยน เล็งด้วยจุดวิถีโยน) ให้ผู้ทดสอบเล่นเทียบกับ G20 — ชื่อมี "(ทดลอง)" กำกับ
  { id: "g20k", icon: "/assets/icons/g20-veggie-tross.png", label: "ผักบุ้งลอยฟ้า (ทดลอง)" },
];

// Figma node "เกมเพื่อการเรียนรู้" — mockup มี 3 แถว (แถวสุดท้ายซ้ำข้อความแถวแรกในต้นฉบับ ดูเป็น
// placeholder พลาด) ใช้ 3 เกมที่มีอยู่จริงในสาย Flow แทน (G2/G5 ยังเล่นได้จาก /dev/games เท่านั้น)
// + G15–G17 (เดิม prototype GP3/GP4/GP6) เปิดเฉพาะโหมดอิสระ ไม่อยู่ในสาย Flow/โหมดวิจัย
const LEARNING_GAMES = [
  { id: "topic-1", icon: "/assets/icons/g1-right-o-wrong.jpg", label: "เกมจริงหรือมั่ว" },
  { id: "topic-6", icon: "/assets/icons/g6-line-sim.jpg", label: "เกมจำลองแชทไลน์" },
  { id: "topic-3", icon: "/assets/icons/g3-ai-o-fake.jpg", label: "เอไอ หรือ ของจริง" },
  { id: "g15", icon: "/assets/icons/g15-ask-ai.png", label: "ลองถาม AI" },
  { id: "g16", icon: "/assets/icons/g16-posting.png", label: "คิดก่อนโพสต์" },
  { id: "g17", icon: "/assets/icons/g17-breaker.png", label: "โล่กันโกง" },
];

// รายการวิดีโอ — ดึงจาก videos.json แหล่งเดียวกับหน้าคลิปจริง ไม่พิมพ์ชื่อซ้ำเอง กันข้อมูลสองที่ไม่ตรงกัน
// ไม่มีภาพปกต่อคลิปในโปรเจกต์ จึงใช้ไอคอนกล้องเดียวกับหมวด "วิดีโอ" ซ้ำทุกแถวไปก่อน
// บทที่ตั้ง skip (ยังไม่มีคลิปจริง) ไม่แสดงในรายการ เพราะกดเข้าไปจะข้ามไปเกมทันที
const VIDEOS = getOrderedLessonIds()
  .map((lessonId) => getVideoByLessonId(lessonId))
  .filter((video) => !video.skip)
  .map((video) => ({ id: video.lessonId, icon: "/images/lessons/category-video.png", label: video.clipIntro }));

// แสดง dashboard ได้เมื่อยินยอมแล้ว และไม่ใช่โหมดวิจัย (ซึ่ง effect ด้านล่างพาเข้าสายเนื้อเรื่องอัตโนมัติ)
function canShowDashboard() {
  const session = progressService.getOrCreateSession();
  if (!session?.consentGiven || !session?.ageGroup) return false;
  return progressService.getAppMode() !== "research";
}

export default function LessonSelectorPage() {
  const router = useRouter();
  const isClient = useIsClient();

  useEffect(() => {
    const session = progressService.getOrCreateSession();
    if (!session || !session.consentGiven || !session.ageGroup) {
      router.push("/consent");
      return;
    }

    const currentProgress = progressService.getProgress();

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

    loggingService.logEvent("lessons_dashboard_view");
  }, [router]);

  if (!isClient || !canShowDashboard()) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังโหลดแผนผังบทเรียน...</span>
      </div>
    );
  }

  return <LessonSelector />;
}

// Rendered only on the client (after the guard above), so state can initialise straight from progressService.
function LessonSelector() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress>(() => progressService.getProgress());
  // เคยเลือกโหมดอิสระค้างไว้ → กลับเข้าหน้าหมวดหมู่เลย ไม่ต้องเลือกโหมดซ้ำ
  const [activeSubPage, setActiveSubPage] = useState<"modes" | "categories" | "lessons" | "fun-games" | "videos">(
    () => (progress.learningMode === "manual" ? "categories" : "modes"),
  );

  // โหมดอิสระ (วิดีโอ): เลือกดูคลิปไหนก่อนก็ได้ ไม่มีการล็อกตามลำดับอีกต่อไป
  const handleGameClick = (lessonId: string) => {
    loggingService.logEvent("select_lesson", { lesson_id: lessonId, mode: "manual" });
    const updatedProgress: UserProgress = {
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
    const updatedProgress: UserProgress = {
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

    const updatedProgress: UserProgress = {
      ...progress,
      currentStep: "video",
      currentLessonId: targetLesson,
      learningMode: "flow",
    };
    progressService.saveProgress(updatedProgress);

    router.push(`/lessons/${targetLesson}/video`);
  };

  const handleStartManualMode = () => {
    const updatedProgress: UserProgress = {
      ...progress,
      learningMode: "manual",
    };
    progressService.saveProgress(updatedProgress);
    setProgress(updatedProgress);
    setActiveSubPage("categories");
  };

  const handleBackToModes = () => {
    const updatedProgress: UserProgress = {
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
    const updatedProgress: UserProgress = {
      ...progress,
      currentStep: "game",
      currentLessonId: gameId,
      learningMode: "manual",
    };
    progressService.saveProgress(updatedProgress);
    router.push(`/lessons/${gameId}/game`);
  };

  if (activeSubPage === "modes") {
    return (
      <div className={`${notoLoopedThai.className} flex min-h-0 flex-1 flex-col bg-white text-[#4B4B4B]`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center gap-[36px] px-[24px] py-[36px]">
            <p className="w-full max-w-[352px] text-center text-[28px] font-bold leading-[36px]">
              โปรดเลือกรูปแบบการเรียนรู้ของคุณ
            </p>

            <div className="flex w-full flex-col items-center gap-[36px]">
              <ModeCard
                name="เนื้อเรื่อง"
                body="เรียนรู้ตามลำดับขั้นตอนเนื้อหาเข้าใจง่าย"
                // Figma "image 27": 132×152 slot, image at (−1.5%, 5.2%) sized 103% × 89.6%
                art={{
                  src: "/images/mode-selection/story_mode_books.png",
                  width: 600,
                  height: 601,
                  slotW: 132,
                  slotH: 152,
                  left: -1.5,
                  top: 5.2,
                  w: 103,
                  h: 89.6,
                }}
                onClick={handleStartFlowMode}
              />
              <ModeCard
                name="อิสระ"
                body="เลือกหัวข้อที่สนใจเรียนรู้ด้วยตัวเอง"
                // Figma "image 28": 136×208 slot, image at (−9%, −7.87%) sized 118% × 115.73%
                art={{
                  src: "/images/mode-selection/free_mode_signpost.png",
                  width: 736,
                  height: 1104,
                  slotW: 136,
                  slotH: 208,
                  left: -9,
                  top: -7.87,
                  w: 118,
                  h: 115.73,
                }}
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
