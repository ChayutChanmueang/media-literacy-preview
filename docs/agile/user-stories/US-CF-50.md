# User Story: US-CF-50 - ระบบ Leaderboard แยกตามเกม

**Status:** 🟡 In Progress — G13 score submission และ browse-only regression ผ่าน Runtime QA; full mobile/LINE browser QA pending
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-14  
**Owner:** TBD | **Priority:** Should Have | **Estimate:** L  
**Version:** 1.7 | **Last Updated:** 2026-08-18

---

## 📖 Description

**ในฐานะ** ผู้เรียน (ผู้สูงอายุ)  
**ฉันต้องการ** กรอกชื่อเล่นครั้งเดียวและดูกระดานคะแนนแยกตามเกมแต่ละตัว
**เพื่อที่จะ** เปรียบเทียบคะแนนแต่ละรอบ เห็นพัฒนาการของตนเอง และดูประวัติคะแนนร่วมกับผู้เล่นคนอื่น

---

## 🎯 Product Decisions

### รูปแบบข้อมูลและประสบการณ์
- ระบบ **ไม่มีบัญชีผู้ใช้และไม่มีการเข้าสู่ระบบ**
- ผู้เล่นกรอกชื่อเล่นครั้งแรกก่อนเข้าหน้า Leaderboard
- Client สร้าง `player_uuid` และเก็บโปรไฟล์ผู้เล่นไว้ใน `localStorage`
- หากพบ local player profile ที่มีทั้ง UUID และชื่อ ระบบข้ามหน้ากรอกชื่อและเปิด Leaderboard ทันที
- คะแนนทุกครั้งที่เล่นจบเป็น **ประวัติใหม่หนึ่งรายการ** ไม่บังคับเก็บเฉพาะคะแนนสูงสุด และยอมให้ชื่อเดียวกันปรากฏหลายแถว
- UUID ใช้เชื่อมประวัติและไฮไลท์รายการของเครื่องปัจจุบันเท่านั้น **ไม่ใช่หลักฐานยืนยันตัวตน**

### Local player profile
เสนอให้เก็บเป็น object เดียวเพื่อลดกรณี UUID และชื่อไม่ตรงกัน:

```json
{
  "player_uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "name": "ยายสมพร"
}
```

- Suggested key: `naplab_ml_leaderboard_player`
- ถ้าข้อมูล parse ไม่ได้, UUID ไม่ถูกต้อง หรือชื่อว่าง ให้ลบค่าที่เสียและกลับไปหน้ากรอกชื่อ
- การล้างข้อมูลเว็บไซต์หรือเปลี่ยน browser/device จะถือเป็นผู้เล่น local คนใหม่

### การแยกตามเกม
- Leaderboard อยู่ใต้ route ของเกมที่เพิ่งเล่น: `/lessons/[id]/leaderboard`
- ตัวอย่าง: เล่นจบที่ `/lessons/flow-g13/game` แล้วไป `/lessons/flow-g13/leaderboard`
- ระบบแปลง lesson route parameter เป็น `gid` ของเกมนั้น เช่น `flow-g13 → G13`
- Leaderboard ต้อง query ด้วย `gid` ที่ได้จาก route เสมอและห้ามรวมคะแนนข้ามเกม
- แต่ละรายการแสดงอันดับ, ชื่อ, คะแนน และไฮไลท์รายการที่ `player_uuid` ตรงกับเครื่องปัจจุบัน

### การเข้าถึง
- Route หลัก: `/lessons/[id]/leaderboard`
- เข้าถึงหลังจบเกมนั้นโดยตรง; Start Menu อาจลิงก์เข้าหน้าอันดับของเกมที่เลือกในอนาคต
- เป็นหน้าแยกที่เลื่อนได้ เพื่อรองรับรายการคะแนนและการขยายฟอนต์
- หากไม่มี local player profile ให้แสดงหน้า name-entry ตาม draft พร้อมสองทางเลือก:
  - **ไม่เก็บคะแนน:** เปิด popup ถาม "ไม่ต้องการเก็บคะแนนหรือไม่?" ก่อน; กด "ใช่" จึงเข้าดู Leaderboard แบบ browse-only โดยไม่สร้าง UUID/ไม่บันทึกชื่อ
  - **เก็บคะแนน:** ต้องกรอกชื่อที่ถูกต้อง จากนั้นเปิด popup ถาม "ต้องการเก็บคะแนนหรือไม่?"; กด "ใช่" จึงสร้าง local player profile และเข้าหน้า Leaderboard

