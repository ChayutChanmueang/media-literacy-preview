import React from 'react';
import { Star, RefreshCw, Share2, BookOpen, ArrowRight } from 'lucide-react';
import { loggingService } from '../services/loggingService';

const LESSON_CONGRATS = {
  'topic-1': {
    title: 'คุณเรียนจบวิชาที่ 1 แล้ว!',
    desc: 'คุณเก่งมากที่รู้วิธีแยกแยะข่าวสาร และระวังอารมณ์ตนเองก่อนตัดสินใจแชร์'
  },
  'topic-2': {
    title: 'คุณเรียนจบวิชาที่ 2 แล้ว!',
    desc: 'คุณยอดเยี่ยมมากที่รู้จักสังเกตสัญญาณเตือนมิจฉาชีพ ทั้งแชทลวงและลิงก์ปลอม'
  },
  'topic-3': {
    title: 'คุณเรียนจบวิชาที่ 3 แล้ว!',
    desc: 'คุณเก่งที่สุดที่สามารถระบุจุดผิดปกติของรูปภาพที่สังเคราะห์จากระบบ AI'
  },
  'topic-6': {
    title: 'คุณเรียนจบวิชาที่ 5 แล้ว!',
    desc: 'คุณยอดเยี่ยมมากที่จับสัญญาณมิจฉาชีพในแชท LINE จำลองได้อย่างแม่นยำ'
  }
};

export default function RewardScreen({ 
  lessonId = 'topic-1', 
  stars = 3, 
  onRestart, 
  onGoToDashboard,
  learningMode = 'manual',
  onNextLessonFlow
}) {
  const congrats = LESSON_CONGRATS[lessonId] || LESSON_CONGRATS['topic-1'];
  
  const shareText = `ฉันเล่นผ่านบทเรียน "${congrats.title}" ของเกม "รู้ทันสื่อ" แล้ว ได้คะแนน ${stars} ดาวเลย! มาลองเล่นฝึกสมองเพื่อป้องกันมิจฉาชีพด้วยกันนะ`;
  const shareUrl = `${window.location.origin}${window.location.pathname}?lesson=${lessonId}`;
  const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  const handleShareClick = () => {
    loggingService.logEvent('share_click', { lesson_id: lessonId, stars_earned: stars });
  };

  const handleDashboardClick = () => {
    loggingService.logEvent('reward_goto_dashboard', { lesson_id: lessonId });
    onGoToDashboard();
  };

  return (
    <div className="screen-container">
      <div className="content-area" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '38px', marginBottom: '8px' }}>🎉 ยินดีด้วยครับ!</h1>
        <h2 style={{ fontSize: '26px' }}>{congrats.title}</h2>
        <p className="text-lead" style={{ fontSize: '20px', marginTop: '8px' }}>{congrats.desc}</p>

        {/* Stars display with custom sizes and gold glow */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '32px 0' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ animation: `bounce 0.5s ease-out ${s * 0.2}s both` }}>
              <Star 
                size={54} 
                fill={s <= stars ? '#eab308' : 'none'} 
                color={s <= stars ? '#eab308' : 'var(--border)'}
                style={{
                  filter: s <= stars ? 'drop-shadow(0 0 12px rgba(234, 179, 8, 0.6))' : 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Reward Message Box */}
        <div className="premium-card" style={{ padding: '20px' }}>
          <strong style={{ fontSize: '22px', color: 'var(--primary-dark)', display: 'block', marginBottom: '6px' }}>
            คุณได้รับ {stars} ดาวความสำเร็จ!
          </strong>
          <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            ดาวดวงนี้บันทึกไว้ในเบราว์เซอร์ของท่านแล้วอย่างปลอดภัย เพื่อปลดล็อกเข้าสู่บทเรียนถัดไปครับ
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', width: '100%' }}>
        {learningMode === 'flow' ? (
          <>
            {/* Primary Flow Action Button */}
            <button 
              onClick={onNextLessonFlow}
              className="btn btn-primary"
              style={{ fontSize: '22px', minHeight: '64px' }}
            >
              <ArrowRight size={24} />
              <span>{lessonId === 'topic-6' ? 'รับเกียรติบัตรดีเด่น' : 'เรียนบทเรียนถัดไป'}</span>
            </button>

            {/* LINE Share Button (US-LEAD-01) */}
            <a 
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleShareClick}
              className="btn"
              style={{ 
                backgroundColor: '#06c755', 
                color: '#ffffff', 
                fontSize: '22px', 
                minHeight: '64px',
                textDecoration: 'none'
              }}
            >
              <Share2 size={24} />
              <span>แชร์ผลงานเข้าไลน์กลุ่ม</span>
            </a>

            {/* Secondary Exit Flow to Dashboard Button */}
            <button 
              onClick={handleDashboardClick}
              className="btn btn-outline"
              style={{ fontSize: '18px', minHeight: '52px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <BookOpen size={20} />
              <span>ออกไปยังหน้าหลักแผนผัง</span>
            </button>
          </>
        ) : (
          <>
            {/* Go to Dashboard Button */}
            <button 
              onClick={handleDashboardClick}
              className="btn btn-primary"
              style={{ fontSize: '22px', minHeight: '64px' }}
            >
              <BookOpen size={24} />
              <span>กลับหน้าหลักแผนผังเรียน</span>
            </button>

            {/* LINE Share Button (US-LEAD-01) */}
            <a 
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleShareClick}
              className="btn"
              style={{ 
                backgroundColor: '#06c755', 
                color: '#ffffff', 
                fontSize: '22px', 
                minHeight: '64px',
                textDecoration: 'none'
              }}
            >
              <Share2 size={24} />
              <span>แชร์ผลงานเข้าไลน์กลุ่ม</span>
            </a>
          </>
        )}

        {/* Play Again Button */}
        <button 
          onClick={() => {
            loggingService.logEvent('replay_lesson', { lesson_id: lessonId });
            onRestart();
          }}
          className="btn btn-outline"
          style={{ fontSize: '18px', minHeight: '52px' }}
        >
          <RefreshCw size={18} />
          <span>ทบทวนเนื้อหาวิชานี้อีกครั้ง</span>
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0% { transform: translateY(0) scale(0.3); opacity: 0; }
          50% { transform: translateY(-16px) scale(1.1); }
          80% { transform: translateY(4px) scale(0.95); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
