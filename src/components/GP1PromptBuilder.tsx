"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";
import ITEMS from "@/data/gp1-prompt-items.json";

/**
 * GP1 — ขอ AI ให้ถูกคำ (AI Prompt Builder) — PROTOTYPE
 *
 * Spec: docs/gdd/prototype/design-ai-prompt-builder.md. Not assigned a G-number
 * yet (§9 of the doc) — component/data files use the "GP" (Game Prototype)
 * prefix until the team promotes it into the real pipeline. Dev-hub only for
 * now (registered in src/app/dev/games/DevGameHubClient.tsx), not wired into
 * GameShell/lesson flow.
 *
 * result_asset in the data is wired for future real art; until then the
 * result scene renders a CSS/emoji mock-up (same placeholder approach as G4).
 */

type ChoiceType = "correct" | "wrong_context" | "sensitive_pii";

type Choice = {
  text: string;
  type: ChoiceType;
  category?: string;
};

type Slot = {
  id: string;
  label: string;
  order: number;
  choices: Choice[];
};

type PromptItem = {
  id: string;
  character_thought: string;
  prompt_template: string;
  slots: Slot[];
  result_asset: string;
  result_caption: string;
  ai_disclosure: boolean;
  safety_tip: string;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "intro" | "building" | "typing" | "result";

const POOL = ITEMS as PromptItem[];

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// สอนตาม category เฉพาะ (design §7) — ร่วม taxonomy กับ G4 (national-id, home-address)
// บวกหมวดใหม่เฉพาะเกมนี้ (real-person-likeness, full-name-phone)
const CATEGORY_EXPLAIN: Record<string, string> = {
  "real-person-likeness":
    "ถ้าขอให้ AI สร้างภาพหน้าคนจริงโดยไม่ได้รับอนุญาต อาจถูกนำไปใช้ปลอมแปลงหรือสร้างความเข้าใจผิดได้ ลองใช้คำอธิบายทั่วไปแทน เช่น บรรยากาศหรืออารมณ์ของภาพ",
  "national-id":
    "เลขบัตรประชาชนเป็นข้อมูลส่วนตัวสำคัญ ถ้าพิมพ์บอก AI อาจถูกเก็บไว้หรือหลุดออกไปได้ ไม่ควรใส่ในคำสั่งเด็ดขาด",
  "home-address":
    "ที่อยู่บ้านบอกตำแหน่งที่คุณอยู่จริง หากข้อมูลหลุดไปอาจเป็นอันตรายต่อความปลอดภัย ไม่ควรใส่ในคำสั่ง AI",
  "full-name-phone":
    "ชื่อ-นามสกุลจริงและเบอร์โทรศัพท์ทำให้คนอื่นติดต่อหรือสวมรอยเป็นคุณได้ ควรใช้คำเรียกทั่วไปแทน เช่น \"ยาย\" หรือ \"คุณย่า\"",
};

const TEMPLATE_TOKEN = /(\{slot\d+\})/g;
const TOKEN_MATCH = /^\{(slot\d+)\}$/;

export default function GP1PromptBuilder({ onFinish, logEvent }: Props) {
  const item = useMemo(() => POOL[0], []);
  const slots = useMemo(() => [...item.slots].sort((a, b) => a.order - b.order), [item]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0);
  const [filled, setFilled] = useState<(string | null)[]>(() => slots.map(() => null));
  const [firstTryCorrect, setFirstTryCorrect] = useState<boolean[]>(() => slots.map(() => false));
  const [attemptsPerSlot, setAttemptsPerSlot] = useState<number[]>(() => slots.map(() => 0));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [bounce, setBounce] = useState<{ text: string; hint: string } | null>(null);
  const [activeTeach, setActiveTeach] = useState<Choice | null>(null);
  const [lockedFlash, setLockedFlash] = useState<string | null>(null);
  const [dragVisual, setDragVisual] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [showDescription, setShowDescription] = useState(false);

  const slotRef = useRef<HTMLSpanElement | null>(null);
  const dragState = useRef<{ idx: number; startX: number; startY: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const startLogged = useRef(false);

  useEffect(() => {
    // Ref guard: React StrictMode runs effects twice in dev (same pattern as G3/G4)
    if (startLogged.current) return;
    startLogged.current = true;
    logEvent("game_start", { game_id: "gp1" });
  }, [logEvent]);

  const displayedChoices = useMemo(
    () => shuffle(slots[currentSlotIdx]?.choices ?? []),
    [slots, currentSlotIdx]
  );

  useEffect(() => {
    if (!bounce) return;
    const t = setTimeout(() => setBounce(null), 1800);
    return () => clearTimeout(t);
  }, [bounce]);

  useEffect(() => {
    if (!lockedFlash) return;
    const t = setTimeout(() => setLockedFlash(null), 400);
    return () => clearTimeout(t);
  }, [lockedFlash]);

  useEffect(() => {
    if (phase !== "typing") return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setPhase("result"), reduced ? 0 : 1800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result") return;
    logEvent("result_view", { game_id: "gp1", item_id: item.id });
  }, [phase, logEvent, item.id]);

  const stars = useMemo(() => {
    const correctCount = firstTryCorrect.filter(Boolean).length;
    const ratio = correctCount / slots.length;
    return ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
  }, [firstTryCorrect, slots.length]);

  const handlePlace = (choice: Choice) => {
    if (phase !== "building" || activeTeach) return;
    const slot = slots[currentSlotIdx];
    const attemptsSoFar = attemptsPerSlot[currentSlotIdx];

    logEvent("slot_attempt", {
      game_id: "gp1",
      item_id: item.id,
      slot_id: slot.id,
      choice_type: choice.type,
      ...(choice.category ? { category: choice.category } : {}),
      correct: choice.type === "correct",
    });

    if (choice.type === "correct") {
      const attempts = attemptsSoFar + 1;
      setFilled((prev) => {
        const next = [...prev];
        next[currentSlotIdx] = choice.text;
        return next;
      });
      if (attemptsSoFar === 0) {
        setFirstTryCorrect((prev) => {
          const next = [...prev];
          next[currentSlotIdx] = true;
          return next;
        });
      }
      logEvent("slot_complete", { game_id: "gp1", item_id: item.id, slot_id: slot.id, attempts });
      setSelectedIdx(null);
      setBounce(null);

      if (currentSlotIdx >= slots.length - 1) {
        logEvent("prompt_complete", { game_id: "gp1", item_id: item.id });
        setPhase("typing");
      } else {
        setCurrentSlotIdx((i) => i + 1);
      }
      return;
    }

    setAttemptsPerSlot((prev) => {
      const next = [...prev];
      next[currentSlotIdx] = attemptsSoFar + 1;
      return next;
    });
    setSelectedIdx(null);

    if (choice.type === "wrong_context") {
      setBounce({ text: choice.text, hint: `ลองดูคำที่บอก${slot.label}มากกว่านี้นะคะ` });
    } else {
      setActiveTeach(choice);
    }
  };

  const handleCardClick = (idx: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (phase !== "building" || activeTeach) return;
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  };

  const handleCardPointerDown = (idx: number, e: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== "building" || activeTeach) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { idx, startX: e.clientX, startY: e.clientY, moved: false };
  };

  const handleCardPointerMove = (idx: number, e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragState.current;
    if (!d || d.idx !== idx) return;
    const x = e.clientX - d.startX;
    const y = e.clientY - d.startY;
    if (Math.abs(x) + Math.abs(y) > 6) d.moved = true;
    if (d.moved) setDragVisual({ idx, x, y });
  };

  const endDrag = (idx: number, e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragState.current;
    if (!d || d.idx !== idx) return;
    dragState.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture may already be released by the browser — safe to ignore
    }

    if (!d.moved) {
      setDragVisual(null);
      return;
    }

    suppressClick.current = true;
    setDragVisual(null);
    const rect = slotRef.current?.getBoundingClientRect();
    const hit =
      rect &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (hit) {
      handlePlace(displayedChoices[idx]);
    }
  };

  const handleSlotClick = () => {
    if (phase !== "building" || activeTeach) return;
    if (selectedIdx === null) return;
    const choice = displayedChoices[selectedIdx];
    setSelectedIdx(null);
    handlePlace(choice);
  };

  const handleLockedSlotClick = (slotId: string) => {
    setLockedFlash(slotId);
  };

  const handleFinish = () => {
    logEvent("game_complete", { game_id: "gp1", stars, total_slots: slots.length });
    onFinish(stars);
  };

  const currentSlot = slots[currentSlotIdx];

  const renderTemplate = () => {
    const parts = item.prompt_template.split(TEMPLATE_TOKEN);
    return parts.map((part, i) => {
      const m = part.match(TOKEN_MATCH);
      if (!m) return <React.Fragment key={i}>{part}</React.Fragment>;

      const slotId = m[1];
      const idx = slots.findIndex((s) => s.id === slotId);
      if (idx === -1) return null;

      if (idx < currentSlotIdx) {
        return (
          <strong key={i} className="text-[var(--primary-dark)]">
            {filled[idx]}
          </strong>
        );
      }

      if (idx === currentSlotIdx) {
        return (
          <span
            key={i}
            ref={slotRef}
            onClick={handleSlotClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSlotClick();
              }
            }}
            aria-label={`ช่องว่าง: ${slots[idx].label}${selectedIdx !== null ? " — แตะเพื่อวางคำที่เลือก" : ""}`}
            className={`gp1-slot-active inline-flex items-center justify-center min-w-[56px] min-h-[40px] px-3 mx-1 rounded-[var(--radius-lg)] border-2 border-dashed align-middle font-bold text-[var(--primary)] ${
              selectedIdx !== null ? "cursor-pointer bg-[var(--primary-light)]" : ""
            }`}
          >
            ?
          </span>
        );
      }

      return (
        <span
          key={i}
          onClick={() => handleLockedSlotClick(slots[idx].id)}
          className={`inline-flex items-center justify-center min-w-[48px] min-h-[32px] px-2 mx-1 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border)] text-[var(--text-secondary)] opacity-60 align-middle cursor-not-allowed transition-colors ${
            lockedFlash === slots[idx].id ? "bg-[rgba(220,38,38,0.12)] border-[var(--accent-error)]" : ""
          }`}
        >
          ⋯
        </span>
      );
    });
  };

  if (phase === "intro") {
    return (
      <div className="flex flex-col flex-1 min-h-0 justify-between screen-container">
        <div className="content-area justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[64px] select-none">
              👵
            </div>
            <div className="premium-card bg-[var(--bg-card)] p-4 max-w-[320px] relative">
              <p className="text-[clamp(17px,4.8vw,23px)] leading-relaxed text-[var(--text-primary)]">
                {item.character_thought}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setPhase("building")}
          className="btn btn-primary text-[clamp(18px,5vw,24px)] min-h-[64px]"
        >
          <span>แตะเพื่อไปต่อ</span>
          <ArrowRight size={24} />
        </button>
      </div>
    );
  }

  if (phase === "typing") {
    return (
      <div className="flex flex-col flex-1 min-h-0 items-center justify-center screen-container gap-4">
        <Sparkles size={56} className="text-[var(--primary)] motion-safe:animate-pulse" />
        <p className="text-[clamp(17px,4.8vw,23px)] font-bold text-[var(--text-primary)]">
          กำลังสร้างภาพให้...
        </p>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flex flex-col flex-1 min-h-0 justify-between screen-container">
        <div className="scroll-region flex flex-col gap-4">
          <h2 className="text-center text-[clamp(18px,5vw,24px)] font-bold text-[var(--primary-dark)]">
            ✨ AI สร้างภาพให้แล้ว!
          </h2>

          <div className="relative w-full aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden border-[3px] border-[var(--border)] shadow-[var(--shadow-md)] flex flex-col items-center justify-center gap-2 bg-[var(--primary-light)] p-4 text-center">
            <span className="text-[64px] leading-none select-none" aria-hidden="true">
              🌸☀️
            </span>
            <p className="text-[clamp(16px,4.5vw,21px)] font-semibold text-[var(--primary-dark)] leading-snug">
              {item.result_caption}
            </p>

            {item.ai_disclosure && (
              <div className="absolute top-3 left-3 bg-[rgba(15,23,42,0.85)] text-white px-3 py-1.5 rounded-[var(--radius-pill)] text-[clamp(12px,3.5vw,16px)] font-bold border border-white/20 flex items-center gap-1">
                <AlertTriangle size={16} />
                <span>ภาพนี้สร้างโดย AI เพื่อการเรียนรู้</span>
              </div>
            )}
          </div>

          <div className="premium-card bg-[var(--primary-light)] p-4 text-left flex items-start gap-2">
            <ShieldCheck size={24} className="shrink-0 text-[var(--primary-dark)] mt-0.5" />
            <p className="text-[clamp(15px,4.2vw,20px)] text-[var(--text-primary)] leading-relaxed">
              {item.safety_tip}
            </p>
          </div>
        </div>

        <button onClick={handleFinish} className="btn btn-primary text-[clamp(18px,5vw,24px)] min-h-[64px] mt-6">
          <span>ไปต่อ</span>
          <ArrowRight size={24} />
        </button>
      </div>
    );
  }

  // phase === "building"
  return (
    <div className="flex flex-col flex-1 min-h-0 justify-between screen-container">
      <div className="scroll-region flex flex-col gap-4">
        {/* Header: progress dots + audio */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {slots.map((s, idx) => (
              <div
                key={s.id}
                className={`w-3.5 h-3.5 rounded-full ${
                  idx === currentSlotIdx
                    ? "bg-[var(--primary)]"
                    : idx < currentSlotIdx
                      ? "bg-[var(--primary-dark)]"
                      : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (activeTeach) return;
              setShowDescription(true);
            }}
            className="px-3 py-2 rounded-[var(--radius-pill)] border-2 border-[var(--primary)] text-[var(--primary-dark)] cursor-pointer flex items-center gap-1.5 text-[clamp(14px,4vw,18px)] font-bold min-h-[44px] bg-[var(--bg-app)]"
          >
            <Info size={18} />
            <span>ดูสิ่งที่อยากได้</span>
          </button>
        </div>

        {/* Simulated AI app screen */}
        <div className="premium-card bg-[var(--bg-card)] p-4">
          <p className="text-[clamp(12px,3.5vw,16px)] text-[var(--text-secondary)] font-bold mb-2">
            📱 แอป AI (จำลอง)
          </p>
          <p className="text-[clamp(17px,4.8vw,23px)] leading-loose text-[var(--text-primary)]">
            {renderTemplate()}
          </p>
        </div>

        {/* Current slot label + choices */}
        <div className="text-left">
          <span className="text-[clamp(15px,4.2vw,20px)] font-bold text-[var(--text-secondary)]">
            เลือกคำที่ใช่ ใส่ในช่องที่ไฮไลต์: {currentSlot.label}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {displayedChoices.map((choice, idx) => {
            const isBouncing = bounce !== null && bounce.text === choice.text;
            const drag = dragVisual?.idx === idx ? dragVisual : null;
            return (
              <div key={`${currentSlotIdx}-${choice.text}`} className="flex flex-col gap-1">
                <button
                  onClick={() => handleCardClick(idx)}
                  onPointerDown={(e) => handleCardPointerDown(idx, e)}
                  onPointerMove={(e) => handleCardPointerMove(idx, e)}
                  onPointerUp={(e) => endDrag(idx, e)}
                  onPointerCancel={(e) => endDrag(idx, e)}
                  style={
                    drag
                      ? { transform: `translate(${drag.x}px, ${drag.y}px) scale(1.05)`, touchAction: "none" }
                      : { touchAction: "none" }
                  }
                  className={`btn btn-outline text-[clamp(16px,4.5vw,20px)] min-h-[56px] justify-start text-left border-[var(--primary)] text-[var(--primary-dark)] ${
                    drag ? "gp1-card-drag" : "gp1-card-snap"
                  } ${selectedIdx === idx ? "bg-[var(--primary-light)] border-[3px]" : ""} ${
                    isBouncing ? "gp1-shake border-[var(--accent-error)]" : ""
                  }`}
                >
                  <span aria-hidden="true" className="mr-1.5 opacity-60">
                    ⠿
                  </span>
                  {choice.text}
                </button>
                {isBouncing && (
                  <p className="text-[clamp(13px,3.7vw,17px)] text-[var(--accent-error)] flex items-center gap-1">
                    <AlertTriangle size={16} />
                    {bounce?.hint}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[clamp(13px,3.7vw,17px)] text-[var(--text-secondary)] text-center">
          ลากคำ หรือ แตะคำแล้วแตะช่องที่ไฮไลต์ ได้ทั้งสองแบบ
        </p>
      </div>

      {/* Output description popup — recall what the character wants (same content as scene 1) */}
      {showDescription && (
        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center p-6 z-50">
          <div className="premium-card bg-[var(--bg-card)] p-5 max-w-sm w-full text-left">
            <p className="text-[clamp(17px,4.8vw,23px)] leading-relaxed text-[var(--text-primary)] mb-4">
              {item.character_thought}
            </p>
            <button
              onClick={() => setShowDescription(false)}
              className="btn btn-primary text-[clamp(16px,4.5vw,20px)] min-h-[56px] w-full"
            >
              <CheckCircle2 size={22} />
              <span>ปิด</span>
            </button>
          </div>
        </div>
      )}

      {/* Sensitive-data teach card (full-screen) */}
      {activeTeach && (
        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center p-6 z-50">
          <div className="premium-card bg-[var(--bg-card)] p-5 max-w-sm w-full text-left">
            <div className="flex items-center gap-2 mb-3 text-[var(--primary-dark)]">
              <ShieldCheck size={28} />
              <strong className="text-[clamp(17px,4.8vw,23px)]">เดี๋ยวก่อนนะคะ!</strong>
            </div>
            <p className="text-[clamp(15px,4.2vw,20px)] text-[var(--text-primary)] leading-relaxed mb-4">
              {(activeTeach.category && CATEGORY_EXPLAIN[activeTeach.category]) ||
                "ข้อมูลนี้เป็นข้อมูลส่วนตัวที่ไม่ควรบอก AI นะคะ"}
            </p>
            <button
              onClick={() => setActiveTeach(null)}
              className="btn btn-primary text-[clamp(16px,4.5vw,20px)] min-h-[56px] w-full"
            >
              <CheckCircle2 size={22} />
              <span>เข้าใจแล้ว ลองใหม่</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