### Layout reference
- ใช้ draft เป็นข้อมูลอ้างอิงเฉพาะ **โครงจัดวางและลำดับชั้นข้อมูล** ไม่คัดลอก art direction, สี, เงา, เหรียญ หรือ typography จากภาพ
- ใช้ `AppLayout`, design tokens และธีมปัจจุบันของโปรเจกต์
- หน้า name-entry: การ์ดกรอกชื่ออยู่กึ่งกลาง ตามด้วยปุ่มขนาดใหญ่สองปุ่มเรียงสองคอลัมน์
- หน้าอันดับ: ชื่อเกม → หัวตาราง 3 คอลัมน์ `อันดับ | ชื่อ | คะแนน` → การ์ดคะแนนแนวตั้ง
- อันดับ 1–3 แสดงเลขในวงกลม (ไม่มีไอคอนเหรียญ/ถ้วย) และใช้สีโพเดียมที่กำหนด; อันดับ 4 ลงไปใช้การ์ดขาวกับกล่องคะแนนเทา `#9F9F9F`
- ชื่อยาวแสดง ellipsis หนึ่งบรรทัด ส่วนคะแนนอยู่ใน pill ด้านขวา
- รายการของผู้เล่นปัจจุบันใช้กรอบ + ป้าย "คุณ" นอกเหนือจากสี
- ข้อมูลคะแนนใน draft เป็น placeholder; implementation จริงต้องเรียงคะแนนจากมากไปน้อย

---

## ✅ Acceptance Criteria

1. [x] เมื่อไม่มี local player profile หน้า `/lessons/[id]/leaderboard` แสดงฟอร์มกรอกชื่อและปุ่ม "ไม่เก็บคะแนน"/"เก็บคะแนน"
2. [x] เมื่อมี local player profile ที่ถูกต้อง ระบบข้ามฟอร์มและแสดง Leaderboard ทันที
3. [x] ชื่อถูก trim, ห้ามเป็นค่าว่าง และจำกัดความยาว 1–30 ตัวอักษร
4. [x] ปุ่ม "ไม่เก็บคะแนน" เปิด popup ยืนยัน "ไม่ต้องการเก็บคะแนนหรือไม่?" ก่อนเข้า Leaderboard แบบ browse-only โดยไม่สร้าง UUID/ชื่อและยังไม่บันทึกผล แต่คง pending score ไว้ระหว่างอยู่ใน flow เพื่อให้เปลี่ยนใจกด "กรอกชื่อเพื่อเก็บคะแนน" ได้; ล้างคะแนนเมื่อออกจาก flow แบบไม่เก็บคะแนน
5. [x] ปุ่ม "เก็บคะแนน" disabled ขณะชื่อไม่ผ่าน validation; เมื่อกดสำเร็จให้เปิด popup ยืนยัน "ต้องการเก็บคะแนนหรือไม่?" ก่อนสร้าง local profile
6. [x] Leaderboard แสดง **อันดับ, ชื่อ และคะแนน** ตาม layout draft โดยเรียงคะแนนมากไปน้อย
7. [x] หน้า derive `gid` จาก `[id]` ของ route และ request ทุกครั้งต้องระบุ `gid`; คะแนนต่างเกมไม่ปะปนกัน
8. [x] แสดง Top 10 ต่อเกม และรองรับการโหลดหน้าถัดไปในอนาคต
9. [x] คะแนนแต่ละรอบถูกเก็บเป็นแถวใหม่เพื่อใช้เป็น history; ไม่ deduplicate ด้วยชื่อหรือผู้เล่น
10. [x] ไฮไลท์ทุกรายการที่เป็น `player_uuid` ของเครื่องปัจจุบันด้วยกรอบ + ป้าย "คุณ" โดยไม่เปิดเผย UUID ใน UI
11. [x] อ่านและเขียนข้อมูลผ่าน Next.js Route Handler เท่านั้น ไม่ให้ browser เขียนตาราง Supabase โดยตรง
12. [x] Server ตรวจ UUID, `gid`, ชื่อ, ชนิดคะแนน, ช่วงคะแนน และ rate limit ก่อนบันทึก
13. [x] เมื่อจบเกม G13 ระบบนำจาก `/lessons/flow-g13/game` ไป `/lessons/flow-g13/leaderboard`
14. [ ] ใช้ layout จาก draft เท่านั้น; สี ตัวอักษร ไอคอน และองค์ประกอบตกแต่งใช้ design system เดิมโดยไม่เพิ่ม artwork
15. [ ] ฟอนต์เนื้อหา ≥ 20px, touch target ≥ 48×48px, contrast ≥ 4.5:1 และหน้าเลื่อนได้เมื่อรายการยาว
16. [ ] `tsc --noEmit` ผ่าน และทดสอบ responsive บนจอมือถือ/LINE In-App Browser

