"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fun-game end screen celebration (G13, G18–G20K), from the "Game Over – Ice Cream Tower" mock:
 * the trophy drops in over spinning rays with twinkles, the score counts up and pops, confetti bursts
 * from the trophy and from the number. Title / score line / buttons stagger in with the
 * `.result-pop` / `.result-rise` / `.result-actions` classes in globals.css.
 * Under prefers-reduced-motion: no confetti, the number shows at once, everything is in place.
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- confetti: one fixed canvas on <body>, made on the first burst and removed when the last piece is gone
// (on <body> so a transformed game root can't trap the position:fixed, and coordinates are plain client px)

type Piece = { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number; life: number; round: boolean };

const CONFETTI_COLORS = ["#ffd34d", "#ff7eb6", "#7fd8ff", "#b69cff", "#ffb36b", "#8ff0b2", "#ffffff"];
let pieces: Piece[] = [];
let canvas: HTMLCanvasElement | null = null;
let raf = 0;

function sizeCanvas() {
  if (!canvas) return;
  const d = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * d;
  canvas.height = window.innerHeight * d;
  canvas.getContext("2d")?.setTransform(d, 0, 0, d, 0, 0);
}

function stopConfetti() {
  cancelAnimationFrame(raf);
  raf = 0;
  pieces = [];
  window.removeEventListener("resize", sizeCanvas);
  canvas?.remove();
  canvas = null;
}

function drawConfetti() {
  const ctx = canvas?.getContext("2d");
  if (!ctx) return stopConfetti();
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  pieces = pieces.filter((p) => p.life > 0 && p.y < window.innerHeight + 30);
  for (const p of pieces) {
    p.vy += 0.32;
    p.vx *= 0.985;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.007;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    if (p.round) {
      ctx.beginPath();
      ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
    ctx.restore();
  }
  if (pieces.length) raf = requestAnimationFrame(drawConfetti);
  else stopConfetti();
}

function burstConfetti(x: number, y: number, n = 90) {
  if (prefersReducedMotion()) return;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
    document.body.appendChild(canvas);
    window.addEventListener("resize", sizeCanvas);
    sizeCanvas();
  }
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 4 + Math.random() * 9;
    pieces.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, r: 4 + Math.random() * 5,
      c: CONFETTI_COLORS[i % CONFETTI_COLORS.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      life: 1, round: Math.random() < 0.3,
    });
  }
  if (!raf) raf = requestAnimationFrame(drawConfetti);
}

// ---- trophy

const TROPHY_BURST_MS = 550; // as the trophy lands

const SPARKLES = [
  { top: "4%", left: "6%", size: 14, delay: 1.1 },
  { top: "18%", right: "0%", size: 20, delay: 1.6 },
  { top: "72%", left: "-2%", size: 11, delay: 2.1 },
  { top: "-2%", right: "22%", size: 11, delay: 2.6 },
];

/** lucide's Trophy (same paths and 2px stroke), with the cup and the stem/foot filled in the outline colour —
 *  the handles stay outlines. The stem is one closed shape here; lucide draws it as two open lines. */
function FilledTrophy() {
  return (
    <svg
      width={88}
      height={88}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#CA8A04]"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path
        d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22h10c0-1.76-.85-3.25-2.03-3.79C14.47 17.98 14 17.55 14 17v-2.34Z"
        fill="currentColor"
      />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="currentColor" />
    </svg>
  );
}

/** The trophy dropped in over spinning rays + twinkles, with a confetti burst. */
export function ResultTrophy() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) burstConfetti(r.left + r.width / 2, r.top + r.height / 2);
    }, TROPHY_BURST_MS);
    return () => {
      window.clearTimeout(t);
      stopConfetti();
    };
  }, []);

  return (
    <div ref={ref} className="relative grid shrink-0 place-items-center gp-size-120" aria-hidden="true">
      <div className="result-rays" />
      <div className="result-trophy">
        <FilledTrophy />
      </div>
      {SPARKLES.map((s, i) => (
        <i
          key={i}
          className="result-sparkle"
          style={{ top: s.top, left: s.left, right: s.right, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  );
}

// ---- score count-up

const COUNT_DELAY_MS = 1100; // after the score line has risen in
const COUNT_MS = 1500;

/** The score counting up from 0 (ease-out), then a pop + a small confetti burst from the number.
 *  Counts once per mount — the end screen remounts on every finished run. */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  const [hit, setHit] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return; // already showing `value`
    let frame = 0;
    const t0 = performance.now() + COUNT_DELAY_MS;
    const step = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / COUNT_MS));
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) frame = requestAnimationFrame(step);
      else {
        setHit(true);
        const r = ref.current?.getBoundingClientRect();
        if (r) burstConfetti(r.left + r.width / 2, r.top, 40);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span ref={ref} className={`inline-block tabular-nums ${hit ? "result-num-hit" : ""} ${className}`}>
      {/* screen readers get the final score, not every step */}
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
