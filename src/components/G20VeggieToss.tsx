"use client";

import React, { useEffect, useRef, useState } from "react";
import GameStageHeader, { HUD_DEV_BUTTON_CLASS } from "./GameStageHeader";
import { Salad, Trophy } from "lucide-react";
import { mali, notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";
import GameIntro from "@/components/GameIntro";

/**
 * G20 — ผักบุ้งลอยฟ้า (flick-to-basket)
 *
 * Ported from the team's "shootball7.html" mock: touch the pan and flick upwards to toss the
 * morning glory (🥬) into the bowl (canvas-drawn, side view) at the top; it can bounce off the left/right walls.
 * Every serve is a new level — level 1 the plate is centred, levels 2–5 it sits still at a random spot,
 * level 6+ it slides left and right, slowly at first (1) and 1 faster every 2 levels.
 * A pure fun game — no lesson content.
 * Same canvas scene as the mock (540×960 stage, pan, physics, catch zone, level ramp, colours).
 * Differences from the HTML mock, to follow AGENT.md (elderly-first):
 * - the 60-second timer is replaced by a throw budget (THROWS_PER_RUN), like G19's move budget
 * - the "จบเกม" overlay is replaced by a positive result screen with play again / finish;
 *   the mock's start overlay is replaced by the shared GameIntro
 * - the mock's floating pills are replaced by the shared header card (throws left / level);
 *   no on-screen guide text, but a screen-reader-only status line (what to do, served / missed)
 * - look: the kitchen scene first built for G20K — the bowl stands on a table under a shop wall (awning,
 *   shelf of jars), the veggie (Figma's broccoli icon, node 3028:13071) waits in a frying pan on a stove,
 *   with a tiled wall between. The veggie sits higher than in the mock (on the stove, y 760), so the
 *   throw is slightly shorter; the scene fills the whole play area (fitStage), up behind the header card
 * - the aim arrow stops AIM_TIP_GAP short of the finger, so the finger doesn't cover its tip
 * - a short pause in the bowl after a serve so the player sees it land (the mock jumped straight
 *   to the next level)
 * - gentler plate ramp: still until level 6 (mock: moves from level 3), starts slower and speeds up every
 *   2 levels instead of every level, capped lower (MAX_PLATE_SPEED 6, mock: 8)
 * - physics runs on elapsed time, not per frame, so 90/120 Hz phones don't play at double speed
 * Tutorial — 3 practice steps on entering the game (before the first run; not on "เล่นอีกครั้ง", and not
 * again when the player idles, unlike the mock). Header shows "โหมด ฝึกเล่น" (like G13/G18), no throws are
 * used and nothing is scored; each step needs one serve (a miss just shows the guide again):
 *   1. as in the shootball10.html mock: bowl in the middle, the game pauses on a guide — blue glow around
 *      the veggie, a dashed line and a 👆 sliding up from it, and a "เอานิ้วลากเพื่อ / โยนให้ลงถ้วย" box
 *   2. the veggie flies in a curve: the bowl is off to the right, so aiming straight at it overshoots —
 *      the 👆 shows the flick that works, and a dotted trail behind the veggie shows the curve
 *   3. bounce off the wall: the bowl is on the left and a dotted guide line shows a throw that bounces off
 *      the right wall into it (ring where it hits the wall); the 👆 shows that flick
 * Bowl spots and the flick for each step are fixed (TUTORIAL_PLATE_X / TUTORIAL_FLICK, checked against the
 * physics at 60 and 120 Hz). A faint target arrow — same shape/length as the aim arrow — shows the direction
 * and power that land; while dragging, the box says what to change (more/less power, tilt left/right) or
 * "ปล่อยนิ้วได้เลย" when the current aim would land (the target arrow turns green). Starting a drag closes
 * the guide. The box is a DOM element instead of canvas text, so its text stays 20px on screen (AGENT.md).
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Props = {
  /** score = best run since the game was opened — goes on the (device-only for now) leaderboard */
  onFinish: (stars: number, score?: number) => void;
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
const VEGGIE_HOME = { x: GAME_W / 2, y: 760 }; // in the pan on the stove
const STOVE_TOP = 850; // kitchen scene: stove surface the pan sits on
const PLATE_Y = 200;
const PLATE_W = 140;
const PLATE_CATCH = 30; // catch window above/below the plate's centre line
const PLATE_MARGIN = 40;
const MAX_PLATE_SPEED = 6;
// plate ramp (see plateSpeedFor): still for levels 1–5, slides from level 6 at 1, +1 every 2 levels
// (6–7: 1 · 8–9: 2 · 10–11: 3 · 12–13: 4 · 14–15: 5 · 16: 6 — level 16 is the most a 15-throw run reaches)
const FIRST_MOVING_LEVEL = 6;
const PLATE_START_SPEED = 1;
const PLATE_SPEED_STEP = 1;
const PLATE_SPEED_UP_EVERY = 2;
const FRAME_MS = 1000 / 60;

const THROWS_PER_RUN = 15;
const SERVED_PAUSE_MS = 900;
// "you finished" text over the stage after the last throw: fade/zoom in, hold, fade out (as G19)
const FINISH_IN_MS = 500;
const FINISH_HOLD_MS = 1800;
const FINISH_OUT_MS = 450;

const EMOJI_FONT = `"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", Arial, sans-serif`;
const BACKGROUND = "#EFE6D8"; // warm, close to the kitchen wall — only seen for a frame before the canvas sizes

// the veggie waits in the frying pan
const TOUCH_HINT = "แตะที่กระทะ";

// Veggie: Figma's broccoli icon, an 80px box on the 400px-wide design = 108 stage units. The drawing
// sits inset in that box like in Figma (left 12.51%, top 6.25%, right 10.57%, bottom 5.96%).
const VEGGIE_SRC = "/assets/g20/broccoli.svg";
const VEGGIE_SIZE = 108;
const VEGGIE_INSET = { left: 0.1251, top: 0.0625, right: 0.1057, bottom: 0.0596 };
// "เหลือ n ต้น" on the stove front, under the pan (the veggie's spot) — between the two knobs
const LEFT_COUNT_Y = STOVE_TOP + 18;

const DEFAULT_MESSAGE = `${TOUCH_HINT} แล้วลากนิ้วขึ้น ปล่อยนิ้วเพื่อโยน`;

// Tutorial (mock's drawTutorial), in stage units
type TutorialStep = 1 | 2 | 3;
const TUTORIAL_STEPS = 3;
const TUTORIAL_LOOP_MS = 1800; // hand slides from the veggie along the flick, then starts over
// step 1 hand, as in the mock: straight up from just under the veggie to just above the middle
const TUTORIAL_HAND_START_Y = VEGGIE_HOME.y + 10;
const TUTORIAL_HAND_END_Y = GAME_H / 2 - 30;
const TUTORIAL_HAND_DX = 40; // hand sits this far right of the veggie, next to the dashed line
const TUTORIAL_GLOW_R = 120;
// message box: mock's 210×75 box at (25, GAME_H/2 − 130) — placed through the stage layout when drawn
const TUTORIAL_BOX = { x: 25, y: GAME_H / 2 - 130, minW: 210 };
// bowl per step: middle (mock) · right, so the curve shows · left, for the throw off the right wall
const TUTORIAL_PLATE_X: Record<TutorialStep, number> = { 1: GAME_W / 2, 2: 400, 3: 130 };
const TUTORIAL_TEXT: Record<TutorialStep, string> = {
  1: "เอานิ้วลากเพื่อ\nโยนให้ลงถ้วย",
  2: "ผักจะลอยเป็นเส้นโค้ง\nลองโยนเฉียงไปทางถ้วย",
  3: "โยนชิ่งกำแพงก็ได้นะ\nลองโยนตามเส้นประ",
};
const TUTORIAL_MISS_TEXT: Record<TutorialStep, string> = {
  1: "ยังไม่ลงถ้วย ลองใหม่นะ\nลากนิ้วขึ้นตามมือได้เลย",
  2: "ยังไม่ลงถ้วย ลองใหม่นะ\nผักลอยโค้ง ลองทำตามมือ",
  3: "ยังไม่ลงถ้วย ลองใหม่นะ\nลองโยนตามเส้นประ",
};
const TUTORIAL_SERVED_TEXT: Record<TutorialStep, string> = {
  1: "✓ ลงถ้วยแล้ว เก่งมาก!",
  2: "✓ เก่งมาก! เห็นไหม\nผักลอยเป็นเส้นโค้ง",
  3: "✓ เก่งมาก!\nต่อไปเล่นจริงแล้วนะ",
};
const TUTORIAL_SERVED_PAUSE_MS = 2200; // longer than SERVED_PAUSE_MS, so the praise can be read
const TRAIL_GAP = 18; // stage units between the dots of the flight trail (steps 2–3)

type Point = { x: number; y: number };

// The flick (drag dx, dy in stage units) that lands in each step's bowl from the veggie's spot in the pan (y 760),
// picked so it still lands at 60 and 120 Hz with the most room for error: step 1 = the mock's hand path,
// straight up; step 2 = a little right (sideways ±16 still lands, any power above −247);
// step 3 = hard right, off the right wall (sideways ±25, power ±16 — the tightest one)
const TUTORIAL_FLICK: Record<TutorialStep, Point> = {
  1: { x: 0, y: TUTORIAL_HAND_END_Y - TUTORIAL_HAND_START_Y },
  2: { x: 30, y: -270 },
  3: { x: 153, y: -273 },
};
// Step 3 (bounce off the wall): the drag can't lean left of straight up, so a throw can't reach the bowl
// (on the left) directly — without a bounce it lands at the middle or further right, so only the throw
// off the right wall serves. Dragging further left just holds the aim straight up (hint: tilt right).
const STEP3_MIN_DX = 0;
// how far (stage units of drag) the aim can be off before the hint says which way to fix it
const TUTORIAL_AIM_TOLERANCE: Record<TutorialStep, Point> = { 1: { x: 11, y: 60 }, 2: { x: 16, y: 20 }, 3: { x: 25, y: 16 } };

// Tutorial message box, styled like G13/G18's: info = what to do, praise = ✓ done, retry = gentle try-again.
// Texts starting with "✓ " are praise; the box draws the ✓ itself.
type TutorialTip = { text: string; tone: "info" | "praise" | "retry" };
const toTip = (text: string, tone: TutorialTip["tone"] = "info"): TutorialTip =>
  text.startsWith("✓ ") ? { text: text.slice(2), tone: "praise" } : { text, tone };

type AimHint = "short" | "ok" | "weak" | "strong" | "left" | "right";
const AIM_HINT_TEXT: Record<AimHint, string> = {
  short: "ลากนิ้วขึ้น\nให้ลูกศรทับลูกศรจาง ๆ",
  ok: "✓ ตรงแล้ว\nปล่อยนิ้วได้เลย",
  weak: "แรงยังไม่พอ\nลากนิ้วให้ยาวขึ้นอีกนิด",
  strong: "แรงมากไป\nลากนิ้วให้สั้นลงหน่อย",
  left: "ยังไม่ตรง\nเอียงไปทางซ้ายอีกนิด",
  right: "ยังไม่ตรง\nเอียงไปทางขวาอีกนิด",
};

// Same as onPointerUp: drag → throw speed
function flickVelocity(dx: number, dy: number) {
  return { vx: dx * POWER, vy: Math.max(dy * POWER * 1.5, -MAX_UP_SPEED) };
}

// One throw from the veggie's spot, frame by frame with the same rules as update(), until it falls
// through the bowl's height (or off the bottom)
function simulateThrow(vx0: number, vy0: number) {
  let { x, y } = VEGGIE_HOME;
  let vx = vx0;
  let vy = vy0;
  const path: Point[] = [{ x, y }];
  let bounce: Point | null = null;
  let bounces = 0;
  for (let i = 0; i < 600; i++) {
    const prevY = y;
    vy += GRAVITY;
    x += vx;
    y += vy;
    if (x - VEGGIE_RADIUS < 0 || x + VEGGIE_RADIUS > GAME_W) {
      x = x < GAME_W / 2 ? VEGGIE_RADIUS : GAME_W - VEGGIE_RADIUS;
      vx *= -WALL_BOUNCE;
      bounces += 1;
      bounce ??= { x, y };
    }
    path.push({ x, y });
    if (vy > 0 && prevY <= PLATE_Y + PLATE_CATCH && y >= PLATE_Y - PLATE_CATCH) return { path, bounce, bounces, landX: x };
    if (y > GAME_H + 100) return null;
  }
  return null;
}

// Step 3's dotted guide line: the path of its fixed flick
const STEP3_GUIDE = (() => {
  const { vx, vy } = flickVelocity(TUTORIAL_FLICK[3].x, TUTORIAL_FLICK[3].y);
  const r = simulateThrow(vx, vy);
  return { path: r?.path ?? [], bounce: r?.bounce ?? null };
})();

// What to tell the player about the drag they are holding: "ok" when it would land in the bowl,
// otherwise the bigger of the two errors against the step's flick (sideways / power)
function aimHint(step: TutorialStep, dx: number, dy: number): AimHint {
  if (dy >= -MIN_DRAG_UP) return "short";
  const { vx, vy } = flickVelocity(dx, dy);
  const r = simulateThrow(vx, vy);
  if (r && Math.abs(r.landX - TUTORIAL_PLATE_X[step]) < PLATE_W / 2) return "ok";
  const target = flickVelocity(TUTORIAL_FLICK[step].x, TUTORIAL_FLICK[step].y);
  const tol = TUTORIAL_AIM_TOLERANCE[step];
  const ex = (vx - target.vx) / (tol.x * POWER);
  const ey = (vy - target.vy) / (tol.y * POWER * 1.5);
  if (Math.abs(ex) >= Math.abs(ey)) return ex > 0 ? "left" : "right";
  return ey > 0 ? "weak" : "strong"; // vy is up-negative: bigger = weaker
}

function starsFor(served: number) {
  if (served >= 8) return 3;
  if (served >= 4) return 2;
  return 1;
}

// Plate speed per level (mock's updateLevelDifficulty, slower ramp): still for the first 7 levels,
// then it starts sliding slowly and speeds up every PLATE_SPEED_UP_EVERY levels, up to MAX_PLATE_SPEED
function plateSpeedFor(level: number) {
  if (level < FIRST_MOVING_LEVEL) return 0;
  const tier = Math.floor((level - FIRST_MOVING_LEVEL) / PLATE_SPEED_UP_EVERY);
  return Math.min(PLATE_START_SPEED + tier * PLATE_SPEED_STEP, MAX_PLATE_SPEED);
}

// level 1 centred (mock), then a random spot each level
function plateFor(level: number): World["plate"] {
  if (level === 1) return { x: GAME_W / 2, speed: 0, direction: 1 };
  return {
    x: 100 + Math.random() * (GAME_W - 200),
    speed: plateSpeedFor(level),
    direction: Math.random() > 0.5 ? 1 : -1,
  };
}

function levelMessage(level: number) {
  if (level === 2) return "เลเวล 2 — จานย้ายที่แล้ว เล็งใหม่นะ";
  if (level === FIRST_MOVING_LEVEL) return `เลเวล ${level} — จานเริ่มเลื่อนไปมาแล้ว`;
  if (plateSpeedFor(level) > plateSpeedFor(level - 1)) return `เลเวล ${level} — จานเลื่อนเร็วขึ้นแล้ว`;
  return `เลเวล ${level} แล้ว โยนต่อเลย`;
}

function homeVeggie(state: VeggieState): World["veggie"] {
  return { ...VEGGIE_HOME, vx: 0, vy: 0, state, plateOffset: 0 };
}

// ---- Kitchen scene (first built for G20K) — all in stage units, drawn on the canvas, no image files ----
// Top: shop wall with a striped awning and a shelf of jars; the bowl stands on a full-width wooden table.
// Middle: tiled back wall — the empty height between stove and table is what the theme wants felt.
// Bottom: stove with a side-view frying pan; the veggie waits in the pan.
const TABLE_TOP = 266; // the bowl's foot (PLATE_Y + BOWL_DEPTH) rests on this surface
const TABLE_FRONT_TOP = 280;
const TABLE_BOTTOM = 352;
const PAN_RIM_Y = 800;
const PAN_RX = 120; // half the rim width
const TILE = 54;
// How much of the scene is on screen, in stage units — set every frame from the layout. Any space
// above the stage or at its sides (see fitStage) shows more of the same scene.
const view = { left: 0, right: GAME_W, top: 0 };
// The play area starts this far above the header card's bottom edge — just enough to fill behind
// its rounded bottom corners (rounded-b-[24px]), no more
const UNDER_HEADER_PX = 24;

/**
 * Stage layout for a play area of w×h css px: the whole 540×960 stage fits (as large as it can,
 * not stretched), bottom on the bottom edge, centred; spare space above or at the sides shows more scene.
 */
function fitStage(w: number, h: number) {
  const s = Math.max(0.01, Math.min(w / GAME_W, h / GAME_H));
  return { s, ox: (w - GAME_W * s) / 2, oy: h - GAME_H * s };
}

function drawShopBackground(ctx: CanvasRenderingContext2D) {
  ctx.save();
  const { left, right, top } = view;
  const span = right - left;
  // shop wall (above the table)
  ctx.fillStyle = "#FDF2E0";
  ctx.fillRect(left, top, span, TABLE_TOP - top);
  // storefront above the awning (only shows when the screen is taller than the stage), with the beam it hangs from
  if (top < 0) {
    ctx.fillStyle = "#F6E3C6";
    ctx.fillRect(left, top, span, -top);
    ctx.fillStyle = "#8A5A2B";
    ctx.fillRect(left, -8, span, 8);
  }

  // striped awning with a scalloped edge — the stripes keep going past the stage sides
  const stripe = GAME_W / 10;
  for (let i = Math.floor(left / stripe); i < Math.ceil(right / stripe); i += 1) {
    ctx.fillStyle = ((i % 2) + 2) % 2 === 0 ? "#E4572E" : "#FFFFFF";
    ctx.fillRect(i * stripe, 0, stripe, 50);
    ctx.beginPath();
    ctx.arc(i * stripe + stripe / 2, 50, stripe / 2, 0, Math.PI, false);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, 50);
  ctx.lineTo(right, 50);
  ctx.stroke();

  // shelf of jars, above the bowl's path
  const shelfY = 140;
  const jars: [number, number, string][] = [
    [70, 46, "#F4A261"],
    [140, 60, "#2A9D8F"],
    [205, 40, "#E9C46A"],
    [335, 56, "#E76F51"],
    [400, 44, "#8AB17D"],
    [465, 52, "#F4A261"],
  ];
  jars.forEach(([x, h, color]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - 20, shelfY - h, 40, h, 8);
    ctx.fill();
    ctx.fillStyle = "#7C5A3A"; // lid
    ctx.beginPath();
    ctx.roundRect(x - 16, shelfY - h - 8, 32, 10, 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)"; // shine
    ctx.fillRect(x - 13, shelfY - h + 8, 6, h - 16);
  });
  ctx.fillStyle = "#A0693A";
  ctx.fillRect(30, shelfY, GAME_W - 60, 10);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(30, shelfY + 10, GAME_W - 60, 4);

  // tiled back wall (between the table and the stove)
  ctx.fillStyle = "#F3EBDD";
  ctx.fillRect(left, TABLE_BOTTOM, span, STOVE_TOP - TABLE_BOTTOM);
  ctx.strokeStyle = "#E3D6C3";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = TILE / 2 + Math.floor((left - TILE / 2) / TILE) * TILE; x < right; x += TILE) {
    ctx.moveTo(x, TABLE_BOTTOM);
    ctx.lineTo(x, STOVE_TOP);
  }
  for (let y = TABLE_BOTTOM + TILE; y < STOVE_TOP; y += TILE) {
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();
  // the table's shadow on the wall under it
  const shade = ctx.createLinearGradient(0, TABLE_BOTTOM, 0, TABLE_BOTTOM + 40);
  shade.addColorStop(0, "rgba(0,0,0,0.18)");
  shade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shade;
  ctx.fillRect(left, TABLE_BOTTOM, span, 40);
  ctx.restore();
}

