import React, { useState } from 'react';
import { Award, Share2, Download, RefreshCw, ChevronLeft } from 'lucide-react';
import { loggingService } from '../services/loggingService';

export default function CertificateScreen({ onBackToDashboard }) {
  const [name, setName] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setSubmittedName(name.trim());
      loggingService.logEvent('generate_certificate', { name: name.trim() });
    }
  };

  const handleShareLine = () => {
    const shareText = `ภูมิใจจัง! ฉันเรียนจบหลักสูตรและได้รับเกียรติบัตร "รู้ทันสื่อวัยเก๋า" แล้วนะ มาฝึกทักษะป้องกันมิจฉาชีพด้วยกันที่นี่เลย!`;
    const shareUrl = window.location.origin + window.location.pathname;
    const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    
    loggingService.logEvent('share_certificate_line', { name: submittedName });
    window.open(lineShareUrl, '_blank');
  };

  return (
    <div className="screen-container">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
        <button 
          onClick={onBackToDashboard}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-dark)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronLeft size={24} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>กลับหน้าหลัก</span>
        </button>
      </div>

      {!submittedName ? (
        /* Step 1: Input Name */
        <div className="content-area" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#eab308', marginBottom: '12px' }}>
            <Award size={64} style={{ filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))' }} />
          </div>
          
          <h2>ยินดีด้วยอย่างยิ่งครับ!</h2>
          <p className="text-lead">
            ท่านเรียนครบถ้วนทั้ง 3 วิชาแล้ว กรุณาพิมพ์ชื่อของท่านเพื่อใช้สร้างใบประกาศความสำเร็จ
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <input 
              type="text" 
              placeholder="พิมพ์ชื่อเล่น หรือ ชื่อจริงที่นี่..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              style={{
                width: '100%',
                minHeight: '60px',
                fontSize: '22px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '3px solid var(--primary)',
                textAlign: 'center',
                fontWeight: 'bold',
                outline: 'none'
              }}
              required
            />
            
            <button 
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: '22px', minHeight: '64px' }}
            >
              <span>สร้างใบประกาศทองคำ</span>
            </button>
          </form>
        </div>
      ) : (
        /* Step 2: Render Premium Certificate */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div className="content-area" style={{ flex: 1 }}>
            
            {/* The Certificate Frame */}
            <div style={{
              border: '10px double #eab308',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 16px',
              backgroundColor: '#fffbeb', // cream color paper look
              color: '#1e293b', // dark gray for paper text
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              textAlign: 'center',
              margin: '0 auto',
              width: '100%',
              maxWidth: '400px'
            }}>
              {/* Corner Ornaments */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', color: '#eab308', fontSize: '18px' }}>✦</div>
              <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#eab308', fontSize: '18px' }}>✦</div>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', color: '#eab308', fontSize: '18px' }}>✦</div>
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', color: '#eab308', fontSize: '18px' }}>✦</div>

              {/* Certificate content */}
              <Award size={48} color="#eab308" style={{ margin: '0 auto 8px auto' }} />
              
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '24px', fontWeight: '800', color: '#b45309', margin: '4px 0' }}>
                ใบประกาศเกียรติคุณ
              </h3>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#78350f', margin: '0' }}>
                หลักสูตร รู้เท่าทันภัยสื่อออนไลน์วัยเก๋า
              </p>

              <div style={{ margin: '16px 0', borderBottom: '1px solid rgba(180, 83, 9, 0.2)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '15px', color: '#78350f' }}>ขอมอบเกียรติบัตรทองคำนี้เพื่อแสดงว่า</span>
                <h2 style={{ fontSize: '28px', color: '#1e3a8a', fontWeight: '900', margin: '10px 0', textDecoration: 'underline' }}>
                  {submittedName}
                </h2>
              </div>

              <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#451a03', fontWeight: 'bold' }}>
                ได้ผ่านการศึกษาอบรมและทดสอบเกณฑ์สมรรถนะครบ 3 บทเรียน <br />
                มีความสามารถจับสังเกตข่าวปลอม สัญญาณสแกม และสื่อ AI <br />
                เพียบพร้อมสำหรับการรู้เท่าทันสื่ออย่างดีเด่น
              </p>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '0 8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontStyle: 'italic', fontFamily: 'cursive', color: '#b45309' }}>NAPLAB Dev</div>
                  <div style={{ width: '80px', height: '1px', borderBottom: '1px solid #78350f', margin: '4px auto' }} />
                  <span style={{ fontSize: '11px', color: '#78350f' }}>ผู้ตรวจประเมิน</span>
                </div>
                
                {/* Stamp */}
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '3px double #dc2626',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  transform: 'rotate(-15deg)',
                  zIndex: 2,
                  boxShadow: '0 0 3px rgba(220, 38, 38, 0.2)'
                }}>
                  ผ่านเกณฑ์
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontStyle: 'italic', fontFamily: 'cursive', color: '#b45309' }}>รู้ทันสื่อวัยเก๋า</div>
                  <div style={{ width: '80px', height: '1px', borderBottom: '1px solid #78350f', margin: '4px auto' }} />
                  <span style={{ fontSize: '11px', color: '#78350f' }}>ผู้อำนวยการโครงการ</span>
                </div>
              </div>
            </div>

            {/* Instruction note */}
            <p className="text-small" style={{ color: 'var(--text-secondary)', marginTop: '12px', fontStyle: 'italic' }}>
              💡 วิธีเซฟเก็บไว้: คุณลุงคุณป้าสามารถ **แคปหน้าจอ** โทรศัพท์มือถือ <br />
              เพื่อบันทึกรูปภาพเกียรติบัตรไว้อวดลูกหลานได้เลยครับ!
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button 
              onClick={handleShareLine}
              className="btn"
              style={{
                backgroundColor: '#06c755',
                color: '#ffffff',
                fontSize: '22px',
                minHeight: '64px',
              }}
            >
              <Share2 size={24} />
              <span>แชร์ลิงก์ให้เพื่อนร่วมเรียนใน LINE</span>
            </button>

            <button 
              onClick={() => {
                setName('');
                setSubmittedName('');
              }}
              className="btn btn-outline"
              style={{ fontSize: '18px', minHeight: '52px' }}
            >
              <RefreshCw size={18} />
              <span>พิมพ์ชื่อเพื่อออกใบประกาศใหม่</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
