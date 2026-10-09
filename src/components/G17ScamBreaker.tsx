"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Camera, CheckCircle2, Scissors, Shield } from "lucide-react";
import { notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";
import GameIntro from "@/components/GameIntro";
import DATA from "@/data/g17-levels.json";
import G3_DATA from "@/data/g3-questions.json";

/**
 * G17 — โล่กันโกง (Scam breaker)
 *
 * Brick-breaker adapted from the team's ballbounce.html mock: drag the shield
 * (labelled 191, the Thai police number) left/right to bounce the 🛡️ shield
 * "ball" into the bricks.
 * Each stage takes one picture from the G3 pool and cuts it across the bricks,
 * in place, so the grid looks like the picture. After the stage the
 * whole picture is shown with G3's verdict (real / AI / edited) and explanation.
 * Differences from the HTML mock, to follow AGENT.md (elderly-first):
 * - no countdown and no game over — a lost ball respawns on the shield with a
 *   gentle message; misses only affect stars
 * - canvas is drawn at real CSS px (not a scaled 540×960)
 * - only helpful power-ups (split / bigger ball / slower ball); ⚡ faster and
 *   🧊 smaller were dropped
 * - the ball waits on the shield until the player taps, instead of launching at once
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
type ItemType = "split" | "grow" | "slow";

type Ball = { x: number; y: number; vx: number; vy: number };
// Positions are in grid cells, so the layout survives a resize.
// Each brick shows the part of the stage picture that sits under it.
type Brick = { col: number; row: number; alive: boolean };
type Item = { x: number; y: number; type: ItemType };
type Rect = { x: number; y: number; w: number; h: number };

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
  attached: boolean; // ball resting on the shield, waiting for a tap
  radius: number;
  speedFactor: number; // 🐢 item
  boost: number; // grows a little with every paddle bounce, back to 1 after a miss or 🐢
  lastTimestamp: number | null;
  ended: boolean; // level cleared — stops a late animation frame from finishing it twice
};

// one picture per stage, from the G3 "AI or not" pool (AI, edited and real photos alike)
const PICTURES = G3_DATA.pool as Picture[];
// Each level is a grid sketch: "o" = cells breakable bricks are packed into, any other character = empty.
const LEVELS = DATA.levels as { grid: string[] }[];

const GRID_TOP = 12;
const CELL_HEIGHT = 44;
const BRICK_INSET = 0; // visual gap between neighbouring bricks (0 = bricks touch)
const PADDLE_HEIGHT = 32;
const PADDLE_LABEL = "191"; // Thai police emergency number
const PADDLE_EMOJI_LEFT = "🚨";
const PADDLE_EMOJI_RIGHT = "👮";
const PADDLE_EMOJI_PX = 20;
const PADDLE_BOTTOM = 56;
const BALL_RADIUS = 16;
const BALL_RADIUS_MAX = 24;
const MAX_BALLS = 6;
const ITEM_DROP_CHANCE = 0.25;
const ITEM_SIZE = 32;

// Small-phone scaling (.gp-compact in globals.css): the canvas can't use the gp-* classes,
// so resize() reads --gp-s / --gp-t off the canvas and every canvas size goes through these.
// Module-level is fine — only one G17 is ever on screen.
const ui = { s: 1, t: 1 };
const px = (base: number, min = 0) => Math.max(min, base * ui.s);
const textPx = (base: number) => Math.max(18, Math.round(base * ui.t));
const gridTop = () => px(GRID_TOP);
const cellHeight = () => px(CELL_HEIGHT, 34);
const paddleHeight = () => px(PADDLE_HEIGHT, 28);
const itemSize = () => px(ITEM_SIZE, 24);
const MAX_BOUNCE_ANGLE = (60 * Math.PI) / 180;
const TAP_SLOP_PX = 10;

const ITEM_INFO: Record<ItemType, { emoji: string; toast: string }> = {
  split: { emoji: "🪄", toast: "🪄 โล่แยกเป็น 3 อัน!" },
  grow: { emoji: "🍄", toast: "🍄 โล่ใหญ่ขึ้น!" },
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

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
const paddleWidth = (width: number) => Math.max(110, width * 0.34);
const paddleTop = (height: number) => height - px(PADDLE_BOTTOM);

const labelFont = (px: number) => `700 ${px}px ${notoLoopedThai.style.fontFamily}`;

const gridCols = (world: World) => LEVELS[world.levelIdx].grid[0].length;

const cellRect = (world: World, col: number, row: number, span: number, rowSpan = 1): Rect => {
  const cellW = world.width / gridCols(world);
  return { x: col * cellW, y: gridTop() + row * cellHeight(), w: span * cellW, h: rowSpan * cellHeight() };
};

const brickRect = (world: World, brick: Brick): Rect => {
  const r = cellRect(world, brick.col, brick.row, 1);
  return { x: r.x + BRICK_INSET, y: r.y + BRICK_INSET, w: r.w - BRICK_INSET * 2, h: r.h - BRICK_INSET * 2 };
};

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
  world.radius = px(BALL_RADIUS, 12);
  world.paddleX = world.width / 2;
  world.layoutPending = false;
};

/** The whole brick area (all grid rows), which the stage picture covers. */
const gridRect = (world: World): Rect => cellRect(world, 0, 0, gridCols(world), LEVELS[world.levelIdx].grid.length);

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

const createWorld = (levelIdx: number): World => {
  return {
    levelIdx,
    width: 1,
    height: 1,
    paddleX: 0.5,
    balls: [{ x: 0.5, y: 0, vx: 0, vy: 0 }],
    layoutPending: true,
    bricks: [],
    items: [],
    attached: true,
    radius: BALL_RADIUS,
    speedFactor: 1,
    boost: 1,
    lastTimestamp: null,
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
    worldRef.current = createWorld(idx);
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
      world.radius = Math.min(world.radius + px(6), px(BALL_RADIUS_MAX));
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
    const pw = paddleWidth(width);
    const py = paddleTop(height);

    if (world.ended || world.layoutPending) return;
    if (world.attached) {
      world.balls[0].x = world.paddleX;
      world.balls[0].y = py - r;
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

        if (Math.random() < ITEM_DROP_CHANCE) {
          const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
          world.items.push({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, type });
        }
        const left = bricksAlive(world);
        setBricksLeft(left);
        logRef.current("brick_break", { game_id: "G17", bricks_left: left });
        break;
      }

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

    // stage cleared when every box is gone
    if (bricksAlive(world) === 0) {
      finishLevel();
      return;
    }

    // ลูกหลุดหมด = ไม่แพ้ แค่วางลูกใหม่บนโล่แล้วให้กำลังใจ
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
        ctx.fillStyle = "#E2E8F0";
        ctx.fill();
      }
      ctx.restore();
      // light edge so neighbouring cuts still read as separate blocks
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = picture ? "rgba(255, 255, 255, 0.7)" : "#94A3B8";
      ctx.stroke();
    }

    ctx.font = `${itemSize()}px sans-serif`;
    for (const item of world.items) ctx.fillText(ITEM_INFO[item.type].emoji, item.x, item.y);

    const pw = paddleWidth(width);
    const py = paddleTop(height);
    ctx.beginPath();
    ctx.roundRect(world.paddleX - pw / 2, py, pw, paddleHeight(), paddleHeight() / 2);
    ctx.fillStyle = "#0F766E"; // darker teal — white 191 on it passes 4.5:1
    ctx.fill();
    // 🚨 191 👮 — emoji and number drawn separately (different fonts), laid out as one centred row
    const labelY = py + paddleHeight() / 2 + 1;
    const emojiFont = `${textPx(PADDLE_EMOJI_PX)}px sans-serif`;
    ctx.font = labelFont(textPx(22));
    const numberW = ctx.measureText(PADDLE_LABEL).width;
    ctx.font = emojiFont;
    const emojiW = ctx.measureText(PADDLE_EMOJI_LEFT).width;
    const gap = 6;
    const left = world.paddleX - (emojiW * 2 + gap * 2 + numberW) / 2;
    ctx.fillText(PADDLE_EMOJI_LEFT, left + emojiW / 2, labelY);
    ctx.fillText(PADDLE_EMOJI_RIGHT, left + emojiW * 1.5 + gap * 2 + numberW, labelY);
    ctx.font = labelFont(textPx(22));
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(PADDLE_LABEL, left + emojiW + gap + numberW / 2, labelY);

    ctx.font = `${world.radius * 2}px sans-serif`;
    for (const ball of world.balls) ctx.fillText("🛡️", ball.x, ball.y + 1);

    if (world.attached) {
      const label = "แตะจอเพื่อปล่อยโล่";
      ctx.font = `600 ${textPx(22)}px ${fontFamily}`;
      const w = ctx.measureText(label).width + px(32);
      const pillH = px(44, 36);
      // halfway between the grid and the shield, so it never covers bricks on a short screen
      const gridBottom = gridTop() + LEVELS[world.levelIdx].grid.length * cellHeight();
      const y = (gridBottom + py - world.radius * 2) / 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - w / 2, y - pillH / 2, w, pillH, pillH / 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
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
      });
      world.items.forEach((it) => {
        it.x *= sx;
        it.y *= sy;
      });
      world.width = width;
      world.height = height;
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
    const half = paddleWidth(world.width) / 2;
    world.paddleX = clamp(clientX - bounds.left, half, world.width - half);
  };

  // ลากตรงไหนของจอก็ได้ โล่ตามนิ้ว — แตะเฉย ๆ (ไม่ลาก) = ปล่อยลูก
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
        objective="ลากแถบเบอร์ตำรวจ 191 ด้านล่างไปซ้าย-ขวา รับโล่ 🛡️ ให้เด้งไปทำลายกล่องภาพให้หมด แล้วมาดูกันว่าภาพนั้นเป็นภาพจริง ภาพ AI หรือภาพตัดต่อ"
        choices="ของช่วย: 🪄 โล่แยกเป็น 3 อัน · 🍄 โล่ใหญ่ขึ้น · 🐢 โล่ช้าลง"
        icon={Shield}
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

        <div className="shrink-0 gp-px-24 gp-pb-64 gp-pt-22">
          <Button3D onClick={handleLevelNext}>{isLastLevel ? "จบเกม" : "ไปด่านต่อไป"}</Button3D>
        </div>
      </div>
    );
  }

  return (
    <div className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F1F5F9] select-none`}>
      <div className="flex gp-min-h-52 shrink-0 items-center justify-between border-b-2 border-solid border-[#E2E8F0] bg-white gp-px-16 gp-text-20 font-semibold gp-leading-28 text-[#1a1a1a]">
        <span>
          ด่าน {levelIdx + 1} / {LEVELS.length}
        </span>
        {/* QA only (same idea as G13's skip-timer) — jump to the next stage layout without playing it out */}
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => {
              logEvent("g17_dev_skip_level", { game_id: "G17", level: levelIdx + 1 });
              if (!worldRef.current.ended) finishLevel();
            }}
            className="min-h-[48px] rounded-[12px] border-2 border-dashed border-violet-500 bg-violet-50 gp-px-12 gp-text-20 font-bold text-violet-800"
            data-dev-only="g17-skip-level"
          >
            ข้ามด่าน
          </button>
        )}
        <span>เหลือ {bricksLeft} กล่อง</span>
      </div>

      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          aria-label="พื้นที่เกม ลากซ้ายขวาเพื่อขยับแถบ 191 แตะเพื่อปล่อยโล่"
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
            className="pointer-events-none absolute inset-x-[16px] top-[12px] mx-auto w-fit max-w-full rounded-full bg-[rgba(15,23,42,0.85)] gp-px-20 gp-py-8 text-center gp-text-20 font-semibold gp-leading-28 text-white"
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
