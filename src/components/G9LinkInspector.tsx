"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  BadgeCheck,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import ITEMS from "@/data/g9-link-items.json";

/**
 * G9 — ลิงก์จี้หรือลิงก์จริง (Real or Fake Link) — PROTOTYPE (design-g9.md)
 *
 * The post/comment cards imitate a generic social feed (no real brand logos or
 * colours). Links are strings only — nothing is ever a real <a href>, so a
 * mis-tap can never open a genuine malicious page.
 *
 * Teaching rule surfaced by "ส่องลิงก์": read the REGISTRABLE domain (owner_domain),
 * the part at the tail before the first "/". Government = .go.th, Thai company /
 * state-enterprise = .co.th. A long URL or a scary UUID path is NOT a red flag by
 * itself (see the pea.co.th item) — only the main domain decides.
 */

type LinkItem = {
  id: string;
  context: "post" | "comment";
  level: number;
  author: string;
  verified: boolean;
  sponsored?: boolean;
  time_ago?: string;
  author_badge?: string | null;
  parent_author?: string;
  parent_verified?: boolean;
  parent_post?: string;
  body: string;
  link_display: string;
  link_full: string;
  link_headline: string;
  owner_domain: string;
  is_safe: boolean;
  official_ref: string;
  red_flags: string[];
  explain: string;
  ai_disclosure: boolean;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "play" | "levelEnd";
type Verdict = "safe" | "fake";

const POOL = ITEMS as LinkItem[];
const ITEMS_PER_LEVEL = 5;

const LEVELS = [
  { level: 1, label: "ด่าน 1 · ฟีดโพสต์" },
  { level: 2, label: "ด่าน 2 · ช่องคอมเมนต์" },
  { level: 3, label: "ด่าน 3 · คอมเมนต์ (เนียนสุด)" },
];

const LEVEL_SUMMARIES = [
  "จำง่ายๆ: หน่วยงานรัฐไทยลงท้าย .go.th เท่านั้น ไม่มีขีดกลางมั่วๆ",
  "ในคอมเมนต์ก็มีลิงก์ล่อ — อย่ากดลิงก์แปลกที่ชวนให้ตื่นเต้นหรืออยากรู้",
  "URL ยาวหรือมีรหัสท้ายแปลกๆ ไม่ได้แปลว่าปลอม — ดูที่โดเมนหลักว่าลงท้าย .go.th / .co.th ของหน่วยงานจริงไหม",
];

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildRun = (): LinkItem[] =>
  LEVELS.flatMap((lvl) =>
    shuffle(POOL.filter((it) => it.level === lvl.level)).slice(0, ITEMS_PER_LEVEL)
  );

const hostnameOf = (display: string) => display.split("/")[0];

// ---- small presentational helpers ----

function Avatar({ emoji, size = 40 }: { emoji: string; size?: number }) {
  return (
    <span
      className="rounded-full bg-[var(--primary-light)] flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}

function AuthorBadge({ text }: { text: string }) {
  return (
    <span className="text-[clamp(8px,2.39vw,11px)] font-bold px-1.5 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary-dark)]">
      {text}
    </span>
  );
}

export default function G9LinkInspector({ onFinish, logEvent }: Props) {
  const items = useMemo(() => buildRun(), []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inspected, setInspected] = useState(false);
  const [selected, setSelected] = useState<Verdict | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("play");
  const [speaking, setSpeaking] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const startLogged = useRef(false);
  useEffect(() => {
    if (startLogged.current) return;
    startLogged.current = true;
    logEvent("game_start", { game_id: "g9", level: 1 });
  }, [logEvent]);

  const item = items[currentIdx];
  const levelIdx = Math.floor(currentIdx / ITEMS_PER_LEVEL);
  const itemInLevel = (currentIdx % ITEMS_PER_LEVEL) + 1;
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && (selected === "safe") === item.is_safe;
  const isLastOfLevel = itemInLevel === ITEMS_PER_LEVEL;
  const isLastItem = currentIdx === items.length - 1;

  const handleSpeak = (text: string) => {
    const synth = synthRef.current;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      logEvent("toggle_audio", { game_id: "g9", item_id: item.id, action: "mute" });
      return;
    }
    logEvent("toggle_audio", { game_id: "g9", item_id: item.id, action: "play" });
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  const handleInspect = () => {
    setInspected(true);
    logEvent("link_inspect", { game_id: "g9", item_id: item.id });
  };

  const handleJudge = (verdict: Verdict) => {
    setSelected(verdict);
    const correct = (verdict === "safe") === item.is_safe;
    if (correct) setCorrectCount((prev) => prev + 1);
    logEvent(correct ? "judge_correct" : "judge_wrong", {
      game_id: "g9",
      item_id: item.id,
      context: item.context,
      first_try: true,
    });
  };

  const resetForNext = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
    setInspected(false);
    setSelected(null);
  };

  const handleNext = () => {
    if (isLastItem) {
      const ratio = correctCount / items.length;
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      logEvent("game_complete", { game_id: "g9", stars, total_items: items.length });
      onFinish(stars);
      return;
    }
    if (isLastOfLevel) {
      logEvent("level_complete", { game_id: "g9", level: levelIdx + 1 });
      setPhase("levelEnd");
      return;
    }
    resetForNext();
    setCurrentIdx((idx) => idx + 1);
  };

  const handleContinueLevel = () => {
    resetForNext();
    setCurrentIdx((idx) => idx + 1);
    setPhase("play");
  };

  // ---- Level-complete interstitial ----
  if (phase === "levelEnd") {
    return (
      <div className="flex flex-col flex-1 min-h-0 justify-center items-center gap-5 p-6 text-center">
        <div className="text-[clamp(45px,13.91vw,64px)] leading-none">🎉</div>
        <h2 className="text-[clamp(17px,5.22vw,24px)] font-bold text-[var(--primary-dark)]">
          ผ่าน{LEVELS[levelIdx].label}แล้ว!
        </h2>
        <div className="premium-card bg-[var(--primary-light)] p-4 max-w-sm">
          <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--text-primary)] leading-relaxed">
            💡 {LEVEL_SUMMARIES[levelIdx]}
          </p>
        </div>
        <button onClick={handleContinueLevel} className="btn btn-primary text-[clamp(15px,4.78vw,22px)] min-h-[64px] w-full max-w-sm">
          <span>ไปด่านต่อไป</span>
          <ArrowRight size={24} />
        </button>
      </div>
    );
  }

  // ---- Reusable link area (posted URL + FB-style preview card + inspect reveal) ----
  const linkArea = (
    <>
      <p className="text-[clamp(10px,3.26vw,15px)] text-[var(--primary)] font-semibold break-all mt-1 mb-2">
        https://{item.link_display}
      </p>
      <div className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="h-14 bg-[var(--primary-light)] flex items-center justify-center text-[clamp(18px,5.65vw,26px)]">
          🔗
        </div>
        <div className="bg-[var(--bg-app)] px-3 py-2">
          <div className="text-[clamp(8px,2.39vw,11px)] text-[var(--text-secondary)] tracking-wide uppercase break-all">
            {hostnameOf(item.link_display)}
          </div>
          <div className="text-[clamp(11px,3.48vw,16px)] font-bold leading-tight">{item.link_headline}</div>
        </div>
      </div>

      {inspected && (
        <div className="mt-2 border-2 border-[var(--primary)] rounded-[var(--radius-lg)] p-3 bg-[var(--bg-app)] [animation:fadeIn_0.3s_ease-out]">
          <p className="text-[clamp(9px,2.83vw,13px)] text-[var(--text-secondary)] mb-1">
            ลิงก์เต็ม (จำลอง — กดไม่ออกเว็บจริง):
          </p>
          <p className="text-[clamp(10px,3.26vw,15px)] break-all text-[var(--text-primary)] mb-2">{item.link_full}</p>
          <p className="text-[clamp(9px,2.83vw,13px)] text-[var(--text-secondary)] mb-1">
            🔎 ชื่อเว็บตัวจริง (โดเมนหลักที่เว็บนี้เป็นเจ้าของ):
          </p>
          <span className="inline-block text-[clamp(13px,3.91vw,18px)] font-bold px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--primary-light)] text-[var(--primary-dark)] break-all">
            {item.owner_domain}
          </span>
          <p className="text-[clamp(9px,2.83vw,13px)] text-[var(--text-secondary)] mt-2 leading-relaxed">
            💡 ดูที่โดเมนหลักว่าลงท้ายด้วยอะไร — รัฐไทยลงท้าย <strong>.go.th</strong>,
            บริษัท/รัฐวิสาหกิจไทยลงท้าย <strong>.co.th</strong> (ลิงก์ยาวหรือมีรหัสท้ายไม่ได้แปลว่าปลอม)
          </p>
        </div>
      )}
    </>
  );

  // ---- Main play screen ----
  return (
    <div className="flex flex-col flex-1 min-h-0 justify-between">
      <div className="scroll-region flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-center gap-2">
          <span className="text-[clamp(10px,3.26vw,15px)] font-bold text-[var(--primary-dark)]">
            {LEVELS[levelIdx].label} · ข้อ {itemInLevel}/{ITEMS_PER_LEVEL}
          </span>
          <button
            onClick={() => handleSpeak(isAnswered ? item.explain : item.body)}
            className={`px-3 py-2 rounded-[var(--radius-pill)] border-2 border-[var(--primary)] text-[var(--primary-dark)] cursor-pointer flex items-center gap-1.5 text-[clamp(10px,3.26vw,15px)] font-bold min-h-[44px] ${
              speaking ? "bg-[var(--primary-light)]" : "bg-[var(--bg-app)]"
            }`}
          >
            {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>เสียงอ่าน</span>
          </button>
        </div>

        {item.context === "post" ? (
          /* ---------- POST layout ---------- */
          <div className="premium-card bg-[var(--bg-card)] p-4 text-left">
            <div className="flex items-center gap-2.5 mb-2.5">
              <Avatar emoji="📢" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[clamp(11px,3.48vw,16px)] font-bold truncate">{item.author}</span>
                  {item.verified && (
                    <BadgeCheck size={16} className="text-[var(--primary)] shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[clamp(8px,2.61vw,12px)] text-[var(--text-secondary)]">
                  <span>{item.sponsored ? "ได้รับการสนับสนุน" : item.time_ago}</span>
                  <span>·</span>
                  <Globe size={12} />
                </div>
              </div>
            </div>
            <p className="text-[clamp(13px,4.13vw,19px)] leading-snug mb-1">{item.body}</p>
            {linkArea}
          </div>
        ) : (
          /* ---------- COMMENT layout ---------- */
          <div className="premium-card bg-[var(--bg-card)] p-4 text-left">
            {/* parent post (condensed) */}
            <div className="flex items-center gap-2.5 mb-2">
              <Avatar emoji="🧑" size={36} />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[clamp(10px,3.26vw,15px)] font-bold truncate">{item.parent_author}</span>
                  {item.parent_verified && (
                    <BadgeCheck size={14} className="text-[var(--primary)] shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[clamp(8px,2.61vw,12px)] text-[var(--text-secondary)]">
                  <span>โพสต์</span>
                  <span>·</span>
                  <Globe size={12} />
                </div>
              </div>
            </div>
            <p className="text-[clamp(11px,3.48vw,16px)] leading-snug text-[var(--text-primary)] mb-2">
              {item.parent_post}
            </p>

            {/* engagement bar (decorative, static) */}
            <div className="flex justify-between items-center text-[clamp(8px,2.61vw,12px)] text-[var(--text-secondary)] border-t border-[var(--border)] pt-2">
              <span>👍❤️😆 1.2 พัน</span>
              <span>ความคิดเห็น · แชร์</span>
            </div>
            <div className="flex justify-around text-[clamp(9px,2.83vw,13px)] text-[var(--text-secondary)] font-semibold border-y border-[var(--border)] my-2 py-1.5">
              <span className="flex items-center gap-1"><ThumbsUp size={15} /> ถูกใจ</span>
              <span className="flex items-center gap-1"><MessageCircle size={15} /> แสดงความคิดเห็น</span>
              <span className="flex items-center gap-1"><Share2 size={15} /> แชร์</span>
            </div>
            <div className="text-[clamp(9px,2.83vw,13px)] font-bold text-[var(--text-secondary)] mb-2">
              ความคิดเห็นทั้งหมด ▾
            </div>

            {/* the comment being judged */}
            <div className="flex gap-2">
              <Avatar emoji="👤" size={36} />
              <div className="flex-1 min-w-0">
                <div className="bg-[var(--bg-app)] rounded-[var(--radius-lg)] px-3 py-2">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-[clamp(10px,3.26vw,15px)] font-bold">{item.author}</span>
                    {item.verified && (
                      <BadgeCheck size={14} className="text-[var(--primary)]" />
                    )}
                    {item.author_badge && <AuthorBadge text={item.author_badge} />}
                    <span className="text-[clamp(8px,2.61vw,12px)] text-[var(--text-secondary)]">
                      · {item.time_ago}
                    </span>
                  </div>
                  <p className="text-[clamp(13px,3.91vw,18px)] leading-snug">{item.body}</p>
                </div>
                {linkArea}
                <div className="flex gap-4 text-[clamp(9px,2.83vw,13px)] font-semibold text-[var(--text-secondary)] mt-1 px-1">
                  <span>ถูกใจ</span>
                  <span>ตอบกลับ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isAnswered ? (
          <div className="flex flex-col gap-3">
            {!inspected && (
              <button
                onClick={handleInspect}
                className="btn btn-outline text-[clamp(14px,4.35vw,20px)] min-h-[56px] border-[var(--primary)] text-[var(--primary)]"
              >
                <Search size={22} /> ส่องลิงก์ก่อน
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => handleJudge("safe")}
                className="btn btn-outline flex-1 text-[clamp(14px,4.35vw,20px)] min-h-[64px] border-[var(--accent-success)] text-[var(--accent-success)]"
              >
                ✓ ลิงก์ทางการ
              </button>
              <button
                onClick={() => handleJudge("fake")}
                className="btn btn-outline flex-1 text-[clamp(14px,4.35vw,20px)] min-h-[64px] border-[var(--accent-error)] text-[var(--accent-error)]"
              >
                ✗ ลิงก์ปลอม
              </button>
            </div>
          </div>
        ) : (
          <div className="[animation:fadeIn_0.3s_ease-out]">
            <div
              className={`flex items-center gap-3 justify-center mb-3 ${
                isCorrect ? "text-[var(--accent-success)]" : "text-[var(--accent-error)]"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 size={28} />
                  <strong className="text-[clamp(15px,4.78vw,22px)]">ถูกต้อง!</strong>
                </>
              ) : (
                <>
                  <AlertTriangle size={28} />
                  <strong className="text-[clamp(15px,4.78vw,22px)]">ยังไม่ถูกนะ มาดูกัน</strong>
                </>
              )}
            </div>

            <div className="premium-card bg-[var(--primary-light)] p-4 text-left">
              <strong className="text-[clamp(13px,3.91vw,18px)] block mb-1.5 text-[var(--primary-dark)]">
                {item.is_safe ? "✓ ลิงก์นี้เป็นของทางการ" : "✗ ลิงก์นี้เป็นของปลอม"}
              </strong>
              <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--text-primary)] leading-relaxed">
                {item.explain}
              </p>

              {item.red_flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.red_flags.map((flag) => (
                    <span
                      key={flag}
                      className="inline-flex items-center gap-1 text-[clamp(10px,3.04vw,14px)] font-bold px-2.5 py-1 rounded-[var(--radius-pill)] bg-[rgba(220,38,38,0.12)] text-[var(--accent-error)]"
                    >
                      ⚠️ {flag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[clamp(10px,3.26vw,15px)] text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border)] leading-relaxed">
                🏛️ {item.official_ref}
                {!item.is_safe && (
                  <>
                    {" "}วิธีปลอดภัยที่สุดคือ
                    <strong className="text-[var(--primary-dark)]">พิมพ์ชื่อเว็บทางการเองในเบราว์เซอร์</strong>{" "}
                    อย่ากดจากโพสต์/คอมเมนต์ หากถูกหลอกโทร{" "}
                    <strong className="text-[var(--primary-dark)]">1441</strong>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        className="btn btn-primary text-[clamp(15px,4.78vw,22px)] min-h-[64px] mt-4"
        disabled={!isAnswered}
      >
        <span>{isLastItem ? "เสร็จสิ้นบทเรียน" : isLastOfLevel ? "จบด่านนี้" : "ข้อถัดไป"}</span>
        <ArrowRight size={24} />
      </button>
    </div>
  );
}
