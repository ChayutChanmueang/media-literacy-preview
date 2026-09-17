# User Story: US-WORLD-05 - Quest + Incident + Day Controller + หน้าสรุปประจำวัน

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Narrative / Phase 2)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🟠 P1
**Estimate:** L
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §7, §8, §15, §17.4, §20 · [04 SRS](../../wiki/design/04-requirements-specification.md) §15, §17
**Depends on:** [US-WORLD-03](./US-WORLD-03.md), [US-WORLD-04](./US-WORLD-04.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้เล่น
**ฉันต้องการ** มีภารกิจประจำวันนำทางว่าไปไหน ทำอะไร แล้วเห็นสรุปเมื่อจบวัน
**เพื่อที่จะ** เล่นเนื้อเรื่อง 3 วันได้ต่อเนื่องโดยไม่หลงทาง และเห็นสิ่งที่เรียนรู้

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้:**
- **Incident data** (§20.1): id, วัน, สถานที่, NPC, บทสนทนาเปิด, มินิเกม, payload, บทสนทนาหลังสำเร็จ/พลาด, คะแนน, ผลต่อชุมชน — เป็น JSON
- **Quest แบบเส้นตรง** (§20.3): id, ชื่อ, คำอธิบาย, วัน, ลำดับภารกิจ, จุดเริ่ม/จบ, สถานะ
- **Day controller**: คุมลูป 3 วันตาม §8 (เปิดวัน → รับภารกิจ → เดิน → เหตุการณ์ → มินิเกม → คะแนน → กลับบ้าน → สรุปวัน → วันใหม่)
- **หน้าสรุปประจำวัน** (§17.4): สถานที่ที่ไป, คนที่ช่วย, มินิเกมที่เล่น, คะแนนแต่ละเกม, สิ่งที่ทำได้ดี/ควรระวัง, คะแนนรวมวัน
- **พลังงาน 5 หน่วย/วัน** (§12.1) — เชิงโครงสร้างวัน ไม่บังคับเข้ม, ทำภารกิจหลักครบวันจบอัตโนมัติ, ไม่ให้พลังงานหมดก่อนจบเนื้อเรื่อง

**ยังไม่ทำในรอบนี้:**
- ภารกิจเสริม/สุ่ม, เส้นเรื่องแตกแขนง (นอก scope §6.2)
- ตอนจบ/ค่าความปลอดภัยชุมชนแบบเต็ม (→ US-WORLD-07)
- เชื่อมมินิเกมจริงครบ 10 (→ US-WORLD-06 — รอบนี้ใช้ mock 1–2 เกมพิสูจน์ลูป)

## Acceptance Criteria (Prototype)

- [ ] Incident/Quest มาจาก JSON ตาม schema §20 (แก้เนื้อหาได้โดยไม่แตะ logic)
- [ ] Day controller เดินลูปครบตาม §8 สำหรับอย่างน้อย 1 วันเต็ม (mock มินิเกม)
- [ ] ภารกิจแสดงบน HUD (§17.1): วัน, ภารกิจปัจจุบัน, พลังงาน
- [ ] `incident-started` → เปิดมินิเกม (ผ่าน US-WORLD-03) → รับ result → เดินเรื่องต่อ (บทสนทนาหลังสำเร็จ/พลาด)
- [ ] หน้าสรุปประจำวันแสดงครบตาม §17.4
- [ ] ทำภารกิจหลักครบ → วันจบ → เข้าสู่วันถัดไป, พลังงานไม่หมดก่อนจบเนื้อเรื่อง

## Technical Tasks

- [ ] schema + data: `src/data/world/incidents/*.json`, `src/data/world/quests/*.json`
- [ ] `src/lib/world/day-controller.ts` (state machine ต่อวัน) + HUD component
- [ ] `src/components/world/DailySummary.tsx` (§17.4)
- [ ] เชื่อม event: `incident-started` ↔ `minigame-*` ↔ `quest-updated` ↔ `day-completed`
- [ ] ตรวจ `tsc`/`eslint` + playtest เดิน 1 วันเต็มด้วย mock minigame

## Related Documents
- Prototype GDD: [05 §8 Core Loop, §15 Day Flow, §20 Content Data](../../wiki/design/05-mini-prototype-gdd.docx.md)
- SRS: [04 §15 Incident, §17 Mission/Quest](../../wiki/design/04-requirements-specification.md)
- ตามด้วย: [US-WORLD-06](./US-WORLD-06.md), [US-WORLD-07](./US-WORLD-07.md)
