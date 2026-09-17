# User Story: US-WORLD-09 - Optimize เครื่องสเปคต่ำ (A10s) + Accessibility + emoji/SVG Art

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Polish / Phase 4)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🔴 P0 (เกณฑ์ผ่าน/ไม่ผ่านของทั้ง prototype — เข้าเล่นได้บนเครื่องจริงไหม)
**Estimate:** M
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §18 (Accessibility), §21 (Performance), §23 · [04 SRS](../../wiki/design/04-requirements-specification.md) §23, §27
**Depends on:** [US-WORLD-01](./US-WORLD-01.md), [US-WORLD-06](./US-WORLD-06.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้สูงอายุที่ใช้มือถือราคาประหยัด
**ฉันต้องการ** ให้ prototype เข้าเล่นได้จริง ไม่ค้าง อ่านง่าย ปุ่มใหญ่
**เพื่อที่จะ** ไม่ถูกกันออกจากบทเรียนเพราะเครื่องไม่ไหวหรือตัวหนังสือเล็กเกินไป

> อ้างตรงกับบทเรียน field feedback [MCI US-E9-07](/mnt/Storage-NVME1/PhaserProject/mci-attention-game-sorting-line/docs/agile/user-stories/US-E9-07.md) — เครื่องอ้างอิงขั้นต่ำ **Samsung Galaxy A10s** (Helio P22, RAM 2–3GB, PowerVR GE8320, Android 9–11)

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้ — Performance (A10s):**
- FPS cap (30) ยืนยันทำงาน, จำกัด/ปิดเอฟเฟคหนักบน low-end, ลด concurrent animation
- unload มินิเกม + คืน memory เมื่อปิด (ต่อจาก US-WORLD-06), ไม่โหลด 10 เกมพร้อมกัน
- ไม่ให้ React re-render ตามตำแหน่งผู้เล่นทุก frame (§27 SRS)
- (พิจารณา) low-performance mode / auto-detect ลด effect

**ทำในรอบนี้ — Accessibility (§18, §23):**
- ตัวอักษรใหญ่ (≥20px)/ปุ่ม (≥22px)/touch target ≥48px + ระยะห่างปุ่ม
- ข้อความ + สี + ไอคอน ร่วมกัน (ไม่พึ่งสีอย่างเดียว), high-contrast ได้, reduced motion
- ปุ่มยืนยันก่อนออกมินิเกม, ปุ่มเล่นใหม่/ขอคำใบ้, ปุ่ม back/close ชัดเจน, วางปุ่มสม่ำเสมอ
- ไม่มีมินิเกมบังคับความเร็วสูงโดยไม่มีโหมดผ่อนคลาย (G7/G8 มี reduced-motion อยู่แล้ว)

**ทำในรอบนี้ — Art:**
- ใช้ **emoji + inline SVG** เป็น tile/ตัวละคร/NPC/วัตถุ (ไม่รอ asset จริง)

**ยังไม่ทำในรอบนี้:**
- Asset ภาพจริง/tilemap ศิลป์, portrait ตัวละครวาดจริง, เสียงพากย์ (§21/§22 GDD — polish รอบหลัง)

## Acceptance Criteria (Prototype)

- [ ] **เข้าและเล่น prototype ได้บน Galaxy A10s (หรือ emulator เทียบเท่า) โดยไม่ crash/hang** — AC ชี้ขาด
- [ ] FPS ยอมรับได้ (ไม่กระตุกจนเล่นไม่ได้), เอฟเฟคหนักถูกลด/ปิดบน low-end
- [ ] เข้า-ออกมินิเกมหลายรอบแล้ว memory ไม่บวมจนค้าง
- [ ] ตัวอักษร ≥20px, ปุ่ม/touch target ตามเกณฑ์ a11y, ใช้ icon+สี+ข้อความ
- [ ] มี reduced-motion, ปุ่ม back/close/เล่นใหม่/คำใบ้ครบและสม่ำเสมอ
- [ ] ใช้ emoji/SVG แทน asset จริงได้ครบทุกจุดที่ต้องมีภาพ
- [ ] มี **checklist ทดสอบ low-end** บันทึกผลใน sprint QA ก่อนถือว่าผ่าน

## Technical Tasks

- [ ] performance tier helper (device memory / FPS heuristic) + low-end profile
- [ ] audit render loop: ไม่ setState per frame, cap FPS, ลด tween/particle
- [ ] audit a11y ผ่าน checklist [03 Art Direction](../../gdd/03-art-direction.md) + skill `zero-scroll-ui`
- [ ] tile/character/NPC เป็น emoji/SVG
- [ ] ทดสอบบน A10s/emulator + บันทึกผล (device, FPS, memory, เข้าเล่นได้ไหม)

## Related Documents
- Prototype GDD: [05 §18 Accessibility, §21 Performance, §23 Performance Target](../../wiki/design/05-mini-prototype-gdd.docx.md)
- SRS: [04 §23 Accessibility, §27 Performance](../../wiki/design/04-requirements-specification.md)
- Field feedback: [MCI US-E9-07](/mnt/Storage-NVME1/PhaserProject/mci-attention-game-sorting-line/docs/agile/user-stories/US-E9-07.md)
