"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Camera, CheckCircle2, Scissors } from "lucide-react";
import { notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";
import GameIntro from "@/components/GameIntro";
import GameStageHeader from "@/components/GameStageHeader";
import DATA from "@/data/g17-levels.json";
import G3_DATA from "@/data/g3-questions.json";
import { hashString, mulberry32, todaySeed, type Rng } from "@/lib/seededRandom";

/**
 * G17 — โล่กันโกง (Scam breaker)
 *
 * Brick-breaker adapted from the team's ballbounce.html mock: drag the paddle
 * left/right to bounce the ball into the bricks. Look follows the Figma design
 * (Scammer Game Prototype, node 3028:13103) — the bricks keep the stage picture.
 * Each stage takes one picture from the G3 pool and cuts it across the bricks,
 * in place, so the grid looks like the picture. After the stage the
 * whole picture is shown with G3's verdict (real / AI / edited) and explanation.
 * Differences from the HTML mock, to follow AGENT.md (elderly-first):
 * - no countdown and no game over — a lost ball respawns on the shield with a
 *   gentle message; misses only affect stars
 * - canvas is drawn at real CSS px (not a scaled 540×960)
 * - only helpful power-ups (split / bigger ball / slower ball / wider bar); ⚡ faster and
 *   🧊 smaller were dropped
 * - the ball waits on the shield until the player taps, instead of launching at once
 * - a broken brick breaks apart into pieces of its picture that fly off, fall and fade (breakBrick);
 *   the level-clear screen waits for the last brick's pieces
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Picture = {
  id: string;
  media: string;
  claim: string;
  isAi: boolean;
  category: string; // "ai" | "edited" | "real"
  aiDisclosure: string;
  explanation: string;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "intro" | "playing" | "levelClear";
type ItemType = "split" | "grow" | "slow" | "wide";

// trail = where the shield was over the last TRAIL_SECS (t = world.clock then), drawn as its speed tail
type Ball = { x: number; y: number; vx: number; vy: number; trail?: { x: number; y: number; t: number }[] };
// Positions are in grid cells, so the layout survives a resize.
// Each brick shows the part of the stage picture that sits under it.
type Brick = { col: number; row: number; alive: boolean; item?: ItemType }; // item: dropped when broken (placeItems)
type Item = { x: number; y: number; type: ItemType };
type Rect = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };
// Break VFX: one piece of a broken brick. `poly` is the piece's outline where it sat in the wall, `origin` its
// centre there and `bounds` its bounding box (so it keeps its cut of the picture); x/y is where that centre is
// now, moving with vx/vy under gravity while it spins and fades over its life.
type Shard = {
  poly: Point[];
  origin: Point;
  bounds: Rect;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  age: number;
  life: number; // seconds in all — the last `fade` of them fading out
  fade: number;
};

type World = {
  levelIdx: number;
  width: number;
  height: number;
  paddleX: number; // centre
  balls: Ball[];
  // Sizes depend on the small-phone scale read off the canvas CSS —
  // so the level is laid out on the first resize after it starts.
  layoutPending: boolean;
  bricks: Brick[];
  items: Item[];
  shards: Shard[];
  // last brick broken: seconds left before the level-clear screen, so its pieces can fall and fade first
  clearDelay: number | null;
  attached: boolean; // ball resting on the shield, waiting for a tap
  radius: number;
  // 🍄 item: the shield flickers between its old size (`from`) and the new one, `elapsed` s into GROW_FLICKER_SECS
  growFlicker: { from: number; elapsed: number } | null;
  paddleScale: number; // ↔️ item: bar width × this, for the rest of the stage
  // Items: which bricks hold one is fixed when the wall is built (placeItems), from a seed of the day + stage
  seed: string; // "DD-MM-YYYY-LV-X", X = stage number
  rng: Rng; // seeded by `seed` — places the items, then picks any swaps (dropItem)
  lastItem: ItemType | null; // type of the last item dropped — never drops twice in a row
  itemDrops: Record<ItemType, number>; // items of each type dropped this stage — at most the level's amount
  speedFactor: number; // 🐢 item
  boost: number; // grows a little with every paddle bounce, back to 1 after a miss or 🐢
  lastTimestamp: number | null;
  clock: number; // seconds of play, for the shield trails
  ended: boolean; // level cleared — stops a late animation frame from finishing it twice
};

// one picture per stage, from the G3 "AI or not" pool (AI, edited and real photos alike)
const PICTURES = G3_DATA.pool as Picture[];
// Each level is a grid sketch: "o" = cells breakable bricks are packed into, any other character = empty.
// `items` = how many of each item the stage hides in its bricks (placeItems)
const LEVELS = DATA.levels as { grid: string[]; items?: Partial<Record<ItemType, number>> }[];

// Sizes follow the Figma design (Scammer Game Prototype, node 3028:13103) on a 400px-wide frame
const GRID_TOP = 24; // gap between the header card and the first row
const GRID_SIDE = 17; // left/right margin of the brick wall
const CELL_HEIGHT = 44;
const BRICK_GAP = 2; // gap between neighbouring bricks
const BRICK_BORDER = 1; // white edge around each brick
const BRICK_FALLBACK = "#8DABD9"; // brick colour until the stage picture has loaded
const PADDLE_WIDTH = 140;
const PADDLE_HEIGHT = 20;
const PADDLE_COLOR = "#595959";
const PADDLE_BOTTOM = 100; // space under the paddle
const BALL_RADIUS = 12; // collision circle; the shield sprite (drawShield) is drawn to fit it
const BALL_RADIUS_MAX = 20;
// no cap on shields from 🪄 (each split adds 2) — set a number (was 6) to bring the limit back
const MAX_BALLS = Infinity;
const GROW_STEP = 6; // 🍄: shield radius + this (× small-phone scale), up to BALL_RADIUS_MAX
// 🍄: the shield flicks between its old and new size every GROW_FLICKER_STEP s for GROW_FLICKER_SECS, ending big
// (drawing only — collisions use the new size at once)
const GROW_FLICKER_SECS = 0.6;
const GROW_FLICKER_STEP = 0.08;
// Speed tail behind each moving shield: its path over the last TRAIL_SECS, so a faster shield leaves a longer
// tail. Kept faint and narrower than the shield on purpose — a hint of speed, not an effect to look at.
const TRAIL_SECS = 0.1;
const TRAIL_WIDTH = 1.1; // × shield radius at the shield end, tapering to nothing
const TRAIL_ALPHA = 0.3; // at the shield end, fading to nothing
const TRAIL_COLOR = "125, 211, 252"; // #7DD3FC, the shield face's light blue (as r, g, b)
const ITEM_SIZE = 32;

// Small-phone scaling (.gp-compact in globals.css): the canvas can't use the gp-* classes,
// so resize() reads --gp-s / --gp-t off the canvas and every canvas size goes through these.
// Module-level is fine — only one G17 is ever on screen.
const ui = { s: 1, t: 1 };
const px = (base: number, min = 0) => Math.max(min, base * ui.s);
const textPx = (base: number) => Math.max(18, Math.round(base * ui.t));
const gridTop = () => px(GRID_TOP);
const gridSide = () => px(GRID_SIDE);
const cellHeight = () => px(CELL_HEIGHT, 34);
const paddleHeight = () => px(PADDLE_HEIGHT, 16);
const itemSize = () => px(ITEM_SIZE, 24);
const MAX_BOUNCE_ANGLE = (60 * Math.PI) / 180;
const TAP_SLOP_PX = 10;

// Break VFX: a broken brick shatters like glass — cracks run from a point near the hit out to random spots on
// its edge, so it splits into SHARD_MIN–SHARD_MAX wedge-shaped pieces (triangles, 4- and 5-sided) that burst away
// from the shield, spin, fall and fade out. Speeds are in brick heights / play-area heights so every screen looks alike.
const SHARD_MIN = 5;
const SHARD_MAX = 8;
const SHARD_CRACK_INSET = 0.25; // crack centre stays this share of the brick away from its edges
// each piece stays fully visible for a random SHARD_HOLD_MIN–MAX seconds, then fades out over SHARD_FADE_MIN–MAX
const SHARD_HOLD_MIN = 0.25;
const SHARD_HOLD_MAX = 0.4;
const SHARD_FADE_MIN = 0.1;
const SHARD_FADE_MAX = 0.25;
const between = (min: number, max: number) => min + Math.random() * (max - min);
const SHARD_GRAVITY = 1.6; // × play-area height per s²
const SHARD_BURST = 4; // × brick height per s, away from the shield
const SHARD_POP = 3; // × brick height per s, extra upward kick so pieces arc before falling
const SHARD_SPIN = 7; // max rad/s either way
const SHARD_SHRINK = 0.35; // pieces end at 65% size
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const ITEM_INFO: Record<ItemType, { emoji: string; toast: string }> = {
  split: { emoji: "🪄", toast: "🪄 โล่แยกเป็น 3 อัน!" },
  grow: { emoji: "🍄", toast: "🍄 โล่ใหญ่ขึ้น!" },
  wide: { emoji: "↔️", toast: "↔️ แถบรับยาวขึ้น!" },
  slow: { emoji: "🐢", toast: "🐢 โล่ช้าลง เล่นสบายขึ้น" },
};
const ITEM_TYPES = Object.keys(ITEM_INFO) as ItemType[];

// level-clear verdict — icon + words, never colour alone
const VERDICTS = {
  ai: { label: "ภาพนี้สร้างด้วย AI", icon: Bot, boxClass: "border-[#FECACA] bg-[#FEF2F2]", textClass: "text-[#991B1B]" },
  edited: { label: "ภาพนี้เป็นภาพตัดต่อ", icon: Scissors, boxClass: "border-[#FECACA] bg-[#FEF2F2]", textClass: "text-[#991B1B]" },
  real: { label: "ภาพนี้เป็นภาพถ่ายจริง", icon: Camera, boxClass: "border-[#BBF7D0] bg-[#F0FDF4]", textClass: "text-[#166534]" },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const shuffle = <T,>(arr: T[], rand: Rng = Math.random): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Slow enough for older players; scales with the play area so tall and short phones feel the same.
const baseSpeed = (height: number) => clamp(height * 0.38, 200, 340);
// +2% per paddle bounce — not felt on one bounce, but after ~20 bounces the ball is ~1.5× faster (the cap)
const BOUNCE_SPEEDUP = 1.02;
const MAX_BOOST = 1.5;
const SLOW_MULTIPLIER = 0.75; // 🐢: −25% of the current speed
const SLOW_FLOOR = 0.5; // several 🐢 in a row can't take it below half the start speed
const currentSpeed = (world: World) => baseSpeed(world.height) * world.speedFactor * world.boost;
// ↔️ item: each one widens the bar by PADDLE_WIDE_STEP, up to PADDLE_WIDE_MAX × and never past PADDLE_WIDE_CAP of the screen
const PADDLE_WIDE_STEP = 1.3;
const PADDLE_WIDE_MAX = 2;
const PADDLE_WIDE_CAP = 0.5;
const paddleWidth = (world: World, scale = world.paddleScale) =>
  Math.min(world.width * PADDLE_WIDE_CAP, Math.min(world.width * 0.45, Math.max(110, px(PADDLE_WIDTH))) * scale);

// Item drops: the bricks holding items are fixed when the wall is built (placeItems). On break, the brick's item
// only drops if catching it would really do something — judged as if every item already falling were caught
// first — isn't the same type as the last drop, and its type hasn't used up the level's amount; otherwise it is
// swapped for a type that passes (dropItem), or nothing drops.
const EFFECT_EPSILON = 0.01; // "already at the limit" despite float rounding
const itemWouldWork = (world: World, type: ItemType): boolean => {
  const falling = world.items.filter((it) => it.type === type).length;
  switch (type) {
    case "split":
      // applyItem adds 2 while under MAX_BALLS
      return world.balls.length + 2 * falling < MAX_BALLS;
    case "grow": {
      let r = world.radius;
      for (let i = 0; i < falling; i++) r = Math.min(r + px(GROW_STEP), px(BALL_RADIUS_MAX));
      return r < px(BALL_RADIUS_MAX) - EFFECT_EPSILON;
    }
    case "slow": {
      // bar bounces before the catch would leave more to slow down — judged on the speed right now, to be safe
      let m = world.speedFactor * world.boost;
      for (let i = 0; i < falling; i++) m = Math.max(SLOW_FLOOR, m * SLOW_MULTIPLIER);
      return m > SLOW_FLOOR + EFFECT_EPSILON;
    }
    case "wide": {
      let s = world.paddleScale;
      for (let i = 0; i < falling; i++) s = Math.min(PADDLE_WIDE_MAX, s * PADDLE_WIDE_STEP);
      const next = Math.min(PADDLE_WIDE_MAX, s * PADDLE_WIDE_STEP);
      return paddleWidth(world, next) > paddleWidth(world, s) + EFFECT_EPSILON;
    }
  }
};

const itemAmount = (world: World, type: ItemType) => LEVELS[world.levelIdx].items?.[type] ?? 0;

const itemAllowed = (world: World, type: ItemType) =>
  type !== world.lastItem && world.itemDrops[type] < itemAmount(world, type) && itemWouldWork(world, type);

/** What a broken brick holding `planned` drops: that item if it passes every rule, else a seeded pick among
 *  the types that do, else nothing. */
const dropItem = (world: World, planned: ItemType): ItemType | null => {
  if (itemAllowed(world, planned)) return planned;
  const allowed = ITEM_TYPES.filter((type) => itemAllowed(world, type));
  return allowed.length ? allowed[Math.floor(world.rng() * allowed.length)] : null;
};

/** Item seed of the day + stage, e.g. "22-10-2026-LV-1" — `date` is todaySeed()'s "YYYY-MM-DD" (Thai time). */
const itemSeed = (date: string, levelIdx: number) => {
  const [y, m, d] = date.split("-");
  return `${d}-${m}-${y}-LV-${levelIdx + 1}`;
};

/** Hide the level's items (its amount of each type) in random bricks, one per brick, using the seeded rng —
 *  so every player gets the same item bricks on the same day. */
const placeItems = (world: World) => {
  const planned = ITEM_TYPES.flatMap((type) => Array<ItemType>(itemAmount(world, type)).fill(type));
  const items = shuffle(planned, world.rng);
  shuffle(world.bricks, world.rng)
    .slice(0, items.length)
    .forEach((brick, i) => (brick.item = items[i]));
};
const paddleTop = (height: number) => height - px(PADDLE_BOTTOM) - paddleHeight();

const gridCols = (world: World) => LEVELS[world.levelIdx].grid[0].length;
const gridRows = (world: World) => LEVELS[world.levelIdx].grid.length;

/** Cells spread across the width between the side margins, BRICK_GAP apart. */
const cellWidth = (world: World) => {
  const cols = gridCols(world);
  return (world.width - gridSide() * 2 - BRICK_GAP * (cols - 1)) / cols;
};

const brickRect = (world: World, brick: Brick): Rect => {
  const w = cellWidth(world);
  const h = cellHeight();
  return { x: gridSide() + brick.col * (w + BRICK_GAP), y: gridTop() + brick.row * (h + BRICK_GAP), w, h };
};

const gridBottom = (world: World) => gridTop() + gridRows(world) * (cellHeight() + BRICK_GAP) - BRICK_GAP;

/** Pictures for the stages, one each, no repeats within a game (wraps only if the pool is smaller). */
const planPictures = (): Picture[] => {
  const picked = shuffle(PICTURES);
  return LEVELS.map((_, i) => picked[i % picked.length]);
};

/** One 1×1 blank brick in every "o" cell. */
const buildBricks = (grid: string[]): Brick[] => {
  const bricks: Brick[] = [];
  grid.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === "o") bricks.push({ col, row, alive: true });
    });
  });
  return bricks;
};

