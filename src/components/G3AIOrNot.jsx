import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Eye, ZoomIn, ZoomOut, Volume2, VolumeX } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'g3-q1',
    media: '/images/g3-q1.png',
    claim: 'ภาพโฆษณา: แพทย์หญิงผู้เชี่ยวชาญชวนซื้อยาบำรุงหัวใจสูตรพิเศษช่วยลดความดันทันที',
    isAi: true,
    aiDisclosure: '⚠️ ภาพนี้จำลองขึ้นโดย AI เพื่อการศึกษา',
    explanation: 'สังเกตนิ้วมือของแพทย์ที่มีความบิดเบี้ยวและเรียงนิ้วผิดปกติ (มี 6 นิ้ว) รวมถึงตัวอักษรภาษาอังกฤษจำลองบนกระดานด้านหลังสะกดสับสนอ่านไม่ออก มิจฉาชีพชอบใช้เทคโนโลยีนี้แอบอ้างใบหน้าบุคลากรแพทย์เพื่อสร้างความน่าเชื่อถือปลอมครับ',
    speakerText: 'ภาพโฆษณาแพทย์ชวนซื้อยาบำรุงหัวใจ ภาพนี้สร้างด้วย AI ครับ สังเกตนิ้วมือแพทย์ขวาที่มีหกนิ้ว และตัวหนังสือบนกระดานฉากหลังบิดเบี้ยวอ่านไม่เป็นภาษา มิจฉาชีพสร้างภาพขึ้นเพื่อแอบอ้างความน่าเชื่อถือครับ',
    hotspots: [
      { x: '46%', y: '68%', w: '60px', h: '60px', label: 'นิ้วมือมี 6 นิ้ว บิดเบี้ยว' },
      { x: '25%', y: '25%', w: '80px', h: '50px', label: 'ตัวหนังสือฉากหลังเบลอบิดเบี้ยว' }
    ]
  },
  {
    id: 'g3-q2',
    media: '/images/g3-q2.png',
    claim: 'ภาพถ่าย: บรรยากาศแผงผักในตลาดสดเช้าวิถีชุมชนต่างจังหวัดของไทย',
    isAi: false,
    aiDisclosure: '',
    explanation: 'ภาพนี้เป็นภาพถ่ายจริง สังเกตตัวเลขราคาไทยสะกดถูกต้องชัดเจน รายละเอียดเนื้อผิวผัก แสงเงาธรรมชาติสะท้อนกับพื้นปูนเปียกชื้น และสัดส่วนใบหน้าของผู้คนที่ดูสมจริงไม่เบลอเลอะเทอะ',
    speakerText: 'ภาพแผงผักในตลาดสด ภาพนี้คือภาพถ่ายจริงครับ รายละเอียดแสงเงาสมดุล ตัวหนังสือไทยบนป้ายสะกดถูกต้องชัดเจน และพื้นผิวของผักสมจริงเป็นธรรมชาติครับ',
    hotspots: []
  },
  {
    id: 'g3-q3',
    media: '/images/g3-q3.png',
    claim: 'ภาพประกาศข่าว: โฆษกกรมพัฒนาสังคมฯ ออกโรงแถลงข่าวแจกของขวัญเบี้ยพิเศษผู้สูงอายุ',
    isAi: true,
    aiDisclosure: '⚠️ ภาพนี้จำลองขึ้นโดย AI เพื่อการศึกษา',
    explanation: 'สังเกตจุดผิดปกติของฟันของโฆษกที่มีลักษณะเรียงตัวมากซ้อนทับกันเกินจริง ผิวหน้ามันเงาไร้รูขุมขนเหมือนตุ๊กตายางพารา และตัวสะกดอักษรบนแถบรายงานข่าวด้านล่างโย้เย้แปลกประหลาด',
    speakerText: 'ภาพโฆษกประกาศแจกสิทธิพิเศษ ภาพนี้สร้างด้วย AI ครับ สังเกตฟันของผู้ประกาศข่าวมีลักษณะเรียงซ้อนมากเกินจริง ผิวหน้าสะท้อนเงาเหมือนพลาสติก และตัวอักษรด้านล่างโย้เย้อ่านไม่ออกครับ',
    hotspots: [
      { x: '48%', y: '42%', w: '40px', h: '30px', label: 'ฟันเรียงซ้อนเยอะเกินธรรมชาติ' },
      { x: '20%', y: '82%', w: '120px', h: '40px', label: 'แถบข่าวด้านล่างตัวหนังสือสะกดบิดเบี้ยว' }
    ]
  },
  {
    id: 'g3-q4',
    media: '/images/g3-q4.png',
    claim: 'ภาพถ่าย: คุณตาคุณยายชาวนาไทยกำลังช่วยกันผูกมัดฟ่อนข้าวท่ามกลางท้องทุ่งนาสีเขียว',
    isAi: false,
    aiDisclosure: '',
    explanation: 'ภาพนี้เป็นภาพถ่ายของจริง สังเกตรายละเอียดฟางข้าวและรวงข้าวแยกเส้นชัดเจน ริ้วรอยแววตาของคุณตาคุณยายสอดคล้องตามช่วงวัย เสื้อผ้ามีฝุ่นเปื้อนตามธรรมชาติและแสงเงาแดดบ่ายมีความถูกต้องสอดคล้องกัน',
    speakerText: 'ภาพคุณตาคุณยายทำนา ภาพนี้คือภาพถ่ายจริงครับ รายละเอียดรอยย่นบนใบหน้าเป็นธรรมชาติ รวงข้าวแยกเส้นชัดเจน แสงเงาแดดที่ทอดลงมาสอดคล้องกันดีครับ',
    hotspots: []
  },
  {
    id: 'g3-q5',
    media: '/images/g3-q5.png',
    claim: 'ภาพข่าวสังคม: กิจกรรมเฉลิมฉลองวันปีใหม่ของผู้สูงอายุที่ร่วมรำวงในตำบล',
    isAi: true,
    aiDisclosure: '⚠️ ภาพนี้จำลองขึ้นโดย AI เพื่อการศึกษา',
    explanation: 'สังเกตคนในฉากหลังที่หน้าตายุบยับบิดเบี้ยว ไม่มีจมูกหรือตาชัดเจน (เนื่องจาก AI วาดรายละเอียดขนาดย่อยด้านหลังไม่สมบูรณ์) และลวดลายเสื้อลายดอกมีการซ้อนทับกันอย่างไร้ทิศทางธรรมชาติ',
    speakerText: 'ภาพกิจกรรมรำวงวันปีใหม่ ภาพนี้สร้างด้วย AI ครับ สังเกตใบหน้าของคนในฉากหลังบิดเบี้ยว ตาและจมูกขาดหายไป และลวดลายเสื้อผ้าแปลกประหลาดซ้อนทับไม่เป็นธรรมชาติครับ',
    hotspots: [
      { x: '72%', y: '32%', w: '50px', h: '50px', label: 'ใบหน้าฉากหลังไม่มีตารูปร่างบิดเบี้ยว' },
      { x: '35%', y: '55%', w: '70px', h: '70px', label: 'ลวดลายผ้าซ้อนทับอย่างไร้ทิศทาง' }
    ]
  },
  {
    id: 'g3-q6',
    media: '/images/g3-q6.png',
    claim: 'ภาพถ่าย: หญิงสูงอายุชาวไทยกำลังใช้เตาถ่านปรุงขนมหวานโบราณในครัวหลังบ้าน',
    isAi: false,
    aiDisclosure: '',
    explanation: 'ภาพนี้เป็นภาพถ่ายจริง สังเกตละอองขี้เถ้าและควันลอยฟุ้งเป็นธรรมชาติไม่เนียนจนเกินไป พื้นหลังมีอุปกรณ์ทำครัววางรกตามครรลองครัวไทยของจริงที่ผ่านการใช้งานมานาน ปราศจากความสมมาตรบิดเบี้ยว',
    speakerText: 'ภาพปรุงขนมไทยด้วยเตาถ่าน ภาพนี้คือภาพถ่ายจริงครับ ควันไฟกระจายตัวธรรมชาติ เครื่องใช้ในครัวมีฝุ่นผงคราบเขม่าจริง ไม่มีจุดผิดธรรมชาติของสัดส่วนครับ',
    hotspots: []
  }
];

