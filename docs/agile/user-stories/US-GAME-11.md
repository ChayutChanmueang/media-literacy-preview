# User Story: US-GAME-11 - เกมหยุดนิ้ว! คิดก่อนกด (G11 Stop the Finger) — Prototype

**Status:** 🔨 Prototype — โค้ดเสร็จ (`G11StopTheFinger.tsx` + `g11-finger-items.json` + ลงทะเบียนใน Dev Game Hub), **รอ QA playtest คลิกจริงในเบราว์เซอร์** (ยังไม่ mark AC เป็น done ตามกติกา AGENT ข้อ 1)
**Sprint:** ยังไม่จัดเข้า Sprint (Prototype ล่วงหน้าเพื่อทดสอบกลไก)
**Priority:** Should — ชุดที่ 2: ทัศนคติ (Motivation & Empowerment Action Game)
**Estimate:** M
**Design Doc:** [design-g11.md](../../gdd/design-g11.md) — ⚠️ ยังเป็น 🏗️ Draft (ทีมวิชาการยังไม่อนุมัติสเปกขั้นสุดท้าย)

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่มักเผลอกดปุ่มบนมือถือทันทีที่เห็นข้อความ
**ฉันต้องการ** ฝึกหลักคิด "หยุด" ผ่านเกมที่ต้องแตะมือเพื่อหยุดนิ้วก่อนกดข้อมูลหลอกลวง
**เพื่อที่จะ** ชะลอการกดและพิจารณาก่อนกดแชร์/โอนเงิน/ยอมรับ ในชีวิตจริง

## ขอบเขตของรอบนี้ (Prototype Scope)

รอบนี้ทำเป็น **prototype เพื่อทดสอบว่ากลไก "นิ้วเลื่อนเข้าหาปุ่ม + แตะมือเพื่อหยุด" เข้าใจง่ายกับผู้สูงอายุไหม** ยังไม่ใช่เวอร์ชันส่งมอบ:

**ทำในรอบนี้ (โค้ด):**
- กลไกครบตาม [design-g11.md](../../gdd/design-g11.md): โทรศัพท์จำลอง + ข้อมูลบนจอ + มือ/นิ้วชี้เลื่อนขึ้นช้าๆ; ข้อมูลจริง = ปล่อยให้นิ้วกด, ข้อมูลหลอก = แตะมือหยุด; การ์ดเฉลย + ดาวความมั่นใจ; ไม่มีจอแพ้/ไม่ตัดสินแพ้
- `src/components/G11StopTheFinger.tsx` + คลังโจทย์ `src/data/g11-finger-items.json`
- ลงทะเบียนใน [Dev Game Hub](./US-03-R4.md) (`/dev/games`) — badge "🔨 Prototype"

**ยังไม่ทำในรอบนี้:**
- กราฟิกมือ/โทรศัพท์จริง (ใช้ emoji/SVG ชั่วคราว)
- คลังโจทย์ฉบับสมบูรณ์ที่ทีมวิชาการ NAPLAB ตรวจ
- ผูกเข้า flow ผู้เรียนใน `/lessons/[id]/game` และบันทึกดาวลงระบบ
- จูนความเร็วการเลื่อนของนิ้ว (หน้าต่างเวลาตัดสินใจ) กับผู้สูงอายุจริง

## ✅ Acceptance Criteria (Prototype) — โค้ดครอบคลุมแล้ว รอ playtest ยืนยัน

> ยังไม่ติ๊ก `[x]` เพราะยังไม่ได้เล่นคลิกจริงในเบราว์เซอร์ (component โหลดแบบ dynamic `ssr:false`)

1. [ ] แสดงโทรศัพท์จำลอง + ข้อมูล/ข้อความ + มือพร้อมนิ้วชี้เลื่อนขึ้นเข้าหาปุ่มอย่างช้าๆ
2. [ ] ข้อมูลน่าเชื่อถือ → ปล่อยให้นิ้วกด = ✓; ข้อมูลหลอกลวง → แตะมือหยุดนิ้ว = ✓ (กำกับด้วย ✓/✗ คู่สีเสมอ)
3. [ ] มีการ์ดเฉลย + คำอธิบายจุดสังเกตทุกข้อ และเพิ่มดาวความมั่นใจเมื่อตอบถูก
4. [ ] ไม่มีหน้าจอ Game Over / ไม่มีการตัดสินแพ้ — ตอบผิด = คำแนะนำนุ่มนวลตาม policy โครงการ
5. [ ] จบเกมส่งดาวผ่าน `onFinish(stars)` จากสัดส่วนการตัดสินใจถูกครั้งแรก
6. [ ] ยิง event ตาม design doc: `game_start`, `decision`, `feedback_view`, `game_complete`

## 🛠 Technical Tasks

- [x] สร้าง `src/data/g11-finger-items.json`
- [x] สร้าง `src/components/G11StopTheFinger.tsx` รับ props `onFinish(stars)` + `logEvent`
- [x] ลงทะเบียนใน Dev Game Hub (`src/app/dev/games/DevGameHubClient.tsx`) status `prototype`
- [ ] เพิ่ม `designDoc: "docs/gdd/design-g11.md"` ในรายการ Dev Game Hub (ปัจจุบันการ์ด G11 ยังไม่ผูกลิงก์ design doc)
- [ ] **playtest คลิกเล่นจริง** ครบทุกโจทย์ — งาน QA รอบถัดไป
- [ ] บันทึกการกระทำลง `action_logs` (เมื่อผูกเข้า flow ผู้เรียนจริง)

## 🔗 Related Documents

- Design: [G11 Detailed Design](../../gdd/design-g11.md)
- Mechanics: [Core Mechanics](../../gdd/01-mechanics.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
- ทดสอบผ่าน: [US-03-R4 Dev Game Hub](./US-03-R4.md)
