"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Globe, Maximize2 } from "lucide-react";
import Button3D from "@/components/Button3D";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import GameAnswerButton from "@/components/GameAnswerButton";
import GameIntro from "@/components/GameIntro";
import GameSolutionCard from "@/components/GameSolutionCard";
import ITEMS from "@/data/g16-post-items.json";

/**
 * G16 — คิดก่อนโพสต์ (Think before you post)
 *
 * Shows a mock "create post" screen (generic social app, no real brand) with a
 * post the player has already typed. The player decides โพสต์เลย / ไม่โพสต์
 * using the same answer-button pair as G6, then sees which parts of the post
 * leak personal info (real names, children's school, hospital room, trip dates…).
 * Some posts are genuinely safe so "never post" isn't always the answer.
 * Each session draws TOTAL_ROUNDS posts at random from the enabled pool.
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Flag = { quote?: string; why: string };

type PostItem = {
  id: string;
  // ปิดไว้ = ไม่ถูกสุ่มเข้าเกม (เก็บชุดเดิมไว้เผื่อเปิดกลับมา)
  enabled: boolean;
  kind: "post" | "comment";
  // null = โพสต์ของผู้เล่นเอง ("บัญชีของท่าน")
  author: { name: string; avatar: string } | null;
  text: string;
  photo: { src: string; alt: string; ai_disclosure: boolean } | null;
  location: string | null;
  reply_to: { author: string; text: string } | null;
  should_post: boolean;
  flags: Flag[];
  safe_reasons: string[];
  tip: string;
};

type Choice = "post" | "hold";

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

const POOL = (ITEMS as PostItem[]).filter((p) => p.enabled);
// จำนวนโพสต์ต่อรอบเท่าเดิม (6) — สุ่มจากคลัง แบ่งโพสต์ได้/ไม่ควรโพสต์ครึ่งต่อครึ่ง
const TOTAL_ROUNDS = 6;

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildDeck = (): PostItem[] => {
  const safeCount = Math.floor(TOTAL_ROUNDS / 2);
  const safe = shuffle(POOL.filter((p) => p.should_post)).slice(0, safeCount);
  const risky = shuffle(POOL.filter((p) => !p.should_post)).slice(0, TOTAL_ROUNDS - safe.length);
  return shuffle([...safe, ...risky]);
};

// Noto Sans Thai Looped reserves tall space above for Thai marks (ascent 1.25em,
// descent 0.35em), so digits sit ~0.09em below the line box's centre — lift them.
const NUMBER_NUDGE = "relative top-[-0.09em]";

const CHOICE_LABEL: Record<Choice, string> = { post: "โพสต์เลย", hold: "ไม่โพสต์" };

// Banner text on GameSolutionCard is 40px — keep each one short.
// Choosing ไม่โพสต์ on a safe post is not wrong (being careful never hurts) but
// isn't the best answer either, so it gets a green card without the full point.
const verdict = (item: PostItem, choice: Choice) => {
  if (!item.should_post) {
    return choice === "hold"
      ? { tone: "correct" as const, banner: "ปลอดภัย", best: true }
      : { tone: "wrong" as const, banner: "ไม่ปลอดภัย", best: false };
  }
  return choice === "post"
    ? { tone: "correct" as const, banner: "โพสต์ได้", best: true }
    : { tone: "correct" as const, banner: "รอบคอบดี", best: false };
};

export default function G16ThinkBeforePost({ onFinish, logEvent }: Props) {
  const [deck] = useState<PostItem[]>(buildDeck);
  const [showHowTo, setShowHowTo] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [autoPaused, setAutoPaused] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const scoreRef = useRef(0);

  const closeViewer = useCallback(() => setViewerOpen(false), []);

  const item = deck[currentIdx];

  // รายงานความคืบหน้าให้ progress bar (AppLayout ฟัง event นี้) — เหมือน G6
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("flowStepProgress", { detail: currentIdx / deck.length }));
  }, [currentIdx, deck.length]);

  const handleChoose = (next: Choice) => {
    if (choice) return;
    setChoice(next);
    const { best } = verdict(item, next);
    if (best) scoreRef.current += 1;
    logEvent("choose_post", {
      game_id: "G16",
      post_id: item.id,
      choice: next,
      should_post: item.should_post,
      is_best: best,
    });
  };

  const handleNext = () => {
    if (currentIdx < deck.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setChoice(null);
      setAutoPaused(false);
      setViewerOpen(false);
      logEvent("enter_post", { game_id: "G16", post_id: deck[nextIdx].id });
    } else {
      const ratio = scoreRef.current / deck.length;
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      logEvent("game_complete", { game_id: "G16", best_choices: scoreRef.current, total: deck.length, stars });
      onFinish(stars);
    }
  };

  if (showHowTo) {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="คิดก่อนโพสต์"
        objective="อ่านโพสต์ที่กำลังจะลงโซเชียล แล้วตัดสินใจว่าควรโพสต์ไหม ระวังข้อมูลส่วนตัวของตัวเอง ครอบครัว และลูกหลาน"
        choices="โพสต์เลย · ไม่โพสต์"
        imageSrc="/assets/icons/g16-posting.png"
        onStart={() => {
          setShowHowTo(false);
          logEvent("game_intro_start", { game_id: "G16" });
        }}
      />
    );
  }

  const isComment = item.kind === "comment";
  const result = choice ? verdict(item, choice) : null;

  return (
    <div className={`gp-compact flex min-h-0 flex-1 flex-col ${choice ? "bg-white" : "bg-[#E8EAF3]"}`}>
      {!choice || !result ? (
        <div className="flex min-h-0 flex-1 flex-col gp-px-24 gp-pt-20">
          <p className="gp-mb-12 shrink-0 text-center gp-type-button text-[#4B4B4B]">
            {isComment ? "ความเห็น" : "โพสต์"}ที่ {currentIdx + 1} จาก {deck.length} — ควรโพสต์ไหม?
          </p>

          {/* กรอบหน้าสร้างโพสต์จำลอง — ไม่มีปุ่มปิด/ย้อนกลับ/ปุ่มโพสต์ กันผู้สูงอายุเข้าใจผิดว่ากดได้จริง
              การตัดสินใจจริงอยู่ที่ปุ่มใหญ่ด้านล่าง */}
          <div
            className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px] border-2 border-b-0 border-solid border-[#D9D9D9] bg-white`}
          >
            <div className="flex gp-h-58 shrink-0 items-center justify-center border-b-2 border-solid border-[#D9D9D9] gp-px-16 text-center">
              <span className="gp-type-button text-[#4B4B4B]">
                {isComment ? "แสดงความคิดเห็น" : "สร้างโพสต์"}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto gp-px-16 gp-py-16">
              <div className="flex min-h-full flex-col gp-gap-14">
                {item.reply_to && (
                  <div className="rounded-[16px] border-2 border-solid border-[#E5E7EB] bg-[#F3F4F6] gp-px-14 gp-py-12">
                    <p className="gp-type-button text-[#1a1a1a]">{item.reply_to.author}</p>
                    <p className="gp-mt-4 gp-type-body text-[#4B4B4B]">{item.reply_to.text}</p>
                  </div>
                )}

                <div className="flex items-center gp-gap-12">
                  <div aria-hidden="true" className="flex gp-size-52 shrink-0 items-center justify-center rounded-full bg-[#FDE68A] gp-text-30" data-type-exempt="avatar emoji">
                    {item.author?.avatar ?? "👵"}
                  </div>
                  <div className="min-w-0">
                    <p className="gp-type-button text-[#1a1a1a]">
                      {item.author?.name ?? "บัญชีของท่าน"}
                      {item.location && (
                        <span className="font-normal text-[#4B4B4B]"> — อยู่ที่ 📍 {item.location}</span>
                      )}
                    </p>
                    <span className="gp-mt-4 inline-flex items-center gp-gap-6 rounded-[8px] bg-[#E5E7EB] gp-px-8 gp-py-2 gp-type-body text-[#4B4B4B]">
                      <Globe size={18} aria-hidden="true" /> สาธารณะ
                    </span>
                  </div>
                </div>

                <p className="whitespace-pre-line gp-type-body-lg text-[#1a1a1a]">
                  {item.text}
                  <span aria-hidden="true" className="ml-[2px] inline-block gp-h-26 w-[2px] translate-y-[5px] bg-[#1877F2] [animation:g16Caret_1s_steps(1)_infinite]" />
                </p>

                {/* แตะรูปเพื่อดูเต็มจอ — รายละเอียดที่ต้องสังเกต (ชื่อบนเสื้อ, ป้ายข้อมือ) ตัวเล็กในกรอบโพสต์ */}
                {item.photo && (
                  <button
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    className="relative block w-full cursor-pointer overflow-hidden rounded-[16px] border-2 border-solid border-[#E5E7EB] p-0"
                    aria-label={`ดูรูปเต็มจอ: ${item.photo.alt}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.photo.src} alt={item.photo.alt} className="block h-auto w-full" />
                    <span
                      aria-hidden="true"
                      className="absolute bottom-[8px] right-[8px] flex gp-size-40 items-center justify-center rounded-full bg-[rgba(15,23,42,0.7)] text-white"
                    >
                      <Maximize2 size={22} />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <GameSolutionCard
          tone={result.tone}
          banner={result.banner}
          heading={item.should_post ? "ทำไมโพสต์นี้โพสต์ได้" : "จุดที่ไม่ควรโพสต์"}
          onReadingChange={setAutoPaused}
        >
          <p className="gp-mb-16 font-semibold">ท่านเลือก: {CHOICE_LABEL[choice]}</p>

          {item.should_post ? (
            <>
              <ol className="flex flex-col gp-gap-12">
                {item.safe_reasons.map((reason, i) => (
                  <li key={i} className="flex gp-gap-10 rounded-[12px] bg-[#f0fdf4] gp-px-12 gp-py-12">
                    <span className="flex gp-size-32 shrink-0 items-center justify-center rounded-full bg-[var(--accent-success)] gp-type-button text-white">
                      <span className={NUMBER_NUDGE}>{i + 1}</span>
                    </span>
                    <p className="min-w-0">{reason}</p>
                  </li>
                ))}
              </ol>
              {choice === "hold" && <p className="gp-mt-16">การระวังไว้ก่อนเป็นเรื่องดี แต่โพสต์แบบนี้โพสต์ได้เลยค่ะ</p>}
            </>
          ) : (
            <ol className="flex flex-col gp-gap-12">
              {item.flags.map((flag, i) => (
                <li key={i} className="flex gp-gap-10 rounded-[12px] bg-[#fef2f2] gp-px-12 gp-py-12">
                  <span className="flex gp-size-32 shrink-0 items-center justify-center rounded-full bg-[var(--accent-error)] gp-type-button text-white">
                    <span className={NUMBER_NUDGE}>{i + 1}</span>
                  </span>
                  <div className="min-w-0">
                    {flag.quote && (
                      <p className="gp-mb-4 rounded-[8px] bg-white gp-px-8 gp-py-2 font-semibold text-[var(--accent-error)]">
                        “{flag.quote}”
                      </p>
                    )}
                    <p>{flag.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <p className="gp-mt-26 gp-type-h3">คิดก่อนโพสต์</p>
          <p className="gp-mt-8">{item.tip}</p>

          {/* นโยบาย ai_disclosure — แจ้งหลังหน้าเฉลยเสมอ (docs/gdd/00-concept.md §5) */}
          {item.photo?.ai_disclosure && (
            <p className="gp-mt-20 rounded-[12px] bg-[#F3F4F6] gp-px-12 gp-py-8 gp-type-body text-[#4B4B4B]">
              ⚠️ รูปในโพสต์นี้สร้างโดย AI เพื่อการเรียนรู้ บุคคลและชื่อในรูปไม่มีอยู่จริง
            </p>
          )}
        </GameSolutionCard>
      )}

      {/* ปุ่มคู่เดียวกับ G6 (เขียว/เหลือง) เปลี่ยนข้อความให้ตรงกับการกระทำ + "ไม่โพสต์" ใช้ไอคอน ✗ แทน ❓ */}
      <div className="shrink-0">
        {!choice ? (
          <div className="flex gp-gap-8 gp-px-24 gp-pb-action-bar gp-pt-36">
            <GameAnswerButton
              tone="green"
              iconSrc="/images/games/answer-true.svg"
              label={CHOICE_LABEL.post}
              onClick={() => handleChoose("post")}
            />
            <GameAnswerButton
              tone="yellow"
              iconSrc="/images/games/answer-fake.svg"
              label={CHOICE_LABEL.hold}
              onClick={() => handleChoose("hold")}
            />
          </div>
        ) : (
          <div className="gp-px-24 gp-pb-action-bar gp-pt-22">
            <Button3D
              key={`g16-next-${currentIdx}`}
              onClick={handleNext}
              onAutoAdvance={handleNext}
              autoAdvanceMs={30000}
              autoAdvancePaused={autoPaused}
            >
              กดเพื่อไปต่อ
            </Button3D>
          </div>
        )}
      </div>

      {viewerOpen && item.photo && (
        <FullscreenImageViewer src={item.photo.src} alt={item.photo.alt} caption={null} onClose={closeViewer} />
      )}

      <style>{`
        @keyframes g16Caret { 0% { opacity: 1; } 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { [class*="g16Caret"] { animation: none !important; } }
      `}</style>
    </div>
  );
}
