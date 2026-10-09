"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import GameHudBar, { GameHudItem, HUD_DEV_BUTTON_CLASS } from "./GameHudBar";
import { ArrowRight, Clock3, GraduationCap, RotateCcw, Trophy } from "lucide-react";
import {
  clampToRange,
  getBombDropCount,
  getDifficultyProgress,
  getKeyframeValue,
  getSkyAltitudeProgress,
  getTowerCameraTarget,
  getVisibleScoopRange,
  isCaughtAtTarget,
} from "@/lib/g13Game";
import GameIntro from "./GameIntro";
import { seededStream, todaySeed, type Rng } from "@/lib/seededRandom";

type Props = {
  onFinish: (score: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
  // โหมดอิสระ: ปุ่มจบเกมในหน้าสรุปคะแนนใช้ข้อความ "ต่อไป" แทน "เสร็จสิ้นบทเรียน" (ค่าเริ่มต้น "flow" กันไม่ให้ Dev Hub เปลี่ยนพฤติกรรม)
  learningMode?: "flow" | "manual";
};

type GamePhase = "intro" | "playing" | "summary";
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
  scripted?: boolean; // tutorial drop: not from the seed, never scored
};

// Hand tutorial played once each time the game is opened, before the timed round:
// move = drag the cone left and right, catch = a scripted scoop, dodge = a scripted bomb,
// ready = a short "well done" before the real (seeded) round starts.
type TutorialStep = "move" | "catch" | "dodge" | "ready";
type Tutorial = {
  step: TutorialStep;
  wait: number; // seconds until the step's drop spawns (or, on "ready", until the round starts)
  reachedLeft: boolean; // "move": the cone has been dragged to the left side of the screen
  reachedRight: boolean; // "move": … and to the right side
  handClock: number; // seconds into the current hand loop
  dodgeX: number; // where the hand shows to move the cone on "dodge"
};
type TutorialBanner = { text: string; tone: "info" | "praise" | "retry" };

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
  roundStartedAt: number; // world.elapsed when the timed round began (the tutorial isn't timed)
  tutorial: Tutorial | null;
};

const SESSION_TIME_SECONDS = 120;
// US-CF-14: sprites scaled 1.85× from original values; then × SPRITE_SCALE so about 5 scoops
// fit across a phone screen. Scoops, bombs (same radius), the cone and the stack spacing all
// scale together, and the catch reaches / camera heights below follow.
const SPRITE_SCALE = 0.9;
const SCOOP_RADIUS = 46 * SPRITE_SCALE;        // was 25, then 46
const SCOOP_STACK_STEP = 65 * SPRITE_SCALE;    // was 35, then 65
// SVG มีพื้นที่โปร่งเหนือขอบปากกรวยเล็กน้อย จึงให้ scoop ฐานซ้อนลงบน rim
// เพื่อให้ภาพที่เห็นและ collision target ตรงกัน ไม่ดูเหมือนลูกแรกลอยอยู่
const CONE_SCOOP_OVERLAP = 17 * SPRITE_SCALE;  // was 9, then 17
const CONE_WIDTH = 141 * SPRITE_SCALE;         // was 76, then 141
const CONE_HEIGHT = 174 * SPRITE_SCALE;        // was 94, then 174
// Falling objects are also capped to this share of the screen width (narrow screens)
const FALLING_RADIUS_WIDTH_RATIO = 0.12 * SPRITE_SCALE;
const CONE_ASSET_PATH = "/assets/g13-waffle-cone.svg";
// Horizontal reach (from the cone's centre) within which a falling object lands on the tower
const SCOOP_CATCH_REACH = SCOOP_RADIUS * 1.55;
const BOMB_HIT_REACH = CONE_WIDTH * 0.62;
// With no scoop yet, a drop counts while its bottom is within this far below the cone's rim
const EMPTY_CONE_CATCH_DEPTH = SCOOP_RADIUS * 0.5;

// US-CF-17: Visible ice cream height cap in pixels (excluding cone)
const MAX_VISIBLE_STACK_PX = 162 * SPRITE_SCALE; // 2.5 scoops height (used for camera tracking)
const RENDER_STACK_LIMIT_PX = 260 * SPRITE_SCALE; // 4 scoops height (used for rendering safely off screen)

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

