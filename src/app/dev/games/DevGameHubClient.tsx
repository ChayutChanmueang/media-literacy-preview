"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Star, Trash2, Play, Lock } from "lucide-react";

/**
 * Dev Game Hub UI (US-03-R4) — internal QA tool, not part of the elderly-facing flow.
 *
 * Access gate อยู่ที่ page.tsx (Server Component) — ไฟล์นี้เป็น UI อย่างเดียว
 * Games are rendered with mock onFinish/logEvent so a QA pass never writes to
 * action_logs or to the stored progress the research team reads.
 */

const G1FactCheck = dynamic(() => import("@/components/G1FactCheck"), { ssr: false });
const G2ScamSpotter = dynamic(() => import("@/components/G2ScamSpotter"), { ssr: false });
const G3AIOrNot = dynamic(() => import("@/components/G3AIOrNot"), { ssr: false });
const G4ShareOrNot = dynamic(() => import("@/components/G4ShareOrNot"), { ssr: false });
const G5DigitalShield = dynamic(() => import("@/components/G5DigitalShield"), { ssr: false });
const G6LineSimulation = dynamic(() => import("@/components/G6LineSimulation"), { ssr: false });
const G8RaftCrossing = dynamic(() => import("@/components/G8RaftCrossing"), { ssr: false });
const G9LinkInspector = dynamic(() => import("@/components/G9LinkInspector"), { ssr: false });
const G10WhoseApp = dynamic(() => import("@/components/G10WhoseApp"), { ssr: false });
const G7CyberRunner = dynamic(() => import("@/components/G7CyberRunner"), { ssr: false });
const G11StopTheFinger = dynamic(() => import("@/components/G11StopTheFinger"), { ssr: false });
const G13ScoopStacker = dynamic(() => import("@/components/G13ScoopStacker"), { ssr: false });
const G14GooslMarbles = dynamic(() => import("@/components/G14GooslMarbles"), { ssr: false });
const GP1PromptBuilder = dynamic(() => import("@/components/GP1PromptBuilder"), { ssr: false });
const GP2PromptBuilder = dynamic(() => import("@/components/GP2PromptBuilder"), { ssr: false });

type GameProps = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type GameStatus = "done" | "qa" | "prototype" | "planned";

const STATUS_META: Record<GameStatus, { label: string; className: string }> = {
  done: { label: "✅ เสร็จแล้ว", className: "bg-emerald-100 text-emerald-700" },
  qa: { label: "🔍 รอตรวจ QA", className: "bg-amber-100 text-amber-700" },
  prototype: { label: "🏗️ Prototype", className: "bg-violet-100 text-violet-700" },
  planned: { label: "⬜ ยังไม่พัฒนา", className: "bg-slate-100 text-slate-500" },
};

type GameEntry = {
  id: string;
  title: string;
  lesson: string;
  note: string;
  status: GameStatus;
  component: React.ComponentType<GameProps> | null;
  designDoc?: string;
};

