# User Story: US-WORLD-08 - Save/Resume + จุดพัก "เล่นต่อ / พักก่อน"

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Systems / Phase 2 + Polish P4)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🟡 P2
**Estimate:** M
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §17.4, §23, §25(AC) · [04 SRS](../../wiki/design/04-requirements-specification.md) §25, §28
**Depends on:** [US-WORLD-05](./US-WORLD-05.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** พักสายตาเป็นช่วง ๆ แล้วกลับมาเล่นต่อจากเดิมได้ ไม่ต้องเล่นรวดเดียวจบ
**เพื่อที่จะ** ไม่ล้า และไม่เสียความก้าวหน้าเมื่อปิดแอปหรือรีเฟรช

> แก้ความเสี่ยง "prototype ยาวเกินไป" (10 มินิเกม 45–60 นาที) ที่ GDD §25/P5 flag ไว้เอง

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้:**
- **Autosave** ตาม §25 SRS: เมื่อเริ่ม/จบภารกิจ, จบมินิเกม, เข้าสถานที่ใหม่, state สำคัญเปลี่ยน, ออกจากหน้า
- Save data พอกลับมา restore ได้: ตำแหน่งผู้เล่น, วัน, สถานะภารกิจ/เหตุการณ์, ผลมินิเกม, 3 ค่าสถานะ, settings
- **จุดพัก "เล่นต่อ / พักก่อน พักสายตา 👀"** ท้ายแต่ละวัน (ต่อจากหน้าสรุปประจำวัน §17.4) — เลือกพักแล้วกลับมาเริ่มวันถัดไปได้
- Local save ก่อน (IndexedDB/localStorage), กันเรคคอร์ดซ้ำ/ขัดกัน (§25 SRS)
- resume: รีเฟรช/เปิดใหม่ → เล่นต่อจากจุดเดิม

**ยังไม่ทำในรอบนี้:**
- Server save (Supabase) สำหรับผู้ใช้ล็อกอิน (§25 บอก "ควรมีทั้ง local + server" — prototype ทำ local ก่อน)
- Queue-to-sync ขั้นสูง (มี US-CORE-05 ดูแลฝั่งระบบหลักอยู่แล้ว)

## Acceptance Criteria (Prototype)

- [ ] Autosave ทำงานครบตาม trigger §25 (เริ่ม/จบภารกิจ, จบมินิเกม, เข้าสถานที่, ออกหน้า)
- [ ] รีเฟรช/ปิด-เปิดใหม่ → กลับมาเล่นต่อจากตำแหน่ง+ความคืบหน้าเดิม
- [ ] ท้ายแต่ละวันมีหน้า "เล่นต่อ / พักก่อน" — เลือกพักแล้วออกได้อย่างปลอดภัย (save แล้ว)
- [ ] กลับเข้ามาหลังพัก → เริ่มวันถัดไปถูกต้อง
- [ ] ไม่เกิดเรคคอร์ด save ซ้ำ/ขัดกัน

## Technical Tasks

- [ ] `src/lib/world/save.ts` (schema save + read/write IndexedDB/localStorage + guard ซ้ำ)
- [ ] hook autosave ผูกกับ event bus (`quest-updated`, `minigame-completed`, `day-completed`, `save-requested`, pagehide)
- [ ] `src/components/world/BreakPointScreen.tsx` ("เล่นต่อ / พักก่อน 👀")
- [ ] ตรวจ `tsc`/`eslint` + playtest: เล่นครึ่งทาง → รีเฟรช → ต่อได้; พักท้ายวัน → กลับมาต่อได้

## Related Documents
- Prototype GDD: [05 §25 Acceptance Criteria, §17.4 Daily Summary](../../wiki/design/05-mini-prototype-gdd.docx.md)
- SRS: [04 §25 Save/Resume, §28 Network](../../wiki/design/04-requirements-specification.md)
- เกี่ยวข้อง: [US-CORE-05](../01-product-backlog.md#nice-to-have) (queue-to-sync ฝั่งระบบหลัก)
