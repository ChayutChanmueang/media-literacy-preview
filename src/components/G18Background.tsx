import React from "react";

/**
 * G18 play-screen background, from the team's game-background.html mock: soft blue-grey gradient,
 * faint white/grey facet triangles, small glossy shapes bobbing in place, and four corner props
 * (ring, headphones, card stack, game controller) in the pads' red/yellow/green/blue.
 *
 * Purely decorative (aria-hidden, no pointer events). Fills its nearest positioned ancestor and sits
 * behind it (-z-10, so the parent needs `relative isolate`). Sizes follow the box, not the window —
 * see .g18-bg in globals.css. SVG ids are prefixed g18- so they cannot clash with the rest of the page.
 */

type Shape = {
  sym: "tri" | "dot" | "star" | "shard";
  color: "blue" | "red" | "green" | "yellow";
  sz: number;
  pos: React.CSSProperties;
  /** hidden on short landscape screens, like the mock */
  wide?: boolean;
  twinkle?: boolean;
};

const SHAPES: Shape[] = [
  { sym: "tri", color: "blue", sz: 64, pos: { left: "21%", top: "16%", rotate: "90deg" } },
  { sym: "star", color: "yellow", sz: 46, pos: { left: "6%", top: "25%", animationDelay: "-3s" } },
  { sym: "tri", color: "red", sz: 80, pos: { left: "3%", top: "40%", rotate: "-70deg", animationDelay: "-2s" }, wide: true },
  { sym: "tri", color: "green", sz: 54, pos: { right: "7%", top: "35%", rotate: "15deg", animationDelay: "-4s" } },
  { sym: "dot", color: "blue", sz: 42, pos: { right: "5%", top: "57%", animationDelay: "-5s" } },
  { sym: "dot", color: "green", sz: 42, pos: { left: "5%", top: "63%", animationDelay: "-1.5s" } },
  { sym: "dot", color: "red", sz: 42, pos: { left: "27%", top: "83%", animationDelay: "-3.5s" }, wide: true },
  { sym: "dot", color: "yellow", sz: 40, pos: { right: "4%", top: "72%", animationDelay: "-2.5s" } },
  { sym: "star", color: "yellow", sz: 96, pos: { right: "25%", top: "86%", animationDelay: "-6s" }, wide: true, twinkle: true },
  { sym: "tri", color: "blue", sz: 72, pos: { right: "20%", top: "77%", animationDelay: "-.5s" }, wide: true },
  { sym: "star", color: "yellow", sz: 50, pos: { right: "3%", top: "15%", animationDelay: "-2s" }, twinkle: true },
  { sym: "shard", color: "yellow", sz: 56, pos: { right: "11%", top: "17%", rotate: "8deg" } },
  { sym: "shard", color: "yellow", sz: 46, pos: { right: "17%", top: "13%", rotate: "35deg" } },
  { sym: "dot", color: "yellow", sz: 24, pos: { left: "7%", top: "53%", animationDelay: "-4.5s" } },
];

