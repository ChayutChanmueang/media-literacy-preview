# User Story: US-CF-20 - G13: โคนต้องลากจริง (drag) ไม่ใช่แตะตำแหน่ง (touch-to-move)

**Status:** ✅ Done
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** Dev Team
**Priority:** High
**Estimate:** M
**Version:** 1.1 | **Last Updated:** 2026-08-04
**Deadline:** 2026-08-04
**Source:** Client Feedback เพิ่มเติม 2026-08-03 / 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้เล่นเกม G13 "ต่อไอติมรู้ทันสื่อ"
**ฉันต้องการ** ให้โคนไอศกรีมเคลื่อนที่โดยการลากนิ้วจริงๆ (drag) ไม่ใช่การแตะที่ตำแหน่งบนจอแล้วโคนกระโดดไป
**เพื่อให้** ควบคุมโคนได้แม่นยำกว่าเดิม และป้องกันการกดผิดที่ทำให้โคนกระโดดไปตำแหน่งที่ไม่ต้องการ

---

## 🎯 Before / After

**ก่อน (touch-to-move):**
- ผู้เล่นแตะที่ใดก็ได้บนจอ → โคนกระโดดไปตำแหน่งนั้นทันที
- ทำให้โคนเคลื่อนที่กระตุกและควบคุมยาก

**หลัง (drag-to-move):**
- ผู้เล่นต้องวางนิ้วลงบนโคน (หรือในบริเวณใกล้โคน) แล้วลากซ้าย-ขวา
- โคนเลื่อนตามนิ้วอย่างต่อเนื่อง (smooth) ไม่กระโดดข้ามตำแหน่ง

---

## ✅ Acceptance Criteria

1. [x] โคนเคลื่อนที่ได้เฉพาะเมื่อผู้เล่นวางนิ้วลง (pointerdown/touchstart) ที่บริเวณโคนหรือใกล้โคน แล้วลากไปซ้าย-ขวา
2. [x] การแตะตำแหน่งอื่นบนจอโดยไม่ลาก ไม่ทำให้โคนเคลื่อนที่
3. [x] โคนเลื่อนตามนิ้วอย่าง smooth ไม่กระตุกหรือกระโดด (ใช้ drag offset)
4. [x] โคนยังอยู่ภายใน world bounds (ไม่หลุดขอบจอ)
5. [x] ใช้งานได้ทั้ง touch (mobile) และ mouse drag (desktop)
6. [x] Hit area สำหรับเริ่ม drag กว้างพอสำหรับผู้สูงอายุ (±120px จากโคน หรือ 30% ของความกว้างจอ และในพื้นที่ด้านล่าง 60% ของจอ)

---

## 🛠 Technical Tasks

- [x] ระบุ input handler ปัจจุบันใน G13 Canvas (`handlePointerDown`, `handlePointerMove`) ใน `G13ScoopStacker.tsx`
- [x] เปลี่ยนเป็น drag-based: ตรวจ `pointerDown` ว่าอยู่ในบริเวณโคน → บันทึก `dragPointerId` และ `dragOffset` → `pointerMove` เลื่อนโคนตามตำแหน่งนิ้วหักลบด้วย offset → `pointerUp`/`cancel` รีเซ็ตสถานะ
- [x] เพิ่ม hit area ขนาดใหญ่กว่า sprite โคนจริง (±120px หรือ 30% width) เพื่อ accessibility สำหรับผู้สูงอายุ
- [x] ทดสอบว่า cone bounds clamping ยังทำงานถูกต้อง (`clampToRange`)
- [x] ตรวจสอบความถูกต้องด้วย automated tests และ TypeScript checks ยืนยันความสมบูรณ์

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G13 remake: [US-GAME-13-R2](./US-GAME-13-R2.md)
- ขยายขนาด sprite: [US-CF-14](./US-CF-14.md)
