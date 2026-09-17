# User Story: US-CF-09B - แยกหัวข้อสถานการณ์ในหน้าแสดงโจทย์ G6 เป็น 2 บรรทัด

**Status:** 🟢 Done (code) 2026-08-03 — แยก `scenario.title` ที่ ": " เป็น 2 บรรทัด (ป้ายลำดับ / ชื่อเรื่อง) ในหน้าแสดงโจทย์ของ G6; `tsc` ผ่าน (แนะนำ browser QA)
*(หมายเหตุ: โค้ดส่วนนี้ยังอยู่ครบแต่หน้าจอถูกปิดชั่วคราวด้วย flag `SHOW_SCENARIO_INTRO = false` จาก US-CF-26)*
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** S
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Deadline:** 2026-08-04
**Source:** คำสั่งทีมเพิ่มเติม 2026-08-03 (พร้อมภาพ before/after) — **หน้าแสดงโจทย์/สถานการณ์ของ G6** (เฟส `!introDone`) ไม่ใช่ how-to-play intro

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่เข้าหน้าแนะนำสถานการณ์ของ G6
**ฉันต้องการ** ให้หัวข้อสถานการณ์แสดงเป็น 2 บรรทัด (บรรทัดบน = ลำดับสถานการณ์, บรรทัดล่าง = ชื่อเรื่อง)
**เพื่อให้** อ่านง่ายขึ้น เห็นลำดับสถานการณ์ชัด และชื่อเรื่องไม่ยาวปนกันจนสับสน

---

## 🎯 Before / After

**ก่อน (บรรทัดเดียว):**
```
สถานการณ์ที่ 1: เจ้าหน้าที่สรรพากรทวงภาษีค้างจ่าย
```

**หลัง (2 บรรทัด):**
```
สถานการณ์ที่ 1
เจ้าหน้าที่สรรพากรทวงภาษีค้างจ่าย
```

---

## ✅ Acceptance Criteria

1. [x] หน้าแสดงโจทย์/สถานการณ์ของ G6 แสดงหัวข้อเป็น 2 บรรทัด: บรรทัดบน "สถานการณ์ที่ N" (ป้ายลำดับ), บรรทัดล่างเป็นชื่อเรื่อง
2. [x] ใช้ได้ครบทั้ง 3 สถานการณ์ (s1/s2/s3) — แยกจากสตริง `title` เดิมที่คั่นด้วย ": " (ไม่แก้ข้อมูลทีละอัน)
3. [x] ป้ายลำดับ `clamp(18,5vw,22)` + ชื่อเรื่อง `clamp(20,6.5vw,30)` — ≥20px ตามเกณฑ์ผู้สูงอายุ (สอดคล้อง [US-CF-09](./US-CF-09.md))
4. [~] Layout ไม่พัง — มี fallback บรรทัดเดียวถ้า title ไม่มี ": "; **รอ browser QA จอเล็ก**

---

## 🛠 Technical Tasks

- [x] ใน `src/components/G6LineSimulation.jsx` เฟส `!introDone` — เพิ่ม `scenarioLabel`/`scenarioTitleText` (split `scenario.title` ที่ ": ") แล้ว render 2 บรรทัด (ป้ายลำดับ + ชื่อเรื่อง)
- [x] fallback: ถ้า title ไม่มี ": " แสดงบรรทัดเดียวเหมือนเดิม
- [x] `tsc` ผ่าน; ไม่เพิ่ม lint issue ใหม่จากบรรทัดที่แก้ (errors เดิมใน G6 เป็นของ commit ทีม `1c843ca` US-CF-12)
- [ ] browser QA ทั้ง 3 สถานการณ์บน mobile portrait

---

## 🔗 Related Documents

- จอเดียวกัน (font size): [US-CF-09](./US-CF-09.md)
- G6 remake: [US-GAME-06-R1](./US-GAME-06-R1.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
</content>
