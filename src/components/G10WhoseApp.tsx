"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import ITEMS from "@/data/g10-app-items.json";

/**
 * G10 — นี้แอปฉัน นั้นแอปใคร? (Spot the Fake App) — PROTOTYPE (design-g10.md)
 *
 * A grid of app tiles mixes real and fake apps. Icons are shared emoji (real and
 * fake use the same icon on purpose — the tell is the NAME, SOURCE and the
 * PERMISSIONS, not the picture). Tap a tile to inspect, then remove fakes / keep
 * reals. No timer, no game-over: a wrong tap just returns a gentle card.
 *
 * 5 stages: level 1 = 2×2 (×2), level 2 = 3×2 (×2), level 3 = 3×3 with a single
 * fake hidden among 8 reals (×1). A stage clears when every fake is removed.
 */

type AppItem = {
  id: string;
  icon: string;
  name: string;
  is_fake: boolean;
  category: string;
  source: "store" | "link";
  permissions: string[];
  red_flags: string[];
  explain: string;
  ai_disclosure: boolean;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Slot = {
  item: AppItem;
  removed: boolean; // fake correctly uninstalled
  confirmed: boolean; // real correctly kept
  firstDecided: boolean; // for star scoring
};

type Phase = "grid" | "inspect" | "stageEnd" | "reveal";

const POOL = ITEMS as AppItem[];
const DANGEROUS_PERMS = new Set(["อ่าน SMS", "ควบคุมหน้าจอ", "ติดตั้งแอป"]);

const STAGES = [
  { level: 1, grid: "2x2", cols: 2, tiles: 4, fakeMin: 1, fakeMax: 2 },
  { level: 1, grid: "2x2", cols: 2, tiles: 4, fakeMin: 1, fakeMax: 2 },
  { level: 2, grid: "3x2", cols: 3, tiles: 6, fakeMin: 1, fakeMax: 2 },
  { level: 2, grid: "3x2", cols: 3, tiles: 6, fakeMin: 1, fakeMax: 2 },
  { level: 3, grid: "3x3", cols: 3, tiles: 9, fakeMin: 1, fakeMax: 1 },
];

const STAGE_SUMMARIES = [
  "แอปการเงินให้โหลดจาก Play Store / App Store เท่านั้นนะ",
  "ดูชื่อแอปดีๆ — ตัวปลอมชอบสะกดเลียนแบบ เช่น L1NE แทน LINE",
  "แอปแต่งรูป/เพิ่มแบต ที่ขออ่าน SMS หรือคุมหน้าจอ = สัญญาณอันตราย",
  "เจอแอปแปลกที่โหลดจากลิงก์ ให้ลบทันที",
  "แอปปลอมซ่อนในแอปจริงเยอะๆ ได้ — ตรวจให้ครบทุกตัวก่อนวางใจ",
];

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

const buildStage = (stageIdx: number): Slot[] => {
  const cfg = STAGES[stageIdx];
  const fakeCount = randInt(cfg.fakeMin, cfg.fakeMax);
  const realCount = cfg.tiles - fakeCount;
  const fakes = shuffle(POOL.filter((a) => a.is_fake)).slice(0, fakeCount);
  const reals = shuffle(POOL.filter((a) => !a.is_fake)).slice(0, realCount);
  return shuffle([...fakes, ...reals]).map((item) => ({
    item,
    removed: false,
    confirmed: false,
    firstDecided: false,
  }));
};

export default function G10WhoseApp({ onFinish, logEvent }: Props) {
  const [stageIdx, setStageIdx] = useState(0);
  const [slots, setSlots] = useState<Slot[]>(() => buildStage(0));
  const [phase, setPhase] = useState<Phase>("grid");
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; action: "remove" | "keep" } | null>(
    null
  );
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [totalDecisions, setTotalDecisions] = useState(0);
  const [fakesRemovedTotal, setFakesRemovedTotal] = useState(0);
  const [missedReveal, setMissedReveal] = useState<AppItem[]>([]);
  const [speaking, setSpeaking] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const startLogged = useRef(false);
  useEffect(() => {
    if (startLogged.current) return;
    startLogged.current = true;
    logEvent("game_start", { game_id: "g10", level: 1 });
  }, [logEvent]);

  const cfg = STAGES[stageIdx];
  const fakesRemaining = slots.filter((s) => s.item.is_fake && !s.removed).length;
  const isLastStage = stageIdx === STAGES.length - 1;

  const stopSpeak = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
  };

  const handleSpeak = (text: string) => {
    const synth = synthRef.current;
    if (!synth) return;
    if (speaking) {
      stopSpeak();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  const openInspect = (idx: number) => {
    setActiveSlot(idx);
    setResult(null);
    setPhase("inspect");
    logEvent("app_inspect", { game_id: "g10", item_id: slots[idx].item.id });
  };

  const closeInspect = () => {
    stopSpeak();
    setActiveSlot(null);
    setResult(null);
    // slots already reflects the just-made decision (decide() ran in a prior
    // render), so the stage-clear check here sees the up-to-date grid
    const cleared = slots.length > 0 && !slots.some((s) => s.item.is_fake && !s.removed);
    if (cleared) {
      logEvent("level_complete", { game_id: "g10", level: cfg.level, grid: cfg.grid });
      setPhase("stageEnd");
    } else {
      setPhase("grid");
    }
  };

  const decide = (action: "remove" | "keep") => {
    if (activeSlot === null) return;
    const slot = slots[activeSlot];
    const correct = (action === "remove") === slot.item.is_fake;
    const isFirst = !slot.firstDecided;

    if (isFirst) {
      setTotalDecisions((t) => t + 1);
      if (correct) setFirstTryCorrect((c) => c + 1);
    }
    if (correct && action === "remove") setFakesRemovedTotal((n) => n + 1);

    setSlots((prev) =>
      prev.map((s, i) =>
        i !== activeSlot
          ? s
          : {
              ...s,
              firstDecided: true,
              removed: correct && action === "remove" ? true : s.removed,
              confirmed: correct && action === "keep" ? true : s.confirmed,
            }
      )
    );

    logEvent(correct ? "decide_correct" : "decide_wrong", {
      game_id: "g10",
      item_id: slot.item.id,
      action,
      is_fake: slot.item.is_fake,
      first_try: isFirst,
    });
    setResult({ correct, action });
  };

  const nextStage = () => {
    if (isLastStage) {
      const ratio = totalDecisions ? firstTryCorrect / totalDecisions : 1;
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      logEvent("game_complete", { game_id: "g10", stars, fakes_removed: fakesRemovedTotal });
      onFinish(stars);
      return;
    }
    const next = stageIdx + 1;
    setStageIdx(next);
    setSlots(buildStage(next));
    setPhase("grid");
  };

  // "ครบแล้ว" — the player submits the stage. If every fake is gone we advance;
  // otherwise we reveal the ones they missed (counting each as a wrong first-try)
  // so it stays a teaching moment, never a dead-end.
  const handleDone = () => {
    const missed = slots.filter((s) => s.item.is_fake && !s.removed);
    if (missed.length === 0) {
      logEvent("stage_submit", { game_id: "g10", level: cfg.level, missed: 0 });
      logEvent("level_complete", { game_id: "g10", level: cfg.level, grid: cfg.grid });
      setPhase("stageEnd");
      return;
    }
    const newlyMissed = missed.filter((s) => !s.firstDecided).length;
    if (newlyMissed > 0) setTotalDecisions((t) => t + newlyMissed);
    setSlots((prev) =>
      prev.map((s) =>
        s.item.is_fake && !s.removed && !s.firstDecided ? { ...s, firstDecided: true } : s
      )
    );
    logEvent("stage_submit", { game_id: "g10", level: cfg.level, missed: missed.length });
    setMissedReveal(missed.map((s) => s.item));
    setPhase("reveal");
  };

  // ---- Stage-complete interstitial ----
  if (phase === "stageEnd") {
    return (
      <div className="flex flex-col flex-1 min-h-0 justify-center items-center gap-5 p-6 text-center">
        <div className="text-[clamp(45px,13.91vw,64px)] leading-none">🎉</div>
        <h2 className="text-[clamp(17px,5.22vw,24px)] font-bold text-[var(--primary-dark)]">เครื่องสะอาดแล้ว!</h2>
        <div className="premium-card bg-[var(--primary-light)] p-4 max-w-sm">
          <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--text-primary)] leading-relaxed">
            💡 {STAGE_SUMMARIES[stageIdx]}
          </p>
        </div>
        <button onClick={nextStage} className="btn btn-primary text-[clamp(15px,4.78vw,22px)] min-h-[64px] w-full max-w-sm">
          {isLastStage ? "เสร็จสิ้นบทเรียน" : "ด่านต่อไป"}
        </button>
      </div>
    );
  }

  // ---- Missed-fakes reveal (player pressed "ครบแล้ว" too early) ----
  if (phase === "reveal") {
    return (
      <div className="scroll-region flex flex-col flex-1 min-h-0 items-center gap-4 p-6 text-center">
        <div className="text-[clamp(36px,11.3vw,52px)] leading-none">🔎</div>
        <h2 className="text-[clamp(15px,4.78vw,22px)] font-bold text-[var(--accent-error)]">
          ยังมีแอปปลอมที่มองข้ามไป {missedReveal.length} อัน
        </h2>
        <p className="text-[clamp(11px,3.48vw,16px)] text-[var(--text-secondary)]">
          ไม่เป็นไร มาดูกันว่ามีแอปไหนบ้าง แล้วจำจุดสังเกตไว้
        </p>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {missedReveal.map((app) => (
            <div
              key={app.id}
              className="flex items-center gap-3 premium-card bg-[var(--primary-light)] p-3 text-left"
            >
              <span className="text-[clamp(22px,6.96vw,32px)] leading-none shrink-0" aria-hidden="true">
                {app.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[clamp(12px,3.7vw,17px)] font-bold leading-tight">{app.name}</p>
                <p className="text-[clamp(10px,3.04vw,14px)] text-[var(--accent-error)] leading-snug">
                  ⚠️ {app.red_flags[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="premium-card bg-[var(--bg-app)] p-3 max-w-sm">
          <p className="text-[clamp(10px,3.26vw,15px)] text-[var(--text-primary)] leading-relaxed">
            💡 {STAGE_SUMMARIES[stageIdx]}
          </p>
        </div>
        <button onClick={nextStage} className="btn btn-primary text-[clamp(14px,4.35vw,20px)] min-h-[60px] w-full max-w-sm">
          {isLastStage ? "เข้าใจแล้ว เสร็จสิ้นบทเรียน" : "เข้าใจแล้ว ไปด่านต่อไป"}
        </button>
      </div>
    );
  }

  // ---- Inspect modal ----
  const inspectSlot = activeSlot !== null ? slots[activeSlot] : null;

  // ---- Main grid screen ----
  return (
    <div className="flex flex-col flex-1 min-h-0 justify-between relative">
      <div className="scroll-region flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-[clamp(10px,3.26vw,15px)] font-bold text-[var(--primary-dark)]">
            ด่าน {stageIdx + 1}/{STAGES.length} · ตาราง {cfg.grid}
          </span>
          <span className="text-[clamp(10px,3.26vw,15px)] font-bold text-[var(--accent-error)]">
            🔎 เหลือแอปปลอมต้องหา: {fakesRemaining}
          </span>
        </div>

        <p className="text-[clamp(14px,4.35vw,20px)] font-bold leading-snug text-center">
          แตะแอปที่ดูแปลกเพื่อตรวจสอบ แล้วลบแอปปลอมออก
        </p>

        {/* App grid */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))` }}
        >
          {slots.map((slot, idx) => {
            if (slot.removed) {
              return (
                <div
                  key={idx}
                  className="aspect-square rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border)] bg-[var(--bg-app)] flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-70"
                >
                  <Trash2 size={22} />
                  <span className="text-[clamp(8px,2.61vw,12px)] mt-1">ลบแล้ว</span>
                </div>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => openInspect(idx)}
                className="relative aspect-square rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--bg-card)] flex flex-col items-center justify-center gap-1 p-2 cursor-pointer hover:border-[var(--primary)] transition shadow-[var(--shadow-sm)]"
              >
                {slot.confirmed && (
                  <span className="absolute top-1 right-1 text-[var(--accent-success)]">
                    <CheckCircle2 size={18} />
                  </span>
                )}
                <span className="text-[clamp(28px,8.7vw,40px)] leading-none" aria-hidden="true">
                  {slot.item.icon}
                </span>
                <span className="text-[clamp(9px,2.83vw,13px)] font-semibold text-center leading-tight line-clamp-2">
                  {slot.item.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[clamp(9px,2.83vw,13px)] text-[var(--text-secondary)] text-center">
          แอปดีที่ตรวจแล้วจะมีเครื่องหมาย ✓ · ไม่มีการจับเวลา ตรวจได้เรื่อยๆ
        </p>
      </div>

      {/* Submit — advance if all fakes are gone, otherwise reveal the missed ones */}
      <button
        onClick={handleDone}
        className="btn btn-primary text-[clamp(14px,4.35vw,20px)] min-h-[60px] mt-3 shrink-0"
      >
        ครบแล้ว ✓
      </button>

      {/* Inspect overlay */}
      {phase === "inspect" && inspectSlot && (
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-3 z-50">
          <div className="flex flex-col items-center gap-3 w-full max-w-md max-h-full">
          <div className="bg-[var(--bg-card)] rounded-[var(--radius-xl)] w-full p-5 shadow-[var(--shadow-lg)] overflow-y-auto min-h-0">
            {/* App identity */}
            <div className="flex items-start gap-3 mb-3">
              <span className="text-[clamp(34px,10.43vw,48px)] leading-none" aria-hidden="true">
                {inspectSlot.item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[clamp(15px,4.78vw,22px)] font-bold leading-tight">{inspectSlot.item.name}</p>
                <p
                  className={`text-[clamp(10px,3.26vw,15px)] font-semibold mt-1 ${
                    inspectSlot.item.source === "store"
                      ? "text-[var(--accent-success)]"
                      : "text-[var(--accent-error)]"
                  }`}
                >
                  {inspectSlot.item.source === "store"
                    ? "✓ ติดตั้งจาก Play Store"
                    : "⚠️ ติดตั้งจากลิงก์ภายนอก"}
                </p>
              </div>
              <button
                onClick={() =>
                  handleSpeak(
                    result
                      ? inspectSlot.item.explain
                      : `${inspectSlot.item.name} ${
                          inspectSlot.item.source === "store"
                            ? "ติดตั้งจากสโตร์"
                            : "ติดตั้งจากลิงก์ภายนอก"
                        } ขอสิทธิ์ ${inspectSlot.item.permissions.join(" ")}`
                  )
                }
                className="p-2 rounded-full border-2 border-[var(--primary)] text-[var(--primary-dark)] cursor-pointer shrink-0"
                aria-label="เสียงอ่าน"
              >
                {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Permissions */}
            <p className="text-[clamp(10px,3.04vw,14px)] text-[var(--text-secondary)] mb-1">ขอสิทธิ์ใช้งาน:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {inspectSlot.item.permissions.map((perm) => {
                const danger = DANGEROUS_PERMS.has(perm);
                return (
                  <span
                    key={perm}
                    className={`inline-flex items-center gap-1 text-[clamp(10px,3.04vw,14px)] font-semibold px-2.5 py-1 rounded-[var(--radius-pill)] ${
                      danger
                        ? "bg-[rgba(220,38,38,0.12)] text-[var(--accent-error)]"
                        : "bg-[var(--bg-app)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {danger ? "⚠️" : "•"} {perm}
                  </span>
                );
              })}
            </div>

            {!result ? (
              <div className="flex gap-2.5">
                <button
                  onClick={() => decide("remove")}
                  className="btn btn-outline flex-1 text-[clamp(13px,4.13vw,19px)] min-h-[56px] border-[var(--accent-error)] text-[var(--accent-error)]"
                >
                  <Trash2 size={20} /> ลบแอปนี้
                </button>
                <button
                  onClick={() => decide("keep")}
                  className="btn btn-outline flex-1 text-[clamp(13px,4.13vw,19px)] min-h-[56px] border-[var(--accent-success)] text-[var(--accent-success)]"
                >
                  <ShieldCheck size={20} /> เก็บไว้
                </button>
              </div>
            ) : (
              <div className="[animation:fadeIn_0.3s_ease-out]">
                <div
                  className={`flex items-center gap-2 justify-center mb-2 ${
                    result.correct ? "text-[var(--accent-success)]" : "text-[var(--accent-error)]"
                  }`}
                >
                  {result.correct ? (
                    <>
                      <CheckCircle2 size={26} />
                      <strong className="text-[clamp(14px,4.35vw,20px)]">
                        {result.action === "remove" ? "ลบถูกต้อง!" : "เก็บไว้ถูกแล้ว!"}
                      </strong>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={26} />
                      <strong className="text-[clamp(14px,4.35vw,20px)]">
                        {inspectSlot.item.is_fake
                          ? "อันนี้ยังน่าสงสัยนะ"
                          : "อันนี้แอปดีนะ"}
                      </strong>
                    </>
                  )}
                </div>

                <div className="premium-card bg-[var(--primary-light)] p-3.5 text-left">
                  <p className="text-[clamp(12px,3.7vw,17px)] text-[var(--text-primary)] leading-relaxed">
                    {inspectSlot.item.explain}
                  </p>
                  {inspectSlot.item.red_flags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {inspectSlot.item.red_flags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center gap-1 text-[clamp(9px,2.83vw,13px)] font-bold px-2 py-0.5 rounded-[var(--radius-pill)] bg-[rgba(220,38,38,0.12)] text-[var(--accent-error)]"
                        >
                          ⚠️ {flag}
                        </span>
                      ))}
                    </div>
                  )}
                  {inspectSlot.item.is_fake && (
                    <p className="text-[clamp(9px,2.83vw,13px)] text-[var(--text-secondary)] mt-2.5">
                      ลบแอปจริง: กดค้างที่ไอคอน → ถอนการติดตั้ง · ถ้าถูกดูดเงินโทร 1441
                    </p>
                  )}
                </div>

                <button
                  onClick={closeInspect}
                  className="btn btn-primary text-[clamp(13px,4.13vw,19px)] min-h-[56px] w-full mt-3"
                >
                  {result.correct && result.action === "remove"
                    ? "ลบแล้ว กลับไปตรวจต่อ"
                    : "กลับไปตรวจต่อ"}
                </button>
              </div>
            )}
          </div>

          {/* Close button — outside the card, on the dark backdrop (per design feedback) */}
          {!result && (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                onClick={closeInspect}
                aria-label="ปิด ดูแอปอื่นก่อน"
                className="w-14 h-14 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-lg)] flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <X size={28} />
              </button>
              <span className="text-[clamp(10px,3.04vw,14px)] font-bold text-white">ปิด</span>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
