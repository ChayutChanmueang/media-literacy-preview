# User Story: US-GAME-09 - เกมลิงก์จี้หรือลิงก์จริง (G9 Real or Fake Link) — Prototype

**Status:** 🔨 Prototype — โค้ดเสร็จ ผ่าน tsc/lint + route 200, **รอ QA playtest คลิกจริงในเบราว์เซอร์** (ยังไม่ mark AC เป็น done ตามกติกา AGENT ข้อ 1)
**Sprint:** ยังไม่จัดเข้า Sprint (Draft/Proposal) — พัฒนา prototype ล่วงหน้าเพื่อทดสอบกลไก
**Priority:** เสนอเป็น Should — Topic 2: Scams
**Estimate:** M
**Design Doc:** [design-g9.md](../../gdd/design-g9.md)
**Last Updated:** 2026-07-21

---

## Story

**ในฐานะ** ผู้สูงอายุที่เห็นลิงก์แปะมากับโพสต์และคอมเมนต์บนโซเชียลอยู่เป็นประจำ
**ฉันต้องการ** ฝึกแยกว่าลิงก์ไหนเป็นของหน่วยงานทางการจริง ลิงก์ไหนเป็นของปลอมอันตราย
**เพื่อที่จะ** ไม่กดลิงก์มั่วที่หลอกให้โหลดแอปดูดเงินหรือขโมยข้อมูลในชีวิตจริง

## ขอบเขตของรอบนี้ (Prototype Scope)

รอบนี้ทำเป็น **prototype เพื่อทดสอบว่ากลไก "สืบลิงก์ก่อนตัดสิน" เข้าใจง่ายและสอนได้จริงไหม** ยังไม่ใช่เวอร์ชันส่งมอบ:

**ทำในรอบนี้ (โค้ด):**
- กลไกครบวงจรตาม [design-g9.md](../../gdd/design-g9.md): 3 ด่าน (ฟีดโพสต์ → คอมเมนต์ → คอมเมนต์เนียนสุด) ด่านละ 5 ข้อ, ปุ่ม "🔍 ส่องลิงก์" เปิด URL เต็มพร้อมไฮไลต์โดเมนเจ้าของจริง, ตัดสิน ✓ ลิงก์ทางการ / ✗ ลิงก์ปลอม, การ์ดเฉลย + red flags + กฎ .go.th, การ์ดสรุปท้ายด่าน, คำนวณดาว
- `src/components/G9LinkInspector.tsx` + คลังโจทย์ `src/data/g9-link-items.json` (18 ข้อ = 6/ด่าน สุ่มเล่น 5) มี red_flags, explain, official_ref
- **จำลองโซเชียลกลางๆ ไม่ใช้โลโก้/สีแบรนด์จริง** และ**ลิงก์ทุกอันเป็น string กดไม่ออกเว็บจริง** (กันกดลิงก์อันตรายจริงโดยไม่ตั้งใจ)
- ลงทะเบียนใน [Dev Game Hub](./US-03-R4.md) (`/dev/games`) — badge "🏗️ Prototype"

**ยังไม่ทำในรอบนี้:**
- assets จริง / ภาพประกอบ (ยังใช้อีโมจิ 📢 👤 เป็นตัวแทน)
- คลังโจทย์ฉบับสมบูรณ์ที่ทีมวิชาการ NAPLAB ตรวจ (โดยเฉพาะรายชื่อโดเมนจริง `.go.th`/`.co.th` ที่ถูกต้อง)
- ผูกเข้า flow ผู้เรียนใน `/lessons/[id]/game` และบันทึกดาวลงระบบ
- ปุ่มเสียงอ่าน: มีปุ่ม TTS (`speechSynthesis` th-TH) แล้ว แต่ยังรอผลตัดสินใจ TTS vs เสียงอัดของโครงการ

## Acceptance Criteria (Prototype) — โค้ดครอบคลุมแล้ว รอ playtest ยืนยัน

> ยังไม่ติ๊ก `[x]` เพราะยังไม่ได้เล่นคลิกจริงในเบราว์เซอร์ (component โหลดแบบ dynamic `ssr:false`)

- [ ] เล่นได้ครบ 3 ด่าน ด่านละ 5 ข้อ ไล่ระดับ: ฟีดโพสต์ → ช่องคอมเมนต์ → คอมเมนต์เนียนสุด (subdomain/โดเมนไทย)
- [ ] แตะ "🔍 ส่องลิงก์" เปิด URL เต็มและไฮไลต์โดเมนเจ้าของจริง (ส่วนติดก่อน `/` แรก)
- [ ] ตัดสิน ✓ ลิงก์ทางการ / ✗ ลิงก์ปลอม พร้อมการ์ดเฉลยชี้ red flags และย้ำกฎ `.go.th` เท่านั้น
- [ ] ครอบคลุมเคสสำคัญ: ขีดกลางหลอกตา (`rd-go-th.com`), โดเมนภาษาไทย (`สรรพากร.net`), subdomain ลวง (`rd.go.th.verify-login.com`), ลิงก์ล่อจิตวิทยา ("อยู่ในคลิปนี้", "ใครส่องโปรไฟล์"), แอปกู้เงิน/พนัน
- [ ] เลเวล 3 มีเคส **URL ยาวมี path แต่เป็นของจริง** (`sabuyservice.pea.co.th/sub-menu/...` โดเมนหลัก pea.co.th) คู่กับ URL ยาวแต่ปลอม — สอนว่าความยาวไม่ใช่จุดตัดสิน ต้องดูโดเมนหลัก (`.go.th`/`.co.th`)
- [ ] layout จำลองโครง Facebook: โพสต์มี verified badge/สปอนเซอร์/การ์ดพรีวิวลิงก์, คอมเมนต์มีโพสต์ต้นเรื่อง + แถบ engagement + comment card
- [ ] มีเคส "ลิงก์ทางการจริง" (`.go.th`) ให้ตอบว่าปลอดภัย เพื่อไม่สอนให้ระแวงทุกลิงก์
- [ ] ไม่มีการจับเวลา ไม่มีจอแพ้ ใช้ ✓ ✗ กำกับคู่สีเสมอ
- [ ] จบเกมส่งดาวผ่าน `onFinish(stars)` จาก first-try accuracy (≥80% = 3, ≥50% = 2, ต่ำกว่า = 1)
- [ ] ลิงก์กดไม่ออกเว็บจริง (จำลองล้วน)

## Technical Tasks

- [x] สร้าง `src/data/g9-link-items.json` (18 ข้อ, red_flags + explain + official_ref, สมดุล safe/fake)
- [x] สร้าง `src/components/G9LinkInspector.tsx` รับ props `onFinish(stars)` + `logEvent`
- [x] ลงทะเบียนใน Dev Game Hub (`src/app/dev/games/page.tsx`) status `prototype`
- [x] ยิง event ตาม design §10: `game_start`, `link_inspect`, `judge_correct`, `judge_wrong`, `level_complete`, `game_complete`
- [x] ตรวจ `npx tsc --noEmit` + `eslint` ผ่าน, route `/dev/games` ตอบ HTTP 200 มีการ์ด G9
- [ ] **playtest คลิกเล่นจริง** ครบ 3 ด่าน (ส่องลิงก์, เฉลยถูก/ผิด, ดาวถูกต้อง, เสียงอ่าน) — งาน QA รอบถัดไป

## Related Documents

- Design: [G9 Detailed Design](../../gdd/design-g9.md)
- Mechanics: [Core Mechanics](../../gdd/01-mechanics.md)
- ทดสอบผ่าน: [US-03-R4 Dev Game Hub](./US-03-R4.md)
