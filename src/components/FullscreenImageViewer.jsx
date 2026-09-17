"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const clampScale = (s) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

/**
 * ตัวดูรูปแบบเต็มจอสำหรับผู้สูงอายุ:
 * - ทับทั้งหน้าจอจริง (fixed inset-0 เกินกรอบ #root-container ได้)
 * - ย่อ/ขยายด้วยนิ้วเอง (Pointer Events) เพราะ viewport แอปปิด pinch-zoom ของเบราว์เซอร์
 *   (2 นิ้ว = ย่อ/ขยาย, 1 นิ้วลากตอนซูมอยู่ = เลื่อนดู)
 * - ปุ่ม "ปิด" ใหญ่ + กากบาทด้านล่าง และรองรับ Esc
 */
export default function FullscreenImageViewer({ src, alt = '', caption, onClose }) {
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 });
  const [interacting, setInteracting] = useState(false);
  const pointers = useRef(new Map());
  const gesture = useRef(null); // pinch state: { startDist, startScale, startMid, startTx, startTy }
  const panPoint = useRef(null); // last position for single-finger pan

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setInteracting(true);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startScale: transform.scale,
        startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        startTx: transform.tx,
        startTy: transform.ty,
      };
      panPoint.current = null;
    } else if (pointers.current.size === 1) {
      panPoint.current = { x: e.clientX, y: e.clientY };
    }
  }, [transform]);

  const handlePointerMove = useCallback((e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length >= 2 && gesture.current) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const g = gesture.current;
      setTransform({
        scale: clampScale(g.startScale * (dist / g.startDist)),
        tx: g.startTx + (mid.x - g.startMid.x),
        ty: g.startTy + (mid.y - g.startMid.y),
      });
    } else if (pts.length === 1 && panPoint.current) {
      const dx = e.clientX - panPoint.current.x;
      const dy = e.clientY - panPoint.current.y;
      panPoint.current = { x: e.clientX, y: e.clientY };
      // เลื่อนได้เฉพาะตอนซูมเข้าอยู่ ไม่งั้นภาพพอดีเฟรมแล้วไม่ต้องขยับ
      setTransform((t) => (t.scale > 1 ? { ...t, tx: t.tx + dx, ty: t.ty + dy } : t));
    }
  }, []);

  const handlePointerEnd = useCallback((e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;

    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      panPoint.current = { x: p.x, y: p.y };
    } else if (pointers.current.size === 0) {
      panPoint.current = null;
      setInteracting(false);
      // ปล่อยนิ้วแล้วถ้าใกล้ขนาดปกติ ให้ snap กลับพอดีเฟรม
      setTransform((t) => (t.scale <= 1.02 ? { scale: 1, tx: 0, ty: 0 } : t));
    }
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ดูรูปแบบเต็มจอ"
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 [animation:fadeIn_0.2s_ease-out]"
    >
      <div
        className="flex-1 min-h-0 overflow-hidden touch-none flex items-center justify-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-w-full max-h-full select-none will-change-transform"
          style={{
            transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
            transition: interacting ? 'none' : 'transform 0.15s ease-out',
          }}
        />
      </div>

      {caption && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-[90%] text-center bg-[rgba(15,23,42,0.85)] text-white px-4 py-2 rounded-[var(--radius-pill)] text-[clamp(12px,3.7vw,16px)] font-bold border border-white/20">
          {caption}
        </div>
      )}

      <div className="shrink-0 p-4 pb-6 flex justify-center bg-gradient-to-t from-black/70 to-transparent">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary min-h-16 w-full max-w-xs text-[clamp(18px,4.8vw,22px)] font-bold gap-2"
        >
          <X size={26} strokeWidth={2.5} aria-hidden="true" />
          ปิด
        </button>
      </div>
    </div>
  );
}
