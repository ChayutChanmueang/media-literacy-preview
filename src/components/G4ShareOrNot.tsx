"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import ITEMS from "@/data/g4-privacy-items.json";

/**
 * G4 — แชร์ดีไหม? (Privacy & Online Safety Game) — PROTOTYPE (US-GAME-04)
 *
 * Spec: docs/gdd/design-g4.md. Art is placeholder (emoji + CSS), no real image
 * assets yet — the `image`/`image_alt` fields in the data are wired for when
 * real illustrations replace the emoji.
 *
 * The one rule that shapes the logic: the third choice "ไม่แน่ใจ / ต้องเช็กก่อน"
 * is never a wrong answer. On a "no_share" item it counts as safe behaviour for
 * the star tally (design §6); on a "safe_share" item it is praised but does not
 * earn a safe-behaviour point (being over-cautious about a harmless share).
 */

type SafeAnswer = "safe_share" | "no_share";
type Choice = SafeAnswer | "unsure";

type PrivacyItem = {
  id: string;
  emoji: string;
  image: string;
  image_alt: string;
  prompt: string;
  safe_answer: SafeAnswer;
  category: string;
  explain: string;
  impact_tags: string[];
  ai_disclosure: boolean;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

const POOL = ITEMS as PrivacyItem[];

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const ANSWER_LABEL: Record<SafeAnswer, string> = {
  safe_share: "แชร์ได้ปลอดภัย",
  no_share: "ไม่ควรแชร์เด็ดขาด",
};

// เกณฑ์วิเคราะห์ 3 ข้อ ที่การ์ด "ไม่แน่ใจ" ใช้สอนวิธีตัดสินใจ (design §6)
const CRITERIA = [
  "ในภาพมีข้อมูลที่ระบุตัวตนเราไหม (ชื่อ-นามสกุล, เลขบัตร, เลขบัญชี)",
  "ในภาพบอกพิกัดบ้านหรือที่อยู่ของเราหรือหลานไหม",
  "ถ้าภาพนี้ตกไปถึงมิจฉาชีพ จะเกิดความเสียหายได้ไหม",
];

export default function G4ShareOrNot({ onFinish, logEvent }: Props) {
  const items = useMemo(() => shuffle(POOL), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [safeCount, setSafeCount] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const startLogged = useRef(false);
  useEffect(() => {
    // Ref guard: React StrictMode runs effects twice in dev, which would double
    // the game_start entry in the QA event panel
    if (startLogged.current) return;
    startLogged.current = true;
    logEvent("game_start", { game_id: "g4" });
  }, [logEvent]);

  const item = items[currentIdx];
  const isAnswered = selected !== null;
  const isCorrect = selected === item.safe_answer;
  const isCautious = selected === "unsure";

  const handleSpeak = (text: string) => {
    const synth = synthRef.current;
    if (!synth) return;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      logEvent("toggle_audio", { game_id: "g4", item_id: item.id, action: "mute" });
      return;
    }

    logEvent("toggle_audio", { game_id: "g4", item_id: item.id, action: "play" });
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  const handleAnswer = (choice: Choice) => {
    setSelected(choice);
    const correct = choice === item.safe_answer;
    // "ไม่แน่ใจ" นับเป็นพฤติกรรมปลอดภัยเฉพาะกับโจทย์ที่คำตอบคือ "ไม่ควรแชร์"
    const safeBehaviour = correct || (choice === "unsure" && item.safe_answer === "no_share");
    if (safeBehaviour) setSafeCount((prev) => prev + 1);

    logEvent("answer", {
      game_id: "g4",
      item_id: item.id,
      category: item.category,
      choice,
      correct,
    });
    logEvent("feedback_view", { game_id: "g4", item_id: item.id, category: item.category });
  };

  const handleNext = () => {
    synthRef.current?.cancel();
    setSpeaking(false);

    if (currentIdx < items.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelected(null);
      logEvent("enter_item", { game_id: "g4", item_id: items[nextIdx].id });
    } else {
      const ratio = safeCount / items.length;
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      logEvent("game_complete", { game_id: "g4", stars, total_items: items.length });
      onFinish(stars);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-between">
      <div className="scroll-region flex flex-col gap-4">
        {/* Header: progress dots + audio */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className={`w-3.5 h-3.5 rounded-full ${
                  idx === currentIdx
                    ? "bg-[var(--primary)]"
                    : idx < currentIdx
                      ? "bg-[var(--primary-dark)]"
                      : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => handleSpeak(isAnswered ? item.explain : item.prompt)}
            className={`px-3 py-2 rounded-[var(--radius-pill)] border-2 border-[var(--primary)] text-[var(--primary-dark)] cursor-pointer flex items-center gap-1.5 text-[clamp(11px,3.48vw,16px)] font-bold min-h-[44px] ${
              speaking ? "bg-[var(--primary-light)]" : "bg-[var(--bg-app)]"
            }`}
          >
            {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>เสียงอ่าน</span>
          </button>
        </div>

        {/* Scenario image placeholder (emoji until real assets arrive) */}
        <div
          className="relative w-full aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden border-[3px] border-[var(--border)] shadow-[var(--shadow-md)] flex items-center justify-center bg-[var(--primary-light)]"
          role="img"
          aria-label={item.image_alt}
        >
          <span className="text-[clamp(77px,23.91vw,110px)] leading-none select-none" aria-hidden="true">
            {item.emoji}
          </span>

          {/* AI disclosure badge — shows once real assets set ai_disclosure=true */}
          {item.ai_disclosure && (
            <div className="absolute top-3 left-3 bg-[rgba(15,23,42,0.85)] text-white px-3 py-1.5 rounded-[var(--radius-pill)] text-[clamp(10px,3.04vw,14px)] font-bold border border-white/20">
              ⚠️ สื่อนี้สร้างโดย AI เพื่อการเรียนรู้
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="text-left">
          <span className="text-[clamp(11px,3.48vw,16px)] text-[var(--text-secondary)] font-bold">คำถาม:</span>
          <p className="text-[clamp(15px,4.78vw,22px)] font-bold leading-snug">{item.prompt}</p>
        </div>

        {/* Choices */}
        {!isAnswered ? (
          <div className="flex flex-col gap-3 mt-1">
            <button
              onClick={() => handleAnswer("safe_share")}
              className="btn btn-outline text-[clamp(15px,4.78vw,22px)] min-h-[64px] border-[var(--accent-success)] text-[var(--accent-success)]"
            >
              ✓ แชร์ได้ปลอดภัย
            </button>
            <button
              onClick={() => handleAnswer("no_share")}
              className="btn btn-outline text-[clamp(15px,4.78vw,22px)] min-h-[64px] border-[var(--accent-error)] text-[var(--accent-error)]"
            >
              ✗ ไม่ควรแชร์เด็ดขาด
            </button>
            <button
              onClick={() => handleAnswer("unsure")}
              className="btn btn-outline text-[clamp(15px,4.78vw,22px)] min-h-[64px] border-[#b45309] text-[#b45309]"
            >
              ❓ ไม่แน่ใจ / ต้องเช็กก่อน
            </button>
          </div>
        ) : (
          <div className="mt-1 [animation:fadeIn_0.3s_ease-out]">
            {/* Verdict header */}
            <div
              className={`flex items-center gap-3 justify-center mb-3 ${
                isCorrect
                  ? "text-[var(--accent-success)]"
                  : isCautious
                    ? "text-[var(--primary-dark)]"
                    : "text-[var(--accent-error)]"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 size={28} />
                  <strong className="text-[clamp(15px,4.78vw,22px)]">ถูกต้อง!</strong>
                </>
              ) : isCautious ? (
                <>
                  <ShieldCheck size={28} />
                  <strong className="text-[clamp(15px,4.78vw,22px)]">รอบคอบมาก!</strong>
                </>
              ) : (
                <>
                  <AlertTriangle size={28} />
                  <strong className="text-[clamp(15px,4.78vw,22px)]">ลองมาดูกันนะ</strong>
                </>
              )}
            </div>

            <div className="premium-card bg-[var(--primary-light)] p-4 text-left">
              {/* When cautious, praise + reveal the safe answer first */}
              {isCautious && (
                <>
                  <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--text-primary)] leading-relaxed mb-2">
                    การหยุดคิดว่า &ldquo;ไม่แน่ใจ&rdquo; ก่อนแชร์ คือทักษะที่ปลอดภัยที่สุด
                    ถ้าไม่แน่ใจ อย่าเพิ่งแชร์
                  </p>
                  <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--primary-dark)] font-bold mb-2">
                    คำตอบที่ปลอดภัยของข้อนี้คือ: {ANSWER_LABEL[item.safe_answer]}
                  </p>
                </>
              )}

              <strong className="text-[clamp(13px,3.91vw,18px)] block mb-1.5 text-[var(--primary-dark)]">
                {item.safe_answer === "no_share" ? "ทำไมไม่ควรแชร์:" : "ทำไมแชร์ได้:"}
              </strong>
              <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--text-primary)] leading-relaxed">
                {item.explain}
              </p>

              {/* Impact chips (no_share items only) */}
              {item.impact_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.impact_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[clamp(10px,3.04vw,14px)] font-bold px-2.5 py-1 rounded-[var(--radius-pill)] bg-[rgba(220,38,38,0.12)] text-[var(--accent-error)]"
                    >
                      ⚠️ {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Decision criteria on the cautious card */}
              {isCautious && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <strong className="text-[clamp(11px,3.48vw,16px)] block mb-1.5 text-[var(--primary-dark)]">
                    ก่อนแชร์ทุกครั้ง ลองถามตัวเอง 3 ข้อ:
                  </strong>
                  <ul className="text-[clamp(11px,3.48vw,16px)] text-[var(--text-primary)] leading-relaxed list-none flex flex-col gap-1">
                    {CRITERIA.map((c, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden="true">{i + 1}.</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hotline for no_share items */}
              {item.safe_answer === "no_share" && (
                <p className="text-[clamp(10px,3.26vw,15px)] text-[var(--text-secondary)] mt-3">
                  หากข้อมูลส่วนตัวหลุดหรือถูกนำไปใช้ โทรปรึกษา{" "}
                  <strong className="text-[var(--primary-dark)]">1441</strong> (ตำรวจไซเบอร์)
                  หรือ <strong className="text-[var(--primary-dark)]">1212</strong>{" "}
                  (ศูนย์ช่วยเหลือออนไลน์) ได้
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        className="btn btn-primary text-[clamp(15px,4.78vw,22px)] min-h-[64px] mt-6"
        disabled={!isAnswered}
      >
        <span>{currentIdx < items.length - 1 ? "ข้อถัดไป" : "เสร็จสิ้นบทเรียน"}</span>
        <ArrowRight size={24} />
      </button>
    </div>
  );
}
