# User Story: US-FLOW-01 - Flow เรียนต่อเนื่องอัตโนมัติ (คลิปสั้น → เกม) + ปิดท้ายด้วยมินิเกมสนุก G13

**Status:** 🔨 โค้ด video-first เสร็จ (2026-08-03) — รื้อกลับเป็น **คลิป→เกม** (US-CF-07) + จบ G13 → **Start Menu** (US-CF-06); `tsc` ผ่าน, unit tests 13 ผ่าน — **รอ QA playtest คลิกจริง** (ยัง mark done ไม่ได้ตามกติกา AGENT ข้อ 1)
> ประวัติ: 2026-07-27 ทำเป็น game-first + posttest (`863895c`) → 2026-07-31 client feedback ให้กลับเป็น video-first → 2026-08-03 รื้อกลับเสร็จ (US-CF-06/US-CF-07)
**Epic:** [Product Backlog](../01-product-backlog.md) — สืบเนื่องจาก [US-UX-04](./archives/US-UX-04.md) (โหมด Flow / Manual); ปรับทิศตาม [US-CF-06](./US-CF-06.md) + [US-CF-07](./US-CF-07.md)
**Owner:** TBD
**Version:** 2.0 | **Last Updated:** 2026-07-31

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุที่เข้าโหมด "เรียนต่อเนื่องอัตโนมัติ (Flow)"
**ฉันต้องการ** ให้ระบบพาดูคลิปสั้นก่อนแล้วจึงเล่นเกมสลับกันไปโดยอัตโนมัติ และปิดท้ายด้วยเกมสนุก ๆ ที่ไม่กดดัน
**เพื่อให้** เข้าใจเนื้อหาก่อนลงมือฝึก รู้สึกเหมือนเล่นมากกว่าเรียน และได้ผ่อนคลายเป็นรางวัลเมื่อจบบทเรียน

---

## 🔀 การเปลี่ยนแปลง Flow

**เดิม (per-lesson):** เลือกบท → คลิป (`/lessons/[id]/video`) → เกม (`/lessons/[id]/game`) → สรุป (`/lessons/[id]/summary`) — คลิปนำเกม ทีละบทแยกกัน

**Flow ต่อเนื่องอัตโนมัติ (ตัดสินล่าสุด 2026-07-31 — client feedback):**

```
คลิปสั้น → G1 (จริงหรือมั่ว?) → คลิปสั้น → G3 (AI หรือคน?) → คลิปสั้น → G6 (จำลองแชท LINE)
   → [G6 จบ] → G13 (ต่อไอติมรู้ทันสื่อ — มินิเกมสนุก ไม่เน้นเรียนรู้) → [ดูคะแนน] → Start Menu
```

- **คลิปนำหน้าเกม** (คงลำดับ core loop เดิม คลิป→เกม — ตรงกับ [US-CF-07](./US-CF-07.md))
- ลำดับเกมในสาย Flow คือ **G1 → G3 → G6** เท่านั้น (G2, G5 ไม่อยู่ในสายต่อเนื่องนี้) แต่ละเกมนำด้วยคลิปสั้นของบทนั้น
- **G13 เป็นตัวปิดท้าย** หลัง G6 จบ — เน้นความสนุก/ผ่อนคลาย ไม่ให้ดาว/ไม่มี Game Over (ตาม [design-g13](../../gdd/design-g13.md) และนโยบาย positive reinforcement)
- **หลังดูคะแนน G13 → กลับ Start Menu** (ตาม [US-CF-06](./US-CF-06.md) — ไม่ไป posttest แล้ว)
- การเปลี่ยนสเตประหว่างขั้นเป็น **อัตโนมัติ** (auto-advance) ผู้ใช้กดปุ่มเดียว "ถัดไป" ที่ชัดเจน ไม่ต้องกลับไปหน้าเลือกบท

---

## ✅ Acceptance Criteria
1. [ ] เข้าโหมด Flow แล้วระบบเริ่มที่ **คลิปสั้นของ G1** เป็นสเตปแรก (ไม่ใช่เกม)
2. [ ] จบคลิป → เข้า **G1** → คลิปสั้น → **G3** → คลิปสั้น → **G6** อัตโนมัติ ตามลำดับโดยไม่หลุดออกไปหน้าเลือกบท
3. [ ] เมื่อ **G6 จบ** ระบบเปิด **G13** ขึ้นมาเป็นมินิเกมปิดท้าย
4. [ ] G13 ไม่ให้ดาว/ไม่มีจอแพ้/ไม่หักคะแนน — จบเสมอ = ผ่านเสมอ ตาม [design-g13.md](../../gdd/design-g13.md)
5. [ ] หลังดูคะแนน G13 กดปุ่ม Finish/Return → กลับ **Start Menu** (ตาม [US-CF-06](./US-CF-06.md))
6. [ ] ความคืบหน้าถูกจดจำ (Cookie + LocalStorage Hybrid ผ่าน `progressService`) — ปิดแอปแล้วกลับมาเล่นต่อจากขั้นเดิมได้
7. [ ] ทุกขั้นยิง `loggingService.logEvent(...)` (เข้าคลิป/ดูคลิปจบ/ข้ามคลิป/เข้าเกม/จบเกม/เข้า G13) ครบ
8. [ ] Progress bar ใน `AppLayout` สะท้อนลำดับ คลิป→เกม สลับกัน
9. [ ] โหมด Manual (เลือกบทเอง) ยังทำงานได้ตามเดิม — การรื้อ Flow ต้องไม่พังเส้นทาง Manual

