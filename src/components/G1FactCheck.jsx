import React, { useState, useEffect } from 'react';
import Button3D from './Button3D';
import GameAnswerButton from './GameAnswerButton';
import GameIntro from './GameIntro';
import GameSolutionCard from './GameSolutionCard';
import NewsMessageView from './NewsMessageView';
import RichText from './RichText';

const QUESTIONS = [
  {
    id: 'g1-v2-q1',
    type: 'text',
    claim: 'คนไทยมีเฮ! โครงการกระตุ้นเศรษฐกิจปี 2567 เตรียมปรับเงินดิจิทัลวอลเล็ตเป็นเงินสด 10,000 บาท สำหรับผู้มีบัตรสวัสดิการแห่งรัฐและคนพิการ เริ่มโอนวันที่ 20 ก.ย. 69',
    answer: 'fake', // fake = น่าจะปลอม/มั่ว, real = น่าจะจริง
    explanation: '• โครงการได้เสร็จสิ้นแล้วตั้งแต่ปี 2567 และปี พ.ศ. ในข้อความไม่สอดคล้องกัน\n• ไม่มีแหล่งอ้างอิงข้อมูลที่ชัดเจนว่าหน่วยงานไหนเป็นผู้ประกาศ\n• ใช้คำกระตุ้นความสนใจ เช่น "คนไทยมีเฮ!"',
    speakerText: 'คนไทยมีเฮ โครงการกระตุ้นเศรษฐกิจปี 2567 เตรียมปรับเงินดิจิทัลวอลเล็ตเป็นเงินสด 10,000 บาท เรื่องนี้มั่ว จุดสังเกตคือโครงการเสร็จสิ้นไปแล้วและปีในข้อความไม่สอดคล้องกัน ไม่มีแหล่งอ้างอิงว่าหน่วยงานไหนประกาศ และใช้คำกระตุ้นความสนใจ'
  },
  {
    id: 'g1-v2-q2',
    type: 'text',
    claim: 'กรมควบคุมโรคเผยสถานการณ์โควิด 19 ในประเทศไทยยังพบผู้ป่วยต่อเนื่องตาม ย้ำระบบสาธารณสุขมีความพร้อมแนะประชาชนรู้เท่าทันโรคและการเปลี่ยนแปลงของสายพันธุ์',
    answer: 'real',
    explanation: '• ✅ มีแหล่งอ้างอิงชัดเจน คือ กรมควบคุมโรค ซึ่งสามารถตรวจสอบข้อมูลได้\n• ✅ เป็นการให้ข้อมูลข่าวสารและแจ้งเตือนเพื่อความปลอดภัยของประชาชน ไม่ได้เร่งให้ตัดสินใจ หรือรีบแชร์',
    speakerText: 'กรมควบคุมโรคเผยสถานการณ์โควิด 19 ในประเทศไทยยังพบผู้ป่วยต่อเนื่อง เรื่องนี้จริง จุดสังเกตคือมีแหล่งอ้างอิงชัดเจนคือกรมควบคุมโรค และเป็นการแจ้งเตือนเพื่อความปลอดภัย ไม่ได้เร่งให้ตัดสินใจหรือรีบแชร์'
  },
  {
    id: 'g1-v2-q3',
    type: 'text',
    claim: 'ประกาศด่วน! ผู้ใช้ไฟฟ้าสามารถชำระค่าไฟได้แล้ววันนี้ผ่านการแอด LINE ID 0810365548 สะดวกที่สุด ไม่ต้องไปชำระผ่านเคานเตอร์เซอร์วิส หรือธนาคารให้เสียเวลา',
    answer: 'fake',
    explanation: '• การไฟฟ้า หรือหน่วยงานรัฐไม่มีนโยบายให้ชำระเงินค่าไฟฟ้าผ่านการแอดไลน์ส่วนตัว\n• การทำธุรกรรมหรือติดต่อกับหน่วยงานรัฐ จะติดต่อผ่านช่องทางทางการเท่านั้น\n• มีการใช้คำกระตุ้นความสนใจและความรู้สึก เช่น "ประกาศด่วน" "สะดวกที่สุด"',
    speakerText: 'ประกาศด่วน ผู้ใช้ไฟฟ้าสามารถชำระค่าไฟผ่านการแอดไลน์ เรื่องนี้มั่ว จุดสังเกตคือการไฟฟ้าและหน่วยงานรัฐไม่มีนโยบายให้ชำระค่าไฟผ่านไลน์ส่วนตัว หน่วยงานรัฐติดต่อผ่านช่องทางทางการเท่านั้น และมีการใช้คำกระตุ้นความรู้สึก'
  },
  {
    id: 'g1-v2-q4',
    type: 'text',
    claim: 'สำนักงานหลักประกันสุขภาพแจงว่าสิทธิบัตรทอง 30 บาท ครอบคลุมการรักษาโรคหลอดเลือดหัวใจตามข้อบ่งชี้ทางการแพทย์ สอบถามข้อมูลเพิ่มเติมได้ที่สำนักงานหลักประกันสุขภาพใกล้บ้าน',
    answer: 'real',
    explanation: '• ✅ มีแหล่งอ้างอิงชัดเจน คือ สำนักงานหลักประกันสุขภาพ\n• ✅ ประชาชนสามารถตรวจสอบข้อมูลได้ที่สำนักงานหลักประกันสุขภาพใกล้บ้าน และสถานพยาบาลที่ใช้สิทธิอยู่\n• ✅ เป็นการให้ข้อมูลข่าวสารเพื่อสิทธิประโยชน์ของประชาชน ไม่ได้เร่งให้เกิดการตัดสินใจ',
    speakerText: 'สำนักงานหลักประกันสุขภาพแจงว่าสิทธิบัตรทอง 30 บาท ครอบคลุมการรักษาโรคหลอดเลือดหัวใจ เรื่องนี้จริง จุดสังเกตคือมีแหล่งอ้างอิงชัดเจน ประชาชนตรวจสอบข้อมูลได้ที่สำนักงานใกล้บ้าน และไม่ได้เร่งให้ตัดสินใจ'
  },
  {
    id: 'g1-v2-q5',
    type: 'text',
    claim: 'ต้องการเงินด่วน! ธนาคารออมสินเปิดเว็บไซต์ m.blffinanc ปล่อยกู้สินเชื่อส่วนบุคคล โดยให้กู้สูงสุด 5 เท่าของรายได้!',
    answer: 'fake',
    explanation: '• ชื่อเว็บไซต์ไม่น่าเชื่อถือ หากประชาชนต้องการทำธุรกรรมต้องทำผ่านช่องทางทางการของธนาคารเท่านั้น\n• มีคำที่เร่งการตัดสินใจและกระตุ้นความรู้สึก เช่น "ต้องการเงินด่วน"',
    speakerText: 'ต้องการเงินด่วน ธนาคารออมสินเปิดเว็บไซต์ปล่อยกู้สินเชื่อส่วนบุคคล เรื่องนี้มั่ว จุดสังเกตคือชื่อเว็บไซต์ไม่น่าเชื่อถือ ต้องทำธุรกรรมผ่านช่องทางทางการของธนาคารเท่านั้น และมีคำที่เร่งการตัดสินใจ'
  },
  {
    id: 'g1-v2-q6',
    type: 'text',
    claim: 'บอกต่อด่วน! กินมันเทศ ต่อเนื่อง 5 เดือน ทำให้ระดับน้ำตาลในเลือดและไขมันลดลง',
    answer: 'fake',
    explanation: '• ไม่มีแหล่งอ้างอิงข้อมูล\n• มีคำที่เร่งให้แชร์ต่อ เช่น "บอกต่อด่วน"\n• ปัจจุบันยังไม่มีหลักฐานเพียงพอที่จะสนับสนุนการใช้มันเทศเป็นการรักษาเบาหวาน',
    speakerText: 'บอกต่อด่วน กินมันเทศต่อเนื่อง 5 เดือน ทำให้ระดับน้ำตาลในเลือดและไขมันลดลง เรื่องนี้มั่ว จุดสังเกตคือไม่มีแหล่งอ้างอิง มีคำเร่งให้แชร์ต่อ และยังไม่มีหลักฐานเพียงพอว่ามันเทศรักษาเบาหวานได้'
  },
  {
    id: 'g1-v2-q7',
    type: 'text',
    claim: 'แพทย์ชี้! การดื่มน้ำมะนาวผสมน้ำอุ่น สามารถกำจัดติ่งเนื้อในถุงน้ำดีได้ ผู้สูงอายุควรดื่มเป็นประจำเพื่อร่างกายที่แข็งแรงและช่วยกำจัดติ่งเนื้อในถุงน้ำดีได้มีประสิทธิภาพยิ่งขึ้น',
    answer: 'fake',
    explanation: '• ไม่มีแหล่งอ้างอิงข้อมูลว่ามาจากหน่วยงานไหน หรือแพทย์ท่านใด\n• การรักษาโรคควรอยู่ภายใต้การพิจารณาของแพทย์ผู้เชี่ยวชาญ\n• ไม่มีหลักฐานทางการแพทย์ที่รองรับได้ว่า น้ำมะนาวสามารถกำจัดติ่งเนื้อในถุงน้ำดีได้',
    speakerText: 'แพทย์ชี้ การดื่มน้ำมะนาวผสมน้ำอุ่นสามารถกำจัดติ่งเนื้อในถุงน้ำดีได้ เรื่องนี้มั่ว จุดสังเกตคือไม่ระบุว่ามาจากหน่วยงานหรือแพทย์ท่านใด การรักษาโรคควรอยู่ภายใต้การดูแลของแพทย์ และไม่มีหลักฐานทางการแพทย์รองรับ'
  },
  {
    id: 'g1-v2-q8',
    type: 'text',
    claim: 'หมอเตือน! ผู้สูงวัยทานข้าวไรซ์เบอร์รี่-ข้าวกล้องทุกวัน เสี่ยงไตเสื่อม-หัวใจโต ระวังอาการหนักไม่รู้ตัว!',
    answer: 'fake',
    explanation: '• ไม่มีแหล่งอ้างอิงข้อมูลว่ามาจากหน่วยงานไหน หรือแพทย์ท่านใด\n• ใช้คำที่กระตุ้นความกลัว เช่น "หมอเตือน" "ระวังอาการหนักไม่รู้ตัว"\n• การรับประทานข้าวกล้องและข้าวไรซ์เบอร์รี่ ไม่ใช่อาหารที่ผู้สูงอายุทุกคนต้องหลีกเลี่ยง แต่การเลือกรับประทานจำกัดเฉพาะในผู้ป่วยโรคไตเรื้อรังระยะสุดท้าย',
    speakerText: 'หมอเตือน ผู้สูงวัยทานข้าวไรซ์เบอร์รี่และข้าวกล้องทุกวัน เสี่ยงไตเสื่อมและหัวใจโต เรื่องนี้มั่ว จุดสังเกตคือไม่ระบุว่ามาจากหน่วยงานหรือแพทย์ท่านใด ใช้คำกระตุ้นความกลัว และข้าวกล้องไม่ใช่อาหารที่ผู้สูงอายุทุกคนต้องหลีกเลี่ยง'
  },
  {
    id: 'g1-v2-q9',
    type: 'text',
    claim: 'คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่เตือนวูบ หน้ามืด สัญญาณอันตรายที่ไม่ควรมองข้าม เป็นอาการที่อาจเคยเกิดขึ้นกับหลายคนในขณะที่รีบลุกขึ้นยืน หรือเมื่ออยู่กลางแดดนาน ๆ',
    answer: 'real',
    explanation: '• ✅ มีแหล่งอ้างอิงชัดเจน คือ คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่ ซึ่งสามารถตรวจสอบข้อมูลได้\n• ✅ เป็นการให้ข้อมูลข่าวสารสุขภาพเพื่อความปลอดภัยของประชาชน และเป็นการเตือนให้ประชาชนหมั่นสังเกตอาการของตนเอง',
    speakerText: 'คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่เตือนอาการวูบ หน้ามืด เรื่องนี้จริง จุดสังเกตคือมีแหล่งอ้างอิงชัดเจนที่ตรวจสอบได้ และเป็นการให้ข้อมูลสุขภาพเพื่อความปลอดภัยของประชาชน'
  },
  {
    id: 'g1-v2-q10',
    type: 'text',
    claim: 'มหาวิทยาลัยจุฬาลงกรณ์ เปิดหลักสูตรฝึกอบรมครูออนไลน์สำหรับผู้สูงอายุ พร้อมมอบใบรับรองสำเร็จหลักสูตรเพียงแค่สแกนคิวอาร์โค้ดเพื่อลงทะเบียนเรียน',
    answer: 'fake',
    explanation: '• ชื่อมหาวิทยาลัยผิด ต้องเป็น จุฬาลงกรณ์มหาวิทยาลัย\n• มีการกระตุ้นให้สแกนคิวอาร์โค้ดเพื่อลงทะเบียนเรียน\n• หากสนใจข่าวสาร การรับสมัคร หรือหลักสูตรของมหาวิทยาลัย ควรตรวจสอบจากช่องทางสื่อสารอย่างเป็นทางการของจุฬาลงกรณ์มหาวิทยาลัยเท่านั้น',
    speakerText: 'มหาวิทยาลัยจุฬาลงกรณ์ เปิดหลักสูตรฝึกอบรมครูออนไลน์สำหรับผู้สูงอายุ เพียงสแกนคิวอาร์โค้ด เรื่องนี้มั่ว จุดสังเกตคือชื่อมหาวิทยาลัยผิด ที่ถูกคือจุฬาลงกรณ์มหาวิทยาลัย มีการกระตุ้นให้สแกนคิวอาร์โค้ด และควรตรวจสอบจากช่องทางทางการเท่านั้น'
  }
];

