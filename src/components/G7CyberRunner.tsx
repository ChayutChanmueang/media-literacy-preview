"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import HAZARDS from "@/data/g7-hazards.json";

/**
 * G7 — วิ่งสู้ภัยไซเบอร์ (Cyber Runner) — PROTOTYPE (design-g7.md)
 *
 * A gentle, forgiving auto-runner. The character stays put on the left; hazards
 * scroll in from the right at a slow, constant speed (one at a time). Tap
 * anywhere to jump. Hitting a hazard never fails the run — it freezes and shows
 * a teaching card, then the player continues. No timer, no game-over.
 *
 * Movement uses requestAnimationFrame (smoother than setInterval on mobile — the
 * lesson carried over from G5) with one active hazard, so collision is a single
 * check: is the character airborne when the hazard reaches it?
 */

type Hazard = {
  id: string;
  icon: string;
  label: string;
  category: string;
  advice: string;
  ai_disclosure: boolean;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "running" | "hit" | "done";

const POOL = HAZARDS as Hazard[];

// Positions are percentages of the play area's width
const START_X = 100;
const CHAR_X = 20;
const EXIT_X = -14;
const SPEED = 28; // %/second — slow and constant (no ramp-up)
const JUMP_MS = 800; // airborne window; generous so timing needn't be precise

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const starsFor = (ratio: number) => (ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1);

export default function G7CyberRunner({ onFinish, logEvent }: Props) {
  const hazards = useMemo(() => shuffle(POOL), []);

  const [hazardX, setHazardX] = useState(START_X);
  const [currentHazard, setCurrentHazard] = useState<Hazard>(hazards[0]);
  const [cleared, setCleared] = useState(0);
  const [phase, setPhase] = useState<Phase>("running");
  const [hitHazard, setHitHazard] = useState<Hazard | null>(null);
  const [isJumping, setIsJumping] = useState(false);

  // Mutable game state read inside the rAF loop (avoids stale closures)
  const idxRef = useRef(0);
  const xRef = useRef(START_X);
  const resolvedRef = useRef(false);
  const jumpingRef = useRef(false);
  const pausedRef = useRef(false);
  const doneRef = useRef(false);
  const clearedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);

  // Keep prop callbacks fresh without making them loop-effect deps
  const onFinishRef = useRef(onFinish);
  const logRef = useRef(logEvent);
  useEffect(() => {
    onFinishRef.current = onFinish;
    logRef.current = logEvent;
  });

  const finishGame = () => {
    doneRef.current = true;
    const stars = starsFor(clearedRef.current / hazards.length);
    logRef.current("game_complete", { game_id: "g7", stars, cleared: clearedRef.current });
    setPhase("done");
    onFinishRef.current(stars);
  };

  const advanceTo = (nextIdx: number) => {
    idxRef.current = nextIdx;
    xRef.current = START_X;
    resolvedRef.current = false;
    setCurrentHazard(hazards[nextIdx]);
    setHazardX(START_X);
  };

  // Master run loop — starts on mount, cleans up on unmount
  useEffect(() => {
    logRef.current("game_start", { game_id: "g7" });
    idxRef.current = 0;
    xRef.current = START_X;
    resolvedRef.current = false;
    pausedRef.current = false;
    doneRef.current = false;
    clearedRef.current = 0;
    lastRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;

      if (pausedRef.current || doneRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const x = xRef.current - SPEED * dt;
      xRef.current = x;
      const hz = hazards[idxRef.current];

      // Collision checkpoint: hazard reaches the character
      if (!resolvedRef.current && x <= CHAR_X) {
        resolvedRef.current = true;
        if (jumpingRef.current) {
          clearedRef.current += 1;
          setCleared(clearedRef.current);
          logRef.current("hazard_clear", { game_id: "g7", hazard_id: hz.id, first_try: true });
        } else {
          pausedRef.current = true;
          logRef.current("hazard_hit", { game_id: "g7", hazard_id: hz.id });
          setHitHazard(hz);
          setPhase("hit");
          setHazardX(x);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      // Hazard has left the screen → next one, or finish
      if (x <= EXIT_X) {
        if (idxRef.current >= hazards.length - 1) {
          finishGame();
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        advanceTo(idxRef.current + 1);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setHazardX(x);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hazards]);

  const handleJump = () => {
    if (phase !== "running" || jumpingRef.current) return;
    jumpingRef.current = true;
    setIsJumping(true);
    logRef.current("jump", { game_id: "g7", hazard_id: currentHazard?.id });
    window.setTimeout(() => {
      jumpingRef.current = false;
      setIsJumping(false);
    }, JUMP_MS);
  };

  const handleResume = () => {
    setHitHazard(null);
    if (idxRef.current >= hazards.length - 1) {
      finishGame();
      return;
    }
    advanceTo(idxRef.current + 1);
    setPhase("running");
    pausedRef.current = false;
  };

  if (phase === "done") {
    return (
      <div className="flex flex-col flex-1 min-h-0 justify-center items-center gap-4 p-6 text-center">
        <div className="text-[clamp(45px,13.91vw,64px)] leading-none">🏁</div>
        <h2 className="text-[clamp(17px,5.22vw,24px)] font-bold text-[var(--primary-dark)]">ถึงเส้นชัยแล้ว!</h2>
        <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--text-secondary)]">
          ข้ามภัยได้ {cleared}/{hazards.length} — กำลังสรุปผล...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <style>{`
        @keyframes g7jump {
          0% { transform: translateY(0); }
          45%, 55% { transform: translateY(-110px); }
          100% { transform: translateY(0); }
        }
        .g7-jump { animation: g7jump ${JUMP_MS}ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          @keyframes g7jump {
            0% { transform: translateY(0); }
            45%, 55% { transform: translateY(-64px); }
            100% { transform: translateY(0); }
          }
        }
      `}</style>

      {/* Status bar */}
      <div className="flex justify-between items-center px-1 py-2 shrink-0">
        <span className="flex items-center gap-1.5 text-[clamp(11px,3.48vw,16px)] font-bold text-[var(--primary-dark)]">
          <Shield size={18} /> แต้มความมั่นใจ {cleared}
        </span>
        <span className="text-[clamp(11px,3.48vw,16px)] font-bold text-[var(--text-secondary)]">
          ภัยที่ข้าม {cleared}/{hazards.length}
        </span>
      </div>

      {/* Play area */}
      <div
        onPointerDown={handleJump}
        role="button"
        tabIndex={0}
        aria-label="แตะเพื่อกระโดด"
        className="relative flex-1 min-h-0 overflow-hidden rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-gradient-to-b from-[var(--primary-light)] to-[var(--bg-app)] select-none cursor-pointer"
      >
        {/* Hazard */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${hazardX}%`, bottom: "18%", transform: "translateX(-50%)" }}
        >
          <span className="text-[clamp(39px,12.17vw,56px)] leading-none" aria-hidden="true">
            {currentHazard.icon}
          </span>
          <span className="mt-1 text-[clamp(9px,2.83vw,13px)] font-bold px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--accent-error)] text-white whitespace-nowrap">
            {currentHazard.label}
          </span>
        </div>

        {/* Character */}
        <div
          className="absolute"
          style={{ left: `${CHAR_X}%`, bottom: "18%", transform: "translateX(-50%)" }}
        >
          <span
            className={`inline-block text-[clamp(36px,11.3vw,52px)] leading-none ${isJumping ? "g7-jump" : ""}`}
            aria-hidden="true"
          >
            🧓
          </span>
        </div>

        {/* Ground */}
        <div className="absolute left-0 right-0" style={{ bottom: "17%" }}>
          <div className="h-[3px] bg-[var(--primary-dark)] opacity-40" />
        </div>

        {/* Control hint */}
        <div className="absolute left-0 right-0 bottom-3 text-center">
          <span className="text-[clamp(10px,3.26vw,15px)] font-semibold text-[var(--text-secondary)] bg-[var(--bg-card)]/70 px-3 py-1 rounded-[var(--radius-pill)]">
            แตะที่ใดก็ได้เพื่อกระโดด 👆
          </span>
        </div>

        {/* Hit teaching card */}
        {phase === "hit" && hitHazard && (
          <div className="absolute inset-0 bg-slate-900/55 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] rounded-[var(--radius-xl)] w-full max-w-sm p-5 shadow-[var(--shadow-lg)] text-center [animation:fadeIn_0.3s_ease-out]">
              <div className="text-[clamp(31px,9.57vw,44px)] leading-none mb-1">{hitHazard.icon}</div>
              <p className="text-[clamp(10px,3.26vw,15px)] font-bold text-[var(--accent-error)] mb-2">
                ชน! {hitHazard.label}
              </p>
              <div className="premium-card bg-[var(--primary-light)] p-3.5 text-left mb-4">
                <strong className="text-[clamp(11px,3.48vw,16px)] block mb-1 text-[var(--primary-dark)]">
                  วิธีรับมือ:
                </strong>
                <p className="text-[clamp(12px,3.7vw,17px)] text-[var(--text-primary)] leading-relaxed">
                  {hitHazard.advice}
                </p>
              </div>
              <button
                onClick={handleResume}
                className="btn btn-primary text-[clamp(14px,4.35vw,20px)] min-h-[60px] w-full"
              >
                <span>เข้าใจแล้ว วิ่งต่อ</span>
                <ArrowRight size={22} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Positive footer note */}
      <p className="text-[clamp(9px,2.83vw,13px)] text-[var(--text-secondary)] text-center py-2 shrink-0 flex items-center justify-center gap-1">
        <CheckCircle2 size={14} className="text-[var(--accent-success)]" />
        ชนได้ ไม่มีแพ้ — ภัยออนไลน์คือสิ่งที่เรากระโดดข้าม ไม่เข้าไปยุ่ง
      </p>
    </div>
  );
}