const layoutLevel = (world: World) => {
  const grid = LEVELS[world.levelIdx].grid;
  world.bricks = buildBricks(grid);
  placeItems(world);
  world.radius = px(BALL_RADIUS, 12);
  world.paddleX = world.width / 2;
  world.layoutPending = false;
};

/** The whole brick area (all grid rows, gaps included), which the stage picture covers. */
const gridRect = (world: World): Rect => ({
  x: gridSide(),
  y: gridTop(),
  w: world.width - gridSide() * 2,
  h: gridBottom(world) - gridTop(),
});

/**
 * Draw the part of `img` that lies under `rect`, as if the picture were scaled to
 * cover the whole grid (object-fit: cover, centred) — so every brick shows
 * its own cut and together they look like the picture.
 */
const drawPictureCut = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, area: Rect, rect: Rect) => {
  const scale = Math.max(area.w / img.naturalWidth, area.h / img.naturalHeight);
  const originX = (img.naturalWidth - area.w / scale) / 2;
  const originY = (img.naturalHeight - area.h / scale) / 2;
  ctx.drawImage(
    img,
    originX + (rect.x - area.x) / scale,
    originY + (rect.y - area.y) / scale,
    rect.w / scale,
    rect.h / scale,
    rect.x,
    rect.y,
    rect.w,
    rect.h
  );
};

