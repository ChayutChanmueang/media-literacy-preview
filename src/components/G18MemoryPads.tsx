"use client";

import React, { useEffect, useRef, useState } from "react";
import { HUD_DEV_BUTTON_CLASS } from "./GameHudBar";
import GameStageHeader from "./GameStageHeader";
import { Brain, Eye, Trophy } from "lucide-react";
import { notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";
import GameIntro from "@/components/GameIntro";
import DATA from "@/data/g18-simon-pads.json";

/**
 * G18 — จำให้ขึ้นใจ (Simon memory game)
 *
 * Adapted from the team's simon10.html mock: the board lights up a sequence of
 * pads and the player taps them back in the same order, one longer each level.
 * A pure fun/brain-training game — no lesson content.
 * Endless like the mock; the score is how many levels the player clears
 * (level n plays n lights, so score = the longest sequence they remembered).
 * Like the mock, one wrong tap ends the run and the right pad is not revealed.
 * Differences from the HTML mock, to follow AGENT.md (elderly-first):
 * - the run ends on a positive score screen instead of "จบเกม", with play again / finish
 * - play screen follows the Figma design (Scammer Game Prototype, node 3028:13081):
 *   dark board, raised colour pads, centre circle, and a status pill under the board
 *   ("จำปุ่มสีให้ดี" while the lights play, "กดปุ่มสีตามที่เห็น" on the player's turn)
 * - a "ดูอีกครั้ง" button can replay the sequence on the player's turn — hidden for now
 *   (SHOW_REPLAY_BUTTON) because the Figma design has none
 * - no input timeout
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Pad = {
  id: string;
  colorName: string;
  colorDot: string;
  color: string;
  shadow: string;
  glow: string;
  toneHz: number;
};

type Props = {
  /** score = best run since the game was opened — goes on the (device-only for now) leaderboard */
  onFinish: (stars: number, score?: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

// watch = sequence playing · input = player's turn · correct = short feedback between levels
// oops = wrong tap, short pause before the score screen
type Phase = "intro" | "watch" | "input" | "correct" | "oops" | "result";

const PADS = DATA.pads as Pad[];

const LEAD_IN_MS = 900; // pause before the first light, so the player can look at the board
const TIMING = { on: 650, off: 300 };
const PRESS_FLASH_MS = 250;
const CORRECT_PAUSE_MS = 1300;
const RESULT_PAUSE_MS = 1600; // let the "wrong" message register before the score screen
// "ดูอีกครั้ง" (replay the sequence) — off to match the Figma design; flip back on if the final design has it
const SHOW_REPLAY_BUTTON = false;
const PAD_LIFT_PX = 8; // pad face sits this far above its darker base; a lit/pressed pad drops onto it

// score = levels cleared in the best run
function starsFor(score: number) {
  if (score >= 7) return 3;
  if (score >= 4) return 2;
  return 1;
}

// Like the original Simon, each level adds one light to the end of the same sequence.
// Never three of the same pad in a row — hard to count for anyone.
function nextPad(seq: number[]) {
  const n = seq.length;
  for (;;) {
    const pick = Math.floor(Math.random() * PADS.length);
    if (n >= 2 && seq[n - 1] === pick && seq[n - 2] === pick) continue;
    return pick;
  }
}

export default function G18MemoryPads({ onFinish, logEvent }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState(0); // pads tapped correctly in this attempt
  const [lit, setLit] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0); // best run since the game was opened
  const [runs, setRuns] = useState(0);

  // Refs drive the game logic so two quick taps in one frame can't both read a stale phase/step.
  const phaseRef = useRef<Phase>("intro");
  const levelRef = useRef(1);
  const stepRef = useRef(0);
  const sequenceRef = useRef<number[]>([]);
  const runRef = useRef(0);
  const bestRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const audioRef = useRef<AudioContext | null>(null);

  const goPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const after = (ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
      audioRef.current?.close().catch(() => {});
    },
    []
  );

  // Needs a user gesture on iOS/LINE browser — called from the start button.
  const ensureAudio = () => {
    if (audioRef.current) return;
    const Ctx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) audioRef.current = new Ctx();
  };

  const playTone = (padIdx: number, ms: number) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = PADS[padIdx].toneHz;
    const now = ctx.currentTime;
    const end = now + ms / 1000;
    // soft attack/release so the tone doesn't click
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.setValueAtTime(0.18, Math.max(now + 0.02, end - 0.06));
    gain.gain.linearRampToValueAtTime(0, end);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(end + 0.02);
  };

  const playSequence = () => {
    clearTimers();
    setLit(null);
    setStep(0);
    stepRef.current = 0;
    goPhase("watch");

    const { on, off } = TIMING;
    let t = LEAD_IN_MS;
    sequenceRef.current.forEach((pad) => {
      after(t, () => {
        setLit(pad);
        playTone(pad, on);
      });
      t += on;
      after(t, () => setLit(null));
      t += off;
    });
    after(t, () => goPhase("input"));
  };

  const startLevel = (n: number) => {
    levelRef.current = n;
    setLevel(n);
    sequenceRef.current.push(nextPad(sequenceRef.current));
    logEvent("enter_level", { game_id: "G18", run: runRef.current, level: n });
    playSequence();
  };

  const startRun = () => {
    ensureAudio();
    clearTimers();
    sequenceRef.current = [];
    runRef.current += 1;
    setRuns(runRef.current);
    logEvent("run_start", { game_id: "G18", run: runRef.current });
    startLevel(1);
  };

  const completeLevel = () => {
    clearTimers();
    setLit(null);
    goPhase("correct");
    const n = levelRef.current;
    logEvent("level_complete", { game_id: "G18", run: runRef.current, level: n });
    after(CORRECT_PAUSE_MS, () => startLevel(n + 1));
  };

  const endRun = () => {
    const cleared = levelRef.current - 1;
    bestRef.current = Math.max(bestRef.current, cleared);
    setScore(cleared);
    setBestScore(bestRef.current);
    logEvent("run_end", { game_id: "G18", run: runRef.current, score: cleared, best_score: bestRef.current });
    goPhase("result");
  };

  const press = (padIdx: number) => {
    if (phaseRef.current !== "input") return;

    setLit(padIdx);
    playTone(padIdx, PRESS_FLASH_MS);
    after(PRESS_FLASH_MS, () => setLit((cur) => (cur === padIdx ? null : cur)));

    const expected = sequenceRef.current[stepRef.current];

    if (padIdx === expected) {
      const next = stepRef.current + 1;
      stepRef.current = next;
      setStep(next);
      if (next === sequenceRef.current.length) completeLevel();
      return;
    }

    logEvent("wrong_press", {
      game_id: "G18",
      run: runRef.current,
      level: levelRef.current,
      step: stepRef.current + 1,
      expected: PADS[expected].id,
      pressed: PADS[padIdx].id,
    });
    goPhase("oops");
    after(RESULT_PAUSE_MS, endRun);
  };

  const replay = () => {
    if (phaseRef.current !== "input") return;
    logEvent("replay_request", { game_id: "G18", run: runRef.current, level: levelRef.current, step: stepRef.current });
    playSequence();
  };

  const finish = () => {
    const stars = starsFor(bestRef.current);
    logEvent("game_complete", { game_id: "G18", runs: runRef.current, best_score: bestRef.current, stars });
    onFinish(stars, bestRef.current);
  };

  if (phase === "intro") {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="จำให้ขึ้นใจ"
        objective="ดูไฟกะพริบทีละปุ่ม แล้วกดตามให้ถูกลำดับ ผ่านแต่ละด่าน ไฟจะยาวขึ้นอีก 1 ดวง ไปได้ไกลแค่ไหนก็ได้"
        choices={
          SHOW_REPLAY_BUTTON
            ? "ถ้ากดผิดแม้แต่ปุ่มเดียว จะจบรอบทันที ลืมลำดับเมื่อไหร่ กด “ดูอีกครั้ง” ก่อนได้"
            : "ถ้ากดผิดแม้แต่ปุ่มเดียว จะจบรอบทันที"
        }
        icon={Brain}
        onStart={() => {
          logEvent("game_intro_start", { game_id: "G18" });
          startRun();
        }}
      />
    );
  }

  if (phase === "result") {
    const newBest = runs > 1 && score > 0 && score === bestScore;
    return (
      <div className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col bg-white`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center gp-gap-20 gp-px-24 gp-py-28 text-center">
            <Trophy size={88} className="shrink-0 text-[#CA8A04]" aria-hidden="true" />
            <p className="gp-text-32 font-bold gp-leading-40 text-black">{score > 0 ? "เก่งมาก!" : "มาลองอีกรอบกัน!"}</p>
            {score > 0 ? (
              <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">
                ผ่านมาได้ <span className="font-bold text-[#2563EB]">{score}</span> ด่าน
                <br />
                จำไฟได้ยาวถึง {score} ดวง
              </p>
            ) : (
              <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">
                ด่านแรกมีไฟดวงเดียว ค่อย ๆ ดูแล้วกดตามได้เลย
              </p>
            )}
            {newBest && <p className="gp-text-24 font-bold gp-leading-32 text-[#15803D]">🎉 สถิติใหม่ของคุณ!</p>}
            {runs > 1 && (
              <p className="gp-text-22 font-semibold gp-leading-32 text-[#4B4B4B]">สถิติดีที่สุด: {bestScore} ด่าน</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gp-gap-14 gp-px-24 gp-pb-action-bar gp-pt-22">
          <Button3D onClick={startRun}>เล่นอีกครั้ง</Button3D>
          <button
            type="button"
            onClick={finish}
            className="min-h-[56px] rounded-[16px] border-2 border-solid border-[#CBD5E1] bg-white gp-text-22 font-bold text-[#1a1a1a]"
          >
            จบเกม
          </button>
        </div>
      </div>
    );
  }

  const length = level;
  const isInput = phase === "input";

  const status = (() => {
    switch (phase) {
      case "watch":
        return "จำปุ่มสีให้ดี";
      case "input":
        return "กดปุ่มสีตามที่เห็น";
      case "correct":
        return "✓ ถูกต้อง! เก่งมาก";
      case "oops":
        return "กดผิดปุ่ม — มาดูคะแนนกัน";
      default:
        return "";
    }
  })();

  return (
    <div
      className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col select-none`}
      style={{ backgroundImage: "linear-gradient(155.36deg, #E6F6FC 0%, #C4CFE1 100%)" }}
    >
      {/* Header card: same as G17 (GameStageHeader) — Figma leaves the left slot empty */}
      <GameStageHeader right={{ label: "ด่าน", value: level, ariaLabel: `ด่าน ${level}` }}>
        {/* QA only (same idea as G17) — clear the current level without playing it */}
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => {
              if (phaseRef.current === "correct" || phaseRef.current === "oops") return;
              logEvent("g18_dev_skip_level", { game_id: "G18", run: runRef.current, level: levelRef.current });
              completeLevel();
            }}
            className={`${HUD_DEV_BUTTON_CLASS} self-center`}
            data-dev-only="g18-skip-level"
          >
            จบรอบ
          </button>
        )}
      </GameStageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gp-gap-56 gp-px-24 gp-py-24">
          {/* Board + pads: Figma — 352px dark board, 2×2 raised pads, centre circle */}
          <div
            className={`relative aspect-square w-full rounded-[20px] gp-p-16 transition-[background-color,box-shadow] duration-150 ${
              phase === "correct" ? "bg-white shadow-[0_0_40px_rgba(255,255,255,1)]" : "bg-[#23233A]"
            }`}
            // keep the whole board on screen on most phones; very short screens scroll instead
            style={{ maxWidth: "min(352px, 58dvh)" }}
          >
            <div className="grid h-full w-full grid-cols-2 grid-rows-2 gp-gap-16">
              {PADS.map((pad, i) => {
                const isLit = lit === i;
                return (
                  <button
                    key={pad.id}
                    type="button"
                    aria-label={`ปุ่มสี${pad.colorName}`}
                    aria-disabled={!isInput}
                    onPointerDown={(e) => {
                      if (e.pointerType === "mouse" && e.button !== 0) return;
                      e.preventDefault();
                      press(i);
                    }}
                    // keyboard Enter/Space fires click with detail 0; pointer taps are already handled above
                    onClick={(e) => {
                      if (e.detail === 0) press(i);
                    }}
                    className={`relative touch-manipulation overflow-hidden rounded-[20px] border-0 p-0 transition-[box-shadow] duration-100 ${
                      isInput ? "cursor-pointer" : "cursor-default"
                    } ${isLit ? "z-10" : ""}`}
                    style={{
                      backgroundColor: pad.shadow,
                      boxShadow: isLit ? `0 0 40px 10px ${pad.glow}` : undefined,
                    }}
                  >
                    {/* face: raised PAD_LIFT_PX above the darker base, drops onto it while lit */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-[20px] transition-[transform,filter] duration-100"
                      style={{
                        backgroundColor: pad.color,
                        transform: isLit ? "translateY(0)" : `translateY(-${PAD_LIFT_PX}px)`,
                        filter: isLit ? "brightness(1.3)" : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>
            {/* centre circle: dark ring (Ellipse 21, 100px) + soft white face (Ellipse 20, 84px + 6px blur margin = 96px) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 z-20 aspect-square w-[28.41%] -translate-x-1/2 -translate-y-1/2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- small static SVGs from the Figma design */}
              <img src="/assets/g18/center-ring.svg" alt="" className="absolute inset-0 block h-full w-full" />
              {/* eslint-disable-next-line @next/next/no-img-element -- small static SVGs from the Figma design */}
              <img src="/assets/g18/center-face.svg" alt="" className="absolute top-[2%] left-[2%] block h-[96%] w-[96%]" />
            </div>
          </div>

          {/* status pill — which stage the player is in (watch the lights / press them back) */}
          <p
            role="status"
            aria-live="polite"
            className="rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white gp-px-12 gp-py-4 text-center gp-text-20 font-normal gp-leading-30 text-black"
          >
            {status}
          </p>

          <p className="sr-only">
            ลำดับนี้มี {length} ปุ่ม กดถูกแล้ว {step} ปุ่ม
          </p>

          {SHOW_REPLAY_BUTTON && (
            <button
              type="button"
              onClick={replay}
              disabled={!isInput}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-[16px] border-2 border-solid border-[#2563EB] bg-white gp-px-20 gp-text-22 font-bold text-[#1D4ED8] disabled:border-[#CBD5E1] disabled:text-[#64748B]"
            >
              <Eye size={26} aria-hidden="true" />
              ดูอีกครั้ง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
