import React, { useState } from 'react';
import { Star, Lock, BookOpen, Award, ArrowRight } from 'lucide-react';
import { loggingService } from '../services/loggingService';

const LESSONS = [
  {
    id: 'topic-1',
    title: 'บทที่ 1: รู้เท่าทันข่าวสาร',
    subTitle: 'ใคร ๆ ก็ทำสื่อได้ / จริงหรือมั่ว?',
    desc: 'ฝึกวิเคราะห์ข้อมูลข่าวสารและหัวข้อข่าวที่แชร์ต่อๆ กันในกลุ่มไลน์',
    badge: 'ข่าวสารออนไลน์'
  },
  {
    id: 'topic-2',
    title: 'บทที่ 2: สัญญาณมิจฉาชีพ',
    subTitle: 'จับสัญญาณเตือนแอบอ้างสแกม',
    desc: 'หัดจับผิดจุดเสี่ยงอันตรายและข้อความต้องสงสัยทาง SMS และ LINE',
    badge: 'ป้องกันสแกม'
  },
  {
    id: 'topic-6',
    title: 'บทที่ 3: จำลองแชท LINE',
    subTitle: 'จับสัญญาณมิจในแชทจำลอง (G6)',
    desc: 'ฝึกแตะจุดผิดปกติในห้องแชท LINE จำลองที่มิจฉาชีพทักเข้ามาหลอกลวงหลายรูปแบบ',
    badge: 'จำลองสถานการณ์'
  },
  {
    id: 'topic-5',
    title: 'บทที่ 4: หยุด คิด ถาม ทำ',
    subTitle: 'กางโล่สะกดภัยออนไลน์ (G5)',
    desc: 'ฝึกสติชะลอการตอบสนองความเร็วด้วยการกางโล่ป้องกันสแกมและข้อความล่อลวงเสี่ยงอันตราย',
    badge: 'สร้างกำลังใจ'
  },
  {
    id: 'topic-3',
    title: 'บทที่ 5: สังเกตสื่อจาก AI',
    subTitle: 'Deepfake / AI หรือ ของจริง',
    desc: 'เรียนรู้วิธีสังเกตรายละเอียดภาพใบหน้าและจุดบกพร่องที่สร้างจาก AI',
    badge: 'เทคโนโลยี AI'
  }
];

