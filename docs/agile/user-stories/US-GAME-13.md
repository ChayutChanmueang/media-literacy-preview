# User Story: US-GAME-13 - เกมต่อไอติมรู้ทันสื่อ (G13 Stack Smart Scoops) — Prototype

**Status:** 🔨 Prototype — โค้ดเสร็จ (`G13ScoopStacker.tsx` + `g13-scoop-items.json` + ลงทะเบียนใน Dev Game Hub), **รอ QA playtest คลิกจริงในเบราว์เซอร์** (ยังไม่ mark AC เป็น done ตามกติกา AGENT ข้อ 1)
**Sprint:** ผูกเป็นเกมปิดท้าย Flow ใหม่ ([US-FLOW-01](./US-FLOW-01.md)) — เป็น terminal `flow-g13` ก่อน posttest
**Priority:** Nice to Have — ชุดที่ 2: ทัศนคติ (Motivation & Empowerment Action Game)
**Estimate:** M
**Design Doc:** [design-g13.md](../../gdd/design-g13.md) — ⚠️ ยังเป็น 🏗️ Draft + มี Open Questions ค้าง (ทีมวิชาการยังไม่อนุมัติสเปกขั้นสุดท้าย)

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่เพิ่งเรียนจบเนื้อห Flow ต่อเนื่อง
**ฉันต้องการ** เล่นเกมสนุกๆ ปิดท้ายที่ลากโคนรับไอติม "ดี" หลบไอติม "ร้าย" ซ้อนหอให้สูง
**เพื่อที่จะ** ทบทวนหลักคิดรู้ทันสื่อแบบไม่กดดันและจบบทเรียนด้วยความรู้สึกดี

## ขอบเขตของรอบนี้ (Prototype Scope)

รอบนี้ทำเป็น **prototype เพื่อทดสอบว่ากลไก Catch & Stack + wobble สนุกและเล่นเข้าใจกับผู้สูงอายุไหม** ยังไม่ใช่เวอร์ชันส่งมอบ:

**ทำในรอบนี้ (โค้ด):**
- กลไกครบตาม [design-g13.md](../../gdd/design-g13.md): ลากโคนซ้าย-ขวารับสกู๊ป "ดี" (เช่น "เช็กก่อนแชร์", ".go.th") หลบสกู๊ป "ร้าย" (เช่น "กดรับเงินด่วน!", "bit.ly/xxx"); หอไอติมสูงขึ้น + ระบบ wobble; เผลอรับร้าย = สั่นแต่ไม่ล้ม; **ไม่มี Game Over / ไม่หักดาว**
- `src/components/G13ScoopStacker.tsx` + คลังสกู๊ป `src/data/g13-scoop-items.json`
- ลงทะเบียนใน [Dev Game Hub](./US-03-R4.md) (`/dev/games`) — badge "🔨 Prototype"
- ผูกเป็น terminal `flow-g13` ใน Flow ใหม่ ([US-FLOW-01](./US-FLOW-01.md))

**ยังไม่ทำในรอบนี้:**
- กราฟิกไอติม/พื้นหลังจริง (ใช้ emoji/SVG/CSS ชั่วคราว)
- คลังสกู๊ปฉบับสมบูรณ์ที่ทีมวิชาการ NAPLAB ตรวจ
- คำตอบ Open Questions 7 ข้อใน [design-g13.md](../../gdd/design-g13.md)
- จูนฟิสิกส์ wobble / ความเร็วสกู๊ปตก กับผู้สูงอายุจริง

## ✅ Acceptance Criteria (Prototype) — โค้ดครอบคลุมแล้ว รอ playtest ยืนยัน

> ยังไม่ติ๊ก `[x]` เพราะยังไม่ได้เล่นคลิกจริงในเบราว์เซอร์ (component โหลดแบบ dynamic `ssr:false`)

1. [ ] ลากโคนไอติมซ้าย-ขวาด้วยนิ้วเป็น input เดียว ไม่มีปุ่มซับซ้อน
2. [ ] รับสกู๊ป "ดี" = หอสูงขึ้น + ข้อความชม; หลบสกู๊ป "ร้าย" = ✓ แสดงจุดสังเกต; เผลอรับ "ร้าย" = หอสั่น wobble + คำเตือน (ไม่ล้ม)
3. [ ] ไม่มีหน้าจอ Game Over — หอสั่นแต่ไม่ล้ม จบเซสชัน = ผ่านเสมอ (ตาม policy โครงการ)
4. [ ] ทุกสกู๊ปมีข้อความสั้นสื่อหลักคิดรู้ทันสื่อ กำกับด้วย ✓/✗ คู่สีเสมอ
5. [ ] จบเกมส่งผลผ่าน `onFinish(...)`; ในบริบท Flow เป็นเกมปิดท้าย **ไม่ให้ดาว/ไม่มีจอแพ้** ([US-FLOW-01](./US-FLOW-01.md))
6. [ ] ยิง event ตาม design doc: `game_start`, `round_start`, `scoop_catch`, `scoop_dodge`, `feedback_view`, `game_complete`

## 🛠 Technical Tasks

- [x] สร้าง `src/data/g13-scoop-items.json`
- [x] สร้าง `src/components/G13ScoopStacker.tsx` รับ props `onFinish` + `logEvent`
- [x] ลงทะเบียนใน Dev Game Hub (`src/app/dev/games/DevGameHubClient.tsx`) status `prototype` + `designDoc`
- [x] ผูก terminal `flow-g13` ใน Flow ใหม่ ([US-FLOW-01](./US-FLOW-01.md), `src/lib/flow.ts`)
- [ ] **playtest คลิกเล่นจริง** — งาน QA รอบถัดไป
- [ ] ตอบ Open Questions 7 ข้อใน design doc + ยืนยันสเปกกับทีมวิชาการ

## 🔗 Related Documents

- Design: [G13 Detailed Design](../../gdd/design-g13.md)
- Mechanics: [Core Mechanics](../../gdd/01-mechanics.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
- ทดสอบผ่าน: [US-03-R4 Dev Game Hub](./US-03-R4.md)
