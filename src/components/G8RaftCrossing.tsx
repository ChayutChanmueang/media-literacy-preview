"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X, LifeBuoy, MessageSquare, Phone } from "lucide-react";
import ITEMS from "@/data/g8-raft-items.json";

/**
 * G8 — กระโดดแพรู้ทันมิจ (Raft Crossing) — PROTOTYPE (US-GAME-08)
 *
 * Spec: docs/gdd/design-g8.md. Art is placeholder (emoji + CSS), no real assets yet.
 *
 * Two rules from the design doc drive most of the structure here:
 *  - the camera never follows the player; a level is one static screen of 5 rows
 *  - there is no losing state, so running out of life rings routes into a
 *    "rescue boat" recap that hands the player back mid-level
 */

type RaftItem = {
  id: string;
  type: "sms" | "call";
  is_scam: boolean;
  difficulty: number;
  sender?: string;
  text?: string;
  caller_name?: string;
  phone_number?: string;
  red_flags: string[];
  explain: string;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Row = {
  rafts: RaftItem[];
  landedIndex: number | null;
  firstTry: boolean;
};

type Phase = "playing" | "inspect" | "wrong" | "rescue" | "levelEnd" | "done";

const POOL = ITEMS as RaftItem[];
const ROWS_PER_LEVEL = 5;
const TOTAL_LEVELS = 5;
const MAX_RINGS = 5;
const STREAK_FOR_BONUS = 5;

const LEVELS = [
  { level: 1, types: ["sms"], maxDifficulty: 1, title: "ด่าน 1 — ข้อความ SMS แบบชัดเจน" },
  { level: 2, types: ["sms"], maxDifficulty: 2, title: "ด่าน 2 — SMS ที่เนียนขึ้น" },
  { level: 3, types: ["call"], maxDifficulty: 3, title: "ด่าน 3 — สายโทรเข้า" },
  { level: 4, types: ["sms", "call"], maxDifficulty: 3, title: "ด่าน 4 — ผสมทั้งสองแบบ" },
  { level: 5, types: ["sms", "call"], maxDifficulty: 3, title: "ด่าน 5 — เนียนที่สุด" },
] as const;

const pickRandom = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Build all rows for a level. Items are drawn without replacement so the same
 * message never appears twice on one screen (the pool is small enough that a
 * naive per-row random repeats constantly); the deck refills when exhausted.
 */
const buildLevel = (levelIndex: number): Row[] => {
  const config = LEVELS[levelIndex];
  const eligible = POOL.filter(
    (item) =>
      config.types.includes(item.type as never) && item.difficulty <= config.maxDifficulty
  );

  let safeDeck = shuffle(eligible.filter((item) => !item.is_scam));
  let scamDeck = shuffle(eligible.filter((item) => item.is_scam));
  const allSafe = eligible.filter((item) => !item.is_scam);
  const allScam = eligible.filter((item) => item.is_scam);

  const drawSafe = () => {
    if (safeDeck.length === 0) safeDeck = shuffle(allSafe);
    return safeDeck.pop() as RaftItem;
  };
  const drawScam = () => {
    if (scamDeck.length === 0) scamDeck = shuffle(allScam);
    return scamDeck.pop() as RaftItem;
  };

  // Levels 4-5 add a third raft to raise the stakes without adding new rules
  const scamCount = levelIndex >= 3 ? 2 : 1;

  return Array.from({ length: ROWS_PER_LEVEL }, () => ({
    rafts: shuffle([drawSafe(), ...Array.from({ length: scamCount }, drawScam)]),
    landedIndex: null,
    firstTry: true,
  }));
};

export default function G8RaftCrossing({ onFinish, logEvent }: Props) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [rows, setRows] = useState<Row[]>(() => buildLevel(0));
  const [currentRow, setCurrentRow] = useState(0);
  const [rings, setRings] = useState(MAX_RINGS);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [inspecting, setInspecting] = useState<{ item: RaftItem; index: number } | null>(null);
  const [wrongItem, setWrongItem] = useState<RaftItem | null>(null);
  const [missedInLevel, setMissedInLevel] = useState<RaftItem[]>([]);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [totalRowsCleared, setTotalRowsCleared] = useState(0);
  const [bonusFlash, setBonusFlash] = useState(false);
  const [hopping, setHopping] = useState(false);

  const startLogged = React.useRef(false);
  useEffect(() => {
    // Ref guard: React StrictMode runs effects twice in dev, which would double
    // every game_start in the QA event panel
    if (startLogged.current) return;
    startLogged.current = true;
    logEvent("game_start", { game_id: "g8", level: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stars = useMemo(() => {
    const attempted = totalRowsCleared || 1;
    const accuracy = firstTryCorrect / attempted;
    if (accuracy >= 0.8) return 3;
    if (accuracy >= 0.5) return 2;
    return 1;
  }, [firstTryCorrect, totalRowsCleared]);

  const openRaft = (item: RaftItem, index: number) => {
    if (phase !== "playing") return;
    logEvent("raft_inspect", { game_id: "g8", item_id: item.id, level: levelIndex + 1 });
    setInspecting({ item, index });
    setPhase("inspect");
  };

  const jump = () => {
    if (!inspecting) return;
    const { item, index } = inspecting;
    setInspecting(null);

    if (!item.is_scam) {
      const wasFirstTry = rows[currentRow].firstTry;
      logEvent("jump_correct", {
        game_id: "g8",
        item_id: item.id,
        level: levelIndex + 1,
        first_try: wasFirstTry,
      });

      setHopping(true);
      window.setTimeout(() => setHopping(false), 600);

      setRows((prev) => {
        const next = [...prev];
        next[currentRow] = { ...next[currentRow], landedIndex: index };
        return next;
      });
      if (wasFirstTry) setFirstTryCorrect((value) => value + 1);
      setTotalRowsCleared((value) => value + 1);

      const nextStreak = streak + 1;
      if (nextStreak >= STREAK_FOR_BONUS) {
        setStreak(0);
        setRings((value) => Math.min(MAX_RINGS, value + 1));
        logEvent("ring_bonus", { game_id: "g8", rings: Math.min(MAX_RINGS, rings + 1) });
        setBonusFlash(true);
        window.setTimeout(() => setBonusFlash(false), 2200);
      } else {
        setStreak(nextStreak);
      }

      const nextRow = currentRow + 1;
      if (nextRow >= ROWS_PER_LEVEL) {
        logEvent("level_complete", { game_id: "g8", level: levelIndex + 1 });
        setPhase("levelEnd");
      } else {
        setCurrentRow(nextRow);
        setPhase("playing");
      }
      return;
    }

    // Wrong raft: lose a ring, show the red flags, then retry the same row
    const remaining = rings - 1;
    logEvent("jump_wrong", {
      game_id: "g8",
      item_id: item.id,
      level: levelIndex + 1,
      rings_left: Math.max(0, remaining),
    });
    setRings(Math.max(0, remaining));
    setStreak(0);
    setMissedInLevel((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
    setRows((prev) => {
      const next = [...prev];
      next[currentRow] = { ...next[currentRow], firstTry: false };
      return next;
    });
    setWrongItem(item);
    setPhase("wrong");
  };

  const closeWrongCard = () => {
    setWrongItem(null);
    // Reshuffle this row so the answer can't be inferred from position
    setRows((prev) => {
      const next = [...prev];
      next[currentRow] = { ...next[currentRow], rafts: shuffle(next[currentRow].rafts) };
      return next;
    });

    if (rings <= 0) {
      logEvent("rescue_shown", { game_id: "g8", level: levelIndex + 1 });
      setPhase("rescue");
      return;
    }
    setPhase("playing");
  };

  const resumeFromRescue = () => {
    setRings(3);
    setMissedInLevel([]);
    setPhase("playing");
  };

  const nextLevel = useCallback(() => {
    const upcoming = levelIndex + 1;
    if (upcoming >= TOTAL_LEVELS) {
      logEvent("game_complete", {
        game_id: "g8",
        stars,
        first_try_correct: firstTryCorrect,
        total_rows: totalRowsCleared,
      });
      setPhase("done");
      return;
    }
    setLevelIndex(upcoming);
    setRows(buildLevel(upcoming));
    setCurrentRow(0);
    setMissedInLevel([]);
    setPhase("playing");
    logEvent("level_start", { game_id: "g8", level: upcoming + 1 });
  }, [levelIndex, logEvent, stars, firstTryCorrect, totalRowsCleared]);

  const level = LEVELS[levelIndex];

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      {/* Status bar — rings and progress, always with a number next to the icon */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_RINGS }, (_, i) => (
            <LifeBuoy
              key={i}
              size={24}
              className={i < rings ? "text-orange-500" : "text-slate-200"}
              aria-hidden
            />
          ))}
          <span className="text-[clamp(14px,4.35vw,20px)] font-bold ml-1">ห่วงยาง {rings}</span>
        </div>
        <span className="text-[clamp(14px,4.35vw,20px)] font-bold text-[var(--text-secondary)]">
          ด่าน {levelIndex + 1}/{TOTAL_LEVELS} · แพ {Math.min(currentRow + 1, ROWS_PER_LEVEL)}/
          {ROWS_PER_LEVEL}
        </span>
      </div>

      {/* Lake scene — 5 static rows sharing the viewport, no scrolling and the
          camera never follows the character (design-g8.md §4) */}
      <div className="g8-lake flex-1 min-h-0 overflow-hidden">
        <div key={levelIndex} className="g8-scene-shift flex flex-col-reverse gap-1.5 px-2 py-1 h-full">
          {/* Starting shore sits below row 1 */}
          <div className="flex items-center justify-center gap-2 shrink-0 leading-none">
            <span className="text-3xl" aria-hidden>
              {currentRow === 0 && phase !== "done" ? "🧓" : "🏝️"}
            </span>
            <span className="text-[clamp(10px,3.26vw,15px)] font-bold text-sky-900/70">
              {currentRow === 0 ? "จุดเริ่มต้น" : "ฝั่งที่ออกเดินทาง"}
            </span>
          </div>

          {rows.map((row, rowIdx) => {
            const isActive = rowIdx === currentRow && phase === "playing";
            const isCleared = row.landedIndex !== null;
            const isFuture = rowIdx > currentRow;

            return (
              <div
                key={rowIdx}
                className={`flex gap-2 justify-center flex-1 min-h-0 transition-opacity ${
                  isFuture ? "opacity-45" : "opacity-100"
                }`}
              >
                {row.rafts.map((raft, raftIdx) => {
                  const landedHere = row.landedIndex === raftIdx;
                  return (
                    <button
                      key={`${raft.id}-${raftIdx}`}
                      onClick={() => isActive && openRaft(raft, raftIdx)}
                      disabled={!isActive}
                      aria-label={`แพข้อความ ${raft.type === "sms" ? "SMS" : "สายโทรเข้า"}`}
                      className={`g8-raft relative flex flex-col flex-1 max-w-[46%] h-full min-h-[64px] rounded-2xl border-[3px] px-2.5 py-1 text-left bg-amber-50 overflow-hidden ${
                        landedHere
                          ? "border-emerald-500"
                          : isActive
                            ? "border-amber-700 shadow-lg cursor-pointer"
                            : "border-amber-800/40"
                      } ${isCleared && !landedHere ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-center gap-1 mb-0.5 text-slate-600 shrink-0">
                        {raft.type === "sms" ? <MessageSquare size={16} /> : <Phone size={16} />}
                        <span className="text-[clamp(9px,2.83vw,13px)] font-bold truncate">
                          {raft.type === "sms" ? raft.sender : raft.caller_name}
                        </span>
                      </div>
                      <p className="text-[clamp(12px,3.7vw,17px)] leading-tight line-clamp-2 text-slate-800">
                        {raft.type === "sms" ? raft.text : raft.phone_number}
                      </p>

                      {landedHere && (
                        <span
                          className={`absolute -top-7 left-1/2 -translate-x-1/2 text-4xl ${
                            hopping ? "g8-hop" : ""
                          }`}
                          aria-hidden
                        >
                          🧓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Far shore — the goal for this screen */}
          <div className="flex items-center justify-center gap-2 shrink-0 leading-none">
            <span className="text-2xl" aria-hidden>
              🚩
            </span>
            <span className="text-[clamp(10px,3.26vw,15px)] font-bold text-sky-900/70">ท่าน้ำฝั่งตรงข้าม</span>
          </div>
        </div>
      </div>

      {bonusFlash && (
        <div className="shrink-0 bg-orange-100 text-orange-800 text-[clamp(13px,3.91vw,18px)] font-bold text-center py-2">
          รอบคอบมาก! รับห่วงยางเพิ่ม 🛟
        </div>
      )}

      {/* Inspect card — read the full message before committing to a jump */}
      {phase === "inspect" && inspecting && (
        <Overlay>
          <div className="flex items-center gap-2 mb-3 text-slate-500">
            {inspecting.item.type === "sms" ? <MessageSquare size={20} /> : <Phone size={20} />}
            <span className="text-[clamp(13px,3.91vw,18px)] font-bold">
              {inspecting.item.type === "sms" ? "ข้อความ SMS" : "สายโทรเข้า"}
            </span>
          </div>

          {inspecting.item.type === "sms" ? (
            <>
              <p className="text-[clamp(13px,3.91vw,18px)] text-slate-500 mb-1">จาก: {inspecting.item.sender}</p>
              <p className="text-[clamp(15px,4.78vw,22px)] leading-relaxed mb-5">{inspecting.item.text}</p>
            </>
          ) : (
            <div className="text-center mb-5">
              <p className="text-[clamp(18px,5.65vw,26px)] font-bold mb-1">{inspecting.item.caller_name}</p>
              <p className="text-[clamp(17px,5.22vw,24px)] tracking-wide text-slate-600">
                {inspecting.item.phone_number}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={jump}
              className="w-full min-h-[56px] rounded-xl bg-[var(--btn-bg)] text-white text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer"
            >
              🦵 กระโดดไปแพนี้
            </button>
            <button
              onClick={() => {
                setInspecting(null);
                setPhase("playing");
              }}
              className="w-full min-h-[52px] rounded-xl border-2 border-slate-300 text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer"
            >
              👀 ดูแพอื่นก่อน
            </button>
          </div>
        </Overlay>
      )}

      {/* Wrong raft — the teaching moment, never framed as a failure */}
      {phase === "wrong" && wrongItem && (
        <Overlay>
          <div className="flex items-center gap-2 mb-2 text-orange-600">
            <X size={26} strokeWidth={3} />
            <span className="text-[clamp(15px,4.78vw,22px)] font-bold">แพนี้เป็นของมิจฉาชีพ</span>
          </div>
          <p className="text-[clamp(13px,3.91vw,18px)] text-slate-500 mb-3">
            ตกน้ำนิดหน่อย ห่วงยางรับไว้แล้ว เหลืออีก {rings} ห่วง 🛟
          </p>

          <p className="text-[clamp(14px,4.35vw,20px)] font-bold mb-1.5">จุดสังเกต:</p>
          <ul className="mb-4 flex flex-col gap-1.5">
            {wrongItem.red_flags.map((flag) => (
              <li key={flag} className="flex gap-2 text-[clamp(13px,4.13vw,19px)] leading-snug">
                <span aria-hidden>⚠️</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>

          <p className="text-[clamp(13px,4.13vw,19px)] leading-relaxed bg-teal-50 rounded-xl p-3 mb-4">
            {wrongItem.explain}
          </p>
          <p className="text-[clamp(12px,3.7vw,17px)] text-slate-500 mb-4">
            เจอแบบนี้แจ้งได้ที่สายด่วนตำรวจไซเบอร์ <strong>1441</strong>
          </p>

          <button
            onClick={closeWrongCard}
            className="w-full min-h-[56px] rounded-xl bg-[var(--btn-bg)] text-white text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer"
          >
            เข้าใจแล้ว ลองใหม่
          </button>
        </Overlay>
      )}

      {/* Rescue boat replaces the game-over screen the mechanic would normally imply */}
      {phase === "rescue" && (
        <Overlay>
          <p className="text-6xl text-center mb-2" aria-hidden>
            ⛵
          </p>
          <p className="text-[clamp(17px,5.22vw,24px)] font-bold text-center mb-2">เรือกู้ภัยมารับแล้ว!</p>
          <p className="text-[clamp(13px,4.13vw,19px)] leading-relaxed mb-4">
            มิจฉาชีพสมัยนี้เนียนมากจริงๆ มาพักที่ศาลาริมน้ำแล้วทบทวนจุดสังเกตกันอีกรอบ
            แล้วค่อยไปต่อนะ
          </p>

          {missedInLevel.length > 0 && (
            <ul className="mb-4 flex flex-col gap-2">
              {missedInLevel.slice(0, 3).map((item) => (
                <li key={item.id} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[clamp(12px,3.7vw,17px)] font-bold mb-1">
                    {item.type === "sms" ? item.sender : item.caller_name}
                  </p>
                  <p className="text-[clamp(12px,3.7vw,17px)] leading-snug">{item.red_flags[0]}</p>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={resumeFromRescue}
            className="w-full min-h-[56px] rounded-xl bg-[var(--btn-bg)] text-white text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer"
          >
            พร้อมลุยต่อ 🛟🛟🛟
          </button>
        </Overlay>
      )}

      {/* End of a level */}
      {phase === "levelEnd" && (
        <Overlay>
          <p className="text-6xl text-center mb-2" aria-hidden>
            🚩
          </p>
          <p className="text-[clamp(17px,5.22vw,24px)] font-bold text-center mb-2">ถึงท่าน้ำแล้ว!</p>
          <p className="text-[clamp(13px,4.13vw,19px)] text-center leading-relaxed mb-5">
            ผ่าน{level.title}เรียบร้อย
            {levelIndex + 1 < TOTAL_LEVELS
              ? " ด่านต่อไปจะมีโจทย์ที่เนียนขึ้นอีกนิดนะ"
              : " เก่งมาก!"}
          </p>
          <button
            onClick={nextLevel}
            className="w-full min-h-[56px] rounded-xl bg-[var(--btn-bg)] text-white text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer"
          >
            {levelIndex + 1 < TOTAL_LEVELS ? "ไปด่านต่อไป" : "ดูผลสรุป"}
          </button>
        </Overlay>
      )}

      {/* Final summary — always a win, stars computed quietly in the background */}
      {phase === "done" && (
        <Overlay>
          <p className="text-6xl text-center mb-2" aria-hidden>
            🎉
          </p>
          <p className="text-[clamp(17px,5.22vw,24px)] font-bold text-center mb-3">ข้ามทะเลสาบสำเร็จ!</p>
          <div className="flex justify-center gap-1 mb-4" aria-label={`ได้ ${stars} ดาว`}>
            {[1, 2, 3].map((n) => (
              <span key={n} className="text-4xl" aria-hidden>
                {n <= stars ? "⭐" : "☆"}
              </span>
            ))}
          </div>
          <p className="text-[clamp(13px,4.13vw,19px)] text-center leading-relaxed mb-5">
            สุดยอด! คุณข้ามทะเลสาบได้สำเร็จด้วยสายตาที่รู้ทันมิจฉาชีพ
            ทีนี้ SMS หรือเบอร์แปลกๆ ก็หลอกคุณไม่ได้แล้ว
          </p>
          <button
            onClick={() => onFinish(stars)}
            className="w-full min-h-[56px] rounded-xl bg-[var(--btn-bg)] text-white text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <Check size={22} strokeWidth={3} /> เสร็จสิ้น
            </span>
          </button>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 bg-slate-900/60 flex items-end sm:items-center justify-center p-3">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md max-h-full overflow-y-auto shadow-xl">
        {children}
      </div>
    </div>
  );
}
