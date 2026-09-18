"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Home, RotateCcw, Trophy, X, SkipForward, FlaskConical } from "lucide-react";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import LeaderboardGamePicker from "@/components/LeaderboardGamePicker";
import { DEV_SKIP_ENABLED, useDevSkipHandler } from "@/lib/devSkip";
import pkg from "../../package.json";

interface AppLayoutProps {
  children: React.ReactNode;
  initialTheme: string;
  // ยังรับไว้จาก layout.tsx เพื่อคงกลไก font-size ฝั่ง server (data-size จาก cookie);
  // UI ปุ่มปรับขนาดถูกซ่อนตาม US-CF-01 จึงไม่ได้ใช้ค่านี้ใน component นี้แล้ว
  initialSize?: string;
}

// US-FLOW-02: progress bar แบบ flow-aware — เดินหน้าตามตำแหน่งจริงในสาย Flow (คลิป→เกม→…→แบบทดสอบหลังเรียน)
// เดิมคิดจาก route ล้วน (video=ค่าเดียว, game=ค่าเดียว) จึง (1) ค้างตอนเล่นเกม และ
// (2) ถอยหลังเมื่อ game→คลิปบทถัดไป (66%→55%). ลำดับด้านล่างทำให้แต่ละสเตปเพิ่มขึ้นเรื่อย ๆ
const FLOW_STEP_ORDER = [
  "video:topic-1", "game:topic-1",
  "video:topic-6", "game:topic-6",
  "video:topic-3", "game:topic-3",
];
const ONBOARD_PCT: Record<string, number> = { "/": 5, "/consent": 10, "/pretest": 15, "/lessons": 20 };
const FLOW_START = 22;
const STEP_W = (100 - FLOW_START) / FLOW_STEP_ORDER.length;

function flowStepIndex(pathname: string, lessonId?: string): number {
  const isVideo = pathname.includes("/video");
  const isGame = pathname.includes("/game");
  if ((!isVideo && !isGame) || !lessonId) return -1;
  return FLOW_STEP_ORDER.indexOf(`${isVideo ? "video" : "game"}:${lessonId}`);
}

