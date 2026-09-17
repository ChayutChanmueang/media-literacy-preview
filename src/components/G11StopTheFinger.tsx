"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Check, X, ShieldAlert, Phone, ThumbsUp, AlertTriangle } from "lucide-react";
import ITEMS from "@/data/g11-finger-items.json";
import Button3D from "@/components/Button3D";

/**
 * G11 — หยุดนิ้ว! คิดก่อนกด (Stop the Finger) — PROTOTYPE
 *
 * Spec: docs/gdd/design-g11.md
 * Single-action game where a hand slowly rises towards a phone screen.
 * Player taps the hand to STOP it (for scams) or lets it press (for trustworthy info).
 */

type FingerItem = {
  id: string;
  type: "sms" | "line" | "news" | "social" | "gov";
  sender: string;
  content: string;
  action_button: string;
  safe_action: "stop" | "press";
  category: string;
  red_flags: string[];
  explain: string;
  hotline: string;
  ai_disclosure: boolean;
};

type Props = {
  onFinish: (stars: number) => void;
  logEvent: (event: string, payload?: Record<string, unknown>) => void;
};

type Phase = "intro" | "showing" | "rising" | "feedback" | "summary";

const POOL = ITEMS as FingerItem[];
const TOTAL_ROUNDS = 10;
const HAND_RISE_DURATION_MS = 10000; // ~10 seconds from bottom to button

