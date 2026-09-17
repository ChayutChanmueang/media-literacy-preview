# User Story: US-CF-07 - เล่นวิดีโอก่อน แล้วจึงให้ผู้ใช้เล่นเกม

**Status:** 🟢 Done (code) 2026-08-03 — รื้อ Flow กลับเป็น video-first (คลิป→เกม); `tsc` ผ่าน, unit tests 13 ผ่าน, ไม่มี lint issue ใหม่ (แนะนำ browser QA เดินสายเต็ม)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** High
**Estimate:** M
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #7

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่เข้ามาเรียนในแอป
**ฉันต้องการ** ดูวิดีโอแนะนำเนื้อหาก่อน แล้วจึงเล่นเกมที่เกี่ยวข้อง
**เพื่อให้** มีความเข้าใจพื้นฐานก่อนเริ่มฝึก และ flow การเรียนรู้สมเหตุสมผล

---

> ⚠️ **Override:** ข้อนี้กลับทิศ [US-FLOW-01](./US-FLOW-01.md) commit `863895c` (2026-07-27) ที่รื้อ Flow เป็น **game-first** — ต้องรื้อกลับเป็น **video-first (คลิป→เกม)** ตามที่ลูกค้าต้องการ

## ✅ Acceptance Criteria

1. [x] ในสาย Flow วิดีโอแสดงก่อน gameplay เสมอ — entry เข้า `/lessons/{first}/video` ก่อน; คลิปจบ → เกมบทเดียวกัน
2. [x] ผู้ใช้ดูวิดีโอก่อน (หรือกดข้าม/auto-advance 15 วิหลังคลิปจบ) จึงเข้าเกม
3. [x] Flow: **คลิป→เกม** (คลิป topic-1→G1→คลิป topic-3→G3→คลิป topic-6→G6→G13→Start Menu)
4. [x] logic ใน `src/lib/flow.ts` + game/video/lessons pages อัปเดตแล้ว (ดู [US-FLOW-01](./US-FLOW-01.md))

---

## 🛠 Technical Tasks

- [x] `src/lib/flow.ts`: rename `nextFlowGameAfterVideo` → `nextFlowLessonAfterGame` (advance ลำดับหลัง "เกม" จบ) + แก้ doc comment เป็น video-first
- [x] `lessons/page.tsx`: entry Flow → `currentStep:"video"` + `/lessons/{first}/video`
- [x] `game/page.tsx`: หลังเกมจบ (flow) → คลิปบทถัดไป (`nextFlowLessonAfterGame`) หรือ G13 ถ้าบทสุดท้าย
- [x] `video/page.tsx`: หลังคลิปจบ → เกมบทเดียวกัน (ทั้ง flow/manual); ลบ import flow ที่ไม่ใช้; ปรับ label ปุ่ม
- [x] `tsc` ผ่าน, unit tests 13 ผ่าน
- [ ] browser QA end-to-end: consent → Flow → คลิป→G1→คลิป→G3→คลิป→G6→G13→Start Menu + resume + Manual ไม่พัง

---

## ⚠️ Important Note

สอดคล้องกับผลตอบรับภายใน ข้อ #1 ใน [FB-2026-07-31-playtest.md](../feedback/FB-2026-07-31-playtest.md)
อาจมีผลกระทบต่อ Acceptance Criteria ของ [US-VIDEO-01](./US-VIDEO-01.md) — ต้องทบทวนร่วมกัน

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Video: [US-VIDEO-01](./US-VIDEO-01.md)
- Internal feedback: [FB-2026-07-31-playtest.md](../feedback/FB-2026-07-31-playtest.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