---

## 🛠 Technical Tasks

### Database (Supabase)
- [x] ใช้ตาราง `game_id` เป็น registry ของเกม (`gid`, `name`, `created_at`)
- [x] ใช้ตาราง `player_info` เป็นประวัติคะแนน (`id`, `attempt_uuid`, `player_uuid`, `name`, `gid`, `score`, `created_at`)
- [x] เพิ่ม `player_uuid uuid not null` แยกจาก `id` เพราะ `id` เป็นรหัสรายการคะแนนแต่ละรอบ
- [x] กำหนด FK `player_info.gid → game_id.gid`
- [x] กำหนด `score not null check (score >= 0)` และ name length constraint
- [x] เพิ่ม index `(gid, score desc, created_at asc)` สำหรับ query อันดับรายเกม
- [x] เปิด RLS โดยไม่สร้าง policy สำหรับ `anon`/`authenticated`; การอ่าน/เขียนทำผ่าน server API

### Frontend
- [x] สร้าง route `/lessons/[id]/leaderboard` พร้อม state `name-entry` และ `leaderboard`
- [x] สร้าง/อ่าน local player profile และ recovery เมื่อข้อมูลเสีย
- [x] รองรับ browse-only state จากปุ่ม "ไม่เก็บคะแนน"
- [x] แสดง popup ยืนยันก่อนเก็บคะแนนและก่อนไม่เก็บคะแนน
- [x] แปลง `[id]` เป็น `gid` และแสดงชื่อเกมจาก `game_id`
- [x] แสดงหัวตาราง 3 คอลัมน์ + Top 10 cards + empty/loading/error states + ไฮไลท์ประวัติของผู้เล่นปัจจุบัน
- [x] ใช้ icon/CSS สำหรับอันดับ 1–3 และ ellipsis สำหรับชื่อยาว โดยไม่เพิ่ม artwork
- [x] เปลี่ยน flow หลังจบเกมให้ไป Leaderboard ของ `[id]` เดียวกัน

**Implementation progress (updated 2026-08-17):**
- เพิ่ม `src/app/lessons/[id]/leaderboard/page.tsx` สำหรับ name-entry, browse-only และรายการอันดับจริงตาม layout draft
- เพิ่ม `src/lib/leaderboard.ts` สำหรับ mapping lesson route → `gid`/ชื่อเกม และ shared response types
- เพิ่ม `GET /api/leaderboard?gid=...` สำหรับอ่านชื่อเกมและ Top 10 จาก `game_id`/`player_info` โดยใช้ `DENSE_RANK()`
- หน้าอันดับรองรับ loading skeleton, empty state, error/retry, refresh, อันดับ 1–3 แบบ CSS/icon, ellipsis ชื่อยาว และ score pill
- เพิ่ม `src/services/leaderboardPlayerService.ts` สำหรับสร้าง UUID, trim/validate ชื่อ, อ่าน/เขียน local profile และล้างข้อมูลที่เสีย
- เพิ่ม Zod schemas ใน `src/lib/validations.ts` และให้ `progressService.resetAll()` ล้าง local player profile ด้วย
- เพิ่ม unit tests สำหรับ local profile และ route→gid mapping ใน `src/tests/unit/leaderboard-player.test.ts`
- G13 ส่ง `height` เป็นคะแนน เก็บ pending score ใน `sessionStorage` แล้วไปหน้า Leaderboard; เมื่อมี local profile จึงเรียก `POST /api/game-results`
- แก้ browse-only flow ไม่ให้ลบ pending score ทันที เพื่อรองรับกรณีผู้เล่นเปลี่ยนใจกรอกชื่อ; ล้างคะแนนเมื่อกดเสร็จสิ้นบทเรียนโดยยังอยู่ใน browse-only
- เพิ่ม popup ยืนยันก่อนกด "เก็บคะแนน" และ "ไม่เก็บคะแนน" โดยถามสั้น ๆ ว่าต้องการเก็บคะแนนหรือไม่ / ไม่ต้องการเก็บคะแนนหรือไม่
- หน้ากระดานคะแนนใช้ปุ่มล่างติดจอ: ปุ่มเดียว "เสร็จสิ้นบทเรียน" หรือสองปุ่มติดกันเมื่อยังไม่เก็บคะแนน; ถอดปุ่มอัปเดตคะแนนออกจากรายการ
- หน้ากระดานคะแนนแสดงแคปซูล `ชื่อ ได้รับ N คะแนน` ใต้ชื่อเกม และเลขอันดับของผู้เล่นปัจจุบันแทนไอคอนถ้วย; ชื่อยาวตัดด้วย ellipsis
- หน้ากรอกชื่อย้ายปุ่ม "ไม่เก็บคะแนน" / "เก็บคะแนน" ไปแถบล่างติดจอเช่นกัน
- หากกด "เก็บคะแนน" ทั้งที่ยังไม่มีชื่อ แสดง toast "ยังไม่ได้กรอกชื่อ" และกรอบช่องชื่อเป็นสีแดง
- ผู้ใช้ยืนยัน Runtime QA ของ regression path: "ไม่เก็บคะแนน" → "กรอกชื่อเพื่อเก็บคะแนน" → คะแนนถูกบันทึกลงฐานข้อมูลสำเร็จ
- แต่ละ pending score มี `attempt_uuid` unique เพื่อให้ retry/React Strict Mode ไม่สร้างคะแนนรอบเดียวซ้ำ
- เพิ่ม server validation, score limit, rate limit, schema constraints/indexes และ `is_current_player` โดยไม่ส่ง UUID ของผู้เล่นอื่นกลับ browser
- ทดสอบจริงกับ Supabase: POST ได้ 201, GET ได้ 200 และรายการของ UUID ปัจจุบันมี `is_current_player: true`
- เหรียญอันดับบนหัวหน้าจอแสดงอันดับจริงของผู้เล่นเสมอ แม้จะหลุดจาก top-N ที่แสดงบนกระดาน: `GET /api/leaderboard` ส่ง field `currentPlayer` (คำนวณ `DENSE_RANK` ข้ามทั้งเกม ไม่ติด `LIMIT`) กลับมาให้ client ใช้เป็น fallback ของอันดับ/คะแนน โดยไม่เพิ่มแถวผู้เล่นเข้าลิสต์
- คะแนนในกล่องจัดกึ่งกลาง และแถวของผู้เล่นปัจจุบันใช้กรอบสีสว่างเพื่อไฮไลต์ (อันดับ 1–3 = สีสว่างของอันดับ, อันดับ 4 ลงไป = สีหลักของแอป)
- ผ่าน `npx tsc --noEmit`, targeted ESLint และ unit tests; ยังไม่ mark Acceptance Criteria ผ่านจนกว่าจะตรวจ UI ใน browser/mobile

