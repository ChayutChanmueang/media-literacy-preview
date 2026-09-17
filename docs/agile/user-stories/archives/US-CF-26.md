# User Story: US-CF-26 - G6 "จำลองแชทไลน์": ชื่อเกม + ภาษาไทย + ตัดหน้าสถานการณ์ + ปุ่มจบ

**Status:** 🟢 Done
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 ([ML](../meeting-log/ML-2026-08-04-client-feedback.md) #7–10)
**Owner:** TBD | **Priority:** Medium | **Estimate:** M
**Version:** 1.0 | **Last Updated:** 2026-08-04

---

## 📖 Description

ปรับ G6 (`src/components/G6LineSimulation.jsx`) ให้ชื่อ/ภาษาเป็นไทย, ลดขั้นตอนเข้าเกม, และปุ่มจบให้ตรงพฤติกรรม

---

## 🎯 สิ่งที่ต้องแก้

**1) ชื่อเกม** → **"จำลองแชทไลน์"** (แก้ทุกจุดที่แสดงชื่อเกม: GameIntro/หัวข้อ ฯลฯ)

**2) ใช้ "ไลน์" (ภาษาไทย) แทน "LINE"** ทุกที่ในข้อความที่ผู้ใช้อ่าน (summary/desc/speakerSummary ฯลฯ — ปัจจุบันมีทั้ง "LINE" และ "ไลน์" ปนกัน)

**3) ตัดหน้า "สถานการณ์" (scenario intro) ออก**
- ถ้า intro/how-to หน้าแรกอธิบายครบแล้ว → เปิดเข้าเกมมา **เป็นหน้าแชทเล่นเลย** ไม่ต้องมีหน้าเกริ่นสถานการณ์คั่น
- *(ปิดชั่วคราวด้วย flag `SHOW_SCENARIO_INTRO = false` แทนการลบโค้ด)*

**4) ปุ่มจบ "จบเกมและรับดาว"**
- ปรับ label ให้เหมาะกับสิ่งที่เกิดจริง: "ไปบทถัดไป"

---

## ✅ Acceptance Criteria

1. [x] ชื่อเกมแสดงเป็น "จำลองแชทไลน์" ทุกจุด
2. [x] ไม่มีคำว่า "LINE" (อังกฤษ) ในข้อความที่ผู้ใช้อ่าน — ใช้ "ไลน์"
3. [x] เข้าเกม G6 แล้วเป็นหน้าแชทเลย (ไม่มีหน้าเกริ่นสถานการณ์คั่น) — โดยยังเข้าใจบริบท
4. [x] ปุ่มจบเกม label ตรงพฤติกรรม (ไปต่อ vs รับดาวจริง) ตามทิศทางที่ยืนยัน
5. [x] เล่นครบ 3 สถานการณ์ได้ตามเดิม, ไม่มี console error

---

## 🛠 Technical Tasks

- [x] แก้ชื่อเกม + แทน "LINE"→"ไลน์" ใน `G6LineSimulation.jsx`
- [x] ตัด/ข้าม scenario intro phase (ตรวจ state `introDone`/phase ที่เกี่ยว)
- [x] ยืนยันทิศทางปุ่มจบ → แก้ label/behavior
- [x] `tsc` + lint + browser QA (ครบ 3 สถานการณ์)

---

## 🔗 Related

- Feedback: [ML-2026-08-04](../meeting-log/ML-2026-08-04-client-feedback.md) #7–10
- Component: `src/components/G6LineSimulation.jsx` | เกม: [US-GAME-06](./US-GAME-06.md)
- หัวข้อสถานการณ์: [US-CF-09B](./US-CF-09B.md), [US-CF-16](./US-CF-16.md)
