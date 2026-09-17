# User Story: US-CF-06 - หลังดูคะแนน G13 กลับไปที่ Start Menu

**Status:** 🟢 Done (code) 2026-08-03 — จบ G13 → `router.push("/lessons")` (Start Menu ที่มีปุ่ม Play) ใน `game/page.tsx`; `tsc` ผ่าน ไม่มี lint issue ใหม่ (แนะนำ browser QA)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** High
**Estimate:** S
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #6

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่เพิ่งจบเกม G13 และดูคะแนนเสร็จแล้ว
**ฉันต้องการ** กดปุ่ม Finish หรือ Return แล้วถูกนำกลับไปที่ Start Menu
**เพื่อให้** flow การใช้งานสิ้นสุดอย่างชัดเจนและสมบูรณ์

---

> ⚠️ **Override:** ข้อนี้แทนที่การตัดสินเดิมของ [US-FLOW-01](./US-FLOW-01.md) (2026-07-27) ที่จบ G13 แล้วไป `/posttest` — posttest ถูกถอดออกจากปลาย Flow, จบ G13 ให้กลับ Start Menu แทน

## ✅ Acceptance Criteria

1. [x] ปุ่ม Finish ("ไปต่อ") บนหน้าคะแนน G13 → navigate ไป **Start Menu (`/lessons`)** ที่มีปุ่ม Play (ยืนยันปลายทางกับทีม 2026-08-03)
2. [x] ไม่ติดค้าง/ไม่วนลูป/ไม่ไปหน้าอื่น — route ตรงไป `/lessons` (เดิมไป `/posttest` — เลิกใช้)
3. [x] State ถูก reset: `currentStep: "lessons"`, เคลียร์ `currentLessonId`; G13 ไม่ให้ดาว/ไม่บันทึกความคืบหน้าบทอยู่แล้ว

---

## 🛠 Technical Tasks

- [x] ระบุ handler: `handleFinishGame` ใน `src/app/lessons/[id]/game/page.tsx` (branch `lessonId === FLOW_G13_ID`)
- [x] อัปเดต handler: `saveProgress({ currentStep:"lessons", currentLessonId:undefined })` + `router.push("/lessons")`
- [ ] browser QA end-to-end: เริ่ม → ... → G13 → ดูคะแนน → กด "ไปต่อ" → Start Menu (Play)

> ⚠️ **ความเสี่ยง/ตามต่อ:** posttest ถูกถอดออกจากปลาย Flow แล้ว (เดิม G13 → `/posttest`) → หน้า `/posttest` กลายเป็น **unreachable ผ่าน Flow** ทีมต้องตัดสินว่าจะเก็บ posttest ไว้ที่จุดใด (เช่น จุดอื่นของ journey) หรือถอดออก — บันทึกไว้ใน [US-FLOW-01](./US-FLOW-01.md) ด้วย

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G13 remake: [US-GAME-13-R2](./US-GAME-13-R2.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
