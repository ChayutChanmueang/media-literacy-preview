# User Story: US-GAME-12 - อย่ากดลิงก์จี้ ถ้าไม่รีบหยุดกด (G12 Match-Ring / Don't Click the Phish) — Prototype

**Status:** 🔨 Prototype — โค้ดเสร็จ, unit test logic ผ่าน 5/5, เล่นได้ใน Dev Game Hub, **รอ QA playtest คลิกจริงในเบราว์เซอร์** (ยังไม่ mark AC เป็น done ตามกติกา AGENT ข้อ 1)
**Sprint:** ยังไม่จัดเข้า Sprint (Draft/Proposal) — พัฒนา prototype ล่วงหน้าเพื่อทดสอบกลไก
**Priority:** เสนอเป็น Should — Topic 2: Scams (Malicious Links)
**Estimate:** L
**Design Doc:** [design-g12.md](../../gdd/design-g12.md) (v2.3 — มี §13 Match-Ring Logic Spec แบบ clean-room)
**Last Updated:** 2026-07-22 — ปรับ flow: ตัดปุ่ม "ถัดไป" → auto-advance, เพิ่มรอบ 8 → 10; **fix นิ้วไม่เลื่อนเอง** (rAF ผูก StrictMode) — verify ด้วย Playwright แล้ว

---

## Story

**ในฐานะ** ผู้สูงอายุที่อาจเผลอกดลิงก์แปลกปลอมในคอมเมนต์โซเชียล
**ฉันต้องการ** ฝึก"หยุดก่อนกด" โดยเรียงก้อนทำลายลิงก์จี้ให้ทันก่อนนิ้วจะกด
**เพื่อที่จะ** จดจำจุดสังเกตโดเมนอันตราย และไม่กดลิงก์หลอกลวงในชีวิตจริง

## ขอบเขตของรอบนี้ (Prototype Scope)

รอบนี้ทำเป็น **prototype เพื่อทดสอบว่ากลไก "เรียงก้อน match-ring ทำลายลิงก์จี้ก่อนนิ้วเลื่อนซ้าย→ขวามากด" ดึงความสนใจและสอนเรื่องลิงก์ได้จริงกับผู้สูงอายุไหม** ยังไม่ใช่เวอร์ชันส่งมอบ:

**ทำในรอบนี้ (โค้ด):**
- ชั้น logic **clean-room** ตาม [design-g12.md §13](../../gdd/design-g12.md): `src/lib/match-ring/` — `RingGrid`, `shiftRow`/`shiftColumn` (หมุนแถว/คอลัมน์แบบวงแหวน), `findColorClusters` (กลุ่มสีติดกัน 4 ทิศ ≥ N), `seedBoard`, `resolveAfterCommit` (เคลียร์+ตก+เติม+cascade) — **ไม่ copy โค้ด/ชื่อจาก classic-chuzzle** (repo ไม่มี LICENSE)
- `src/components/G12ChuzzleStop.tsx`: คอมเมนต์ย่อ (แนว G9 ตัดทอน) + นิ้วเลื่อน**ซ้าย→ขวา** + ปุ่มลิงก์ไฮไลต์/stroke ตาม progress + กระดาน 5×5 ลากแถว/คอลัมน์ + **แฟลชผลรอบสั้น auto-advance (ไม่มีปุ่ม "ถัดไป")** + เซสชัน **10 รอบ** (คลัง 8 ชิ้น วนสับซ้ำให้ครบ 10)
- `src/data/g12-chuzzle-items.json` (คลังลิงก์จี้ มี owner_domain/red_flags/min_group_size/finger_slide_ms/explain/hotline)
- **unit test** `src/tests/unit/match-ring.test.ts` (shift/cluster/seed) — ผ่าน
- ลงทะเบียนใน [Dev Game Hub](./US-03-R4.md) (`/dev/games`) — badge "🔨 Prototype"

**ยังไม่ทำในรอบนี้:**
- คลังลิงก์จี้ฉบับสมบูรณ์ที่ทีมวิชาการ NAPLAB ตรวจ (design เสนอ 12–16 ข้อ)
- ผูกเข้า flow ผู้เรียนใน `/lessons/[id]/game` และบันทึกดาวลงระบบ
- ตอบ Open Questions ใน design §12: ขนาดกระดาน 4×4 vs 5×5, `finger_slide_ms` เริ่มต้น, จบด้วยจำนวนรอบ vs นาฬิกาเซสชัน, ความแรงไฮไลต์ปุ่ม, นโยบาย cascade
- จูนความเร็วนิ้ว/ความยากกับผู้สูงอายุจริง

## Acceptance Criteria (Prototype) — โค้ดครอบคลุมแล้ว รอ playtest ยืนยัน

> ยังไม่ติ๊ก `[x]` เพราะยังไม่ได้เล่นคลิกจริงในเบราว์เซอร์ (component โหลดแบบ dynamic `ssr:false`)

