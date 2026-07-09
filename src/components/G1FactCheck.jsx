import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Volume2, VolumeX } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'g1-q1',
    type: 'text',
    claim: 'แชร์ด่วน! หอมหัวใหญ่หั่นครึ่งซีก ตั้งทิ้งไว้ในห้องนอน ช่วยดูดซับเชื้อไข้หวัดใหญ่และเชื้อโรคในอากาศได้หมดจด ปลอดภัยไม่ต้องฉีดวัคซีน',
    answer: 'fake', // fake = น่าจะปลอม/มั่ว, real = น่าจะจริง
    explanation: 'สถาบันมะเร็งแห่งชาติและกรมการแพทย์ชี้แจงว่า **ไม่มีหลักฐานทางวิทยาศาสตร์** รองรับว่าหอมหัวใหญ่สามารถดูดซับไวรัสหรือเชื้อโรคได้ และการหั่นทิ้งไว้อาจกลายเป็นแหล่งสะสมเชื้อราหรือแบคทีเรียแทน วิธีป้องกันไข้หวัดใหญ่ที่ดีที่สุดคือการฉีดวัคซีนประจำปีและการรักษาสุขอนามัย',
    speakerText: 'แชร์ด่วน หอมหัวใหญ่หั่นครึ่งซีก ตั้งทิ้งไว้ในห้องนอน ช่วยดูดซับเชื้อไข้หวัดใหญ่ได้หมดจด เรื่องนี้มั่วครับ กรมการแพทย์ชี้แจงว่าไม่มีหลักฐานวิทยาศาสตร์รองรับ หอมหัวใหญ่ที่หั่นทิ้งไว้อาจกลายเป็นแหล่งสะสมเชื้อราแทน'
  },
  {
    id: 'g1-q2',
    type: 'text',
    claim: 'ประกาศด่วน! กรมการขนส่งทางบกเตรียมปรับขึ้นค่าธรรมเนียมทำใบขับขี่ใหม่และต่ออายุบัตรเพิ่มขึ้นอีก 2 เท่าตัว เริ่มเดือนหน้าเป็นต้นไป',
    answer: 'fake',
    explanation: 'กรมการขนส่งทางบกออกมายืนยันว่า **เป็นข้อมูลเท็จ** ไม่มีการปรับขึ้นค่าธรรมเนียมใบขับขี่ใด ๆ ทั้งสิ้น อัตราค่าธรรมเนียมยังคงเป็นไปตามข้อกำหนดเดิม ข่าวนี้ใช้การพาดหัวให้ดูน่ากลัวเพื่อให้คนแชร์ต่อเยอะ ๆ',
    speakerText: 'ข้อมูลเรื่องปรับขึ้นค่าธรรมเนียมทำใบขับขี่เพิ่มขึ้นสองเท่าตัว เรื่องนี้มั่วครับ กรมการขนส่งทางบกยืนยันว่าไม่มีการปรับขึ้นค่าธรรมเนียมใดๆ ข่าวนี้สร้างขึ้นให้คนตกใจและแชร์ต่อ'
  },
  {
    id: 'g1-q3',
    type: 'text',
    claim: 'ข่าวสารการเตือนภัย: ดื่มน้ำมะนาวผสมโซดาร้อนตอนเช้าขณะท้องว่าง สามารถทำลายเซลล์มะเร็งได้ดีและช่วยบำรุงสุขภาพร่างกายทั่วไป',
    answer: 'fake',
    explanation: 'สำนักงานคณะกรรมการอาหารและยา (อย.) ยืนยันว่า **ไม่เป็นความจริง** น้ำมะนาวผสมโซดาไม่มีฤทธิ์รักษาหรือต้านโรคมะเร็ง และการดื่มขณะท้องว่างอาจทำให้ระคายเคืองกระเพาะอาหารได้ ข้อมูลนี้ใช้สูตรรักษาโรคเกินจริงเพื่อหลอกล่อให้แชร์ต่อ',
    speakerText: 'การดื่มน้ำมะนาวผสมโซดาร้อนรักษาโรคมะเร็ง เรื่องนี้มั่วครับ อย. ยืนยันว่าไม่เป็นความจริง มะนาวโซดาไม่มีฤทธิ์รักษามะเร็ง และอาจทำให้แสบท้องได้'
  },
  {
    id: 'g1-q4',
    type: 'text',
    claim: 'ข่าวสารการเตือนภัย: กรมอุตุนิยมวิทยาประกาศเตือนระวังพายุฝนฟ้าคะนอง ลมกระโชกแรง และลูกเห็บตกบางแห่งในภาคเหนือและอีสาน',
    answer: 'real',
    explanation: 'นี่คือ **รายงานสภาพอากาศปกติจากกรมอุตุนิยมวิทยา** ซึ่งเป็นหน่วยงานรัฐที่มีหน้าที่รับผิดชอบโดยตรง มีความน่าเชื่อถือสูง สามารถตรวจสอบได้จากเว็บไซต์อย่างเป็นทางการ (tmd.go.th) และประกาศนี้ไม่มีเจตนาหลอกลวงหรือลิงก์น่าสงสัย',
    speakerText: 'กรมอุตุนิยมวิทยาประกาศเตือนพายุฝนฟ้าคะนองในภาคเหนือและอีสาน เรื่องนี้จริงครับ เป็นการแจ้งเตือนภัยธรรมชาติตามปกติจากหน่วยงานราชการโดยตรงเพื่อความปลอดภัย'
  },
  {
    id: 'g1-q5',
    type: 'text',
    claim: 'ด่วนที่สุด! รัฐบาลแจกเงินพิเศษช่วยค่าครองชีพผู้สูงอายุ 3,000 บาทต่อคน ให้รีบแตะลิงก์ที่แนบนี้เพื่อดาวน์โหลดแอปสวัสดิการยืนยันสิทธิ์ทันที',
    answer: 'fake',
    explanation: 'กรมกิจการผู้สูงอายุยืนยันว่า **ไม่มีโครงการนี้และลิงก์ดังกล่าวเป็นของมิจฉาชีพ** รัฐบาลไม่มีการแจกเงินผ่านการกดลิงก์ลักษณะนี้ ลิงก์ที่แนบมักเป็นช่องทางติดตั้งแอปควบคุมมือถือระยะไกลเพื่อดูดเงินในบัญชี',
    speakerText: 'ด่วนที่สุด รัฐบาลแจกเงินพิเศษผู้สูงอายุสามพันบาทให้กดลิงก์ยืนยันสิทธิ์ เรื่องนี้มั่วและเป็นอันตรายมากครับ มิจฉาชีพใช้ลิงก์นี้เพื่อติดตั้งแอปดูดเงินในมือถือของท่าน'
  }
];

