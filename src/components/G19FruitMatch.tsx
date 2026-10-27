"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import GameStageHeader, { HUD_DEV_BUTTON_CLASS } from "./GameStageHeader";
import { Trophy } from "lucide-react";
import { notoLoopedThai } from "@/lib/fonts";
import { SHOW_RESULT_BEST_SCORE } from "@/lib/gameScore";
import Button3D from "@/components/Button3D";
import GameIntro from "@/components/GameIntro";
import { seededStream, todaySeed, type Rng } from "@/lib/seededRandom";
import { useStageScale } from "@/lib/useStageScale";

/**
 * G19 — เรียงผลไม้ (match-3)
 *
 * Ported from the team's "candy crush4.HTML" mock: a 5×5 board of fruit; swipe a fruit
 * onto a neighbour to swap them, and 3+ of the same fruit in a row/column pop, the rest
 * fall down and new fruit drops in from the top (cascades score again).
 * A pure fun game — no lesson content.
 * Differences from the HTML mock, to follow AGENT.md (elderly-first):
 * - the 60-second timer is replaced by a move budget (MOVES_PER_RUN); a swap that makes
 *   no match is swapped back and doesn't use a move
 * - the "จบเกม" overlay is replaced by a positive score screen with play again / finish;
 *   the mock's start overlay is replaced by the shared GameIntro
 * - besides swiping, tapping two neighbouring fruits swaps them (easier than a drag)
 * - a guide (blinking outlines + a 👆 hand pressing the right fruit and sliding onto its
 *   neighbour, on a loop) shown at the start and after a few idle seconds
 * - first-run tutorial, from the "candy crush10" mock: the screen dims except for holes around the
 *   pair to swap and the fruit they line up with, a dashed trail follows the hand, and a 💡 tooltip
 *   sits above the board (move in the top half) or below it (bottom half)
 * - when no swap can make a match any more (the mock just got stuck) the board is reshuffled
 *   from today's seed ("ไม่มีคู่ให้สลับ / สับผลไม้ใหม่ให้นะ", no move used); ending the run there
 *   instead is kept behind RULES.onNoMoves
 * - play screen follows the Figma design (Scammer Game Prototype, node 3028:13037): green
 *   gradient, shared header card (moves left / score), 5×5 tinted fruit tiles with SVG fruit
 * - the board is seeded by today's date (Bangkok time), so every player gets the same level
 *   that day: same starting board, same refill fruit per column, same reshuffles
 * - special pieces from the "candy crush10" mock: 4 in a row → 🥤 (clears its row + column), 5+ → 🌟
 *   (clears the colour it's swapped onto), combos 🌟+🌟 / 🌟+🥤, 20 points per piece blasted. Unlike the mock,
 *   a 🌟 swapped onto a fruit clears that colour only (the mock also cleared a second, random colour)
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Props = {
  /** score = best run since the game was opened — goes on the (device-only for now) leaderboard */
  onFinish: (stars: number, score?: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "intro" | "play" | "result";
type Cell = { r: number; c: number };
// grow = a special that just appeared (swells for SPECIAL_GROW_MS)
type Tile = { id: number; type: number; r: number; c: number; popping?: boolean; grow?: boolean };
type Grid = (Tile | null)[][];
type TypeGrid = (number | null)[][];
type FinishPopup = "enter" | "show" | "leave" | null;

// tile colours from the Figma design: light fill + darker border and 2px bottom edge
const FRUITS = [
  { icon: "/assets/g19/apple.svg", name: "แอปเปิล", bg: "#FEE2E2", edge: "#F87171" },
  { icon: "/assets/g19/watermelon.svg", name: "แตงโม", bg: "#DCFCE7", edge: "#4ADE80" },
  { icon: "/assets/g19/grape.svg", name: "องุ่น", bg: "#F3E8FF", edge: "#C084FC" },
  { icon: "/assets/g19/banana.svg", name: "กล้วย", bg: "#FEF9C3", edge: "#FACC15" },
  { icon: "/assets/g19/orange.svg", name: "ส้ม", bg: "#FFEDD5", edge: "#FB923C" },
];

// Special pieces (candy crush10 mock), made by matching 4 / 5+ — type numbers after the fruit:
// 🥤 น้ำปั่น (4 in a row) clears its row and column · 🌟 มะเฟือง (5+ in a row/L/T) clears one fruit colour.
// They never count in a normal match; swapping one with any neighbour always works and uses a move.
const SMOOTHIE = FRUITS.length;
const STAR = FRUITS.length + 1;
const SPECIALS = {
  [SMOOTHIE]: { emoji: "🥤", name: "น้ำปั่น", bg: "#E0F2FE", edge: "#38BDF8" },
  [STAR]: { emoji: "🌟", name: "มะเฟือง", bg: "#FEF08A", edge: "#FBBF24" },
} as Record<number, { emoji: string; name: string; bg: string; edge: string }>;
const isSpecial = (t: number | null | undefined): t is number => t != null && t >= FRUITS.length;
const isFruit = (t: number | null | undefined): t is number => t != null && t < FRUITS.length;
const POINTS_PER_BLAST = 20; // per piece cleared by a special (mock: 20, a normal match is 10)
const SPECIAL_GROW_MS = 250; // a new special swells a little when it appears
const COMBO_PAUSE_MS = 600; // 🌟 + 🥤: the chosen colour turns into 🥤 first, then everything goes off
const EMOJI_FONT = `"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;

const SIZE = 5; // rows = cols, same as the mock
// Board geometry from the Figma design (352px wide): 64px tiles, 8px between columns, 12px between rows.
// Everything below is in % of the board, so it scales with the board on any phone.
const TILE_PX = 64;
const GAP_X_PX = 8;
const GAP_Y_PX = 12;
const BOARD_W_PX = SIZE * TILE_PX + (SIZE - 1) * GAP_X_PX; // 352
const BOARD_H_PX = SIZE * TILE_PX + (SIZE - 1) * GAP_Y_PX; // 368
// Narrowest board: tiles stay ≥ 48px to tap (AGENT.md) — shorter screens than that scroll instead
const BOARD_MIN_W_PX = Math.ceil((48 / TILE_PX) * BOARD_W_PX); // 264
const TILE_W_PCT = (TILE_PX / BOARD_W_PX) * 100;
const TILE_H_PCT = (TILE_PX / BOARD_H_PX) * 100;
const STEP_X_PCT = ((TILE_PX + GAP_X_PX) / BOARD_W_PX) * 100;
const STEP_Y_PCT = ((TILE_PX + GAP_Y_PX) / BOARD_H_PX) * 100;
const tileBox = (c: Cell) => ({
  left: `${c.c * STEP_X_PCT}%`,
  top: `${c.r * STEP_Y_PCT}%`,
  width: `${TILE_W_PCT}%`,
  height: `${TILE_H_PCT}%`,
});
const MOVES_PER_RUN = 20;
const POINTS_PER_FRUIT = 10;
const SWIPE_MIN_PX = 20; // shorter than this = a tap
const SWAP_MS = 300; // swap / swap-back slide (same as the mock)
const POP_MS = 450; // matched fruit shrinks away (mock: 200 ms — too quick to follow)
const FALL_MS = 600; // fruit falling into the gaps (mock: 300 ms — too quick to follow)
const SPAWN_DELAY_MS = 50; // let new fruit paint above the board before it falls
const HINT_IDLE_MS = 7000;
const HINT_START_MS = 500; // the guide also shows right when gameplay starts, once the board has drawn
const HINT_HAND_MS = 2400; // one loop of the hint hand: press, drag onto the neighbour, release, fade
const SHUFFLE_PAUSE_MS = 2000; // "สับผลไม้ใหม่ให้นะ" over the stuck board, long enough to read
// First-run tutorial spotlight (candy crush10 mock): dim level, hole padding/radius around each tile,
// tooltip gap from the board, and the tooltip text
const TUTORIAL_DIM = "rgba(0, 0, 0, 0.75)"; // mock 0.8; 0.75 like G18's tutorial
const TUTORIAL_HOLE_PAD_PX = 3;
const TUTORIAL_HOLE_RADIUS_PX = 14;
const TUTORIAL_TIP_GAP_PX = 14;
const TUTORIAL_TIP = ["💡 ลากผลไม้มาเรียง", "ให้ได้ 3 ช่องติดกัน!"];
// "you finished" text over the board after the last move: fade/zoom in, hold, fade out
const FINISH_IN_MS = 500;
const FINISH_HOLD_MS = 1800;
const FINISH_OUT_MS = 450;

// What happens when, after a match, no swap on the board can make a match any more:
// "reshuffle" = deal a new board from the shuffle stream and keep playing (current design);
// "end" = the run ends there (earlier design — kept so it can be switched back on). A typed
// object, so TS doesn't narrow the value and flag the unused branch.
const RULES: { onNoMoves: "end" | "reshuffle" } = { onNoMoves: "reshuffle" };

type EndReason = "moves_used" | "no_moves";

// tips are kept short enough to fit one line at 20px on a 360px-wide phone
const TIP = "💡 ลากหรือแตะ 2 ช่องที่ติดกันเพื่อสลับ";
// tip line under the board — off to match the Figma design (the hint hand still teaches the swipe)
const SHOW_TIP = false;

function starsFor(score: number) {
  if (score >= 900) return 3;
  if (score >= 500) return 2;
  return 1;
}

// Separate streams so one part of the game can't shift another's numbers: the start board,
// the reshuffles, and one refill stream per column (the n-th fruit dropped into a column is
// the same for every player, whatever order they cleared things in).
// special: which colour a 🌟 clears when a blast sets it off (or for 🌟 + 🥤) — seeded, so it's the
// same for every player that day
type Rngs = { board: Rng; shuffle: Rng; special: Rng; columns: Rng[] };
function makeRngs(seed: string): Rngs {
  const stream = (name: string) => seededStream("G19", seed, name);
  return {
    board: stream("board"),
    shuffle: stream("shuffle"),
    special: stream("special"),
    columns: Array.from({ length: SIZE }, (_, c) => stream(`column-${c}`)),
  };
}

const randomFruit = (rng: Rng) => Math.floor(rng() * FRUITS.length);

const cellKey = (c: Cell) => `${c.r},${c.c}`;

// Runs of 3+ of the same fruit (specials never match), with runs that share a cell merged into one
// group (an L or T), like the mock's getMatchGroups. A group of 4 makes a 🥤, 5+ makes a 🌟.
function findMatchGroups(types: TypeGrid): Cell[][] {
  const runs: Cell[][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE - 2; c++) {
      const t = types[r][c];
      if (!isFruit(t)) continue;
      let len = 1;
      while (c + len < SIZE && types[r][c + len] === t) len++;
      if (len >= 3) {
        runs.push(Array.from({ length: len }, (_, k) => ({ r, c: c + k })));
        c += len - 1;
      }
    }
  }
  for (let c = 0; c < SIZE; c++) {
    for (let r = 0; r < SIZE - 2; r++) {
      const t = types[r][c];
      if (!isFruit(t)) continue;
      let len = 1;
      while (r + len < SIZE && types[r + len][c] === t) len++;
      if (len >= 3) {
        runs.push(Array.from({ length: len }, (_, k) => ({ r: r + k, c })));
        r += len - 1;
      }
    }
  }
  const groups: Cell[][] = [];
  for (const run of runs) {
    const into = groups.find((g) => g.some((m) => run.some((x) => sameCell(m, x))));
    if (into) run.forEach((x) => !into.some((m) => sameCell(m, x)) && into.push(x));
    else groups.push([...run]);
  }
  return groups;
}

function findMatches(types: TypeGrid): Cell[] {
  return findMatchGroups(types).flat();
}

// Every cell a blast clears, starting from `start`: a 🥤 in it adds its row and column, a 🌟 adds
// every fruit of the colour `pickFruit` gives (pieces the blast reaches go off too). `spent` cells
// are cleared without going off — the 🌟 already used on the fruit it was swapped with.
function blastCells(types: TypeGrid, start: Cell[], pickFruit: () => number | null, spent: Cell[] = []): Cell[] {
  const seen = new Set<string>();
  const out: Cell[] = [];
  const queue = [...start];
  while (queue.length) {
    const cell = queue.shift()!;
    const key = cellKey(cell);
    if (seen.has(key)) continue;
    seen.add(key);
    const t = types[cell.r][cell.c];
    if (t === null) continue;
    out.push(cell);
    if (spent.some((s) => sameCell(s, cell))) continue;
    if (t === SMOOTHIE) {
      for (let k = 0; k < SIZE; k++) queue.push({ r: k, c: cell.c }, { r: cell.r, c: k });
    } else if (t === STAR) {
      const fruit = pickFruit();
      if (fruit !== null) cellsOf(types, fruit).forEach((m) => queue.push(m));
    }
  }
  return out;
}

const cellsOf = (types: TypeGrid, type: number): Cell[] =>
  types.flatMap((row, r) => row.flatMap((t, c) => (t === type ? [{ r, c }] : [])));

// What a swap with a special clears: which cells set off, and (for 🌟 + 🥤) the colour that turns into 🥤.
// a = where the first piece ended up, b = the second; both already swapped in `types`.
function specialSwapPlan(types: TypeGrid, a: Cell, b: Cell, pickFruit: () => number | null) {
  const ta = types[a.r][a.c];
  const tb = types[b.r][b.c];
  const all = types.flatMap((row, r) => row.map((_, c) => ({ r, c })));
  if ((ta === STAR && tb === SMOOTHIE) || (ta === SMOOTHIE && tb === STAR)) {
    const fruit = pickFruit();
    const turned = fruit === null ? [] : cellsOf(types, fruit);
    return { start: [...turned, a, b], turned, spent: [] as Cell[] };
  }
  if (ta === STAR && tb === STAR) return { start: all, turned: [], spent: all };
  if (ta === STAR || tb === STAR) {
    const [star, fruitCell] = ta === STAR ? [a, b] : [b, a];
    const fruit = types[fruitCell.r][fruitCell.c]!;
    // a 🌟 swapped onto a fruit clears that colour (only); a 🥤 swapped next to it isn't a fruit here
    return { start: [...cellsOf(types, fruit), star], turned: [], spent: [star] };
  }
  return { start: [a, b].filter((x) => isSpecial(types[x.r][x.c])), turned: [], spent: [] as Cell[] };
}

// How many pieces a swap would clear right away (0 = it wouldn't do anything). Swaps with a special are
// counted with its blast — 🌟's colour estimated as the most common fruit, since the real pick is random.
function swapClears(types: TypeGrid, a: Cell, b: Cell): number {
  const copy = types.map((row) => row.slice());
  [copy[a.r][a.c], copy[b.r][b.c]] = [copy[b.r][b.c], copy[a.r][a.c]];
  if (!isSpecial(copy[a.r][a.c]) && !isSpecial(copy[b.r][b.c])) return findMatches(copy).length;
  const counts = FRUITS.map((_, f) => cellsOf(copy, f).length);
  const common = counts.indexOf(Math.max(...counts));
  const plan = specialSwapPlan(copy, a, b, () => common);
  plan.turned.forEach((m) => (copy[m.r][m.c] = SMOOTHIE));
  return blastCells(copy, plan.start, () => common, plan.spent).length;
}

// The swap that clears the most fruit right away (a 5 over a 4 over a 3, an L/T or double
// match counts every fruit; a special's blast counts what it clears), or null when the board is stuck.
// Ties are picked at random so the hint doesn't always point at the same spot — Math.random is fine
// here: it only picks which hint to show, it never changes the board.
function findMove(types: TypeGrid): [Cell, Cell] | null {
  let moves: [Cell, Cell][] = [];
  let best = 0;
  const trySwap = (a: Cell, b: Cell) => {
    const cleared = swapClears(types, a, b);
    if (cleared === 0 || cleared < best) return;
    if (cleared > best) {
      best = cleared;
      moves = [];
    }
    moves.push([a, b]);
  };
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (c + 1 < SIZE) trySwap({ r, c }, { r, c: c + 1 });
      if (r + 1 < SIZE) trySwap({ r, c }, { r: r + 1, c });
    }
  }
  return moves.length ? moves[Math.floor(Math.random() * moves.length)] : null;
}

// Order a hint pair as [drag from, drag to] so the hand moves the fruit that lands in the match.
function orientMove(types: TypeGrid, [a, b]: [Cell, Cell]): [Cell, Cell] {
  // a special is what the player should drag (onto the fruit/special next to it)
  if (isSpecial(types[a.r][a.c])) return [a, b];
  if (isSpecial(types[b.r][b.c])) return [b, a];
  const copy = types.map((row) => row.slice());
  [copy[a.r][a.c], copy[b.r][b.c]] = [copy[b.r][b.c], copy[a.r][a.c]];
  return findMatches(copy).some((m) => sameCell(m, b)) ? [a, b] : [b, a];
}

// Tutorial spotlight cells: the hint pair plus every fruit that lines up with either of them once
// swapped (runs of 3+ through the two swapped cells). Those other fruit don't move, so their cells
// are the same before and after the swap.
function tutorialFocus(types: TypeGrid, [from, to]: [Cell, Cell]): Cell[] {
  const copy = types.map((row) => row.slice());
  [copy[from.r][from.c], copy[to.r][to.c]] = [copy[to.r][to.c], copy[from.r][from.c]];
  const focus: Cell[] = [from, to];
  const at = (r: number, c: number) => (r >= 0 && r < SIZE && c >= 0 && c < SIZE ? copy[r][c] : null);
  for (const cell of [from, to]) {
    const type = copy[cell.r][cell.c];
    if (!isFruit(type)) continue; // specials don't line up
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
    ]) {
      const run: Cell[] = [cell];
      for (const dir of [1, -1]) {
        for (let k = 1; at(cell.r + dr * k * dir, cell.c + dc * k * dir) === type; k++) {
          run.push({ r: cell.r + dr * k * dir, c: cell.c + dc * k * dir });
        }
      }
      if (run.length >= 3) run.forEach((m) => !focus.some((f) => sameCell(f, m)) && focus.push(m));
    }
  }
  return focus;
}

// Like the mock's initBoard (no ready-made matches), and also at least one possible swap.
function freshTypes(rng: Rng): number[][] {
  for (;;) {
    const types: number[][] = [];
    for (let r = 0; r < SIZE; r++) {
      types[r] = [];
      for (let c = 0; c < SIZE; c++) {
        let t: number;
        do {
          t = randomFruit(rng);
        } while (
          (c >= 2 && types[r][c - 1] === t && types[r][c - 2] === t) ||
          (r >= 2 && types[r - 1][c] === t && types[r - 2][c] === t)
        );
        types[r][c] = t;
      }
    }
    if (findMove(types)) return types;
  }
}

/**
 * Hint guide over the board: the 👆 hand presses the fruit to drag, slides onto the neighbour it
 * should swap with, releases, fades, and loops while the hint is up. Press = hand dips + amber ring
 * at the fingertip; release = hand lifts. Timings in globals.css (.g19-guide-*). It plays even with
 * the OS "reduce motion" setting: it's the instruction itself, and it's small and slow.
 */
function HintGuide({ from, to, tutorial }: { from: Cell; to: Cell; tutorial: boolean }) {
  const loop = { animationDuration: `${HINT_HAND_MS}ms` };
  return (
    // tutorial: above the dimmed spotlight layer (z-30), so the whole hand stays bright
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${tutorial ? "z-40" : "z-20"}`}
      style={{ containerType: "inline-size" }}
    >
      {tutorial && <HintTrail from={from} to={to} style={loop} />}
      <div
        className="g19-guide-hand absolute"
        style={
          {
            ...tileBox(from),
            // translate % is of the tile itself — one step = tile + gap
            "--dx": `${((to.c - from.c) * STEP_X_PCT * 100) / TILE_W_PCT}%`,
            "--dy": `${((to.r - from.r) * STEP_Y_PCT * 100) / TILE_H_PCT}%`,
            ...loop,
          } as React.CSSProperties
        }
      >
        {/* contact ring where the fingertip presses (lower part of the fruit, so the fruit stays visible) */}
        <span
          className="g19-guide-ring absolute left-1/2 top-[60%] block h-[40%] w-[40%] rounded-full border-[0.9cqw] border-solid border-[#F59E0B] bg-[#FDE68A]/50"
          style={loop}
        />
        {/* fingertip of 👆 sits at the ring's centre */}
        <span
          className="g19-guide-finger absolute left-1/2 top-[56%] block leading-none"
          style={{ fontSize: "13cqw", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))", ...loop }}
        >
          👆
        </span>
      </div>
    </div>
  );
}

