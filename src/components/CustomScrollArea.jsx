import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * พื้นที่เลื่อนที่มี scroll bar แสดง "ตลอดเวลา" (custom) — เพราะบนมือถือ (iOS Safari / LINE in-app)
 * native scrollbar เป็น overlay ที่ auto-hide และ CSS บังคับให้แสดงตลอดไม่ได้จริง
 *
 * ซ่อน native scrollbar แล้ววาด track + thumb เองที่ตำแหน่ง/ขนาดอัปเดตตาม scrollTop
 *
 * @param {object} props
 * @param {string} [props.className]     คลาสของกรอบนอก (ต้องกำหนดความสูง เช่น h-full)
 * @param {string} [props.contentClassName] คลาส/padding ของโซนเนื้อหาที่เลื่อน
 * @param {string} [props.trackClassName] คลาสของราง scroll bar
 * @param {string} [props.thumbClassName] คลาสของตัว thumb
 * @param {(active: boolean) => void} [props.onActiveChange]  แจ้ง caller เมื่อผู้ใช้เริ่ม/หยุดโต้ตอบ (แตะ/เลื่อน)
 *                                     — ใช้หยุดตัวนับ auto-advance ระหว่างที่ผู้ใช้กำลังอ่าน/เลื่อนเนื้อหา
 * @param {React.ReactNode} [props.children] เนื้อหาที่เลื่อนได้
 */
export default function CustomScrollArea({
  className = '',
  contentClassName = '',
  trackClassName = 'absolute top-2 bottom-2 right-1.5 w-2 rounded-full bg-[var(--text-primary)]/10 pointer-events-none',
  thumbClassName = 'absolute left-0 w-full rounded-full bg-[var(--primary)] opacity-80',
  onActiveChange,
  children,
}) {
  const scrollRef = useRef(null);
  const [thumb, setThumb] = useState({ heightPct: 0, topPct: 0, visible: false });

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb((t) => (t.visible ? { ...t, visible: false } : t));
      return;
    }
    const heightPct = Math.max((clientHeight / scrollHeight) * 100, 12);
    const topPct = (scrollTop / scrollHeight) * 100;
    setThumb({ heightPct, topPct, visible: true });
  }, []);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    // อัปเดตเมื่อขนาดเนื้อหา/กรอบเปลี่ยน (เช่น ผู้ใช้ปรับขนาดฟอนต์)
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [update]);

  // ---- ตรวจจับการโต้ตอบ (แตะ/เลื่อน) เพื่อให้ caller หยุดตัวนับ auto-advance ----
  // active = true ทันทีที่แตะ/เลื่อน, กลับเป็น false เมื่อปล่อยนิ้วและหยุดนิ่งเกิน IDLE_MS
  const IDLE_MS = 700;
  const activeRef = useRef(false);
  const holdRef = useRef(false); // นิ้วยังแตะค้างอยู่หรือไม่
  const idleTimerRef = useRef(null);
  const onActiveChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  const setActive = useCallback((v) => {
    if (activeRef.current === v) return;
    activeRef.current = v;
    onActiveChangeRef.current?.(v);
  }, []);

  const scheduleIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!holdRef.current) setActive(false);
    }, IDLE_MS);
  }, [setActive]);

  const handleActivity = useCallback(() => {
    setActive(true);
    scheduleIdle();
  }, [setActive, scheduleIdle]);

  const handleHoldStart = useCallback(() => {
    holdRef.current = true;
    setActive(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, [setActive]);

  const handleHoldEnd = useCallback(() => {
    holdRef.current = false;
    scheduleIdle();
  }, [scheduleIdle]);

  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    },
    [],
  );

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        onScroll={() => {
          update();
          handleActivity();
        }}
        onWheel={handleActivity}
        onPointerDown={handleHoldStart}
        onPointerUp={handleHoldEnd}
        onPointerCancel={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchMove={handleActivity}
        onTouchEnd={handleHoldEnd}
        className={`absolute inset-0 overflow-y-auto no-native-scrollbar ${contentClassName}`}
      >
        {children}
      </div>

      {/* Track + thumb ที่แสดงตลอดเวลาเมื่อเนื้อหาเลื่อนได้ */}
      {thumb.visible && (
        <div className={trackClassName}>
          <div
            className={thumbClassName}
            style={{ height: `${thumb.heightPct}%`, top: `${thumb.topPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