export default function G1FactCheck({ onFinish, logEvent }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null); // 'real' or 'fake'
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = React.useRef(window.speechSynthesis);
  const utteranceRef = React.useRef(null);

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
    utterance.rate = 0.9; // Slightly slower for elderly
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    utteranceRef.current = utterance;
    setSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const handleAnswer = (choice) => {
    setSelected(choice);
    const isCorrect = choice === currentQuestion.answer;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    logEvent('answer_question', {
      game_id: 'G1',
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

    if (currentIdx < QUESTIONS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelected(null);
      logEvent('enter_question', { game_id: 'G1', question_id: QUESTIONS[nextIdx].id });
    } else {
      // Game complete, award stars based on performance (min 1, max 3)
      const starRating = correctAnswers >= 5 ? 3 : correctAnswers >= 3 ? 2 : 1;
      logEvent('game_complete', { game_id: 'G1', score: correctAnswers, stars: starRating });
      onFinish(starRating);
    }
  };

  const isAnswered = selected !== null;
  const isCurrentCorrect = selected === currentQuestion.answer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Progress bar and audio button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Progress indicators */}
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

          {/* Large Speaker Button for Accessibility */}
          <button
            onClick={() => handleSpeak(isAnswered ? currentQuestion.explanation : currentQuestion.speakerText)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: speaking ? 'var(--primary-light)' : 'var(--bg-app)',
              border: '2px solid var(--primary)',
              color: 'var(--primary-dark)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              minHeight: '48px'
            }}
          >
            {speaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span>{speaking ? 'ปิดเสียงอ่าน' : 'ฟังเสียงอ่าน'}</span>
          </button>
        </div>

        {/* Question Panel */}
        <div className="premium-card" style={{ padding: '24px', textAlign: 'left', borderLeft: '6px solid var(--primary)' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>ข่าวสารที่แชร์มา:</span>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px', lineHeight: '1.5' }}>
            "{currentQuestion.claim}"
          </p>
        </div>

        {/* Action Panel */}
        {!isAnswered ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <button 
              onClick={() => handleAnswer('real')} 
              className="btn btn-outline"
              style={{ fontSize: '22px', minHeight: '64px', borderColor: 'var(--accent-success)', color: 'var(--accent-success)' }}
            >
              👍 น่าจะจริง
            </button>
            <button 
              onClick={() => handleAnswer('fake')} 
              className="btn btn-outline"
              style={{ fontSize: '22px', minHeight: '64px', borderColor: 'var(--accent-error)', color: 'var(--accent-error)' }}
            >
              👎 น่าจะปลอม (มั่ว)
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
          /* Feedback Explanation Panel */
          <div style={{ marginTop: '12px', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              color: isCurrentCorrect ? 'var(--accent-success)' : selected === 'unsure' ? 'var(--primary-dark)' : 'var(--accent-error)', 
              justifyContent: 'center', 
              marginBottom: '16px' 
            }}>
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 size={32} />
                  <strong style={{ fontSize: '24px' }}>เก่งมากครับ ถูกต้องแล้ว!</strong>
                </>
              ) : selected === 'unsure' ? (
                <>
                  <CheckCircle2 size={32} color="var(--primary)" />
                  <strong style={{ fontSize: '24px' }}>เป็นทางเลือกที่รอบคอบมากครับ!</strong>
                </>
              ) : (
                <>
                  <AlertTriangle size={32} />
                  <strong style={{ fontSize: '24px' }}>ยังไม่ถูกนะครับ มาดูเฉลยกัน</strong>
                </>
              )}
            </div>
            
            <div className="premium-card" style={{ backgroundColor: 'var(--primary-light)', padding: '20px', textAlign: 'left' }}>
              <strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px', color: 'var(--primary-dark)' }}>
                คำอธิบายและจุดสังเกต:
              </strong>
              <p style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {selected === 'unsure' ? 'การเลือกไม่แน่ใจและหยุดคิดเป็นขั้นตอนสำคัญที่สุดของการรู้เท่าทันสื่อ ดีกว่าการตัดสินใจเชื่อทันทีครับ! ' : ''}
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Button */}
      <button 
        onClick={handleNext} 
        className="btn btn-primary"
        disabled={!isAnswered}
        style={{ fontSize: '22px', minHeight: '64px', marginTop: '24px' }}
      >
        <span>{currentIdx < QUESTIONS.length - 1 ? 'ข้อถัดไป' : 'ดูคะแนนสรุป'}</span>
        <ArrowRight size={24} />
      </button>
    </div>
  );
}