/**
 * Tutorial only (candy crush10 mock): dashed line from the centre of the fruit to drag to the centre
 * of its neighbour, drawn out behind the hand as it slides (clip-path in sync with .g19-guide-hand).
 */
function HintTrail({ from, to, style }: { from: Cell; to: Cell; style: React.CSSProperties }) {
  const centreX = (c: number) => c * STEP_X_PCT + TILE_W_PCT / 2;
  const centreY = (r: number) => r * STEP_Y_PCT + TILE_H_PCT / 2;
  const dash = "#0EA5E9 0 1.8cqw, transparent 1.8cqw 3.6cqw";
  const box: Record<string, string> =
    from.r === to.r
      ? {
          left: `${centreX(Math.min(from.c, to.c))}%`,
          top: `${centreY(from.r)}%`,
          width: `${STEP_X_PCT}%`,
          height: "1.4cqw",
          transform: "translateY(-50%)",
          backgroundImage: `repeating-linear-gradient(90deg, ${dash})`,
          "--trail-hidden": to.c > from.c ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
        }
      : {
          left: `${centreX(from.c)}%`,
          top: `${centreY(Math.min(from.r, to.r))}%`,
          width: "1.4cqw",
          height: `${STEP_Y_PCT}%`,
          transform: "translateX(-50%)",
          backgroundImage: `repeating-linear-gradient(180deg, ${dash})`,
          "--trail-hidden": to.r > from.r ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)",
        };
  return <div className="g19-guide-trail absolute rounded-full" style={{ ...box, ...style } as React.CSSProperties} />;
}