// Spawns are seeded by today's date (Bangkok time), like G19, so every player gets the same
// drops that day. One stream per spawner, and every spawn reads a fixed bundle of numbers
// (SpawnRolls) whatever it turns into — so the n-th drop of a spawner always gets the same
// rolls, even if a player's score (bomb chance) or a bomb already falling changes the outcome.
// Spawner 2's random wait between drops has its own stream for the same reason.
type SpawnRngs = { spawner1: Rng; spawner2: Rng; spawner2Delay: Rng };
const makeSpawnRngs = (seed: string): SpawnRngs => ({
  spawner1: seededStream("G13", seed, "spawner-1"),
  spawner2: seededStream("G13", seed, "spawner-2"),
  spawner2Delay: seededStream("G13", seed, "spawner-2-delay"),
});

const X_ATTEMPTS = 9; // first try + 8 retries to avoid landing on top of another falling object
type SpawnRolls = { kind: number; double: number; flavor1: number; flavor2: number; rotation: number; xs: number[] };
const drawSpawnRolls = (rng: Rng): SpawnRolls => ({
  kind: rng(),
  double: rng(),
  flavor1: rng(),
  flavor2: rng(),
  rotation: rng(),
  xs: Array.from({ length: X_ATTEMPTS }, () => rng()),
});

// Tutorial pacing — slow and forgiving (elderly-first, no pressure)
// "move" passes once the cone has been to both sides: within this share of its travel range from each end
const TUTORIAL_SIDE_ZONE = 0.15;
const TUTORIAL_FALL_SPEED = 0.55; // scripted drops fall at this share of the normal starting speed
const TUTORIAL_PRAISE_S = 1.6; // "เก่งมาก!" stays up before the next step's drop
const TUTORIAL_RETRY_S = 1.6; // gentle "try again" before a missed drop comes again
const TUTORIAL_READY_S = 2.2; // "start the real game" message before the timer starts
const TUTORIAL_SCOOP_FLAVOR = 2;
// The hand hides once the cone is already in place: well under the scoop / clear of the bomb
const HAND_CATCH_CLOSE_PX = SCOOP_CATCH_REACH * 0.6;
const HAND_DODGE_CLEAR_PX = BOMB_HIT_REACH + 12;
const HAND_MOVE_LOOP_S = 3.6; // press in the middle, swipe to the left side, to the right side, back, lift
const HAND_SLIDE_LOOP_S = 2.8; // press, slide to the target, lift, glide back to the cone
// [loop progress, value] tracks for the hand: x offset (× distance), opacity, pressed (1 = down).
// It stays on screen the whole loop (fades in only when it first appears), so the player always
// sees what to do until the cone is in place.
// "move" track: -1 = left side, 0 = middle, 1 = right side of the screen (not tied to the cone)
const HAND_MOVE_X = [[0, 0], [0.12, 0], [0.38, -1], [0.46, -1], [0.74, 1], [0.82, 1], [0.95, 0], [1, 0]] as const;
const HAND_MOVE_PRESSED: [number, number] = [0.08, 0.92];
const HAND_SLIDE_X = [[0, 0], [0.22, 0], [0.56, 1], [0.68, 1], [0.92, 0], [1, 0]] as const;
const HAND_FADE_IN_S = 0.3;
const HAND_SLIDE_PRESSED: [number, number] = [0.14, 0.62];
// Guide arrow drawn behind the cone along the hand's path, pointing where the hand goes.
// One outlined shape (shaft + heads), a bit see-through so the hand stays the main cue.
const GUIDE_SHAFT_HALF_WIDTH = 5;
const GUIDE_HEAD_LENGTH = 26;
const GUIDE_HEAD_HALF_WIDTH = 17;
const GUIDE_OUTLINE_WIDTH = 3; // white rim, keeps the arrow readable over the sky
const GUIDE_FILL_TOP = "#FCD34D";
const GUIDE_FILL_BOTTOM = "#F59E0B";
const GUIDE_OPACITY = 0.7;

const TUTORIAL_TEXT = {
  move: "แตะกรวยค้างไว้ แล้วลากไปให้สุดทางซ้าย และสุดทางขวา",
  moveRight: "ดีมาก! ต่อไปลากไปให้สุดทางขวา",
  moveLeft: "ดีมาก! ต่อไปลากไปให้สุดทางซ้าย",
  catch: "ลากกรวยไปรับไอติมที่ตกลงมา",
  catchRetry: "ไม่เป็นไร ลองรับใหม่อีกครั้งนะ",
  dodge: "ระวังระเบิด 💣 ลากกรวยหลบออกไป",
  dodgeRetry: "ไม่เป็นไร ลองหลบใหม่อีกครั้งนะ",
  praise: "เก่งมาก!",
  ready: "เก่งมาก! เริ่มเกมจริงกันเลย",
};

const createTutorial = (): Tutorial => ({
  step: "move",
  wait: 0,
  reachedLeft: false,
  reachedRight: false,
  handClock: 0,
  dodgeX: 0,
});

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
  roundStartedAt: 0,
  tutorial: null,
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

