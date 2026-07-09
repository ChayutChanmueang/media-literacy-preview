import React, { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle, HelpCircle, Volume2, VolumeX, AlertTriangle, Play } from 'lucide-react';

const HAZARDS = [
  {
    id: 1,
    text: "โอนด่วน 500 บ. ค่าพัสดุตกค้าง!",
    type: "SMS แอบอ้างขนส่ง",
    advice: "มิจฉาชีพมักเร่งเร้าให้โอนเงินเร็ว แต่การจงใจชะลอช้าและโทรเช็กศูนย์ขนส่งก่อน จะช่วยรักษาเงินในกระเป๋าได้ค่ะ",
    speech: "โอนด่วน 500 บาท ค่าพัสดุตกค้าง! นี่คือข้อความแอบอ้างขนส่ง แนะนำให้หยุด คิด ถาม ทำ ก่อนโอนเงินค่ะ"
  },
  {
    id: 2,
    text: "ยินดีด้วย! คุณมีสิทธิ์ลุ้นรับโบนัสวัยเกษียณ",
    type: "เว็บลิงก์สแกม",
    advice: "รางวัลใหญ่ที่ส่งมาทาง SMS หรือหน้าเว็บ มักเป็นเบ็ดล่อข้อมูล ห้ามกดลิงก์แปลกปลอมเด็ดขาดนะคะ",
    speech: "ยินดีด้วยคุณมีสิทธิ์รับโบนัสวัยเกษียณ นี่คือเว็บลิงก์สแกม ห้ามแตะลิงก์แปลกปลอมเด็ดขาดค่ะ"
  },
  {
    id: 3,
    text: "ลูกคุณเดือดร้อน ขอเลข OTP ด่วน!",
    type: "แชทแอบอ้างบุคคล",
    advice: "รหัส OTP คือกุญแจสำคัญ ห้ามบอกใครเด็ดขาด แม้ผู้นั้นจะอ้างเป็นญาติ ให้วางสายแล้วโทรกลับเบอร์จริงเพื่อยืนยัน",
    speech: "ลูกคุณเดือดร้อน ขอเลขโอทีพี ด่วน! นี่คือแชทแอบอ้างบุคคล อย่าบอกรหัสโอทีพีกับใครเด็ดขาดค่ะ"
  },
  {
    id: 4,
    text: "โปรดแจ้งรหัสธนาคารเพื่อความปลอดภัย",
    type: "Social Phishing",
    advice: "ธนาคารและหน่วยงานรัฐไม่มีนโยบายสอบถามรหัสผ่านหรือรหัส OTP ทางแชทหรือโทรศัพท์ ให้ปฏิเสธทันทีค่ะ",
    speech: "โปรดแจ้งรหัสธนาคารเพื่อความปลอดภัย ธนาคารไม่มีนโยบายขอรหัสผ่านทางแชท ให้ปฏิเสธทันทีค่ะ"
  },
  {
    id: 5,
    text: "แชร์ต่อข่าวนี้เพื่อป้องกันโรคภัยร้ายแรง",
    type: "ข่าวปลอม (MIL)",
    advice: "ข้อมูลสุขภาพปาฏิหาริย์มักไม่ได้รับการยืนยันทางการแพทย์ ควรเช็กผ่านศูนย์ชัวร์ก่อนแชร์ หรือไม่แชร์ต่อเพื่อความปลอดภัย",
    speech: "แชร์ต่อข่าวนี้เพื่อป้องกันโรคภัยร้ายแรง นี่คือข่าวปลอมด้านสุขภาพ ควรเช็กก่อนแชร์เพื่อความปลอดภัยค่ะ"
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. CONFIDENCE BAR HEADER */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: 'var(--bg-card)', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)' }}>🛡️ ระดับพลังสะกัดภัยไซเบอร์</span>
          <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)' }}>{confidence}%</span>
        </div>
        <div style={{ width: '100%', height: '24px', backgroundColor: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
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
        <p style={{ fontSize: '14px', margin: '6px 0 0 0', color: 'var(--text-secondary)', textAlign: 'center' }}>
          สะกัดกั้นข้อความล่อลวงสำเร็จ {confidence / 20} จาก 5 ด่าน
        </p>
      </div>

      {/* 2. PLAYING FIELD AREA */}
      {gameState !== 'finished' && (
        <div 
          ref={playBoxRef}
          style={{
            position: 'relative',
            flex: 1,
            minHeight: '380px',
            backgroundColor: '#0f172a', // Sleek dark space
            borderRadius: 'var(--radius-lg)',
            border: '2px solid #334155',
            overflow: 'hidden',
            userSelect: 'none'
          }}
        >
          {/* Background Grid Accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.5
          }}></div>

          {/* Safety Line at the bottom */}
          <div style={{
            position: 'absolute',
            bottom: '22%',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: 'rgba(239, 68, 68, 0.4)',
            borderTop: '1px dashed #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <span style={{ 
              fontSize: '11px', 
              color: '#f87171', 
              backgroundColor: '#1e293b', 
              padding: '2px 8px', 
              borderRadius: '4px',
              border: '1px solid #7f1d1d',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>ขอบเขตความปลอดภัย (SAFETY BASELINE)</span>
          </div>

          {/* User Instructions Overlay */}
          {gameState === 'playing' && isFalling && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              textAlign: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #334155',
              pointerEvents: 'none',
              animation: 'pulse 2s infinite',
              zIndex: 2
            }}>
              <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '15px' }}>
                👉 แตะจิ้มลงไปที่กล่องข้อความสีแดงเพื่อสกัดภัย!
              </span>
            </div>
          )}

          {/* Tap Shield Wave Visual Effect */}
          {showShieldWave && (
            <div style={{
              position: 'absolute',
              left: `${shieldWavePos.x}%`,
              top: `${shieldWavePos.y}%`,
              width: '100px',
              height: '100px',
              marginLeft: '-50px',
              marginTop: '-50px',
              borderRadius: '50%',
              border: '3px solid #0ea5e9',
              backgroundColor: 'rgba(14, 165, 233, 0.2)',
              pointerEvents: 'none',
              transform: 'scale(1.2)',
              animation: 'ping 0.3s ease-out forwards',
              zIndex: 3
            }}></div>
          )}

          {/* Falling Hazard Bubble inside a generous target wrapper */}
          {(gameState === 'playing' || gameState === 'slogan') && (
            <div 
              ref={bubbleRef}
              onTransitionEnd={handleTransitionEnd}
              onClick={handleBlock}
              style={{
                position: 'absolute',
                left: `${bubbleX}%`,
                top: bubbleYStyle,
                transform: 'translateX(-50%)',
                // Smooth CSS transition handled by browser GPU
                transition: isFalling && gameState === 'playing' ? 'top 8.5s linear' : 'none',
                // Large transparent padding around bubble for senior accessibility target area
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 5
              }}
            >
              {/* Visible Bubble */}
              <div style={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '3px solid #ef4444', // Danger border
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                borderRadius: '24px',
                padding: '14px 18px',
                width: '280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none', // Let wrapper capture clicks
                animation: 'bounceBubble 1.5s infinite alternate'
              }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: '#ef4444', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  padding: '2px 8px', 
                  borderRadius: '8px',
                  marginBottom: '6px',
                  textTransform: 'uppercase'
                }}>
                  ⚠️ {currentHazard.type}
                </span>
                <p style={{ 
                  fontSize: '17px', 
                  fontWeight: 'bold', 
                  color: '#f8fafc', 
                  margin: 0, 
                  textAlign: 'center',
                  lineHeight: 1.4
                }}>
                  "{currentHazard.text}"
                </p>
                
                {/* Assist circle indicator */}
                <div style={{
                  marginTop: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '2px dashed #f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  แตะ
                </div>
              </div>
            </div>
          )}

          {/* Slogan Screen Freeze Overlay */}
          {gameState === 'slogan' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 10
            }}>
              <div style={{ 
                width: '90%', 
                maxWidth: '320px', 
                textAlign: 'center',
                padding: '24px',
                backgroundColor: '#1e293b',
                borderRadius: '24px',
                border: '2px solid var(--primary)',
                boxShadow: '0 0 25px rgba(14, 165, 233, 0.4)'
              }}>
                <Shield size={64} color="var(--primary)" style={{ animation: 'pulse 1s infinite', marginBottom: '16px' }} />
                
                <h3 style={{ fontSize: '20px', color: '#38bdf8', margin: '0 0 16px 0', fontWeight: 'bold' }}>
                  🛡️ กางโล่สะกดภัยสำเร็จ!
                </h3>

                {/* Slogan Sequence Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  {SLOGANS.map((s, idx) => {
                    const isVisible = idx <= sloganStep;
                    const isCurrent = idx === sloganStep;
                    return (
                      <div 
                        key={s.text}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          opacity: isVisible ? 1 : 0.15,
                          transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          padding: '6px 16px',
                          borderRadius: '12px',
                          backgroundColor: isCurrent ? 'rgba(14,165,233,0.15)' : 'transparent',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ fontSize: '32px' }}>{s.icon}</span>
                        <span style={{ fontSize: '28px', fontWeight: '900', color: isCurrent ? 'var(--primary)' : '#f1f5f9' }}>
                          {s.text}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '13px', color: 'var(--primary-light)', fontStyle: 'italic' }}>
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
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 10
            }}>
              <div style={{
                width: '100%',
                maxWidth: '340px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '24px',
                border: '3px solid #ef4444',
                padding: '24px',
                boxShadow: 'var(--shadow-xl)',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', marginBottom: '16px' }}>
                  <AlertTriangle size={48} color="#ef4444" />
                </div>
                
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#991b1b', margin: '0 0 4px 0' }}>
                  ฟองภัยสแกมหลุดรอด!
                </h3>
                <span style={{ fontSize: '13px', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                  ภัยเงียบ: {currentHazard.type}
                </span>

                {/* Question Quote */}
                <div style={{ 
                  margin: '16px 0', 
                  padding: '12px', 
                  backgroundColor: 'var(--bg-app)', 
                  borderRadius: '12px', 
                  borderLeft: '4px solid #ef4444',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontStyle: 'italic', margin: 0 }}>
                    "{currentHazard.text}"
                  </p>
                </div>

                {/* Positive Advice Text */}
                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary-dark)' }}>💡 คำแนะนำเสริมสติ:</span>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    {currentHazard.advice}
                  </p>
                </div>

                {/* Accessibility Speaker button */}
                <button
                  onClick={() => handleSpeak(currentHazard.speech)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: speaking ? 'var(--primary-light)' : '#f8fafc',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary-dark)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    marginBottom: '16px'
                  }}
                >
                  {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  {speaking ? 'หยุดฟังเสียงบรรยาย' : '🔊 ฟังเสียงพูดแนะนำ'}
                </button>

                {/* Resume Button */}
                <button
                  onClick={handleCloseAdvice}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    fontSize: '20px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
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
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--primary-light)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            position: 'relative',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <CheckCircle size={72} color="var(--primary)" />
            </div>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary-dark)', margin: '0 0 8px 0' }}>
            🎉 ผ่านการทดสอบกางโล่!
          </h2>
          <span style={{ 
            fontSize: '15px', 
            color: '#0f766e', 
            backgroundColor: '#ccfbf1', 
            padding: '4px 16px', 
            borderRadius: 'var(--radius-pill)', 
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            ระดับเกราะป้องกัน: สมบูรณ์ร้อยเปอร์เซ็นต์
          </span>

          <p style={{ 
            fontSize: '18px', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6,
            maxWidth: '360px',
            margin: '0 0 28px 0'
          }}>
            ยอดเยี่ยมมากค่ะ! คุณลุงคุณป้ามีความคุ้นชินและเตรียมพร้อมรับมือภัยออนไลน์ด้วยหลักคิด 
            <strong> "หยุด คิด ถาม ทำ"</strong> อย่างเต็มร้อย นำความรู้ไปประยุกต์ใช้เพื่อความสุขไซเบอร์นะคะ
          </p>

          {/* Finish Button */}
          <button
            onClick={handleFinish}
            className="btn btn-primary"
            style={{
              width: '100%',
              maxWidth: '300px',
              fontSize: '22px',
              fontWeight: 'bold',
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ไปต่อเพื่อรับคะแนนความมั่นใจ
          </button>
        </div>
      )}

      {/* 4. FOOTER OPTIONS BAR */}
      {gameState === 'playing' && (
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              ด่านสกัดภัยที่: {activeHazardIdx + 1}/5
            </span>
          </div>

          <button
            onClick={() => handleSpeak("บทเรียนนี้ให้ผู้เรียนสังเกตและแตะข้อความที่ค่อยๆ ร่วงหล่นลงมาเพื่อสะกัดสแกมเมอร์ ด้วยการเปิดเกราะกำบังโล่กู้ชีพค่ะ")}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: speaking ? 'var(--primary-light)' : '#f8fafc',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            วิธีเล่น
          </button>
        </div>
      )}
    </div>
  );
}
