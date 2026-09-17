# User Story: US-WORLD-01 - Canvas 2D World Engine + เดิน 4 ทิศ + แผนที่เล็ก

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Foundation / Phase 1)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🔴 P0 (foundation — story อื่นใน Sprint 07 พึ่งอันนี้)
**Estimate:** L
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §9, §19.2 · [04 SRS](../../wiki/design/04-requirements-specification.md) §6.2, §9, §10
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้สูงอายุที่เล่นบนมือถือราคาประหยัด
**ฉันต้องการ** เดินตัวละครสำรวจหมู่บ้านเล็ก ๆ ได้ลื่น ไม่กระตุก ไม่ค้าง
**เพื่อที่จะ** รู้สึกว่ากำลัง "ใช้ชีวิตในชุมชน" ไม่ใช่กดทำแบบทดสอบทีละข้อ

## 🧭 Decision — Canvas 2D ไม่ใช่ Phaser

ใช้ **HTML Canvas 2D API** (ไม่ใช้ Phaser/WebGL) เพราะ field feedback [MCI US-E9-07](/mnt/Storage-NVME1/PhaserProject/mci-attention-game-sorting-line/docs/agile/user-stories/US-E9-07.md) พบว่า Phaser เข้าเล่นไม่ได้บน Galaxy A10s โลกนี้เป็น "ทางเดินเชื่อม" มินิเกม ไม่ต้องการ engine เกมเต็มตัว Canvas 2D เบากว่า, ไม่มี bundle ใหญ่, cap FPS ง่าย, รองรับ `drawImage` (รูปภาพ) + เอฟเฟคเบา ๆ ได้ครบ

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้:**
- Canvas mount ใน Next.js client component (`ssr:false`), rAF loop เดียว, **FPS cap 30**, cleanup ครบตอน unmount (ไม่มี loop/listener ซ้ำ)
- Tilemap เล็ก **1 แผนที่** ตาม §9 (บ้านผู้เล่น · ร้านค้าชุมชน · บ้านเพื่อนบ้าน · โรงพยาบาล · ศูนย์ชุมชน + ลานกลาง)
- ตัวละครเดิน **4 ทิศ** ความเร็ว "สบาย ๆ" ไม่ต้องรีแอคเร็ว (§10 SRS), collision แบบ AABB, กล้อง follow
- รองรับ `prefers-reduced-motion`, รองรับรูปภาพ sprite + emoji/SVG placeholder
- คอนโทรล: มือถือ = virtual joystick/ปุ่มทิศทางใหญ่วางล่างจอ; PC = WASD/ลูกศร; ตรวจ input method อัตโนมัติ (§11 SRS)
- Responsive: portrait mobile + landscape desktop, กล้องแสดงพื้นที่ต่างกันตาม aspect ratio, ไม่ sync ตำแหน่งเข้า React ทุก frame (§27 SRS)

**ยังไม่ทำในรอบนี้:**
- Tiled map editor / asset จริง (ใช้ tile วาดเอง + emoji/SVG)
- NPC & interaction (→ US-WORLD-02), event bus (→ US-WORLD-03)
- **Fallback DOM node-map** — เตรียมไว้เป็นทางออกถ้า playtest บน A10s ยังฝืด (SRS §10) แต่ยังไม่สร้างในรอบนี้

## Acceptance Criteria (Prototype)

> ยังไม่ติ๊ก `[x]` จนกว่าจะ playtest จริงในเบราว์เซอร์ (กติกา AGENT ข้อ 1)

- [ ] Canvas โหลดและ render แผนที่เล็ก 1 แผนที่ (5 สถานที่ + ลานกลาง)
- [ ] เดิน 4 ทิศได้ลื่นบนมือถือ ด้วย rAF loop เดียว FPS cap 30 ไม่กระตุก
- [ ] Collision กันเดินทะลุกำแพง/อาคาร, กล้อง follow ตัวละคร
- [ ] มือถือใช้ปุ่มทิศทางล่างจอ / PC ใช้ WASD+ลูกศร, สลับ input ได้โดยไม่ต้อง reload
- [ ] เล่นได้ทั้ง portrait (มือถือ) และ landscape (PC) โดยข้อความ/ปุ่มยังอ่านออก
- [ ] เคารพ `prefers-reduced-motion` (ลดการสั่น/เอฟเฟคกล้อง)
- [ ] ออกจากหน้า/unmount แล้วไม่มี canvas ซ้ำ, ไม่มี rAF/listener ค้าง

## Technical Tasks

- [ ] สร้าง component โลก (เช่น `src/components/world/TopDownWorld.tsx`) + hook rAF loop + cap FPS
- [ ] โครงสร้างข้อมูลแผนที่ (tile grid + collision layer) เป็น JSON ใน `src/data/world/`
- [ ] ระบบเดิน 4 ทิศ + AABB collision + camera follow
- [ ] คอนโทรล mobile (touch joystick/ปุ่ม) + desktop (keyboard) + auto-detect
- [ ] ยิง event `world-ready` (เตรียม hook สำหรับ US-WORLD-03)
- [ ] ตรวจ `npx tsc --noEmit` + `eslint` ผ่าน, ลงทะเบียนทดลองใน Dev Game Hub / route ทดสอบ

## Related Documents
- Prototype GDD: [05 §9 World Map, §19 Technical](../../wiki/design/05-mini-prototype-gdd.docx.md)
- Decision: [MCI US-E9-07 — Phaser low-end failure](/mnt/Storage-NVME1/PhaserProject/mci-attention-game-sorting-line/docs/agile/user-stories/US-E9-07.md)
- ตามด้วย: [US-WORLD-02](./US-WORLD-02.md), [US-WORLD-03](./US-WORLD-03.md)