export default function AppLayout({ children, initialTheme }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState(initialTheme);
  const [session, setSession] = useState<any>(null);
  const [appMode, setAppModeState] = useState<"normal" | "research">("normal"); // Dev-only toggle
  const [menuOpen, setMenuOpen] = useState(false); // US-CF-01B: navigation drawer
  const [pickerOpen, setPickerOpen] = useState(false); // US-CF-52: popup เลือกเกมดูกระดานคะแนน
  // US-FLOW-02: ตำแหน่งในสาย flow (จาก progress) + ความคืบหน้าภายในสเตปปัจจุบัน (ต่อโจทย์)
  const [flowMeta, setFlowMeta] = useState<{ lessonId?: string; mode?: string }>({});
  const [stepFraction, setStepFraction] = useState(0);
  const devSkip = useDevSkipHandler();

  // Sync state and run client-side reconciliation
  useEffect(() => {
    // The dev game hub (US-03-R4) must not create a session — testing a game should
    // leave no trace in the data the research team reads
    if (pathname.startsWith("/dev")) return;

    const initializedSession = progressService.getOrCreateSession();
    setSession(initializedSession);
    setAppModeState(progressService.getAppMode());

    // US-FLOW-02: อ่านตำแหน่งในสาย flow + รีเซ็ตความคืบหน้าภายในสเตปเมื่อเปลี่ยนหน้า
    const currentProgress = progressService.getProgress();
    setFlowMeta({ lessonId: currentProgress?.currentLessonId, mode: currentProgress?.learningMode });
    setStepFraction(0);

    // Theme is always purple regardless of province (retained for future use)
    // if (initializedSession?.location?.province) {
    //   let themeName = "teal";
    //   const province = initializedSession.location.province;
    //   if (province.includes("เชียงใหม่")) {
    //     themeName = "purple";
    //   } else if (province.includes("แพร่")) {
    //     themeName = "orange";
    //   } else if (province.includes("น่าน")) {
    //     themeName = "green";
    //   }
    //   setTheme(themeName);
    //   document.documentElement.setAttribute("data-theme", themeName);
    // }
    setTheme("purple");
    document.documentElement.setAttribute("data-theme", "purple");
  }, [pathname]);

  // US-FLOW-02: เกมยิง event 'flowStepProgress' (0..1) เมื่อไปโจทย์ถัดไป → interpolate ในสไลซ์ของสเตป
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      setStepFraction(Math.max(0, Math.min(1, Number(detail) || 0)));
    };
    window.addEventListener("flowStepProgress", handler);
    return () => window.removeEventListener("flowStepProgress", handler);
  }, []);

  const handleHeaderClick = () => {
    const initializedSession = progressService.getOrCreateSession();
    if (initializedSession?.consentGiven && initializedSession?.ageGroup) {
      router.push("/lessons");
    } else {
      router.push("/");
    }
  };

  const handleResetAll = () => {
    if (window.confirm("คุณต้องการรีเซ็ตข้อมูลและความคืบหน้าทั้งหมดใช่หรือไม่?")) {
      progressService.resetAll();
      loggingService.logEvent("reset_application_state");

      // Clear cookie size & theme
      document.cookie = "naplab_ml_size=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "naplab_ml_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "naplab_ml_progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      window.location.href = "/";
    }
  };

  // Dev-only: สลับโหมดปกติ/วิจัย — รีเซ็ตข้อมูลทั้งหมดแล้วพากลับหน้าแรกเสมอ เพื่อให้ dev
  // เห็น flow ของแต่ละโหมดตั้งแต่ต้น โดยไม่มีข้อมูลค้างจากโหมดก่อนหน้าปนกัน
  const handleToggleMode = () => {
    const nextMode = appMode === "research" ? "normal" : "research";
    const confirmMessage =
      nextMode === "research"
        ? "สลับเป็นโหมดวิจัยจะรีเซ็ตข้อมูลและความคืบหน้าทั้งหมด แล้วพากลับไปหน้าแรก ยืนยันหรือไม่?"
        : "สลับเป็นโหมดปกติจะรีเซ็ตข้อมูลและความคืบหน้าทั้งหมด แล้วพากลับไปหน้าแรก ยืนยันหรือไม่?";

    if (window.confirm(confirmMessage)) {
      progressService.resetAll();
      progressService.setAppMode(nextMode);
      loggingService.logEvent("dev_switch_app_mode", { to: nextMode });

      document.cookie = "naplab_ml_size=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "naplab_ml_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "naplab_ml_progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      window.location.href = "/";
    }
  };

  // US-CF-01B: ไปหน้าแรก (Start Menu / Landing) จาก drawer
  const handleGoHome = () => {
    setMenuOpen(false);
    loggingService.logEvent("nav_home_from_drawer");
    router.push("/");
  };

  // US-FLOW-02: progress bar แบบ flow-aware (ดูค่าคงที่ FLOW_STEP_ORDER ด้านบน)
  const getProgressPercentage = () => {
    if (pathname === "/certificate" || pathname === "/posttest" || pathname === "/lessons/complete") return 100;
    if (pathname.startsWith("/self-assessment/post")) return 100;
    if (pathname.startsWith("/self-assessment/pre")) return 12;
    if (pathname in ONBOARD_PCT) return ONBOARD_PCT[pathname];

    // US-CF-XX: หน้าคะแนน (/lessons/<id>/score) แทรกอยู่หลัง "เกม" ของบทนั้นเสมอ — แต่ตอนนี้
    // progress.currentLessonId ถูกอัปเดตเป็นบทถัดไปแล้วก่อนเข้าหน้านี้ (ดู game/page.tsx: goToScore
    // เกิดหลัง saveProgress) จึงต้องอ่าน lessonId จาก URL ตรงๆ แทนการพึ่ง flowMeta.lessonId
    const scoreMatch = pathname.match(/^\/lessons\/([^/]+)\/score$/);
    if (scoreMatch) {
      const fi = FLOW_STEP_ORDER.indexOf(`game:${scoreMatch[1]}`);
      if (fi !== -1) return FLOW_START + (fi + 1) * STEP_W;
    }

    const isVideo = pathname.includes("/video");
    const isGame = pathname.includes("/game") || pathname.includes("/score");

    // สาย Flow: base ตามตำแหน่งจริงในลำดับ + interpolate ต่อโจทย์ในสไลซ์เดียวกัน (monotonic)
    if (flowMeta.mode === "flow") {
      const fi = flowStepIndex(pathname, flowMeta.lessonId);
      if (fi !== -1) return FLOW_START + fi * STEP_W + stepFraction * STEP_W;
    }

    // Manual / นอกลำดับ flow: ค่าเพิ่มขึ้นตามสเตปในบท (คลิป < เกม) เกมขยับต่อโจทย์ด้วย
    if (isVideo) return FLOW_START;
    if (isGame) return FLOW_START + STEP_W + stepFraction * STEP_W;
    return ONBOARD_PCT["/lessons"];
  };

  // Do not show standard header layout on facilitator screens (US-LEAD-01)
  const isFacilitator = pathname.startsWith("/facilitator");

  if (isFacilitator) {
    return <div className="w-full min-h-screen flex flex-col bg-[#0f172a] text-[#f8fafc]">{children}</div>;
  }

  // Dev game hub (US-03-R4) is an internal QA tool — skip the learner chrome so the
  // progress bar never implies a lesson is in progress while testing games
  if (pathname.startsWith("/dev")) {
    return <div id="root-container">{children}</div>;
  }

  // หน้าแรก (Landing) เป็นเหมือนหน้าเริ่มต้น/สแปลชของแอป — ยังไม่มีการนำทางใด ๆ
  // จึงซ่อน top bar (☰ + โลโก้) และแถบ progress ทั้งหมด
  const isLanding = pathname === "/";

  return (
    <div id="root-container">
      {!isLanding && (
        <>
          {/* Header bar — ☰ (เปิด drawer) + โลโก้ (US-CF-01B; ปุ่มรีเซ็ตย้ายเข้า drawer) */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-card)] z-10 shrink-0 select-none">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="เปิดเมนู"
              className="p-1.5 -ml-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-app)] cursor-pointer"
            >
              <Menu size={26} />
            </button>
            <div
              onClick={handleHeaderClick}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-[22px] text-[var(--primary)]">รู้ทันสื่อ</span>
            </div>

            {/* Dev-only: ข้ามขั้นตอนปัจจุบัน — แสดงเฉพาะหน้าที่ลงทะเบียนผ่าน useDevSkip */}
            {DEV_SKIP_ENABLED && devSkip && (
              <button
                type="button"
                onClick={() => {
                  loggingService.logEvent("dev_skip_step", { pathname });
                  devSkip();
                }}
                data-dev-only="step-skip"
                aria-label="ข้ามขั้นตอนนี้ (สำหรับนักพัฒนา)"
                className="ml-auto flex items-center gap-1 rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 px-2.5 py-1 text-[16px] font-bold text-amber-700 cursor-pointer"
              >
                <SkipForward size={18} aria-hidden="true" />
                DEV ข้าม
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-[var(--bg-card)] shrink-0">
            <div className="progress-bar-container rounded-none h-1.5">
              <div className="progress-bar-fill" style={{ width: `${getProgressPercentage()}%` }}></div>
            </div>
          </div>
        </>
      )}

      {/* Main Screen Panel */}
      <div className="flex-1 min-h-0 flex flex-col">
        {children}
      </div>

      {/* US-CF-01B: Navigation drawer — ☰ เปิดเมนูสไลด์จากซ้าย + overlay */}
      <div
        className={`fixed inset-0 z-50 ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        {/* Overlay คลุมพื้นหลัง — แตะเพื่อปิด */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />

        {/* แผงเมนู */}
        <div
          role="dialog"
          aria-label="เมนู"
          className={`absolute left-0 top-0 h-full w-[78%] max-w-[300px] bg-[var(--bg-card)] shadow-[var(--shadow-lg)] flex flex-col transition-transform duration-200 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[18px] text-[var(--primary)]">รู้ทันสื่อ</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="ปิดเมนู"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-app)] cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-2">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-3 min-h-14 px-4 rounded-xl text-[17px] font-bold text-[var(--text-primary)] hover:bg-[var(--primary-light)] cursor-pointer text-left"
            >
              <Home size={24} className="text-[var(--primary)] shrink-0" />
              <span>ไปหน้าแรก</span>
            </button>
            {appMode !== "research" && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  loggingService.logEvent("nav_leaderboard_from_drawer");
                  setPickerOpen(true);
                }}
                className="flex items-center gap-3 min-h-14 px-4 rounded-xl text-[17px] font-bold text-[var(--text-primary)] hover:bg-[var(--primary-light)] cursor-pointer text-left"
              >
                <Trophy size={24} className="text-[var(--primary)] shrink-0" />
                <span>กระดานคะแนน</span>
              </button>
            )}
            {DEV_SKIP_ENABLED && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleToggleMode();
                }}
                data-dev-only="mode-toggle"
                className="flex items-center gap-3 min-h-14 px-4 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 text-[17px] font-bold text-amber-700 hover:bg-amber-100 cursor-pointer text-left"
              >
                <FlaskConical size={24} className="shrink-0" />
                <span>
                  โหมด: {appMode === "research" ? "วิจัย" : "ปกติ"} (DEV แตะเพื่อสลับเป็น
                  {appMode === "research" ? "ปกติ" : "วิจัย"})
                </span>
              </button>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleResetAll();
              }}
              className="flex items-center gap-3 min-h-14 px-4 rounded-xl text-[17px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] cursor-pointer text-left"
            >
              <RotateCcw size={24} className="shrink-0" />
              <span>รีเซ็ตข้อมูล</span>
            </button>
          </nav>

          {/* เลขเวอร์ชันแอป — ล่างสุดของ drawer */}
          <div className="mt-auto px-4 py-3 border-t border-[var(--border)] text-[15px] text-[var(--text-secondary)]">
            เวอร์ชัน {pkg.version}
          </div>
        </div>
      </div>

      {/* US-CF-52: popup เลือกเกมดูกระดานคะแนน (เปิดจากปุ่มใน drawer) */}
      <LeaderboardGamePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
