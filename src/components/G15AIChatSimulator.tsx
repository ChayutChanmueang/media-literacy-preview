"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Menu,
  Paperclip,
  SquarePen,
  Sparkles,
} from "lucide-react";
import FullscreenImageViewer from "@/components/FullscreenImageViewer";
import ITEMS from "@/data/g15-chat-items.json";

/**
 * G15 — ลองถาม AI (Generative AI chat simulator)
 *
 * Mock of a generic AI chatbot screen (no real brand). Player taps one of 3
 * suggested questions drawn from the pool; the "AI" thinks, then streams a
 * scripted answer that mirrors what a real assistant would say. The asked chip
 * is replaced by an unseen question so 3 choices stay on screen. After 3 asks the player
 * gets READING_MS to read, then the end page with a button back to the hub.
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type ChatImage = { src: string; alt: string };

type ChatItem = {
  id: string;
  chip_label: string;
  question: string;
  image: ChatImage | null;
  thinking_steps: string[];
  answer: string[];
  takeaway_icon: string;
  takeaway_title: string;
  takeaway_text: string;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
  onExit?: () => void;
};

type Stage = "idle" | "thinking" | "streaming" | "reading" | "end";

type Inline = { text: string; bold: boolean };
type Block = { kind: "p" | "li"; parts: Inline[]; length: number };

const POOL = ITEMS as ChatItem[];

const THINKING_STEP_MS = 1300;
const STREAM_TICK_MS = 35;
const STREAM_CHARS_PER_TICK = 2;
const READING_MS = 15000;
// Scrolling has no "release" event — resume the reading timer this long after the last scroll.
const SCROLL_RESUME_MS = 1500;
const CHOICE_COUNT = 3;
const QUESTIONS_TO_ASK = 3;

// Fisher–Yates — sort(() => Math.random() - 0.5) is biased toward the original order.
const shuffle = <T,>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// Thai vowel/tone marks that sit on the previous consonant — never stop the
// stream right before one or it renders as a floating mark for a frame.
const THAI_COMBINING = /[ัิ-ฺ็-๎]/;

// "- " prefix = bullet, "**x**" = bold. Enough markup for the scripted answers.
const parseAnswer = (lines: string[]): Block[] =>
  lines.map((line) => {
    const kind = line.startsWith("- ") ? "li" : "p";
    const body = kind === "li" ? line.slice(2) : line;
    const parts = body
      .split("**")
      .map((text, i) => ({ text, bold: i % 2 === 1 }))
      .filter((part) => part.text.length > 0);
    return { kind, parts, length: parts.reduce((sum, p) => sum + p.text.length, 0) };
  });

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function G15AIChatSimulator({ onFinish, logEvent, onExit }: Props) {
  const parsed = useMemo(
    () =>
      Object.fromEntries(
        POOL.map((item) => {
          const blocks = parseAnswer(item.answer);
          const flat = blocks.flatMap((b) => b.parts.map((p) => p.text)).join("");
          return [item.id, { blocks, flat }];
        })
      ) as Record<string, { blocks: Block[]; flat: string }>,
    []
  );

  // Whole pool shuffled once; the first CHOICE_COUNT fill the chips, the rest
  // wait in line to replace whichever chip the player taps.
  const [queue] = useState<ChatItem[]>(() => shuffle(POOL));
  const [choices, setChoices] = useState<ChatItem[]>(() => queue.slice(0, CHOICE_COUNT));
  const [nextInQueue, setNextInQueue] = useState(CHOICE_COUNT);
  const [asked, setAsked] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [viewerImage, setViewerImage] = useState<ChatImage | null>(null);
  // Reading timer pauses while the player holds a finger down or scrolls —
  // slower readers get as long as they need without a pause button.
  const [holding, setHolding] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const readingPaused = holding || scrolling;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickToBottom = useRef(true);
  const startLogged = useRef(false);
  const readingLeft = useRef(READING_MS);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoScroll = useRef(0);

  const currentId = asked[asked.length - 1] ?? null;
  const currentItem = POOL.find((item) => item.id === currentId) ?? null;

  useEffect(() => {
    // Ref guard: React StrictMode runs effects twice in dev (same pattern as GP1/GP2)
    if (startLogged.current) return;
    startLogged.current = true;
    logEvent("game_start", { game_id: "G15" });
  }, [logEvent]);

  // thinking → next thinking step → streaming
  useEffect(() => {
    if (stage !== "thinking" || !currentItem) return;
    const t = setTimeout(
      () => {
        if (thinkingStep < currentItem.thinking_steps.length - 1) {
          setThinkingStep((s) => s + 1);
        } else {
          setStage("streaming");
        }
      },
      prefersReducedMotion() ? 300 : THINKING_STEP_MS
    );
    return () => clearTimeout(t);
  }, [stage, thinkingStep, currentItem]);

  // streaming — reveal the answer a few characters at a time
  useEffect(() => {
    if (stage !== "streaming" || !currentId) return;
    const { flat } = parsed[currentId];

    const t = setTimeout(() => {
      if (revealed >= flat.length) {
        logEvent("answer_complete", { game_id: "G15", topic_id: currentId, order: asked.length });
        if (asked.length >= QUESTIONS_TO_ASK) {
          logEvent("reading_start", { game_id: "G15", reading_ms: READING_MS });
          setStage("reading");
        } else {
          setStage("idle");
        }
        return;
      }
      if (prefersReducedMotion()) {
        setRevealed(flat.length);
        return;
      }
      let next = Math.min(flat.length, revealed + STREAM_CHARS_PER_TICK);
      while (next < flat.length && THAI_COMBINING.test(flat[next])) next++;
      setRevealed(next);
    }, STREAM_TICK_MS);
    return () => clearTimeout(t);
  }, [stage, revealed, currentId, parsed, asked.length, logEvent]);

  // reading time after the last answer → end page. Counts down only while not
  // paused; each pause banks the time already spent in readingLeft.
  useEffect(() => {
    if (stage !== "reading" || readingPaused) return;
    const startedAt = performance.now();
    const t = setTimeout(() => setStage("end"), readingLeft.current);
    return () => {
      clearTimeout(t);
      readingLeft.current = Math.max(0, readingLeft.current - (performance.now() - startedAt));
    };
  }, [stage, readingPaused]);

  useEffect(() => {
    if (stage !== "reading") return;
    logEvent(readingPaused ? "reading_pause" : "reading_resume", {
      game_id: "G15",
      remaining_ms: Math.round(readingLeft.current),
    });
    // only log on pause/resume transitions, not the initial unpaused render
  }, [readingPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  // release anywhere (even off the chat area) ends the hold
  useEffect(() => {
    if (!holding) return;
    const release = () => setHolding(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [holding]);

  useEffect(() => () => {
    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
  }, []);

  // keep the newest text in view unless the player scrolled up to re-read
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickToBottom.current) return;
    lastAutoScroll.current = performance.now();
    el.scrollTop = el.scrollHeight;
  }, [asked.length, stage, thinkingStep, revealed]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;

    // Our own auto-scroll also fires scroll events — only the player's count.
    if (stage !== "reading" || performance.now() - lastAutoScroll.current < 150) return;
    setScrolling(true);
    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = setTimeout(() => setScrolling(false), SCROLL_RESUME_MS);
  };

  const handlePointerDown = () => {
    if (stage === "reading") setHolding(true);
  };

  const handleAsk = (item: ChatItem) => {
    if (stage !== "idle") return;
    logEvent("question_select", { game_id: "G15", topic_id: item.id, order: asked.length + 1 });
    stickToBottom.current = true;
    // Swap the tapped chip for the next unseen question, in the same slot so
    // the other chips don't jump around. Pool runs dry → the chip just drops.
    const replacement = queue[nextInQueue];
    setChoices((prev) =>
      prev.flatMap((c) => (c.id !== item.id ? [c] : replacement ? [replacement] : []))
    );
    if (replacement) setNextInQueue((n) => n + 1);
    setAsked((prev) => [...prev, item.id]);
    setThinkingStep(0);
    setRevealed(0);
    setStage("thinking");
  };

  const handleExit = () => {
    logEvent("game_complete", { game_id: "G15", topics_asked: asked.length });
    if (onExit) onExit();
    else onFinish(3);
  };

  const closeViewer = useCallback(() => setViewerImage(null), []);

  if (stage === "end") {
    return (
      <div className="gp-compact flex flex-col flex-1 min-h-0 screen-container">
        <div className="content-area">
          <div className="flex flex-col items-center gap-4 min-h-full shrink-0 justify-center py-2">
            <div className="w-24 h-24 rounded-full bg-[var(--primary-light)] flex items-center justify-center select-none">
              <CheckCircle2 size={56} className="text-[var(--primary-dark)]" />
            </div>
            <h2 className="text-[clamp(22px,6vw,28px)] font-bold text-[var(--primary-dark)]">
              ลองถาม AI ครบ 3 เรื่องแล้ว!
            </h2>

            <ul className="flex flex-col gap-3 w-full text-left">
              {asked.map((id) => {
                const item = POOL.find((i) => i.id === id);
                if (!item) return null;
                return (
                  <Takeaway key={id} icon={item.takeaway_icon} title={item.takeaway_title}>
                    {item.takeaway_text}
                  </Takeaway>
                );
              })}
            </ul>
          </div>
        </div>

        <button onClick={handleExit} className="btn btn-primary text-[clamp(20px,5.5vw,24px)] gp-tap-min-h-64 shrink-0">
          <ArrowLeft size={24} />
          <span>กลับหน้ารวมเกม</span>
        </button>
      </div>
    );
  }

  return (
    <div className="gp-compact flex flex-col flex-1 min-h-0 bg-[var(--bg-card)]">
      {/* App bar — generic chatbot, no real brand. Hidden on small screens (gp-hide-compact). */}
      <div className="gp-hide-compact flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border)] shrink-0">
        <span className="gp-size-60 flex items-center justify-center text-[var(--text-secondary)]" aria-hidden="true">
          <Menu size={24} />
        </span>
        <div className="flex flex-col items-center leading-tight">
          <span className="flex items-center gap-1.5 font-bold text-[clamp(18px,5vw,22px)] text-[var(--text-primary)]">
            <Sparkles size={20} className="text-[var(--primary)]" />
            AI ผู้ช่วย
          </span>
          <span className="text-[clamp(14px,4vw,20px)] text-[var(--text-secondary)]">แอป AI (จำลอง)</span>
        </div>
        <span className="gp-size-60 flex items-center justify-center text-[var(--text-secondary)]" aria-hidden="true">
          <SquarePen size={22} />
        </span>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        className="flex-1 min-h-0 overflow-y-auto px-4 gp-py-20"
      >
        <div className="flex flex-col gp-gap-25 min-h-full">
          {asked.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center gp-gap-15 flex-1 gp-py-40">
              <div className="gp-size-100 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                <Sparkles size={40} className="text-[var(--primary-dark)]" />
              </div>
              <p className="text-[clamp(22px,6vw,28px)] font-bold text-[var(--text-primary)]">
                สวัสดีค่ะ วันนี้อยากรู้อะไรคะ?
              </p>
              <p className="text-[clamp(18px,5vw,22px)] text-[var(--text-secondary)]">
                แตะเลือกคำถามด้านล่างได้เลย
              </p>
            </div>
          )}

          {asked.map((id) => {
            const item = POOL.find((i) => i.id === id)!;
            const isCurrent = id === currentId;
            const aiStage = isCurrent && (stage === "thinking" || stage === "streaming") ? stage : "done";
            return (
              <React.Fragment key={id}>
                <UserBubble item={item} onOpenImage={setViewerImage} />
                <AiMessage
                  blocks={parsed[id].blocks}
                  stage={aiStage}
                  revealed={aiStage === "streaming" ? revealed : Infinity}
                  thinkingLabel={item.thinking_steps[isCurrent ? thinkingStep : 0]}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Suggestion chips + composer */}
      <div className="shrink-0 border-t border-[var(--border)] px-3 gp-pt-15 gp-pb-15 flex flex-col gp-gap-10 bg-[var(--bg-card)]">
        {stage === "idle" && choices.length > 0 && (
          <div className="flex flex-col gp-gap-6">
            <p className="text-[clamp(16px,4.5vw,20px)] font-bold text-[var(--text-secondary)] px-1 leading-snug">
              {asked.length === 0 ? "เลือกคำถาม 1 ข้อ" : `ลองถามอีก ${QUESTIONS_TO_ASK - asked.length} ข้อ`}
            </p>
            {choices.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAsk(item)}
                className="flex items-center gap-3 w-full gp-tap-min-h-48 px-4 gp-py-4 leading-snug rounded-[var(--radius-lg)] border-2 border-[var(--primary)] bg-[var(--bg-card)] text-left text-[clamp(18px,5vw,22px)] font-semibold text-[var(--primary-dark)] cursor-pointer hover:bg-[var(--primary-light)] active:scale-[0.98] transition"
              >
                <span className="flex-1">{item.chip_label}</span>
                {item.image && <Paperclip size={20} className="shrink-0 opacity-70" aria-label="แนบรูป" />}
              </button>
            ))}
          </div>
        )}

        {stage === "reading" && (
          <div className="flex flex-col gap-2 px-1" role="status">
            <p className="text-[clamp(16px,4.5vw,20px)] text-[var(--text-secondary)]">
              {readingPaused
                ? "หยุดเวลาไว้ให้แล้ว อ่านได้ตามสบายค่ะ"
                : "ถามครบแล้ว ค่อยๆ อ่านคำตอบได้เลยค่ะ (แตะค้างหรือเลื่อนจอเพื่อหยุดเวลา)"}
            </p>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-[var(--primary)] rounded-full"
                style={{
                  animation: `g15-reading ${READING_MS}ms linear forwards`,
                  animationPlayState: readingPaused ? "paused" : "running",
                }}
              />
            </div>
          </div>
        )}

        {/* Composer is decorative — questions are asked via the chips above. Hidden on small
            screens (gp-hide-compact) so the panel doesn't cover the answer. */}
        <div
          className="gp-hide-compact flex items-center gap-2 gp-min-h-56 pl-3 pr-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--bg-app)]"
          aria-hidden="true"
        >
          <Paperclip size={22} className="text-[var(--text-secondary)] shrink-0" />
          <span className="flex-1 text-[clamp(16px,4.5vw,20px)] text-[var(--text-secondary)] truncate">
            {stage === "thinking" || stage === "streaming" ? "AI กำลังตอบ..." : "ถาม AI ได้เลย"}
          </span>
          <span className="gp-size-50 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
            <ArrowUp size={22} />
          </span>
        </div>
        <p className="text-center text-[clamp(14px,4vw,20px)] text-[var(--text-secondary)] leading-snug">
          AI อาจให้ข้อมูลผิดพลาดได้ โปรดตรวจสอบข้อมูลสำคัญ
        </p>
      </div>

      {viewerImage && (
        <FullscreenImageViewer src={viewerImage.src} alt={viewerImage.alt} caption={null} onClose={closeViewer} />
      )}

      <style>{`@keyframes g15-reading { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}

function UserBubble({ item, onOpenImage }: { item: ChatItem; onOpenImage: (img: ChatImage) => void }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {item.image && (
        <button
          onClick={() => onOpenImage(item.image!)}
          className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] cursor-pointer max-w-[60%]"
          aria-label={`ดูรูปเต็มจอ: ${item.image.alt}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image.src} alt={item.image.alt} className="block w-full gp-max-h-240 object-cover" />
        </button>
      )}
      <div className="max-w-[85%] px-4 py-2.5 rounded-[20px] rounded-br-[6px] bg-[var(--primary-light)] text-[var(--text-primary)] text-[clamp(18px,5vw,22px)] leading-relaxed">
        {item.question}
      </div>
    </div>
  );
}

