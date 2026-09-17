# User Story: US-CF-32 - ตัดหน้าสรุปคะแนนออกจาก Flow + ปุ่มจบบทเรียนเป็น "เสร็จสิ้นบทเรียน"

**Status:** 🟢 Done (code) 2026-08-04 — flow จบเกม → หน้าชื่อคลิปเลย (ไม่ผ่าน summary); ปุ่มจบ G1/G6 → "เสร็จสิ้นบทเรียน"; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 (ปรับ flow ต่อจาก US-CF-24)
**Owner:** TBD | **Priority:** Medium | **Estimate:** XS
**Version:** 1.0 | **Last Updated:** 2026-08-04
**Source:** feedback ทีม 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้เล่นในโหมด flow
**ฉันต้องการ** ให้จบเกมแล้วไปหน้าชื่อคลิปถัดไปเลย ไม่มีหน้าสรุปคะแนน/รางวัลคั่น
**เพื่อให้** flow ต่อเนื่องลื่น ไม่มีหน้าที่รก

> ปรับจาก [US-CF-24](./US-CF-24.md) ที่เพิ่มหน้า summary คั่น — feedback ใหม่ให้เอาออก

---

## 🎯 สิ่งที่ต้องแก้

1) **`src/app/lessons/[id]/game/page.tsx`** — flow จบเกม **ข้ามหน้า summary** → ไป "หน้าชื่อคลิป" ของบทถัดไปเลย (video intro) หรือ G13 ถ้าเป็นบทสุดท้าย (ใช้ `nextFlowLessonAfterGame`); โหมด manual ยังมีหน้า summary เหมือนเดิม (ดาวยังถูกบันทึกทุกกรณี)

2) **ปุ่มจบตามตำแหน่งใน flow** (แก้ไข 2026-08-04 รอบ 2):
   - เกมที่**ไม่ใช่**เกมท้าย flow (**G1/G3/G6**) → **"บทเรียนถัดไป"**
   - เกมท้าย flow (**G13**) → **"เสร็จสิ้นบทเรียน"** (ปุ่ม "ไปต่อ"→ "เสร็จสิ้นบทเรียน"); "เล่นอีกรอบ" คงไว้
   - *(รอบแรกเคยตั้งทั้งหมดเป็น "เสร็จสิ้นบทเรียน" — ปรับใหม่ให้สื่อว่ายังมีบทถัดไป)*

3) **หน้าเฉลย G6 auto-advance ช้าลงเป็น 30 วิ** — `delayMs={30000}` ที่ปุ่ม `g6-next` (เดิม default 5 วิ)

---

## ✅ Acceptance Criteria

1. [x] flow: จบเกม (G1/G3) → หน้าชื่อคลิปบทถัดไปเลย (ไม่เห็นหน้า "ยินดีด้วย/ดาว")
2. [x] flow: จบ G6 → G13 เลย
3. [x] ปุ่มจบ G1/G3/G6 = "บทเรียนถัดไป"; G13 = "เสร็จสิ้นบทเรียน"
4. [x] ดาวยังถูกบันทึก (progress) แม้ไม่โชว์หน้า summary
5. [x] หน้าเฉลย G6 auto-advance = 30 วิ
6. [ ] browser QA flow ครบ

---

## 🛠 Technical Tasks

- [x] game/page.tsx: flow branch → next video (clip intro) / G13 (re-import `nextFlowLessonAfterGame`)
- [x] G1/G6: label ปุ่มข้อสุดท้าย → "เสร็จสิ้นบทเรียน"
- [x] `tsc`/lint ผ่าน (ไม่มี error ใหม่)
- [ ] browser QA

---

## 🔗 Related

- ปรับจาก: [US-CF-24](./US-CF-24.md) (หน้าชื่อคลิป intro ยังอยู่), [US-CF-30](./US-CF-30.md)
- G6 ปุ่มจบ: [US-CF-26](./US-CF-26.md) item 10
- Component: `src/app/lessons/[id]/game/page.tsx`, `G1FactCheck.jsx`, `G6LineSimulation.jsx`
- หมายเหตุ: หน้า `summary/page.tsx` ยังอยู่สำหรับ manual mode (ตอนนี้ manual ถูกซ่อน → หน้านี้ไม่ถูกเรียกใน flow)
