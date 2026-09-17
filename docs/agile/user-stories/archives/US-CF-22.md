# User Story: US-CF-22 - จัดข้อความหน้าเริ่ม Flow (Start Menu) ชวนดูคลิปแรก (3 บรรทัด)

**Status:** 🟢 Done (code) 2026-08-04 — ลบ badge/h2/subtitle แล้วจัดข้อความชวนดูคลิป 3 บรรทัด (เน้นชื่อคลิป) ใน `src/app/lessons/page.tsx`; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Client/Internal Feedback (กลุ่มเดียวกับ US-CF-16..21)
**Owner:** TBD
**Priority:** Medium
**Estimate:** XS
**Version:** 1.0 | **Last Updated:** 2026-08-04
**Source:** feedback ทีม 2026-08-04 (ทบทวนหน้าก่อนเริ่ม flow game)

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่กดเข้ามาหน้าเริ่มเล่น (Start Menu ก่อนเข้า Auto Flow)
**ฉันต้องการ** ให้หน้ามีข้อความสั้น ๆ ชวนไปดูคลิปแรกเท่านั้น ไม่รก
**เพื่อให้** เข้าใจว่ากดปุ่มแล้วจะได้ดูคลิปอะไร และไม่สับสนกับข้อความหลายบรรทัด

---

## 🎯 สิ่งที่ต้องแก้ (`src/app/lessons/page.tsx` — บล็อก `activeSubPage === "modes"`)

**เอาออกทั้งหมด** (ตาม feedback กากบาทในภาพ):
- Badge `📖 รู้ทันสื่อวัยเก๋า` (`<div>` BookOpen + span)
- หัวข้อ `พร้อมเริ่มเรียนรู้หรือยัง?` (`<h2>`)
- คำอธิบาย `กดปุ่มด้านล่างเพื่อเริ่มกิจกรรมรู้ทันสื่อแสนสนุกได้เลยครับ` (`<p>`)

**แทนที่ด้วยข้อความชวนดูคลิป จัด 3 บรรทัด** (ตาม design ที่ทีมจัดมา — เน้นชื่อคลิปให้เด่น):

> พร้อมแล้วไปดูคลิป
> **"ใครๆก็ทำสื่อได้"**  ← บรรทัดกลาง ตัวใหญ่หนา (34px)
> กันเลย!

- บรรทัดบน/ล่าง 24px, บรรทัดกลาง (ชื่อคลิป) 34px extrabold, จัดกึ่งกลาง
- คงปุ่ม `▶ เริ่มเล่น` ไว้เหมือนเดิม (ไม่แตะ logic `handleStartFlowMode`)
- ฟอนต์ทุกบรรทัด ≥20px (เกณฑ์ผู้สูงอายุ)

> หมายเหตุ: `"ใครๆก็ทำสื่อได้"` คือคลิปแรกของ flow (Topic 1 — Understanding Media Messages) ซึ่ง flow เริ่มด้วยวิดีโอ topic-1 เสมอ จึงระบุชื่อคลิปนี้ได้

---

## ✅ Acceptance Criteria

1. [x] หน้า Start Menu แสดง**เฉพาะ** ข้อความชวนดูคลิป (3 บรรทัด เน้นชื่อคลิป) + ปุ่ม `เริ่มเล่น`
2. [x] ไม่มี badge "รู้ทันสื่อวัยเก๋า", ไม่มีหัวข้อ "พร้อมเริ่มเรียนรู้หรือยัง?", ไม่มีคำอธิบายเดิม
3. [x] ฟอนต์ข้อความ ≥20px
4. [~] ปุ่ม `เริ่มเล่น` ยังทำงาน (เข้าสู่ Auto Flow → วิดีโอ topic-1) เหมือนเดิม
5. [ ] Layout ไม่พัง / จัดกึ่งกลางอ่านง่าย — รอ browser QA

---

## 🛠 Technical Tasks

- [x] ลบ badge + h2 + p ในบล็อก `activeSubPage === "modes"` ของ `src/app/lessons/page.tsx`
- [x] ใส่ข้อความ 3 บรรทัด (24/34/24px, บรรทัดกลาง extrabold, จัดกึ่งกลาง)
- [x] `tsc --noEmit` ผ่าน
- [ ] browser QA

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Component: `src/app/lessons/page.tsx` (Start Menu — US-CF-02)
- Flow: [US-CF-07](./US-CF-07.md) (video-first), [US-CF-02](./US-CF-02.md) (Start Menu ปุ่มเดียว)
- คลิป Topic 1: [gdd/02-narrative.md](../../gdd/02-narrative.md)