const GAMES: GameEntry[] = [
  {
    id: "G1",
    title: "จริงหรือมั่ว?",
    lesson: "บทที่ 1 (topic-1)",
    note: "Fact-check quiz — 3 ตัวเลือก มีปุ่ม \"ไม่แน่ใจ\"",
    status: "done",
    component: G1FactCheck,
  },
  {
    id: "G2",
    title: "จับสัญญาณมิจ",
    lesson: "บทที่ 2 (topic-2)",
    note: "Spot the scam — แตะ hotspot ในภาพแคปหน้าจอ",
    status: "done",
    component: G2ScamSpotter,
  },
  {
    id: "G3",
    title: "AI หรือ ของจริง",
    lesson: "บทที่ 5 (topic-3)",
    note: "ตรวจ 6 โจทย์ขึ้นไป, จุดสังเกตเฉลย, ป้าย ai_disclosure",
    status: "qa",
    component: G3AIOrNot,
  },
  {
    id: "G5",
    title: "กางโล่กู้ชีพ",
    lesson: "บทที่ 4 (topic-5)",
    note: "ตรวจ single-action tap, สโลแกน, Confidence Bar, ไม่มี Game Over",
    status: "qa",
    component: G5DigitalShield,
    designDoc: "docs/gdd/design-g5.md",
  },
  {
    id: "G6",
    title: "จำลองแชทไลน์",
    lesson: "บทที่ 3 (topic-6)",
    note: "ตรวจครบ 3 สถานการณ์, Red Flag Hotspots, Hint, เบอร์ 1441 (ปรับใหญ่หลัง merge main)",
    status: "qa",
    component: G6LineSimulation,
    designDoc: "docs/gdd/design-g6.md",
  },
  {
    id: "G4",
    title: "แชร์ดีไหม?",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "ตรวจ 8 โจทย์ privacy, 3 ตัวเลือก, \"ไม่แน่ใจ\"=ได้คำชม, เฉลยผลกระทบ — กราฟิกชั่วคราวเป็น emoji",
    status: "prototype",
    component: G4ShareOrNot,
    designDoc: "docs/gdd/design-g4.md",
  },
  {
    id: "G7",
    title: "วิ่งสู้ภัยไซเบอร์",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "ตรวจ auto-runner แตะกระโดดหลบภัย 8 อัน, ชนได้ไม่แพ้ (การ์ดสอนใจ) — ตัวละคร/ภัยเป็น emoji",
    status: "prototype",
    component: G7CyberRunner,
    designDoc: "docs/gdd/design-g7.md",
  },
  {
    id: "G8",
    title: "กระโดดแพรู้ทันมิจ",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "ตรวจ 5 ด่าน, ห่วงยาง, เรือกู้ภัย, กล้องนิ่ง — กราฟิกชั่วคราวเป็น emoji/CSS",
    status: "prototype",
    component: G8RaftCrossing,
    designDoc: "docs/gdd/design-g8.md",
  },
  {
    id: "G9",
    title: "ลิงก์จี้หรือลิงก์จริง",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "ตรวจ 3 ด่าน (โพสต์→คอมเมนต์), ส่องลิงก์ไฮไลต์โดเมน, กฎ .go.th — จำลองโซเชียล ลิงก์กดไม่ออกจริง",
    status: "prototype",
    component: G9LinkInspector,
    designDoc: "docs/gdd/design-g9.md",
  },
  {
    id: "G10",
    title: "นี้แอปฉัน นั้นแอปใคร?",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "ตรวจ 5 ด่าน (ตาราง 2×2→3×2→3×3), แตะแอปดูที่มา/สิทธิ์ แล้วลบแอปปลอม — ไอคอน emoji ชั่วคราว",
    status: "prototype",
    component: G10WhoseApp,
    designDoc: "docs/gdd/design-g10.md",
  },
  {
    id: "G11",
    title: "หยุดนิ้ว! คิดก่อนกด",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "Motivation & Empowerment Action Game",
    status: "prototype",
    component: G11StopTheFinger,
  },
  {
    id: "G13",
    title: "ต่อไอติมฝึกสมอง",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "Catch & Stack — ลากโคนรับไอติมดี หลบไอติมร้าย ซ้อนหอสูง wobble ไม่ล้ม",
    status: "prototype",
    component: G13ScoopStacker,
    designDoc: "docs/gdd/design-g13.md",
  },
  {
    id: "G14",
    title: "ยิงลูกแก้วรู้ทันสื่อ",
    lesson: "ยังไม่ผูกบทเรียน (prototype)",
    note: "เกมยิงลูกแก้วเกาหลี (Goosl Glass Marbles) — ฟิสิกส์ WebGL 2D/3D เคาะข่าวปลอมออกจากวง",
    status: "prototype",
    component: G14GooslMarbles,
    designDoc: "docs/gdd/design-g14.md",
  },
  {
    id: "GP1",
    title: "ขอ AI ให้ถูกคำ",
    lesson: "ยังไม่ผูกบทเรียน (prototype นอก pipeline G-number)",
    note: "ลาก/แตะเติมคำสั่งขอภาพจาก AI 4 ช่อง — สอนใช้ AI เชิงบวก + ห้ามใส่ข้อมูลส่วนตัว",
    status: "prototype",
    component: GP1PromptBuilder,
    designDoc: "docs/gdd/prototype/design-ai-prompt-builder.md",
  },
  {
    id: "GP2",
    title: "ขอ AI ให้ถูกคำ (ลากลงกล่อง)",
    lesson: "ยังไม่ผูกบทเรียน (prototype นอก pipeline G-number)",
    note: "เนื้อหา/เฉลยเดียวกับ GP1 แต่เปลี่ยนกลไก — ลาก/แตะคำที่ใช่ลงกล่องวางคำเดียว ทำซ้ำ 4 รอบ",
    status: "prototype",
    component: GP2PromptBuilder,
    designDoc: "docs/gdd/prototype/design-ai-prompt-builder.md",
  },
];

type LoggedEvent = {
  seq: number;
  time: string;
  name: string;
  payload?: Record<string, unknown>;
};