/**
 * The bouncing piece: a shield drawn on the canvas, centred on (x, y) and fitting the ball's collision
 * circle of radius r (so the physics is unchanged). Look follows the team's reference sprite: thick silver
 * rim, blue face split down the middle (light left / deeper right), a soft gloss and a small spark.
 */
const shieldPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const top = y - h / 2;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, top + h * 0.08);
  // top edge: corners up, a gentle rise to the middle
  ctx.quadraticCurveTo(x - w / 4, top + h * 0.1, x, top);
  ctx.quadraticCurveTo(x + w / 4, top + h * 0.1, x + w / 2, top + h * 0.08);
  // sides down, then in to the point
  ctx.lineTo(x + w / 2, top + h * 0.45);
  ctx.bezierCurveTo(x + w / 2, top + h * 0.75, x + w * 0.22, top + h * 0.9, x, top + h);
  ctx.bezierCurveTo(x - w * 0.22, top + h * 0.9, x - w / 2, top + h * 0.75, x - w / 2, top + h * 0.45);
  ctx.closePath();
};

const drawShield = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  const w = r * 1.8;
  const h = r * 2.1;
  ctx.save();
  // rim: silver, lit from the top left, with a dark outline
  shieldPath(ctx, x, y, w, h);
  const rim = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
  rim.addColorStop(0, "#F8FAFC");
  rim.addColorStop(0.55, "#CBD5E1");
  rim.addColorStop(1, "#64748B");
  ctx.fillStyle = rim;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.strokeStyle = "#334155";
  ctx.stroke();
  // face: light blue left half, deeper blue right half
  const fw = w * 0.74;
  const fh = h * 0.76;
  const fy = y + h * 0.015;
  shieldPath(ctx, x, fy, fw, fh);
  ctx.save();
  ctx.clip();
  const left = ctx.createLinearGradient(x, fy - fh / 2, x, fy + fh / 2);
  left.addColorStop(0, "#7DD3FC");
  left.addColorStop(1, "#38BDF8");
  ctx.fillStyle = left;
  ctx.fillRect(x - fw / 2, fy - fh / 2, fw / 2, fh);
  const right = ctx.createLinearGradient(x, fy - fh / 2, x, fy + fh / 2);
  right.addColorStop(0, "#0EA5E9");
  right.addColorStop(1, "#0369A1");
  ctx.fillStyle = right;
  ctx.fillRect(x, fy - fh / 2, fw / 2, fh);
  // gloss on the upper left
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x - fw * 0.2, fy - fh * 0.22, fw * 0.16, fh * 0.26, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // thin outline around the face (re-trace it: the current path is the gloss ellipse)
  shieldPath(ctx, x, fy, fw, fh);
  ctx.lineWidth = Math.max(0.75, r * 0.05);
  ctx.strokeStyle = "rgba(3, 105, 161, 0.8)";
  ctx.stroke();
  // spark on the top-right corner
  const sx = x + w * 0.42;
  const sy = y - h * 0.44;
  const s = r * 0.32;
  ctx.fillStyle = "#FEF9C3";
  ctx.beginPath();
  ctx.moveTo(sx, sy - s);
  ctx.quadraticCurveTo(sx, sy, sx + s, sy);
  ctx.quadraticCurveTo(sx, sy, sx, sy + s);
  ctx.quadraticCurveTo(sx, sy, sx - s, sy);
  ctx.quadraticCurveTo(sx, sy, sx, sy - s);
  ctx.fill();
  ctx.fillStyle = "#FACC15";
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** Split a broken brick into uneven pieces flying away from (hitX, hitY) — where the shield struck it. */
const breakBrick = (world: World, rect: Rect, hitX: number, hitY: number) => {
  const still = prefersReducedMotion(); // reduced motion: pieces just fade in place
  const { x: bx, y: by, w, h } = rect;
  // crack centre: the hit point pulled inside the brick, nudged a little so no two breaks look the same
  const jitter = () => (Math.random() - 0.5) * 0.2;
  const centre = {
    x: bx + w * clamp((hitX - bx) / w + jitter(), SHARD_CRACK_INSET, 1 - SHARD_CRACK_INSET),
    y: by + h * clamp((hitY - by) / h + jitter(), SHARD_CRACK_INSET, 1 - SHARD_CRACK_INSET),
  };
  // points on the edge by distance along it, clockwise from the top-left corner (wraps past the perimeter)
  const perimeter = 2 * (w + h);
  const corners = [0, w, w + h, 2 * w + h];
  const edgePoint = (t: number): Point => {
    const d = ((t % perimeter) + perimeter) % perimeter;
    if (d < w) return { x: bx + d, y: by };
    if (d < w + h) return { x: bx + w, y: by + d - w };
    if (d < 2 * w + h) return { x: bx + w - (d - w - h), y: by + h };
    return { x: bx, y: by + h - (d - 2 * w - h) };
  };
  // where the cracks meet the edge: evenly spread with jitter, so pieces vary without becoming slivers
  const count = SHARD_MIN + Math.floor(Math.random() * (SHARD_MAX - SHARD_MIN + 1));
  const step = perimeter / count;
  const start = Math.random() * perimeter;
  const cracks = Array.from({ length: count }, (_, i) => start + (i + (Math.random() - 0.5) * 0.7) * step);
  const unit = h;
  for (let i = 0; i < count; i++) {
    const a = cracks[i];
    const b = i + 1 < count ? cracks[i + 1] : cracks[0] + perimeter;
    // wedge: crack centre → edge at a → any corners passed on the way → edge at b
    const poly: Point[] = [centre, edgePoint(a)];
    for (let lap = Math.floor(a / perimeter) * perimeter; lap < b; lap += perimeter) {
      for (const c of corners) if (lap + c > a && lap + c < b) poly.push(edgePoint(c));
    }
    poly.push(edgePoint(b));
    const xs = poly.map((p) => p.x);
    const ys = poly.map((p) => p.y);
    const bounds = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    const origin = { x: xs.reduce((s, v) => s + v, 0) / poly.length, y: ys.reduce((s, v) => s + v, 0) / poly.length };
    // fly out from the crack centre (≈ the hit), so pieces burst away from the shield
    const dx = origin.x - centre.x;
    const dy = origin.y - centre.y;
    const dist = Math.hypot(dx, dy) || 1;
    const burst = unit * SHARD_BURST * (0.6 + Math.random() * 0.6);
    const fade = between(SHARD_FADE_MIN, SHARD_FADE_MAX);
    world.shards.push({
      poly,
      origin,
      bounds,
      x: origin.x,
      y: origin.y,
      vx: still ? 0 : (dx / dist) * burst + (Math.random() - 0.5) * unit,
      vy: still ? 0 : (dy / dist) * burst - unit * SHARD_POP * Math.random(),
      angle: 0,
      spin: still ? 0 : (Math.random() * 2 - 1) * SHARD_SPIN,
      age: 0,
      life: between(SHARD_HOLD_MIN, SHARD_HOLD_MAX) + fade,
      fade,
    });
  }
};