// Where the tutorial hand is this frame, and the path its guide arrow covers
type HandPose = {
  x: number;
  y: number;
  pressed: boolean;
  opacity: number;
  pathFrom: number;
  pathTo: number;
  bothWays: boolean; // "move" swipes back and forth, so its arrow points both ways
};

const getTutorialHandPose = (world: GameWorld, coneX: number, coneTop: number): HandPose | null => {
  const tutorial = world.tutorial;
  if (!tutorial) return null;
  const scripted = world.falling.find((item) => item.scripted);
  if (tutorial.step !== "move" && !scripted) return null;
  // keeps looping (also while dragging) until the cone is in place, then hides — a slide that
  // short would only be in the way; it comes back if the cone is moved off again
  if (tutorial.step === "catch" && scripted && Math.abs(coneX - scripted.x) <= HAND_CATCH_CLOSE_PX) return null;
  if (tutorial.step === "dodge" && scripted && Math.abs(coneX - scripted.x) >= HAND_DODGE_CLEAR_PX) return null;

  const opacity = clampToRange(tutorial.handClock / HAND_FADE_IN_S, 0, 1);
  const y = coneTop + CONE_HEIGHT * 0.36; // on the cone's body, below the scoops
  if (tutorial.step === "move") {
    // a plain left–right swipe across the screen, the full distance the cone can travel
    const t = (tutorial.handClock % HAND_MOVE_LOOP_S) / HAND_MOVE_LOOP_S;
    const middle = world.width / 2;
    const reach = Math.max(0, middle - (CONE_WIDTH / 2 + 4));
    return {
      x: middle + getKeyframeValue(t, HAND_MOVE_X) * reach,
      y,
      pressed: t >= HAND_MOVE_PRESSED[0] && t <= HAND_MOVE_PRESSED[1],
      opacity,
      pathFrom: middle - reach,
      pathTo: middle + reach,
      bothWays: true,
    };
  }
  const t = (tutorial.handClock % HAND_SLIDE_LOOP_S) / HAND_SLIDE_LOOP_S;
  const targetX = tutorial.step === "catch" && scripted ? scripted.x : tutorial.dodgeX;
  return {
    x: coneX + (targetX - coneX) * getKeyframeValue(t, HAND_SLIDE_X),
    y,
    pressed: t >= HAND_SLIDE_PRESSED[0] && t <= HAND_SLIDE_PRESSED[1],
    opacity,
    pathFrom: coneX,
    pathTo: targetX,
    bothWays: false,
  };
};

// Closed polygon with rounded corners: [x, y, corner radius] per corner
type Corner = [number, number, number];
const traceRoundedPolygon = (context: CanvasRenderingContext2D, corners: Corner[]) => {
  const first = corners[0];
  const last = corners[corners.length - 1];
  context.beginPath();
  context.moveTo((last[0] + first[0]) / 2, (last[1] + first[1]) / 2);
  corners.forEach(([x, y, radius], index) => {
    const next = corners[(index + 1) % corners.length];
    context.arcTo(x, y, next[0], next[1], radius);
  });
  context.closePath();
};