export default function LessonSelector({ 
  progress, 
  onSelectLesson, 
  onGoToCertificate, 
  onStartFlowMode, 
  onStartManualMode 
}) {
  // Determine active sub-page based on persisted learningMode
  const [activeSubPage, setActiveSubPage] = useState(
    progress.learningMode === 'manual' ? 'lessons' : 'modes'
  );

  // Helper to determine if a lesson is unlocked
  const isLessonUnlocked = (lessonId, idx) => {
    if (idx === 0) return true; // First lesson is always unlocked
    
    // Unlocked if previous lesson is completed (exists in completed list or has stars)
    const prevLessonId = LESSONS[idx - 1].id;
    return progress.stars[prevLessonId] !== undefined;
  };

  const handleLessonClick = (lesson, idx, unlocked) => {
    if (!unlocked) {
      alert('กรุณาเรียนบทก่อนหน้าให้สำเร็จก่อนนะครับ/ค่ะ');
      loggingService.logEvent('click_locked_lesson', { lesson_id: lesson.id });
      return;
    }
    
    loggingService.logEvent('select_lesson', { lesson_id: lesson.id, mode: 'manual' });
    onSelectLesson(lesson.id, 'manual');
  };

  const handleBackToModes = () => {
    setActiveSubPage('modes');
    onStartManualMode(null); // Reset learningMode in progress state
  };

  // Check if all lessons are completed
  const allCompleted = LESSONS.every(l => progress.stars[l.id] !== undefined);

  if (activeSubPage === 'modes') {
    return (
      <div className="screen-container flex flex-col justify-center overflow-y-auto [-webkit-overflow-scrolling:touch]">
        <div className="flex items-center justify-center gap-2 text-[var(--primary)] mb-2">
          <BookOpen size={26} />
          <span className="font-bold text-[22px]">รู้ทันสื่อวัยเก๋า</span>
        </div>

        <h2 className="text-[26px] text-center font-extrabold">เลือกรูปแบบการเรียนรู้ของท่าน</h2>
        <p className="text-lead text-center mb-5 text-[18px]">
          กรุณาเลือกรูปแบบที่ท่านชอบเพื่อเริ่มกิจกรรมแสนสนุกครับ
        </p>

        <div className="flex flex-col gap-4 w-full">
          {/* Option 1: Flow Mode */}
          <button
            onClick={onStartFlowMode}
            className="btn btn-primary w-full text-[22px] min-h-[84px] justify-between px-6 py-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center gap-3">
              <ArrowRight size={26} />
              <div className="text-left">
                <span className="font-bold block text-[22px]">1. เรียนต่อเนื่องอัตโนมัติ (Flow)</span>
                <span className="text-[13px] font-normal opacity-90 block mt-0.5">
                  เล่นวิดีโอและทำแบบฝึกหัดติดต่อกันจนครบทีละบท (แนะนำ)
                </span>
              </div>
            </div>
          </button>

          {/* Option 2: Manual Mode */}
          <button
            onClick={() => {
              setActiveSubPage('lessons');
              onStartManualMode('manual');
            }}
            className="btn btn-outline w-full text-[22px] min-h-[84px] justify-between px-6 py-4 border-[var(--primary)] text-[var(--primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={26} />
              <div className="text-left">
                <span className="font-bold block text-[22px]">2. เลือกเรียนเองอิสระ (Manual)</span>
                <span className="text-[13px] font-normal opacity-90 block mt-0.5">
                  กดเลือกดูหัวข้อวิชาเรียนที่ท่านต้องการทบทวนเอง
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Render Sub-Page 2: Lessons Map List
  return (
    <div className="screen-container">
      {/* Back Button Header */}
      <div className="flex items-center gap-3 mb-4 w-full text-left">
        <button
          onClick={handleBackToModes}
          className="btn btn-outline px-3 py-1.5 text-[16px] min-h-[40px] border-[var(--border)] text-[var(--text-secondary)] rounded-[var(--radius-md)] gap-1.5"
        >
          <span>← ย้อนกลับ</span>
        </button>
        <span className="text-[18px] font-bold text-[var(--text-secondary)]">
          เปลี่ยนรูปแบบการเรียน
        </span>
      </div>

      <div className="content-area">
        <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
          <BookOpen size={24} />
          <span className="font-bold text-[20px]">แผนผังวิชาเรียนรู้เท่าทันสื่อ</span>
        </div>

        <h2>เลือกวิชาเรียนอิสระ (Manual)</h2>
        <p className="text-lead mb-6">
          กรุณากดเลือกหัวข้อบทเรียนด้านล่างนี้ เพื่อเข้าศึกษาบทเรียนสะสมดาวครับ
        </p>

        {/* Lessons map */}
        <div className="flex flex-col gap-5 mt-3">
          {LESSONS.map((lesson, idx) => {
            const unlocked = isLessonUnlocked(lesson.id, idx);
            const stars = progress.stars[lesson.id];
            const isCompleted = stars !== undefined;

            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson, idx, unlocked)}
                className={`premium-card p-5 text-left transition-all duration-200 ${unlocked ? 'cursor-pointer opacity-100 shadow-[var(--shadow-md)] border-l-[8px] border-l-[var(--primary)]' : 'cursor-not-allowed opacity-65 shadow-[var(--shadow-sm)] border-l-[8px] border-l-[var(--border)]'}`}
                style={{ backgroundColor: isCompleted ? 'rgba(13, 148, 136, 0.04)' : 'var(--bg-card)' }}
              >
                {/* Badge and Unlock Status */}
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-[14px] font-bold px-2.5 py-1 rounded-[var(--radius-pill)]"
                    style={{
                      backgroundColor: unlocked ? 'var(--primary-light)' : 'var(--border)',
                      color: unlocked ? 'var(--primary-dark)' : 'var(--text-secondary)'
                    }}
                  >
                    {lesson.badge}
                  </span>

                  {!unlocked && (
                    <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <Lock size={16} />
                      <span className="text-[14px]">ต้องผ่านบทก่อนหน้า</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-[22px] font-bold my-1">{lesson.title}</h3>
                <h4 className="text-[18px] text-[var(--text-secondary)] font-semibold">{lesson.subTitle}</h4>
                <p className="text-small mt-2 leading-snug">{lesson.desc}</p>

                {/* Star display */}
                {unlocked && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                    <span className="text-[16px] font-bold text-[var(--text-secondary)]">
                      {isCompleted ? 'รางวัลที่ได้:' : 'ยังไม่เคยเล่น:'}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={24}
                          fill={isCompleted && s <= stars ? '#eab308' : 'none'}
                          color={isCompleted && s <= stars ? '#eab308' : 'var(--border)'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Claim Area */}
      {allCompleted ? (
        <button
          onClick={() => {
            loggingService.logEvent('click_view_certificate');
            onGoToCertificate();
          }}
          className="btn btn-primary text-[22px] min-h-[68px] bg-[#eab308] text-[#0f172a] font-bold shadow-[0_10px_20px_-5px_rgba(234,179,8,0.4)] [animation:pulseGlow_2s_infinite] mt-6"
        >
          <Award size={24} />
          <span>รับใบประกาศเกียรติคุณสำเร็จวิชา</span>
          <ArrowRight size={24} />
        </button>
      ) : (
        <div className="p-4 text-center bg-[var(--bg-app)] rounded-[var(--radius-lg)] mt-6 text-[16px] text-[var(--text-secondary)] border border-dashed border-[var(--border)]">
          <span>🔒 เรียนสะสมดาวครบทั้ง 3 บทเรียน เพื่อรับเกียรติบัตรดีเด่น</span>
        </div>
      )}

      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(234, 179, 8, 0); }
          100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
        }
      `}</style>
    </div>
  );
}
