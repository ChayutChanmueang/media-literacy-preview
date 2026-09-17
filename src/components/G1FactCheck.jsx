import React, { useState, useEffect } from 'react';
import Button3D from './Button3D';
import GameAnswerButton from './GameAnswerButton';
import GameIntro from './GameIntro';
import GameSolutionCard from './GameSolutionCard';
import NewsMessageView from './NewsMessageView';
import RichText from './RichText';

const QUESTIONS = [
  {
    id: 'g1-q1',
    type: 'text',
    claim: '🚨 แชร์ด่วน! หอมหัวใหญ่หั่นครึ่งซีก วางไว้ในห้องนอนก่อนนอน ช่วยดูดซับเชื้อไวรัสไข้หวัดใหญ่และเชื้อโรคในอากาศได้หมดจด ง่ายกว่าไปฉีดวัคซีน หลายคนลองแล้วได้ผลจริง รีบแชร์ให้คนในครอบครัว ป้องกันคนที่เรารักจากเชื้อโรคด้วยความรู้พื้นบ้าน !',
    answer: 'fake', // fake = น่าจะปลอม/มั่ว, real = น่าจะจริง
    explanation: '• เร่งให้รีบแชร์เช่น "แชร์ด่วน!" ไม่ให้เราหยุดคิด\n• อ้างสรรพคุณเกินจริง เช่น "ดูดซับเชื้อโรคได้หมดจด"\n• ไม่มีแหล่งข้อมูลหรือผู้เชี่ยวชาญอ้างอิง\n• แนะนำให้เลิกวิธีป้องกันที่มีหลักฐานทางการแพทย์เช่น "ไม่ต้องฉีดวัคซีน"',
    speakerText: 'แชร์ด่วน หอมหัวใหญ่หั่นครึ่งซีก วางไว้ในห้องนอน ช่วยดูดซับเชื้อไวรัสไข้หวัดใหญ่และเชื้อโรคได้หมดจด เรื่องนี้มั่ว จุดสังเกตคือมีการเร่งให้รีบแชร์ อ้างสรรพคุณเกินจริง ไม่มีแหล่งข้อมูลอ้างอิง และแนะนำให้เลิกวิธีป้องกันทางการแพทย์'
  },
  {
    id: 'g1-q2',
    type: 'text',
    claim: 'ประกาศด่วน! กรมการขนส่งทางบกเตรียมปรับขึ้นค่าธรรมเนียมทำและต่อใบขับขี่ 2 เท่า เริ่มเดือนหน้า รีบแชร์ให้คนรู้ก่อนสิ้นเดือน!',
    answer: 'fake',
    explanation: '• ใช้คำว่า "ประกาศด่วน" และ "รีบแชร์" เร่งให้ทำโดยไม่คิด\n• บอกว่า ขึ้น 2 เท่า แต่ไม่มีรายละเอียด\n• ระบุเวลาไม่ชัดเจน เช่น "เดือนหน้า"',
    speakerText: 'ประกาศด่วน กรมการขนส่งทางบกเตรียมปรับขึ้นค่าธรรมเนียมทำและต่อใบขับขี่ 2 เท่า เรื่องนี้มั่ว จุดสังเกตคือใช้คำว่าประกาศด่วนและรีบแชร์ บอกว่าขึ้น 2 เท่าแต่ไม่มีรายละเอียด และระบุเวลาไม่ชัดเจน'
  },
  {
    id: 'g1-q3',
    type: 'text',
    claim: 'ข่าวสารสุขภาพ ดื่มน้ำมะนาวผสมโซดาร้อนตอนเช้าขณะท้องว่าง สามารถทำลายเซลล์มะเร็งได้ดีและช่วยบำรุงสุขภาพร่างกายทั่วไป',
    answer: 'fake',
    explanation: 'สำนักงานคณะกรรมการอาหารและยา (อย.) ยืนยันว่า **ไม่เป็นความจริง** น้ำมะนาวผสมโซดาไม่มีฤทธิ์รักษาหรือต้านโรคมะเร็ง และการดื่มขณะท้องว่างอาจทำให้ระคายเคืองกระเพาะอาหารได้ ข้อมูลนี้ใช้สูตรรักษาโรคเกินจริงเพื่อหลอกล่อให้แชร์ต่อ',
    speakerText: 'การดื่มน้ำมะนาวผสมโซดาร้อนรักษาโรคมะเร็ง เรื่องนี้มั่ว อย. ยืนยันว่าไม่เป็นความจริง มะนาวโซดาไม่มีฤทธิ์รักษามะเร็ง และอาจทำให้แสบท้องได้'
  },
  {
    id: 'g1-q4',
    type: 'text',
    claim: 'กรมอุตุนิยมวิทยา แจ้งเตือนประชาชนในพื้นที่ ภาคเหนือและภาคตะวันออกเฉียงเหนือ ระวังพายุฝนฟ้าคะนอง ลมกระโชกแรง และลูกเห็บตกบางแห่ง ขอให้หลีกเลี่ยงพื้นที่โล่งแจ้ง ใต้ต้นไม้ใหญ่ และติดตามประกาศจากทางราชการอย่างใกล้ชิด',
    answer: 'real',
    explanation: '• ✅ ระบุหน่วยงานราชการชัดเจน (กรมอุตุนิยมวิทยา)\n• ✅ แจ้งพื้นที่ที่ได้รับผลกระทบอย่างชัดเจน\n• ✅ เป็นคำเตือนเพื่อความปลอดภัย ไม่ชวนให้รีบแชร์\n• ✅ แนะนำให้ติดตามประกาศจากทางการ ไม่กล่าวอ้างเกินจริง',
    speakerText: 'กรมอุตุนิยมวิทยา แจ้งเตือนประชาชนในพื้นที่ภาคเหนือและภาคตะวันออกเฉียงเหนือ ระวังพายุฝนฟ้าคะนอง เรื่องนี้จริง จุดสังเกตคือระบุหน่วยงานราชการชัดเจน แจ้งพื้นที่ชัดเจน เป็นคำเตือนเพื่อความปลอดภัย และไม่กล่าวอ้างเกินจริง'
  },
  {
    id: 'g1-q5',
    type: 'text',
    claim: 'รัฐบาลอนุมัติ เงินช่วยค่าครองชีพผู้สูงอายุ 3,000 บาท ผู้มีสิทธิ์ต้อง ยืนยันตัวตนภายในวันนี้ โดยดาวน์โหลดแอปผ่านลิงก์ที่แนบ มิฉะนั้นจะถูกตัดสิทธิ์',
    answer: 'fake',
    explanation: 'หน่วยงานภาครัฐจะประกาศโครงการผ่านช่องทางทางการ และไม่เร่งให้ประชาชนกดลิงก์หรือดาวน์โหลดแอปจากข้อความที่ส่งต่อกัน หากได้รับข้อความลักษณะนี้ ควรตรวจสอบกับเว็บไซต์หรือเพจทางการของหน่วยงานก่อนเสมอ',
    speakerText: 'รัฐบาลอนุมัติ เงินช่วยค่าครองชีพผู้สูงอายุ 3,000 บาท ผู้มีสิทธิ์ต้องยืนยันตัวตนภายในวันนี้ผ่านลิงก์ เรื่องนี้มั่ว หน่วยงานภาครัฐจะไม่เร่งให้ประชาชนกดลิงก์จากข้อความที่ส่งต่อกัน หากได้รับควรตรวจสอบกับเพจทางการก่อน'
  }
];