// The guide arrow is one outlined shape: shaft and head(s) traced as a single path. It's drawn
// opaque on a buffer canvas first, then copied see-through — drawing the rim and fill straight
// onto the scene with transparency would show the rim through the fill.
const drawGuideArrow = (
  context: CanvasRenderingContext2D,
  buffer: HTMLCanvasElement,
  world: GameWorld,
  pose: HandPose
) => {
  const { pathFrom, pathTo, bothWays } = pose;
  const length = Math.abs(pathTo - pathFrom);
  if (length < GUIDE_HEAD_LENGTH * (bothWays ? 2.5 : 1.5)) return;
  const bufferContext = buffer.getContext("2d");
  if (!bufferContext) return;

  const bandHeight = (GUIDE_HEAD_HALF_WIDTH + GUIDE_OUTLINE_WIDTH + 2) * 2;
  const pixelWidth = Math.ceil(world.width * world.dpr);
  const pixelHeight = Math.ceil(bandHeight * world.dpr);
  if (buffer.width !== pixelWidth || buffer.height !== pixelHeight) {
    buffer.width = pixelWidth;
    buffer.height = pixelHeight;
  }
  bufferContext.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);
  bufferContext.clearRect(0, 0, world.width, bandHeight);

  // corners laid out along the path (0 = start, length = tip), offset above/below its centre line
  const mid = bandHeight / 2;
  const direction = Math.sign(pathTo - pathFrom);
  const at = (along: number, offset: number, radius: number): Corner => [pathFrom + direction * along, mid + offset, radius];
  const s = GUIDE_SHAFT_HALF_WIDTH;
  const h = GUIDE_HEAD_HALF_WIDTH;
  const neck = length - GUIDE_HEAD_LENGTH;
  const tipHead = [at(neck, -s, 3), at(neck, -h, 4), at(length, 0, 3), at(neck, h, 4), at(neck, s, 3)];
  const corners: Corner[] = bothWays
    ? [at(0, 0, 3), at(GUIDE_HEAD_LENGTH, -h, 4), at(GUIDE_HEAD_LENGTH, -s, 3), ...tipHead, at(GUIDE_HEAD_LENGTH, s, 3), at(GUIDE_HEAD_LENGTH, h, 4)]
    : [at(0, -s, s), ...tipHead, at(0, s, s)]; // one-way: round tail at the cone

  traceRoundedPolygon(bufferContext, corners);
  bufferContext.lineJoin = "round";
  bufferContext.lineWidth = GUIDE_OUTLINE_WIDTH * 2; // the fill covers the inner half
  bufferContext.strokeStyle = "#FFFFFF";
  bufferContext.stroke();
  const fill = bufferContext.createLinearGradient(0, mid - h, 0, mid + h);
  fill.addColorStop(0, GUIDE_FILL_TOP);
  fill.addColorStop(1, GUIDE_FILL_BOTTOM);
  bufferContext.fillStyle = fill;
  bufferContext.fill();

  context.save();
  context.globalAlpha = pose.opacity * GUIDE_OPACITY;
  context.drawImage(buffer, 0, pose.y - mid, world.width, bandHeight);
  context.restore();
};

const getTowerGeometry = (world: GameWorld, reduceMotion: boolean) => {
  const coneTop = world.height - CONE_HEIGHT - 10 + world.cameraOffset;
  const heightFactor = Math.min(world.stack.length, 16);
  const amplitude = reduceMotion ? 0 : Math.min(3 + heightFactor * 0.65, 13);
  const speed = 1.7 + Math.min(heightFactor * 0.045, 0.7);
  const wobble = world.stack.length < 4 ? 0 : Math.sin(world.elapsed * speed) * amplitude;
  const x = world.coneX * world.width;

  // US-CF-17: Cap visible ice cream height above cone to MAX_VISIBLE_STACK_PX
  const unclippedHeight =
    world.stack.length > 0 ? SCOOP_RADIUS + (world.stack.length - 1) * SCOOP_STACK_STEP : 0;
  const visibleHeight = Math.min(unclippedHeight, MAX_VISIBLE_STACK_PX);
  const topCenterY =
    world.stack.length > 0
      ? coneTop + CONE_SCOOP_OVERLAP - unclippedHeight
      : coneTop + CONE_SCOOP_OVERLAP;

  return { coneTop, x, wobble, topCenterY, visibleHeight };
};

