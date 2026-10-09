"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import GameHudBar, { GameHudItem, HUD_DEV_BUTTON_CLASS } from "./GameHudBar";
import { ArrowLeftRight, Cherry, Trophy } from "lucide-react";
import { notoLoopedThai } from "@/lib/fonts";
import Button3D from "@/components/Button3D";
import GameIntro from "@/components/GameIntro";
import { seededStream, todaySeed, type Rng } from "@/lib/seededRandom";

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
 * - a written status line, and a guide (blinking outlines + a 👆 hand pressing the right fruit
 *   and sliding onto its neighbour, on a loop) shown at the start and after a few idle seconds
 * - when no swap can make a match any more (the mock just got stuck) the run ends on a
 *   positive note; an automatic reshuffle is kept behind RULES.onNoMoves to switch back to
 * - the header's orange numbers are darker for contrast
 * - the board is seeded by today's date (Bangkok time), so every player gets the same level
 *   that day: same starting board, same refill fruit per column, same reshuffles
 * Dev-hub only, not wired into GameShell/lesson flow.
 */

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "intro" | "play" | "result";
type Cell = { r: number; c: number };
type Tile = { id: number; type: number; r: number; c: number; popping?: boolean };
type Grid = (Tile | null)[][];
type TypeGrid = (number | null)[][];
type FinishPopup = "enter" | "show" | "leave" | null;

const FRUITS = [
  { emoji: "🍎", name: "แอปเปิล" },
  { emoji: "🍉", name: "แตงโม" },
  { emoji: "🍇", name: "องุ่น" },
  { emoji: "🍌", name: "กล้วย" },
  { emoji: "🍊", name: "ส้ม" },
];

const SIZE = 5; // rows = cols, same as the mock
const CELL_PCT = 100 / SIZE;
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
const SHUFFLE_PAUSE_MS = 1200;
// "you finished" text over the board after the last move: fade/zoom in, hold, fade out
const FINISH_IN_MS = 500;
const FINISH_HOLD_MS = 1800;
const FINISH_OUT_MS = 450;

// What happens when, after a match, no swap on the board can make a match any more:
// "end" = the run ends there (current design); "reshuffle" = deal a new board and keep
// playing (earlier design — kept so it can be switched back on). A typed object, so TS
// doesn't narrow the value and flag the unused branch.
const RULES: { onNoMoves: "end" | "reshuffle" } = { onNoMoves: "end" };

type EndReason = "moves_used" | "no_moves";

// tips are kept short enough to fit one line at 20px on a 360px-wide phone
const TIP = "💡 ลากหรือแตะ 2 ช่องที่ติดกันเพื่อสลับ";

// text colour only (no panel) — all ≥ 4.5:1 on the #DCF4D4 background
function starsFor(score: number) {
  if (score >= 900) return 3;
  if (score >= 500) return 2;
  return 1;
}

// Separate streams so one part of the game can't shift another's numbers: the start board,
// the reshuffles, and one refill stream per column (the n-th fruit dropped into a column is
// the same for every player, whatever order they cleared things in).
type Rngs = { board: Rng; shuffle: Rng; columns: Rng[] };
function makeRngs(seed: string): Rngs {
  const stream = (name: string) => seededStream("G19", seed, name);
  return {
    board: stream("board"),
    shuffle: stream("shuffle"),
    columns: Array.from({ length: SIZE }, (_, c) => stream(`column-${c}`)),
  };
}

const randomFruit = (rng: Rng) => Math.floor(rng() * FRUITS.length);

function findMatches(types: TypeGrid): Cell[] {
  const matched = new Set<string>();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE - 2; c++) {
      const t = types[r][c];
      if (t === null) continue;
      if (types[r][c + 1] === t && types[r][c + 2] === t) {
        for (let k = c; k < SIZE && types[r][k] === t; k++) matched.add(`${r},${k}`);
      }
    }
  }
  for (let c = 0; c < SIZE; c++) {
    for (let r = 0; r < SIZE - 2; r++) {
      const t = types[r][c];
      if (t === null) continue;
      if (types[r + 1][c] === t && types[r + 2][c] === t) {
        for (let k = r; k < SIZE && types[k][c] === t; k++) matched.add(`${k},${c}`);
      }
    }
  }
  return Array.from(matched, (key) => {
    const [r, c] = key.split(",").map(Number);
    return { r, c };
  });
}

