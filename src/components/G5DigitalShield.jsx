import React, { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle, HelpCircle, Volume2, VolumeX, AlertTriangle, Play } from 'lucide-react';

const HAZARDS = [
  {
    id: 1,
    text: "โอนด่วน 500 บ. ค่าพัสดุตกค้าง!",
    type: "SMS แอบอ้างขนส่ง",
    advice: "มิจฉาชีพมักเร่งเร้าให้โอนเงินเร็ว แต่การจงใจชะลอช้าและโทรเช็กศูนย์ขนส่งก่อน จะช่วยรักษาเงินในกระเป๋าได้",
    speech: "โอนด่วน 500 บาท ค่าพัสดุตกค้าง! นี่คือข้อความแอบอ้างขนส่ง แนะนำให้หยุด คิด ถาม ทำ ก่อนโอนเงิน"
  },
  {
    id: 2,
    text: "ยินดีด้วย! คุณมีสิทธิ์ลุ้นรับโบนัสวัยเกษียณ",
    type: "เว็บลิงก์สแกม",
    advice: "รางวัลใหญ่ที่ส่งมาทาง SMS หรือหน้าเว็บ มักเป็นเบ็ดล่อข้อมูล ห้ามกดลิงก์แปลกปลอมเด็ดขาดนะ",
    speech: "ยินดีด้วยคุณมีสิทธิ์รับโบนัสวัยเกษียณ นี่คือเว็บลิงก์สแกม ห้ามแตะลิงก์แปลกปลอมเด็ดขาด"
  },
  {
    id: 3,
    text: "ลูกคุณเดือดร้อน ขอเลข OTP ด่วน!",
    type: "แชทแอบอ้างบุคคล",
    advice: "รหัส OTP คือกุญแจสำคัญ ห้ามบอกใครเด็ดขาด แม้ผู้นั้นจะอ้างเป็นญาติ ให้วางสายแล้วโทรกลับเบอร์จริงเพื่อยืนยัน",
    speech: "ลูกคุณเดือดร้อน ขอเลขโอทีพี ด่วน! นี่คือแชทแอบอ้างบุคคล อย่าบอกรหัสโอทีพีกับใครเด็ดขาด"
  },
  {
    id: 4,
    text: "โปรดแจ้งรหัสธนาคารเพื่อความปลอดภัย",
    type: "Social Phishing",
    advice: "ธนาคารและหน่วยงานรัฐไม่มีนโยบายสอบถามรหัสผ่านหรือรหัส OTP ทางแชทหรือโทรศัพท์ ให้ปฏิเสธทันที",
    speech: "โปรดแจ้งรหัสธนาคารเพื่อความปลอดภัย ธนาคารไม่มีนโยบายขอรหัสผ่านทางแชท ให้ปฏิเสธทันที"
  },
  {
    id: 5,
    text: "แชร์ต่อข่าวนี้เพื่อป้องกันโรคภัยร้ายแรง",
    type: "ข่าวปลอม (MIL)",
    advice: "ข้อมูลสุขภาพปาฏิหาริย์มักไม่ได้รับการยืนยันทางการแพทย์ ควรเช็กผ่านศูนย์ชัวร์ก่อนแชร์ หรือไม่แชร์ต่อเพื่อความปลอดภัย",
    speech: "แชร์ต่อข่าวนี้เพื่อป้องกันโรคภัยร้ายแรง นี่คือข่าวปลอมด้านสุขภาพ ควรเช็กก่อนแชร์เพื่อความปลอดภัย"
  }
];

const SLOGANS = [
  { text: "หยุด", icon: "🛑", detail: "ชะลอการตอบสนองความเร็ว" },
  { text: "คิด", icon: "🧠", detail: "ทบทวนความสมเหตุสมผล" },
  { text: "ถาม", icon: "💬", detail: "ปรึกษาญาติหรือเบอร์ทางการ" },
  { text: "ทำ", icon: "✅", detail: "จัดการอย่างรอบคอบ ปลอดภัย" }
];

