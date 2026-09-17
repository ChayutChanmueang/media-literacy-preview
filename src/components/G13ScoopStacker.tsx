"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock3, MoveHorizontal, RotateCcw, Trophy } from "lucide-react";
import {
  clampToRange,
  getBombDropCount,
  getDifficultyProgress,
  getSkyAltitudeProgress,
  getTowerCameraTarget,
  getVisibleScoopRange,
  isCaughtAtTarget,
} from "@/lib/g13Game";
import GameIntro from "./GameIntro";

type Props = {
  onFinish: (score: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type GamePhase = "tutorial" | "playing" | "summary";
type Flavor = { spriteIndex: number };
type FallingKind = "scoop" | "bomb" | "double";

type FallingObject = {
  kind: FallingKind;
  flavor?: Flavor;
  flavor2?: Flavor;
  x: number;
  y: number;
  radius: number;
  vy: number;
  rotation: number;
  spawnerIndex: 1 | 2;
};

type Debris = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  flavor: Flavor;
};

type GameWorld = {
  width: number;
  height: number;
  dpr: number;
  coneX: number;
  cameraOffset: number;
  elapsed: number;
  spawnDelay1: number;
  spawnDelay2: number;
  secondSpawnerActive: boolean;
  falling: FallingObject[];
  stack: Flavor[];
  debris: Debris[];
  flash: number;
  flashColor: string;
  lastSecond: number;
  lastTimestamp: number | null;
  ended: boolean;
  dragOffset: number | null;
  dragPointerId: number | null;
};

const SESSION_TIME_SECONDS = 120;
// US-CF-14: sprites scaled 1.85× from original values
const SCOOP_RADIUS = 46;        // was 25
const SCOOP_STACK_STEP = 65;    // was 35
// SVG มีพื้นที่โปร่งเหนือขอบปากกรวยเล็กน้อย จึงให้ scoop ฐานซ้อนลงบน rim
// เพื่อให้ภาพที่เห็นและ collision target ตรงกัน ไม่ดูเหมือนลูกแรกลอยอยู่
const CONE_SCOOP_OVERLAP = 17;  // was 9
const CONE_WIDTH = 141;          // was 76
const CONE_HEIGHT = 174;         // was 94
const CONE_ASSET_PATH = "/assets/g13-waffle-cone.svg";

// US-CF-17: Visible ice cream height cap in pixels (excluding cone)
const MAX_VISIBLE_STACK_PX = 162; // 2.5 scoops height (used for camera tracking)
const RENDER_STACK_LIMIT_PX = 260; // 4 scoops height (used for rendering safely off screen)

// US-CF-15 & US-CF-18: progressive difficulty driven by current score (stack height)
/** Score at which difficulty reaches its cap */
const DIFFICULTY_SCORE_CAP = 15;
/** Fall speed multiplier: 1.0× at score 0 → 1.8× at cap */
const FALL_SPEED_MAX_MULTIPLIER = 1.8;
/** US-CF-18: Second spawner fall speed multiplier (always slower than first) */
const FALL_SPEED_2ND_MAX_MULTIPLIER = 1.4;
/** Spawn delay multiplier: 1.0× at score 0 → 0.45× at cap (faster spawning) */
const SPAWN_DELAY_MIN_MULTIPLIER = 0.45;
/** US-CF-18: Second spawner delay multiplier (less frequent than first) */
const SPAWN_DELAY_2ND_MIN_MULTIPLIER = 0.60;
/** Bomb chance range: ramps from base → max as score increases */
const BOMB_CHANCE_BASE = 0.26;
const BOMB_CHANCE_MAX = 0.30;
/** US-CF-19: Rare chance (~7%) for a scoop to spawn as a double scoop power-up */
const DOUBLE_SCOOP_CHANCE = 0.07;

const SCOOP_SPRITE_COUNT = 10;
const FLAVORS: Flavor[] = Array.from({ length: SCOOP_SPRITE_COUNT }, (_, i) => ({ spriteIndex: i }));

const createWorld = (): GameWorld => ({
  width: 1,
  height: 1,
  dpr: 1,
  coneX: 0.5,
  cameraOffset: 0,
  elapsed: 0,
  spawnDelay1: 0.45,
  spawnDelay2: 1.5,
  secondSpawnerActive: false,
  falling: [],
  stack: [],
  debris: [],
  flash: 0,
  flashColor: "rgba(249,115,22,",
  lastSecond: SESSION_TIME_SECONDS,
  lastTimestamp: null,
  ended: false,
  dragOffset: null,
  dragPointerId: null,
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const getTowerGeometry = (world: GameWorld, reduceMotion: boolean) => {
  const coneTop = world.height - CONE_HEIGHT - 10 + world.cameraOffset;
  const heightFactor = Math.min(world.stack.length, 16);
  const amplitude = reduceMotion ? 0 : Math.min(3 + heightFactor * 0.65, 13);
  const speed = 1.7 + Math.min(heightFactor * 0.045, 0.7);
  const wobble = world.stack.length < 4 ? 0 : Math.sin(world.elapsed * speed) * amplitude;
  const x = world.coneX * world.width;

  // US-CF-17: Cap visible ice cream height above cone to MAX_VISIBLE_STACK_PX (162px)
  const unclippedHeight =
    world.stack.length > 0 ? SCOOP_RADIUS + (world.stack.length - 1) * SCOOP_STACK_STEP : 0;
  const visibleHeight = Math.min(unclippedHeight, MAX_VISIBLE_STACK_PX);
  const topCenterY =
    world.stack.length > 0
      ? coneTop + CONE_SCOOP_OVERLAP - unclippedHeight
      : coneTop + CONE_SCOOP_OVERLAP;

  return { coneTop, x, wobble, topCenterY, visibleHeight };
};

export default function G13ScoopStacker({ onFinish, logEvent }: Props) {
  const [phase, setPhase] = useState<GamePhase>("tutorial");
  const [timeLeft, setTimeLeft] = useState(SESSION_TIME_SECONDS);
  const [height, setHeight] = useState(0);
  const [bestHeight, setBestHeight] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const worldRef = useRef<GameWorld>(createWorld());
  const coneImageRef = useRef<HTMLImageElement | null>(null);
  const scoopImagesRef = useRef<HTMLImageElement[]>([]);
  const logRef = useRef(logEvent);
  const phaseRef = useRef<GamePhase>(phase);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    logRef.current = logEvent;
  }, [logEvent]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // US-FLOW-02: รายงานความคืบหน้าตามเวลาที่เหลือให้ progress bar (สเตปปิดท้ายไต่ถึง ~100%)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("flowStepProgress", {
          detail: (SESSION_TIME_SECONDS - timeLeft) / SESSION_TIME_SECONDS,
        })
      );
    }
  }, [timeLeft]);

  const finishGame = useCallback(() => {
    const world = worldRef.current;
    if (world.ended) return;
    world.ended = true;
    const finalHeight = world.stack.length;
    setHeight(finalHeight);
    setBestHeight((previous) => Math.max(previous, finalHeight));
    setTimeLeft(0);
    setPhase("summary");
    logRef.current("game_complete", {
      game_id: "g13",
      tower_height: finalHeight,
      session_duration_ms: SESSION_TIME_SECONDS * 1000,
      renderer: "canvas",
    });
  }, []);

  const spawnObject = useCallback((spawnerIndex: 1 | 2) => {
    const world = worldRef.current;
    // US-CF-14: cap ratio scaled 1.85× (0.065 → 0.120) to match SCOOP_RADIUS
    const radius = Math.min(SCOOP_RADIUS, world.width * 0.120);
    const margin = radius + 8;
    // US-CF-15: bomb chance ramps from BOMB_CHANCE_BASE → BOMB_CHANCE_MAX with score
    const progress = getDifficultyProgress(world.stack.length, DIFFICULTY_SCORE_CAP);
    const bombChance = BOMB_CHANCE_BASE + (BOMB_CHANCE_MAX - BOMB_CHANCE_BASE) * progress;
    let kind: FallingKind = Math.random() < bombChance ? "bomb" : "scoop";

    // Ensure there is never more than 1 bomb falling at the same time
    if (kind === "bomb" && world.falling.some((item) => item.kind === "bomb")) {
      kind = "scoop";
    }

    if (kind === "scoop" && Math.random() < DOUBLE_SCOOP_CHANCE) {
      kind = "double";
    }

    // US-CF-15 & US-CF-18: Spawner 1 ramps to 1.8×, Spawner 2 ramps to 1.4× (always slower)
    const baseVy = Math.max(145, world.height * 0.245);
    const maxMult = spawnerIndex === 1 ? FALL_SPEED_MAX_MULTIPLIER : FALL_SPEED_2ND_MAX_MULTIPLIER;
    const vy = baseVy * (1 + (maxMult - 1) * progress);

    let x = margin + Math.random() * Math.max(1, world.width - margin * 2);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const isOverlapping = world.falling.some((item) => Math.abs(item.x - x) < radius * 2.8);
      if (!isOverlapping) break;
      x = margin + Math.random() * Math.max(1, world.width - margin * 2);
    }

    const flavor1 = kind === "scoop" || kind === "double" ? FLAVORS[Math.floor(Math.random() * FLAVORS.length)] : undefined;
    let flavor2: Flavor | undefined;
    if (kind === "double") {
      flavor2 = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
      while (flavor2 === flavor1 && FLAVORS.length > 1) {
        flavor2 = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
      }
    }

    world.falling.push({
      kind,
      flavor: flavor1,
      flavor2,
      x,
      y: -radius - 6,
      radius,
      vy,
      rotation: Math.random() * Math.PI * 2,
      spawnerIndex,
    });
  }, []);

  const removeTopScoops = useCallback((count: number) => {
    const world = worldRef.current;
    const removedCount = Math.min(count, getBombDropCount(world.stack.length));
    if (removedCount === 0) return 0;

    const geometry = getTowerGeometry(world, reduceMotionRef.current);
    const removed = world.stack.splice(world.stack.length - removedCount, removedCount);
    removed.reverse().forEach((flavor, index) => {
      world.debris.push({
        x: geometry.x + geometry.wobble + (index === 0 ? -8 : 8),
        y: geometry.topCenterY + index * SCOOP_STACK_STEP,
        radius: SCOOP_RADIUS,
        vx: index === 0 ? -105 : 105,
        vy: -155 - index * 25,
        rotation: 0,
        spin: index === 0 ? -3.8 : 3.8,
        flavor,
      });
    });
    setHeight(world.stack.length);
    return removedCount;
  }, []);

  const resolveFallingObject = useCallback(
    (falling: FallingObject, caught: boolean) => {
      const world = worldRef.current;
      world.falling = world.falling.filter((item) => item !== falling);

      if (falling.kind === "scoop") {
        if (caught) {
          const flavor = falling.flavor ?? FLAVORS[0];
          world.stack.push(flavor);
          setHeight(world.stack.length);
          setBestHeight((previous) => Math.max(previous, world.stack.length));
          logRef.current("scoop_catch", {
            game_id: "g13",
            tower_height: world.stack.length,
            renderer: "canvas",
          });
        } else {
          logRef.current("scoop_miss", {
            game_id: "g13",
            tower_height: world.stack.length,
            renderer: "canvas",
          });
        }
      } else if (falling.kind === "double") {
        if (caught) {
          const flavor1 = falling.flavor ?? FLAVORS[0];
          const flavor2 = falling.flavor2 ?? FLAVORS[1];
          world.stack.push(flavor1, flavor2);
          setHeight(world.stack.length);
          setBestHeight((previous) => Math.max(previous, world.stack.length));
          world.flash = 0.35;
          world.flashColor = "rgba(234,179,8,"; // Golden flash
          logRef.current("double_catch", {
            game_id: "g13",
            tower_height: world.stack.length,
            renderer: "canvas",
          });
        } else {
          logRef.current("double_miss", {
            game_id: "g13",
            tower_height: world.stack.length,
            renderer: "canvas",
          });
        }
      } else if (caught) {
        const removed = removeTopScoops(2);
        world.flash = 0.42;
        world.flashColor = "rgba(249,115,22,"; // Orange flash for bomb
        logRef.current("bomb_hit", {
          game_id: "g13",
          scoops_dropped: removed,
          tower_height: world.stack.length,
          renderer: "canvas",
        });
      } else {
        logRef.current("bomb_dodge", {
          game_id: "g13",
          tower_height: world.stack.length,
          renderer: "canvas",
        });
      }

      const progress = getDifficultyProgress(world.stack.length, DIFFICULTY_SCORE_CAP);
      if (falling.spawnerIndex === 1) {
        const delayMultiplier = 1 - (1 - SPAWN_DELAY_MIN_MULTIPLIER) * progress;
        world.spawnDelay1 = (falling.kind === "bomb" ? 0.55 : 0.32) * delayMultiplier;
      } else {
        const delayMultiplier2 = 1 - (1 - SPAWN_DELAY_2ND_MIN_MULTIPLIER) * progress;
        world.spawnDelay2 = ((falling.kind === "bomb" ? 0.65 : 0.45) + Math.random() * 0.4) * delayMultiplier2;
      }
    },
    [removeTopScoops]
  );

  const drawScoop = useCallback(
    (context: CanvasRenderingContext2D, x: number, y: number, radius: number, flavor: Flavor, rotation = 0) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);

      const image = scoopImagesRef.current[flavor.spriteIndex];
      if (image?.complete && image.naturalWidth > 0) {
        // Sprite width ≈ radius * 2.2 to compensate for transparent areas and overhang
        const width = radius * 2.2;
        context.drawImage(image, -width / 2, -width / 2, width, width);
      } else {
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fillStyle = "#cbd5e1";
        context.fill();
        context.strokeStyle = "#94a3b8";
        context.lineWidth = 2;
        context.stroke();
      }
      context.restore();
    },
    []
  );

  const drawBomb = useCallback((context: CanvasRenderingContext2D, falling: FallingObject) => {
    const { x, y, radius, rotation } = falling;
    context.save();
    context.translate(x, y);
    context.rotate(rotation);

    const gradient = context.createRadialGradient(-radius * 0.35, -radius * 0.38, 2, 0, 0, radius);
    gradient.addColorStop(0, "#64748b");
    gradient.addColorStop(0.45, "#1e293b");
    gradient.addColorStop(1, "#020617");
    context.beginPath();
    context.arc(0, 2, radius * 0.9, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = "#0f172a";
    context.stroke();

    context.beginPath();
    context.moveTo(radius * 0.35, -radius * 0.65);
    context.quadraticCurveTo(radius * 0.75, -radius * 1.25, radius * 0.32, -radius * 1.55);
    context.strokeStyle = "#78350f";
    context.lineWidth = 5;
    context.lineCap = "round";
    context.stroke();

    context.beginPath();
    context.arc(radius * 0.32, -radius * 1.58, radius * 0.23, 0, Math.PI * 2);
    context.fillStyle = "#f97316";
    context.shadowColor = "#facc15";
    context.shadowBlur = 12;
    context.fill();
    context.restore();
  }, []);

  const drawDoubleScoop = useCallback(
    (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      flavor1: Flavor,
      flavor2: Flavor,
      rotation = 0
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);

      // Draw golden glow behind double scoop
      context.save();
      context.beginPath();
      context.arc(0, -radius * 0.5, radius * 1.6, 0, Math.PI * 2);
      const glow = context.createRadialGradient(0, -radius * 0.5, radius * 0.2, 0, -radius * 0.5, radius * 1.6);
      glow.addColorStop(0, "rgba(250, 204, 21, 0.45)");
      glow.addColorStop(1, "rgba(250, 204, 21, 0)");
      context.fillStyle = glow;
      context.fill();
      context.restore();

      // Draw top scoop (flavor2)
      drawScoop(context, 0, -radius * 1.05, radius * 0.88, flavor2, 0);
      // Draw bottom scoop (flavor1) over top scoop
      drawScoop(context, 0, 0, radius, flavor1, 0);

      // Draw sparkle details / badge
      context.save();
      context.translate(radius * 0.65, -radius * 1.1);
      context.beginPath();
      context.arc(0, 0, radius * 0.38, 0, Math.PI * 2);
      context.fillStyle = "#facc15";
      context.strokeStyle = "#854d0e";
      context.lineWidth = 2;
      context.fill();
      context.stroke();
      context.fillStyle = "#422006";
      context.font = `bold ${Math.round(radius * 0.42)}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("×2", 0, 1);
      context.restore();

      context.restore();
    },
    [drawScoop]
  );

  const drawCone = useCallback((context: CanvasRenderingContext2D, x: number, coneTop: number, wobble: number) => {
    context.save();
    context.translate(x + wobble * 0.22, coneTop);
    const image = coneImageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      context.drawImage(image, -CONE_WIDTH / 2, 0, CONE_WIDTH, CONE_HEIGHT);
    } else {
      context.beginPath();
      context.moveTo(-CONE_WIDTH / 2, 4);
      context.lineTo(CONE_WIDTH / 2, 4);
      context.lineTo(0, CONE_HEIGHT);
      context.closePath();
      context.fillStyle = "#d99032";
      context.fill();
      context.strokeStyle = "#7c3f12";
      context.lineWidth = 3;
      context.stroke();
    }
    context.restore();
  }, []);

  const drawScene = useCallback(
    (context: CanvasRenderingContext2D) => {
      const world = worldRef.current;
      context.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);
      context.clearRect(0, 0, world.width, world.height);

      const altitude = getSkyAltitudeProgress(world.cameraOffset, world.height);
      const sky = context.createLinearGradient(0, 0, 0, world.height);
      sky.addColorStop(0, "#dbeafe");
      sky.addColorStop(0.58, "#fef3c7");
      sky.addColorStop(1, "#fed7aa");
      context.fillStyle = sky;
      context.fillRect(0, 0, world.width, world.height);

      // ไล่ความมืดต่อเนื่อง ไม่กระโดดตาม color stop อย่างเดียว
      context.fillStyle = `rgba(2,6,23,${altitude * 0.92})`;
      context.fillRect(0, 0, world.width, world.height);

      // ดาวค่อย ๆ ปรากฏหลังพ้นชั้นฟ้ากลางวัน ตำแหน่ง deterministic ไม่กระพริบสุ่ม
      const starOpacity = clampToRange((altitude - 0.24) / 0.5, 0, 1);
      if (starOpacity > 0) {
        for (let i = 0; i < 42; i += 1) {
          const x = ((i * 83 + 37) % 431) / 431 * world.width;
          const baseY = ((i * 137 + 19) % 503) / 503 * world.height;
          const y = (baseY + world.cameraOffset * (0.025 + (i % 3) * 0.012)) % world.height;
          const radius = i % 9 === 0 ? 1.8 : i % 4 === 0 ? 1.25 : 0.75;
          const twinkle = 0.72 + Math.sin(world.elapsed * 1.7 + i) * 0.18;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(255,255,255,${starOpacity * twinkle})`;
          context.fill();
        }
      }

      const cloudOpacity = 0.38 * (1 - altitude);
      context.fillStyle = `rgba(255,255,255,${cloudOpacity})`;
      for (let i = 0; i < 5; i += 1) {
        const x = ((i * 113 + world.elapsed * 7) % (world.width + 120)) - 60;
        const y = 48 + (i % 3) * 54 + world.cameraOffset * 0.14;
        context.beginPath();
        context.ellipse(x, y, 42, 14, 0, 0, Math.PI * 2);
        context.fill();
      }

      const geometry = getTowerGeometry(world, reduceMotionRef.current);
      context.save();
      context.beginPath();
      context.rect(0, 0, world.width, world.height);
      context.clip();

      drawCone(context, geometry.x, geometry.coneTop, geometry.wobble);

      // US-CF-17: Only render the visible slice of scoops sitting within RENDER_STACK_LIMIT_PX
      // to ensure it bleeds safely off the bottom edge without looking disconnected
      const { startIndex, endIndex } = getVisibleScoopRange(
        world.stack.length,
        RENDER_STACK_LIMIT_PX,
        SCOOP_STACK_STEP
      );
      for (let index = startIndex; index < endIndex; index += 1) {
        const flavor = world.stack[index];
        const layerRatio = world.stack.length <= 1 ? 0 : index / (world.stack.length - 1);
        const layerWobble = geometry.wobble * layerRatio;
        const y = geometry.topCenterY + (world.stack.length - 1 - index) * SCOOP_STACK_STEP;
        drawScoop(context, geometry.x + layerWobble, y, SCOOP_RADIUS, flavor, layerWobble * 0.012);
      }

      world.falling.forEach((item) => {
        if (item.kind === "bomb") {
          drawBomb(context, item);
        } else if (item.kind === "double") {
          drawDoubleScoop(
            context,
            item.x,
            item.y,
            item.radius,
            item.flavor ?? FLAVORS[0],
            item.flavor2 ?? FLAVORS[1],
            item.rotation
          );
        } else {
          drawScoop(
            context,
            item.x,
            item.y,
            item.radius,
            item.flavor ?? FLAVORS[0],
            item.rotation
          );
        }
      });

      world.debris.forEach((piece) => {
        drawScoop(context, piece.x, piece.y, piece.radius, piece.flavor, piece.rotation);
      });
      context.restore();

      if (world.flash > 0) {
        const colorPrefix = world.flashColor ?? "rgba(249,115,22,";
        context.fillStyle = `${colorPrefix}${Math.min(world.flash, 0.28)})`;
        context.fillRect(0, 0, world.width, world.height);
      }
    },
    [drawBomb, drawCone, drawDoubleScoop, drawScoop]
  );

  const updateWorld = useCallback(
    (delta: number) => {
      const world = worldRef.current;
      world.elapsed += delta;
      world.flash = Math.max(0, world.flash - delta);

      // Camera follow แบบเกมต่อตึก: เมื่อยอดสูงเกินครึ่งจอ ให้เลื่อนโลกลง
      // แทนการย่อหอ และ ease กลับขึ้นเมื่อระเบิดทำจำนวนชั้นลดลง
      const naturalConeTop = world.height - CONE_HEIGHT - 10;
      const unclippedHeight =
        world.stack.length > 0 ? SCOOP_RADIUS + (world.stack.length - 1) * SCOOP_STACK_STEP : 0;
      const naturalTopY =
        world.stack.length > 0
          ? naturalConeTop + CONE_SCOOP_OVERLAP - unclippedHeight
          : naturalConeTop + CONE_SCOOP_OVERLAP;

      // Target the top of the tower to be 162px (MAX_VISIBLE_STACK_PX) from the bottom of the screen
      const targetScreenY = world.height - MAX_VISIBLE_STACK_PX;
      const cameraTarget = getTowerCameraTarget(world.height, naturalTopY, targetScreenY / world.height);
      const cameraEase = 1 - Math.exp(-5.5 * delta);
      world.cameraOffset += (cameraTarget - world.cameraOffset) * cameraEase;
      if (Math.abs(cameraTarget - world.cameraOffset) < 0.05) {
        world.cameraOffset = cameraTarget;
      }

      const secondsRemaining = Math.max(0, Math.ceil(SESSION_TIME_SECONDS - world.elapsed));
      if (secondsRemaining !== world.lastSecond) {
        world.lastSecond = secondsRemaining;
        setTimeLeft(secondsRemaining);
      }
      if (world.elapsed >= SESSION_TIME_SECONDS) {
        finishGame();
        return;
      }

      world.debris.forEach((piece) => {
        piece.vy += 520 * delta;
        piece.x += piece.vx * delta;
        piece.y += piece.vy * delta;
        piece.rotation += piece.spin * delta;
      });
      world.debris = world.debris.filter(
        (piece) => piece.y - piece.radius < world.height + 50 && piece.x + piece.radius > -50 && piece.x - piece.radius < world.width + 50
      );

      const hasSpawner1 = world.falling.some((item) => item.spawnerIndex === 1);
      if (!hasSpawner1) {
        world.spawnDelay1 -= delta;
        if (world.spawnDelay1 <= 0) spawnObject(1);
      }

      if (world.stack.length >= 10 && !world.secondSpawnerActive) {
        world.secondSpawnerActive = true;
        world.spawnDelay2 = 0.3 + Math.random() * 0.5;
      }

      if (world.secondSpawnerActive) {
        const hasSpawner2 = world.falling.some((item) => item.spawnerIndex === 2);
        if (!hasSpawner2) {
          world.spawnDelay2 -= delta;
          if (world.spawnDelay2 <= 0) spawnObject(2);
        }
      }

      [...world.falling].forEach((falling) => {
        falling.y += falling.vy * delta;
        falling.rotation += (falling.kind === "bomb" ? 2.2 : 0.65) * delta;

        const geometry = getTowerGeometry(world, reduceMotionRef.current);
        const targetY = world.stack.length ? geometry.topCenterY : geometry.coneTop;
        const catchWidth = falling.kind === "bomb" ? CONE_WIDTH * 0.62 : SCOOP_RADIUS * 1.55;
        const caught = isCaughtAtTarget({
          objectX: falling.x,
          objectBottomY: falling.y + falling.radius,
          targetX: geometry.x + geometry.wobble,
          targetY,
          catchWidth,
          verticalTolerance: world.stack.length ? SCOOP_RADIUS * 0.42 : 2,
        });

        if (caught) {
          resolveFallingObject(falling, true);
        } else if (falling.y - falling.radius > world.height) {
          resolveFallingObject(falling, false);
        }
      });
    },
    [finishGame, resolveFallingObject, spawnObject]
  );

  useEffect(() => {
    const image = new window.Image();
    image.src = CONE_ASSET_PATH;
    coneImageRef.current = image;

    scoopImagesRef.current = Array.from({ length: SCOOP_SPRITE_COUNT }, (_, i) => {
      const img = new window.Image();
      img.src = `/assets/ice-cream/${i}.png`;
      return img;
    });

    return () => {
      coneImageRef.current = null;
      scoopImagesRef.current = [];
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reduceMotionRef.current = media.matches;
    };
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const world = worldRef.current;
      const previousWidth = world.width;
      const previousHeight = world.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);

      world.width = Math.max(1, bounds.width);
      world.height = Math.max(1, bounds.height);
      world.dpr = dpr;
      canvas.width = Math.round(world.width * dpr);
      canvas.height = Math.round(world.height * dpr);

      if (previousWidth > 1 && previousHeight > 1) {
        const scaleX = world.width / previousWidth;
        const scaleY = world.height / previousHeight;
        world.falling.forEach((item) => {
          item.x *= scaleX;
          item.y *= scaleY;
        });
        world.debris.forEach((piece) => {
          piece.x *= scaleX;
          piece.y *= scaleY;
        });
      }
      drawScene(context);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const tick = (timestamp: number) => {
      const world = worldRef.current;
      if (world.lastTimestamp === null) world.lastTimestamp = timestamp;
      const delta = Math.min((timestamp - world.lastTimestamp) / 1000, 0.05);
      world.lastTimestamp = timestamp;

      updateWorld(delta);
      drawScene(context);
      if (phaseRef.current === "playing" && !world.ended) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      worldRef.current.lastTimestamp = null;
    };
  }, [drawScene, phase, updateWorld]);

  const startGame = () => {
    worldRef.current = createWorld();
    setHeight(0);
    setTimeLeft(SESSION_TIME_SECONDS);
    setPhase("playing");
    logRef.current("game_start", {
      game_id: "g13",
      renderer: "canvas",
      session_duration_seconds: SESSION_TIME_SECONDS,
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || phaseRef.current !== "playing") return;
    const world = worldRef.current;
    if (world.dragPointerId !== null) return;

    const bounds = canvas.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    const coneScreenX = world.coneX * bounds.width;
    const hitThresholdX = Math.max(120, bounds.width * 0.3);

    // US-CF-20: Drag-to-move only initiates within generous hit area near cone in bottom portion of screen
    if (localY >= bounds.height * 0.38 && Math.abs(localX - coneScreenX) <= hitThresholdX) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch { }
      world.dragPointerId = event.pointerId;
      world.dragOffset = localX - coneScreenX;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.buttons === 0 && event.pointerType === "mouse") {
      worldRef.current.dragOffset = null;
      worldRef.current.dragPointerId = null;
      return;
    }
    const world = worldRef.current;
    if (world.dragPointerId !== event.pointerId || world.dragOffset === null) return;
    const canvas = canvasRef.current;
    if (!canvas || phaseRef.current !== "playing") return;

    const bounds = canvas.getBoundingClientRect();
    const halfCone = CONE_WIDTH / 2 + 4;
    const localX = event.clientX - bounds.left;
    const targetScreenX = localX - world.dragOffset;
    const clampedX = clampToRange(targetScreenX, halfCone, bounds.width - halfCone);
    world.coneX = bounds.width > 0 ? clampedX / bounds.width : 0.5;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const world = worldRef.current;
    if (world.dragPointerId === event.pointerId) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch { }
      world.dragPointerId = null;
      world.dragOffset = null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-amber-50 font-sans select-none">
      {phase === "tutorial" && (
        <GameIntro
          title="ต่อไอติมฝึกสมอง"
          objective="เกมฝึกสมองแสนสนุก! ลากกรวยไอติมเพื่อรับลูกไอติมให้ได้สูงที่สุดและหลบลูกระเบิดภายในเวลาที่กำหนด!"
          onStart={startGame}
          containerClassName="bg-gradient-to-b from-sky-100 to-orange-100"
          mediaSlot={
            <div className="w-28 h-32 rounded-3xl bg-white/65 shadow-md flex items-center justify-center">
              <Image
                src={CONE_ASSET_PATH}
                alt="กรวยไอติมลายวาฟเฟิล"
                width={80}
                height={112}
                priority
                className="w-20 h-28 object-contain"
              />
            </div>
          }
        />
      )}

      {phase === "playing" && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="shrink-0 min-h-12 px-4 py-2 flex items-center justify-between bg-white border-b border-amber-200 text-[clamp(17px,4.35vw,20px)] font-bold">
            <span className="flex items-center gap-2 text-slate-700">
              <Clock3 size={21} aria-hidden="true" /> {formatTime(timeLeft)}
            </span>
            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={() => {
                  logRef.current("g13_dev_skip_timer", {
                    game_id: "g13",
                    tower_height: worldRef.current.stack.length,
                  });
                  finishGame();
                }}
                className="min-h-12 rounded-xl border-2 border-dashed border-violet-500 bg-violet-50 px-3 text-[20px] font-bold text-violet-800"
                aria-label="ข้ามเวลาที่เหลือสำหรับทดสอบเกม"
                data-dev-only="g13-skip-timer"
              >
                ข้ามเวลา
              </button>
            )}
            <span className="flex items-center gap-2 text-amber-900">
              <Trophy size={21} aria-hidden="true" /> สูง {height} ชั้น
            </span>
          </div>
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <canvas
              ref={canvasRef}
              aria-label="พื้นที่เกมวางไอติม ลากซ้ายขวาเพื่อรับไอติมและหลบระเบิด"
              className="absolute inset-0 block w-full h-full touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
            {/* Fixed input hit area — ไม่ขยับตามกรวย/camera จึงลากต่อได้แม้กรวยพ้นขอบล่าง */}
            <div
              role="group"
              aria-label="พื้นที่ลากควบคุมกรวยไอติม"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-x-0 bottom-0 z-10 h-[34%] min-h-24 touch-none cursor-grab active:cursor-grabbing flex items-end justify-center pb-3 bg-gradient-to-t from-white/20 to-transparent"
            >
              <div className="pointer-events-none flex items-center gap-2 rounded-full border border-amber-900/20 bg-white/65 px-4 py-1.5 text-[clamp(14px,3.7vw,17px)] font-bold text-amber-950 shadow-sm backdrop-blur-sm">
                <MoveHorizontal size={21} aria-hidden="true" />
                ลากตรงนี้เพื่อขยับ
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "summary" && (
        <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-5 text-center bg-gradient-to-b from-sky-100 to-orange-100">
          <Trophy size={58} className="text-amber-600 mb-3" aria-hidden="true" />
          <h2 className="text-[clamp(24px,6.3vw,29px)] font-bold text-amber-950 mb-2">ต่อไอติมได้ยอดเยี่ยม!</h2>
          <p className="text-[clamp(18px,4.8vw,22px)] text-slate-700 mb-5">
            หอไอติมสูง {height} ชั้น
            {bestHeight > height ? ` · สูงสุด ${bestHeight} ชั้น` : ""}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={() => onFinish(height)}
              className="btn btn-primary min-h-16 text-[clamp(18px,4.8vw,22px)]"
            >
              เสร็จสิ้นบทเรียน <ArrowRight size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={startGame}
              className="btn btn-outline min-h-14 text-[clamp(18px,4.8vw,22px)] bg-white"
            >
              <RotateCcw size={22} aria-hidden="true" /> เล่นอีกรอบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
