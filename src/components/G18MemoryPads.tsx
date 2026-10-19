"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import GameStageHeader, { HUD_DEV_BUTTON_CLASS } from "./GameStageHeader";
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
 * - the centre circle lights up (Figma's soft white face) only while the sequence plays;
 *   the rest of the time it is a plain black circle
 * - pads press/release like the learning games' answer buttons (GameAnswerButton): the face slides
 *   down onto its darker base in 90ms while the finger is held (or the pad is lit), and springs back on release
 * - a "ดูอีกครั้ง" button can replay the sequence on the player's turn — hidden for now
 *   (SHOW_REPLAY_BUTTON) because the Figma design has none
 * - no input timeout
 * Tutorial — once each time the game is opened, before the first run: 3 practice levels (TUTORIAL_LEVELS),
 * header shows "โหมด ฝึกเล่น" (like G13) and nothing is scored — the real run then starts fresh at level 1.
 * The grey status pill keeps showing the game state only; the instructions go in their own tutorial box
 * above the board (styled like G13's: amber = what to do, green ✓ = done, grey = try again). A wrong tap
 * there replays the same lights instead of ending the run:
 *   1. as in the mock: once the light has played, the screen dims except for a hole around the pad
 *      to press, and a 👆 taps it (same press-and-lift hand + amber ring as G19/G13)
 *   2. how the pattern works: the old light comes first, then one new one — the hole and 👆 walk
 *      the player through both pads in order
 *   3. on their own (no hole/hand), to get used to the game before the real play
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
// oops = wrong tap, short pause before the score screen · retry = wrong tap in the tutorial, replays the lights
// stepok = guided tutorial, short pause after each right tap before pointing at the next pad
type Phase = "intro" | "watch" | "input" | "correct" | "oops" | "retry" | "stepok" | "result";

const PADS = DATA.pads as Pad[];

const LEAD_IN_MS = 900; // pause before the first light, so the player can look at the board
const TIMING = { on: 650, off: 300 };
const PRESS_FLASH_MS = 250;
const CORRECT_PAUSE_MS = 1300;
const RESULT_PAUSE_MS = 1600; // let the "wrong" message register before the score screen
// "ดูอีกครั้ง" (replay the sequence) — off to match the Figma design; flip back on if the final design has it
const SHOW_REPLAY_BUTTON = false;
// pad face sits this far above its darker base; a lit/pressed pad drops onto it (× --gp-s, like GameAnswerButton)
const PAD_LIFT = "calc(8px * var(--gp-s, 1))";
const PAD_PRESS_MS = 90; // face slide time — same as GameAnswerButton/Button3D
// Guided tutorial, as in the mock: hole padding/radius around the pad to press
const TUTORIAL_HOLE_PAD_PX = 8;
const TUTORIAL_HOLE_RADIUS_PX = 25;
// one press-and-lift loop of the 👆 (same keyframes as G19's guide; G19 also slides, so it loops slower)
const TUTORIAL_HAND_MS = 1800;
const TUTORIAL_LEVELS = 3; // levels played as the tutorial (see the comment at the top)
const TUTORIAL_GUIDED_LEVELS = 2; // … of which these get the dimmed screen + 👆
const TUTORIAL_CORRECT_PAUSE_MS = 2400; // longer, so the "what's next" message can be read
const TUTORIAL_RETRY_PAUSE_MS = 1800;
const TUTORIAL_STEP_PAUSE_MS = 1200; // "✓" between taps in the guided levels, before the hand moves on

type TutorialRect = { pad: number; x: number; y: number; w: number; h: number };
// Tutorial instruction box, styled like G13's: info = what to do, praise = ✓ done, retry = gentle try-again
type TutorialTip = { text: string; tone: "info" | "praise" | "retry" };

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
  const [held, setHeld] = useState<number | null>(null); // pad under the player's finger, pressed until release
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0); // best run since the game was opened
  const [runs, setRuns] = useState(0);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [nextIsSamePad, setNextIsSamePad] = useState(false); // guided tutorial: next pad = the one just pressed

  // Refs drive the game logic so two quick taps in one frame can't both read a stale phase/step.
  const phaseRef = useRef<Phase>("intro");
  const levelRef = useRef(1);
  const stepRef = useRef(0);
  const sequenceRef = useRef<number[]>([]);
  const runRef = useRef(0);
  const bestRef = useRef(0);
  const tutorialDoneRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const audioRef = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const padRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tutorialRect, setTutorialRect] = useState<TutorialRect | null>(null);

  const inTutorial = !tutorialDone && level <= TUTORIAL_LEVELS;
  // Dimmed screen + 👆 on the pad to press next, on the player's turn in the guided levels.
  const showTutorial = phase === "input" && inTutorial && level <= TUTORIAL_GUIDED_LEVELS;

  // Measure the pad to point at, relative to the stage the overlay covers. ResizeObserver fires once
  // on observe (before paint), then again if the layout changes while the tutorial is up.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!showTutorial || !stage) return;
    const measure = () => {
      const pad = sequenceRef.current[step];
      const btn = padRefs.current[pad];
      if (!btn) return;
      const s = stage.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      setTutorialRect({ pad, x: b.left - s.left, y: b.top - s.top, w: b.width, h: b.height });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [showTutorial, step]);

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

  const isTutorialLevel = () => !tutorialDoneRef.current && levelRef.current <= TUTORIAL_LEVELS;

  const startLevel = (n: number) => {
    // tutorial finished: the real game starts fresh at level 1 (new lights), so practice levels never score
    if (n > TUTORIAL_LEVELS && !tutorialDoneRef.current) {
      tutorialDoneRef.current = true;
      setTutorialDone(true);
      logEvent("tutorial_complete", { game_id: "G18" });
      startRun();
      return;
    }
    levelRef.current = n;
    setLevel(n);
    sequenceRef.current.push(nextPad(sequenceRef.current));
    logEvent("enter_level", { game_id: "G18", run: runRef.current, level: n, tutorial: isTutorialLevel() });
    playSequence();
  };

  // The first call each time the game is opened plays the tutorial (not a run: run stays 0, nothing scored);
  // startLevel calls this again once it is done to begin run 1.
  const startRun = () => {
    ensureAudio();
    clearTimers();
    sequenceRef.current = [];
    if (!tutorialDoneRef.current) {
      logEvent("tutorial_start", { game_id: "G18" });
    } else {
      runRef.current += 1;
      setRuns(runRef.current);
      logEvent("run_start", { game_id: "G18", run: runRef.current });
    }
    startLevel(1);
  };

  const completeLevel = () => {
    clearTimers();
    setLit(null);
    goPhase("correct");
    const n = levelRef.current;
    logEvent("level_complete", { game_id: "G18", run: runRef.current, level: n, tutorial: isTutorialLevel() });
    after(isTutorialLevel() ? TUTORIAL_CORRECT_PAUSE_MS : CORRECT_PAUSE_MS, () => startLevel(n + 1));
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
      if (next === sequenceRef.current.length) {
        completeLevel();
      } else if (isTutorialLevel() && levelRef.current <= TUTORIAL_GUIDED_LEVELS) {
        // guided tutorial: a short "✓" pause (hand + dimming hidden) so the player sees the tap counted,
        // then the hand comes back on the next pad with its own instruction
        setNextIsSamePad(sequenceRef.current[next] === padIdx);
        goPhase("stepok");
        after(TUTORIAL_STEP_PAUSE_MS, () => goPhase("input"));
      }
      return;
    }

    logEvent("wrong_press", {
      game_id: "G18",
      run: runRef.current,
      level: levelRef.current,
      step: stepRef.current + 1,
      expected: PADS[expected].id,
      pressed: PADS[padIdx].id,
      tutorial: isTutorialLevel(),
    });
    // tutorial: no game over — say so gently and show the same lights again
    if (isTutorialLevel()) {
      goPhase("retry");
      after(TUTORIAL_RETRY_PAUSE_MS, playSequence);
      return;
    }
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

  // Tutorial instruction (own box above the board, null = nothing to add this phase). Praise gets its ✓ from the box.
  const tutorialTip = ((): TutorialTip | null => {
    if (!inTutorial) return null;
    const info = (text: string): TutorialTip => ({ text, tone: "info" });
    const praise = (text: string): TutorialTip => ({ text, tone: "praise" });
    switch (phase) {
      case "watch":
        if (level === 1) return info("ดูให้ดีว่าปุ่มไหนกะพริบ");
        if (level === 2) return info("ไฟดวงเดิมจะมาก่อน\nแล้วตามด้วยดวงใหม่อีก 1 ดวง");
        return info("ลองเองเลย! จำไฟให้ครบ 3 ดวง");
      case "input":
        if (level === 1) return info("กดปุ่มที่มือชี้");
        if (level === 2) {
          if (step === 0) return info("กดดวงเดิมก่อน");
          return info(nextIsSamePad ? "ดวงใหม่เป็นปุ่มเดิม\nกดปุ่มเดิมอีกครั้ง" : "แล้วกดดวงใหม่ต่อ");
        }
        return info("กดตามลำดับให้ครบ 3 ดวง");
      case "correct":
        if (level === 1) return praise("ถูกต้อง!\nด่านต่อไปไฟจะเพิ่มอีก 1 ดวง");
        if (level === 2) return praise("เก่งมาก!\nด่านต่อไปลองเองนะ");
        return praise("เก่งมาก! ต่อไปเล่นจริงเริ่มด่าน 1\nกดผิดจะจบรอบนะ");
      case "retry":
        return { text: "ยังไม่ใช่ปุ่มนี้\nมาดูไฟอีกครั้งนะ", tone: "retry" };
      case "stepok":
        return praise("ถูกต้อง!");
      default:
        return null;
    }
  })();

  // Grey status pill: the game state only (tutorial or not) — instructions go in the tutorial box
  const status = (() => {
    switch (phase) {
      case "watch":
        return "จำปุ่มสีให้ดี";
      case "input":
      case "stepok":
        return "กดปุ่มสีตามที่เห็น";
      case "correct":
        return "✓ ถูกต้อง! เก่งมาก";
      case "retry":
        return "กดผิดปุ่ม — ดูไฟอีกครั้ง";
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
      <GameStageHeader
        right={
          inTutorial
            ? { label: "โหมด", value: "ฝึกเล่น", ariaLabel: "กำลังฝึกเล่น" }
            : { label: "ด่าน", value: level, ariaLabel: `ด่าน ${level}` }
        }
      >
        {/* QA only (same idea as G17) — clear the current level without playing it */}
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => {
              if (phaseRef.current === "correct" || phaseRef.current === "oops" || phaseRef.current === "retry") return;
              logEvent("g18_dev_skip_level", { game_id: "G18", run: runRef.current, level: levelRef.current });
              completeLevel();
            }}
            className={HUD_DEV_BUTTON_CLASS}
            data-dev-only="g18-skip-level"
          >
            จบรอบ
          </button>
        )}
      </GameStageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          ref={stageRef}
          className="relative flex min-h-full flex-col items-center justify-center gp-gap-56 gp-px-24 gp-py-24"
        >
          {/* tutorial box + board: the box sits just above the board, closer than the status pill below */}
          <div className="flex w-full flex-col items-center gp-gap-16">
            {/* Tutorial instruction box (like G13's), above the dimmed layer. Its slot keeps two lines of room for
                the whole tutorial, so the board doesn't jump between steps; it goes once the real game starts. */}
            {inTutorial && (
              <div aria-live="polite" className="relative z-40 flex w-full gp-min-h-84 items-center justify-center">
                {tutorialTip && (
                  <p
                    className={`max-w-[352px] whitespace-pre-line rounded-[16px] border-2 border-solid bg-white gp-px-16 gp-py-8 text-center gp-text-22 font-bold gp-leading-30 shadow-md ${
                      tutorialTip.tone === "praise"
                        ? "border-emerald-500 text-emerald-800"
                        : tutorialTip.tone === "retry"
                          ? "border-slate-300 text-slate-700"
                          : "border-amber-400 text-amber-950"
                    }`}
                  >
                    {tutorialTip.tone === "praise" && <span aria-hidden="true">✓ </span>}
                    {tutorialTip.text}
                  </p>
                )}
              </div>
            )}

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
                  const isDown = isLit || held === i;
                  const release = () => setHeld((cur) => (cur === i ? null : cur));
                  return (
                    <button
                      key={pad.id}
                      ref={(el) => {
                        padRefs.current[i] = el;
                      }}
                      type="button"
                      aria-label={`ปุ่มสี${pad.colorName}`}
                      aria-disabled={!isInput}
                      onPointerDown={(e) => {
                        if (e.pointerType === "mouse" && e.button !== 0) return;
                        e.preventDefault();
                        if (phaseRef.current === "input") setHeld(i);
                        press(i);
                      }}
                      // touch pointers are captured by the pad, so leave only fires for a mouse dragged off it
                      onPointerUp={release}
                      onPointerCancel={release}
                      onPointerLeave={release}
                      // keyboard Enter/Space fires click with detail 0; pointer taps are already handled above
                      onClick={(e) => {
                        if (e.detail === 0) press(i);
                      }}
                      className={`relative touch-manipulation rounded-[20px] border-0 bg-transparent p-0 ${
                        isInput ? "cursor-pointer" : "cursor-default"
                      } ${isDown ? "z-10" : ""}`}
                    >
                      {/* Built like GameAnswerButton: the darker base is its own layer at the bottom and the face
                          sits PAD_LIFT above it. Pressed, the face slides down over the base and the base hides
                          only once fully covered (no dark sliver at the rounded corners); on release it comes back at once. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 rounded-[20px] transition-opacity duration-0"
                        style={{
                          height: `calc(100% - ${PAD_LIFT})`,
                          backgroundColor: pad.shadow,
                          opacity: isDown ? 0 : 1,
                          transitionDelay: isDown ? `${PAD_PRESS_MS}ms` : "0ms",
                        }}
                      />
                      <span
                        aria-hidden="true"
                        // the glow is on the face, not the button, so it moves with it — on the button it framed
                        // the empty strip the face leaves at the top when pressed, showing a dark shape behind
                        className="absolute inset-x-0 top-0 rounded-[20px] transition-[transform,filter,box-shadow] ease-out"
                        style={{
                          height: `calc(100% - ${PAD_LIFT})`,
                          backgroundColor: pad.color,
                          transitionDuration: `${PAD_PRESS_MS}ms`,
                          transform: isDown ? `translateY(${PAD_LIFT})` : "translateY(0)",
                          filter: isDown ? "brightness(1.3)" : undefined,
                          boxShadow: isDown ? `0 0 40px 10px ${pad.glow}` : undefined,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
              {/* centre circle: dark ring (Ellipse 21, 100px) + soft white face (Ellipse 20, 84px + 6px blur margin = 96px).
                  The face only shows while the sequence plays; otherwise the ring's inside (r 42 of 50) is plain black. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 z-20 aspect-square w-[28.41%] -translate-x-1/2 -translate-y-1/2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small static SVGs from the Figma design */}
                <img src="/assets/g18/center-ring.svg" alt="" className="absolute inset-0 block h-full w-full" />
                <span className="absolute inset-[8%] rounded-full bg-black" />
                {/* eslint-disable-next-line @next/next/no-img-element -- small static SVGs from the Figma design */}
                <img
                  src="/assets/g18/center-face.svg"
                  alt=""
                  className={`absolute top-[2%] left-[2%] block h-[96%] w-[96%] transition-opacity duration-300 ${
                    phase === "watch" ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Guided tutorial (mock): dark layer with a rounded hole over the pad to press, and the 👆 tapping it —
              same hand as G19/G13: fingertip on the pad, presses down (smaller, amber ring) and lifts, on a loop.
              Doesn't block taps, like the mock. Drawn with one huge box-shadow instead of the mock's canvas. */}
          {showTutorial && tutorialRect && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
              <div
                className="absolute"
                style={{
                  left: tutorialRect.x - TUTORIAL_HOLE_PAD_PX,
                  top: tutorialRect.y - TUTORIAL_HOLE_PAD_PX,
                  width: tutorialRect.w + TUTORIAL_HOLE_PAD_PX * 2,
                  height: tutorialRect.h + TUTORIAL_HOLE_PAD_PX * 2,
                  borderRadius: TUTORIAL_HOLE_RADIUS_PX,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
                }}
              />
              {/* zero-size anchor at the pad's centre = where the fingertip presses */}
              <div
                className="absolute"
                style={{ left: tutorialRect.x + tutorialRect.w / 2, top: tutorialRect.y + tutorialRect.h / 2 }}
              >
                <span
                  className="g19-guide-ring absolute left-0 top-0 block h-[44px] w-[44px] rounded-full border-4 border-solid border-[#F59E0B] bg-[#FDE68A]/55"
                  style={{ animationDuration: `${TUTORIAL_HAND_MS}ms` }}
                />
                <span
                  className="g19-guide-finger absolute left-0 top-[-4px] block text-[60px] leading-none"
                  style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))", animationDuration: `${TUTORIAL_HAND_MS}ms` }}
                >
                  👆
                </span>
              </div>
            </div>
          )}

          {/* status pill — game state only (watch the lights / press them back / right / wrong), also in the
              tutorial, whose instructions have their own box above the board; stays above the dimmed layer */}
          <p
            role="status"
            aria-live="polite"
            className="relative z-40 whitespace-pre-line rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white gp-px-12 gp-py-4 text-center gp-text-20 font-normal gp-leading-30 text-black"
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
