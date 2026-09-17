"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

/**
 * G14 — ยิงลูกแก้วรู้ทันสื่อ (Goosl Glass Marbles)
 *
 * WebGL 2D/3D physics minigame wrapper for Media Literacy.
 * Embeds /games/goosl-marbles/index.html via iframe and listens to postMessage
 * for game completion and stars evaluation.
 *
 * Spec: docs/gdd/design-g14.md
 */

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

export default function G14GooslMarbles({ onFinish, logEvent }: Props) {
  const [stars, setStars] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Log game start event
  useEffect(() => {
    logEvent?.("game_start", {
      game_id: "G14",
      renderer: "webgl-canvas",
      timestamp: new Date().toISOString(),
    });
  }, [logEvent]);

  // Handle postMessage events from the embedded game iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "GOOSL_FINISH") {
        const achievedStars = Math.max(0, Math.min(3, Number(event.data.stars ?? 0)));
        const finalScore = Number(event.data.score ?? 0);

        setStars(achievedStars);
        setIsFinished(true);

        logEvent?.("game_complete", {
          game_id: "G14",
          stars: achievedStars,
          score: finalScore,
          outcome: event.data.outcome ?? "unknown",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [logEvent]);

  const handleRestart = useCallback(() => {
    setStars(null);
    setIsFinished(false);
    if (iframeRef.current) {
      iframeRef.current.src = "/games/goosl-marbles/index.html?lang=th&t=" + Date.now();
    }
  }, []);

  const handleComplete = useCallback(() => {
    onFinish(stars ?? 1);
  }, [onFinish, stars]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-slate-900 text-white overflow-hidden select-none">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFinish(0)}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            title="ย้อนกลับ"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm md:text-base font-bold text-amber-400 leading-tight">
              G14 — ยิงลูกแก้วรู้ทันสื่อ
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              ยิงเคาะลูกแก้วข่าวปลอม 7 ลูกออกจากวงกลม
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>เริ่มใหม่</span>
          </button>
        </div>
      </div>

      {/* Embedded WebGL Game Engine */}
      <div className="flex-1 w-full relative">
        <iframe
          ref={iframeRef}
          src="/games/goosl-marbles/index.html?lang=th"
          className="w-full h-full border-0 block"
          title="Goosl Glass Marbles Game"
          allow="autoplay; gyroscope; accelerometer"
        />
      </div>

      {/* Result Overlay when Game Finished */}
      {isFinished && stars !== null && (
        <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-amber-400">สรุปผลการแข่งขัน</h2>

            <div className="text-4xl tracking-widest text-amber-300">
              {"★".repeat(stars)}
              <span className="text-slate-600">{"☆".repeat(3 - stars)}</span>
            </div>

            <p className="text-sm text-slate-300">
              {stars === 3 && "ยอดเยี่ยมมาก! คุณยิงเคาะข่าวปลอมออกจากวงความเชื่อได้อย่างแม่นยำ"}
              {stars === 2 && "เก่งมาก! คุณเอาชนะข่าวปลอมสำเร็จ"}
              {stars === 1 && "ผ่านการทดสอบ! ฝึกฝนเพิ่มเติมเพื่อสติรู้ทันสื่อที่แม่นยำขึ้น"}
              {stars === 0 && "พยายามอีกครั้ง! อย่าปล่อยให้สติของตนเองเข้าไปตกค้างในวงข่าวปลอม"}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-sm transition-colors"
              >
                เล่นอีกครั้ง
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors"
              >
                ส่งผลการเล่น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