export default function G1FactCheck({ onFinish, logEvent }) {
  const [showIntro, setShowIntro] = useState(true); // US-CF-03: หน้าแนะนำก่อนเริ่มเกม
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null); // 'real' or 'fake'
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false); // US-UX-07: หยุดตัวนับ auto-advance ระหว่างผู้ใช้อ่าน/เลื่อนเฉลย

  const currentQuestion = QUESTIONS[currentIdx];

  // US-FLOW-02: รายงานความคืบหน้าต่อโจทย์ให้ progress bar (AppLayout ฟัง event นี้)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flowStepProgress', { detail: currentIdx / QUESTIONS.length }));
    }
  }, [currentIdx]);

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
    setAutoPaused(false); // US-UX-07: โจทย์ถัดไปให้ตัวนับ auto-advance เริ่มนับใหม่เสมอ
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

  // US-CF-03: หน้าแนะนำวัตถุประสงค์ + วิธีเล่น ก่อนเริ่มโจทย์แรก
  if (showIntro) {
    return (
      <GameIntro
        title="เกมจริงหรือมั่ว"
        objective="อ่านข้อความต่อไปนี้ แล้วพิจารณาว่าจริงหรือไม่ แล้วเลือกตอบ"
        choices="จริง · ปลอม · ไม่แน่ใจ"
        imageSrc="/assets/icon-game/g1-icon.png"
        onStart={() => {
          setShowIntro(false);
          logEvent('game_intro_start', { game_id: 'G1' });
        }}
      />
    );
  }

  // Figma node 2065:7104 (โจทย์ พื้น #E8EAF3) / 2065:7021, 2065:7033 (เฉลย พื้นขาว)
  return (
    <div className={`flex flex-col flex-1 min-h-0 ${isAnswered ? 'bg-white' : 'bg-[#E8EAF3]'}`}>
      {!isAnswered ? (
        <>
          <div className="flex-1 min-h-0 flex flex-col pt-[24px]">
            <NewsMessageView
              claim={currentQuestion.claim}
              seed={currentIdx}
              className="flex-1 min-h-0"
            />
          </div>

          <div className="shrink-0 flex gap-[8px] px-[24px] pb-[64px] pt-[36px]">
            <GameAnswerButton
              tone="green"
              iconSrc="/images/games/answer-true.svg"
              label="จริง"
              onClick={() => handleAnswer('real')}
            />
            <GameAnswerButton
              tone="red"
              iconSrc="/images/games/answer-fake.svg"
              label="ปลอม"
              onClick={() => handleAnswer('fake')}
            />
            <GameAnswerButton
              tone="yellow"
              iconSrc="/images/games/answer-unsure.svg"
              label="ไม่แน่ใจ"
              onClick={() => handleAnswer('unsure')}
            />
          </div>
        </>
      ) : (
        <>
          <GameSolutionCard
            tone={isCurrentCorrect || selected === 'unsure' ? 'correct' : 'wrong'}
            banner={isCurrentCorrect ? 'ถูกต้อง' : selected === 'unsure' ? 'รอบคอบมาก' : 'ไม่ถูกต้อง'}
            heading={currentQuestion.answer === 'fake' ? 'ทำไมข่าวนี้ถึงน่าสงสัย' : 'ทำไมข่าวนี้เชื่อถือได้'}
            onReadingChange={setAutoPaused}
          >
            {selected === 'unsure' && (
              <p className="mb-[16px] font-semibold">
                การเลือกไม่แน่ใจและหยุดคิดเป็นขั้นตอนสำคัญที่สุดของการรู้เท่าทันสื่อ ดีกว่าการตัดสินใจเชื่อทันที!
              </p>
            )}
            <div className="whitespace-pre-line break-words">
              <RichText text={currentQuestion.explanation} />
            </div>
          </GameSolutionCard>

          <div className="shrink-0 px-[24px] pb-[64px] pt-[22px]">
            <Button3D
              key={`g1-next-${currentIdx}`}
              onClick={handleNext}
              onAutoAdvance={handleNext}
              autoAdvanceMs={30000}
              autoAdvancePaused={autoPaused}
            >
              กดเพื่อไปต่อ
            </Button3D>
          </div>
        </>
      )}
    </div>
  );
}