export default function G3AIOrNot({ onFinish, logEvent }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null); // 'ai' or 'real'
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [zoomMode, setZoomMode] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = React.useRef(window.speechSynthesis);

  const currentQuestion = QUESTIONS[currentIdx];

  const handleSpeak = (text) => {
    if (!synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      logEvent('toggle_audio', { action: 'mute', question_id: currentQuestion.id });
      return;
    }

    logEvent('toggle_audio', { action: 'play', question_id: currentQuestion.id });
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const handleAnswer = (choice) => {
    setSelected(choice);
    const answerIsAi = choice === 'ai';
    const isCorrect = answerIsAi === currentQuestion.isAi;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    logEvent('answer_question', {
      game_id: 'G3',
      question_id: currentQuestion.id,
      answer: choice,
      is_correct: isCorrect
    });
  };

  const handleNext = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
    setZoomMode(false);

    if (currentIdx < QUESTIONS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelected(null);
      logEvent('enter_question', { game_id: 'G3', question_id: QUESTIONS[nextIdx].id });
    } else {
      const starRating = correctAnswers >= 6 ? 3 : correctAnswers >= 4 ? 2 : 1;
      logEvent('game_complete', { game_id: 'G3', score: correctAnswers, stars: starRating });
      onFinish(starRating);
    }
  };

  const isAnswered = selected !== null;
  const isCurrentCorrect = (selected === 'ai') === currentQuestion.isAi;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Header toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {QUESTIONS.map((q, idx) => (
              <div 
                key={q.id} 
                style={{ 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  backgroundColor: idx === currentIdx 
                    ? 'var(--primary)' 
                    : idx < currentIdx 
                      ? 'var(--primary-dark)' 
                      : 'var(--border)'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Zoom Button for Seniors */}
            <button
              onClick={() => {
                setZoomMode(!zoomMode);
                logEvent('toggle_zoom', { question_id: currentQuestion.id, zoom: !zoomMode });
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-app)',
                border: '2px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                minHeight: '44px'
              }}
            >
              {zoomMode ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              <span>{zoomMode ? 'ขนาดปกติ' : 'ซูมขยาย'}</span>
            </button>

            {/* Audio Button */}
            <button
              onClick={() => handleSpeak(isAnswered ? currentQuestion.explanation : currentQuestion.speakerText)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: speaking ? 'var(--primary-light)' : 'var(--bg-app)',
                border: '2px solid var(--primary)',
                color: 'var(--primary-dark)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                minHeight: '44px'
              }}
            >
              {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span>เสียงอ่าน</span>
            </button>
          </div>
        </div>

        {/* Question claim */}
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>หัวข้อวิเคราะห์:</span>
          <p style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: '1.4' }}>{currentQuestion.claim}</p>
        </div>

        {/* Zoomable Image Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          backgroundColor: '#000000',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '3px solid var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <img 
            src={currentQuestion.media} 
            alt="Question media" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: zoomMode ? 'none' : 'cover',
              objectPosition: 'center',
              transform: zoomMode ? 'scale(1.5)' : 'scale(1)',
              transition: 'transform 0.3s ease-out'
            }}
          />

          {/* AI Disclosure Label Overlay (US-GAME-03 AC 3) */}
          {currentQuestion.aiDisclosure && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 5
            }}>
              {currentQuestion.aiDisclosure}
            </div>
          )}

          {/* Hotspot Circles on Answered (US-GAME-03 AC 2) */}
          {isAnswered && currentQuestion.isAi && currentQuestion.hotspots.map((spot, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: spot.x,
                top: spot.y,
                width: spot.w,
                height: spot.h,
                transform: 'translate(-50%, -50%)',
                border: '4px solid var(--accent-error)',
                borderRadius: '50%',
                backgroundColor: 'rgba(220, 38, 38, 0.25)',
                boxShadow: '0 0 0 8px rgba(220, 38, 38, 0.2), 0 0 15px rgba(220, 38, 38, 0.5)',
                animation: 'pulse 1.5s infinite',
                cursor: 'pointer',
                zIndex: 4
              }}
              title={spot.label}
            >
              {/* Small popup tooltip for hotspot */}
              <div style={{
                position: 'absolute',
                bottom: '110%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--accent-error)',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {spot.label}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.9; }
            50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.9; }
          }
        `}</style>

        {/* Options Selection */}
        {!isAnswered ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <button 
              onClick={() => handleAnswer('ai')} 
              className="btn btn-outline"
              style={{ fontSize: '22px', minHeight: '64px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              🤖 สร้างโดย AI
            </button>
            <button 
              onClick={() => handleAnswer('real')} 
              className="btn btn-outline"
              style={{ fontSize: '22px', minHeight: '64px', borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
            >
              📸 ภาพถ่ายจริง
            </button>
            <button 
              onClick={() => handleAnswer('unsure')} 
              className="btn btn-outline"
              style={{ fontSize: '22px', minHeight: '64px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              🤷 ไม่แน่ใจ / ต้องเช็กก่อน
            </button>
          </div>
        ) : (
          /* Answer feedback with explanation */
          <div style={{ marginTop: '8px', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              color: isCurrentCorrect ? 'var(--accent-success)' : selected === 'unsure' ? 'var(--primary-dark)' : 'var(--accent-error)', 
              justifyContent: 'center', 
              marginBottom: '12px' 
            }}>
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 size={28} />
                  <strong style={{ fontSize: '22px' }}>เก่งมากครับ ถูกต้อง!</strong>
                </>
              ) : selected === 'unsure' ? (
                <>
                  <CheckCircle2 size={28} color="var(--primary)" />
                  <strong style={{ fontSize: '22px' }}>เป็นทางเลือกที่รอบคอบมากครับ!</strong>
                </>
              ) : (
                <>
                  <AlertTriangle size={28} />
                  <strong style={{ fontSize: '22px' }}>ยังไม่ถูกนะครับ มาดูเฉลยกัน</strong>
                </>
              )}
            </div>
            
            <div className="premium-card" style={{ backgroundColor: 'var(--primary-light)', padding: '16px', textAlign: 'left' }}>
              <strong style={{ fontSize: '18px', display: 'block', marginBottom: '6px', color: 'var(--primary-dark)' }}>
                วิเคราะห์ชี้จุดสังเกต:
              </strong>
              <p style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {selected === 'unsure' ? 'การหยุดดูและไม่แน่ใจไว้ก่อนเมื่อเห็นสิ่งผิดปกติ คือทักษะการรู้เท่าทันสื่อที่ยอดเยี่ยมครับ! ' : ''}
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Navigation Button */}
      <button 
        onClick={handleNext} 
        className="btn btn-primary"
        disabled={!isAnswered}
        style={{ fontSize: '22px', minHeight: '64px', marginTop: '24px' }}
      >
        <span>{currentIdx < QUESTIONS.length - 1 ? 'ข้อถัดไป' : 'เสร็จสิ้นบทเรียน'}</span>
        <ArrowRight size={24} />
      </button>
    </div>
  );
}
