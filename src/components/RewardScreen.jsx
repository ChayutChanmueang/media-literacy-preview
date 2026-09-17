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
      <div className="content-area my-auto">
        <h1 className="text-[var(--primary)] text-[38px] mb-2">🎉 ยินดีด้วยครับ!</h1>
        <h2 className="text-[26px]">{congrats.title}</h2>
        <p className="text-lead text-[20px] mt-2">{congrats.desc}</p>

        {/* Stars display with custom sizes and gold glow */}
        <div className="flex justify-center gap-4 my-8">
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ animation: `bounce 0.5s ease-out ${s * 0.2}s both` }}>
              <Star
                size={54}
                fill={s <= stars ? '#eab308' : 'none'}
                color={s <= stars ? '#eab308' : 'var(--border)'}
                className={s <= stars ? '[filter:drop-shadow(0_0_12px_rgba(234,179,8,0.6))]' : ''}
              />
            </div>
          ))}
        </div>

        {/* Reward Message Box */}
        <div className="premium-card p-5">
          <strong className="text-[22px] text-[var(--primary-dark)] block mb-1.5">
            คุณได้รับ {stars} ดาวความสำเร็จ!
          </strong>
          <span className="text-[18px] text-[var(--text-secondary)]">
            ดาวดวงนี้บันทึกไว้ในเบราว์เซอร์ของท่านแล้วอย่างปลอดภัย เพื่อปลดล็อกเข้าสู่บทเรียนถัดไปครับ
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto w-full">
        {learningMode === 'flow' ? (
          <>
            {/* Primary Flow Action Button */}
            <button
              onClick={onNextLessonFlow}
              className="btn btn-primary text-[22px] min-h-[64px]"
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
              className="btn bg-[#06c755] text-white text-[22px] min-h-[64px] no-underline"
            >
              <Share2 size={24} />
              <span>แชร์ผลงานเข้าไลน์กลุ่ม</span>
            </a>

            {/* Secondary Exit Flow to Dashboard Button */}
            <button
              onClick={handleDashboardClick}
              className="btn btn-outline text-[18px] min-h-[52px] border-[var(--primary)] text-[var(--primary)]"
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
              className="btn btn-primary text-[22px] min-h-[64px]"
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
              className="btn bg-[#06c755] text-white text-[22px] min-h-[64px] no-underline"
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
          className="btn btn-outline text-[18px] min-h-[52px]"
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
