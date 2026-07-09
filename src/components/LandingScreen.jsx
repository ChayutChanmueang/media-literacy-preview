import React from 'react';
import { ShieldAlert, BookOpen, Sparkles } from 'lucide-react';

export default function LandingScreen({ onNext }) {
  return (
    <div className="screen-container">
      <div className="content-area" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
        {/* Decorative Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', color: 'var(--primary-dark)', margin: '0 auto 16px auto', fontSize: 'var(--font-size-small)', fontWeight: '600' }}>
          <Sparkles size={18} />
          <span>สำหรับวัยเก๋า & ผู้สูงอายุ</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '40px', color: 'var(--primary)', marginBottom: '12px' }}>
          รู้ทันสื่อ Interactive
        </h1>
        
        {/* App Mock Icon */}
        <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--primary-light)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '16px auto 24px auto', boxShadow: 'var(--shadow-premium)' }}>
          <ShieldAlert size={64} color="var(--primary)" />
        </div>

        <h2 style={{ marginBottom: '12px' }}>ปลอดภัยภัยไซเบอร์ด้วยตัวคุณเอง</h2>
        
        <p className="text-lead" style={{ padding: '0 8px', fontSize: '20px', lineHeight: '1.6' }}>
          ยินดีต้อนรับครับ! ชวนคุณพ่อคุณแม่และวัยเก๋าทุกท่านมาดูคลิปสั้นสนุกๆ และเล่นเกมฝึกจับกลโกงแยกแยะข่าวจริง-ข่าวปลอม และสังเกตสื่อ AI เพื่อป้องกันสแกมเมอร์ในมือถือกันครับ
        </p>

        {/* Feature List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginTop: '24px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--border)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              🎥
            </div>
            <div>
              <strong style={{ fontSize: '18px' }}>1. ดูคลิปวิดีโอเข้าใจง่าย</strong>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>เนื้อหาสั้นกระชับ สอนข้อควรระวังภัยออนไลน์</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--border)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              🎮
            </div>
            <div>
              <strong style={{ fontSize: '18px' }}>2. เล่นเกมลับสมองประลองปัญญา</strong>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>ตอบโจทย์สถานการณ์จริงเพื่อฝึกทักษะ</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', marginTop: 'auto' }}>
        <button 
          onClick={onNext} 
          className="btn btn-primary"
          style={{ fontSize: '22px', minHeight: '64px' }}
        >
          <BookOpen size={24} />
          <span>เริ่มต้นเรียนรู้</span>
        </button>
        <p className="text-small" style={{ textAlign: 'center', marginTop: '12px' }}>
          ไม่ต้องสมัครสมาชิก เปิดผ่าน LINE แล้วเล่นได้ทันที!
        </p>
      </div>
    </div>
  );
}
