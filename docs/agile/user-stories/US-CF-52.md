# User Story: US-CF-52 - เปิดกระดานคะแนนจากเมนู (Browse Leaderboard จาก Menu Drawer)

**Status:** 🟡 In Progress — เอกสารออกแบบพร้อม เริ่ม implementation
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-18
**Owner:** TBD | **Priority:** Should Have | **Estimate:** M
**Version:** 1.2 | **Last Updated:** 2026-08-18

เกี่ยวข้องกับ [US-CF-50](./US-CF-50.md) (ระบบ Leaderboard แยกตามเกม)

---

## 1. User Story

**ในฐานะ** ผู้เล่น / ผู้ร่วมงาน event
**ฉันต้องการ** เปิดดูกระดานคะแนนของเกมที่เก็บคะแนนได้จากเมนูหลัก โดยไม่ต้องเล่นเกมนั้นให้จบก่อน
**เพื่อที่จะ** ดูอันดับคะแนนได้ตลอดเวลา โดยเฉพาะเวลาออกบูธ/จัด event

---

## 2. บริบท / ปัญหา

ปัจจุบันหน้ากระดานคะแนน (`/lessons/[id]/leaderboard`) เข้าได้เฉพาะ**หลังเล่นเกมจบ** (ผ่าน pending-score flow ของ G13) จึงไม่มีทางเปิดดูอันดับเฉย ๆ จากหน้าอื่น ในงาน event ทีมงานต้องการโชว์กระดานคะแนนได้ทันที

เกมในระบบมีมินิเกมจำนวนมาก แต่**เกมที่พร้อมเล่นและเก็บคะแนนขึ้นกระดานจริง ณ ตอนนี้มีเพียง G13** (`docs/gdd/design-g13.md`) — ออกแบบให้รายการเกมขยายได้ในอนาคต (เช่น G14 เมื่อพร้อม)

---

## 3. ขอบเขต (Scope)

1. **ปุ่มในเมนู:** เพิ่มปุ่ม "กระดานคะแนน" (icon trophy) ใน navigation drawer ของ `AppLayout` — เข้าถึงได้ทุกหน้าที่แสดง drawer
2. **Popup เลือกเกม:** กดปุ่มแล้วเปิด popup แสดงรายการเกมที่เก็บคะแนน (ตอนนี้มีเฉพาะ **G13**) แต่ละ slot มี **icon เกม + ชื่อเกม** เท่านั้น; แตะนอก popup หรือปุ่มปิดเพื่อปิด
3. **โหมด Browse (spectator) ของหน้า leaderboard:** เลือกเกม → ไป `/lessons/<lessonId>/leaderboard?view=browse` โดย
   - เหรียญบนสุดเปลี่ยนจากเลขอันดับผู้เล่นเป็น **trophy** (lucide `Trophy` / 🏆)
   - แสดงข้อความ **"กระดานคะแนน"** + **ชื่อเกม**
   - **ไม่แสดงแคปซูลชื่อ/คะแนนของผู้เล่น** และไม่มีการไฮไลต์แถวผู้เล่น (`is_current_player`)
   - รายการอันดับ / สี / รูปแบบการ์ด **เหมือนหน้า leaderboard ปกติทุกอย่าง**
   - ปุ่มล่างเป็น **"เลือกเกม"** → เปิด popup เลือกเกมอีกครั้งเพื่อสลับไปดูเกมอื่น (แทน "เสร็จสิ้นบทเรียน")
   - ไม่ข้ามไปหน้า name-entry และไม่เรียก API ด้วย `player_uuid` (ไม่มี `currentPlayer`)

---

## 4. Acceptance Criteria

- [ ] drawer มีปุ่ม "กระดานคะแนน" (icon trophy) เพิ่มจากปุ่มเดิม (ไปหน้าแรก / รีเซ็ตข้อมูล)
- [ ] กดแล้ว popup เลือกเกมแสดง **G13** (icon + ชื่อเกม) ปิดได้ด้วยแตะนอก/ปุ่มปิด
- [ ] เลือกเกม → หน้า leaderboard เปิดในโหมด browse ตาม §3
- [ ] โหมด browse: เหรียญบนเป็น trophy, มี "กระดานคะแนน" + ชื่อเกม, ไม่มีชื่อผู้เล่น, ปุ่มล่าง "เลือกเกม" เปิด popup สลับเกม
- [ ] เกมที่ยังไม่มีคะแนน แสดง empty state เดิม ("ยังไม่มีคะแนนในเกมนี้")
- [ ] เข้าถึงได้ทุกหน้าที่มี drawer (ยกเว้นหน้าที่ซ่อน chrome: landing `/`, `/lessons/complete`, `/facilitator/*`, `/dev/*`)
- [ ] ฟอนต์ ≥ 20px และแตะง่ายตามมาตรฐาน accessibility ของโปรเจกต์

---

## 5. Design Decisions

- **ไอคอนเกมใน popup:** ใช้ไฟล์ SVG asset — G13 = `public/assets/g13-waffle-cone.svg` (เพิ่มเกมใหม่ให้ผูก asset ต่อเกม)
- **ชื่อเกม:** โหลดจากฐานข้อมูล (`game_id`) ผ่าน `GET /api/leaderboard/games` เท่านั้น — ไม่เก็บชื่อ hardcode ใน config เพื่อกันชื่อในแอปหลุดจาก DB; popup มี state loading/error ระหว่างดึงข้อมูล
- **trophy:** ใช้ lucide `Trophy` (import อยู่แล้วในหน้า leaderboard) วางในวงกลมพื้น `primary-light`
- **trigger โหมด browse:** query param `?view=browse` (อ่านด้วย `useSearchParams`)
- **ปุ่มล่างโหมด browse:** "เลือกเกม" → เปิด popup เลือกเกม (component เดียวกับที่ใช้ใน drawer)
- **รายการเกมที่ browse ได้:** เก็บใน `BROWSABLE_LEADERBOARD_GAMES` (ตอนนี้ = [G13]) เพิ่มเกมภายหลังได้โดยไม่แตะ UI
- **อนาคต:** เมื่อ G14 พร้อมเล่น+เก็บคะแนน ค่อยเพิ่มเข้า config + browsable list (การส่งคะแนนจริงของแต่ละเกมเป็นงานแยก)

---

## 6. ไฟล์ที่เกี่ยวข้อง

- `src/components/AppLayout.tsx` — ปุ่ม drawer + mount popup เลือกเกม
- `src/components/LeaderboardGamePicker.tsx` (ใหม่) — popup เลือกเกม ใช้ร่วมกันทั้ง drawer และหน้า browse
- `src/app/lessons/[id]/leaderboard/page.tsx` — โหมด browse (trophy, ไม่มีชื่อผู้เล่น, ปุ่ม "เลือกเกม")
- `src/lib/leaderboard.ts` — ฟิลด์ `icon` + `BROWSABLE_LEADERBOARD_GAMES`
- [Application Flow](../../software/04-application-flow.md), [Screen Design](../../software/05-screen-design.md)
