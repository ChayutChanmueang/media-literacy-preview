# User Story: US-WORLD-04 - ระบบบทสนทนา (Dialogue Overlay)

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Narrative / Phase 2)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🟠 P1
**Estimate:** M
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §17.2, §20.2 · [04 SRS](../../wiki/design/04-requirements-specification.md) §14
**Depends on:** [US-WORLD-02](./US-WORLD-02.md), [US-WORLD-03](./US-WORLD-03.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** อ่านบทสนทนากับเพื่อนบ้านด้วยตัวอักษรใหญ่ ทีละหน้า เลือกตอบได้
**เพื่อที่จะ** เข้าใจสถานการณ์ก่อนเข้ามินิเกม (เล่นก่อน สอนทีหลัง — เหตุการณ์มีบริบท)

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้:**
- Dialogue เป็น **React overlay เหนือ Canvas** (§17.2) — ชื่อผู้พูด, ไอคอน/emoji ตัวละคร, ตัวอักษรใหญ่, ปุ่มถัดไป
- ปุ่ม **ย้อนอ่านข้อความล่าสุด**, ตัวเลือกคำตอบ **≤3 ตัวเลือก**, ไม่มีข้อความยาวเกินในหนึ่งหน้า
- ยืนยันก่อนตัดสินใจสำคัญ (§14 SRS), ไฮไลต์คำสำคัญ
- Data-driven ตาม §20.2: `ผู้พูด, ข้อความ, สีหน้า/รูป, ตัวเลือก, เงื่อนไข, เหตุการณ์ถัดไป` — เก็บใน JSON
- ยิง event `dialogue-opened`, และเมื่อจบบทสนทนาที่ผูกเหตุการณ์ ให้ trigger `incident-started`

**ยังไม่ทำในรอบนี้:**
- Text-to-speech (มีอยู่ในเกม แต่ dialogue โลกเลื่อนไป polish รอบหลัง — §14 บอก "future versions")
- Portrait ภาพจริง (emoji/SVG ไปก่อน)
- เส้นเรื่องแตกแขนงหลายทาง (นอก scope §6.2 — prototype เป็นเส้นตรง)

## Acceptance Criteria (Prototype)

- [ ] เปิดบทสนทนาจาก `interaction-started` — แสดงชื่อผู้พูด + ไอคอน + ข้อความไทยตัวใหญ่
- [ ] อ่านทีละหน้า, ปุ่มถัดไปชัดเจน, ปุ่มย้อนอ่านล่าสุดใช้ได้
- [ ] ตัวเลือกคำตอบ ≤3, แตะง่าย (≥48px), ไม่มีหน้าไหนข้อความยาวเกินไป
- [ ] มีการยืนยันก่อนตัดสินใจสำคัญ (เช่น ก่อนเข้ามินิเกม/ก่อนกดยืนยันเสี่ยง)
- [ ] เนื้อหาบทสนทนามาจาก JSON (แก้ได้โดยไม่แตะ logic)
- [ ] จบบทสนทนาที่ผูกเหตุการณ์ → ยิง `incident-started` ถูกต้อง

## Technical Tasks

- [ ] `src/components/world/DialogueOverlay.tsx` (React overlay, ตัวใหญ่, ปุ่มใหญ่)
- [ ] schema + ตัวอย่างข้อมูลบทสนทนา `src/data/world/dialogue/*.json` (ตาม §20.2)
- [ ] เชื่อม event bus: `dialogue-opened`, ส่งต่อ `incident-started`
- [ ] ตรวจ `tsc`/`eslint` + playtest อ่านบทสนทนา + เลือกตอบในเบราว์เซอร์

## Related Documents
- Prototype GDD: [05 §17.2 Dialogue UI, §20.2 Dialogue Data](../../wiki/design/05-mini-prototype-gdd.docx.md)
- SRS: [04 §14 Dialogue Requirements](../../wiki/design/04-requirements-specification.md)
- ตามด้วย: [US-WORLD-05](./US-WORLD-05.md)
