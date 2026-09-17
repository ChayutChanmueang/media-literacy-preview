import React, { useState, useEffect } from 'react';
import Button3D from './Button3D';
import FullscreenImageViewer from './FullscreenImageViewer';
import GameAnswerButton from './GameAnswerButton';
import GameIntro from './GameIntro';
import GameSolutionCard from './GameSolutionCard';
import QUESTION_POOL from '@/data/g3-questions.json';

// US-GAME-03-R2: สุ่มโจทย์จากคลัง (pool) — คุมสัดส่วนภาพปลอม (AI/ตัดต่อ) กับภาพจริงให้สมดุลต่อรอบ
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// เลือกโจทย์ 1 รอบ: แบ่งครึ่งภาพปลอม/ภาพจริง แล้วสลับลำดับ; เผื่อ pool ฝั่งใดไม่พอก็เติมจากที่เหลือ
const pickRoundQuestions = () => {
  const { questionsPerRound, pool } = QUESTION_POOL;
  const n = Math.min(questionsPerRound, pool.length);
  const fake = pool.filter((q) => q.isAi);
  const real = pool.filter((q) => !q.isAi);
  const nFake = Math.min(Math.ceil(n / 2), fake.length);
  const nReal = Math.min(n - nFake, real.length);
  let picked = [...shuffle(fake).slice(0, nFake), ...shuffle(real).slice(0, nReal)];
  if (picked.length < n) {
    const rest = shuffle(pool.filter((q) => !picked.includes(q))).slice(0, n - picked.length);
    picked = picked.concat(rest);
  }
  return shuffle(picked);
};

export default function G3AIOrNot({ onFinish, logEvent }) {
  const [showIntro, setShowIntro] = useState(true); // US-CF-03: หน้าแนะนำก่อนเริ่มเกม
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null); // 'ai' or 'real'
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false); // US-UX-07: หยุดตัวนับ auto-advance ระหว่างผู้ใช้อ่าน/เลื่อนเฉลย
  // US-GAME-03-R2: สุ่มชุดโจทย์ครั้งเดียวตอนเริ่มเกม (mount) — เล่นซ้ำ = ชุด/ลำดับใหม่
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
    setFullscreen(false);
    setAutoPaused(false); // US-UX-07: โจทย์ถัดไปให้ตัวนับ auto-advance เริ่มนับใหม่เสมอ

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelected(null);
      logEvent('enter_question', { game_id: 'G3', question_id: questions[nextIdx].id });
    } else {
      // US-GAME-03-R2: เกณฑ์ดาวคิดเป็นสัดส่วนของจำนวนข้อที่เล่นจริง (ไม่ hardcode 6)
      const total = questions.length;
      const ratio = total > 0 ? correctAnswers / total : 0;
      const starRating = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
      logEvent('game_complete', { game_id: 'G3', score: correctAnswers, total, stars: starRating });
      onFinish(starRating);
    }
  };

  const isAnswered = selected !== null;
  const isCurrentCorrect = (selected === 'ai') === currentQuestion.isAi;

  // US-CF-03: หน้าแนะนำวัตถุประสงค์ + วิธีเล่น ก่อนเริ่มโจทย์แรก
  if (showIntro) {
    return (
      <GameIntro
        title="เอไอ หรือ ของจริง"
        objective="ดูภาพแล้วช่วยกันสังเกตว่าเป็นภาพถ่ายจริง หรือภาพที่ AI สร้างขึ้น"
        choices="จริง · ปลอม · ไม่แน่ใจ"
        imageSrc="/assets/icon-game/g3-icon.png"
        onStart={() => {
          setShowIntro(false);
          logEvent('game_intro_start', { game_id: 'G3' });
        }}
      />
    );
  }

  // Figma node 2065:7190 (โจทย์: ภาพเต็มความกว้างบนพื้นดำ) / 2065:7021, 2065:7033 (เฉลย)
  return (
    <div className={`flex flex-col flex-1 min-h-0 ${isAnswered ? 'bg-white' : 'bg-[#D9D9D9]'}`}>
      {fullscreen && (
        <FullscreenImageViewer
          src={currentQuestion.media}
          alt={currentQuestion.claim}
          onClose={() => setFullscreen(false)}
        />
      )}

      {!isAnswered ? (
        <>
          {/* object-contain: เห็นภาพเต็มใบเสมอ (จุดสังเกตว่าเป็นภาพ AI มักอยู่ริมภาพ); แตะเพื่อดูเต็มจอ */}
          <div
            className="flex-1 min-h-0 overflow-hidden bg-black cursor-zoom-in"
            onClick={() => {
              setFullscreen(true);
              logEvent('open_fullscreen_image', { question_id: currentQuestion.id });
            }}
          >
            <img
              src={currentQuestion.media}
              alt="Question media"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="shrink-0 flex gap-[8px] px-[24px] pb-[64px] pt-[48px]">
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
              onClick={() => handleAnswer('ai')}
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
          {/* Reveal — Figma nodes 2065:7021 / 2065:7033 (การ์ดเฉลยกลาง ใช้ร่วมทุกเกม) */}
          <GameSolutionCard
            tone={isCurrentCorrect || selected === 'unsure' ? 'correct' : 'wrong'}
            banner={isCurrentCorrect ? 'ถูกต้อง' : selected === 'unsure' ? 'รอบคอบมาก' : 'ไม่ถูกต้อง'}
            heading={
              currentQuestion.isAi
                ? /* US-GAME-03-R2: บอกชัดว่าปลอมแบบไหน — AI สร้าง หรือ ภาพตัดต่อ */
                  currentQuestion.category === 'edited'
                  ? 'ทำไมภาพนี้ถึงเป็นภาพตัดต่อ?'
                  : 'ทำไมภาพนี้ถึงเป็นภาพที่ AI สร้าง?'
                : 'ทำไมภาพนี้เป็นของจริง'
            }
            onReadingChange={setAutoPaused}
          >
            {selected === 'unsure' && (
              <p className="mb-[16px] font-semibold">
                การหยุดดูและไม่แน่ใจไว้ก่อนเมื่อเห็นสิ่งผิดปกติ คือทักษะการรู้เท่าทันสื่อที่ยอดเยี่ยม!
              </p>
            )}
            <p>{currentQuestion.explanation}</p>
          </GameSolutionCard>

          <div className="shrink-0 px-[24px] pb-[64px] pt-[22px]">
            <Button3D
              key={`g3-next-${currentIdx}`}
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
