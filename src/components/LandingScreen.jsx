import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LandingScreen({ onNext }) {
  return (
    <div className="screen-container">
      <div className="content-area my-auto">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 bg-[var(--primary-light)] px-4 py-1.5 rounded-[var(--radius-pill)] text-[var(--primary-dark)] mx-auto mb-4 text-[length:var(--font-size-small)] font-semibold">
          <Sparkles size={18} />
          <span>สำหรับวัยเก๋า & ผู้สูงอายุ</span>
        </div>

        {/* Title */}
        <h1 className="text-[40px] text-[var(--primary)] mb-3">
          รู้ทันสื่อ Interactive
        </h1>

        <h2 className="mb-3">ปลอดภัยภัยไซเบอร์ด้วยตัวคุณเอง</h2>

        <p className="text-lead px-2 text-[20px] leading-relaxed">
          ยินดีต้อนรับครับ! ชวนคุณพ่อคุณแม่และวัยเก๋าทุกท่านมาดูคลิปสั้นสนุก ๆ และเล่นเกมฝึกจับกลโกงแยกแยะข่าวจริง-ข่าวปลอม และสังเกตสื่อ AI เพื่อป้องกันสแกมเมอร์ในมือถือกันครับ
        </p>

        {/* Feature List */}
        <div className="flex flex-col gap-3 text-left mt-6 px-2">
          <div className="flex items-center gap-4">
            <div className="bg-[var(--border)] w-10 h-10 rounded-full flex items-center justify-center text-[var(--primary)]">
              🎥
            </div>
            <div>
              <strong className="text-[18px]">1. ดูคลิปวิดีโอเข้าใจง่าย</strong>
              <p className="text-[16px] text-[var(--text-secondary)]">เนื้อหาสั้นกระชับ สอนข้อควรระวังภัยออนไลน์</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[var(--border)] w-10 h-10 rounded-full flex items-center justify-center text-[var(--primary)]">
              🎮
            </div>
            <div>
              <strong className="text-[18px]">2. เล่นเกมลับสมองประลองปัญญา</strong>
              <p className="text-[16px] text-[var(--text-secondary)]">ตอบโจทย์สถานการณ์จริงเพื่อฝึกทักษะ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-auto">
        <button
          onClick={onNext}
          className="btn btn-primary text-[22px] min-h-[64px]"
        >
          <BookOpen size={24} />
          <span>เริ่มต้นเรียนรู้</span>
        </button>
      </div>
    </div>
  );
}