- [ ] กระดาน 5×5 ลากทั้งแถวหรือทั้งคอลัมน์แบบวงแหวน (ไม่ใช่สลับ 2 ช่อง) — ระหว่างลากไฮไลต์กลุ่มที่จะเคลียร์
- [ ] ปล่อยเมื่อไม่มีกลุ่ม ≥ `min_group_size` = กระดานเด้งกลับ ไม่เคลียร์ นิ้วยังเลื่อนต่อ
- [ ] เรียงกลุ่มสีเดียวกันครบ ≥ N **ก่อนนิ้วถึงปุ่ม** = ทำลายการ์ดโดเมนลิงก์จี้ + นิ้วหยุด + ได้คะแนน
- [ ] นิ้วเลื่อนซ้าย→ขวา เข้าหาปุ่ม "กดเปิดลิงก์" + ปุ่มค่อยๆ stroke/glow สว่างขึ้นตาม progress (ไม่พึ่งสีเดี่ยว — มีไอคอน 🔗)
- [ ] **นิ้วไม่ใช่ปุ่มแตะ** — แตะมือแล้วไม่มีผล (ต่างจาก G11) หยุดได้ด้วยการเรียงเท่านั้น
- [ ] นิ้วถึงปุ่มก่อนเรียงครบ = แฟลชข้อความ **"คุณกดลิงก์อันตรายไปแล้ว"** สั้นๆ **ไม่หักคะแนน** แล้ว auto ไปรอบถัดไป
- [ ] **ไม่มีปุ่ม "ถัดไป" / ไม่มี flow แบบบทเรียน** — จบรอบ (ทัน/ไม่ทัน) แล้วเกมเดินต่อเอง (destroy ~0.95s / miss ~1.6s); ทันแล้วสุ่มลิงก์ใหม่ต่อทันที
- [ ] ไม่มีจอแพ้ ไม่มีจับเวลากดดันต่อรอบ จบเซสชัน **10 รอบ** = ผ่านเสมอ
- [ ] จบเกมส่งดาวผ่าน `onFinish(stars)` จากสัดส่วนรอบที่ทำลายทัน (≥80% = 3, ≥50% = 2, ต่ำกว่า = 1) — หน้าสรุปไม่โชว์จำนวนพลาด

## Technical Tasks

- [x] สร้างชั้น logic `src/lib/match-ring/` (types, board-state, cluster-find, seed-board, index) แบบ clean-room ตาม §13
- [x] สร้าง `src/data/g12-chuzzle-items.json` (ลิงก์จี้ + fields ครบตาม design §6)
- [x] สร้าง `src/components/G12ChuzzleStop.tsx` (axis-drag, นิ้วขนานด้วย `requestAnimationFrame`, race นิ้ว vs เรียง, แผงเฉลย inline, การนับดาว)
- [x] เขียน unit test `src/tests/unit/match-ring.test.ts` — `npm test` ผ่าน 5/5 (shiftRow/shiftColumn/findColorClusters/seedBoard/previewShift)
- [x] ลงทะเบียนใน Dev Game Hub (`src/app/dev/games/page.tsx`) status `prototype`
- [x] ยิง event ตาม design §11: `game_start`, `round_start`, `link_destroyed`, `finger_press`, `feedback_view`, `round_next`, `game_complete`
- [x] **fix บั๊กนิ้วไม่เลื่อนเอง** — ย้ายการขับเคลื่อนนิ้วมาเป็น rAF `useEffect` ตัวเดียว keyed `[phase, roundIndex]` (ทน StrictMode) แทน `startFinger`/`stopFinger` แบบจัดการ rAF เอง — verify ด้วย Playwright: นิ้วเลื่อน 46px ใน 3s โดยไม่แตะจอ
- [x] **fix "เรียง 3 แล้วบางรอบไม่ติด"** — ตั้ง `min_group_size = 3` ทุกรอบ (เดิม 2 รอบเป็น 4 → seed ปล่อยกลุ่ม 3 ค้าง ดูเหมือนติดแต่ต้องการ 4) + ทำ hint กติการอบให้ชัดขึ้น (18px ตัวหนา); logic cluster ถูกต้องอยู่แล้ว, match-ring test 5/5 ผ่าน
- [ ] **playtest คลิกเล่นจริง** ครบ **10 รอบ** (ลากเรียง, ทำลายทัน/ไม่ทัน, **auto-advance ไม่มีปุ่ม**, จังหวะแฟลช destroy ~0.95s/miss ~1.6s อ่านทัน, ดาวถูกต้อง, เสียงอ่าน) — งาน QA รอบถัดไป
- [ ] ตรวจ accessibility ตาม [Art Direction](../../gdd/03-art-direction.md): ฟอนต์เนื้อหา ≥ 20px (บางจุดใน prototype ยัง 16–18px), touch target ≥ 48px

## Related Documents

- Design: [G12 Detailed Design](../../gdd/design-g12.md) — โดยเฉพาะ §13 Match-Ring Logic Spec (clean-room)
- Mechanics: [Core Mechanics](../../gdd/01-mechanics.md)
- พี่น้องเนื้อหาลิงก์ (UI เต็ม): [US-GAME-09](./US-GAME-09.md) / [G9 Design](../../gdd/design-g9.md)
- พี่น้องแอคชั่นหยุดนิ้ว (แตะมือ — คนละอินพุต): [US-GAME-11](./US-GAME-11.md) / [G11 Design](../../gdd/design-g11.md)
- อ้างอิงกลไกภายนอก (ศึกษาเท่านั้น ห้าม copy, ไม่มี LICENSE): [classic-chuzzle](https://github.com/TradeIdeasPhilip/classic-chuzzle)
- ทดสอบผ่าน: [US-03-R4 Dev Game Hub](./US-03-R4.md)