export default function G13ScoopStacker({ onFinish, logEvent, learningMode = "flow" }: Props) {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [timeLeft, setTimeLeft] = useState(SESSION_TIME_SECONDS);
  const [height, setHeight] = useState(0);
  const [bestHeight, setBestHeight] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const worldRef = useRef<GameWorld>(createWorld());
  const coneImageRef = useRef<HTMLImageElement | null>(null);
  const scoopImagesRef = useRef<HTMLImageElement[]>([]);
  const guideBufferRef = useRef<HTMLCanvasElement | null>(null); // offscreen canvas for the tutorial's guide arrow
  const logRef = useRef(logEvent);
  const phaseRef = useRef<GamePhase>(phase);
  const reduceMotionRef = useRef(false);
  const spawnRngsRef = useRef<SpawnRngs>(makeSpawnRngs(""));
  // the hand tutorial plays on the first start each time the game is opened (not on "เล่นอีกรอบ")
  const tutorialPendingRef = useRef(true);
  const [tutorialBanner, setTutorialBanner] = useState<TutorialBanner | null>(null);
  const [inTutorial, setInTutorial] = useState(false);

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
    const radius = Math.min(SCOOP_RADIUS, world.width * FALLING_RADIUS_WIDTH_RATIO);
    const margin = radius + 8;
    // US-CF-15: bomb chance ramps from BOMB_CHANCE_BASE → BOMB_CHANCE_MAX with score
    const progress = getDifficultyProgress(world.stack.length, DIFFICULTY_SCORE_CAP);
    const bombChance = BOMB_CHANCE_BASE + (BOMB_CHANCE_MAX - BOMB_CHANCE_BASE) * progress;
    const rolls = drawSpawnRolls(spawnerIndex === 1 ? spawnRngsRef.current.spawner1 : spawnRngsRef.current.spawner2);
    let kind: FallingKind = rolls.kind < bombChance ? "bomb" : "scoop";

    // Ensure there is never more than 1 bomb falling at the same time
    if (kind === "bomb" && world.falling.some((item) => item.kind === "bomb")) {
      kind = "scoop";
    }

    if (kind === "scoop" && rolls.double < DOUBLE_SCOOP_CHANCE) {
      kind = "double";
    }

    // US-CF-15 & US-CF-18: Spawner 1 ramps to 1.8×, Spawner 2 ramps to 1.4× (always slower)
    const baseVy = Math.max(145, world.height * 0.245);
    const maxMult = spawnerIndex === 1 ? FALL_SPEED_MAX_MULTIPLIER : FALL_SPEED_2ND_MAX_MULTIPLIER;
    const vy = baseVy * (1 + (maxMult - 1) * progress);

    // x as a fraction of the play width, so phones of different widths get the same relative spot
    const xAt = (roll: number) => margin + roll * Math.max(1, world.width - margin * 2);
    let x = xAt(rolls.xs[0]);
    for (let attempt = 1; attempt < X_ATTEMPTS; attempt += 1) {
      const isOverlapping = world.falling.some((item) => Math.abs(item.x - x) < radius * 2.8);
      if (!isOverlapping) break;
      x = xAt(rolls.xs[attempt]);
    }

    const flavorIndex1 = Math.floor(rolls.flavor1 * FLAVORS.length);
    const flavor1 = kind === "scoop" || kind === "double" ? FLAVORS[flavorIndex1] : undefined;
    // second flavour: any flavour except the first, picked with one roll (no retry loop)
    const flavor2 =
      kind === "double"
        ? FLAVORS[(flavorIndex1 + 1 + Math.floor(rolls.flavor2 * (FLAVORS.length - 1))) % FLAVORS.length]
        : undefined;

    world.falling.push({
      kind,
      flavor: flavor1,
      flavor2,
      x,
      y: -radius - 6,
      radius,
      vy,
      rotation: rolls.rotation * Math.PI * 2,
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
        world.spawnDelay2 = ((falling.kind === "bomb" ? 0.65 : 0.45) + spawnRngsRef.current.spawner2Delay() * 0.4) * delayMultiplier2;
      }
    },
    [removeTopScoops]
  );

  // Starts the timed round: seeded drops from here on (after the tutorial, or straight away on a replay)
  const beginRound = useCallback(() => {
    const world = worldRef.current;
    // same date = same drops, also on "เล่นอีกรอบ" (fixed at round start, even if played past midnight)
    const seed = todaySeed();
    spawnRngsRef.current = makeSpawnRngs(seed);
    world.roundStartedAt = world.elapsed;
    world.lastSecond = SESSION_TIME_SECONDS;
    world.spawnDelay1 = 0.45;
    setTimeLeft(SESSION_TIME_SECONDS);
    logRef.current("game_start", {
      game_id: "g13",
      renderer: "canvas",
      session_duration_seconds: SESSION_TIME_SECONDS,
      seed,
    });
  }, []);

  const endTutorial = useCallback(
    (skipped = false) => {
      const world = worldRef.current;
      if (!world.tutorial) return;
      world.tutorial = null;
      world.falling = [];
      // the practice scoop pops off the cone — the real round starts from zero
      removeTopScoops(world.stack.length);
      tutorialPendingRef.current = false;
      setInTutorial(false);
      setTutorialBanner(null);
      logRef.current("tutorial_done", { game_id: "g13", skipped });
      beginRound();
    },
    [beginRound, removeTopScoops]
  );

  // Moves the tutorial to its next step, with a short "เก่งมาก!" first
  const advanceTutorial = useCallback((completed: TutorialStep, next: TutorialStep) => {
    const tutorial = worldRef.current.tutorial;
    if (!tutorial) return;
    logRef.current("tutorial_step_done", { game_id: "g13", step: completed });
    tutorial.step = next;
    tutorial.wait = next === "ready" ? TUTORIAL_READY_S : TUTORIAL_PRAISE_S;
    setTutorialBanner({ text: next === "ready" ? TUTORIAL_TEXT.ready : TUTORIAL_TEXT.praise, tone: "praise" });
  }, []);

  // Scripted drops — fixed, not from the seed: the scoop falls on the far side from the cone,
  // the bomb falls straight onto the cone so the player has to move away
  const spawnTutorialObject = useCallback((step: "catch" | "dodge") => {
    const world = worldRef.current;
    const tutorial = world.tutorial;
    if (!tutorial) return;
    const radius = Math.min(SCOOP_RADIUS, world.width * FALLING_RADIUS_WIDTH_RATIO);
    const coneX = world.coneX * world.width;
    const halfCone = CONE_WIDTH / 2 + 4;
    const reachable = (x: number) => clampToRange(x, halfCone, Math.max(halfCone, world.width - halfCone));
    const onLeft = world.coneX < 0.5;
    const vy = Math.max(145, world.height * 0.245) * TUTORIAL_FALL_SPEED;

    if (step === "catch") {
      world.falling.push({
        kind: "scoop",
        flavor: FLAVORS[TUTORIAL_SCOOP_FLAVOR],
        x: reachable(world.width * (onLeft ? 0.75 : 0.25)),
        y: -radius - 6,
        radius,
        vy,
        rotation: 0,
        spawnerIndex: 1,
        scripted: true,
      });
    } else {
      // a bomb hit knocked the practice scoop off — put a fresh one on so the next try looks the same
      if (world.stack.length === 0) {
        world.stack.push(FLAVORS[TUTORIAL_SCOOP_FLAVOR]);
        setHeight(world.stack.length);
      }
      tutorial.dodgeX = reachable(world.width * (onLeft ? 0.8 : 0.2));
      world.falling.push({
        kind: "bomb",
        x: clampToRange(coneX, radius + 8, Math.max(radius + 8, world.width - radius - 8)),
        y: -radius - 6,
        radius,
        vy,
        rotation: 0,
        spawnerIndex: 1,
        scripted: true,
      });
    }
    tutorial.handClock = 0;
    setTutorialBanner({ text: step === "catch" ? TUTORIAL_TEXT.catch : TUTORIAL_TEXT.dodge, tone: "info" });
  }, []);

  const resolveTutorialObject = useCallback(
    (falling: FallingObject, caught: boolean) => {
      const world = worldRef.current;
      const tutorial = world.tutorial;
      world.falling = world.falling.filter((item) => item !== falling);
      if (!tutorial) return;

      if (falling.kind === "bomb") {
        logRef.current(caught ? "tutorial_bomb_hit" : "tutorial_bomb_dodge", { game_id: "g13" });
        if (!caught) {
          advanceTutorial("dodge", "ready");
          return;
        }
        // same as the real game, so the player sees what a bomb does
        removeTopScoops(2);
        world.flash = 0.42;
        world.flashColor = "rgba(249,115,22,";
        tutorial.wait = TUTORIAL_RETRY_S;
        setTutorialBanner({ text: TUTORIAL_TEXT.dodgeRetry, tone: "retry" });
        return;
      }

      logRef.current(caught ? "tutorial_scoop_catch" : "tutorial_scoop_miss", { game_id: "g13" });
      if (caught) {
        world.stack.push(falling.flavor ?? FLAVORS[0]);
        setHeight(world.stack.length);
        advanceTutorial("catch", "dodge");
        return;
      }
      tutorial.wait = TUTORIAL_RETRY_S;
      setTutorialBanner({ text: TUTORIAL_TEXT.catchRetry, tone: "retry" });
    },
    [advanceTutorial, removeTopScoops]
  );

  const updateTutorial = useCallback(
    (delta: number) => {
      const world = worldRef.current;
      const tutorial = world.tutorial;
      if (!tutorial) return;
      tutorial.handClock += delta;

      if (tutorial.step === "move") {
        // where the cone is within the range it can move (0 = as far left as it goes, 1 = as far right)
        const halfCone = CONE_WIDTH / 2 + 4;
        const range = world.width - halfCone * 2;
        const along = range > 0 ? (world.coneX * world.width - halfCone) / range : 0.5;
        const wasLeft = tutorial.reachedLeft;
        const wasRight = tutorial.reachedRight;
        if (along <= TUTORIAL_SIDE_ZONE) tutorial.reachedLeft = true;
        if (along >= 1 - TUTORIAL_SIDE_ZONE) tutorial.reachedRight = true;
        if (tutorial.reachedLeft && tutorial.reachedRight) {
          advanceTutorial("move", "catch");
        } else if (tutorial.reachedLeft !== wasLeft || tutorial.reachedRight !== wasRight) {
          logRef.current("tutorial_side_reached", { game_id: "g13", side: tutorial.reachedLeft ? "left" : "right" });
          setTutorialBanner({ text: tutorial.reachedLeft ? TUTORIAL_TEXT.moveRight : TUTORIAL_TEXT.moveLeft, tone: "info" });
        }
        return;
      }
      if (tutorial.step === "ready") {
        tutorial.wait -= delta;
        if (tutorial.wait <= 0) endTutorial();
        return;
      }
      if (world.falling.length > 0) return;
      tutorial.wait -= delta;
      if (tutorial.wait <= 0) spawnTutorialObject(tutorial.step);
    },
    [advanceTutorial, endTutorial, spawnTutorialObject]
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

  // 👆 hand of the tutorial, like G19's guide: the fingertip presses the cone (amber ring), slides,
  // then lifts. Drawn on the canvas so it follows the cone without syncing positions to the DOM.
  // (its guide arrow is drawn separately, behind the cone)
  const drawTutorialHand = useCallback((context: CanvasRenderingContext2D, { x, y, pressed, opacity }: HandPose) => {
    context.save();
    context.globalAlpha = opacity;
    if (pressed) {
      context.beginPath();
      context.arc(x, y, 22, 0, Math.PI * 2);
      context.fillStyle = "rgba(253,230,138,0.55)";
      context.fill();
      context.lineWidth = 4;
      context.strokeStyle = "#F59E0B";
      context.stroke();
    }
    // released = lifted up and a bit bigger; pressed = down on the cone and a bit smaller
    const size = pressed ? 54 : 60;
    const lift = pressed ? 0 : 12;
    context.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.shadowColor = "rgba(0,0,0,0.35)";
    context.shadowBlur = 6;
    context.shadowOffsetY = 3;
    context.fillText("👆", x - size * 0.38, y + lift - size * 0.04); // fingertip sits on (x, y)
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

      const handPose = getTutorialHandPose(world, geometry.x, geometry.coneTop);
      if (handPose) {
        guideBufferRef.current ??= document.createElement("canvas");
        drawGuideArrow(context, guideBufferRef.current, world, handPose);
      }
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
      if (handPose) drawTutorialHand(context, handPose);
      context.restore();

      if (world.flash > 0) {
        const colorPrefix = world.flashColor ?? "rgba(249,115,22,";
        context.fillStyle = `${colorPrefix}${Math.min(world.flash, 0.28)})`;
        context.fillRect(0, 0, world.width, world.height);
      }
    },
    [drawBomb, drawCone, drawDoubleScoop, drawScoop, drawTutorialHand]
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

      // Target the top of the tower to be MAX_VISIBLE_STACK_PX from the bottom of the screen
      const targetScreenY = world.height - MAX_VISIBLE_STACK_PX;
      const cameraTarget = getTowerCameraTarget(world.height, naturalTopY, targetScreenY / world.height);
      const cameraEase = 1 - Math.exp(-5.5 * delta);
      world.cameraOffset += (cameraTarget - world.cameraOffset) * cameraEase;
      if (Math.abs(cameraTarget - world.cameraOffset) < 0.05) {
        world.cameraOffset = cameraTarget;
      }

      // the clock only runs in the round, not during the tutorial
      if (!world.tutorial) {
        const roundElapsed = world.elapsed - world.roundStartedAt;
        const secondsRemaining = Math.max(0, Math.ceil(SESSION_TIME_SECONDS - roundElapsed));
        if (secondsRemaining !== world.lastSecond) {
          world.lastSecond = secondsRemaining;
          setTimeLeft(secondsRemaining);
        }
        if (roundElapsed >= SESSION_TIME_SECONDS) {
          finishGame();
          return;
        }
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

      if (world.tutorial) {
        updateTutorial(delta);
      } else {
        const hasSpawner1 = world.falling.some((item) => item.spawnerIndex === 1);
        if (!hasSpawner1) {
          world.spawnDelay1 -= delta;
          if (world.spawnDelay1 <= 0) spawnObject(1);
        }

        if (world.stack.length >= 10 && !world.secondSpawnerActive) {
          world.secondSpawnerActive = true;
          world.spawnDelay2 = 0.3 + spawnRngsRef.current.spawner2Delay() * 0.5;
        }

        if (world.secondSpawnerActive) {
          const hasSpawner2 = world.falling.some((item) => item.spawnerIndex === 2);
          if (!hasSpawner2) {
            world.spawnDelay2 -= delta;
            if (world.spawnDelay2 <= 0) spawnObject(2);
          }
        }
      }

      [...world.falling].forEach((falling) => {
        falling.y += falling.vy * delta;
        falling.rotation += (falling.kind === "bomb" ? 2.2 : 0.65) * delta;

        const geometry = getTowerGeometry(world, reduceMotionRef.current);
        const catchWidth = falling.kind === "bomb" ? BOMB_HIT_REACH : SCOOP_CATCH_REACH;
        // Only the upper half of the top scoop catches (or the cone's rim when it's empty):
        // a drop that has already fallen past it, beside the tower, can't be scooped up from the
        // side by sliding the cone under it
        const hasStack = world.stack.length > 0;
        const caught = isCaughtAtTarget({
          objectX: falling.x,
          objectBottomY: falling.y + falling.radius,
          targetX: geometry.x + geometry.wobble,
          targetY: hasStack ? geometry.topCenterY - SCOOP_RADIUS : geometry.coneTop,
          catchWidth,
          verticalTolerance: hasStack ? 0 : 2,
          catchDepth: hasStack ? SCOOP_RADIUS : EMPTY_CONE_CATCH_DEPTH,
        });

        const resolve = falling.scripted ? resolveTutorialObject : resolveFallingObject;
        if (caught) {
          resolve(falling, true);
        } else if (falling.y - falling.radius > world.height) {
          resolve(falling, false);
        }
      });
    },
    [finishGame, resolveFallingObject, resolveTutorialObject, spawnObject, updateTutorial]
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
    if (tutorialPendingRef.current) {
      worldRef.current.tutorial = createTutorial();
      setInTutorial(true);
      setTutorialBanner({ text: TUTORIAL_TEXT.move, tone: "info" });
      logRef.current("tutorial_start", { game_id: "g13" });
    } else {
      beginRound();
    }
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
      {phase === "intro" && (
        <GameIntro
          title="ต่อไอติมฝึกสมอง"
          objective="เกมฝึกสมองแสนสนุก! ลากกรวยไอติมเพื่อรับลูกไอติมให้ได้สูงที่สุดและหลบลูกระเบิดภายในเวลาที่กำหนด!"
          onStart={startGame}
          containerClassName="bg-gradient-to-b from-sky-100 to-orange-100"
          imageSrc="/assets/icons/g13-ice-cream.jpg"
        />
      )}

      {phase === "playing" && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <GameHudBar
            left={
              inTutorial ? (
                <GameHudItem icon={GraduationCap} tone="tutorial">
                  ฝึกเล่น
                </GameHudItem>
              ) : (
                <GameHudItem icon={Clock3}>{formatTime(timeLeft)}</GameHudItem>
              )
            }
            right={
              <GameHudItem icon={Trophy} tone="score">
                สูง {height} ชั้น
              </GameHudItem>
            }
          >
            {process.env.NODE_ENV === "development" && inTutorial && (
              <button
                type="button"
                onClick={() => endTutorial(true)}
                className={HUD_DEV_BUTTON_CLASS}
                aria-label="ข้ามการฝึกเล่นสำหรับทดสอบเกม"
                data-dev-only="g13-skip-tutorial"
              >
                ข้ามฝึก
              </button>
            )}
            {process.env.NODE_ENV === "development" && !inTutorial && (
              <button
                type="button"
                onClick={() => {
                  logRef.current("g13_dev_skip_timer", {
                    game_id: "g13",
                    tower_height: worldRef.current.stack.length,
                  });
                  finishGame();
                }}
                className={HUD_DEV_BUTTON_CLASS}
                aria-label="ข้ามเวลาที่เหลือสำหรับทดสอบเกม"
                data-dev-only="g13-skip-timer"
              >
                ข้ามเวลา
              </button>
            )}
          </GameHudBar>
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
            {/* Tutorial instruction — the 👆 hand itself is drawn on the canvas */}
            <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
              {tutorialBanner && (
                <p
                  className={`max-w-sm rounded-2xl border-2 bg-white/95 px-4 py-2 text-center text-[clamp(18px,5vw,22px)] font-bold leading-snug shadow-md ${
                    tutorialBanner.tone === "praise"
                      ? "border-emerald-500 text-emerald-800"
                      : tutorialBanner.tone === "retry"
                        ? "border-slate-300 text-slate-700"
                        : "border-amber-400 text-amber-950"
                  }`}
                >
                  {tutorialBanner.tone === "praise" && <span aria-hidden="true">✓ </span>}
                  {tutorialBanner.text}
                </p>
              )}
            </div>
            {/* Fixed input hit area — ไม่ขยับตามกรวย/camera จึงลากต่อได้แม้กรวยพ้นขอบล่าง */}
            <div
              role="group"
              aria-label="พื้นที่ลากควบคุมกรวยไอติม"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-x-0 bottom-0 z-10 h-[34%] min-h-24 touch-none cursor-grab active:cursor-grabbing bg-gradient-to-t from-white/20 to-transparent"
            />
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
              {learningMode === "manual" ? "ต่อไป" : "เสร็จสิ้นบทเรียน"} <ArrowRight size={24} aria-hidden="true" />
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