// A random swap that would make a match, or null when the board is stuck.
// Math.random is fine here: it only picks which hint to show, it never changes the board.
function findMove(types: TypeGrid): [Cell, Cell] | null {
  const moves: [Cell, Cell][] = [];
  const trySwap = (a: Cell, b: Cell) => {
    const copy = types.map((row) => row.slice());
    [copy[a.r][a.c], copy[b.r][b.c]] = [copy[b.r][b.c], copy[a.r][a.c]];
    if (findMatches(copy).length > 0) moves.push([a, b]);
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
  const copy = types.map((row) => row.slice());
  [copy[a.r][a.c], copy[b.r][b.c]] = [copy[b.r][b.c], copy[a.r][a.c]];
  return findMatches(copy).some((m) => sameCell(m, b)) ? [a, b] : [b, a];
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
function HintGuide({ from, to }: { from: Cell; to: Cell }) {
  const loop = { animationDuration: `${HINT_HAND_MS}ms` };
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20" style={{ containerType: "inline-size" }}>
      <div
        className="g19-guide-hand absolute"
        style={
          {
            left: `${from.c * CELL_PCT}%`,
            top: `${from.r * CELL_PCT}%`,
            width: `${CELL_PCT}%`,
            height: `${CELL_PCT}%`,
            "--dx": `${(to.c - from.c) * 100}%`,
            "--dy": `${(to.r - from.r) * 100}%`,
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

  // the score sits at the right end of the header, so "+ 30" shows on its left (before the trophy)
  return (
    <GameHudItem icon={Trophy} tone="score">
      {shown} คะแนน
      {/* aria-hidden: the status line already says "+30" */}
      {gain && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full top-1/2 mr-2 whitespace-nowrap text-[#15803D]"
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
    </GameHudItem>
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
  const [hint, setHint] = useState<[Cell, Cell] | null>(null);
  const [finishPopup, setFinishPopup] = useState<FinishPopup>(null);
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
      setHint(orientMove(types, move));
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

  const clearMatches = async (first: Cell[], gen: number) => {
    let matches = first;
    let chain = 0;
    while (matches.length > 0) {
      chain++;
      const gained = matches.length * POINTS_PER_FRUIT;
      scoreRef.current += gained;
      setScore(scoreRef.current);
      logEvent("match_clear", {
        game_id: "G19",
        run: runRef.current,
        move: MOVES_PER_RUN - movesRef.current,
        chain,
        fruits: matches.length,
        points: gained,
      });

      matches.forEach(({ r, c }) => {
        const tile = gridRef.current[r][c];
        if (!tile) return;
        tile.popping = true;
        poppingRef.current.push(tile);
        gridRef.current[r][c] = null;
      });
      sync();
      await delay(POP_MS);
      if (gen !== genRef.current) return;
      poppingRef.current = [];

      await applyGravity(gen);
      if (gen !== genRef.current) return;
      matches = findMatches(typesOf(gridRef.current));
    }
  };

  const reshuffle = async (gen: number) => {
    logEvent("reshuffle", { game_id: "G19", run: runRef.current, moves_left: movesRef.current });
    await delay(SHUFFLE_PAUSE_MS);
    if (gen !== genRef.current) return;
    gridRef.current = buildGrid(freshTypes(rngsRef.current.shuffle));
    sync();
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

    const matches = findMatches(typesOf(grid));
    if (matches.length === 0) {
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

    await clearMatches(matches, gen);
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

  const cellAt = (clientX: number, clientY: number): Cell | null => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const c = Math.floor((clientX - rect.left) / (rect.width / SIZE));
    const r = Math.floor((clientY - rect.top) / (rect.height / SIZE));
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

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setPressedId(null);
    if (!drag || busyRef.current || !playingRef.current) return;

    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) {
      tapCell(drag.cell);
      return;
    }
    const target = { ...drag.cell };
    if (Math.abs(dx) > Math.abs(dy)) target.c += dx > 0 ? 1 : -1;
    else target.r += dy > 0 ? 1 : -1;
    if (target.r < 0 || target.r >= SIZE || target.c < 0 || target.c >= SIZE) {
      armHint();
      return;
    }
    select(null);
    void swap(drag.cell, target);
  };

  const onPointerCancel = () => {
    dragRef.current = null;
    setPressedId(null);
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
    setPressedId(null);
    setFinishPopup(null);
    sync();
    setPhase("play");
    logEvent("run_start", { game_id: "G19", run: runRef.current, seed });
    armHint(HINT_START_MS, true);
  };

  const finish = () => {
    const stars = starsFor(bestRef.current);
    logEvent("game_complete", { game_id: "G19", runs: runRef.current, best_score: bestRef.current, stars });
    onFinish(stars);
  };

  if (phase === "intro") {
    return (
      <GameIntro
        containerClassName="bg-white gp-compact"
        title="เรียงผลไม้"
        objective="ลากผลไม้สลับกับช่องข้าง ๆ ให้ผลไม้ชนิดเดียวกันเรียงติดกัน 3 ผลขึ้นไป แนวนอนหรือแนวตั้งก็ได้ ผลไม้จะหายไปและได้คะแนน"
        choices={`สลับได้ ${MOVES_PER_RUN} ครั้ง ไม่จับเวลา ค่อย ๆ เล่นได้เลย`}
        icon={Cherry}
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
      <div className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col bg-white`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center gp-gap-20 gp-px-24 gp-py-28 text-center">
            <Trophy size={88} className="shrink-0 text-[#CA8A04]" aria-hidden="true" />
            <p className="gp-text-32 font-bold gp-leading-40 text-black">เก่งมาก!</p>
            <p className="gp-text-24 font-semibold gp-leading-32 text-[#4B4B4B]">
              ได้คะแนน <span className="font-bold text-[#B45309]">{score}</span> คะแนน
            </p>
            {newBest && <p className="gp-text-24 font-bold gp-leading-32 text-[#15803D]">🎉 สถิติใหม่ของคุณ!</p>}
            {runs > 1 && (
              <p className="gp-text-22 font-semibold gp-leading-32 text-[#4B4B4B]">สถิติดีที่สุด: {bestScore} คะแนน</p>
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

  const isHint = (cell: Cell) => !!hint && (sameCell(hint[0], cell) || sameCell(hint[1], cell));

  return (
    <div className={`${notoLoopedThai.className} gp-compact flex min-h-0 flex-1 flex-col bg-[#DCF4D4] select-none`}>
      {/* Header: same bar as G13 / G18 / G20 (GameHudBar) — moves left on the left, score right */}
      <GameHudBar
        left={<GameHudItem icon={ArrowLeftRight}>สลับได้อีก {movesLeft}</GameHudItem>}
        right={<ScoreTicker value={score} />}
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
      </GameHudBar>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gp-gap-16 gp-px-12 gp-py-16">
          {/* keep the whole board on screen on most phones; very short screens scroll instead */}
          {/* one large panel behind all the fruit tiles */}
          <div
            className="relative w-full rounded-[24px] bg-[#A7D99A] p-[2%] shadow-[inset_0_2px_6px_rgba(0,0,0,0.12),0_3px_10px_rgba(0,0,0,0.08)]"
            style={{ maxWidth: "min(420px, 58dvh)" }}
          >
            {/* board + hint hand share this box so the hand's % positions match the tiles */}
            <div className="relative">
              {/* Board: same look as the mock's #board / .item / .item-inner */}
              <div
                ref={boardRef}
                aria-label="กระดานผลไม้"
                role="group"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                className="relative aspect-square w-full touch-none overflow-hidden"
                style={{ containerType: "inline-size" }}
              >
                {tiles.map((t) => {
                  const cell = { r: t.r, c: t.c };
                  const fruit = FRUITS[t.type];
                  const isSelected = sameCell(selected, cell);
                  const hinted = isHint(cell);
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
                      className="absolute flex cursor-pointer items-center justify-center border-0 bg-transparent p-[1.2cqw] transition-[top,left] ease-in-out"
                      style={{ transitionDuration: `${slideMs}ms`, left: `${t.c * CELL_PCT}%`, top: `${t.r * CELL_PCT}%`, width: `${CELL_PCT}%`, height: `${CELL_PCT}%` }}
                    >
                      <span
                        className={`flex h-full w-full items-center justify-center rounded-[12px] bg-white leading-none ${
                          hinted ? "animate-pulse" : ""
                        }`}
                        style={{
                          fontSize: "11cqw",
                          transform: t.popping ? "scale(0)" : pressedId === t.id ? "translateY(3px)" : undefined,
                          opacity: t.popping ? 0 : 1,
                          filter: pressedId === t.id ? "brightness(0.95)" : undefined,
                          boxShadow: pressedId === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "0 3px 8px rgba(0,0,0,0.12)",
                          transition: t.popping
                            ? // shrink to nothing (a tiny swell first), fading only at the very end
                              `transform ${POP_MS}ms cubic-bezier(0.4, -0.4, 0.7, 0.6), opacity ${POP_MS * 0.35}ms ease ${POP_MS * 0.65}ms`
                            : "transform 0.1s, box-shadow 0.1s",
                          // added: selected fruit (tap mode) and the idle hint
                          outline: isSelected ? "4px solid #2563EB" : hinted ? "4px dashed #B45309" : undefined,
                          outlineOffset: isSelected || hinted ? "-4px" : undefined,
                        }}
                      >
                        {fruit.emoji}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Hint guide over the tiles (outside the board, which clips, so the hand isn't cut off) */}
              {hint && (
                <HintGuide key={`${hint[0].r}${hint[0].c}${hint[1].r}${hint[1].c}`} from={hint[0]} to={hint[1]} />
              )}
            </div>

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

          <p className="w-full max-w-[420px] overflow-hidden text-ellipsis whitespace-nowrap gp-px-8 text-center gp-text-20 font-bold gp-leading-32 text-[#1a1a1a]">
            {TIP}
          </p>
        </div>
      </div>
    </div>
  );
}
