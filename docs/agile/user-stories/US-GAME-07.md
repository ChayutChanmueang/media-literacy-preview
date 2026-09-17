# User Story: US-GAME-07 - เกมวิ่งหลบภัยไซเบอร์ (G7 Cyber Runner) — Prototype

**Status:** 🔨 Prototype — โค้ดเสร็จ ผ่าน tsc/lint + route 200, **รอ QA playtest คลิกจริงในเบราว์เซอร์** (ยังไม่ mark AC เป็น done ตามกติกา AGENT ข้อ 1)
**Sprint:** ยังไม่จัดเข้า Sprint (Draft/Proposal) — พัฒนา prototype ล่วงหน้าเพื่อทดสอบกลไก
**Priority:** Should — ชุดที่ 2: ทัศนคติ (Motivation & Empowerment)
**Estimate:** M
**Design Doc:** [design-g7.md](../../gdd/design-g7.md)
**Owner:** TBD
**Version:** 2.0 | **Last Updated:** 2026-07-21

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** เล่นเกมวิ่งหลบภัยไซเบอร์ (G7) ที่ควบคุมการเล่นเพียงแอคชั่นเดียว (แตะเพื่อกระโดด)
**เพื่อให้** ได้เรียนรู้หลักการหลบเลี่ยงไม่เข้าไปปฏิสัมพันธ์กับภัยสแกมและสิ่งเร้าแปลกปลอมในโลกออนไลน์ ด้วยรูปแบบเกมที่เข้าถึงง่ายและสนุกสนาน

---

## ขอบเขตของรอบนี้ (Prototype Scope)

รอบนี้ทำเป็น **prototype เพื่อทดสอบว่ากลไก "วิ่งอัตโนมัติ + แตะกระโดดหลบภัย" ใช้ได้จริงกับผู้สูงอายุไหม** ยังไม่ใช่เวอร์ชันส่งมอบ:

**ทำในรอบนี้ (โค้ด):**
- กลไกครบตาม [design-g7.md](../../gdd/design-g7.md): auto-runner ตัวละครอยู่ซ้าย, ภัยเลื่อนเข้ามาจากขวาทีละ 1 อัน ความเร็วช้าคงที่ (ไม่เร่ง), แตะที่ใดก็ได้ = กระโดด, ข้ามสำเร็จ = +แต้มความมั่นใจ, ชน = หยุดฉาก + การ์ดสอนวิธีรับมือแล้ววิ่งต่อ (ไม่มีจอแพ้)
- `src/components/G7CyberRunner.tsx` (movement ด้วย `requestAnimationFrame` ตามบทเรียน G5 เลี่ยง `setInterval`) + คลังภัย `src/data/g7-hazards.json` (ภัย 8 อัน)
- รองรับ `prefers-reduced-motion` (ลดระยะกระโดด ไม่มี screen shake)
- ลงทะเบียนใน [Dev Game Hub](./US-03-R4.md) (`/dev/games`) — badge "🔨 Prototype"

**ยังไม่ทำในรอบนี้:**
- กราฟิกตัวละคร/ภัยจริง (ใช้ emoji เป็นตัวแทนชั่วคราว)
- คลังภัยฉบับสมบูรณ์ที่ทีมวิชาการ NAPLAB ตรวจ
- ผูกเข้า flow ผู้เรียนใน `/lessons/[id]/game` และบันทึกดาวลงระบบ
- จูนความเร็ว/ความกว้างหน้าต่างกระโดดกับผู้สูงอายุจริง (Open Question ใน design §11)

---

## ✅ Acceptance Criteria (Prototype) — โค้ดครอบคลุมแล้ว รอ playtest ยืนยัน

> ยังไม่ติ๊ก `[x]` เพราะยังไม่ได้เล่นคลิกจริงในเบราว์เซอร์ (component โหลดแบบ dynamic `ssr:false`)

1. [ ] มีกลไกการเล่นแบบวิ่งด้านข้างอัตโนมัติ (Side-Scroller Auto-Runner) ควบคุมง่ายๆ โดยการแตะตรงไหนของจอภาพก็ได้ (Tap to Jump) เพื่อสั่งให้ตัวละครกระโดดข้ามอุปสรรค
2. [ ] มีอุปสรรคสิ่งกีดขวางจำลองแทนภัยออนไลน์ (เบอร์แปลกโทรเข้า, SMS แนบลิงก์, โฆษณารวยเร็ว ฯลฯ) วิ่งสวนเข้ามาเป็นระยะ ทีละ 1 อัน
3. [ ] เมื่อกระโดดข้ามสิ่งกีดขวางได้สำเร็จ ระบบจะแสดงเสียง/ฟีดแบ็กเชิงบวก พร้อมเก็บแต้มความมั่นใจเพิ่มขึ้นเรื่อยๆ
4. [ ] หากกระโดดพลาดจนชนสิ่งกีดขวาง ตัวละครจะไม่ล้มเจ็บ แต่เกมจะหยุดฉากและแสดงกล่องข้อความเตือนภัย + วิธีรับมือนั้นๆ ทันที
5. [ ] ไม่มีหน้าจอ Game Over ที่ทำโทษหรือตัดสินแพ้ — ชนได้ไม่จำกัดครั้ง เน้นให้กระทำซ้ำและเรียนรู้เพื่อสร้างความมั่นใจ
6. [ ] จบเกมส่งดาวผ่าน `onFinish(stars)` จากสัดส่วนการกระโดดข้ามสำเร็จครั้งแรก (≥80% = 3, ≥50% = 2, ต่ำกว่า = 1)

---

## 🛠 Technical Tasks (Game G7 Development)
- [x] สร้าง `src/data/g7-hazards.json` (ภัย 8 อัน มี icon/label/category/advice/ai_disclosure)
- [x] สร้าง `src/components/G7CyberRunner.tsx` (auto-runner ด้วย `requestAnimationFrame`, jump physics, freeze-on-hit + การ์ดสอนใจ, การนับดาว, รองรับ `prefers-reduced-motion`)
- [x] ลงทะเบียนใน Dev Game Hub (`src/app/dev/games/page.tsx`) status `prototype`
- [x] ยิง event ตาม design §10: `game_start`, `jump`, `hazard_clear`, `hazard_hit`, `game_complete`
- [x] ตรวจ `npx tsc --noEmit` + `eslint` ผ่าน, route `/dev/games` ตอบ HTTP 200 มีการ์ด G7
- [ ] **playtest คลิกเล่นจริง** ครบทั้ง 8 ภัย (กระโดดข้าม/ชน, การ์ดสอนใจ, แต้มความมั่นใจ, ดาวถูกต้อง) — งาน QA รอบถัดไป
- [ ] บันทึกการกระทำแบบ Asynchronous ลง `action_logs` (เมื่อผูกเข้า flow ผู้เรียนจริง — ยังไม่ทำในรอบ prototype)

---

## 🔗 Related Documents
- Design: [G7 Detailed Design](../../gdd/design-g7.md)
- Mechanics: [Core Mechanics](../../gdd/01-mechanics.md)
- Concept & Architecture: [Concept](../../gdd/00-concept.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
- ทดสอบผ่าน: [US-03-R4 Dev Game Hub](./US-03-R4.md)