export default function G18Background() {
  return (
    <div className="g18-bg pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="g18-bg-scene">
        {/* shared gradients, filter and shape symbols */}
        <svg className="g18-bg-defs">
          <defs>
            <linearGradient id="g18-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b4cdfb" /><stop offset="1" stopColor="#3f7ae8" /></linearGradient>
            <linearGradient id="g18-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb3b3" /><stop offset="1" stopColor="#e94a4a" /></linearGradient>
            <linearGradient id="g18-green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b3f2c2" /><stop offset="1" stopColor="#34b85a" /></linearGradient>
            <linearGradient id="g18-yellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffec9e" /><stop offset="1" stopColor="#f5ae0c" /></linearGradient>
            <linearGradient id="g18-lav" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b3bbfb" /><stop offset="1" stopColor="#6674e2" /></linearGradient>
            <linearGradient id="g18-white" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d3dcf1" /></linearGradient>
            <linearGradient id="g18-cup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7aa5f7" /><stop offset="1" stopColor="#2c5ccc" /></linearGradient>
            <linearGradient id="g18-navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7f9fea" /><stop offset="1" stopColor="#3a549c" /></linearGradient>
            <linearGradient id="g18-navyd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#46629f" /><stop offset="1" stopColor="#222f5c" /></linearGradient>
            <radialGradient id="g18-shine" cx=".35" cy=".28" r=".7"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset=".55" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
            <filter id="g18-soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2d3f7a" floodOpacity=".3" /></filter>

            {/* rounded triangle (points up) */}
            <symbol id="g18-sym-tri" viewBox="0 0 100 100" overflow="visible">
              <polygon points="50,16 88,82 12,82" strokeWidth="14" strokeLinejoin="round" />
              <path d="M50 24 L22 74" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" fill="none" />
            </symbol>
            {/* glossy ball */}
            <symbol id="g18-sym-dot" viewBox="0 0 100 100" overflow="visible">
              <circle cx="50" cy="50" r="46" stroke="none" />
              <circle cx="50" cy="50" r="46" fill="url(#g18-shine)" stroke="none" />
              <ellipse cx="36" cy="28" rx="15" ry="8" fill="#fff" fillOpacity=".6" stroke="none" transform="rotate(-30 36 28)" />
            </symbol>
            {/* four-point sparkle */}
            <symbol id="g18-sym-star" viewBox="0 0 100 100" overflow="visible">
              <path d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4Z" strokeWidth="6" strokeLinejoin="round" />
              <path d="M50 14 C52 34 60 42 78 48" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" fill="none" />
            </symbol>
            {/* spark ray */}
            <symbol id="g18-sym-shard" viewBox="0 0 100 100" overflow="visible">
              <path d="M8 18 L94 42 L26 88Z" strokeWidth="8" strokeLinejoin="round" />
              <path d="M18 28 L70 42" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" fill="none" />
            </symbol>
          </defs>
        </svg>

        {/* soft faceted triangles */}
        <svg className="g18-bg-facets" viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMid slice">
          <g fill="#ffffff" opacity=".55">
            <polygon points="0,380 300,170 330,520" /><polygon points="1024,260 700,170 760,520" />
            <polygon points="0,900 230,650 330,1100" /><polygon points="1024,820 760,640 800,1060" />
            <polygon points="300,1536 560,1160 820,1536" />
          </g>
          <g fill="#c4cde4" opacity=".35">
            <polygon points="330,520 700,170 760,520" /><polygon points="330,1100 230,650 760,640" />
            <polygon points="0,1200 330,1100 220,1536" /><polygon points="1024,1150 800,1060 760,1536" />
          </g>
          <g fill="#ffffff" opacity=".35"><polygon points="540,0 1024,0 760,200" /><polygon points="0,0 400,0 200,260" /></g>
        </svg>

        {/* floating shapes */}
        {SHAPES.map((s, i) => (
          <svg
            key={i}
            className={`g18-bg-shape g18-bg-${s.color}${s.wide ? " g18-bg-wide" : ""}${s.twinkle ? " g18-bg-twinkle" : ""}`}
            style={{ "--sz": s.sz, ...s.pos } as React.CSSProperties}
          >
            <use href={`#g18-sym-${s.sym}`} width="100%" height="100%" />
          </svg>
        ))}

        {/* top-left ring */}
        <svg className="g18-bg-prop g18-bg-ring" viewBox="0 0 300 300">
          <circle cx="110" cy="110" r="112" fill="none" stroke="url(#g18-white)" strokeWidth="44" />
          <circle cx="110" cy="110" r="90" fill="none" stroke="url(#g18-blue)" strokeWidth="28" />
          <circle cx="110" cy="110" r="72" fill="none" stroke="#9fb2dc" strokeOpacity=".5" strokeWidth="3" />
          <path d="M25 79 A90 90 0 0 1 79 25" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="5" strokeLinecap="round" />
          <path d="M6 72 A112 112 0 0 1 72 6" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="5" strokeLinecap="round" />
        </svg>

        {/* headphones */}
        <svg className="g18-bg-prop g18-bg-phones g18-bg-wide" viewBox="0 0 200 320">
          <path d="M28 170 C20 60 110 8 215 34" fill="none" stroke="url(#g18-white)" strokeWidth="30" strokeLinecap="round" />
          <path d="M28 170 C20 62 110 16 215 40" fill="none" stroke="url(#g18-blue)" strokeWidth="12" strokeLinecap="round" />
          <path d="M30 128 C40 70 100 28 172 26" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="78" cy="192" rx="54" ry="70" fill="url(#g18-white)" />
          <ellipse cx="98" cy="192" rx="52" ry="66" fill="url(#g18-cup)" />
          <ellipse cx="110" cy="192" rx="36" ry="48" fill="#2a54bd" fillOpacity=".85" />
          <ellipse cx="110" cy="192" rx="36" ry="48" fill="none" stroke="#7fa6f4" strokeOpacity=".6" strokeWidth="3" />
          <ellipse cx="98" cy="192" rx="52" ry="66" fill="url(#g18-shine)" />
          <path d="M62 158 C66 140 80 128 96 126" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="6" strokeLinecap="round" />
          <use href="#g18-sym-star" className="g18-bg-yellow" x="112" y="170" width="76" height="76" />
        </svg>

        {/* card stack */}
        <svg className="g18-bg-prop g18-bg-cards" viewBox="0 0 260 260">
          <g transform="rotate(14 130 140)" filter="url(#g18-soft)"><rect x="50" y="80" width="150" height="140" rx="16" fill="url(#g18-yellow)" /></g>
          <g transform="rotate(8 130 140)" filter="url(#g18-soft)">
            <rect x="40" y="62" width="150" height="150" rx="16" fill="url(#g18-lav)" />
            <rect x="40" y="62" width="150" height="150" rx="16" fill="url(#g18-shine)" />
          </g>
          <g transform="rotate(-6 130 140)" filter="url(#g18-soft)">
            <rect x="22" y="48" width="150" height="150" rx="16" fill="url(#g18-white)" />
            <rect x="38" y="64" width="118" height="118" rx="10" fill="none" stroke="#c9cef4" strokeWidth="3" />
            <use href="#g18-sym-star" className="g18-bg-lav" x="56" y="82" width="82" height="82" />
          </g>
        </svg>

        {/* game controller */}
        <svg className="g18-bg-prop g18-bg-pad" viewBox="0 0 260 260">
          <path d="M20 198 C20 128 90 68 170 58 L240 68 L250 238 L90 258 C45 258 20 238 20 198Z" fill="url(#g18-navyd)" />
          <path d="M20 190 C20 120 90 60 170 50 L240 60 L250 230 L90 250 C45 250 20 230 20 190Z" fill="url(#g18-navy)" />
          <path d="M26 186 C28 126 92 70 170 57" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" />
          <rect x="150" y="28" width="52" height="16" rx="8" fill="url(#g18-navyd)" transform="rotate(12 176 36)" />
          <rect x="164" y="76" width="44" height="9" rx="4.5" fill="#1d2a55" fillOpacity=".7" transform="rotate(12 186 80)" />
          <ellipse cx="192" cy="130" rx="17" ry="6" fill="#1d2a55" fillOpacity=".35" />
          <circle cx="190" cy="120" r="17" className="g18-bg-red" />
          <circle cx="190" cy="120" r="17" fill="url(#g18-shine)" stroke="none" />
          <ellipse cx="234" cy="160" rx="17" ry="6" fill="#1d2a55" fillOpacity=".35" />
          <circle cx="232" cy="150" r="17" fill="url(#g18-blue)" stroke="none" />
          <circle cx="232" cy="150" r="17" fill="url(#g18-shine)" />
          <ellipse cx="152" cy="166" rx="17" ry="6" fill="#1d2a55" fillOpacity=".35" />
          <circle cx="150" cy="156" r="17" fill="url(#g18-yellow)" stroke="none" />
          <circle cx="150" cy="156" r="17" fill="url(#g18-shine)" />
          <ellipse cx="194" cy="196" rx="17" ry="6" fill="#1d2a55" fillOpacity=".35" />
          <circle cx="192" cy="186" r="17" fill="url(#g18-green)" stroke="none" />
          <circle cx="192" cy="186" r="17" fill="url(#g18-shine)" />
        </svg>
      </div>
    </div>
  );
}
