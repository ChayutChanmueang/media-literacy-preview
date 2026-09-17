"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, X } from "lucide-react";
import { loggingService } from "@/services/loggingService";

interface LeaderboardGamePickerProps {
  open: boolean;
  onClose: () => void;
}

interface BrowsableGame {
  gid: string;
  lessonId: string;
  name: string;
  icon: string | null;
}

type PickerStatus = "loading" | "ready" | "error";

/**
 * US-CF-52: popup เลือกเกมเพื่อเปิดกระดานคะแนนแบบ browse
 * ใช้ร่วมกันทั้งใน navigation drawer (AppLayout) และปุ่ม "เลือกเกม" บนหน้า leaderboard โหมด browse
 * รายชื่อ + ชื่อเกม โหลดจากฐานข้อมูลทั้งหมดผ่าน GET /api/leaderboard/games (ไม่มีชื่อ hardcode)
 */
export default function LeaderboardGamePicker({ open, onClose }: LeaderboardGamePickerProps) {
  const router = useRouter();
  const [games, setGames] = useState<BrowsableGame[]>([]);
  const [status, setStatus] = useState<PickerStatus>("loading");

  // โหลดรายชื่อเกม (ชื่อจริงจาก DB) ทุกครั้งที่เปิด popup
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    void (async () => {
      setStatus("loading");
      try {
        const res = await fetch("/api/leaderboard/games", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { games?: BrowsableGame[] };
        if (cancelled) return;
        setGames(Array.isArray(data.games) ? data.games : []);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const handleSelect = (lessonId: string, gid: string) => {
    loggingService.logEvent("leaderboard_browse_open", { game_id: gid });
    onClose();
    router.push(`/lessons/${lessonId}/leaderboard?view=browse`);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="เลือกเกมเพื่อดูกระดานคะแนน"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-[1] w-full max-w-sm rounded-[28px] border-2 border-[var(--primary)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy size={26} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <h2 className="text-[22px] font-bold text-[var(--primary-dark)]">เลือกเกมเพื่อแสดงกระดานคะแนน</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-app)]"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-3" aria-live="polite" aria-busy={status === "loading"}>
          {status === "loading" && (
            <div className="flex min-h-[72px] items-center justify-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-app)] px-4 py-3">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
              <span className="text-[20px] text-[var(--text-secondary)]">กำลังโหลดรายชื่อเกม...</span>
            </div>
          )}

          {status === "error" && (
            <p className="rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-app)] px-4 py-3 text-center text-[20px] text-[var(--text-secondary)]">
              โหลดรายชื่อเกมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
            </p>
          )}

          {status === "ready" && games.length === 0 && (
            <p className="rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-app)] px-4 py-3 text-center text-[20px] text-[var(--text-secondary)]">
              ยังไม่มีเกมที่แสดงกระดานคะแนนได้
            </p>
          )}

          {status === "ready" &&
            games.map((game) => (
              <button
                key={game.gid}
                type="button"
                onClick={() => handleSelect(game.lessonId, game.gid)}
                className="flex min-h-[72px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-app)] px-4 py-3 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-light)] active:bg-[var(--primary-light)]"
              >
                {game.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={game.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-12 w-12 shrink-0 object-contain"
                  />
                ) : null}
                <span className="text-[22px] font-bold text-[var(--text-primary)]">{game.name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
