import React, { useState } from 'react';
import { Star, Lock, BookOpen, Award, ArrowRight } from 'lucide-react';
import { loggingService } from '../services/loggingService';

const LESSONS = [
  {
    id: 'topic-1',
    title: 'บทที่ 1: รู้เท่าทันข่าวสาร',
    subTitle: 'ใครๆ ก็ทำสื่อได้ / จริงหรือมั่ว?',
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
    id: 'topic-3',
    title: 'บทที่ 3: สังเกตสื่อจาก AI',
    subTitle: 'Deepfake / ภาพสังเคราะห์',
    desc: 'เรียนรู้วิธีสังเกตรายละเอียดภาพใบหน้าและจุดบกพร่องที่สร้างจาก AI',
    badge: 'เทคโนโลยี AI'
  },
  {
    id: 'topic-5',
    title: 'บทที่ 4: หยุด คิด ถาม ทำ',
    subTitle: 'กางโล่สะกดภัยออนไลน์ (G5)',
    desc: 'ฝึกสติชะลอการตอบสนองความเร็วด้วยการกางโล่ป้องกันสแกมและข้อความล่อลวงเสี่ยงอันตราย',
    badge: 'สร้างกำลังใจ'
  },
  {
    id: 'topic-6',
    title: 'บทที่ 5: จำลองแชท LINE',
    subTitle: 'จับสัญญาณมิจในแชทจำลอง (G6)',
    desc: 'ฝึกแตะจุดผิดปกติในห้องแชท LINE จำลองที่มิจฉาชีพทักเข้ามาหลอกลวงหลายรูปแบบ',
    badge: 'จำลองสถานการณ์'
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
      <div className="screen-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '12px' }}>
          <BookOpen size={28} />
          <span style={{ fontWeight: 'bold', fontSize: '24px' }}>รู้ทันสื่อวัยเก๋า</span>
        </div>
        
        <h2 style={{ fontSize: '28px', textAlign: 'center', fontWeight: '800' }}>เลือกรูปแบบการเรียนรู้ของท่าน</h2>
        <p className="text-lead" style={{ textAlign: 'center', marginBottom: '32px', fontSize: '20px' }}>
          กรุณาเลือกรูปแบบที่ท่านชอบเพื่อเริ่มกิจกรรมแสนสนุกครับ
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Option 1: Flow Mode */}
          <button
            onClick={onStartFlowMode}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              fontSize: '22px', 
              minHeight: '84px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '16px 24px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ArrowRight size={26} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold', display: 'block', fontSize: '22px' }}>1. เรียนต่อเนื่องอัตโนมัติ (Flow)</span>
                <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.9, display: 'block', marginTop: '2px' }}>
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
            className="btn btn-outline"
            style={{ 
              width: '100%', 
              fontSize: '22px', 
              minHeight: '84px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '16px 24px',
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BookOpen size={26} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontWeight: 'bold', display: 'block', fontSize: '22px' }}>2. เลือกเรียนเองอิสระ (Manual)</span>
                <span style={{ fontSize: '13px', fontWeight: 'normal', opacity: 0.9, display: 'block', marginTop: '2px' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', width: '100%', textAlign: 'left' }}>
        <button
          onClick={handleBackToModes}
          className="btn btn-outline"
          style={{ 
            padding: '6px 12px', 
            fontSize: '16px', 
            minHeight: '40px', 
            borderColor: 'var(--border)', 
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <span>← ย้อนกลับ</span>
        </button>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          เปลี่ยนรูปแบบการเรียน
        </span>
      </div>

      <div className="content-area">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)' }}>
          <BookOpen size={24} />
          <span style={{ fontWeight: 'bold', fontSize: '20px' }}>แผนผังวิชาเรียนรู้เท่าทันสื่อ</span>
        </div>
        
        <h2>เลือกวิชาเรียนอิสระ (Manual)</h2>
        <p className="text-lead" style={{ marginBottom: '24px' }}>
          กรุณากดเลือกหัวข้อบทเรียนด้านล่างนี้ เพื่อเข้าศึกษาบทเรียนสะสมดาวครับ
        </p>

        {/* Lessons map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
          {LESSONS.map((lesson, idx) => {
            const unlocked = isLessonUnlocked(lesson.id, idx);
            const stars = progress.stars[lesson.id];
            const isCompleted = stars !== undefined;

            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson, idx, unlocked)}
                className="premium-card"
                style={{
                  padding: '20px',
                  textAlign: 'left',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  borderLeft: unlocked ? '8px solid var(--primary)' : '8px solid var(--border)',
                  opacity: unlocked ? 1 : 0.65,
                  backgroundColor: isCompleted ? 'rgba(13, 148, 136, 0.04)' : 'var(--bg-card)',
                  transform: unlocked ? 'translateY(0)' : 'none',
                  boxShadow: unlocked ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Badge and Unlock Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: unlocked ? 'var(--primary-light)' : 'var(--border)',
                    color: unlocked ? 'var(--primary-dark)' : 'var(--text-secondary)'
                  }}>
                    {lesson.badge}
                  </span>
                  
                  {!unlocked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Lock size={16} />
                      <span style={{ fontSize: '14px' }}>ต้องผ่านบทก่อนหน้า</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: '4px 0' }}>{lesson.title}</h3>
                <h4 style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: '600' }}>{lesson.subTitle}</h4>
                <p className="text-small" style={{ marginTop: '8px', lineHeight: '1.4' }}>{lesson.desc}</p>

                {/* Star display */}
                {unlocked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                      {isCompleted ? 'รางวัลที่ได้:' : 'ยังไม่เคยเล่น:'}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
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
          className="btn btn-primary"
          style={{
            fontSize: '22px',
            minHeight: '68px',
            backgroundColor: '#eab308',
            color: '#0f172a',
            fontWeight: 'bold',
            boxShadow: '0 10px 20px -5px rgba(234, 179, 8, 0.4)',
            animation: 'pulseGlow 2s infinite',
            marginTop: '24px'
          }}
        >
          <Award size={24} />
          <span>รับใบประกาศเกียรติคุณสำเร็จวิชา</span>
          <ArrowRight size={24} />
        </button>
      ) : (
        <div style={{ 
          padding: '16px', 
          textAlign: 'center', 
          backgroundColor: 'var(--bg-app)', 
          borderRadius: 'var(--radius-lg)',
          marginTop: '24px',
          fontSize: '16px',
          color: 'var(--text-secondary)',
          border: '1px dashed var(--border)'
        }}>
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