// Wooden table the bowl stands on (full width, so a sliding bowl stays on it), with the bowl's shadow
function drawTable(ctx: CanvasRenderingContext2D, bowlX: number) {
  ctx.save();
  ctx.fillStyle = "#B5793F"; // front
  ctx.fillRect(view.left, TABLE_FRONT_TOP, view.right - view.left, TABLE_BOTTOM - TABLE_FRONT_TOP);
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; // plank lines
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(view.left, TABLE_FRONT_TOP + 24);
  ctx.lineTo(view.right, TABLE_FRONT_TOP + 24);
  ctx.moveTo(view.left, TABLE_FRONT_TOP + 48);
  ctx.lineTo(view.right, TABLE_FRONT_TOP + 48);
  ctx.stroke();
  ctx.fillStyle = "#8A5A2B"; // bottom edge
  ctx.fillRect(view.left, TABLE_BOTTOM - 6, view.right - view.left, 6);
  ctx.fillStyle = "#D9A066"; // top surface
  ctx.fillRect(view.left, TABLE_TOP, view.right - view.left, TABLE_FRONT_TOP - TABLE_TOP);
  ctx.fillStyle = "rgba(0,0,0,0.16)"; // bowl shadow
  ctx.beginPath();
  ctx.ellipse(bowlX, TABLE_TOP + 4, 46, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStove(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "#4B5563"; // body
  ctx.fillRect(view.left, STOVE_TOP, view.right - view.left, GAME_H - STOVE_TOP);
  ctx.fillStyle = "#9AA3AD"; // top surface
  ctx.fillRect(view.left, STOVE_TOP, view.right - view.left, 12);
  ctx.fillStyle = "#374151"; // burner grate under the pan
  ctx.fillRect(GAME_W / 2 - 100, STOVE_TOP - 6, 200, 6);
  // knobs at the sides (the middle stays clear for the "เหลือ n ต้น" label)
  [90, GAME_W - 90].forEach((x) => {
    ctx.fillStyle = "#D1D5DB";
    ctx.beginPath();
    ctx.arc(x, 905, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 893);
    ctx.lineTo(x, 905);
    ctx.stroke();
  });
  ctx.restore();
}

// Side-view frying pan, handle to the right. Drawn in two layers so the waiting veggie sits in it:
// the back = the dark inside of the rim, the front = the pan's body + handle.
function drawPanBack(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "#1F2933";
  ctx.beginPath();
  ctx.ellipse(GAME_W / 2, PAN_RIM_Y, PAN_RX, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPanFront(ctx: CanvasRenderingContext2D) {
  const cx = GAME_W / 2;
  const bottom = STOVE_TOP - 6;
  ctx.save();
  // handle
  ctx.strokeStyle = "#3B2A1A";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + PAN_RX - 6, PAN_RIM_Y + 14);
  ctx.lineTo(cx + PAN_RX + 110, PAN_RIM_Y);
  ctx.stroke();
  // body: wider at the rim, rounded towards the base
  ctx.fillStyle = "#2C3E50";
  ctx.beginPath();
  ctx.moveTo(cx - PAN_RX, PAN_RIM_Y);
  ctx.lineTo(cx + PAN_RX, PAN_RIM_Y);
  ctx.quadraticCurveTo(cx + PAN_RX - 6, bottom, cx + PAN_RX - 30, bottom);
  ctx.lineTo(cx - PAN_RX + 30, bottom);
  ctx.quadraticCurveTo(cx - PAN_RX + 6, bottom, cx - PAN_RX, PAN_RIM_Y);
  ctx.closePath();
  ctx.fill();
  // front lip of the rim
  ctx.strokeStyle = "#4A6378";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(cx, PAN_RIM_Y, PAN_RX - 2, 12, 0, 0, Math.PI, false);
  ctx.stroke();
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
// The drawn arrow is this much shorter than the drag (stage units, ~35px on a 400px-wide phone),
// so its tip sits just short of — below, on an upward flick — the finger instead of under it.
// Only the drawing changes; the throw still uses the full drag.
const AIM_TIP_GAP = 48;
// How far the arrow can reach: its tip stays within this radius of the veggie — the distance from the
// veggie (in the pan) up to the bottom edge of the table (760 − 352 = 408). The drag itself is capped to
// match (radius + AIM_TIP_GAP), so the throw never has more power than the arrow shows.
const AIM_RADIUS = VEGGIE_HOME.y - TABLE_BOTTOM;
const MAX_DRAG = AIM_RADIUS + AIM_TIP_GAP;

// Trajectory preview: where a throw from this drag would go — the same physics as update() (one step per
// 60 fps frame, gravity, wall bounce), sampled as dots. The dots start where the path has gone as far as
// the arrow is long (so they carry on from its tip) and end once it falls back below the table top.
// On/off switch for the trajectory dots — off in G20 (aim with the arrow only); G20K turns them on
const SHOW_TRAJECTORY = false;
const TRAJECTORY_EVERY = 3; // frames between dots
const TRAJECTORY_MAX_FRAMES = 240;
const TRAJECTORY_DOT_R = 6;

function drawTrajectory(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  if (dy >= -MIN_DRAG_UP) return; // too short to throw — onPointerUp wouldn't throw either
  const arrowLength = Math.hypot(dx, dy) - AIM_TIP_GAP;
  // same launch as onPointerUp
  let vx = dx * POWER;
  let vy = Math.max(dy * POWER * 1.5, -MAX_UP_SPEED);
  let px = x;
  let py = y;
  let travelled = 0;
  const dots: [number, number][] = [];
  for (let frame = 1; frame <= TRAJECTORY_MAX_FRAMES; frame += 1) {
    vy += GRAVITY;
    const nx = px + vx;
    const ny = py + vy;
    travelled += Math.hypot(nx - px, ny - py);
    px = nx;
    py = ny;
    if (px - VEGGIE_RADIUS < 0) {
      px = VEGGIE_RADIUS;
      vx *= -WALL_BOUNCE;
    } else if (px + VEGGIE_RADIUS > GAME_W) {
      px = GAME_W - VEGGIE_RADIUS;
      vx *= -WALL_BOUNCE;
    }
    if (vy > 0 && py > TABLE_TOP) break; // fell back below the table top
    if (travelled >= arrowLength && frame % TRAJECTORY_EVERY === 0) dots.push([px, py]);
  }
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#4B4B4B";
  ctx.fillStyle = "#FFFFFF";
  dots.forEach(([dotX, dotY], i) => {
    ctx.globalAlpha = 1 - (i / Math.max(1, dots.length)) * 0.6; // fades a little towards the end
    ctx.beginPath();
    ctx.arc(dotX, dotY, TRAJECTORY_DOT_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

// Outline of the aim arrow for a drag (dx, dy) as the current path; null when too short to draw
function traceAimArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  const dragLength = Math.hypot(dx, dy);
  const length = dragLength - AIM_TIP_GAP;
  if (length < 1) return null;
  const ux = dx / dragLength; // along
  const uy = dy / dragLength;
  ctx.beginPath();
  AIM_ARROW.forEach(([along, across], i) => {
    const px = x + ux * along * length - uy * across * length;
    const py = y + uy * along * length + ux * across * length;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  return { ux, uy, tip: { x: x + ux * length, y: y + uy * length } };
}

// Tutorial target: where the aim arrow should be for the step's flick — the same shape, faint, dashed
// blue edge (solid green once the player's aim would land). Returns its tip, for the parked 👆.
function drawTargetArrow(ctx: CanvasRenderingContext2D, x: number, y: number, flick: Point, onTarget: boolean) {
  ctx.save();
  const arrow = traceAimArrow(ctx, x, y, flick.x, flick.y);
  if (arrow) {
    ctx.fillStyle = onTarget ? "rgba(34, 197, 94, 0.35)" : "rgba(255, 255, 255, 0.45)";
    ctx.fill();
    ctx.lineJoin = "round";
    ctx.setLineDash(onTarget ? [] : [10, 8]);
    ctx.strokeStyle = onTarget ? "#16A34A" : "#2563EB";
    ctx.lineWidth = onTarget ? 5 : 4;
    ctx.stroke();
  }
  ctx.restore();
  return arrow?.tip ?? null;
}

// Mock's drawTutorial, minus the text box (DOM): glow behind the veggie, then (over it) the dashed
// line and the 👆 moving up together
function drawTutorialGlow(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const grad = ctx.createRadialGradient(x, y, 10, x, y, TUTORIAL_GLOW_R);
  grad.addColorStop(0, "rgba(37, 99, 235, 0.25)");
  grad.addColorStop(1, "rgba(37, 99, 235, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, TUTORIAL_GLOW_R, 0, Math.PI * 2);
  ctx.fill();
}

// The 👆 at `progress` (0 → 1) of the way from `from` to `to`, with (unless `line` is false) a dashed
// line from the veggie (x, y) to it
function drawTutorialHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  from: Point,
  to: Point,
  progress: number,
  line = true
) {
  const handX = from.x + (to.x - from.x) * progress;
  const handY = from.y + (to.y - from.y) * progress;
  ctx.save();
  if (line) {
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.moveTo(x, y);
    ctx.lineTo(handX, handY);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.font = `55px ${EMOJI_FONT}`;
  ctx.fillText("👆", handX + TUTORIAL_HAND_DX, handY);
  ctx.restore();
}

// Step 3: where the throw goes — dotted line from the veggie, off the wall (ring), into the bowl
function drawGuidePath(ctx: CanvasRenderingContext2D, guide: { path: Point[]; bounce: Point | null }) {
  if (guide.path.length < 2) return;
  ctx.save();
  ctx.beginPath();
  guide.path.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.setLineDash([2, 16]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(37, 99, 235, 0.7)";
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.setLineDash([]);
  if (guide.bounce) {
    ctx.beginPath();
    ctx.arc(guide.bounce.x, guide.bounce.y, 26, 0, Math.PI * 2);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  ctx.restore();
}

// Steps 2–3: dots where the veggie has been, so the curve (and the bounce) stays visible
function drawTrail(ctx: CanvasRenderingContext2D, trail: Point[]) {
  ctx.save();
  ctx.fillStyle = "rgba(37, 99, 235, 0.45)";
  trail.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawAimArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  ctx.save();
  const arrow = traceAimArrow(ctx, x, y, dx, dy);
  if (!arrow) {
    ctx.restore();
    return;
  }
  const { ux, uy } = arrow;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#4B4B4B"; // dark edge keeps the green/yellow arrow visible on the light green background
  ctx.lineWidth = 4;
  ctx.stroke();
  // power colour: green at the veggie → yellow → red at max power, so a short drag stays green
  // (ends AIM_TIP_GAP early too, so the tip is fully red exactly at max power)
  const redAt = AIM_MAX_LENGTH - AIM_TIP_GAP;
  const power = ctx.createLinearGradient(x, y, x + ux * redAt, y + uy * redAt);
  power.addColorStop(0, "#22C55E");
  power.addColorStop(0.5, "#FACC15");
  power.addColorStop(1, "#EF4444");
  ctx.fillStyle = power;
  ctx.fill();
  ctx.restore();
}

function drawVeggie(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number) {
  if (img && img.complete && img.naturalWidth > 0) {
    const { left, top, right, bottom } = VEGGIE_INSET;
    const box = VEGGIE_SIZE;
    ctx.drawImage(img, x - box / 2 + box * left, y - box / 2 + box * top, box * (1 - left - right), box * (1 - top - bottom));
    return;
  }
  ctx.font = `80px ${EMOJI_FONT}`;
  ctx.fillText("🥦", x, y);
}

export default function G20VeggieToss({ onFinish, logEvent }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [level, setLevel] = useState(1);
  const [throwsLeft, setThrowsLeft] = useState(THROWS_PER_RUN);
  // play area (from just under the header's rounded corners to the bottom): canvas size + where the
  // 540×960 stage sits in it; headerH places the area's top
  const [stage, setStage] = useState<{ w: number; h: number; dpr: number; s: number; ox: number; oy: number } | null>(null);
  const [headerH, setHeaderH] = useState(0);
  const stageRef = useRef(stage);
  const headerRef = useRef<HTMLDivElement>(null);
  const [finishPopup, setFinishPopup] = useState<FinishPopup>(null);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [bestServed, setBestServed] = useState(0); // best run since the game was opened
  const [runs, setRuns] = useState(0);
  const [tutorialStep, setTutorialStep] = useState<0 | TutorialStep>(0); // 0 = not in the tutorial
  const [tutorialBox, setTutorialBox] = useState<TutorialTip | null>(null); // the tutorial's message box (DOM)

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
  const veggieImgRef = useRef<HTMLImageElement | null>(null);
  const tutorialStepRef = useRef<0 | TutorialStep>(0);
  const tutorialDoneRef = useRef(false);
  const guideRef = useRef(false); // hand + glow showing — the game is paused, like the mock's isTutorial
  const trailRef = useRef<Point[]>([]);
  const aimHintRef = useRef<AimHint | null>(null); // tutorial: hint for the drag being held (box + target colour)

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

  // tutorial guide: message box + (on the canvas) glow and 👆; the game waits until the next drag
  const showGuide = (text: string, tone: TutorialTip["tone"] = "info") => {
    guideRef.current = true;
    setTutorialBox(toTip(text, tone));
    say(text.replace("\n", " "));
  };

  const hideGuide = () => {
    guideRef.current = false;
    setTutorialBox(null);
  };

  const loadVeggieImage = () => {
    if (veggieImgRef.current) return;
    const img = new Image();
    img.src = VEGGIE_SRC;
    veggieImgRef.current = img;
  };

  const startTutorialStep = (step: TutorialStep) => {
    tutorialStepRef.current = step;
    setTutorialStep(step);
    trailRef.current = [];
    worldRef.current = { veggie: homeVeggie("idle"), plate: { x: TUTORIAL_PLATE_X[step], speed: 0, direction: 1 }, drag: null };
    showGuide(TUTORIAL_TEXT[step]);
    logEvent("tutorial_step", { game_id: "G20", step });
  };

  // Practice before the first run (not a run: nothing scored, no throws used)
  const startTutorial = () => {
    loadVeggieImage();
    genRef.current += 1;
    clearTimers();
    playingRef.current = true;
    setFinishPopup(null);
    setPhase("play");
    logEvent("tutorial_start", { game_id: "G20" });
    startTutorialStep(1);
  };

  const endTutorial = (skipped: boolean) => {
    tutorialDoneRef.current = true;
    tutorialStepRef.current = 0;
    setTutorialStep(0);
    hideGuide();
    trailRef.current = [];
    logEvent("tutorial_complete", { game_id: "G20", skipped });
    startRun();
  };

  const startRun = () => {
    loadVeggieImage();
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
    v.plateOffset = Math.max(-16, Math.min(16, v.x - world.plate.x)); // keep the broccoli inside the bowl's opening

    const tStep = tutorialStepRef.current;
    if (tStep) {
      setTutorialBox(toTip(TUTORIAL_SERVED_TEXT[tStep]));
      say(TUTORIAL_SERVED_TEXT[tStep].replace("\n", " "));
      logEvent("tutorial_serve", { game_id: "G20", step: tStep });
      await delay(TUTORIAL_SERVED_PAUSE_MS);
      if (gen !== genRef.current) return;
      if (tStep < TUTORIAL_STEPS) startTutorialStep((tStep + 1) as TutorialStep);
      else endTutorial(false);
      return;
    }

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
    const tStep = tutorialStepRef.current;
    if (tStep) {
      // practice: no throws used — back to the spot with the guide again (the missed flight's trail is cleared)
      logEvent("tutorial_miss", { game_id: "G20", step: tStep });
      trailRef.current = [];
      world.veggie = homeVeggie("idle");
      showGuide(TUTORIAL_MISS_TEXT[tStep], "retry");
      return;
    }
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

    // like the mock, the game is paused while the tutorial guide shows
    if (guideRef.current) return;

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

    if (tutorialStepRef.current >= 2) {
      const trail = trailRef.current;
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(veggie.x - last.x, veggie.y - last.y) >= TRAIL_GAP) trail.push({ x: veggie.x, y: veggie.y });
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
    const layout = stageRef.current;
    if (!layout) return;
    const { plate, veggie, drag } = worldRef.current;
    const { s, ox, oy, dpr } = layout;
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    view.left = -ox / s;
    view.right = (layout.w - ox) / s;
    view.top = -oy / s;
    ctx.clearRect(view.left, view.top, view.right - view.left, GAME_H - view.top);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const veggieImg = veggieImgRef.current;
    drawShopBackground(ctx);
    drawTable(ctx, plate.x);
    drawBowlBack(ctx, plate.x);
    if (veggie.state === "served") drawVeggie(ctx, veggieImg, veggie.x, veggie.y); // tucked between the bowl layers
    drawBowlFront(ctx, plate.x);

    drawStove(ctx);
    drawPanBack(ctx);

    const tStep = tutorialStepRef.current;
    if (tStep === 3 && veggie.state !== "served") drawGuidePath(ctx, STEP3_GUIDE);
    if (tStep >= 2) drawTrail(ctx, trailRef.current);
    const showGuide = tStep !== 0 && guideRef.current && veggie.state === "idle";
    const aiming = tStep !== 0 && veggie.state === "dragging";
    if (showGuide) drawTutorialGlow(ctx, veggie.x, veggie.y);
    // target arrow only once the player is dragging (the guide before that is the mock's hand + dashed line)
    const targetTip = aiming
      ? drawTargetArrow(ctx, veggie.x, veggie.y, TUTORIAL_FLICK[tStep as TutorialStep], aimHintRef.current === "ok")
      : null;

    // over the bowl (a long aim reaches it), under the veggie so the veggie covers the arrow's tail
    if (veggie.state === "dragging" && drag) {
      drawAimArrow(ctx, veggie.x, veggie.y, drag.x - drag.startX, drag.y - drag.startY);
      if (SHOW_TRAJECTORY) drawTrajectory(ctx, veggie.x, veggie.y, drag.x - drag.startX, drag.y - drag.startY);
    }

    if (veggie.state !== "served") drawVeggie(ctx, veggieImg, veggie.x, veggie.y);
    // the pan's front covers the veggie's stem, so it sits in the pan (and rises out of it when thrown)
    drawPanFront(ctx);

    // tutorial hand on top of everything
    if (showGuide) {
      // the finger's path for the flick (step 1 starts just under the veggie, as in the mock)
      const flick = TUTORIAL_FLICK[tStep as TutorialStep];
      const from = { x: veggie.x, y: tStep === 1 ? TUTORIAL_HAND_START_Y : veggie.y };
      const to = { x: from.x + flick.x, y: from.y + flick.y };
      drawTutorialHand(ctx, veggie.x, veggie.y, from, to, (performance.now() % TUTORIAL_LOOP_MS) / TUTORIAL_LOOP_MS);
    } else if (aiming && targetTip) {
      drawTutorialHand(ctx, veggie.x, veggie.y, targetTip, targetTip, 0, false); // parked at the target's tip
    }
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

  // The canvas fills the play area (its top tucked UNDER_HEADER_PX under the header card); fitStage places the stage in it
  useEffect(() => {
    if (phase !== "play") return;
    const el = wrapRef.current;
    const header = headerRef.current;
    if (!el || !header) return;
    const measure = () => {
      setHeaderH(header.offsetHeight);
      const w = Math.max(1, Math.floor(el.clientWidth));
      const h = Math.max(1, Math.floor(el.clientHeight));
      const next = { w, h, dpr: Math.min(window.devicePixelRatio || 1, 2), ...fitStage(w, h) };
      stageRef.current = next;
      setStage(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, [phase]);

  // screen → stage units, through the same scale/offset as the drawing
  const toGame = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { s, ox, oy } = stageRef.current ?? { s: 1, ox: 0, oy: 0 };
    return { x: (e.clientX - rect.left - ox) / s, y: (e.clientY - rect.top - oy) / s };
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
    // starting a drag closes the tutorial guide (unlike the mock, a touch elsewhere keeps it up);
    // from here the box gives live hints on the aim
    if (guideRef.current) {
      hideGuide();
      logEvent("tutorial_dismiss", { game_id: "G20", step: tutorialStepRef.current });
    }
    if (tutorialStepRef.current) {
      aimHintRef.current = null;
      updateAimHint(0, 0);
    }
  };

  // tutorial: live hint for the drag being held — only re-rendered when it changes
  const updateAimHint = (dx: number, dy: number) => {
    const step = tutorialStepRef.current;
    if (!step) return;
    const hint = aimHint(step, dx, dy);
    if (hint === aimHintRef.current) return;
    aimHintRef.current = hint;
    setTutorialBox(toTip(AIM_HINT_TEXT[hint]));
    say(AIM_HINT_TEXT[hint].replace("\n", " "));
  };

  // tutorial: drag ended without a throw — back to the step's guide
  const backToGuide = () => {
    const step = tutorialStepRef.current;
    if (!step) return;
    aimHintRef.current = null;
    showGuide(TUTORIAL_TEXT[step]);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current;
    if (world.veggie.state !== "dragging" || !world.drag) return;
    const pos = toGame(e);
    // keep the drag inside MAX_DRAG of where it started (same direction, shorter), so the arrow stops at AIM_RADIUS
    let dx = pos.x - world.drag.startX;
    if (tutorialStepRef.current === 3) dx = Math.max(dx, STEP3_MIN_DX); // step 3: bounce only, no direct throw
    const dy = pos.y - world.drag.startY;
    const k = Math.min(1, MAX_DRAG / (Math.hypot(dx, dy) || 1));
    world.drag.x = world.drag.startX + dx * k;
    world.drag.y = world.drag.startY + dy * k;
    updateAimHint(dx * k, dy * k);
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
      backToGuide();
      return;
    }
    veggie.vx = dx * POWER;
    veggie.vy = Math.max(dy * POWER * 1.5, -MAX_UP_SPEED);
    veggie.state = "flying";
    const tStep = tutorialStepRef.current;
    if (tStep) {
      // practice throw: doesn't use up a throw
      trailRef.current = [];
      aimHintRef.current = null;
      setTutorialBox(null);
      say("ผักลอยไปแล้ว!");
      logEvent("tutorial_throw", {
        game_id: "G20",
        step: tStep,
        vx: Math.round(veggie.vx * 10) / 10,
        vy: Math.round(veggie.vy * 10) / 10,
      });
      return;
    }
    throwsRef.current -= 1;
    setThrowsLeft(throwsRef.current);
    say("ผักลอยไปแล้ว!");
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
    if (world.veggie.state === "dragging") {
      world.veggie.state = "idle";
      backToGuide();
    }
  };

  const finish = () => {
    const stars = starsFor(bestRef.current);
    logEvent("game_complete", { game_id: "G20", runs: runRef.current, best_served: bestRef.current, stars });
    onFinish(stars, bestRef.current);
  };

  if (phase === "intro") {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="ผักบุ้งลอยฟ้า"
        objective="โยนผักบุ้งให้ลอยไปบนจาน สามารถโยนชิ่งกำแพงได้"
        choices={`โยนได้ ${THROWS_PER_RUN} ครั้ง ไม่จับเวลา`}
        icon={Salad}
        onStart={() => {
          logEvent("game_intro_start", { game_id: "G20" });
          // entering the game: practice first (once per opening)
          if (tutorialDoneRef.current) startRun();
          else startTutorial();
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
              </p>
            ) : (
              <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">
                {TOUCH_HINT}แล้วลากนิ้วขึ้น เล็งไปที่จานได้เลย
              </p>
            )}
            {newBest && <p className="gp-text-24 font-bold gp-leading-32 text-[#15803D]">🎉 สถิติใหม่ของคุณ!</p>}
            {runs > 1 && (
              <p className="gp-text-22 font-semibold gp-leading-32 text-[#4B4B4B]">สถิติดีที่สุด: {bestServed} จาน</p>
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

  return (
    <div
      className={`${notoLoopedThai.className} gp-compact relative flex min-h-0 flex-1 flex-col select-none`}
      style={{ background: BACKGROUND }}
    >
      {/* Header card on top of the scene, whose top runs up behind the card's rounded corners */}
      <div ref={headerRef} className="relative z-10 shrink-0">
      {/* during the tutorial: "โหมด ฝึกเล่น" + step, like G13's practice */}
      <GameStageHeader
        left={tutorialStep ? { label: "โหมด", value: "ฝึกเล่น", ariaLabel: "กำลังฝึกเล่น" } : undefined}
        right={
          tutorialStep
            ? { label: "ขั้นที่", value: `${tutorialStep}/${TUTORIAL_STEPS}`, ariaLabel: `ฝึกขั้นที่ ${tutorialStep} จาก ${TUTORIAL_STEPS}` }
            : { label: "ด่าน", value: level, ariaLabel: `ด่าน ${level}` }
        }
      >
        {/* QA only (like G13's) — skip the practice */}
        {process.env.NODE_ENV === "development" && tutorialStep !== 0 && (
          <button
            type="button"
            onClick={() => endTutorial(true)}
            className={HUD_DEV_BUTTON_CLASS}
            aria-label="ข้ามการฝึกเล่นสำหรับทดสอบเกม"
            data-dev-only="g20-skip-tutorial"
          >
            ข้ามฝึก
          </button>
        )}
        {/* QA only (same idea as G19's) — end the run now to check the result screen */}
        {process.env.NODE_ENV === "development" && tutorialStep === 0 && (
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
      </GameStageHeader>
      </div>

      {/* No on-screen guide; the status text is kept for screen readers only */}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>

      {/* play area: from just behind the header card's rounded corners to the bottom edge */}
      <div
        ref={wrapRef}
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ top: Math.max(0, headerH - UNDER_HEADER_PX), containerType: "inline-size" }}
      >
        {stage && stage.w > 0 && (
          <>
            <canvas
              ref={canvasRef}
              width={Math.round(stage.w * stage.dpr)}
              height={Math.round(stage.h * stage.dpr)}
              aria-label="สนามโยนผักบุ้งในครัว: กระทะบนเตาอยู่ด้านล่าง ชามบนโต๊ะอยู่ด้านบน"
              role="img"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              className="block h-full w-full touch-none"
            />
            {/* veggies left, under the veggie's spot — the only place the count is shown (not in the header) */}
            {tutorialStep === 0 && (
              <p
                className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[24px] border-2 border-solid border-[#D9D9D9] bg-white px-[12px] text-[20px] font-semibold leading-[26px] text-[#4B4B4B]"
                style={{ top: Math.min(stage.oy + LEFT_COUNT_Y * stage.s + 4, stage.h - 32) }}
              >
                เหลือ {throwsLeft} ต้น
              </p>
            )}
            {/* Tutorial message box (mock's canvas box, left side of the stage) — aria-hidden: the status line says it */}
            {tutorialBox && (
              <p
                aria-hidden="true"
                className={`pointer-events-none absolute z-10 whitespace-pre rounded-[16px] border-2 border-solid bg-white gp-px-16 gp-py-8 text-center gp-text-22 font-bold gp-leading-30 shadow-md ${
                  tutorialBox.tone === "praise"
                    ? "border-emerald-500 text-emerald-800"
                    : tutorialBox.tone === "retry"
                      ? "border-slate-300 text-slate-700"
                      : "border-amber-400 text-amber-950"
                }`}
                style={{
                  left: stage.ox + TUTORIAL_BOX.x * stage.s,
                  top: stage.oy + TUTORIAL_BOX.y * stage.s,
                  minWidth: TUTORIAL_BOX.minW * stage.s,
                }}
              >
                {tutorialBox.tone === "praise" && "✓ "}
                {tutorialBox.text}
              </p>
            )}
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
                {/* sized to the play area width (cqw) so it still fits on a small screen */}
                <p className="font-bold leading-[1.3]" style={{ fontSize: "clamp(24px, 16cqw, 56px)" }}>
                  เก่งมาก! 🎉
                </p>
                <p className="font-bold leading-[1.4]" style={{ fontSize: "clamp(20px, 9cqw, 32px)" }}>
                  โยนครบ {THROWS_PER_RUN} ครั้งแล้ว
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