### API
- [ ] `GET /api/games` → รายการเกมที่เปิดใช้บน Leaderboard
- [x] `GET /api/leaderboard?gid=G1&limit=10` → ดึงเฉพาะเกมที่ระบุและคืน rank
- [x] `POST /api/game-results` → ตรวจ input และบันทึกหนึ่งแถวต่อหนึ่งรอบการเล่น
- [x] ไม่คืน `player_uuid` ของผู้เล่นรายอื่น; ใช้ field `is_current_player` ที่คำนวณฝั่ง server
- [x] เพิ่ม rate limit ระดับพื้นฐานและจำกัด `gid`/คะแนนตาม game registry

### Score integrity
- [x] ยอมรับขอบเขต MVP ว่าคะแนนจากเกมฝั่ง browser ไม่สามารถป้องกันการแก้ memory/request ได้สมบูรณ์
- [x] Server ป้องกันเฉพาะค่าผิดรูปแบบ, คะแนนนอกช่วง และการส่งถี่ผิดปกติ
- [x] ไม่ใช้ Edge Function ใน MVP; ใช้สถาปัตยกรรม Next.js Route Handler + `pg` Pool เดิม

---

## 📝 หมายเหตุ

- ไม่มี competitive features เช่น challenge / friend system
- ชื่อเล่นเป็นข้อมูลที่ผู้ใช้ตั้งใจเผยแพร่บนกระดานคะแนน ต้องมีข้อความแจ้งสั้น ๆ ก่อนบันทึก
- ความเป็นส่วนตัว: แสดงเฉพาะชื่อเล่น คะแนน เวลาแบบย่อ และชื่อเกม; ไม่แสดง UUID, พื้นที่, อายุ หรือข้อมูล device
- อาจพิจารณาเพิ่ม filter ตามพื้นที่ (จังหวัด) ในอนาคต

---

## 🔗 Related

- ระบบคะแนน: [US-REWARD-01](../user-stories/archives/US-REWARD-01.md)
- เก็บผลเกม: [US-DATA-02](../user-stories/archives/US-DATA-02.md)
- ระบบ Supabase: [US-MIGRATE-03](./US-MIGRATE-03.md)
- Data Schema: [Software Data Schema](../../software/03-data-schema.md)
- Application Flow: [Application Flow & Routing](../../software/04-application-flow.md)
- Screen Design: [Screen Design](../../software/05-screen-design.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