// Header score: points just earned show as "+ 30" next to the score, then count over into it
const SCORE_HOLD_MS = 400; // "+ 30" sits still first so it can be read
const SCORE_COUNT_MS = 700; // score runs up while "+ 30" runs down
const SCORE_DROP_AT = 0.7; // share of the count after which "+ 30" drops down and fades
const SCORE_DROP_MS = 350;

type GainPhase = "enter" | "show" | "drop";

function ScoreTicker({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const [gain, setGain] = useState<{ amount: number; phase: GainPhase } | null>(null);
  // OS "reduce motion" (e.g. Windows "Animation effects" off): still show "+ 30" and count it
  // over — it's feedback, not movement — but it only fades, no pop-in / drop-down
  const [still] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const shownRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    stop();
    // new run (score back to 0): just show the number
    if (value <= shownRef.current) {
      shownRef.current = value;
      setShown(value);
      setGain(null);
      return;
    }
    const from = shownRef.current;
    // a cascade adding more mid-count: "+ N" grows and comes back up instead of popping in again
    setGain((g) => ({ amount: value - from, phase: g ? "show" : "enter" }));
    // two frames so the small "enter" state is painted before it grows in
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setGain((g) => (g ? { ...g, phase: "show" } : g));
      });
    });

    timersRef.current.push(
      window.setTimeout(() => {
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / SCORE_COUNT_MS);
          const eased = 1 - (1 - p) * (1 - p);
          const cur = Math.round(from + (value - from) * eased);
          shownRef.current = cur;
          setShown(cur);
          // keep the last non-zero amount on screen while it fades, never "+ 0"
          setGain((g) => ({
            amount: value - cur > 0 ? value - cur : (g?.amount ?? 0),
            phase: p >= SCORE_DROP_AT ? "drop" : "show",
          }));
          if (p < 1) {
            rafRef.current = requestAnimationFrame(step);
          } else {
            rafRef.current = null;
            timersRef.current.push(window.setTimeout(() => setGain(null), SCORE_DROP_MS));
          }
        };
        rafRef.current = requestAnimationFrame(step);
      }, SCORE_HOLD_MS)
    );
  }, [value, stop]);

  // the score sits at the right of the header card, so "+ 30" shows on its left
  return (
    <span className="relative">
      {shown}
      {gain && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full top-1/2 mr-2 whitespace-nowrap gp-text-24 text-[#15803D]"
          style={{
            opacity: gain.phase === "show" ? 1 : 0,
            transform: `translateY(-50%) ${
              still ? "" : gain.phase === "enter" ? "scale(0.6)" : gain.phase === "drop" ? "translateY(0.9em)" : ""
            }`,
            transition:
              gain.phase === "drop"
                ? `opacity ${SCORE_DROP_MS}ms ease-in, transform ${SCORE_DROP_MS}ms ease-in`
                : "opacity 200ms ease-out, transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          + {gain.amount}
        </span>
      )}
    </span>
  );
}

const isAdjacent = (a: Cell, b: Cell) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
const sameCell = (a: Cell | null, b: Cell) => !!a && a.r === b.r && a.c === b.c;

export default function G19FruitMatch({ onFinish, logEvent }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [slideMs, setSlideMs] = useState(SWAP_MS); // top/left transition: swap vs fall
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(MOVES_PER_RUN);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [pressedId, setPressedId] = useState<number | null>(null);
  // neighbour the current drag would swap with (highlighted while dragging, match or not)
  const [dragTarget, setDragTarget] = useState<Cell | null>(null);
  const [hint, setHint] = useState<[Cell, Cell] | null>(null);
  // tutorial hint only: cells left bright in the dimmed screen (null = no spotlight)
  const [spotlight, setSpotlight] = useState<Cell[] | null>(null);
  // board box + tooltip height in px, relative to the play screen — where the spotlight holes go
  const [stage, setStage] = useState<{ x: number; y: number; w: number; h: number; rootH: number; tipH: number } | null>(
    null
  );
  const [finishPopup, setFinishPopup] = useState<FinishPopup>(null);
  const [shuffleNotice, setShuffleNotice] = useState(false); // "สับผลไม้ใหม่ให้นะ" over the board
  const [endReason, setEndReason] = useState<EndReason>("moves_used");
  const [bestScore, setBestScore] = useState(0); // best run since the game was opened
  const [runs, setRuns] = useState(0);

  // Refs drive the game logic; state above is only what's drawn.
  const gridRef = useRef<Grid>([]);
  const poppingRef = useRef<Tile[]>([]);
  const nextIdRef = useRef(0);
  const rngsRef = useRef<Rngs>(makeRngs(""));
  const busyRef = useRef(false); // swap/cascade animating — ignore input
  const playingRef = useRef(false);
  const genRef = useRef(0); // bumped on new run/unmount so stale async steps stop
  const scoreRef = useRef(0);
  const movesRef = useRef(MOVES_PER_RUN);
  const bestRef = useRef(0);
  const runRef = useRef(0);
  const selectedRef = useRef<Cell | null>(null);
  const dragRef = useRef<{ x: number; y: number; cell: Cell } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const boardAreaRef = useRef<HTMLDivElement>(null);
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const [boardW, setBoardW] = useState(BOARD_W_PX);
  const { ref: stageRootRef } = useStageScale({ gameId: "G19", logEvent });
  const setPlayRoot = useCallback(
    (el: HTMLDivElement | null) => {
      rootRef.current = el;
      stageRootRef(el);
    },
    [stageRootRef]
  );
  const timersRef = useRef<number[]>([]);
  const hintTimerRef = useRef<number | null>(null);
  // first run since the game was opened: the start guide is a tutorial — it stays up (taps, wrong
  // swaps and idle time don't remove it) until the player makes their first match
  const tutorialRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = null;
  };

  useEffect(
    () => () => {
      genRef.current += 1;
      clearTimers();
    },
    []
  );

  // Board size from the room actually left under the header (as G18): as large as fits up to the
  // Figma 352px, never below BOARD_MIN_W_PX. The board itself isn't observed (its size is the output).
  useLayoutEffect(() => {
    if (phase !== "play") return;
    const scroller = scrollerRef.current;
    const area = boardAreaRef.current;
    const wrap = boardWrapRef.current;
    if (!scroller || !area || !wrap) return;
    const others = Array.from(area.children).filter((el) => el !== wrap);
    const measure = () => {
      const st = getComputedStyle(area);
      const num = (v: string) => parseFloat(v) || 0;
      const allowedW = area.clientWidth - num(st.paddingLeft) - num(st.paddingRight);
      let used = num(st.paddingTop) + num(st.paddingBottom);
      for (const el of others) used += el.getBoundingClientRect().height + num(st.rowGap);
      const fromH = ((scroller.clientHeight - used) * BOARD_W_PX) / BOARD_H_PX;
      const w = Math.floor(Math.min(allowedW, Math.max(BOARD_MIN_W_PX, Math.min(BOARD_W_PX, fromH))));
      if (w > 0) setBoardW(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    ro.observe(area);
    for (const el of others) ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  // Measure the board (and tooltip) while the tutorial spotlight is up: the ResizeObserver fires on
  // observe (before paint), then again on resize; scrolling a short screen moves the board too.
  const showSpotlight = phase === "play" && !!hint && !!spotlight;
  useLayoutEffect(() => {
    const root = rootRef.current;
    const board = boardRef.current;
    if (!showSpotlight || !root || !board) return;
    const measure = () => {
      const s = root.getBoundingClientRect();
      const b = board.getBoundingClientRect();
      setStage({
        x: b.left - s.left,
        y: b.top - s.top,
        w: b.width,
        h: b.height,
        rootH: s.height,
        tipH: tipRef.current?.offsetHeight ?? 0,
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(board);
    if (tipRef.current) ro.observe(tipRef.current);
    root.addEventListener("scroll", measure, true);
    return () => {
      ro.disconnect();
      root.removeEventListener("scroll", measure, true);
    };
  }, [showSpotlight]);

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      timersRef.current.push(window.setTimeout(resolve, ms));
    });

  const typesOf = (grid: Grid): TypeGrid => grid.map((row) => row.map((t) => (t ? t.type : null)));

  // Copy tiles so React re-renders with the mutated positions. Sorted by id so tile nodes
  // never change order in the DOM — moving a node cancels its CSS transition (pop/fall would jump).
  const sync = (slide = SWAP_MS) => {
    const live = gridRef.current.flat().filter((t): t is Tile => t !== null);
    setSlideMs(slide);
    setTiles([...live, ...poppingRef.current].sort((a, b) => a.id - b.id).map((t) => ({ ...t })));
  };

  const select = (cell: Cell | null) => {
    selectedRef.current = cell;
    setSelected(cell);
  };

  const clearHint = (force = false) => {
    if (tutorialRef.current && !force) return;
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = null;
    setHint(null);
    setSpotlight(null);
  };

  // atStart: the guide shown as gameplay begins (also lets it through while the tutorial is up)
  const armHint = (wait = HINT_IDLE_MS, atStart = false) => {
    if (tutorialRef.current && !atStart) return; // the tutorial hand is already up and stays
    clearHint();
    const gen = genRef.current;
    hintTimerRef.current = window.setTimeout(() => {
      if (gen !== genRef.current || busyRef.current || !playingRef.current) return;
      const types = typesOf(gridRef.current);
      const move = findMove(types);
      if (!move) return;
      const oriented = orientMove(types, move);
      setHint(oriented);
      setSpotlight(tutorialRef.current ? tutorialFocus(types, oriented) : null);
      logEvent("hint_shown", {
        game_id: "G19",
        run: runRef.current,
        moves_left: movesRef.current,
        at_start: atStart,
        tutorial: tutorialRef.current,
      });
    }, wait);
  };

  const buildGrid = (types: number[][]): Grid =>
    types.map((row, r) => row.map((type, c) => ({ id: nextIdRef.current++, type, r, c })));

  // Mock's applyGravity: fruit falls into gaps, new fruit drops in from above the board.
  const applyGravity = async (gen: number) => {
    const grid = gridRef.current;
    const spawned: { tile: Tile; r: number }[] = [];
    for (let c = 0; c < SIZE; c++) {
      let empty = 0;
      for (let r = SIZE - 1; r >= 0; r--) {
        const tile = grid[r][c];
        if (!tile) {
          empty++;
        } else if (empty > 0) {
          grid[r + empty][c] = tile;
          grid[r][c] = null;
          tile.r = r + empty;
        }
      }
      for (let i = 0; i < empty; i++) {
        const tile: Tile = { id: nextIdRef.current++, type: randomFruit(rngsRef.current.columns[c]), r: i - empty, c };
        grid[i][c] = tile;
        spawned.push({ tile, r: i });
      }
    }
    sync(FALL_MS);
    await delay(SPAWN_DELAY_MS);
    if (gen !== genRef.current) return;
    spawned.forEach(({ tile, r }) => (tile.r = r));
    sync(FALL_MS);
    await delay(FALL_MS);
  };

  // Pop `cells` (shrink away), let the board fall, and score them. `grown` = specials that appeared in
  // this step: they swell while the others pop, then settle.
  const popCells = async (cells: Cell[], points: number, gen: number, grown: Tile[] = []) => {
    scoreRef.current += cells.length * points;
    setScore(scoreRef.current);
    cells.forEach(({ r, c }) => {
      const tile = gridRef.current[r][c];
      if (!tile) return;
      tile.popping = true;
      poppingRef.current.push(tile);
      gridRef.current[r][c] = null;
    });
    grown.forEach((t) => (t.grow = true));
    sync();
    await delay(POP_MS);
    if (gen !== genRef.current) return;
    grown.forEach((t) => (t.grow = false));
    poppingRef.current = [];
    await applyGravity(gen);
  };

  // A pick for a 🌟: one of the fruit colours still on the board (seeded "special" stream)
  const pickFruit = () => {
    const present = FRUITS.map((_, f) => f).filter((f) => cellsOf(typesOf(gridRef.current), f).length > 0);
    return present.length ? present[Math.floor(rngsRef.current.special() * present.length)] : null;
  };

  // Match groups, then the cascades they cause. A group of 4 leaves a 🥤 and 5+ a 🌟 (on the swapped cell
  // when it's in the group — `swapped`, only for the swap's own match — else the group's middle).
  const clearMatches = async (first: Cell[][], gen: number, swapped: Cell[] = []) => {
    let groups = first;
    let chain = 0;
    while (groups.length > 0) {
      chain++;
      const clear: Cell[] = [];
      const grown: Tile[] = [];
      for (const g of groups) {
        const special = g.length >= 5 ? STAR : g.length === 4 ? SMOOTHIE : null;
        const at = special === null ? null : (swapped.find((s) => g.some((m) => sameCell(m, s))) ?? g[Math.floor(g.length / 2)]);
        for (const m of g) {
          const tile = gridRef.current[m.r][m.c];
          if (at && sameCell(at, m) && tile && special !== null) {
            tile.type = special;
            grown.push(tile);
            logEvent("special_made", { game_id: "G19", run: runRef.current, special: SPECIALS[special].name, group: g.length });
          } else clear.push(m);
        }
      }
      logEvent("match_clear", {
        game_id: "G19",
        run: runRef.current,
        move: MOVES_PER_RUN - movesRef.current,
        chain,
        fruits: clear.length,
        points: clear.length * POINTS_PER_FRUIT,
      });
      await popCells(clear, POINTS_PER_FRUIT, gen, grown);
      if (gen !== genRef.current) return;
      swapped = [];
      groups = findMatchGroups(typesOf(gridRef.current));
    }
  };

  // A swap with a special (a and b = where the two pieces ended up): 🥤 clears its row + column, 🌟 the
  // colour it was swapped onto, 🌟 + 🌟 the board, 🌟 + 🥤 turns a colour into 🥤 first. Then cascades.
  const fireSpecials = async (a: Cell, b: Cell, gen: number) => {
    const types = typesOf(gridRef.current);
    const plan = specialSwapPlan(types, a, b, pickFruit);
    if (plan.turned.length) {
      const turned = plan.turned.map((m) => gridRef.current[m.r][m.c]!).filter(Boolean);
      turned.forEach((t) => {
        t.type = SMOOTHIE;
        t.grow = true;
      });
      sync();
      await delay(COMBO_PAUSE_MS);
      if (gen !== genRef.current) return;
      turned.forEach((t) => (t.grow = false));
    }
    const cells = blastCells(typesOf(gridRef.current), plan.start, pickFruit, plan.spent);
    logEvent("special_blast", {
      game_id: "G19",
      run: runRef.current,
      move: MOVES_PER_RUN - movesRef.current,
      pieces: [types[a.r][a.c], types[b.r][b.c]].map((t) => (isSpecial(t) ? SPECIALS[t].name : "fruit")),
      cleared: cells.length,
      points: cells.length * POINTS_PER_BLAST,
    });
    await popCells(cells, POINTS_PER_BLAST, gen);
    if (gen !== genRef.current) return;
    await clearMatches(findMatchGroups(typesOf(gridRef.current)), gen);
  };

  const reshuffle = async (gen: number) => {
    logEvent("reshuffle", { game_id: "G19", run: runRef.current, moves_left: movesRef.current });
    setShuffleNotice(true);
    await delay(SHUFFLE_PAUSE_MS);
    if (gen !== genRef.current) return;
    // the n-th reshuffle of the day is the same board for everyone (seeded "shuffle" stream)
    gridRef.current = buildGrid(freshTypes(rngsRef.current.shuffle));
    sync();
    setShuffleNotice(false);
  };

  const endRun = (reason: EndReason | "dev_skip") => {
    playingRef.current = false;
    clearTimers();
    const final = scoreRef.current;
    bestRef.current = Math.max(bestRef.current, final);
    setBestScore(bestRef.current);
    logEvent("run_end", { game_id: "G19", run: runRef.current, score: final, best_score: bestRef.current, reason });
    setPhase("result");
  };

  // "you finished" text over the board, then the score screen
  const finishRun = async (reason: EndReason, gen: number) => {
    setEndReason(reason);
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
    endRun(reason);
  };

  const swap = async (a: Cell, b: Cell) => {
    const gen = genRef.current;
    const grid = gridRef.current;
    const t1 = grid[a.r][a.c];
    const t2 = grid[b.r][b.c];
    if (!t1 || !t2) return;

    busyRef.current = true;
    clearHint();
    const place = (x: Tile, y: Tile, ca: Cell, cb: Cell) => {
      grid[ca.r][ca.c] = y;
      grid[cb.r][cb.c] = x;
      x.r = cb.r;
      x.c = cb.c;
      y.r = ca.r;
      y.c = ca.c;
    };
    place(t1, t2, a, b);
    sync();
    await delay(SWAP_MS);
    if (gen !== genRef.current) return;

    // a special always goes off when swapped; otherwise the swap needs a match
    const withSpecial = isSpecial(t1.type) || isSpecial(t2.type);
    const groups = withSpecial ? [] : findMatchGroups(typesOf(grid));
    if (!withSpecial && groups.length === 0) {
      // swap back, like the mock — no move used
      place(t1, t2, b, a);
      sync();
      logEvent("invalid_swap", { game_id: "G19", run: runRef.current, from: a, to: b });
      await delay(SWAP_MS);
      if (gen !== genRef.current) return;
      busyRef.current = false;
      armHint();
      return;
    }

    if (tutorialRef.current) {
      tutorialRef.current = false;
      clearHint(true);
      logEvent("tutorial_done", { game_id: "G19", run: runRef.current });
    }
    movesRef.current -= 1;
    setMovesLeft(movesRef.current);
    logEvent("swap", { game_id: "G19", run: runRef.current, from: a, to: b, moves_left: movesRef.current });

    // t1 (dragged) now sits on b, t2 on a — a special is made where the dragged fruit landed if it's in the match
    if (withSpecial) await fireSpecials(b, a, gen);
    else await clearMatches(groups, gen, [b, a]);
    if (gen !== genRef.current) return;

    if (movesRef.current <= 0) {
      await finishRun("moves_used", gen);
      return;
    }
    if (!findMove(typesOf(gridRef.current))) {
      if (RULES.onNoMoves === "end") {
        logEvent("no_moves", { game_id: "G19", run: runRef.current, moves_left: movesRef.current });
        await finishRun("no_moves", gen);
        return;
      }
      await reshuffle(gen);
      if (gen !== genRef.current) return;
    }
    busyRef.current = false;
    armHint();
  };

  const tapCell = (cell: Cell) => {
    if (busyRef.current || !playingRef.current) return;
    const sel = selectedRef.current;
    if (sel && sameCell(sel, cell)) {
      select(null);
    } else if (sel && isAdjacent(sel, cell)) {
      select(null);
      void swap(sel, cell);
    } else {
      select(cell);
    }
  };

  // a touch in the gap counts for the nearest tile (each tile's hit area reaches halfway into the gap)
  const cellAt = (clientX: number, clientY: number): Cell | null => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const stepX = (rect.width * STEP_X_PCT) / 100;
    const stepY = (rect.height * STEP_Y_PCT) / 100;
    const gapX = (rect.width * GAP_X_PX) / BOARD_W_PX;
    const gapY = (rect.height * GAP_Y_PX) / BOARD_H_PX;
    const c = Math.floor((clientX - rect.left + gapX / 2) / stepX);
    const r = Math.floor((clientY - rect.top + gapY / 2) / stepY);
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE ? { r, c } : null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busyRef.current || !playingRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, cell };
    setPressedId(gridRef.current[cell.r][cell.c]?.id ?? null);
    clearHint();
  };

  // The neighbour a drag points at: "tap" while it's still shorter than SWIPE_MIN_PX,
  // null when it points off the board.
  const dragTargetOf = (drag: { x: number; y: number; cell: Cell }, clientX: number, clientY: number): Cell | "tap" | null => {
    const dx = clientX - drag.x;
    const dy = clientY - drag.y;
    if (Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) return "tap";
    const target = { ...drag.cell };
    if (Math.abs(dx) > Math.abs(dy)) target.c += dx > 0 ? 1 : -1;
    else target.r += dy > 0 ? 1 : -1;
    return target.r >= 0 && target.r < SIZE && target.c >= 0 && target.c < SIZE ? target : null;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const target = dragTargetOf(drag, e.clientX, e.clientY);
    const next = target === "tap" ? null : target;
    setDragTarget((cur) => (cur === next || (cur && next && sameCell(cur, next)) ? cur : next));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setPressedId(null);
    setDragTarget(null);
    if (!drag || busyRef.current || !playingRef.current) return;

    const target = dragTargetOf(drag, e.clientX, e.clientY);
    if (target === "tap") {
      tapCell(drag.cell);
      return;
    }
    if (!target) {
      armHint();
      return;
    }
    select(null);
    void swap(drag.cell, target);
  };

  const onPointerCancel = () => {
    dragRef.current = null;
    setPressedId(null);
    setDragTarget(null);
  };

  const startRun = () => {
    genRef.current += 1;
    clearTimers();
    // same date = same level, also on "เล่นอีกครั้ง" (fixed at run start, even if played past midnight)
    const seed = todaySeed();
    rngsRef.current = makeRngs(seed);
    gridRef.current = buildGrid(freshTypes(rngsRef.current.board));
    poppingRef.current = [];
    busyRef.current = false;
    playingRef.current = true;
    scoreRef.current = 0;
    movesRef.current = MOVES_PER_RUN;
    runRef.current += 1;
    tutorialRef.current = runRef.current === 1;
    setRuns(runRef.current);
    setScore(0);
    setMovesLeft(MOVES_PER_RUN);
    select(null);
    setHint(null);
    setSpotlight(null);
    setPressedId(null);
    setDragTarget(null);
    setFinishPopup(null);
    setShuffleNotice(false);
    sync();
    setPhase("play");
    logEvent("run_start", { game_id: "G19", run: runRef.current, seed });
    armHint(HINT_START_MS, true);
  };

  const finish = () => {
    const stars = starsFor(bestRef.current);
    logEvent("game_complete", { game_id: "G19", runs: runRef.current, best_score: bestRef.current, stars });
    onFinish(stars, bestRef.current);
  };

  if (phase === "intro") {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="เรียงผลไม้"
        objective="ลากผลไม้สลับกับช่องข้างๆ ให้ผลไม้ชนิดเดียวกันติดกัน 3 ผลขึ้นไป"
        choices={`สลับได้ ${MOVES_PER_RUN} ครั้ง ไม่จับเวลา`}
        imageSrc="/assets/icons/g19-fruit-match.png"
        onStart={() => {
          logEvent("game_intro_start", { game_id: "G19" });
          startRun();
        }}
      />
    );
  }

  if (phase === "result") {
    const newBest = runs > 1 && score > 0 && score === bestScore;
    return (
      <div ref={stageRootRef} className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col bg-white`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center gp-gap-20 gp-px-24 gp-py-28 text-center">
            <Trophy size={88} className="shrink-0 text-[#CA8A04]" aria-hidden="true" />
            <p className="gp-text-32 font-bold gp-leading-40 text-black">เก่งมาก!</p>
            <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">
              ได้คะแนน <span className="font-bold text-[#B45309]">{score}</span> คะแนน
            </p>
            {SHOW_RESULT_BEST_SCORE && newBest && <p className="gp-text-24 font-bold gp-leading-32 text-[#15803D]">🎉 สถิติใหม่ของคุณ!</p>}
            {SHOW_RESULT_BEST_SCORE && runs > 1 && (
              <p className="gp-text-22 font-semibold gp-leading-32 text-[#4B4B4B]">สถิติดีที่สุด: {bestScore} คะแนน</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gp-gap-14 gp-px-24 gp-pb-action-bar gp-pt-22">
          <Button3D variant="secondary" onClick={startRun}>เล่นอีกครั้ง</Button3D>
          <Button3D onClick={finish}>จบเกม</Button3D>
        </div>
      </div>
    );
  }

  const isHint = (cell: Cell) => !!hint && (sameCell(hint[0], cell) || sameCell(hint[1], cell));

  // Tooltip above the board when the tutorial move is in the top half, below it otherwise (as in the
  // mock). On a short phone with no room on that side it goes to the other side instead (above = over
  // the dimmed header), so it never covers the fruit the hand points at; kept inside the play screen.
  let tipTop = 0;
  if (showSpotlight && hint && stage) {
    const need = stage.tipH + TUTORIAL_TIP_GAP_PX + 8;
    const roomAbove = stage.y;
    const roomBelow = stage.rootH - (stage.y + stage.h);
    const prefersAbove = (hint[0].r + hint[1].r) / 2 < SIZE / 2;
    const fits = (above: boolean) => (above ? roomAbove : roomBelow) >= need;
    const above = fits(prefersAbove) ? prefersAbove : fits(!prefersAbove) ? !prefersAbove : roomAbove > roomBelow;
    const want = above ? stage.y - TUTORIAL_TIP_GAP_PX - stage.tipH : stage.y + stage.h + TUTORIAL_TIP_GAP_PX;
    tipTop = Math.max(8, Math.min(want, stage.rootH - stage.tipH - 8));
  }

  return (
    <div
      ref={setPlayRoot}
      className={`${notoLoopedThai.className} gp-compact relative flex min-h-0 flex-1 flex-col select-none`}
      style={{ backgroundImage: "linear-gradient(155.36deg, #EEFEE9 0%, #DCF4D4 100%)" }}
    >
      {/* Header card: same as G17 / G18 (GameStageHeader) — moves left on the left, score right */}
      <GameStageHeader
        left={{ label: "สลับได้อีก", value: movesLeft, ariaLabel: `สลับได้อีก ${movesLeft} ครั้ง` }}
        right={{ label: "คะแนน", value: <ScoreTicker value={score} />, ariaLabel: `คะแนน ${score}` }}
      >
        {/* QA only (same idea as G18's skip) — end the run now to check the score screen */}
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => {
              if (!playingRef.current) return;
              genRef.current += 1;
              logEvent("g19_dev_end_run", { game_id: "G19", run: runRef.current, moves_left: movesRef.current });
              endRun("dev_skip");
            }}
            className={HUD_DEV_BUTTON_CLASS}
            data-dev-only="g19-end-run"
          >
            จบรอบ
          </button>
        )}
      </GameStageHeader>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
        <div ref={boardAreaRef} className="flex min-h-full flex-col items-center justify-center gp-gap-16 gp-px-24 gp-py-24">
          {/* keep the whole board on screen (boardW, measured above); very short screens scroll instead */}
          <div ref={boardWrapRef} className="relative w-full" style={{ maxWidth: boardW }}>
            {/* board + hint hand share this box so the hand's % positions match the tiles */}
            <div className="relative">
              <div
                ref={boardRef}
                aria-label="กระดานผลไม้"
                role="group"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                className="relative w-full touch-none overflow-hidden"
                style={{ aspectRatio: `${BOARD_W_PX} / ${BOARD_H_PX}`, containerType: "inline-size" }}
              >
                {tiles.map((t) => {
                  const cell = { r: t.r, c: t.c };
                  const special = isSpecial(t.type) ? SPECIALS[t.type] : null;
                  const fruit = special ?? FRUITS[t.type];
                  const isSelected = sameCell(selected, cell);
                  const hinted = isHint(cell);
                  const pressed = pressedId === t.id;
                  // held tile looks "picked" like a tap-selected one; the drag target gets a dashed outline
                  const picked = isSelected || pressed;
                  const isDragTarget = !t.popping && sameCell(dragTarget, cell);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-label={`${fruit.name} แถว ${t.r + 1} ช่อง ${t.c + 1}`}
                      aria-pressed={isSelected}
                      // keyboard Enter/Space fires click with detail 0; pointer taps are handled on the board
                      onClick={(e) => {
                        if (e.detail === 0) tapCell(cell);
                      }}
                      // bottom padding = room for the tile's 2px bottom edge, so it isn't clipped on the last row
                      className="absolute flex cursor-pointer border-0 bg-transparent p-0 pb-[2px] transition-[top,left] ease-in-out"
                      style={{ transitionDuration: `${slideMs}ms`, ...tileBox(cell) }}
                    >
                      {/* tile: Figma fruit tile — tinted fill, 2px border, 2px bottom edge, 48px fruit */}
                      <span
                        className={`flex h-full w-full items-center justify-center rounded-[12px] border-2 border-solid ${
                          hinted ? "animate-pulse" : ""
                        }`}
                        style={{
                          backgroundColor: fruit.bg,
                          borderColor: fruit.edge,
                          transform: t.popping
                            ? "scale(0)"
                            : t.grow
                              ? "scale(1.15)"
                              : pressed
                                ? "translateY(2px)"
                                : undefined,
                          opacity: t.popping ? 0 : 1,
                          filter: pressed || isDragTarget ? "brightness(0.95)" : undefined,
                          boxShadow: pressed ? "none" : `0 2px 0 0 ${fruit.edge}`,
                          transition: t.popping
                            ? // shrink to nothing (a tiny swell first), fading only at the very end
                              `transform ${POP_MS}ms cubic-bezier(0.4, -0.4, 0.7, 0.6), opacity ${POP_MS * 0.35}ms ease ${POP_MS * 0.65}ms`
                            : `transform ${SPECIAL_GROW_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.1s, background-color ${SPECIAL_GROW_MS}ms`,
                          // added: picked fruit (tap-selected or held), the drag's swap target, and the idle hint
                          outline: picked
                            ? "4px solid #2563EB"
                            : isDragTarget
                              ? "4px dashed #2563EB"
                              : hinted
                                ? "4px dashed #B45309"
                                : undefined,
                          outlineOffset: picked || isDragTarget || hinted ? "-2px" : undefined,
                        }}
                      >
                        {special ? (
                          // specials (not in the Figma design yet): the mock's emoji, sized like the 48px fruit
                          <span
                            aria-hidden="true"
                            className="pointer-events-none block leading-none"
                            style={{ fontFamily: EMOJI_FONT, fontSize: `${(48 / BOARD_W_PX) * 100 * 0.85}cqw` }}
                          >
                            {special.emoji}
                          </span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- small static SVGs from the Figma design
                          <img src={FRUITS[t.type].icon} alt="" draggable={false} className="pointer-events-none block h-[75%] w-[75%]" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Hint guide over the tiles (outside the board, which clips, so the hand isn't cut off) */}
              {hint && (
                <HintGuide
                  key={`${hint[0].r}${hint[0].c}${hint[1].r}${hint[1].c}`}
                  from={hint[0]}
                  to={hint[1]}
                  tutorial={showSpotlight}
                />
              )}
            </div>

            {/* Reshuffle notice: same outlined text as the finish text; role="status" so screen readers hear it */}
            <div role="status" aria-live="polite" className="sr-only">
              {shuffleNotice ? "ไม่มีคู่ให้สลับ สับผลไม้ใหม่ให้นะ" : ""}
            </div>
            {shuffleNotice && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gp-gap-8 text-center text-white"
                style={{ WebkitTextStroke: "8px #7C2D12", paintOrder: "stroke fill", textShadow: "0 4px 12px rgba(0,0,0,0.35)" }}
              >
                <p className="gp-text-32 font-bold gp-leading-44">ไม่มีคู่ให้สลับ</p>
                <p className="gp-text-40 font-bold gp-leading-56">สับผลไม้ใหม่ให้นะ 🔀</p>
              </div>
            )}

            {/* Finish text: just text over the board, no panel — the dark outline keeps it readable on the fruit.
                aria-hidden because the status line already says the run is over. */}
            {finishPopup && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gp-gap-8 text-center text-white"
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
                <p className="gp-text-56 font-bold gp-leading-72">เก่งมาก! 🎉</p>
                <p className="gp-text-32 font-bold gp-leading-44">
                  {endReason === "no_moves" ? "ไม่มีคู่ให้สลับแล้ว" : `เล่นครบ ${MOVES_PER_RUN} ครั้งแล้ว`}
                </p>
              </div>
            )}
          </div>

          {SHOW_TIP && (
            <p className="w-full max-w-[420px] overflow-hidden text-ellipsis whitespace-nowrap gp-px-8 text-center gp-text-20 font-bold gp-leading-32 text-[#1a1a1a]">
              {TIP}
            </p>
          )}
        </div>
      </div>

      {/* First-run tutorial spotlight (candy crush10 mock): the whole screen, header included, dims except
          for holes around the pair to swap and the fruit they line up with. Touches go straight through
          to the board. The hand + trail (HintGuide, z-40) sit above it. */}
      {showSpotlight && spotlight && (
        <div className="g19-tutorial-in pointer-events-none absolute inset-0 z-30 overflow-hidden">
          {stage && (
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
              <defs>
                <mask id="g19-tutorial-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {spotlight.map((cell) => (
                    <rect
                      key={`${cell.r},${cell.c}`}
                      x={stage.x + (cell.c * STEP_X_PCT * stage.w) / 100 - TUTORIAL_HOLE_PAD_PX}
                      y={stage.y + (cell.r * STEP_Y_PCT * stage.h) / 100 - TUTORIAL_HOLE_PAD_PX}
                      width={(TILE_W_PCT * stage.w) / 100 + TUTORIAL_HOLE_PAD_PX * 2}
                      height={(TILE_H_PCT * stage.h) / 100 + TUTORIAL_HOLE_PAD_PX * 2}
                      rx={TUTORIAL_HOLE_RADIUS_PX}
                      fill="black"
                    />
                  ))}
                </mask>
              </defs>
              <rect width="100%" height="100%" fill={TUTORIAL_DIM} mask="url(#g19-tutorial-mask)" />
            </svg>
          )}
          {/* drawn hidden until measured, so its height is known before it's placed */}
          <div
            ref={tipRef}
            className="absolute inset-x-0 z-10 flex justify-center gp-px-24"
            style={{ top: tipTop, visibility: stage ? "visible" : "hidden" }}
          >
            <p
              role="status"
              // same look as the other games' tutorial boxes (G13/G18/G20): amber border = an instruction
              className="max-w-[340px] rounded-[16px] border-2 border-solid border-amber-400 bg-white gp-px-16 gp-py-8 text-center gp-text-22 font-bold gp-leading-30 text-amber-950 shadow-md"
            >
              {/* two unbreakable halves: wraps between them, never mid-phrase */}
              {TUTORIAL_TIP.map((part, i) => (
                <React.Fragment key={part}>
                  {i > 0 && " "}
                  <span className="inline-block">{part}</span>
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