export default function G5DigitalShield({ onFinish, logEvent }) {
  const [confidence, setConfidence] = useState(0);
  const [activeHazardIdx, setActiveHazardIdx] = useState(0);
  const [bubbleYStyle, setBubbleYStyle] = useState('10%'); // CSS string representation: '10%' to '75%'
  const [bubbleX, setBubbleX] = useState(50); // Horizontal percentage 20% to 80%
  const [isFalling, setIsFalling] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'slogan', 'advice', 'finished'
  const [sloganStep, setSloganStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [showShieldWave, setShowShieldWave] = useState(false);
  const [shieldWavePos, setShieldWavePos] = useState({ x: 50, y: 50 });

  const synthRef = useRef(window.speechSynthesis);
  const playBoxRef = useRef(null);
  const bubbleRef = useRef(null);

  // Play instruction or speech
  const handleSpeak = (text) => {
    if (!synthRef.current) return;
    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synthRef.current.speak(utterance);
  };

  // Speak slogans in sequence
  const speakSlogan = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    synthRef.current.speak(utterance);
  };

  // Spawns and triggers transition animation smoothly
  useEffect(() => {
    if (gameState === 'playing') {
      // First set to start position
      setBubbleYStyle('10%');
      setIsFalling(false);

      // Trigger transition on next browser repaint frame
      const frameId = requestAnimationFrame(() => {
        const timeoutId = setTimeout(() => {
          setIsFalling(true);
          setBubbleYStyle('72%'); // Target height right above baseline (approx 72%)
        }, 30);
        return () => clearTimeout(timeoutId);
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [gameState, activeHazardIdx]);

  // Slogan sequence trigger
  useEffect(() => {
    if (gameState === 'slogan') {
      setSloganStep(0);
      speakSlogan(SLOGANS[0].text);
      const timer = setInterval(() => {
        setSloganStep(prev => {
          if (prev < 3) {
            const nextStep = prev + 1;
            speakSlogan(SLOGANS[nextStep].text);
            return nextStep;
          } else {
            clearInterval(timer);
            // Slogan complete, check victory
            setTimeout(() => {
              const nextIdx = activeHazardIdx + 1;
              if (nextIdx < HAZARDS.length) {
                setActiveHazardIdx(nextIdx);
                setGameState('playing');
              } else {
                setGameState('finished');
                logEvent('game_complete', { game_id: 'G5', score: 100, stars: 3 });
              }
            }, 800);
            return prev;
          }
        });
      }, 600); // 600ms per step

      return () => clearInterval(timer);
    }
  }, [gameState]);

  const handleBlock = (e) => {
    if (gameState !== 'playing') return;

    // Freeze bubble at its exact computed visual position instantly
    if (bubbleRef.current) {
      const computedTop = window.getComputedStyle(bubbleRef.current).top;
      setBubbleYStyle(computedTop);
    }
    setIsFalling(false);

    // Calculate wave position relative to the play box container
    if (playBoxRef.current) {
      const rect = playBoxRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;
      setShieldWavePos({ x: clickX, y: clickY });
      setShowShieldWave(true);
      setTimeout(() => setShowShieldWave(false), 500);
    }

    // Success state
    const newConfidence = confidence + 20;
    setConfidence(newConfidence);
    logEvent('game_g5_block', { hazard_id: HAZARDS[activeHazardIdx].id, confidence: newConfidence });
    setGameState('slogan');
  };

  const handleTransitionEnd = (e) => {
    // Only capture 'top' transition completing at target depth
    if (e.propertyName === 'top' && gameState === 'playing' && isFalling) {
      setIsFalling(false);
      setBubbleYStyle('72%');
      setGameState('advice');
      logEvent('game_g5_miss', { hazard_id: HAZARDS[activeHazardIdx].id });
    }
  };

  const handleCloseAdvice = () => {
    // Advance to next hazard index directly
    const nextIdx = activeHazardIdx + 1;
    if (nextIdx < HAZARDS.length) {
      setActiveHazardIdx(nextIdx);
      setGameState('playing');
    } else {
      setGameState('finished');
      logEvent('game_complete', { game_id: 'G5', score: 100, stars: 3 });
    }
  };

  const handleFinish = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    onFinish(3); // Complete lesson with 3 stars!
  };

  const currentHazard = HAZARDS[activeHazardIdx];

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-between [font-family:var(--font-content)]">

      {/* 1. CONFIDENCE BAR HEADER */}
      <div className="p-4 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-sm)] mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[clamp(13px,3.91vw,18px)] font-extrabold text-[var(--primary-dark)]">🛡️ ระดับพลังสะกัดภัยไซเบอร์</span>
          <span className="text-[clamp(15px,4.78vw,22px)] font-black text-[var(--primary)]">{confidence}%</span>
        </div>
        <div className="w-full h-6 bg-[#e2e8f0] rounded-xl overflow-hidden border border-[var(--border)]">
          {/* Width is driven by game state (confidence), and the striped texture needs a raw gradient — both stay inline */}
          <div style={{
            width: `${confidence}%`,
            height: '100%',
            backgroundColor: 'var(--primary)',
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
            backgroundSize: '1rem 1rem',
            transition: 'width 0.4s ease',
            borderRadius: '12px'
          }}></div>
        </div>
        <p className="text-[clamp(10px,3.04vw,14px)] mt-1.5 text-[var(--text-secondary)] text-center">
          สะกัดกั้นข้อความล่อลวงสำเร็จ {confidence / 20} จาก 5 ด่าน
        </p>
      </div>

      {/* 2. PLAYING FIELD AREA */}
      {gameState !== 'finished' && (
        <div
          ref={playBoxRef}
          className="relative flex-1 min-h-0 bg-[#0f172a] rounded-[var(--radius-lg)] border-2 border-[#334155] overflow-hidden select-none"
        >
          {/* Background Grid Accent */}
          <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"></div>

          {/* Safety Line at the bottom */}
          <div className="absolute left-0 right-0 bottom-[22%] h-1 bg-[rgba(239,68,68,0.4)] border-t border-dashed border-[#ef4444] flex items-center justify-center z-[1]">
            <span className="text-[clamp(8px,2.39vw,11px)] text-[#f87171] bg-[#1e293b] px-2 py-0.5 rounded border border-[#7f1d1d] font-bold tracking-[1px]">ขอบเขตความปลอดภัย (SAFETY BASELINE)</span>
          </div>

          {/* User Instructions Overlay */}
          {gameState === 'playing' && isFalling && (
            <div className="absolute top-3 left-3 right-3 text-center bg-[rgba(15,23,42,0.7)] px-3 py-2 rounded-[var(--radius-md)] border border-[#334155] pointer-events-none [animation:pulse_2s_infinite] z-[2]">
              <span className="text-[#38bdf8] font-bold text-[clamp(10px,3.26vw,15px)]">
                👉 แตะจิ้มลงไปที่กล่องข้อความสีแดงเพื่อสกัดภัย!
              </span>
            </div>
          )}

          {/* Tap Shield Wave Visual Effect — position comes from the click coordinates, so it stays inline */}
          {showShieldWave && (
            <div
              className="absolute w-[100px] h-[100px] -ml-[50px] -mt-[50px] rounded-full border-[3px] border-[#0ea5e9] bg-[rgba(14,165,233,0.2)] pointer-events-none scale-[1.2] [animation:ping_0.3s_ease-out_forwards] z-[3]"
              style={{ left: `${shieldWavePos.x}%`, top: `${shieldWavePos.y}%` }}
            ></div>
          )}

          {/* Falling Hazard Bubble inside a generous target wrapper — left/top/transition are driven by the fall animation state machine, so they stay inline */}
          {(gameState === 'playing' || gameState === 'slogan') && (
            <div
              ref={bubbleRef}
              onTransitionEnd={handleTransitionEnd}
              onClick={handleBlock}
              className="absolute -translate-x-1/2 px-8 py-6 flex items-center justify-center cursor-pointer z-[5]"
              style={{
                left: `${bubbleX}%`,
                top: bubbleYStyle,
                transition: isFalling && gameState === 'playing' ? 'top 8.5s linear' : 'none'
              }}
            >
              {/* Visible Bubble */}
              <div className="bg-[rgba(30,41,59,0.95)] border-[3px] border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.4)] rounded-3xl py-3.5 px-[18px] w-[280px] flex flex-col items-center justify-center pointer-events-none [animation:bounceBubble_1.5s_infinite_alternate]">
                <span className="text-[clamp(8px,2.39vw,11px)] font-bold text-[#ef4444] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 rounded-lg mb-1.5 uppercase">
                  ⚠️ {currentHazard.type}
                </span>
                <p className="text-[clamp(12px,3.7vw,17px)] font-bold text-[#f8fafc] m-0 text-center leading-snug">
                  "{currentHazard.text}"
                </p>

                {/* Assist circle indicator */}
                <div className="mt-2 w-8 h-8 rounded-full bg-[rgba(239,68,68,0.2)] border-2 border-dashed border-[#f87171] flex items-center justify-center text-[#f87171] text-[clamp(8px,2.61vw,12px)] font-bold">
                  แตะ
                </div>
              </div>
            </div>
          )}

          {/* Slogan Screen Freeze Overlay */}
          {gameState === 'slogan' && (
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.88)] flex flex-col items-center justify-center p-6 z-10">
              <div className="w-[90%] max-w-[320px] text-center p-6 bg-[#1e293b] rounded-3xl border-2 border-[var(--primary)] shadow-[0_0_25px_rgba(14,165,233,0.4)]">
                <Shield size={64} color="var(--primary)" className="[animation:pulse_1s_infinite] mb-4" />

                <h3 className="text-[clamp(14px,4.35vw,20px)] text-[#38bdf8] mb-4 font-bold">
                  🛡️ กางโล่สะกดภัยสำเร็จ!
                </h3>

                {/* Slogan Sequence Display */}
                <div className="flex flex-col gap-3 items-center">
                  {SLOGANS.map((s, idx) => {
                    const isVisible = idx <= sloganStep;
                    const isCurrent = idx === sloganStep;
                    return (
                      <div
                        key={s.text}
                        className={`flex items-center gap-3 transition-all duration-300 ease-in-out py-1.5 px-4 rounded-xl w-full justify-center ${
                          isVisible ? 'opacity-100' : 'opacity-[0.15]'
                        } ${isCurrent ? 'scale-[1.15] bg-[rgba(14,165,233,0.15)]' : 'scale-100 bg-transparent'}`}
                      >
                        <span className="text-[clamp(22px,6.96vw,32px)]">{s.icon}</span>
                        <span className={`text-[clamp(20px,6.09vw,28px)] font-black ${isCurrent ? 'text-[var(--primary)]' : 'text-[#f1f5f9]'}`}>
                          {s.text}
                        </span>
                        {isCurrent && (
                          <span className="text-[clamp(9px,2.83vw,13px)] text-[var(--primary-light)] italic">
                            ({s.detail})
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Miss Advice Card Modal */}
          {gameState === 'advice' && (
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.85)] flex items-center justify-center p-5 z-10">
              <div className="w-full max-w-[340px] bg-[var(--bg-card)] rounded-3xl border-[3px] border-[#ef4444] p-6 shadow-[var(--shadow-xl)] text-center">
                <div className="inline-flex p-3 bg-[rgba(239,68,68,0.1)] rounded-full mb-4">
                  <AlertTriangle size={48} color="#ef4444" />
                </div>

                <h3 className="text-[clamp(15px,4.78vw,22px)] font-extrabold text-[#991b1b] mb-1">
                  ฟองภัยสแกมหลุดรอด!
                </h3>
                <span className="text-[clamp(9px,2.83vw,13px)] text-[#b91c1c] bg-[#fee2e2] px-2 py-[3px] rounded-lg font-bold">
                  ภัยเงียบ: {currentHazard.type}
                </span>

                {/* Question Quote */}
                <div className="my-4 p-3 bg-[var(--bg-app)] rounded-xl border-l-4 border-l-[#ef4444] text-left">
                  <p className="text-[clamp(10px,3.26vw,15px)] text-[var(--text-primary)] italic m-0">
                    "{currentHazard.text}"
                  </p>
                </div>

                {/* Positive Advice Text */}
                <div className="text-left mb-5">
                  <span className="text-[clamp(10px,3.04vw,14px)] font-bold text-[var(--primary-dark)]">💡 คำแนะนำเสริมสติ:</span>
                  <p className="text-[clamp(11px,3.48vw,16px)] text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {currentHazard.advice}
                  </p>
                </div>

                {/* Accessibility Speaker button */}
                <button
                  onClick={() => handleSpeak(currentHazard.speech)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] border border-[var(--primary)] text-[var(--primary-dark)] cursor-pointer text-[clamp(10px,3.26vw,15px)] font-bold mb-4 ${speaking ? 'bg-[var(--primary-light)]' : 'bg-[#f8fafc]'}`}
                >
                  {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  {speaking ? 'หยุดฟังเสียงบรรยาย' : '🔊 ฟังเสียงพูดแนะนำ'}
                </button>

                {/* Resume Button */}
                <button
                  onClick={handleCloseAdvice}
                  className="btn btn-primary w-full text-[clamp(14px,4.35vw,20px)] p-3.5 rounded-[var(--radius-md)] shadow-[var(--shadow-md)]"
                >
                  <Play size={20} fill="currentColor" />
                  เข้าใจแล้วและเล่นต่อ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. GAME COMPLETED SCREEN */}
      {gameState === 'finished' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[var(--bg-card)] rounded-[var(--radius-lg)] border-2 border-[var(--primary-light)] shadow-[var(--shadow-lg)]">
          <div className="relative mb-5">
            <div className="w-[120px] h-[120px] rounded-full bg-[rgba(14,165,233,0.1)] flex items-center justify-center [animation:pulse_2s_infinite]">
              <CheckCircle size={72} color="var(--primary)" />
            </div>
          </div>

          <h2 className="text-[clamp(20px,6.09vw,28px)] font-black text-[var(--primary-dark)] mb-2">
            🎉 ผ่านการทดสอบกางโล่!
          </h2>
          <span className="text-[clamp(10px,3.26vw,15px)] text-[#0f766e] bg-[#ccfbf1] px-4 py-1 rounded-[var(--radius-pill)] font-bold mb-4">
            ระดับเกราะป้องกัน: สมบูรณ์ร้อยเปอร์เซ็นต์
          </span>

          <p className="text-[clamp(13px,3.91vw,18px)] text-[var(--text-secondary)] leading-relaxed max-w-[360px] mb-7">
            ยอดเยี่ยมมาก! คุณลุงคุณป้ามีความคุ้นชินและเตรียมพร้อมรับมือภัยออนไลน์ด้วยหลักคิด
            <strong> "หยุด คิด ถาม ทำ"</strong> อย่างเต็มร้อย นำความรู้ไปประยุกต์ใช้เพื่อความสุขไซเบอร์นะ
          </p>

          {/* Finish Button */}
          <button
            onClick={handleFinish}
            className="btn btn-primary w-full max-w-[300px] text-[clamp(15px,4.78vw,22px)] py-4 px-6 rounded-[var(--radius-md)] shadow-[var(--shadow-md)]"
          >
            ไปต่อเพื่อรับคะแนนความมั่นใจ
          </button>
        </div>
      )}

      {/* 4. FOOTER OPTIONS BAR */}
      {gameState === 'playing' && (
        <div className="mt-3 flex justify-between items-center py-3 px-4 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-[clamp(10px,3.26vw,15px)] font-bold text-[var(--text-primary)]">
              ด่านสกัดภัยที่: {activeHazardIdx + 1}/5
            </span>
          </div>

          <button
            onClick={() => handleSpeak("บทเรียนนี้ให้ผู้เรียนสังเกตและแตะข้อความที่ค่อยๆ ร่วงหล่นลงมาเพื่อสะกัดสแกมเมอร์ ด้วยการเปิดเกราะกำบังโล่กู้ชีพ")}
            className={`px-3 py-2 rounded-[var(--radius-pill)] border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer text-[clamp(10px,3.04vw,14px)] font-bold flex items-center gap-1 ${speaking ? 'bg-[var(--primary-light)]' : 'bg-[#f8fafc]'}`}
          >
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            วิธีเล่น
          </button>
        </div>
      )}
    </div>
  );
}