export default function DevGameHubClient() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const [finishedStars, setFinishedStars] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);

  const activeGame = useMemo(
    () => GAMES.find((game) => game.id === activeId) ?? null,
    [activeId]
  );

  const logEvent = useCallback((name: string, payload?: Record<string, unknown>) => {
    console.log("[dev-hub]", name, payload ?? {});
    setEvents((prev) => [
      {
        seq: prev.length + 1,
        time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
        name,
        payload,
      },
      ...prev,
    ]);
  }, []);

  const handleFinish = useCallback(
    (stars: number) => {
      logEvent("onFinish (mock)", { stars });
      setFinishedStars(stars);
    },
    [logEvent]
  );

  const openGame = (game: GameEntry) => {
    setActiveId(game.id);
    setEvents([]);
    setFinishedStars(null);
    setRunKey((key) => key + 1);
  };

  const replay = () => {
    setFinishedStars(null);
    setEvents([]);
    setRunKey((key) => key + 1);
  };

  const backToList = () => {
    setActiveId(null);
    setFinishedStars(null);
  };

  if (activeGame && activeGame.component) {
    const GameComponent = activeGame.component;
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-slate-800 text-white shrink-0">
          <button
            onClick={backToList}
            className="flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1.5 rounded hover:bg-slate-700 cursor-pointer"
          >
            <ArrowLeft size={16} /> หน้ารวมเกม
          </button>
          <span className="text-sm font-bold">
            {activeGame.id} — {activeGame.title}
          </span>
          <button
            onClick={replay}
            className="text-sm font-semibold px-2.5 py-1.5 rounded hover:bg-slate-700 cursor-pointer"
          >
            เริ่มใหม่
          </button>
        </div>

        <div className="relative flex flex-col flex-1 min-h-0">
          <GameComponent key={runKey} onFinish={handleFinish} logEvent={logEvent} />

          {finishedStars !== null && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center p-6 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
                <p className="text-slate-500 text-[24px] mb-1">เกมเรียกใช้ onFinish แล้ว</p>
                <p className="text-[34px] font-bold mb-3">ได้ {finishedStars} ดาว</p>
                <div className="flex justify-center gap-2 mb-5">
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      size={44}
                      className={n <= finishedStars ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                    />
                  ))}
                </div>
                <p className="text-[22px] text-slate-500 mb-5">
                  โหมดทดสอบ — ไม่ได้บันทึกดาวหรือความคืบหน้าใดๆ ลงระบบจริง
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={replay}
                    className="flex-1 py-3.5 rounded-lg bg-[var(--primary)] text-white font-semibold text-[26px] cursor-pointer"
                  >
                    เล่นใหม่
                  </button>
                  <button
                    onClick={backToList}
                    className="flex-1 py-3.5 rounded-lg border border-slate-300 font-semibold text-[26px] cursor-pointer"
                  >
                    กลับหน้ารวมเกม
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <EventPanel events={events} onClear={() => setEvents([])} />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-5 gap-5">
      <header>
        <h2 className="text-xl font-bold text-slate-800">หน้ารวมเกมสำหรับทดสอบ</h2>
        <p className="text-sm text-slate-500 mt-1">
          เครื่องมือภายในทีม (US-03-R4) — เข้าเล่นเกมได้ทันทีโดยไม่ต้องผ่านหน้ายินยอม
          และ<strong>ไม่บันทึกข้อมูลใดๆ ลงระบบจริง</strong> event ทั้งหมดถูก mock ไว้ดูบนหน้าจอเท่านั้น
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((game) => {
          const available = game.component !== null;
          return (
            <button
              key={game.id}
              onClick={() => available && openGame(game)}
              disabled={!available}
              className={`text-left border rounded-xl p-4 transition ${
                available
                  ? "border-slate-200 bg-white hover:border-[var(--primary)] hover:shadow-sm cursor-pointer"
                  : "border-dashed border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800">
                  {game.id} — {game.title}
                </span>
                {available ? (
                  <Play size={18} className="text-[var(--primary)]" />
                ) : (
                  <Lock size={16} className="text-slate-400" />
                )}
              </div>
              <span
                className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1.5 ${STATUS_META[game.status].className}`}
              >
                {STATUS_META[game.status].label}
              </span>
              <p className="text-xs text-slate-500 mb-1">{game.lesson}</p>
              <p className="text-xs text-slate-600">{game.note}</p>
              {game.designDoc && (
                <p className="text-[11px] text-slate-400 mt-2 font-mono">{game.designDoc}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EventPanel({ events, onClear }: { events: LoggedEvent[]; onClear: () => void }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="shrink-0 border-t border-slate-700 bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setOpen((value) => !value)}
          className="text-sm font-semibold cursor-pointer"
        >
          Event log (mock) — {events.length} รายการ {open ? "▾" : "▸"}
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
        >
          <Trash2 size={14} /> ล้าง
        </button>
      </div>

      {open && (
        <div className="max-h-40 overflow-y-auto px-4 pb-3 font-mono text-[11px] leading-relaxed">
          {events.length === 0 ? (
            <p className="text-slate-500">ยังไม่มี event — ลองเล่นเกมเพื่อดูว่ายิง log ครบไหม</p>
          ) : (
            events.map((event) => (
              <div key={event.seq} className="border-b border-slate-800 py-1">
                <span className="text-slate-500">{event.time}</span>{" "}
                <span className="text-emerald-400">{event.name}</span>{" "}
                {event.payload && Object.keys(event.payload).length > 0 && (
                  <span className="text-slate-300">{JSON.stringify(event.payload)}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
