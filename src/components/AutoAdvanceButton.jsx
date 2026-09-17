import React, { useEffect, useRef } from 'react';

/**
 * ปุ่ม "ถัดไป" ที่กดให้เองอัตโนมัติเมื่อครบเวลา (default 5 วิ) พร้อมแถบ progress บนปุ่ม
 * ใช้ร่วมกันใน G1/G3/G6 หลังตอบคำถามแล้ว — ผู้เล่นกดเองก่อนก็ได้
 *
 * หมายเหตุ: caller ต้องใส่คลาส position (เช่น `relative` หรือ `absolute ...`) ใน className
 * เพราะแถบ progress เป็น absolute อิงกับปุ่ม
 *
 * @param {() => void} onClick         ฟังก์ชันไปข้อถัดไปเมื่อผู้ใช้กด
 * @param {() => void} onAutoAdvance   ฟังก์ชันเมื่อครบเวลา (ค่าเริ่มใช้ onClick)
 * @param {number} delayMs             เวลาก่อน auto-advance (ค่าเริ่ม 5000ms)
 * @param {boolean} paused             หยุดนับเวลาชั่วคราว (เช่น ผู้ใช้กำลังแตะ/เลื่อนเนื้อหาเฉลย)
 *                                     — ทั้งตัวนับและแถบ progress จะหยุดค้าง แล้วนับต่อเมื่อกลับมา false
 * @param {string} className           คลาสหน้าตาปุ่ม (รวม position)
 * @param {string} progressClassName   คลาสสี/หน้าตาแถบ progress (ค่าเริ่มสีขาวโปร่ง)
 */
export default function AutoAdvanceButton({
  onClick,
  onAutoAdvance = onClick,
  delayMs = 5000,
  paused = false,
  className = '',
  progressClassName = 'bg-white/30',
  children,
}) {
  const autoAdvanceRef = useRef(onAutoAdvance);
  useEffect(() => {
    autoAdvanceRef.current = onAutoAdvance;
  }, [onAutoAdvance]);

  // เวลาที่เหลือก่อน auto-advance — เก็บไว้ข้ามช่วง pause/resume
  const remainingRef = useRef(delayMs);
  const startRef = useRef(0);

  useEffect(() => {
    if (paused) return; // ระหว่าง pause: ไม่ตั้ง timer, cleanup ของรอบก่อนหน้าเก็บเวลาที่เหลือให้แล้ว
    startRef.current = Date.now();
    const timer = setTimeout(() => autoAdvanceRef.current?.(), remainingRef.current);
    return () => {
      clearTimeout(timer);
      // หัก elapsed ออกจากเวลาที่เหลือ เพื่อ resume ต่อจากจุดเดิม (หรือ freeze ตอนถูก pause)
      const elapsed = Date.now() - startRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [paused]);

  return (
    <button onClick={onClick} className={`overflow-hidden ${className}`}>
      {/* แถบ progress ค่อยๆ เต็มจนครบเวลาแล้วปุ่มจะทำงานเอง — หยุดค้างเมื่อ paused */}
      <span
        aria-hidden
        className={`absolute left-0 top-0 bottom-0 pointer-events-none ${progressClassName}`}
        style={{
          animation: `autoAdvanceProgress ${delayMs}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
      <span className="relative z-[1] flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