---

## 🛠 Technical Tasks
- [x] state machine ของ Flow → `src/lib/flow.ts` (`FLOW_SEQUENCE=[topic-1,topic-3,topic-6]`, `FLOW_G13_ID`, `nextFlowLessonAfterGame`, `firstIncompleteFlowLesson`)
- [x] **รื้อกลับเป็น video-first** (US-CF-07, แก้จาก `863895c`):
  - entry เข้าโหมด Flow → `/lessons/{first}/video` ก่อน (`lessons/page.tsx`)
  - คลิปจบ + flow → เกมของบทเดียวกัน (`video/page.tsx`)
  - เกมจบ + flow → คลิปของบทถัดไป หรือ G13 ถ้าเป็นบทสุดท้าย (`game/page.tsx`, ใช้ `nextFlowLessonAfterGame`)
  - **Manual ไม่แตะ**
- [x] **จบ G13 → Start Menu** (`/lessons`) แทน `/posttest` — ตาม [US-CF-06](./US-CF-06.md)
- [x] ป้ายปุ่มหน้าคลิปปรับตามโหมด (Flow: "ไปเล่นเกม" / Manual: "ไปทำแบบฝึกหัด (เกม)")
- [ ] ปรับ `AppLayout.getProgressPercentage()` ให้รองรับลำดับ คลิป→เกม (ปัจจุบัน path-based ยังพอใช้)
- [ ] ตรวจ `docs/gdd/01-mechanics.md` (core loop คลิป→เกม ยังตรง) + [05 user-journey](../../gdd/05-user-journey.md) ให้สอดคล้อง
- [ ] เพิ่ม/ปรับ Playwright E2E (`src/tests/e2e/journey.spec.ts`) ให้ครอบคลุมสาย Flow ใหม่ทั้งเส้น
- [ ] **QA playtest จริง**: consent → Flow → คลิป → G1 → คลิป → G3 → คลิป → G6 → G13 → Start Menu + ทดสอบ resume + ยืนยัน Manual ยังทำงาน

## ⚠️ หมายเหตุ implementation
- **คลิป topic-6 ยังเป็น placeholder** (`VIDEO_MAP["topic-6"]` fallback ไป videoId ของ topic-1) — รอคลิปจริงจากทีมเนื้อหา (Open Question #1)
- โค้ด game-first เดิม (`863895c`) ที่ต้องแก้กลับ: `lessons/page.tsx` (entry), `lessons/[id]/game/page.tsx` (handleFinishGame), `lessons/[id]/video/page.tsx` (handleNext + nextButtonLabel), `src/lib/flow.ts` (helper อาจต้องปรับชื่อ/ทิศทาง)
- **summary page**: Flow ไม่ผ่าน summary — เก็บ branch `learningMode==="flow"` ไว้ไม่ลบเพื่อลดความเสี่ยง; Manual ยังใช้ summary ปกติ
- **US-UX-04** (Flow เดิม) ควร re-open/ปรับสถานะให้ตรง flow ใหม่ (Open Question #4)

---

## ❓ Open Questions
1. "คลิปสั้น" ที่คั่นระหว่างเกม — ใช้คลิปจาก [04 Video Clip Registry](../../gdd/04-video-clips.md) ตัวไหน map กับ G1/G3/G6? (ปัจจุบัน registry ผูกคลิปกับ topic ไม่ใช่เกม) — topic-6 ยังไม่มีคลิปจริง
2. ~~หลัง G13 จบ ไปหน้าไหนต่อ?~~ ✅ **ตัดสินแล้ว 2026-07-31: กลับ Start Menu** (ตาม [US-CF-06](./US-CF-06.md)) — posttest ถูกถอดออกจากปลาย Flow
3. โหมด Flow ใหม่นี้แทน US-UX-04 เดิมทั้งหมด หรือ US-UX-04 (Flow เดิม) ต้อง re-open/แก้สถานะ?

---

## 🔗 Related Files
- โค้ด flow ปัจจุบัน: `src/components/AppLayout.tsx`, `src/app/lessons/[id]/{video,game,summary}/page.tsx`, `src/lib/flow.ts`
- GDD: [01 Mechanics](../../gdd/01-mechanics.md), [design-g13](../../gdd/design-g13.md), [04 Video Clips](../../gdd/04-video-clips.md)
- Client feedback ที่ปรับทิศ story นี้: [US-CF-06](./US-CF-06.md), [US-CF-07](./US-CF-07.md), [ML-2026-07-31](../meeting-log/ML-2026-07-31-client-feedback.md)
- สืบเนื่อง: [US-UX-04 (Flow/Manual เดิม)](./archives/US-UX-04.md)
</content>
</invoke>
