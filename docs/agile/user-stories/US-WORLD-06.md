# User Story: US-WORLD-06 - เชื่อมมินิเกม G1–G10 เข้าเหตุการณ์ + Phone Overlay

**Status:** 📋 Backlog — **[Sprint 07](../sprint-backlog/sprint-07.md)** (Integrate All Minigames / Phase 3)
**Epic:** E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก"
**Priority:** 🟠 P1 (หัวใจ prototype — พิสูจน์ว่ามินิเกมมีบริบท)
**Estimate:** L
**Scope reference:** [05 GDD](../../wiki/design/05-mini-prototype-gdd.docx.md) §8, §14, §17.3, §26(P3) · [04 SRS](../../wiki/design/04-requirements-specification.md) §16
**Depends on:** [US-WORLD-05](./US-WORLD-05.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้เล่น
**ฉันต้องการ** เจอมินิเกมโผล่จากสถานการณ์จริงในเรื่อง (เพื่อนบ้านขอให้ช่วยดูมือถือ ฯลฯ)
**เพื่อที่จะ** ไม่รู้สึกว่ากำลังกดทำแบบทดสอบจากเมนู

## Mapping — มินิเกม 10 เกม ↔ เหตุการณ์ (ตาม GDD §8, §14)

| วัน | มินิเกม (GDD) | Component | สถานที่ / NPC |
|-----|---------------|-----------|----------------|
| 1 | จับสัญญาณมิจ | `G2ScamSpotter` | ร้านค้าชุมชน / ป้าสาย |
| 1 | กางโล่กู้ชีพ | `G5DigitalShield` | บ้านเพื่อนบ้าน / ลุงปัน |
| 1 | ลิงก์จี้หรือลิงก์จริง | `G9LinkInspector` | ศูนย์ข้อมูลชุมชน / เจ้าหน้าที่นที |
| 1 | จำลองแชต LINE | `G6LineSimulation` | บ้านผู้เล่น (เย็น) |
| 2 | จริงหรือมั่ว? | `G1FactCheck` | โรงพยาบาล / พยาบาลเมย์ |
| 2 | วิ่งสู้ภัยไซเบอร์ | `G7CyberRunner` | กิจกรรมสุขภาพ / พยาบาลเมย์ |
| 2 | AI หรือคน? | `G3AIOrNot` | ศูนย์ชุมชน / เจ้าหน้าที่นที |
| 2 | แชร์ดีไหม? | `G4ShareOrNot` | บ้านผู้เล่น |
| 3 | นี่แอปฉัน นั่นแอปใคร? | `G10WhoseApp` | บ้านเพื่อนบ้าน / ลุงปัน |
| 3 | กระโดดแพรู้ทันมิจ | `G8RaftCrossing` | ลานกลางหมู่บ้าน |

## ขอบเขตของรอบนี้ (Prototype Scope)

**ทำในรอบนี้:**
- **Phone overlay** (§17.3): กรอบมือถือจำลองเหนือ Canvas สำหรับ SMS/LINE/Facebook/รูป/แอป/ลิงก์ — เป็นบริบทเปิดมินิเกม
- เชื่อมทั้ง **10 เกมทีละเกม** ผ่าน adapter (US-WORLD-03): เปิดจาก incident → ส่ง payload → รับ `MinigameResult` → บทสนทนา/ผลต่อโลก
- **Lazy-load** มินิเกม (`dynamic ssr:false`) — โหลดเมื่อจำเป็น, คืนหน่วยความจำเมื่อปิด (§23 SRS, §27)
- ทดสอบต่อเกม: เปิดได้/ปิดได้/ส่งผลได้/world state ไม่หาย/ไม่มี event ซ้ำ/เล่นบนมือถือได้ (checklist §26 P3)

**ยังไม่ทำในรอบนี้:**
- แก้ gameplay ภายในมินิเกม (เกมเสร็จแล้ว — แค่ห่อ)
- คลังโจทย์ฉบับสมบูรณ์ที่ NAPLAB ตรวจ (ใช้ของ prototype เดิม)

## Acceptance Criteria (Prototype)

- [ ] Phone overlay เปิด/ปิดเหนือ Canvas ได้ ใช้เป็นบริบทเข้ามินิเกม
- [ ] เชื่อมครบ **10 เกม** จากเหตุการณ์ในโลกตามตาราง mapping (ไม่ใช่จากเมนู)
- [ ] แต่ละเกม: เปิดได้ → ปิดได้ → ส่ง `MinigameResult` กลับ → โลกกลับที่ตำแหน่งเดิม
- [ ] world state ไม่หายหลังปิดมินิเกม, ไม่มี canvas/loop/listener ซ้ำ
- [ ] มินิเกม lazy-load (ไม่โหลดทั้ง 10 พร้อมกัน), คืน memory เมื่อปิด
- [ ] เล่นได้บนมือถือแนวตั้งทุกเกม

## Technical Tasks

- [ ] `src/components/world/PhoneOverlay.tsx` (กรอบมือถือจำลอง + slot มินิเกม)
- [ ] adapter map: incidentId → dynamic import ของ Gx component + payload
- [ ] ผูก 10 เกมทีละเกม + รัน checklist §26 P3 ต่อเกม
- [ ] ตรวจ memory/instance ซ้ำ (เปิด-ปิดหลายรอบ) + `tsc`/`eslint`

## Related Documents
- Prototype GDD: [05 §14 Minigame Narrative Placement, §17.3 Phone Overlay, §26 P3](../../wiki/design/05-mini-prototype-gdd.docx.md)
- Contract: [US-WORLD-03](./US-WORLD-03.md) · มินิเกม: G1–G10 ใน `src/components/`
