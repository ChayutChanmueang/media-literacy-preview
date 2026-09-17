"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, AlertTriangle, Link2, Volume2, VolumeX } from "lucide-react";
import ITEMS from "@/data/g12-chuzzle-items.json";
import {
  previewShiftSimple,
  resolveAfterCommit,
  seedBoard,
  type ColorCluster,
  type RingGrid,
  type ShiftAxis,
  type Tile,
  type TileHue,
} from "@/lib/match-ring";

/**
 * G12 — อย่ากดลิงก์จี้ ถ้าไม่รีบหยุดกด (PROTOTYPE)
 * Spec: docs/gdd/design-g12.md §13 Match-Ring (clean-room)
 *
 * Match row/column rings to clear a color cluster before the finger
 * slides left→right onto the fake "open link" button. Miss = soft advice, no score loss.
 */

type G12Item = {
  id: string;
  author: string;
  time_ago: string;
  body: string;
  link_display: string;
  link_full: string;
  link_headline: string;
  owner_domain: string;
  is_safe: boolean;
  min_group_size: number;
  finger_slide_ms: number;
  red_flags: string[];
  explain: string;
  hotline: string;
  ai_disclosure: boolean;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "play" | "feedback" | "summary";
type Outcome = "destroy" | "miss";

const POOL = ITEMS as G12Item[];
const BOARD_SIZE = 5;
const SESSION_ROUNDS = 10;
const DRAG_THRESHOLD = 0.1;

const HUE_STYLE: Record<TileHue, { bg: string; shape: string; label: string }> = {
  coral: { bg: "#fb7185", shape: "●", label: "ชมพู" },
  mint: { bg: "#34d399", shape: "■", label: "เขียว" },
  sky: { bg: "#38bdf8", shape: "▲", label: "ฟ้า" },
  sand: { bg: "#fbbf24", shape: "◆", label: "เหลือง" },
};

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

export default function G12ChuzzleStop({ onFinish, logEvent }: Props) {
  const deck = useMemo(() => {
    // Pool may be smaller than the session length; cycle reshuffled copies so the
    // finger keeps facing a fresh random link for every one of SESSION_ROUNDS rounds.
    const out: G12Item[] = [];
    while (out.length < SESSION_ROUNDS) out.push(...shuffle(POOL));
    return out.slice(0, SESSION_ROUNDS);
  }, []);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("play");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [destroyedCount, setDestroyedCount] = useState(0);
  const [audioOn, setAudioOn] = useState(false);

  const item = deck[roundIndex]!;
  const minSize = item.min_group_size;

  const [grid, setGrid] = useState<RingGrid>(() => seedBoard(BOARD_SIZE, minSize));
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [fingerProgress, setFingerProgress] = useState(0);
  const [linkDestroyedVisual, setLinkDestroyedVisual] = useState(false);
  const [boardLocked, setBoardLocked] = useState(false);

  const resolvedRef = useRef(false);
  const gridRef = useRef(grid);
  const destroyedRef = useRef(0);

  // Drag state
  const dragRef = useRef<{
    mode: "idle" | "armed" | "row" | "col";
    startX: number;
    startY: number;
    cell: number;
    row: number;
    col: number;
    baseGrid: RingGrid;
  }>({
    mode: "idle",
    startX: 0,
    startY: 0,
    cell: 48,
    row: 0,
    col: 0,
    baseGrid: grid,
  });
  const boardElRef = useRef<HTMLDivElement | null>(null);
  const [dragAxis, setDragAxis] = useState<ShiftAxis | null>(null);
  const [dragIndex, setDragIndex] = useState(0);
  // While dragging we render the rounded-shift preview grid (already wrapped) so
  // that the highlighted clusters and the eventual commit are WYSIWYG. The dragged
  // line is nudged only by the sub-cell remainder (dragFraction ∈ [-0.5, 0.5]).
  const [previewGrid, setPreviewGrid] = useState<RingGrid | null>(null);
  const [dragFraction, setDragFraction] = useState(0);
  // Real cell pitch in px (tile size + gap), measured from the DOM at drag start.
  // Used for BOTH the drag-distance math and the visual translate so the sub-cell
  // nudge lines up exactly with the one-cell grid jump at each wrap (no stutter).
  const [cellPx, setCellPx] = useState(48);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const finishRound = useCallback(
    (result: Outcome, clusterSize?: number) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      setBoardLocked(true);
      setOutcome(result);
      setPhase("feedback");
      setHighlightIds(new Set());
      setDragAxis(null);
      setPreviewGrid(null);
      setDragFraction(0);

      if (result === "destroy") {
        setLinkDestroyedVisual(true);
        destroyedRef.current += 1;
        setDestroyedCount(destroyedRef.current);
        setFingerProgress(0);
        logEvent("link_destroyed", {
          game_id: "g12",
          item_id: item.id,
          cluster_size: clusterSize ?? minSize,
          before_finger: true,
        });
      } else {
        setFingerProgress(1);
        logEvent("finger_press", { game_id: "g12", item_id: item.id });
      }
      logEvent("feedback_view", {
        game_id: "g12",
        item_id: item.id,
        outcome: result,
      });
    },
    [item.id, logEvent, minSize]
  );

  const beginRound = useCallback(
    (index: number) => {
      const nextItem = deck[index]!;
      resolvedRef.current = false;
      setPhase("play");
      setOutcome(null);
      setLinkDestroyedVisual(false);
      setBoardLocked(false);
      setHighlightIds(new Set());
      setDragAxis(null);
      setPreviewGrid(null);
      setDragFraction(0);
      setFingerProgress(0);
      const seeded = seedBoard(BOARD_SIZE, nextItem.min_group_size);
      setGrid(seeded);
      logEvent("round_start", {
        game_id: "g12",
        item_id: nextItem.id,
        min_group_size: nextItem.min_group_size,
        finger_slide_ms: nextItem.finger_slide_ms,
      });
    },
    [deck, logEvent]
  );

  // Log once on mount (round 0's board is already seeded; the finger effect below
  // drives its movement).
  useEffect(() => {
    logEvent("game_start", { game_id: "g12", variant: "match_ring_finger" });
    const first = deck[0]!;
    logEvent("round_start", {
      game_id: "g12",
      item_id: first.id,
      min_group_size: first.min_group_size,
      finger_slide_ms: first.finger_slide_ms,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  // The finger advances on its own via a delta-time rAF loop — completely
  // independent of pointer input (the previous bug: it only moved when a pointer
  // event forced a re-render). A fresh loop starts for each round (keyed on
  // roundIndex) and is torn down whenever the round leaves "play" (hit/miss/
  // summary), so there are no manual start/stop calls to get out of sync.
  const finishRoundRef = useRef(finishRound);
  useEffect(() => {
    finishRoundRef.current = finishRound;
  });
  useEffect(() => {
    if (phase !== "play") return;
    const duration = deck[roundIndex]!.finger_slide_ms;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now: number) {
      if (resolvedRef.current) return;
      const t = Math.min(1, (now - start) / duration);
      setFingerProgress(t);
      if (t >= 1) {
        finishRoundRef.current("miss");
        return;
      }
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart finger each round
  }, [phase, roundIndex]);

  const commitSuccess = useCallback(
    (nextGrid: RingGrid, clusters: readonly ColorCluster[]) => {
      // Win race immediately on first clear
      finishRound("destroy", clusters[0]?.size);
      const resolved = resolveAfterCommit(nextGrid, clusters, minSize);
      setGrid(resolved.grid);
    },
    [finishRound, minSize]
  );

  const onPointerDown = (e: React.PointerEvent, tile: Tile) => {
    if (boardLocked || phase !== "play" || resolvedRef.current) return;
    const board = boardElRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    // Measure the true cell pitch (tile + gap) from two tiles one row apart, so the
    // translate uses the same unit the grid actually lays out with. Fall back to a
    // rough estimate if the tiles aren't queryable.
    const tileEls = board.querySelectorAll<HTMLElement>(".g12-tile");
    let cell = rect.width / BOARD_SIZE;
    if (tileEls.length > BOARD_SIZE) {
      const first = tileEls[0]!.getBoundingClientRect();
      const nextRow = tileEls[BOARD_SIZE]!.getBoundingClientRect();
      const measured = nextRow.top - first.top;
      if (measured > 0) cell = measured;
    }
    setCellPx(cell);
    board.setPointerCapture(e.pointerId);
    dragRef.current = {
      mode: "armed",
      startX: e.clientX,
      startY: e.clientY,
      cell,
      row: tile.row,
      col: tile.col,
      baseGrid: gridRef.current,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.mode === "idle" || boardLocked || resolvedRef.current) return;

    const dx = (e.clientX - d.startX) / d.cell;
    const dy = (e.clientY - d.startY) / d.cell;

    if (d.mode === "armed") {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_THRESHOLD) return;
      if (Math.abs(dx) >= Math.abs(dy)) {
        d.mode = "row";
        setDragAxis("row");
        setDragIndex(d.row);
      } else {
        d.mode = "col";
        setDragAxis("col");
        setDragIndex(d.col);
      }
    }

    const offset = d.mode === "row" ? dx : dy;
    const preview = previewShiftSimple(
      d.baseGrid,
      d.mode === "row" ? "row" : "col",
      d.mode === "row" ? d.row : d.col,
      offset,
      minSize
    );
    // Render the snapped preview grid + only the sub-cell remainder, so the board
    // shows the same integer shift that highlight/commit use (no diagonal-looking
    // highlights, no tiles sliding off the board edge). The remainder is relative
    // to the plain rounded integer (always within [-0.5, 0.5]) — NOT preview.steps,
    // which is wrapped to the shortest signed path and would blow up on long drags.
    setPreviewGrid(preview.grid);
    setDragFraction(offset - Math.round(offset));
    setHighlightIds(new Set(preview.clusters.flatMap((c) => c.tiles.map((t) => t.id))));
  };

  const clearDragPreview = useCallback(() => {
    setPreviewGrid(null);
    setDragFraction(0);
    setDragAxis(null);
  }, []);

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.mode === "idle") return;
    try {
      boardElRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (d.mode === "armed" || resolvedRef.current || boardLocked) {
      dragRef.current.mode = "idle";
      clearDragPreview();
      setHighlightIds(new Set());
      return;
    }

    const axis: ShiftAxis = d.mode === "row" ? "row" : "col";
    const index = d.mode === "row" ? d.row : d.col;
    const offset = axis === "row" ? (e.clientX - d.startX) / d.cell : (e.clientY - d.startY) / d.cell;
    const preview = previewShiftSimple(d.baseGrid, axis, index, offset, minSize);

    dragRef.current.mode = "idle";

    if (preview.clusters.length === 0 || preview.steps === 0) {
      clearDragPreview();
      setHighlightIds(new Set());
      return;
    }

    setGrid(preview.grid);
    clearDragPreview();
    commitSuccess(preview.grid, preview.clusters);
  };

  const goNext = () => {
    const next = roundIndex + 1;
    if (next >= deck.length) {
      const destroyed = destroyedRef.current;
      const ratio = destroyed / deck.length;
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      setPhase("summary");
      logEvent("game_complete", {
        game_id: "g12",
        stars,
        destroyed_count: destroyed,
        rounds: deck.length,
      });
      onFinish(stars);
      return;
    }
    logEvent("round_next", { game_id: "g12" });
    setRoundIndex(next);
    beginRound(next);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (!audioOn) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "th-TH";
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (phase === "feedback" && outcome && audioOn) {
      speak(outcome === "destroy" ? "ทำลายลิงก์จี้ทันแล้ว!" : "คุณกดลิงก์อันตรายไปแล้ว ระวังนะคะ");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, outcome, audioOn]);

  // No "ถัดไป" button — the round advances itself. A quick beat after a hit so the
  // shatter shows; a little longer after a miss so the message can be read.
  const goNextRef = useRef(() => {});
  useEffect(() => {
    goNextRef.current = goNext;
  });
  useEffect(() => {
    if (phase !== "feedback" || !outcome) return;
    const delay = outcome === "destroy" ? 950 : 1600;
    const id = window.setTimeout(() => goNextRef.current(), delay);
    return () => window.clearTimeout(id);
  }, [phase, outcome]);

  const strokeWidth = 2 + fingerProgress * 4;
  const glow = 0.15 + fingerProgress * 0.55;
  const displayGrid = previewGrid ?? grid;

  if (phase === "summary") {
    const ratio = destroyedCount / deck.length;
    const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
    return (
      <div className="flex h-full min-h-[100dvh] flex-col items-center justify-center gap-4 bg-slate-50 px-5 text-center">
        <div className="text-4xl" aria-hidden>
          🏆
        </div>
        <h1 className="text-[26px] font-bold text-slate-800">ยอดเยี่ยมมากค่ะ!</h1>
        <p className="text-[28px] tracking-wide" aria-label={`${stars} ดาว`}>
          {"⭐".repeat(stars)}
        </p>
        <p className="max-w-sm text-[20px] leading-relaxed text-slate-700">
          คุณฝึกหยุดนิ้วก่อนกดลิงก์จี้ได้ดีมาก จำไว้นะคะ — มองโดเมนให้ขาด รัฐไทย = .go.th
        </p>
        <p className="text-[18px] text-slate-500">ทำลายทัน {destroyedCount}/{deck.length} รอบ</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[100dvh] flex-col bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <div className="text-[18px] font-semibold text-teal-800">
          ทำลายทัน {destroyedCount} · รอบ {roundIndex + 1}/{deck.length}
        </div>
        <button
          type="button"
          className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-slate-100"
          aria-label={audioOn ? "ปิดเสียงอ่าน" : "เปิดเสียงอ่าน"}
          onClick={() => setAudioOn((v) => !v)}
        >
          {audioOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </header>

      <div className="g12-comment shrink-0 border-b border-slate-200 bg-white px-3 py-2">
        <div className="mb-1 flex items-center gap-2 text-[18px] text-slate-600">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-[16px]"
            aria-hidden
          >
            👤
          </span>
          <span className="font-medium text-slate-800">{item.author}</span>
          <span>· {item.time_ago}</span>
        </div>
        <p className="mb-2 line-clamp-2 text-[20px] leading-snug text-slate-800">{item.body}</p>

        <div
          className={`g12-link-card mb-2 overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50 transition ${
            linkDestroyedVisual ? "g12-link-shatter opacity-40" : ""
          }`}
        >
          <div className="bg-slate-200/80 px-3 py-1.5 text-[22px] font-bold tracking-wide text-slate-900">
            {item.owner_domain.toUpperCase()}
          </div>
          <div className="px-3 py-1.5 text-[18px] text-slate-600">{item.link_headline}</div>
        </div>

        <div className="g12-finger-rail relative flex h-14 items-center">
          <div
            className="g12-finger pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[28px]"
            style={{ left: `calc(${fingerProgress * 72}% )` }}
            aria-hidden
          >
            👆
          </div>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="g12-open-btn ml-auto flex min-h-12 items-center gap-2 rounded-xl bg-teal-700 px-4 text-[20px] font-semibold text-white"
            style={{
              boxShadow: `0 0 ${8 + fingerProgress * 16}px rgba(13, 148, 136, ${glow})`,
              outline: `${strokeWidth}px solid rgba(251, 146, 60, ${0.35 + fingerProgress * 0.55})`,
              outlineOffset: 2,
            }}
          >
            <Link2 size={20} aria-hidden />
            กดเปิดลิงก์
          </button>
        </div>
        <p className="mt-1 text-[18px] text-slate-600">
          ลากให้ก้อน<strong className="text-teal-800">สีเดียวกันเรียงติดกัน {minSize} ก้อน</strong> ก่อนนิ้วกด เพื่อทำลายลิงก์จี้
        </p>
      </div>

      {/* Brief, non-blocking outcome — auto-dismisses; no "ถัดไป" button. */}
      {phase === "feedback" && outcome && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
          <div
            className={`flex max-w-sm flex-col items-center gap-1 rounded-2xl px-6 py-5 text-center text-white shadow-xl ${
              outcome === "destroy" ? "bg-emerald-600" : "bg-amber-500"
            }`}
          >
            <div className="flex items-center gap-2 text-[24px] font-bold">
              {outcome === "destroy" ? (
                <Check size={28} aria-hidden />
              ) : (
                <AlertTriangle size={28} aria-hidden />
              )}
              <span>{outcome === "destroy" ? "ทำลายลิงก์จี้ทันแล้ว!" : "คุณกดลิงก์อันตรายไปแล้ว"}</span>
            </div>
            {outcome === "miss" && (
              <div className="text-[18px] opacity-95">โดเมนหลัก {item.owner_domain} · รัฐไทย = .go.th</div>
            )}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col px-2 py-2">
        <div
          ref={boardElRef}
          className="g12-board mx-auto aspect-square w-full max-w-[min(100%,520px)] touch-none select-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="application"
          aria-label="กระดานเรียงก้อน ลากแถวหรือคอลัมน์"
        >
          <div
            className="grid h-full w-full gap-1 overflow-hidden rounded-xl bg-slate-300/60 p-1"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
          >
            {displayGrid.tiles.flat().map((tile) => {
              const style = HUE_STYLE[tile.hue];
              const lit = highlightIds.has(tile.id);
              let transform = "";
              const onDraggedLine =
                (dragAxis === "row" && dragIndex === tile.row) ||
                (dragAxis === "col" && dragIndex === tile.col);
              if (dragAxis === "row" && dragIndex === tile.row) {
                transform = `translateX(${dragFraction * cellPx}px)`;
              } else if (dragAxis === "col" && dragIndex === tile.col) {
                transform = `translateY(${dragFraction * cellPx}px)`;
              }
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={boardLocked}
                  onPointerDown={(e) => onPointerDown(e, tile)}
                  className={`g12-tile flex min-h-12 items-center justify-center rounded-lg text-[22px] font-bold text-white shadow-sm ${
                    lit ? "ring-4 ring-white ring-offset-1 ring-offset-teal-600" : ""
                  }`}
                  style={{
                    backgroundColor: style.bg,
                    transform,
                    // Follow the finger instantly while dragging; keep the smooth
                    // 40ms transition (from .g12-tile) for the settle after release.
                    transition: onDraggedLine ? "none" : undefined,
                    willChange: onDraggedLine ? "transform" : undefined,
                  }}
                  aria-label={`ช่องแถว ${tile.row + 1} คอลัมน์ ${tile.col + 1} สี${style.label}`}
                >
                  <span aria-hidden>{style.shape}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