const updateShards = (world: World, dt: number) => {
  const gravity = prefersReducedMotion() ? 0 : world.height * SHARD_GRAVITY;
  for (let i = world.shards.length - 1; i >= 0; i--) {
    const s = world.shards[i];
    s.age += dt;
    if (s.age >= s.life || s.y - s.bounds.h > world.height) {
      world.shards.splice(i, 1);
      continue;
    }
    s.vy += gravity * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.angle += s.spin * dt;
  }
};

const drawShards = (ctx: CanvasRenderingContext2D, world: World, picture: HTMLImageElement | null, area: Rect) => {
  for (const s of world.shards) {
    const alpha = Math.min(1, (s.life - s.age) / s.fade);
    const scale = 1 - SHARD_SHRINK * (s.age / s.life);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    // move the piece's wall position onto its current centre, turned and shrunk — so drawing its outline where
    // it sat in the wall keeps the same cut of the picture it had there
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.scale(scale, scale);
    ctx.translate(-s.origin.x, -s.origin.y);
    ctx.beginPath();
    s.poly.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    // no white edge on the pieces (unlike the bricks) — just the picture
    if (picture) {
      ctx.clip();
      drawPictureCut(ctx, picture, area, s.bounds);
    } else {
      ctx.fillStyle = BRICK_FALLBACK;
      ctx.fill();
    }
    ctx.restore();
  }
};