function AiMessage({
  blocks,
  stage,
  revealed,
  thinkingLabel,
}: {
  blocks: Block[];
  stage: "thinking" | "streaming" | "done";
  revealed: number;
  thinkingLabel: string;
}) {
  if (stage === "thinking") {
    return (
      <div className="flex items-center gap-3">
        <AiAvatar pulsing />
        <span className="text-[clamp(18px,5vw,22px)] text-[var(--text-secondary)] motion-safe:animate-pulse">
          {thinkingLabel}
        </span>
      </div>
    );
  }

  // Walk the blocks, spending the "revealed" character budget in order.
  let budget = revealed;
  const visible: { kind: Block["kind"]; parts: Inline[] }[] = [];
  for (const block of blocks) {
    if (budget <= 0) break;
    const parts: Inline[] = [];
    for (const part of block.parts) {
      if (budget <= 0) break;
      parts.push({ ...part, text: part.text.slice(0, budget) });
      budget -= part.text.length;
    }
    visible.push({ kind: block.kind, parts });
  }

  // group consecutive bullets into one list
  const groups: { kind: Block["kind"]; items: Inline[][] }[] = [];
  for (const block of visible) {
    const last = groups[groups.length - 1];
    if (block.kind === "li" && last?.kind === "li") last.items.push(block.parts);
    else groups.push({ kind: block.kind, items: [block.parts] });
  }

  const renderParts = (parts: Inline[]) =>
    parts.map((part, i) => (part.bold ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>));

  return (
    <div className="flex items-start gap-3">
      <AiAvatar />
      <div className="flex-1 min-w-0 flex flex-col gap-2.5 text-[clamp(18px,5vw,22px)] leading-relaxed text-[var(--text-primary)]">
        {groups.map((group, gi) =>
          group.kind === "li" ? (
            <ul key={gi} className="list-disc pl-6 flex flex-col gap-1.5">
              {group.items.map((parts, li) => (
                <li key={li}>{renderParts(parts)}</li>
              ))}
            </ul>
          ) : (
            <p key={gi}>{renderParts(group.items[0])}</p>
          )
        )}
        {stage === "streaming" && (
          <span
            className="inline-block w-3 h-3 rounded-full bg-[var(--primary)] motion-safe:animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

function AiAvatar({ pulsing = false }: { pulsing?: boolean }) {
  return (
    <span
      className={`w-9 h-9 shrink-0 rounded-full bg-[var(--primary-light)] flex items-center justify-center ${
        pulsing ? "motion-safe:animate-spin" : ""
      }`}
      style={pulsing ? { animationDuration: "2.5s" } : undefined}
      aria-hidden="true"
    >
      <Sparkles size={20} className="text-[var(--primary-dark)]" />
    </span>
  );
}

function Takeaway({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <li className="premium-card bg-[var(--bg-card)] p-4 flex items-start gap-3">
      <span aria-hidden="true" className="gp-text-30 leading-none mt-0.5">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <strong className="text-[clamp(18px,5vw,22px)] text-[var(--text-primary)]">{title}</strong>
        <span className="text-[clamp(18px,5vw,21px)] text-[var(--text-secondary)] leading-relaxed">{children}</span>
      </div>
    </li>
  );
}
