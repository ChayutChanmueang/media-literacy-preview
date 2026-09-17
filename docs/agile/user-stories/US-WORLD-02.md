# User Story: US-WORLD-02 - NPC + Interaction Zones + ปุ่มโต้ตอบ

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Foundation / Phase 1)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🔴 P0
**Estimate:** M
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §11, §9.3 · [04 SRS](../../wiki/design/04-requirements-specification.md) §9.3, §13
**Depends on:** [US-WORLD-01](./US-WORLD-01.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้เล่น
**ฉันต้องการ** เดินเข้าใกล้เพื่อนบ้าน/วัตถุแล้วมีปุ่ม "คุย/ตรวจดู" ชัดเจน
**เพื่อที่จะ** รู้ว่าตรงไหนโต้ตอบได้ และเริ่มเหตุการณ์ในเรื่องได้เอง

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้:**
- วาง NPC หลัก 5–7 ตัวตาม §11 (ป้าคำ, ลุงปัน, ป้าสาย, พยาบาลเมย์, เจ้าหน้าที่นที + ครอบครัว) แต่ละตัวมีชื่อ/บทบาท/ตำแหน่ง
- **Interaction zone** รอบ NPC/วัตถุ — เข้าใกล้แล้วมี **visual feedback ชัดเจน** (ไฮไลต์/ไอคอน "!") ตาม §9.3 SRS
- ปุ่มโต้ตอบ: มือถือ = ปุ่มใหญ่ ≥48px วางไม่ทับ gesture browser; PC = คีย์โต้ตอบ (E/Space) + คลิก
- วัตถุโต้ตอบได้พื้นฐาน (โทรศัพท์, โปสเตอร์, เคาน์เตอร์) ตาม §9.3
- ยิง event `interaction-started` เมื่อกดโต้ตอบ (ต่อกับ US-WORLD-03/04)

**ยังไม่ทำในรอบนี้:**
- บทสนทนาเต็ม (→ US-WORLD-04), การผูกเหตุการณ์→มินิเกม (→ US-WORLD-05/06)
- NPC เดินตามตารางเวลา (นอก prototype scope §6.2)
- Portrait/ภาพ NPC จริง (ใช้ emoji/SVG ไปก่อน — US-WORLD-09)

## Acceptance Criteria (Prototype)

- [ ] NPC 5–7 ตัวปรากฏบนแผนที่ตำแหน่งตาม §9 (ถูกที่ถูกสถานที่)
- [ ] เข้าใกล้ NPC/วัตถุแล้วมีสัญญาณชัดเจนว่าโต้ตอบได้ (ไฮไลต์ + ไอคอน)
- [ ] ปุ่มโต้ตอบมือถือใหญ่ ≥48px ไม่ทับพื้นที่ gesture ล่างจอ; PC กดคีย์/คลิกได้
- [ ] กดโต้ตอบ → ยิง event `interaction-started` พร้อม id ของ NPC/วัตถุ
- [ ] เดินออกนอก zone แล้วสัญญาณโต้ตอบหายไป
- [ ] ใช้ข้อความ + ไอคอน + สี ร่วมกัน (ไม่พึ่งสีอย่างเดียว) ตาม a11y

## Technical Tasks

- [ ] โครงสร้างข้อมูล NPC/วัตถุ (id, ชื่อ, บทบาท, ตำแหน่ง, zone radius) ใน `src/data/world/`
- [ ] ตรวจ proximity + วาดไฮไลต์/ไอคอนบน Canvas
- [ ] ปุ่มโต้ตอบ (mobile overlay + keyboard) → callback ยิง `interaction-started`
- [ ] ตรวจ `tsc`/`eslint` ผ่าน + ทดสอบเข้า/ออก zone ในเบราว์เซอร์

## Related Documents
- Prototype GDD: [05 §11 NPCs](../../wiki/design/05-mini-prototype-gdd.docx.md)
- ก่อนหน้า: [US-WORLD-01](./US-WORLD-01.md) · ตามด้วย: [US-WORLD-04](./US-WORLD-04.md)