/** Faint tapered tail along the shield's recent path — wide and most visible at the shield, gone at the end. */
const drawTrail = (ctx: CanvasRenderingContext2D, ball: Ball, r: number) => {
  const pts = ball.trail;
  if (!pts || pts.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 1; i < pts.length; i++) {
    const f = i / (pts.length - 1); // 0 at the oldest point, 1 at the shield
    ctx.beginPath();
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x, pts[i].y);
    ctx.lineWidth = r * TRAIL_WIDTH * f;
    ctx.strokeStyle = `rgba(${TRAIL_COLOR}, ${TRAIL_ALPHA * f})`;
    ctx.stroke();
  }
  ctx.restore();
};

const pictureReady = (img: HTMLImageElement | undefined): img is HTMLImageElement =>
  !!img && img.complete && img.naturalWidth > 0;

/** Push the ball out of `rect` and bounce it off the face it hit. Returns true on contact. */
const bounceOffRect = (ball: Ball, r: number, rect: Rect): boolean => {
  const nearestX = clamp(ball.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(ball.y, rect.y, rect.y + rect.h);
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;
  const distSq = dx * dx + dy * dy;
  if (distSq > r * r) return false;

  if (distSq > 0) {
    const dist = Math.sqrt(distSq);
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x = nearestX + nx * r;
    ball.y = nearestY + ny * r;
    if (Math.abs(nx) > Math.abs(ny)) ball.vx = Math.sign(nx) * Math.abs(ball.vx);
    else ball.vy = Math.sign(ny) * Math.abs(ball.vy);
    return true;
  }

  // centre already inside the rect — leave through the nearest side
  const exits = [
    { d: ball.x - rect.x, apply: () => ((ball.x = rect.x - r), (ball.vx = -Math.abs(ball.vx))) },
    { d: rect.x + rect.w - ball.x, apply: () => ((ball.x = rect.x + rect.w + r), (ball.vx = Math.abs(ball.vx))) },
    { d: ball.y - rect.y, apply: () => ((ball.y = rect.y - r), (ball.vy = -Math.abs(ball.vy))) },
    { d: rect.y + rect.h - ball.y, apply: () => ((ball.y = rect.y + rect.h + r), (ball.vy = Math.abs(ball.vy))) },
  ];
  exits.sort((a, b) => a.d - b.d)[0].apply();
  return true;
};

const createWorld = (levelIdx: number, seed = ""): World => {
  return {
    levelIdx,
    seed,
    rng: mulberry32(hashString(seed)),
    width: 1,
    height: 1,
    paddleX: 0.5,
    balls: [{ x: 0.5, y: 0, vx: 0, vy: 0 }],
    layoutPending: true,
    bricks: [],
    items: [],
    shards: [],
    clearDelay: null,
    attached: true,
    radius: BALL_RADIUS,
    growFlicker: null,
    paddleScale: 1,
    lastItem: null,
    itemDrops: { split: 0, grow: 0, slow: 0, wide: 0 },
    speedFactor: 1,
    boost: 1,
    lastTimestamp: null,
    clock: 0,
    ended: false,
  };
};

// เกณฑ์ดาวนับจากจำนวนครั้งที่ลูกหลุด (ไม่มีแพ้) — ด่านเต็มกริดใช้เวลานาน จึงเผื่อไว้กว้าง
const starsFor = (misses: number) => (misses <= 3 ? 3 : misses <= 8 ? 2 : 1);

// every box must be broken to clear a stage
const bricksAlive = (world: World) => world.bricks.filter((b) => b.alive).length;

export default function G17ScamBreaker({ onFinish, logEvent }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [bricksLeft, setBricksLeft] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World>(createWorld(0));
  const frameRef = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const missesRef = useRef(0);
  const levelMissesRef = useRef(0);
  // the picture of each stage — picked once per game, all preloaded when the game starts
  const picturesRef = useRef<Picture[] | null>(null);
  // the day the game was started ("YYYY-MM-DD", Thai time) — fixed for the whole game, even past midnight
  const playDateRef = useRef<string | null>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const dragRef = useRef<{ pointerId: number; startX: number; moved: boolean } | null>(null);
  const logRef = useRef(logEvent);
  useEffect(() => {
    logRef.current = logEvent;
  });

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const pictureOf = (idx: number) => (picturesRef.current ??= planPictures())[idx];

  // start loading every stage's picture up front, so the next stage's bricks are ready when it starts
  const preloadPictures = () => {
    for (let i = 0; i < LEVELS.length; i++) {
      const { media } = pictureOf(i);
      if (imagesRef.current.has(media)) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = media;
      imagesRef.current.set(media, img);
    }
  };

  const startLevel = (idx: number) => {
    // bricks are laid out (and enter_level logged) on the canvas's first resize — see onLayout
    preloadPictures();
    worldRef.current = createWorld(idx, itemSeed((playDateRef.current ??= todaySeed()), idx));
    levelMissesRef.current = 0;
    dragRef.current = null;
    setLevelIdx(idx);
    setBricksLeft(0);
    setToast(null);
    setPhase("playing");
  };

  const onLayout = () => {
    const world = worldRef.current;
    setBricksLeft(bricksAlive(world));
    logRef.current("enter_level", {
      game_id: "G17",
      level: world.levelIdx + 1,
      bricks: world.bricks.length,
      items: world.bricks.filter((b) => b.item).length,
      seed: world.seed,
      picture_id: pictureOf(world.levelIdx).id,
    });
  };

  const launch = () => {
    const world = worldRef.current;
    if (!world.attached) return;
    const speed = currentSpeed(world);
    const angle = ((Math.random() * 30 - 15) * Math.PI) / 180;
    world.balls = [{ x: world.paddleX, y: paddleTop(world.height) - world.radius, vx: speed * Math.sin(angle), vy: -speed * Math.cos(angle) }];
    world.attached = false;
  };

  const applyItem = (type: ItemType) => {
    const world = worldRef.current;
    if (type === "split") {
      const source = world.balls[0];
      if (source && world.balls.length < MAX_BALLS) {
        for (const turn of [-0.45, 0.45]) {
          const cos = Math.cos(turn);
          const sin = Math.sin(turn);
          let vy = source.vx * sin + source.vy * cos;
          if (vy > 0) vy = -vy; // new balls always head up, away from the floor
          world.balls.push({ x: source.x, y: source.y, vx: source.vx * cos - source.vy * sin, vy });
        }
      }
    } else if (type === "grow") {
      const from = world.radius;
      world.radius = Math.min(world.radius + px(GROW_STEP), px(BALL_RADIUS_MAX));
      // already at the biggest size: nothing to flicker between
      if (world.radius > from) world.growFlicker = { from, elapsed: 0 };
    } else if (type === "wide") {
      world.paddleScale = Math.min(PADDLE_WIDE_MAX, world.paddleScale * PADDLE_WIDE_STEP);
      // widens around its centre — keep it on screen near the edges
      const half = paddleWidth(world) / 2;
      world.paddleX = clamp(world.paddleX, half, world.width - half);
    } else if (type === "slow") {
      // 25% off the speed right now (bounce speed-up included), never below SLOW_FLOOR of the start speed;
      // the bounce speed-up keeps building from the new, slower speed
      const multiplier = world.speedFactor * world.boost;
      const slowed = Math.max(SLOW_FLOOR, multiplier * SLOW_MULTIPLIER);
      world.speedFactor = slowed / world.boost;
      const speed = currentSpeed(world);
      world.balls.forEach((b) => {
        const ratio = speed / (Math.hypot(b.vx, b.vy) || speed);
        b.vx *= ratio;
        b.vy *= ratio;
      });
    }
    showToast(ITEM_INFO[type].toast);
    logRef.current("item_collect", {
      game_id: "G17",
      item: type,
      speed_multiplier: Math.round(world.speedFactor * world.boost * 100) / 100,
    });
  };

  const finishLevel = () => {
    const world = worldRef.current;
    world.ended = true;
    // the canvas unmounts now — usually with the player's finger still down, so its
    // pointerup never arrives. A stale drag would make the next stage ignore every
    // new touch (touches get fresh pointer ids), leaving the shield unable to move or launch.
    dragRef.current = null;
    setPhase("levelClear");
    logRef.current("level_complete", {
      game_id: "G17",
      level: levelIdx + 1,
      picture_id: pictureOf(levelIdx).id,
      misses: levelMissesRef.current,
    });
  };

  const update = (dt: number) => {
    const world = worldRef.current;
    const { width, height } = world;
    const r = world.radius;
    const pw = paddleWidth(world);
    const py = paddleTop(height);

    if (world.ended || world.layoutPending) return;
    updateShards(world, dt);
    // tails: drop path points older than TRAIL_SECS (also while frozen at level clear, so they shrink away)
    world.clock += dt;
    for (const b of world.balls) {
      while (b.trail?.length && world.clock - b.trail[0].t > TRAIL_SECS) b.trail.shift();
    }
    if (world.growFlicker) {
      world.growFlicker.elapsed += dt;
      if (world.growFlicker.elapsed >= GROW_FLICKER_SECS) world.growFlicker = null;
    }
    // last brick gone: shields hold still while its pieces fall and fade, then the level-clear screen
    if (world.clearDelay !== null) {
      world.clearDelay -= dt;
      if (world.clearDelay <= 0 || world.shards.length === 0) finishLevel();
      return;
    }
    if (world.attached) {
      world.balls[0].x = world.paddleX;
      world.balls[0].y = py - r;
      world.balls[0].trail = undefined; // resting on the bar: no tail
      return;
    }

    for (let i = world.balls.length - 1; i >= 0; i--) {
      const ball = world.balls[i];
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x < r) {
        ball.x = r;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x > width - r) {
        ball.x = width - r;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y < r) {
        ball.y = r;
        ball.vy = Math.abs(ball.vy);
      }

      // paddle — bounce angle depends on where the ball lands; each bounce nudges the speed up
      if (
        ball.vy > 0 &&
        ball.y + r >= py &&
        ball.y - r <= py + paddleHeight() &&
        Math.abs(ball.x - world.paddleX) <= pw / 2 + r
      ) {
        const offset = clamp((ball.x - world.paddleX) / (pw / 2), -1, 1);
        world.boost = Math.min(MAX_BOOST, world.boost * BOUNCE_SPEEDUP);
        const speed = currentSpeed(world);
        ball.vx = speed * Math.sin(offset * MAX_BOUNCE_ANGLE);
        ball.vy = -speed * Math.cos(offset * MAX_BOUNCE_ANGLE);
        ball.y = py - r;
      }

      // one brick per ball per frame; bounce off the side the ball came in from
      for (const brick of world.bricks) {
        if (!brick.alive) continue;
        const rect = brickRect(world, brick);
        if (!bounceOffRect(ball, r, rect)) continue;

        brick.alive = false;
        breakBrick(world, rect, ball.x, ball.y);

        if (brick.item) {
          const type = dropItem(world, brick.item);
          if (type) {
            world.items.push({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, type });
            world.lastItem = type;
            world.itemDrops[type] += 1;
          }
        }
        const left = bricksAlive(world);
        setBricksLeft(left);
        logRef.current("brick_break", { game_id: "G17", bricks_left: left });
        break;
      }

      (ball.trail ??= []).push({ x: ball.x, y: ball.y, t: world.clock });
      if (ball.y - r > height) world.balls.splice(i, 1);
    }

    const itemSpeed = height * 0.22;
    for (let i = world.items.length - 1; i >= 0; i--) {
      const item = world.items[i];
      item.y += itemSpeed * dt;
      const half = itemSize() / 2;
      if (item.y + half >= py && item.y - half <= py + paddleHeight() && Math.abs(item.x - world.paddleX) <= pw / 2 + half) {
        world.items.splice(i, 1);
        applyItem(item.type);
      } else if (item.y - half > height) {
        world.items.splice(i, 1);
      }
    }

    // stage cleared when every box is gone — after the last one's break VFX has played out
    if (bricksAlive(world) === 0) {
      world.items = [];
      world.clearDelay = SHARD_HOLD_MAX + SHARD_FADE_MAX;
      return;
    }

    // โล่หลุดหมด = ไม่แพ้ แค่วางโล่ใหม่บนแถบแล้วให้กำลังใจ
    if (world.balls.length === 0) {
      missesRef.current += 1;
      levelMissesRef.current += 1;
      world.items = [];
      world.boost = 1;
      world.balls = [{ x: world.paddleX, y: py - world.radius, vx: 0, vy: 0 }];
      world.attached = true;
      showToast("ไม่เป็นไร ลองใหม่อีกครั้งนะ");
      logRef.current("ball_miss", { game_id: "G17", level: levelIdx + 1, misses: missesRef.current });
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const world = worldRef.current;
    const { width, height } = world;
    const fontFamily = notoLoopedThai.style.fontFamily;
    ctx.clearRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // stage picture, cut across the bricks in place; until it has loaded every brick is blank
    const img = imagesRef.current.get(pictureOf(world.levelIdx).media);
    const picture = pictureReady(img) ? img : null;
    const area = gridRect(world);

    for (const brick of world.bricks) {
      if (!brick.alive) continue;
      const rect = brickRect(world, brick);
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      if (picture) {
        ctx.clip();
        drawPictureCut(ctx, picture, area, rect);
      } else {
        ctx.fillStyle = BRICK_FALLBACK;
        ctx.fill();
      }
      ctx.restore();
      // 1px white edge, drawn inside the brick
      ctx.lineWidth = BRICK_BORDER;
      ctx.strokeStyle = "#FFFFFF";
      ctx.strokeRect(rect.x + BRICK_BORDER / 2, rect.y + BRICK_BORDER / 2, rect.w - BRICK_BORDER, rect.h - BRICK_BORDER);
    }

    drawShards(ctx, world, picture, area);

    ctx.font = `${itemSize()}px sans-serif`;
    for (const item of world.items) ctx.fillText(ITEM_INFO[item.type].emoji, item.x, item.y);

    const pw = paddleWidth(world);
    const py = paddleTop(height);
    ctx.beginPath();
    ctx.roundRect(world.paddleX - pw / 2, py, pw, paddleHeight(), paddleHeight() / 2);
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fill();

    // 🍄 just taken: flick old size ↔ new size (odd steps show the old one), settling on the new size
    const flicker = world.growFlicker;
    const shieldR =
      flicker && Math.floor(flicker.elapsed / GROW_FLICKER_STEP) % 2 === 1 ? flicker.from : world.radius;
    for (const ball of world.balls) drawTrail(ctx, ball, shieldR); // under every shield
    for (const ball of world.balls) drawShield(ctx, ball.x, ball.y, shieldR);

    if (world.attached) {
      const label = "แตะจอเพื่อปล่อยโล่";
      ctx.font = `600 ${textPx(22)}px ${fontFamily}`;
      const w = ctx.measureText(label).width + px(32);
      const pillH = px(44, 36);
      // halfway between the grid and the shield, so it never covers bricks on a short screen
      const y = (gridBottom(world) + py - world.radius * 2) / 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - w / 2, y - pillH / 2, w, pillH, pillH / 2);
      ctx.fillStyle = "rgba(75, 75, 75, 0.9)"; // #4B4B4B text tone — white on it passes 4.5:1
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(label, width / 2, y);
    }
  };

  // game loop — refs hold the world, so update/draw can be recreated each render
  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  const onLayoutRef = useRef(onLayout);
  useEffect(() => {
    updateRef.current = update;
    drawRef.current = draw;
    onLayoutRef.current = onLayout;
  });

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const world = worldRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const css = getComputedStyle(canvas);
      ui.s = parseFloat(css.getPropertyValue("--gp-s")) || 1;
      ui.t = parseFloat(css.getPropertyValue("--gp-t")) || 1;
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const sx = width / world.width;
      const sy = height / world.height;
      world.paddleX *= sx;
      world.balls.forEach((b) => {
        b.x *= sx;
        b.y *= sy;
        b.trail = undefined; // old path is in the old size — just start a new tail
      });
      world.items.forEach((it) => {
        it.x *= sx;
        it.y *= sy;
      });
      world.width = width;
      world.height = height;
      // pieces carry their old wall position (their picture cut), which a resize moves — just drop them
      world.shards = [];
      if (world.layoutPending) {
        layoutLevel(world);
        onLayoutRef.current();
      }
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current(ctx);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const tick = (timestamp: number) => {
      const world = worldRef.current;
      if (world.lastTimestamp === null) world.lastTimestamp = timestamp;
      // cap dt so a backgrounded tab doesn't teleport the ball through bricks
      const dt = Math.min((timestamp - world.lastTimestamp) / 1000, 1 / 30);
      world.lastTimestamp = timestamp;
      updateRef.current(dt);
      drawRef.current(ctx);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      worldRef.current.lastTimestamp = null;
    };
  }, [phase]);

  const movePaddleTo = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const world = worldRef.current;
    const half = paddleWidth(world) / 2;
    world.paddleX = clamp(clientX - bounds.left, half, world.width - half);
  };

  // ลากตรงไหนของจอก็ได้ แถบตามนิ้ว — แตะเฉย ๆ (ไม่ลาก) = ปล่อยลูก
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, moved: false };
    movePaddleTo(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      if (Math.abs(e.clientX - drag.startX) > TAP_SLOP_PX) drag.moved = true;
      movePaddleTo(e.clientX);
    } else if (!drag && e.pointerType === "mouse") {
      movePaddleTo(e.clientX); // desktop: shield follows the mouse like the HTML mock
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (!drag.moved && e.type === "pointerup") launch();
  };

  const isLastLevel = levelIdx >= LEVELS.length - 1;

  const handleLevelNext = () => {
    if (!isLastLevel) {
      startLevel(levelIdx + 1);
      return;
    }
    const stars = starsFor(missesRef.current);
    logEvent("game_complete", {
      game_id: "G17",
      levels: LEVELS.length,
      misses: missesRef.current,
      pictures: picturesRef.current?.map((p) => p.id) ?? [],
      stars,
    });
    onFinish(stars);
  };

  if (phase === "intro") {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="โล่กันโกง"
        objective="ลากแถบด้านล่างไปซ้าย-ขวา รับโล่ให้เด้งไปทำลายกล่องภาพให้หมด แล้วมาดูกันว่าภาพนั้นเป็นภาพจริง ภาพ AI หรือภาพตัดต่อ"
        choices="ของช่วย: 🪄 โล่แยกเป็น 3 อัน · 🍄 โล่ใหญ่ขึ้น · 🐢 โล่ช้าลง · ↔️ แถบรับยาวขึ้น"
        imageSrc="/assets/icons/g17-breaker.png"
        onStart={() => {
          logEvent("game_intro_start", { game_id: "G17" });
          startLevel(0);
        }}
      />
    );
  }

  if (phase === "levelClear") {
    const picture = pictureOf(levelIdx);
    const verdict = VERDICTS[picture.isAi ? (picture.category === "edited" ? "edited" : "ai") : "real"];
    const VerdictIcon = verdict.icon;
    return (
      <div className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col bg-white`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center gp-gap-20 gp-px-24 gp-py-28">
            <CheckCircle2 size={72} className="shrink-0 text-[#2FB84E]" aria-hidden="true" />
            <p className="text-center gp-text-32 font-bold gp-leading-40 text-black">
              {isLastLevel ? "ผ่านครบทุกด่านแล้ว!" : `ผ่านด่านที่ ${levelIdx + 1} แล้ว!`}
            </p>
            <p className="text-center gp-text-22 font-semibold gp-leading-32 text-[#4B4B4B]">
              กล่องที่ท่านทำลายไป ต่อกันเป็นภาพนี้
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element -- same G3 assets, shown as-is like G15/G16 */}
            <img
              src={picture.media}
              alt={picture.claim}
              className="block w-full gp-max-h-320 rounded-[16px] bg-black object-contain"
            />

            <div className={`w-full rounded-[16px] border-2 border-solid gp-px-16 gp-py-12 ${verdict.boxClass}`}>
              <p className={`flex items-center gp-gap-8 gp-text-24 font-bold gp-leading-32 ${verdict.textClass}`}>
                <VerdictIcon size={28} className="shrink-0" aria-hidden="true" />
                {verdict.label}
              </p>
              <p className="gp-mt-8 gp-text-20 font-semibold gp-leading-30 text-[#1a1a1a]">{picture.claim}</p>
              <p className="gp-mt-8 gp-text-20 gp-leading-30 text-[#1a1a1a]">{picture.explanation}</p>
              {picture.aiDisclosure && (
                <p className="gp-mt-8 gp-text-20 font-semibold gp-leading-30 text-[#4B4B4B]">ⓘ {picture.aiDisclosure}</p>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 gp-px-24 gp-pb-action-bar gp-pt-22">
          <Button3D onClick={handleLevelNext}>{isLastLevel ? "จบเกม" : "ไปด่านต่อไป"}</Button3D>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col overflow-hidden select-none`}
      style={{ backgroundImage: "linear-gradient(155.36deg, #E6F6FC 0%, #C4CFE1 100%)" }}
    >
      <GameStageHeader
        left={{ label: "เหลือ", value: bricksLeft, ariaLabel: `เหลือ ${bricksLeft} กล่อง` }}
        right={{ label: "ด่าน", value: levelIdx + 1, ariaLabel: `ด่าน ${levelIdx + 1} จาก ${LEVELS.length}` }}
      >
        {/* QA only (same idea as G13's skip-timer) — jump to the next stage layout without playing it out */}
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => {
              logEvent("g17_dev_skip_level", { game_id: "G17", level: levelIdx + 1 });
              if (!worldRef.current.ended) finishLevel();
            }}
            className="min-h-[48px] self-center rounded-[12px] border-2 border-dashed border-violet-500 bg-violet-50 gp-px-12 gp-text-20 font-bold text-violet-800"
            data-dev-only="g17-skip-level"
          >
            ข้ามด่าน
          </button>
        )}
      </GameStageHeader>

      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          aria-label="พื้นที่เกม ลากซ้ายขวาเพื่อขยับแถบ แตะเพื่อปล่อยโล่"
          className="absolute inset-0 block h-full w-full cursor-pointer touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        />
        {toast && (
          <div
            role="status"
            className="pointer-events-none absolute inset-x-[16px] top-[12px] mx-auto w-fit max-w-full rounded-full bg-[rgba(75,75,75,0.9)] gp-px-20 gp-py-8 text-center gp-text-20 font-semibold gp-leading-28 text-white"
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