const shuffle = <T,>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function G11StopTheFinger({ onFinish, logEvent }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [deck, setDeck] = useState<FingerItem[]>([]);
  
  const currentItem = deck[round];
  
  // Animation state
  const [handY, setHandY] = useState(120); // Percentage from bottom (starts off-screen)
  const [isHandRetracting, setIsHandRetracting] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  
  // Timers and Refs
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const itemStartTimeRef = useRef<number | null>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const targetYRef = useRef<number>(15);

  // Refs to avoid stale closures in animation frame
  const phaseRef = useRef<Phase>(phase);
  const currentItemRef = useRef<FingerItem | undefined>(currentItem);
  useEffect(() => {
    phaseRef.current = phase;
    currentItemRef.current = currentItem;
  }, [phase, currentItem]);

  // Result for the current round
  const [result, setResult] = useState<{
    correct: boolean;
    action: "stopped" | "pressed";
  } | null>(null);

  // Initialize deck on mount
  useEffect(() => {
    setDeck(shuffle(POOL).slice(0, TOTAL_ROUNDS));
    logEvent("game_start", { game_id: "g11" });
  }, [logEvent]);

  const stars = useMemo(() => {
    const accuracy = correctCount / TOTAL_ROUNDS;
    if (accuracy >= 0.8) return 3;
    if (accuracy >= 0.5) return 2;
    return 1;
  }, [correctCount]);

  // Clean up animation frames
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const showFeedback = useCallback((action: "stopped" | "pressed", correct: boolean) => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    const decisionTime = Date.now() - (itemStartTimeRef.current || 0);
    const item = currentItemRef.current;
    if (!item) return;
    
    logEvent("decision", {
      game_id: "g11",
      item_id: item.id,
      action,
      is_correct: correct,
      time_to_decide_ms: decisionTime
    });

    if (correct) setCorrectCount(c => c + 1);
    setResult({ action, correct });
    
    // Give time for animations (retract or press) to play before showing card
    setTimeout(() => {
      setPhase("feedback");
      logEvent("feedback_view", { game_id: "g11", item_id: item.id });
    }, 600);
  }, [logEvent]);

  const handleAutoPress = useCallback(() => {
    if (phaseRef.current !== "rising") return;
    
    setIsButtonPressed(true);
    const item = currentItemRef.current;
    if (!item) return;
    const isCorrect = item.safe_action === "press";
    showFeedback("pressed", isCorrect);
  }, [showFeedback]);

  const animateHand = useCallback((time: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = time;
      // Calculate target Y once at the start of the animation
      if (phoneRef.current && buttonRef.current) {
        const phoneRect = phoneRef.current.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const buttonCenterY = buttonRect.top - phoneRect.top + (buttonRect.height / 2);
        targetYRef.current = (buttonCenterY / phoneRect.height) * 100 - 5; // -5% offset for fingertip alignment
      }
    }
    const elapsed = time - startTimeRef.current;
    
    // Calculate position: 100% (bottom) to targetY
    const progress = Math.min(elapsed / HAND_RISE_DURATION_MS, 1);
    const currentY = 100 - (progress * (100 - targetYRef.current)); 
    
    setHandY(currentY);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animateHand);
    } else {
      // Hand reached the button!
      handleAutoPress();
    }
  }, [handleAutoPress]);

  const startRound = useCallback(() => {
    setPhase("showing");
    setHandY(120); // reset position
    setIsHandRetracting(false);
    setIsButtonPressed(false);
    setResult(null);
    itemStartTimeRef.current = Date.now();
    
    // Short delay before hand starts rising so user can orient themselves
    setTimeout(() => {
      setPhase("rising");
      startTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animateHand);
    }, 1000);
  }, [animateHand]);

  const handleStopTap = useCallback(() => {
    if (phaseRef.current !== "rising") return;
    
    // Stop the animation
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // Trigger retract animation
    setIsHandRetracting(true);
    setHandY(120); // send it back down
    
    const item = currentItemRef.current;
    if (!item) return;
    const isCorrect = item.safe_action === "stop";
    showFeedback("stopped", isCorrect);
  }, [showFeedback]);

  const nextRound = () => {
    const next = round + 1;
    if (next >= TOTAL_ROUNDS) {
      logEvent("game_complete", { game_id: "g11", score: correctCount, stars });
      setPhase("summary");
    } else {
      setRound(next);
      startRound();
    }
  };

  if (!currentItem) return null;

  return (
    <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-100/50 rounded-xl">
      
      {/* Intro Overlay */}
      {phase === "intro" && (
        <Overlay>
          <div className="text-center">
            <div className="text-6xl mb-4" aria-hidden>👇</div>
            <h2 className="text-[clamp(20px,6.09vw,28px)] font-bold mb-3 text-[var(--primary-dark)]">หยุดนิ้ว! คิดก่อนกด</h2>
            <p className="text-[clamp(13px,4.13vw,19px)] mb-6 leading-relaxed">
              เมื่อมีข้อความหรือข่าวสารส่งมาที่มือถือ จะมี <strong>&quot;นิ้ว&quot;</strong> ค่อยๆ เลื่อนขึ้นไปกด
            </p>
            <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left border border-slate-200">
              <ul className="space-y-3 text-[clamp(13px,3.91vw,18px)]">
                <li className="flex gap-2">
                  <span className="shrink-0 text-red-500">🛑</span> 
                  <span>ถ้าเป็นข้อมูลหลอกลวง <strong>ให้แตะที่มือ</strong> เพื่อหยุดนิ้ว</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-green-500">✅</span> 
                  <span>ถ้าเป็นข้อมูลที่เชื่อถือได้ <strong>ให้ปล่อยนิ้วกดไปเลย</strong></span>
                </li>
              </ul>
            </div>
            <Button3D onClick={startRound}>กดเพื่อเริ่ม</Button3D>
          </div>
        </Overlay>
      )}

      {/* Main Game Area (Phone + Hand) */}
      {(phase === "showing" || phase === "rising" || phase === "feedback") && (
        <div ref={phoneRef} className="relative w-full max-w-[320px] aspect-[9/19] flex-shrink-0">
          
          {/* Phone Mockup */}
          <div className="g11-phone-mockup w-full h-full p-4 pt-8">
            <div className="g11-phone-notch"></div>
            
            {/* Phone Header */}
            <div className="border-b border-slate-200 pb-3 mb-4 text-center mt-2">
              <p className="text-[clamp(10px,3.04vw,14px)] text-slate-500 font-semibold uppercase tracking-wider">{currentItem.type}</p>
              <p className="text-[clamp(13px,3.91vw,18px)] font-bold text-slate-800 truncate">{currentItem.sender}</p>
            </div>
            
            {/* Phone Content */}
            <div className="flex-1 overflow-y-auto pb-4">
              <div className={`p-4 rounded-2xl text-[clamp(13px,3.91vw,18px)] leading-relaxed shadow-sm ${
                currentItem.type === "line" || currentItem.type === "social" 
                  ? "bg-green-50 border border-green-100" 
                  : "bg-blue-50/50 border border-blue-100"
              }`}>
                {currentItem.content}
                
                {/* Action Button inside the message box */}
                <div 
                  ref={buttonRef}
                  className={`
                    mt-5 w-full py-3 rounded-xl text-center font-bold text-[clamp(13px,3.91vw,18px)] text-white
                    ${phase === "rising" ? "g11-button-pulse bg-blue-600" : "bg-blue-600"}
                    ${isButtonPressed ? "g11-button-press bg-blue-800" : ""}
                  `}
                >
                  {currentItem.action_button}
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated Hand */}
          {(phase === "rising" || isHandRetracting) && (
            <div 
              className={`absolute left-0 right-0 flex justify-center items-start z-20 cursor-pointer ${isHandRetracting ? "g11-hand-retract" : ""}`}
              style={{ 
                top: `${handY}%`, 
                height: "100%", // give it a big hit area extending downwards
                touchAction: "none" // prevent scrolling when trying to tap hand
              }}
              onPointerDown={handleStopTap}
            >
              {/* Hit area visualizer (invisible in prod) + Hand Image */}
              <div className="relative flex justify-center px-8 pb-32">
                <div className="text-[clamp(56px,17.39vw,80px)] drop-shadow-xl animate-bounce-slow origin-bottom-right" aria-label="มือที่กำลังจะกด">
                  👆
                </div>
                {/* A subtle pulse ring to indicate it is tappable */}
                {phase === "rising" && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-500/20 rounded-full animate-ping -z-10"></div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {(phase === "showing" || phase === "rising" || phase === "feedback") && (
        <div className="absolute top-2 right-4 text-slate-500 font-bold bg-white/80 px-3 py-1 rounded-full shadow-sm text-sm">
          {round + 1} / {TOTAL_ROUNDS}
        </div>
      )}

      {/* Feedback Overlay */}
      {phase === "feedback" && result && (
        <Overlay slideUp>
          <div className="text-center">
            {/* Success / Fail Header */}
            <div className="mb-4">
              {result.correct ? (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-2">
                  <Check size={32} strokeWidth={3} />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-2">
                  <X size={32} strokeWidth={3} />
                </div>
              )}
              <h3 className={`text-[clamp(17px,5.22vw,24px)] font-bold ${result.correct ? "text-green-700" : "text-orange-700"}`}>
                {result.correct 
                  ? (result.action === "stopped" ? "เก่งมาก หยุดได้ทัน!" : "ข้อมูลนี้เชื่อถือได้")
                  : (result.action === "stopped" ? "ช้าก่อน ข้อมูลนี้จริงนะ" : "ระวังนะ! นี่คือมิจฉาชีพ")}
              </h3>
            </div>

            {/* Explanation */}
            <p className="text-[clamp(13px,4.13vw,19px)] leading-relaxed mb-5 text-slate-700">
              {currentItem.explain}
            </p>

            {/* Signals Box */}
            <div className={`p-4 rounded-xl mb-6 text-left border ${
              currentItem.safe_action === "stop" 
                ? "bg-red-50 border-red-100" 
                : "bg-blue-50 border-blue-100"
            }`}>
              <h4 className="font-bold flex items-center gap-2 mb-2 text-[clamp(12px,3.7vw,17px)]">
                {currentItem.safe_action === "stop" ? (
                  <><AlertTriangle size={18} className="text-red-600"/> จุดสังเกต (Red Flags)</>
                ) : (
                  <><ThumbsUp size={18} className="text-blue-600"/> จุดสังเกตที่เชื่อถือได้</>
                )}
              </h4>
              
              {currentItem.red_flags.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-[clamp(12px,3.7vw,17px)]">
                  {currentItem.red_flags.map((flag, idx) => (
                    <li key={idx} className={currentItem.safe_action === "stop" ? "text-red-800" : "text-blue-800"}>
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[clamp(12px,3.7vw,17px)] text-blue-800">มาจากหน่วยงานทางการและไม่ขอข้อมูลส่วนตัว</p>
              )}
            </div>

            {/* Hotline (if any) */}
            {currentItem.hotline && (
              <div className="flex items-center justify-center gap-2 text-slate-600 mb-6 bg-slate-100 py-2 rounded-lg">
                <Phone size={18} />
                <span className="text-[clamp(11px,3.48vw,16px)]">สงสัยให้โทร: <strong>{currentItem.hotline}</strong></span>
              </div>
            )}

            <button
              onClick={nextRound}
              className="w-full min-h-[56px] rounded-xl bg-[var(--btn-bg)] text-white text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer hover:bg-[var(--btn-bg-hover)] transition-colors shadow-md"
            >
              ข้อต่อไป
            </button>
          </div>
        </Overlay>
      )}

      {/* Final Summary */}
      {phase === "summary" && (
        <Overlay slideUp>
          <div className="text-center py-4">
            <p className="text-6xl text-center mb-4" aria-hidden>🎉</p>
            <h2 className="text-[clamp(20px,6.09vw,28px)] font-bold mb-3 text-[var(--primary-dark)]">จบการประเมินผล!</h2>
            
            <div className="flex justify-center gap-2 mb-6" aria-label={`ได้ ${stars} ดาว`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className="text-5xl drop-shadow-sm" aria-hidden>
                  {n <= stars ? "⭐" : "☆"}
                </span>
              ))}
            </div>
            
            <div className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-200">
              <h3 className="font-bold text-[clamp(14px,4.35vw,20px)] mb-3 text-slate-800 flex justify-center items-center gap-2">
                <ShieldAlert className="text-[var(--primary)]" />
                คาถาป้องกันภัย
              </h3>
              <p className="text-[clamp(15px,4.78vw,22px)] font-bold text-[var(--primary-dark)] leading-relaxed">
                &quot;หยุด 🛑 คิด 🧠 ถาม 💬 ทำ ✅&quot;
              </p>
              <p className="text-[clamp(12px,3.7vw,17px)] mt-3 text-slate-600">
                ท่องไว้ให้ขึ้นใจ ก่อนใช้นิ้วกดมือถือทุกครั้งนะ
              </p>
            </div>
            
            <button
              onClick={() => onFinish(stars)}
              className="w-full min-h-[56px] rounded-xl bg-[var(--btn-bg)] text-white text-[clamp(15px,4.78vw,22px)] font-bold cursor-pointer hover:bg-[var(--btn-bg-hover)] transition-colors shadow-md flex justify-center items-center gap-2"
            >
              <Check size={24} strokeWidth={3} /> เสร็จสิ้น
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// Reusable Overlay Component
function Overlay({ children, slideUp = false }: { children: React.ReactNode, slideUp?: boolean }) {
  return (
    <div className="absolute inset-0 z-40 bg-slate-900/60 flex items-end sm:items-center justify-center p-3 backdrop-blur-sm">
      <div className={`bg-white rounded-[24px] p-6 w-full max-w-md max-h-[90%] overflow-y-auto shadow-2xl ${slideUp ? "g11-overlay-enter" : ""}`}>
        {children}
      </div>
    </div>
  );
}