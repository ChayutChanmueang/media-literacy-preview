"use client";

import React, { useEffect, useRef, useState } from "react";
import GameHudBar, { GameHudItem, HUD_DEV_BUTTON_CLASS } from "./GameHudBar";
import { Hand, Salad, Trophy } from "lucide-react";
import { mali, notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";
import GameIntro from "@/components/GameIntro";

/**
 * G20 — ผักบุ้งลอยฟ้า (flick-to-basket)
 *
 * Ported from the team's "shootball7.html" mock: touch the pan and flick upwards to toss the
 * morning glory (🥬) into the bowl (canvas-drawn, side view) at the top; it can bounce off the left/right walls.
 * Every serve is a new level — level 1 the plate is centred, level 2 it moves to a random spot,
 * level 3+ it slides left and right, a little faster each level.
 * A pure fun game — no lesson content.
 * Same canvas scene as the mock (540×960 stage, pan, physics, catch zone, level ramp, colours).
 * Differences from the HTML mock, to follow AGENT.md (elderly-first):
 * - the 60-second timer is replaced by a throw budget (THROWS_PER_RUN), like G19's move budget
 * - the "จบเกม" overlay is replaced by a positive result screen with play again / finish;
 *   the mock's start overlay is replaced by the shared GameIntro
 * - the mock's floating pills are replaced by the G18/G19 header (level left, throws left right);
 *   no on-screen guide text, but a screen-reader-only status line (what to do, served / missed)
 * - a short pause in the bowl after a serve so the player sees it land (the mock jumped straight
 *   to the next level)
 * - plate speed is capped lower (MAX_PLATE_SPEED 6, mock: 8)
 * - physics runs on elapsed time, not per frame, so 90/120 Hz phones don't play at double speed
 * - the counter colours are darker for contrast
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "intro" | "play" | "result";
type FinishPopup = "enter" | "show" | "leave" | null;
// idle = in the pan, ready · served = sitting on the plate · done = run over, no more throws
type VeggieState = "idle" | "dragging" | "flying" | "served" | "done";

type World = {
  veggie: { x: number; y: number; vx: number; vy: number; state: VeggieState; plateOffset: number };
  plate: { x: number; speed: number; direction: number };
  drag: { startX: number; startY: number; x: number; y: number } | null;
};

// Stage + physics: same numbers as the mock (per 60 fps frame)
const GAME_W = 540;
const GAME_H = 960;
const GRAVITY = 0.8;
const POWER = 0.08;
const MAX_UP_SPEED = 38;
const MIN_DRAG_UP = 20; // a shorter upward drag doesn't throw
const WALL_BOUNCE = 0.8;
const VEGGIE_RADIUS = 40;
const VEGGIE_HOME = { x: GAME_W / 2, y: GAME_H - 110 };
const PAN = { x: GAME_W / 2, y: GAME_H - 80 };
const PLATE_Y = 200;
const PLATE_W = 140;
const PLATE_CATCH = 30; // catch window above/below the plate's centre line
const PLATE_MARGIN = 40;
const MAX_PLATE_SPEED = 6;
const FRAME_MS = 1000 / 60;

const THROWS_PER_RUN = 15;
const SERVED_PAUSE_MS = 900;
// "you finished" text over the stage after the last throw: fade/zoom in, hold, fade out (as G19)
const FINISH_IN_MS = 500;
const FINISH_HOLD_MS = 1800;
const FINISH_OUT_MS = 450;

const EMOJI_FONT = `"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", Arial, sans-serif`;
const BACKGROUND = "linear-gradient(180deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)";

const DEFAULT_MESSAGE = "แตะที่กระทะ แล้วลากนิ้วขึ้น ปล่อยนิ้วเพื่อโยน";

function starsFor(served: number) {
  if (served >= 8) return 3;
  if (served >= 4) return 2;
  return 1;
}

// Mock's updateLevelDifficulty
function plateFor(level: number): World["plate"] {
  if (level === 1) return { x: GAME_W / 2, speed: 0, direction: 1 };
  return {
    x: 100 + Math.random() * (GAME_W - 200),
    speed: level >= 3 ? Math.min(2 + (level - 3) * 0.5, MAX_PLATE_SPEED) : 0,
    direction: Math.random() > 0.5 ? 1 : -1,
  };
}

function levelMessage(level: number) {
  if (level === 2) return "เลเวล 2 — จานย้ายที่แล้ว เล็งใหม่นะ";
  if (level === 3) return "เลเวล 3 — จานเริ่มเลื่อนไปมาแล้ว";
  return `เลเวล ${level} แล้ว โยนต่อเลย`;
}

function homeVeggie(state: VeggieState): World["veggie"] {
  return { ...VEGGIE_HOME, vx: 0, vy: 0, state, plateOffset: 0 };
}

// Mock's drawPan
function drawPan(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = "#4a4a4a";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(PAN.x - 60, PAN.y);
  ctx.lineTo(PAN.x - 130, PAN.y - 40);
  ctx.stroke();

  ctx.fillStyle = "#2c3e50";
  ctx.beginPath();
  ctx.arc(PAN.x, PAN.y, 75, 0, Math.PI, false);
  ctx.fill();

  ctx.fillStyle = "#1a252f";
  ctx.beginPath();
  ctx.ellipse(PAN.x, PAN.y, 75, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Side-view bowl, rim centred on (x, PLATE_Y). Drawn in two layers so a served veggie can sit
// between them and look like it's inside: the back = the shaded opening, the front = the body + rim.
const BOWL_RX = PLATE_W / 2;
const BOWL_RIM_RY = 14;
const BOWL_DEPTH = 62;

function drawBowlBack(ctx: CanvasRenderingContext2D, x: number) {
  ctx.save();
  // inside of the bowl: grey shade, the far inner wall lit (top), darker under the front rim (bottom)
  const inside = ctx.createLinearGradient(0, PLATE_Y - BOWL_RIM_RY, 0, PLATE_Y + BOWL_RIM_RY);
  inside.addColorStop(0, "#d5dbde");
  inside.addColorStop(1, "#8e989e");
  ctx.fillStyle = inside;
  ctx.beginPath();
  ctx.ellipse(x, PLATE_Y, BOWL_RX - 4, BOWL_RIM_RY - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // back lip of the rim
  ctx.strokeStyle = "#dfe6ea";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x, PLATE_Y, BOWL_RX - 2, BOWL_RIM_RY, 0, Math.PI, Math.PI * 2, false);
  ctx.stroke();
  ctx.restore();
}

function drawBowlFront(ctx: CanvasRenderingContext2D, x: number) {
  ctx.save();
  // foot
  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(x, PLATE_Y + BOWL_DEPTH, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // body: lower half of an ellipse hanging from the rim, its top edge following the front of the rim
  // (not the straight rim line) so the near half of the opening stays visible as the grey inside
  const body = ctx.createLinearGradient(x - BOWL_RX, 0, x + BOWL_RX, 0);
  body.addColorStop(0, "#dfe6ea");
  body.addColorStop(0.35, "#ffffff");
  body.addColorStop(1, "#b9c4ca");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, PLATE_Y, BOWL_RX, BOWL_DEPTH, 0, 0, Math.PI, false);
  ctx.ellipse(x, PLATE_Y, BOWL_RX, BOWL_RIM_RY, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  // blue band just under the rim
  ctx.strokeStyle = "#2e6fb7";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x, PLATE_Y + 4, BOWL_RX - 3, BOWL_RIM_RY + 8, 0, 0.12 * Math.PI, 0.88 * Math.PI, false);
  ctx.stroke();

  // front lip of the rim
  ctx.strokeStyle = "#f5f7f8";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x, PLATE_Y, BOWL_RX - 2, BOWL_RIM_RY, 0, 0, Math.PI, false);
  ctx.stroke();
  ctx.restore();
}

// Aim arrow (replaces the mock's dashed line): a long thin diamond from the veggie to the drag point,
// with an arrowhead on top. Length = drag length (= power); width scales with it so the shape keeps its look.
// Points are [along the arrow 0 → 1 (tail → tip), across it as a fraction of the length].
const AIM_ARROW: [number, number][] = [
  [0, 0],
  [0.777, 0.04375],
  [0.743, 0.0875],
  [1, 0],
  [0.743, -0.0875],
  [0.777, -0.04375],
];
// Drag length that hits the top throw speed (straight up) — the arrow is fully red from here on
const AIM_MAX_LENGTH = MAX_UP_SPEED / (POWER * 1.5);

function drawAimArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  const length = Math.hypot(dx, dy);
  if (length < 1) return;
  const ux = dx / length; // along
  const uy = dy / length;
  ctx.save();
  ctx.beginPath();
  AIM_ARROW.forEach(([along, across], i) => {
    const px = x + ux * along * length - uy * across * length;
    const py = y + uy * along * length + ux * across * length;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#ffffff"; // white edge keeps the red arrow visible over the red middle of the background
  ctx.lineWidth = 5;
  ctx.stroke();
  // power colour: green at the veggie → yellow → red at max power, so a short drag stays green
  const power = ctx.createLinearGradient(x, y, x + ux * AIM_MAX_LENGTH, y + uy * AIM_MAX_LENGTH);
  power.addColorStop(0, "#22C55E");
  power.addColorStop(0.5, "#FACC15");
  power.addColorStop(1, "#EF4444");
  ctx.fillStyle = power;
  ctx.fill();
  ctx.restore();
}

export default function G20VeggieToss({ onFinish, logEvent }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [level, setLevel] = useState(1);
  const [throwsLeft, setThrowsLeft] = useState(THROWS_PER_RUN);
  const [stage, setStage] = useState<{ w: number; h: number; dpr: number } | null>(null);
  const [finishPopup, setFinishPopup] = useState<FinishPopup>(null);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [bestServed, setBestServed] = useState(0); // best run since the game was opened
  const [runs, setRuns] = useState(0);

  // Refs drive the game (read every animation frame); state above is only what the DOM shows.
  const worldRef = useRef<World>({ veggie: homeVeggie("idle"), plate: plateFor(1), drag: null });
  const levelRef = useRef(1);
  const throwsRef = useRef(THROWS_PER_RUN);
  const bestRef = useRef(0);
  const runRef = useRef(0);
  const playingRef = useRef(false);
  const genRef = useRef(0); // bumped on new run/unmount so stale async steps stop
  const timersRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<(step: number) => void>(() => {});

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(
    () => () => {
      genRef.current += 1;
      clearTimers();
    },
    []
  );

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      timersRef.current.push(window.setTimeout(resolve, ms));
    });

  const say = (text: string) => setMessage(text); // screen readers only (role="status")

  const served = level - 1;

  const endRun = () => {
    playingRef.current = false;
    clearTimers();
    const finalServed = levelRef.current - 1;
    bestRef.current = Math.max(bestRef.current, finalServed);
    setBestServed(bestRef.current);
    logEvent("run_end", {
      game_id: "G20",
      run: runRef.current,
      served: finalServed,
      level: levelRef.current,
      best_served: bestRef.current,
    });
    setPhase("result");
  };

  const finishRun = async (gen: number) => {
    // a served veggie stays on the plate while the popup plays; a missed one goes back to the pan, locked
    if (worldRef.current.veggie.state !== "served") worldRef.current.veggie = homeVeggie("done");
    say(`โยนครบ ${THROWS_PER_RUN} ครั้งแล้ว มาดูผลกัน`);
    setFinishPopup("enter"); // mounted hidden first so the next change transitions in
    await delay(30);
    if (gen !== genRef.current) return;
    setFinishPopup("show");
    await delay(FINISH_IN_MS + FINISH_HOLD_MS);
    if (gen !== genRef.current) return;
    setFinishPopup("leave");
    await delay(FINISH_OUT_MS);
    if (gen !== genRef.current) return;
    setFinishPopup(null);
    endRun();
  };

  const onServe = async () => {
    const gen = genRef.current;
    const world = worldRef.current;
    const v = world.veggie;
    v.state = "served";
    v.vx = 0;
    v.vy = 0;
    v.y = PLATE_Y + 8; // lower half hidden by the bowl's front, so it reads as "in the bowl"
    v.plateOffset = Math.max(-30, Math.min(30, v.x - world.plate.x)); // keep the leaves inside the bowl's opening
    levelRef.current += 1;
    setLevel(levelRef.current);
    say("✓ ลงจานแล้ว! เก่งมาก");
    logEvent("serve", { game_id: "G20", run: runRef.current, level: levelRef.current, throws_left: throwsRef.current });

    await delay(SERVED_PAUSE_MS);
    if (gen !== genRef.current) return;
    if (throwsRef.current <= 0) {
      void finishRun(gen);
      return;
    }
    world.plate = plateFor(levelRef.current);
    world.veggie = homeVeggie("idle");
    say(levelMessage(levelRef.current));
  };

  const onMiss = () => {
    const world = worldRef.current;
    logEvent("miss", { game_id: "G20", run: runRef.current, level: levelRef.current, throws_left: throwsRef.current });
    if (throwsRef.current <= 0) {
      void finishRun(genRef.current);
      return;
    }
    world.veggie = homeVeggie("idle");
    say("ยังไม่ลงจาน ลองใหม่นะ 💪 ชิ่งกำแพงข้าง ๆ ก็ได้");
  };

  // Mock's update(), scaled by `step` (1 = one 60 fps frame)
  const update = (step: number) => {
    const { plate, veggie } = worldRef.current;

    if (plate.speed > 0) {
      plate.x += plate.speed * plate.direction * step;
      if (plate.x - PLATE_W / 2 < PLATE_MARGIN) {
        plate.x = PLATE_MARGIN + PLATE_W / 2;
        plate.direction = 1;
      } else if (plate.x + PLATE_W / 2 > GAME_W - PLATE_MARGIN) {
        plate.x = GAME_W - PLATE_MARGIN - PLATE_W / 2;
        plate.direction = -1;
      }
    }

    if (veggie.state === "served") {
      veggie.x = plate.x + veggie.plateOffset; // rides along with a moving plate
      return;
    }
    if (veggie.state !== "flying") return;

    const prevY = veggie.y;
    veggie.vy += GRAVITY * step;
    veggie.x += veggie.vx * step;
    veggie.y += veggie.vy * step;

    if (veggie.x - VEGGIE_RADIUS < 0) {
      veggie.x = VEGGIE_RADIUS;
      veggie.vx *= -WALL_BOUNCE;
    } else if (veggie.x + VEGGIE_RADIUS > GAME_W) {
      veggie.x = GAME_W - VEGGIE_RADIUS;
      veggie.vx *= -WALL_BOUNCE;
    }

    // Falling through the catch window this frame (checks the whole path, so a fast fall can't skip it)
    if (
      veggie.vy > 0 &&
      prevY <= PLATE_Y + PLATE_CATCH &&
      veggie.y >= PLATE_Y - PLATE_CATCH &&
      Math.abs(veggie.x - plate.x) < PLATE_W / 2
    ) {
      void onServe();
    } else if (veggie.y > GAME_H + 100) {
      onMiss();
    }
  };

  // Mock's draw()
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { plate, veggie, drag } = worldRef.current;
    const scale = canvas.width / GAME_W;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    if (veggie.state === "dragging" && drag) {
      drawAimArrow(ctx, veggie.x, veggie.y, drag.x - drag.startX, drag.y - drag.startY);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    drawBowlBack(ctx, plate.x);
    ctx.font = `80px ${EMOJI_FONT}`;
    if (veggie.state === "served") ctx.fillText("🥬", veggie.x, veggie.y); // tucked between the bowl layers
    drawBowlFront(ctx, plate.x);

    drawPan(ctx);

    ctx.font = `80px ${EMOJI_FONT}`;
    if (veggie.state !== "served") ctx.fillText("🥬", veggie.x, veggie.y);
  };

  // The loop below keeps one tick for the whole run; it calls the latest update/draw through this ref.
  useEffect(() => {
    frameRef.current = (step: number) => {
      if (playingRef.current) update(step);
      draw();
    };
  });

  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const step = Math.min((now - last) / FRAME_MS, 3); // cap: a background tab mustn't teleport the veggie
      last = now;
      frameRef.current(step);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Fit the 9:16 stage into whatever space is left under the status line
  useEffect(() => {
    if (phase !== "play") return;
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.floor(Math.min(width, (height * GAME_W) / GAME_H));
      setStage({ w, h: Math.floor((w * GAME_H) / GAME_W), dpr: Math.min(window.devicePixelRatio || 1, 2) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [phase]);

  const toGame = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * GAME_W) / rect.width,
      y: ((e.clientY - rect.top) * GAME_H) / rect.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current;
    if (!playingRef.current || world.veggie.state !== "idle") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pos = toGame(e);
    if (pos.y <= GAME_H / 2) return; // like the mock: the flick starts in the lower half
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    world.drag = { startX: pos.x, startY: pos.y, x: pos.x, y: pos.y };
    world.veggie.state = "dragging";
    say("ลากขึ้นไปทางจาน แล้วปล่อยนิ้ว");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current;
    if (world.veggie.state !== "dragging" || !world.drag) return;
    const pos = toGame(e);
    world.drag.x = pos.x;
    world.drag.y = pos.y;
  };

  const onPointerUp = () => {
    const world = worldRef.current;
    const { veggie, drag } = world;
    world.drag = null;
    if (veggie.state !== "dragging" || !drag) return;

    const dx = drag.x - drag.startX;
    const dy = drag.y - drag.startY;
    if (dy >= -MIN_DRAG_UP) {
      veggie.state = "idle";
      say("ลากขึ้นด้านบนอีกนิด แล้วปล่อยนิ้วนะ");
      return;
    }
    veggie.vx = dx * POWER;
    veggie.vy = Math.max(dy * POWER * 1.5, -MAX_UP_SPEED);
    veggie.state = "flying";
    throwsRef.current -= 1;
    setThrowsLeft(throwsRef.current);
    say("🥬 ลอยไปแล้ว!");
    logEvent("throw", {
      game_id: "G20",
      run: runRef.current,
      throw: THROWS_PER_RUN - throwsRef.current,
      level: levelRef.current,
      vx: Math.round(veggie.vx * 10) / 10,
      vy: Math.round(veggie.vy * 10) / 10,
    });
  };

  const onPointerCancel = () => {
    const world = worldRef.current;
    world.drag = null;
    if (world.veggie.state === "dragging") world.veggie.state = "idle";
  };

  const startRun = () => {
    genRef.current += 1;
    clearTimers();
    worldRef.current = { veggie: homeVeggie("idle"), plate: plateFor(1), drag: null };
    levelRef.current = 1;
    throwsRef.current = THROWS_PER_RUN;
    playingRef.current = true;
    runRef.current += 1;
    setRuns(runRef.current);
    setLevel(1);
    setThrowsLeft(THROWS_PER_RUN);
    setFinishPopup(null);
    say(DEFAULT_MESSAGE);
    setPhase("play");
    logEvent("run_start", { game_id: "G20", run: runRef.current });
  };

  const finish = () => {
    const stars = starsFor(bestRef.current);
    logEvent("game_complete", { game_id: "G20", runs: runRef.current, best_served: bestRef.current, stars });
    onFinish(stars);
  };

  if (phase === "intro") {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="ผักบุ้งลอยฟ้า"
        objective="แตะที่กระทะแล้วลากนิ้วขึ้น โยนผักบุ้งให้ลอยขึ้นไปลงจานด้านบน โยนชิ่งกำแพงซ้าย-ขวาก็ได้ ลงจานแล้วจะขึ้นเลเวลใหม่"
        choices={`โยนได้ ${THROWS_PER_RUN} ครั้ง ไม่จับเวลา ค่อย ๆ เล็งได้เลย`}
        icon={Salad}
        onStart={() => {
          logEvent("game_intro_start", { game_id: "G20" });
          startRun();
        }}
      />
    );
  }

  if (phase === "result") {
    // same end screen as G18 / G19: trophy, title, one score line, best-score lines, Button3D + "จบเกม"
    const newBest = runs > 1 && served > 0 && served === bestServed;
    return (
      <div className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col bg-white`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center gp-gap-20 gp-px-24 gp-py-28 text-center">
            <Trophy size={88} className="shrink-0 text-[#CA8A04]" aria-hidden="true" />
            <p className="gp-text-32 font-bold gp-leading-40 text-black">{served > 0 ? "เก่งมาก!" : "มาลองอีกรอบกัน!"}</p>
            {served > 0 ? (
              <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">
                เสิร์ฟลงจานได้ <span className="font-bold text-[#B45309]">{served}</span> จาน
                <br />
                ไปถึงเลเวล {level}
              </p>
            ) : (
              <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">
                แตะที่กระทะแล้วลากนิ้วขึ้น เล็งไปที่จานได้เลย
              </p>
            )}
            {newBest && <p className="gp-text-24 font-bold gp-leading-32 text-[#15803D]">🎉 สถิติใหม่ของคุณ!</p>}
            {runs > 1 && (
              <p className="gp-text-22 font-semibold gp-leading-32 text-[#4B4B4B]">สถิติดีที่สุด: {bestServed} จาน</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gp-gap-14 gp-px-24 gp-pb-64 gp-pt-22">
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

  return (
    <div
      className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col select-none`}
      style={{ background: BACKGROUND }}
    >
      {/* Header: same bar as G13 / G18 / G19 (GameHudBar) — throws left on the left, level reached right */}
      <GameHudBar
        left={<GameHudItem icon={Hand}>โยนได้อีก {throwsLeft}</GameHudItem>}
        right={
          <GameHudItem icon={Trophy} tone="score">
            เลเวล {level}
          </GameHudItem>
        }
      >
        {/* QA only (same idea as G19's) — end the run now to check the result screen */}
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => {
              if (!playingRef.current) return;
              genRef.current += 1;
              logEvent("g20_dev_end_run", { game_id: "G20", run: runRef.current, throws_left: throwsRef.current });
              endRun();
            }}
            className={HUD_DEV_BUTTON_CLASS}
            data-dev-only="g20-end-run"
          >
            จบรอบ
          </button>
        )}
      </GameHudBar>

      {/* No on-screen guide; the status text is kept for screen readers only */}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>

      <div ref={wrapRef} className="flex min-h-0 w-full flex-1 items-center justify-center gp-px-8 gp-py-12">
        {stage && stage.w > 0 && (
          <div
            className="relative shrink-0 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)]"
            style={{ width: stage.w, height: stage.h, containerType: "inline-size" }}
          >
            <canvas
              ref={canvasRef}
              width={Math.round(stage.w * stage.dpr)}
              height={Math.round(stage.h * stage.dpr)}
              aria-label="สนามโยนผักบุ้ง: กระทะอยู่ด้านล่าง จานอยู่ด้านบน"
              role="img"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              className="block h-full w-full touch-none"
            />
            {/* Finish text over the stage (as G19). aria-hidden: the screen-reader status already says the run is over. */}
            {finishPopup && (
              <div
                aria-hidden="true"
                className={`${mali.className} pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-2 text-center text-white`}
                style={{
                  opacity: finishPopup === "show" ? 1 : 0,
                  transform:
                    finishPopup === "enter" ? "scale(0.7)" : finishPopup === "leave" ? "scale(1.08)" : "scale(1)",
                  transition:
                    finishPopup === "leave"
                      ? `opacity ${FINISH_OUT_MS}ms ease-in, transform ${FINISH_OUT_MS}ms ease-in`
                      : `opacity ${FINISH_IN_MS}ms ease-out, transform ${FINISH_IN_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  WebkitTextStroke: "8px #7C2D12",
                  paintOrder: "stroke fill",
                  textShadow: "0 4px 12px rgba(0,0,0,0.35)",
                }}
              >
                {/* sized to the stage (cqw) so it still fits when the stage is small */}
                <p className="font-bold leading-[1.3]" style={{ fontSize: "clamp(24px, 16cqw, 56px)" }}>
                  เก่งมาก! 🎉
                </p>
                <p className="font-bold leading-[1.4]" style={{ fontSize: "clamp(20px, 9cqw, 32px)" }}>
                  โยนครบ {THROWS_PER_RUN} ครั้งแล้ว
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