// สุ่มโจทย์จากคลัง QUESTIONS มาเล่นรอบละ 3 ข้อ (ไม่ต้องเล่นครบทั้งคลัง) — ใช้เหมือนกันทุกโหมด
const QUESTIONS_PER_ROUND = 3;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// เลือกโจทย์ 1 รอบ: มีทั้งข่าวมั่วและข่าวจริงปนกัน (มั่ว 2 / จริง 1) แล้วสลับลำดับ; เผื่อฝั่งใดไม่พอก็เติมจากที่เหลือ
const pickRoundQuestions = () => {
  const n = Math.min(QUESTIONS_PER_ROUND, QUESTIONS.length);
  const fake = QUESTIONS.filter((q) => q.answer === 'fake');
  const real = QUESTIONS.filter((q) => q.answer === 'real');
  const nFake = Math.min(Math.ceil(n / 2), fake.length);
  const nReal = Math.min(n - nFake, real.length);
  let picked = [...shuffle(fake).slice(0, nFake), ...shuffle(real).slice(0, nReal)];
  if (picked.length < n) {
    const rest = shuffle(QUESTIONS.filter((q) => !picked.includes(q))).slice(0, n - picked.length);
    picked = picked.concat(rest);
  }
  return shuffle(picked);
};

export default function G1FactCheck({ onFinish, logEvent }) {
  const [showIntro, setShowIntro] = useState(true); // US-CF-03: หน้าแนะนำก่อนเริ่มเกม
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null); // 'real' or 'fake'
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false); // US-UX-07: หยุดตัวนับ auto-advance ระหว่างผู้ใช้อ่าน/เลื่อนเฉลย

  // สุ่มชุดโจทย์ครั้งเดียวตอนเริ่มเกม (mount) — เล่นซ้ำ = ชุด/ลำดับใหม่
  const [questions] = useState(pickRoundQuestions);

  const currentQuestion = questions[currentIdx];

  // US-FLOW-02: รายงานความคืบหน้าต่อโจทย์ให้ progress bar (AppLayout ฟัง event นี้)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flowStepProgress', { detail: currentIdx / questions.length }));
    }
  }, [currentIdx, questions.length]);

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
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelected(null);
      logEvent('enter_question', { game_id: 'G1', question_id: questions[nextIdx].id });
    } else {
      // Game complete, award stars based on performance (min 1, max 3) — คิดเป็นสัดส่วนของจำนวนข้อที่เล่นจริง
      const total = questions.length;
      const ratio = total > 0 ? correctAnswers / total : 0;
      const starRating = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
      logEvent('game_complete', { game_id: 'G1', score: correctAnswers, total, stars: starRating });
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
        imageSrc="/assets/icons/g1-right-o-wrong.jpg"
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
