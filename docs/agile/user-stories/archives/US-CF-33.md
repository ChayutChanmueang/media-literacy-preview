# User Story: US-CF-33 - Resume flow ตรงบทที่ค้าง (เลี่ยงหน้าชื่อคลิปซ้ำจาก Start Menu)

**Status:** 🟢 Done (code) 2026-08-04 — Landing "กดที่นี่เพื่อเริ่ม" resume เข้าบทที่ค้างเลยเมื่อเล่นกลางคัน; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 (bug flow)
**Owner:** TBD | **Priority:** Medium | **Estimate:** XS
**Version:** 1.0 | **Last Updated:** 2026-08-04
**Source:** feedback ทีม 2026-08-04

---

## 📖 Description / Bug

**อาการ:** เมื่อเล่น flow ไปแล้วบางบท แล้วกลับมาหน้าแรก (`/`) กดปุ่ม **"กดที่นี่เพื่อเริ่ม"** → ไปหน้า Start Menu ที่โชว์ **"พร้อมแล้วไปดูคลิป ใครๆก็ทำสื่อได้"** (topic-1) เสมอ แต่พอกด "เริ่มเล่น" กลับ resume ไปบทถัดไป เช่น **"รับชมคลิป ทำไมคนถึงเชื่อข่าวปลอม"** (topic-3) → เห็นหน้าชื่อคลิป **ซ้ำ 2 หน้าที่ไม่ตรงกัน → งง**

**ต้องการ:** ถ้าเล่นไปแล้ว ให้กดแล้ว**เข้าบทที่ค้างเลย** ไม่ต้องผ่านหน้า Start Menu ที่โชว์คลิปแรกซ้ำ

---

## 🎯 สิ่งที่ต้องแก้ (`src/app/page.tsx` — `handleNext`)

- ยังไม่ยินยอม/ไม่มีกลุ่มอายุ → `/consent` (เหมือนเดิม)
- **เล่นค้างกลางคัน** (ผ่านบท flow บางบทแต่ยังไม่ครบ — วัดจาก `stars` เทียบ `FLOW_SEQUENCE`) → **resume เข้าบทที่ค้างเลย** (`firstIncompleteFlowLesson` → `/lessons/<id>/video`) ข้าม Start Menu
- **fresh (ยังไม่เริ่ม) หรือ เล่นครบทุกบทแล้ว** → `/lessons` (Start Menu ตามเดิม; ครบแล้วยังเข้าถึงปุ่มเกียรติบัตร/เล่นซ้ำได้)

> topic-1 ไม่มีหน้า intro (Start Menu ทำหน้าที่นั้น) จึงไม่ซ้ำ; บทที่ resume (topic-3/topic-6) มีหน้าชื่อคลิปของตัวเองอยู่แล้ว

---

## ✅ Acceptance Criteria

1. [x] เล่นค้าง (เช่นจบ topic-1) กด "กดที่นี่เพื่อเริ่ม" → เข้า topic-3 (วิดีโอ/หน้าชื่อคลิป) เลย ไม่เห็น Start Menu "ใครๆก็ทำสื่อได้" ซ้ำ
2. [x] ผู้ใช้ใหม่ (ยังไม่เล่น) → Start Menu ตามเดิม
3. [x] เล่นครบทุกบท → Start Menu ตามเดิม (เข้าถึงเกียรติบัตร/เล่นซ้ำ)
4. [ ] browser QA ทุกกรณี

---

## 🛠 Technical Tasks

- [x] `page.tsx handleNext`: เช็ค `doneCount` จาก `stars` เทียบ `FLOW_SEQUENCE`; 0<done<len → resume video; else → `/lessons`
- [x] `tsc`/lint ผ่าน (ไม่มี error ใหม่)
- [ ] browser QA

---

## 🔗 Related

- Component: `src/app/page.tsx`, `src/lib/flow.ts` (`firstIncompleteFlowLesson`, `FLOW_SEQUENCE`)
- หน้าชื่อคลิป: [US-CF-24](./US-CF-24.md), Start Menu: [US-CF-22](./US-CF-22.md)
