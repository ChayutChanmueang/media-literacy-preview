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
      <div className="flex items-center gap-2 text-left">
        <button
          onClick={onBackToDashboard}
          className="bg-transparent border-none text-[var(--primary-dark)] cursor-pointer p-1 flex items-center"
        >
          <ChevronLeft size={24} />
          <span className="text-[18px] font-bold">กลับหน้าหลัก</span>
        </button>
      </div>

      {!submittedName ? (
        /* Step 1: Input Name */
        <div className="content-area my-auto">
          <div className="flex justify-center text-[#eab308] mb-3">
            <Award size={64} className="[filter:drop-shadow(0_0_8px_rgba(234,179,8,0.4))]" />
          </div>

          <h2>ยินดีด้วยอย่างยิ่งครับ!</h2>
          <p className="text-lead">
            ท่านเรียนครบถ้วนทั้ง 3 วิชาแล้ว กรุณาพิมพ์ชื่อของท่านเพื่อใช้สร้างใบประกาศความสำเร็จ
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <input
              type="text"
              placeholder="พิมพ์ชื่อเล่น หรือ ชื่อจริงที่นี่..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              className="w-full min-h-[60px] text-[22px] px-4 py-3 rounded-[var(--radius-lg)] border-[3px] border-[var(--primary)] text-center font-bold outline-none"
              required
            />

            <button
              type="submit"
              className="btn btn-primary text-[22px] min-h-[64px]"
            >
              <span>สร้างใบประกาศทองคำ</span>
            </button>
          </form>
        </div>
      ) : (
        /* Step 2: Render Premium Certificate */
        <div className="flex flex-col gap-5 flex-1 min-h-0">
          <div className="content-area">

            {/* The Certificate Frame */}
            <div className="relative text-center mx-auto w-full max-w-[400px] px-4 py-6 rounded-[var(--radius-lg)] shadow-[0_15px_30px_rgba(0,0,0,0.15)] [border:10px_double_#eab308] bg-[#fffbeb] text-[#1e293b]">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-[#eab308] text-[18px]">✦</div>
              <div className="absolute top-2 right-2 text-[#eab308] text-[18px]">✦</div>
              <div className="absolute bottom-2 left-2 text-[#eab308] text-[18px]">✦</div>
              <div className="absolute bottom-2 right-2 text-[#eab308] text-[18px]">✦</div>

              {/* Certificate content */}
              <Award size={48} color="#eab308" className="mx-auto mb-2" />

              <h3 className="[font-family:var(--font-sans)] text-[24px] font-extrabold text-[#b45309] my-1">
                ใบประกาศเกียรติคุณ
              </h3>
              <p className="text-[14px] italic text-[#78350f] m-0">
                หลักสูตร รู้เท่าทันภัยสื่อออนไลน์วัยเก๋า
              </p>

              <div className="my-4 pb-2 border-b border-[rgba(180,83,9,0.2)]">
                <span className="text-[15px] text-[#78350f]">ขอมอบเกียรติบัตรทองคำนี้เพื่อแสดงว่า</span>
                <h2 className="text-[28px] text-[#1e3a8a] font-black my-2.5 underline">
                  {submittedName}
                </h2>
              </div>

              <p className="text-[16px] leading-relaxed text-[#451a03] font-bold">
                ได้ผ่านการศึกษาอบรมและทดสอบเกณฑ์สมรรถนะครบ 3 บทเรียน <br />
                มีความสามารถจับสังเกตข่าวปลอม สัญญาณสแกม และสื่อ AI <br />
                เพียบพร้อมสำหรับการรู้เท่าทันสื่ออย่างดีเด่น
              </p>

              {/* Signatures */}
              <div className="flex justify-between items-center mt-6 px-2">
                <div className="text-center">
                  <div className="text-[14px] italic [font-family:cursive] text-[#b45309]">NAPLAB Dev</div>
                  <div className="w-20 h-px border-b border-[#78350f] mx-auto my-1" />
                  <span className="text-[11px] text-[#78350f]">ผู้ตรวจประเมิน</span>
                </div>

                {/* Stamp */}
                <div className="w-[54px] h-[54px] rounded-full flex items-center justify-center text-[11px] font-bold text-[#dc2626] rotate-[-15deg] z-[2] shadow-[0_0_3px_rgba(220,38,38,0.2)] [border:3px_double_#dc2626]">
                  ผ่านเกณฑ์
                </div>

                <div className="text-center">
                  <div className="text-[14px] italic [font-family:cursive] text-[#b45309]">รู้ทันสื่อวัยเก๋า</div>
                  <div className="w-20 h-px border-b border-[#78350f] mx-auto my-1" />
                  <span className="text-[11px] text-[#78350f]">ผู้อำนวยการโครงการ</span>
                </div>
              </div>
            </div>

            {/* Instruction note */}
            <p className="text-small text-[var(--text-secondary)] mt-3 italic">
              💡 วิธีเซฟเก็บไว้: คุณลุงคุณป้าสามารถ **แคปหน้าจอ** โทรศัพท์มือถือ <br />
              เพื่อบันทึกรูปภาพเกียรติบัตรไว้อวดลูกหลานได้เลยครับ!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleShareLine}
              className="btn bg-[#06c755] text-white text-[22px] min-h-[64px]"
            >
              <Share2 size={24} />
              <span>แชร์ลิงก์ให้เพื่อนร่วมเรียนใน LINE</span>
            </button>

            <button
              onClick={() => {
                setName('');
                setSubmittedName('');
              }}
              className="btn btn-outline text-[18px] min-h-[52px]"
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
