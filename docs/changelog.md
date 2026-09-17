# Documentation Changelog

## [0.12.3] - 2026-08-18

### Fixed
- ชื่อเกมใน popup เลือกกระดานคะแนน (US-CF-52) ไม่ตรงกับฐานข้อมูล (ขึ้นชื่อเก่า hardcode) — ถอดชื่อ hardcode ออกจาก config ทั้งหมด และให้โหลดชื่อจากตาราง `game_id` ผ่าน endpoint ใหม่ `GET /api/leaderboard/games`; popup มี state loading/error ระหว่างดึงข้อมูล

**Bump rationale:** แก้บั๊กชื่อเกมหลุดจาก DB โดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.12.2` เป็น `0.12.3`

## [0.12.2] - 2026-08-18

### Changed
- รวมงานจาก branch `cc-dev` (merge เข้าสู่ `staging`): ถอดไอคอนผู้ใช้ (avatar) ออกจากมุมมองแชท/ข่าว — `G6LineSimulation.jsx`, `NewsMessageView.jsx`

**Bump rationale:** รวม (merge) การถอดไอคอนผู้ใช้จาก branch `cc-dev` เป็นการปรับ UI โดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.12.1` เป็น `0.12.2`

## [0.12.1] - 2026-08-18

### Changed
- รวมงานจาก branch `cc-dev`: ปรับสีปุ่มและตั้งธีมสีของแอปเป็นโทนม่วง (purple) เป็นค่าคงที่ — กระทบ `globals.css`, `layout.tsx`, `AppLayout.tsx`, หน้า video/leaderboard และคอมโพเนนต์เกม G1/G3/G6/G8/G11/G13

**Bump rationale:** รวม (merge) การปรับสีปุ่ม/ธีมจาก branch `cc-dev` โดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.12.0` เป็น `0.12.1`

## [0.12.0] - 2026-08-18

### Added
- เปิดกระดานคะแนนจากเมนูได้ (US-CF-52): navigation drawer มีปุ่ม "กระดานคะแนน" เปิด popup เลือกเกม (`LeaderboardGamePicker`) แสดงเฉพาะเกมที่เก็บคะแนน (`BROWSABLE_LEADERBOARD_GAMES`; ตอนนี้ = G13) แต่ละ slot มีไอคอน + ชื่อเกม
- หน้า Leaderboard รองรับโหมด browse (`?view=browse`): เหรียญบนสุดเป็น trophy, แสดง "กระดานคะแนน" + ชื่อเกม, ไม่มีชื่อผู้เล่น/ไฮไลต์ และไม่เรียก API ด้วย `player_uuid`; ปุ่มล่างเป็น "เลือกเกม" เปิด popup เพื่อสลับเกม
- `LeaderboardGame` เพิ่มฟิลด์ `icon` และผูก `/assets/g13-waffle-cone.svg` ให้ G13

### Documentation
- เพิ่ม [US-CF-52](./agile/user-stories/US-CF-52.md) และซิงก์ [Application Flow](./software/04-application-flow.md) / [Screen Design](./software/05-screen-design.md)

**Bump rationale:** เพิ่มฟีเจอร์ใหม่ (เปิด/เลือกดูกระดานคะแนนจากเมนูแบบ browse) จึงอัปเดต MINOR จาก `0.11.8` เป็น `0.12.0`

## [0.11.8] - 2026-08-18

### Changed
- หน้า Leaderboard (US-CF-50) จัดคะแนนในกล่องให้อยู่กึ่งกลาง (`text-center`) แทนชิดขวา
- แถวของผู้เล่นปัจจุบันใช้กรอบสีสว่างเพื่อไฮไลต์: อันดับ 1–3 ใช้สีสว่างของอันดับนั้น (`bg`), อันดับ 4 ลงไปใช้สีหลักของแอป (`--primary`)

**Bump rationale:** ปรับรายละเอียด UI หน้ากระดานคะแนน (จัดกึ่งกลางคะแนน + ไฮไลต์แถวผู้เล่น) โดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.11.7` เป็น `0.11.8`

## [0.11.7] - 2026-08-18

### Added
- หน้า Leaderboard (US-CF-50) แสดงอันดับจริงของผู้เล่นบนเหรียญหัวหน้าจอเสมอ แม้จะหลุดจาก top-10 ที่แสดงบนกระดาน — `GET /api/leaderboard` เพิ่ม field `currentPlayer` ที่คำนวณ `DENSE_RANK` ข้ามทั้งเกม (ไม่ติด `LIMIT`); client ใช้เป็น fallback ของอันดับและคะแนน โดยไม่เพิ่มแถวผู้เล่นเข้าลิสต์

**Bump rationale:** เพิ่มความสามารถให้ผู้เล่นนอก top-10 เห็นอันดับตัวเอง (field API ใหม่ + พฤติกรรม) เป็นส่วนขยายเล็กภายใน US-CF-50 จึงอัปเดต PATCH จาก `0.11.6` เป็น `0.11.7`

## [0.11.6] - 2026-08-18

### Changed
- หน้า Leaderboard (US-CF-50) เปลี่ยนไอคอนถ้วยเป็นเลขอันดับ และทาสีแถว/กล่องคะแนนตามอันดับ 1–3 (ทอง/เงิน/ทองแดง) ส่วนอันดับ 4 ลงไปใช้การ์ดขาว + กล่องคะแนนเทา `#9F9F9F`
- ปรับทรงให้ตรงดีไซน์: การ์ดแถวเป็นสี่เหลี่ยมมุมมน `rounded-[22px]` และกล่องคะแนนเป็นแคปซูล `rounded-full`
- ลดความสูงแถวให้กระชับ (`min-h-[82px]`→`min-h-[60px]`, วงกลมอันดับ 56px→48px, ช่องไฟระหว่างแถว `gap-3`→`gap-2.5`)
- พื้นหลังการ์ดอันดับ 1–3 เป็น gradient ไล่จากสีเข้มของอันดับด้านซ้ายไปสีปกติด้านขวา และเปลี่ยนขอบวงกลมเลขเป็นสีสว่างของอันดับให้เด้งบน gradient
- ชื่อผู้เล่นขนาด 26px; อันดับ 1–3 เป็นสีขาว + `text-shadow: 0 2px 4px rgba(0,0,0,0.5)` ให้อ่านชัดบนพื้นสี ชื่อยาวตัดด้วย ellipsis
- แคปซูลใต้ชื่อเกมเป็น `{ชื่อ} ได้รับ {คะแนน} คะแนน` (จัดกึ่งกลางแบบ `w-fit`; ชื่อยาวตัดเป็น `…` โดยคงส่วน "ได้รับ N คะแนน")
- เหรียญอันดับของผู้เล่นบนหัวหน้าจอ (`HeaderRankBadge`) ขยายเป็น 100×100px และแสดงทุกอันดับ อันดับ 4 ลงไปเป็นเหรียญเทา ขอบเทาเข้ม `#787878`

**Bump rationale:** ปรับ UI หน้ากระดานคะแนนให้ตรงดีไซน์ (US-CF-50) โดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.11.5` เป็น `0.11.6`

## [0.11.5] - 2026-08-18

### Changed
- หน้า Consent ใส่กรอบ/พื้นหลังการ์ดให้ข้อ 1 (ช่วงอายุ) ให้สอดคล้องกับข้อ 2 (พื้นที่) และถอดไอคอน location ออกจากหัวข้อพื้นที่

**Bump rationale:** ปรับ UI หน้ายินยอมให้สม่ำเสมอ ไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.11.4` เป็น `0.11.5`

## [0.11.4] - 2026-08-18

### Changed
- หน้า Consent ถอดระบบเช็คตำแหน่งจาก GPS เหลือเฉพาะการเลือกจังหวัด/อำเภอ/ตำบลเอง เพราะพิกัดมักไม่ตรง และผู้เรียนอาจต้องการกรอกบ้านเกิดหรือที่อยู่ปัจจุบันตามความประสงค์

### Documentation
- บันทึกผลตอบรับ [FB-2026-08-18 GPS Consent](./agile/feedback/FB-2026-08-18-gps-consent.md) และซิงก์สเปกพื้นที่แบบแมนนวลในเอกสารซอฟต์แวร์/GDD/แนวทางเขียนโค้ด

**Bump rationale:** ถอด GPS จากหน้า Consent ตาม feedback โดยไม่เพิ่มฟีเจอร์ใหม่ จึงอัปเดต PATCH จาก `0.11.3` เป็น `0.11.4`

## [0.11.3] - 2026-08-18

### Changed
- หน้า Landing ถอดกรอบ teal, พื้นเขียวอ่อน และเงารอบโลโก้ออก ให้ไอคอนแอปวางบนพื้นขาวโดยตรง

**Bump rationale:** ปรับภาพโลโก้หน้าแรกโดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.11.2` เป็น `0.11.3`

## [0.11.2] - 2026-08-18

### Fixed
- ปุ่ม "ข้ามวิดีโอ" (US-CF-49) ไม่ปรากฏเมื่อตัวเล่นพร้อมแล้วแต่เบราว์เซอร์บล็อก autoplay (เช่น LINE in-app browser) — ผู้เรียนต้องกดเล่นเอง ไม่ใช่กรณีโหลดช้า จึงไม่เสนอข้าม

### Documentation
- อัปเดต [US-CF-49](./agile/user-stories/US-CF-49.md) เป็นเวอร์ชันเอกสาร 1.1 ให้ครอบคลุมกรณี autoplay ถูกบล็อก

**Bump rationale:** แก้พฤติกรรมปุ่มข้ามวิดีโอโดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.11.1` เป็น `0.11.2`

## [0.11.1] - 2026-08-18

### Fixed
- หัวแชทจำลองใน G1 (`NewsMessageView` สกิน LINE/SMS) และ G6 เหลือเฉพาะโปรไฟล์กับชื่อหรือเบอร์โทร — ถอดปุ่มกลับ, ปุ่มโทร, วิดีโอคอล, ค้นหา และเมนูออก เพื่อไม่ให้ผู้สูงอายุเข้าใจผิดว่ากดออกจากเกมหรือโทรออกได้; ปุ่ม "โทรแจ้งสายด่วน" บนการ์ดสรุป G6 (`tel:`) ยังคงไว้ตามสเปก

### Documentation
- อัปเดต [design-g6](./gdd/design-g6.md) เป็นเวอร์ชันเอกสาร 2.1 ให้หัวแชทตรงกับกติกาใหม่
- อัปเดต [US-CF-08](./agile/user-stories/archives/US-CF-08.md) เป็นเวอร์ชันเอกสาร 1.2 ให้สอดคล้องกับ header ที่ตัดปุ่มจำลองออก
- อัปเดต [US-GAME-06-R1](./agile/user-stories/US-GAME-06-R1.md), [Product Backlog](./agile/01-product-backlog.md) และ [Core Mechanics](./gdd/01-mechanics.md) ให้ชี้สเปกหัวแชทและลิงก์ US-CF-08 ที่ถูก archive แล้ว

**Bump rationale:** แก้ UI ที่ทำให้เข้าใจผิดโดยไม่เพิ่ม functionality ใหม่ จึงอัปเดต PATCH จาก `0.11.0` เป็น `0.11.1`

## [0.11.0] - 2026-08-17

### Added
- หัวข้อหน้า Leaderboard แสดงแคปซูลชื่อผู้เล่น + คะแนนรอบนี้ แทนข้อความ "ผู้เล่น: ชื่อ"
- หากกด "เก็บคะแนน" ทั้งที่ชื่อว่าง แสดง toast แบบ Android ข้อความ "ยังไม่ได้กรอกชื่อ" และเปลี่ยนกรอบช่องชื่อเป็นสีแดง

### Changed
- หน้า Leaderboard ถอดปุ่ม "อัปเดตคะแนน", "กรอกชื่อเพื่อเก็บคะแนน" และ "เสร็จสิ้นบทเรียน" ที่ซ้อนในรายการ แล้วใช้แถบปุ่มล่างติดจอแบบมินิเกม: ปุ่มเดียวเมื่อเก็บคะแนนแล้ว หรือสองปุ่มติดกันเมื่อดูแบบไม่เก็บคะแนน
- หน้ากรอกชื่อย้ายปุ่ม "ไม่เก็บคะแนน" / "เก็บคะแนน" ไปแถบล่างติดจอเช่นกัน

### Documentation
- อัปเดต [US-CF-50](./agile/user-stories/US-CF-50.md) เป็นเวอร์ชันเอกสาร 1.4 ให้ครอบคลุมปุ่มล่างติดจอ แคปซูลชื่อ+คะแนน และ toast ชื่อว่าง
- อัปเดต [Screen Design](./software/05-screen-design.md) เป็นเวอร์ชันเอกสาร 1.2 ให้ตรงกับ layout ปุ่มล่างติดจอและแคปซูลใต้ชื่อเกม

**Bump rationale:** แคปซูลชื่อ+คะแนน, แถบปุ่มล่างติดจอ และ toast ชื่อว่าง เป็น functionality ใหม่แบบ backward-compatible จึงอัปเดต MINOR จาก `0.10.0` เป็น `0.11.0`

## [0.10.0] - 2026-08-17

### Added
- เพิ่ม popup ยืนยันก่อนเก็บ/ไม่เก็บคะแนนบนหน้า Leaderboard (US-CF-50): กด "เก็บคะแนน" ถาม "ต้องการเก็บคะแนนหรือไม่?" และกด "ไม่เก็บคะแนน" ถาม "ไม่ต้องการเก็บคะแนนหรือไม่?" — ปุ่ม "ใช่" ทำตามที่เลือก, ปุ่ม "ไม่ใช่" ปิด popup

### Changed
- ปุ่ม "บทเรียนถัดไป" หน้าสุดท้ายของมินิเกม G1/G3/G6 auto-advance ใน 5 วินาที (เดิมใช้ 30 วินาทีเหมือนหน้าเฉลยข้อกลาง); ข้อกลางยังนับ 30 วินาทีและหยุดนับเมื่อแตะ/เลื่อนอ่านเฉลยตามเดิม

### Fixed
- แก้ Leaderboard ลบ pending score เร็วเกินไปเมื่อกด "ไม่เก็บคะแนน" (US-CF-50): หากผู้เล่นเปลี่ยนใจมากรอกชื่อในหน้าเดิม ระบบจะส่งคะแนนไปฐานข้อมูลได้ตามปกติ และจะล้างคะแนนเมื่อออกจาก flow แบบไม่เก็บคะแนนจริง

### Documentation
- อัปเดต [US-CF-50](./agile/user-stories/US-CF-50.md) เป็นเวอร์ชันเอกสาร 1.3 พร้อมระบุพฤติกรรม browse-only, popup ยืนยัน และผล Runtime QA ของเส้นทางเปลี่ยนใจเก็บคะแนน
- อัปเดต [Screen Design](./software/05-screen-design.md) ให้มี popup ยืนยันในหน้ากรอกชื่อ Leaderboard

### Validated
- ผู้ใช้ยืนยัน Runtime QA: กด "ไม่เก็บคะแนน" → "กรอกชื่อเพื่อเก็บคะแนน" → คะแนนถูกบันทึกสำเร็จ
- `npx tsc --noEmit`, targeted ESLint และ unit tests ของ Leaderboard ผ่าน
- ทดสอบ query เชื่อมต่อฐานข้อมูลสำเร็จ

**Bump rationale:** เพิ่ม popup ยืนยันเป็น functionality ใหม่แบบ backward-compatible จึงอัปเดต MINOR จาก `0.9.0` เป็น `0.10.0`; รวมการแก้บั๊ก pending score ในรุ่นเดียวกัน เพราะ `0.9.1` ยังไม่ได้ commit

## [0.9.0] - 2026-08-17

### Added
- เริ่ม implementation [US-CF-50](./agile/user-stories/US-CF-50.md) ระยะ name-entry:
  - เพิ่ม route `/lessons/[id]/leaderboard` ตาม layout draft โดยใช้ธีมและ design tokens เดิม ไม่มี artwork เพิ่ม
  - รองรับกรอกชื่อ 1–30 ตัวอักษร, ปุ่ม "ไม่เก็บคะแนน" แบบ browse-only และปุ่ม "เก็บคะแนน"
  - เพิ่ม local player profile `{ player_uuid, name }`, validation/recovery เมื่อข้อมูลเสีย และล้างพร้อมคำสั่ง reset แอป
  - เพิ่มรายการอันดับจริงจาก `GET /api/leaderboard` โดย derive `gid` จาก lesson route และ query ตาราง `game_id`/`player_info`
  - รองรับ Top 10, dense rank, loading skeleton, empty/error/retry states, refresh, score pill และชื่อยาวแบบ ellipsis
  - เพิ่ม unit tests สำหรับ local profile และ route→gid mapping; `tsc --noEmit` และ targeted ESLint ผ่าน
- แยกการเชื่อมต่อ PostgreSQL/Supabase ทั้งหมดไปที่ `src/lib/database.ts`:
  - สร้าง `pg` Pool แบบ lazy singleton, helper `queryDatabase()`/`checkDatabaseConnection()` และกำหนด DNS เป็น `ipv4first`
  - เพิ่มข้อความวินิจฉัยเมื่อใช้ `db.<project-ref>.supabase.co:6543` ผิดรูปแบบ; direct host ใช้ IPv6/5432 ส่วนเครือข่าย IPv4 ต้องใช้ Transaction pooler host/6543 จาก Dashboard
  - อัปเดต Route Handlers และ analytics ให้ใช้ `getDatabasePool()` จากโมดูลเดียว พร้อมถอด `src/lib/db.ts`
  - เพิ่มและรัน seed แบบ idempotent สำหรับทะเบียนเกม `G1`, `G2`, `G3`, `G5`, `G6`, `G13`; แก้ `GET /api/leaderboard?gid=G13` จาก 404 เป็น 200
- เชื่อม G13 เข้ากับ Leaderboard แบบครบเส้นทาง:
  - ส่งความสูงหอไอติมเป็นคะแนน G13 และเปลี่ยนปลายทางปุ่ม "เสร็จสิ้นบทเรียน" เป็น `/lessons/flow-g13/leaderboard`
  - เพิ่มปุ่มจบใต้ Leaderboard เพื่อไป `/lessons/complete` และคงหน้าชื่นชมปลาย Flow เดิม
  - เก็บ pending score ใน `sessionStorage`; บันทึกผ่าน `POST /api/game-results` หลังมี local player profile หรือทิ้งคะแนนเมื่อเลือก "ไม่เก็บคะแนน"
  - เพิ่ม `attempt_uuid` unique ให้แต่ละรอบเพื่อป้องกัน Strict Mode/การ retry บันทึกคะแนนซ้ำ
  - เพิ่ม `player_uuid`, constraints/indexes, RLS + revoke browser roles, validation ช่วงคะแนน และ rate limit ฝั่ง server
  - GET Leaderboard คืนเฉพาะ `is_current_player` เพื่อทำกรอบ + ป้าย "คุณ" โดยไม่เปิดเผย UUID ของผู้เล่น
  - ทดสอบ Supabase จริงแบบสร้างและลบข้อมูลทดสอบ: POST 201, GET 200 และการไฮไลท์ผู้เล่นถูกต้อง
- เพิ่มปุ่ม **"ข้ามเวลา"** แบบ Dev-only ใน HUD ของ G13 เพื่อเข้า summary ทันทีระหว่างทดสอบ โดยใช้ compile-time guard `process.env.NODE_ENV === "development"` ให้ production build ตัดโค้ดส่วนนี้ออก
- เพิ่มระบบช่วยเหลือเมื่อวิดีโอโหลดช้าหรือสะดุด (US-CF-49): แสดงปุ่มข้ามวิดีโอหลังรอเกินเวลาที่กำหนด, ซ่อนเมื่อวิดีโอกลับมาเล่น และบันทึก event สำหรับวิเคราะห์ปัญหา

### Fixed
- ลบปุ่ม "เล่นซ้ำ" ที่ซ้ำซ้อนออกจาก overlay หลังวิดีโอจบ (US-CF-47) เหลือปุ่มไปเล่นเกมเต็มความกว้างเพียงปุ่มเดียว โดยผู้เรียนยังเล่นซ้ำผ่าน native controls ของ YouTube/HTML5 ได้

### Documentation
- ปิดงาน [US-CF-48 — YouTube เล่นเสียงอัตโนมัติ](./agile/user-stories/US-CF-48.md) เป็น Done หลังผู้ใช้ยืนยัน Runtime QA:
  - ซิงก์เอกสารกับ implementation จริงที่ใช้ `autoplay: 1`, `mute: 0`, `controls: 1` และ `onReady` → `playVideo()`
  - แก้ข้อกำหนดร่างเดิมที่ระบุ `unMute()`/`setVolume(100)`/`video_sound_autoplay` ซึ่งไม่ได้อยู่ในโค้ดและไม่จำเป็นต่อ flow ที่ผ่านการทดสอบ
  - อัปเดต Acceptance Criteria, Technical Tasks และ Product Backlog ให้ตรงกับสถานะ Done
- ขยายสเปก [US-CF-50 — Leaderboard แยกตามเกม](./agile/user-stories/US-CF-50.md) ตาม product decision ล่าสุด:
  - ไม่มีระบบบัญชี ผู้เล่นกรอกชื่อครั้งแรกและใช้ local player profile `{ player_uuid, name }` เพื่อข้ามฟอร์มในการเข้าครั้งถัดไป
  - เก็บคะแนนทุกครั้งเป็น history แถวใหม่ ยอมให้ชื่อ/ผู้เล่นเดิมมีหลายรายการ และแสดง Top 10 แยกตาม `gid` เท่านั้น
  - ใช้ Next.js Route Handler + `pg` Pool เดิม ไม่เพิ่ม Supabase Edge Function ใน MVP
- เพิ่ม flow `/lessons/[id]/leaderboard`, name-entry guard, การ derive `gid` จากเกมใน route และ API contract เบื้องต้นใน [Application Flow](./software/04-application-flow.md)
- เพิ่มสเปกสองสถานะของหน้า Leaderboard, empty/error states และ accessibility ใน [Screen Design](./software/05-screen-design.md)
  - รับรอง draft หน้า name-entry/อันดับเป็น **layout reference เท่านั้น** โดยคง `AppLayout`, สี, typography, icon และ design tokens ของโปรเจกต์เดิม ไม่เพิ่ม artwork จากธีมในภาพ
  - หน้า name-entry มีปุ่ม "ไม่เก็บคะแนน" สำหรับ browse-only และ "เก็บคะแนน" สำหรับสร้าง local player profile
  - หน้าอันดับใช้หัวตาราง 3 คอลัมน์, score pill, ellipsis ชื่อยาว, badge อันดับ 1–3 แบบ icon/CSS และกรอบพร้อมป้าย "คุณ"
- เพิ่ม entity `game_id`/`player_info` และข้อกำหนดแยก `player_uuid` ออกจาก row `id` ใน [Data Schema](./software/03-data-schema.md) เพื่อให้หนึ่งผู้เล่นมีประวัติได้หลายรอบ
- ซิงก์รายการ US-CF-50 ใน [Product Backlog](./agile/01-product-backlog.md) และอัปเดต [Project Index](./index.md)

### Validated
- `tsc --noEmit` ผ่าน
- ผู้ใช้ยืนยัน Runtime QA ของ US-CF-48 ว่าวิดีโอเล่นพร้อมเสียงและ flow ทำงานถูกต้อง
- ทดสอบ Leaderboard กับ Supabase จริงแล้ว: บันทึกคะแนน, อ่าน Top 10 และไฮไลท์ผู้เล่นปัจจุบันถูกต้อง

**Bump rationale:** เพิ่ม Leaderboard และระบบช่วยเหลือวิดีโอโหลดช้าเป็น functionality ใหม่แบบ backward-compatible จึงอัปเดต MINOR จาก `0.8.5` เป็น `0.9.0`; รวมการแก้ UI ปุ่มเล่นซ้ำในรุ่นเดียวกัน

## [0.8.5] - 2026-08-07

### Fixed
- **ปุ่ม "ถัดไป" นับถอยหลังต่อขณะผู้เรียนดูคลิปซ้ำ → พาไปเกมกลางคัน** (US-CF-47) ใน `src/app/lessons/[id]/video/page.tsx`:
  - **YouTube:** `onStateChange` เพิ่ม `setCountdownActive(false)` เมื่อสถานะเป็น `PLAYING (1)` หรือ `BUFFERING (3)` — ครอบคลุมการกดเล่นซ้ำจาก UI ของ YouTube เอง (ปุ่ม replay / play / ลากแถบเวลาย้อนกลับ) ซึ่งไม่ผ่าน `handleReplay`
  - **MP4 (`<video>`):** เพิ่ม `setCountdownActive(false)` ใน `onPlay` — บั๊กชนิดเดียวกันเมื่อกดเล่นซ้ำจาก native controls
  - คง log `play_video` ให้ยิงเฉพาะสถานะ `PLAYING` เหมือนเดิม (ไม่ยิงซ้ำตอน `BUFFERING`)
- อัปเดตคอมเมนต์กำกับ `countdownActive` ให้ตรงความจริง (ของเดิมเขียน "15 วิ" ทั้งที่ปัจจุบันคือ 5 วิ และระบุแค่ปุ่ม "เล่นซ้ำ" ในแอป)

### Notes
- **สาเหตุ:** `showControls` กับ `countdownActive` เป็น state แยกกัน — `showControls` เพียงเลื่อนแถบปุ่มออกจากจอด้วย `translate-y-full` แต่ `AutoAdvanceButton` **ยังอยู่ใน DOM** และ `setTimeout` ที่ตั้งตอน mount จึงเดินต่อ (component clear timer ตอน unmount เท่านั้น) ปุ่ม "เล่นซ้ำ" ของแอปไม่เจอบั๊กเพราะ `handleReplay` ตั้ง `countdownActive = false` → unmount
- เมื่อคลิปจบรอบใหม่ ปุ่มจะ mount ใหม่เป็น instance ใหม่ จึงนับ 5 วินาทีสดจากศูนย์ ไม่ค้างค่าเดิม

### Validated
- `tsc --noEmit` ผ่าน; `eslint` ไม่มี error เพิ่มจากเดิม; `npm run build` ผ่าน (chunk วิดีโอเปลี่ยน ยืนยันโค้ดใหม่เข้า build)
- ✅ **ทดสอบจริงบนอุปกรณ์แล้ว** — กดเล่นซ้ำจาก UI ของ YouTube ไม่ถูกพาไปเกมกลางคันอีก
- เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกันที่ `0.8.5`

**Bump rationale:** แก้บั๊กพฤติกรรม auto-advance ของหน้าคลิป ไม่มี breaking change จึงอัปเดต PATCH `0.0.1` จาก `0.8.4` เป็น `0.8.5`

## [0.8.4] - 2026-08-07

### Removed
- **ถอดปุ่ม "แตะเพื่อเปิดเสียง" ออกจากหน้าคลิป** (US-CF-46): ลบ overlay ปุ่มกลางบนจอ พร้อม state `isMuted`, ฟังก์ชัน `handleUnmute`, event `unmute_video` และ import `VolumeX` ออกจาก `src/app/lessons/[id]/video/page.tsx` — ปุ่มนี้บังหน้าจอคลิปและเกะกะผู้เรียน

### Changed
- **คลิปเล่นมีเสียงทันทีทั้ง 2 แหล่งวิดีโอ** (US-CF-46):
  - **YouTube:** `playerVars.mute` จาก `1` → `0` และเอา `setIsMuted(true)` ใน `onReady` ออก
  - **MP4 (`<video>`):** ลดรูป `attemptMp4Autoplay` ให้เล่นแบบมีเสียงอย่างเดียว ไม่มี fallback ปิดเสียงเงียบ ๆ อีกต่อไป
- แก้แถว [US-VIDEO-01](./agile/sprint-backlog/sprint-03b-refinement.md) ใน Sprint 03B ที่ยังเขียนว่ามีปุ่มเปิดเสียง ให้ตรงกับพฤติกรรมจริง

### Notes
- **ที่มา:** งานแก้ autoplay ใน `0.7.2` ตีความ feedback คลาดเคลื่อน จึงเลือกทาง "เริ่มแบบปิดเสียง + ปุ่มแตะเปิดเสียง" — รอบนี้แก้กลับตามที่ผู้ใช้ต้องการจริง
- **ข้อจำกัดเบราว์เซอร์ที่รับทราบ:** เบราว์เซอร์มือถืออาจบล็อก autoplay แบบมีเสียงหากไม่มี user gesture แต่ในโฟลว์นี้ผู้ใช้กด "ดูคลิป"/นำทางมาเอง (เป็น user gesture) และหากถูกบล็อกจริงยังมี native `controls` ของ YouTube/`<video>` ให้กดเล่นเองได้ — ไม่ต้องมีปุ่มพิเศษ ดู [US-CF-46](./agile/user-stories/US-CF-46.md)

### Validated
- `tsc --noEmit` ผ่าน; ไม่มี reference ค้าง (`isMuted`/`handleUnmute`/`VolumeX`/`unmute`); `eslint` ไม่มี error เพิ่มจากเดิม (8 error เดิมเป็นของเก่าที่ไม่เกี่ยวกับการแก้นี้); เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกันที่ `0.8.4`
- ⚠️ **ยังไม่ได้ทดสอบเสียงบนอุปกรณ์จริง** — AC ข้อ QA ใน [US-CF-46](./agile/user-stories/US-CF-46.md) ยังค้าง

**Bump rationale:** แก้พฤติกรรม UX ของหน้าคลิป (ถอดปุ่มที่เกะกะ + เล่นมีเสียงเลย) ไม่มี breaking change จึงอัปเดต PATCH `0.0.1` จาก `0.8.3` เป็น `0.8.4`

## [0.8.3] - 2026-08-07

### Fixed
- **Accessibility / Layout — ตรึงขนาดฟอนต์กันการขยายระดับ OS** (US-CF-45): เปลี่ยน `src/app/globals.css` จาก `text-size-adjust: none` เป็น `text-size-adjust: 100%` และครอบ selector เป็น `html, body` — เมื่อผู้สูงอายุตั้งขนาดฟอนต์ของเครื่องให้ใหญ่ layout แบบ zero-scroll จะไม่ถูกคูณขนาดซ้ำจนเพี้ยน (ทดสอบบนเครื่องจริง Android + Chrome ✅)

### Notes
- **ข้อจำกัดที่รับทราบ:** Chrome in-browser "Text scaling" (Settings → Accessibility) ยังขยายฟอนต์อยู่ ไม่ว่าจะตั้ง `text-size-adjust` เป็นค่าใด เพราะ Chrome จงใจไม่ให้เว็บ override accessibility preference ของผู้ใช้ — ผู้ใช้ควรปรับผ่านปุ่มขนาดฟอนต์ในแอป (`data-size`) แทน ดู [FB-2026-08-07](./agile/feedback/FB-2026-08-07-font-scaling.md) / [US-CF-45](./agile/user-stories/US-CF-45.md)

### Validated
- `tsc --noEmit` ผ่าน; `npm run build` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกันที่ `0.8.3`

**Bump rationale:** แก้บั๊กด้าน accessibility/layout (การขยายฟอนต์ระดับ OS) จึงอัปเดต PATCH `0.0.1` จาก `0.8.2` เป็น `0.8.3`

## [0.8.2] - 2026-08-13

### Added
- คลังคลิปบทเรียนแบบ local DB ที่ `src/data/videos.json` รองรับทั้งลิงก์ YouTube และไฟล์จาก S3/MinIO ให้ทีมเนื้อหาแก้ไฟล์เดียวโดยไม่ต้องแตะโค้ดหน้าจอ

### Changed
- คลิป `topic-1` ใช้ YouTube Shorts ใหม่ (`y5ii-ANYibk`) และเปิดเล่นใน Flow แล้ว (`skip: false`)

### Validated
- `tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกันที่ `0.8.2`
- unit tests ของตัวอ่านคลังคลิปผ่าน

**Bump rationale:** ผู้ใช้สั่งเพิ่ม PATCH `0.0.1` จาก `0.8.1` เป็น `0.8.2` หลังอัปเดตลิงก์ YouTube ของบทที่ 1

## [0.8.1] - 2026-08-07

### Fixed
- **Hotfix Event Logging / Connection Issue**: แก้ไขปัญหาการยิงและบันทึก Event Logs (`action_logs`) บนสภาพแวดล้อม CAMT Deployment (`https://ageconnect.camt.cmu.ac.th/`) โดยการเปลี่ยนค่า `DATABASE_URL` ให้ต่อผ่าน **Supabase IPv4 Connection Pooler** (`aws-0-ap-northeast-1.pooler.supabase.com:6543`) แก้ไขปัญหา `ENETUNREACH` บนเครือข่ายที่ไม่รองรับ IPv6 Outbound

### Improved
- **Offline Log Storage Cap**: ขยายโควตาการเก็บบันทึก Log ออฟไลน์สำรอง (`MAX_OFFLINE_LOGS`) ใน `localStorage` บนเครื่องของผู้ใช้จาก 100 รายการ เป็น **500 รายการต่อเครื่อง** เพื่อป้องกันข้อมูล Log สูญหายและรองรับการ Auto-sync อัตโนมัติเมื่อผู้ใช้เปิดหน้าเว็บ

### Validated
- `tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกันที่ `0.8.1`
- ทดสอบ Query ฐานข้อมูล Supabase ยืนยันข้อมูล Event Logs จากผู้เล่นเข้าสู่ระบบแบบ Real-time รวม 1,700+ รายการ

**Bump rationale:** การแก้ไข Hotfix ระบบเก็บบันทึก Log ฐานข้อมูลและการปรับปรุงระบบออฟไลน์สำรอง จึงทำการอัปเดตเวอร์ชันโปรเจกต์เป็น `0.8.1`

## [0.7.3+50ac6] - 2026-08-07

### Changed
- ข้ามคลิปแรกของ `topic-1` และนำผู้เล่นเข้าเกม G1 โดยตรง พร้อมบันทึกสถานะ video progress และ event logging ตาม flow เดิม
- เพิ่ม build metadata แบบสุ่ม `50ac6` เพื่อระบุ build นี้โดยไม่เปลี่ยนลำดับรุ่นจาก `0.7.3`

### Validated
- `tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกัน และผ่านรูปแบบ Semantic Versioning 2.0.0

**Version rationale:** ใช้ build metadata เป็น `0.7.3+50ac6` เพราะเป็นรหัสระบุ build ของฐานรุ่น `0.7.3` ไม่ใช่การออก PATCH release ใหม่

## [0.7.3] - 2026-08-07

### Changed
- ลดเวลานับถอยหลังปุ่ม "ถัดไป" หลังคลิปจบ (auto ไปเล่นเกม) จาก 15 วินาที เหลือ 5 วินาที
- Start Menu ใช้ข้อความ "รับชมคลิป" ให้ตรงกับหน้า intro วิดีโอ

### Removed
- ลบบรรทัดล่าง "กันเลย!" ออกจากการ์ดชื่อคลิป (`ClipTitleCard`) — มีผลทั้งหน้า intro วิดีโอและ Start Menu
- ลบแถบข้อความคำแนะนำ/ฟีดแบ็กด้านล่างในเกม G13 ("ลากซ้าย–ขวา รับไอติม...") พร้อมกลไก feedback/announce ทั้งหมด เพื่อคืนพื้นที่เล่นเกม

### Validated
- `npx tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกัน (บรรทัด 3 และ 9)

**Bump rationale:** รวมงานแก้ไข UI/พฤติกรรมเล็กน้อยแบบ backward-compatible จึงเพิ่ม **PATCH** จาก `0.7.2` เป็น `0.7.3` (คง MAJOR/MINOR) ตามนโยบาย pre-1.0

## [0.7.2] - 2026-08-07

### Fixed
- คลิปสั้นในบทเรียนไม่เล่นเองบางเครื่อง (มือถือบล็อก autoplay แบบมีเสียง) — เริ่มเล่นแบบปิดเสียงอัตโนมัติทั้ง MP4 และ YouTube (`mute:1`) เพื่อให้เล่นเองได้ทุกเครื่อง + เพิ่มปุ่ม "แตะเพื่อเปิดเสียง" ขนาดใหญ่กลางบนจอ; MP4 ลองเล่นแบบมีเสียงก่อน ถ้าถูกบล็อกจึง fallback เป็นปิดเสียง

### Validated
- `npx tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกัน (บรรทัด 3 และ 9)

**Bump rationale:** แก้บั๊ก autoplay แบบ backward-compatible จึงเพิ่ม **PATCH** จาก `0.7.1` เป็น `0.7.2` (คง MAJOR/MINOR) ตามนโยบาย pre-1.0

## [0.7.1] - 2026-08-06

### Fixed
- เกม G6 ไม่เริ่ม timer เปิดข้อความอยู่เบื้องหลังหน้า "วิธีเล่น" อีกต่อไป และรีเซ็ต timeline เมื่อกด "เริ่มเล่น" ทำให้ข้อความทยอยแสดงทีละฟองตามช่วงเวลา 2 วินาทีเสมอ

### Validated
- Browser regression: รอหน้า Intro 7 วินาทีแล้วกดเริ่มยังเห็นเพียงฟองแรก ปุ่มตอบยัง disabled และฟองที่สองแสดงหลังผ่านประมาณ 2 วินาที
- ตรวจ zero-scroll viewport ที่ 375×667, 390×844, 360×740 และ 667×375

**Bump rationale:** แก้พฤติกรรม timer ของ G6 โดยไม่เพิ่มฟังก์ชันใหม่ จึงเพิ่ม **PATCH** จาก `0.7.0` เป็น `0.7.1`

## [0.7.0] - 2026-08-06

### Added
- หน้า Completion ใหม่ที่ `/lessons/complete` สำหรับแสดงความยินดีหลังจบ G13 พร้อมข้อความ "เก่งมากท่านได้เรียนรู้ครบถ้วน" และปุ่ม "กลับไปหน้าหลัก" เพียงปุ่มเดียว (US-CF-42)

### Changed
- เปลี่ยนเส้นทางหลังจบ G13 จากการกลับ `/lessons` ทันที เป็นหน้า Completion ก่อนกลับหน้าหลัก
- แยกหน้า Completion ออกจาก learner chrome เพื่อไม่แสดง header, progress bar และ navigation drawer

### Validated
- ผ่าน TypeScript, production build, unit tests 19/19 และ lint ของหน้าใหม่
- ผ่าน browser QA แบบ zero-scroll ที่ 375×667, 390×844, 360×740 และ 667×375 พร้อมยืนยันการนำทางกลับ `/lessons`

**Bump rationale:** เพิ่มหน้าและ flow ใหม่ที่ผู้ใช้มองเห็นแบบ backward-compatible จึงเพิ่ม **MINOR** จาก `0.6.0` เป็น `0.7.0` และคง MAJOR `0` ตามนโยบาย pre-1.0

## 2026-08-06 (DOC — ปรับขอบเขต US-CF-42)
- **[DOC] `US-CF-42` และเอกสารที่เกี่ยวข้อง** — กำหนดให้หน้าจอยินดีหลังจบ G13 มี action เพียง 1 ปุ่ม คือ **"กลับไปหน้าหลัก"** และตัดตัวเลือก "เล่นทบทวน"/เริ่มเรียนใหม่ออกจาก Acceptance Criteria, Client Feedback และ Product Backlog
- **[DONE] `US-CF-42`** — เพิ่ม route `/lessons/complete` พร้อมหน้าชื่นชมแบบ zero-scroll, ซ่อน learner chrome เพื่อให้เหลือปุ่มเดียวใน accessibility tree, เชื่อมจบ G13 มายังหน้าใหม่ และตรวจ viewport มือถือ/แนวนอนพร้อมการนำทางกลับ `/lessons`

## 2026-08-06 (DOC — บันทึก Client Feedback รอบ 2026-08-06)
- **[NEW] `docs/agile/user-stories/US-CF-34.md` ถึง `US-CF-43.md`** — จัดทํา User Story รายการแก้ไขและพัฒนาระบบจากผลตอบรับของลูกค้าจำนวน 10 ข้อ (งานเว้นวรรค/คำผิด หน้า 1–3, ปรับข้อความและโจทย์ G1/G3/G6/G13, เพิ่มหน้าจอยินดีจบหลักสูตร, และตั้งค่า Link Preview)
- **[DOC] `docs/agile/01-product-backlog.md`** — บรรจุรายการ User Story หมวด Client Feedback รอบ 2026-08-06 (US-CF-34 ถึง 43) และอัปเดตเวอร์ชันเอกสารเป็น 1.7
- **[NEW] `docs/agile/feedback/FB-2026-08-06-client-feedback.md`** — บันทึกผลตอบรับและข้อเสนอแนะจากลูกค้า/ทีมงานประจำวันที่ 2026-08-06 จำนวน 10 ข้อ พร้อมตารางสรุปเชื่อมโยง User Story และรายการสิ่งที่ต้องทำถัดไป
- **[DOC] `docs/index.md`** — อัปเดตวันที่ล่าสุดและเชื่อมโยงเอกสาร Feedback ใหม่ในหมวด Agile Management
- **[NEW] `docs/agile/user-stories/US-CF-44.md`** — สร้าง User Story รองรับระบบเล่นวิดีโอสำรอง (MP4 Fallback & Direct Player) สำหรับบทเรียนในกรณีที่ลิงก์ YouTube ไม่สามารถใช้งานได้ พร้อมบรรจุใน `docs/agile/01-product-backlog.md`

## [0.6.0] - 2026-08-05

### Added
- เกม G3 (AI หรือ คน?): **ระบบสุ่มโจทย์** — สุ่ม 6 ข้อ/รอบจากคลัง 17 ข้อ คุมสัดส่วนภาพปลอม 3 / ภาพจริง 3 และสลับลำดับ (Fisher–Yates) สุ่มใหม่ทุกครั้งที่เริ่มเกม (US-GAME-03-R2)
- คลังโจทย์ G3 ใหม่ `src/data/g3-questions.json` (17 ข้อ: ภาพ AI 6 + ภาพตัดต่อ 1 + ภาพถ่ายจริง 10) เขียน claim/explanation/speakerText ใหม่ทั้งหมด โทนกลาง
- หน้าเฉลย G3 **บอกประเภทภาพปลอม**: ภาพ AI → "ทำไมภาพนี้ถึงเป็นภาพที่ AI สร้าง?", ภาพตัดต่อ → "ทำไมภาพนี้ถึงเป็นภาพตัดต่อ?" (อิง field `category`)
- คลังภาพต้นทาง `public/assets/g3-images/` (แยก `ai-generated/` `real-photo/` `edited-composite/` + README แม็ปไฟล์)

### Changed
- เกณฑ์ดาว G3 คิดเป็นสัดส่วน (`correct/total` → ≥0.9=3⭐, ≥0.6=2⭐) แทนการ hardcode เลข 6; progress bar อิง `questions.length`
- ย้ายคลังโจทย์ G3 จาก inline `const QUESTIONS` ใน `.jsx` → ไฟล์ JSON แยก; `game_complete` log เพิ่ม field `total`
- อัปเดตเวอร์ชันแอปและ lockfile จาก `0.5.0` เป็น `0.6.0`

### Validated
- `npx tsc --noEmit` ผ่าน; JSON valid; ไฟล์ภาพครบทุก path; จำลองสุ่ม 2000 รอบ = ไม่มีข้อซ้ำ, สมดุลปลอม 3/จริง 3 เสมอ, ข้อแรกกระจายครบ 17 ข้อ
- เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกัน (บรรทัด 3 และ 9) และผ่าน SemVer regex

**Bump rationale:** เพิ่มฟีเจอร์ใหม่ที่ผู้ใช้เห็น (ระบบสุ่มโจทย์ + คลังเนื้อหา G3 ใหม่) แบบ backward-compatible จึงเพิ่ม **MINOR** จาก `0.5.0` เป็น `0.6.0` และ reset PATCH เป็น `0` ตามนโยบาย pre-1.0 (คง MAJOR `0`)

## [0.5.0] - 2026-08-05

### Added
- เกม G6 (จำลองแชทไลน์): หน้าเฉลยหยุดตัวนับ auto-advance 30 วินาที เมื่อผู้ใช้แตะ/เลื่อนอ่านเนื้อหา แล้วนับต่อจากเวลาที่เหลือเมื่อปล่อย (US-UX-07 — เดิมมีเฉพาะ G1/G3)

### Changed
- แถบผลเฉลย G6 (คำชม/ยังไม่ปลอดภัย) เพิ่ม margin 15px ด้านบน/ซ้าย/ขวา (`mt-[15px] mx-[15px]`) ให้สอดคล้องกับ G3
- อัปเดตเวอร์ชันแอปและ lockfile จาก `0.4.0` เป็น `0.5.0`; เลขใน Menu Drawer เปลี่ยนตาม `package.json` โดยอัตโนมัติ

### Validated
- `npx tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกัน (บรรทัด 3 และ 9) และผ่าน SemVer regex

**Bump rationale:** เพิ่มพฤติกรรมใหม่ที่ผู้ใช้เห็น (ระบบหยุดเวลาหน้าเฉลย G6) แบบ backward-compatible จึงเพิ่ม **MINOR** จาก `0.4.0` เป็น `0.5.0` และ reset PATCH เป็น `0` ตามนโยบาย pre-1.0 (คง MAJOR `0`)

## [0.4.0] - 2026-08-05

### Added
- เพิ่ม `public/favicon.ico` เป็นไอคอนบนแท็บเบราว์เซอร์ (browser tab icon) ของแอป
- เพิ่ม `icons` ใน `metadata` (`src/app/layout.tsx`) ให้ Next.js สร้าง `<link rel="icon">` ชี้ไปยัง `/favicon.ico` ครอบคลุม icon / shortcut / apple-touch

### Changed
- นำ `public/favicon.svg` เดิมออก (ถูกแค่ precache ใน service worker แต่ไม่เคยถูกอ้างอิงเป็น favicon จริง)
- อัปเดตเวอร์ชันแอปและ lockfile จาก `0.3.1` เป็น `0.4.0`; เลขใน Menu Drawer เปลี่ยนตาม `package.json` โดยอัตโนมัติ

### Validated
- `npx tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกัน (บรรทัด 3 และ 9) และผ่าน SemVer regex

**Bump rationale:** เพิ่มองค์ประกอบ/ไฟล์ใหม่ (favicon) แบบ backward-compatible จึงเพิ่ม **MINOR** จาก `0.3.1` เป็น `0.4.0` และ reset PATCH เป็น `0` ตามนโยบาย pre-1.0 (คง MAJOR `0`)

## [0.3.1] - 2026-08-04

### Fixed
- แก้ Docker production build ที่หา `../../docs/wiki/design/_logo.jpg` ไม่พบ โดยคัดลอกโลโก้ไปยัง `public/assets/app-logo.jpg` และให้หน้า Landing โหลดผ่าน public URL `/assets/app-logo.jpg`

### Changed
- อัปเดตเวอร์ชันแอปและ lockfile จาก `0.3.0` เป็น `0.3.1`; เลขใน Menu Drawer เปลี่ยนตาม `package.json` โดยอัตโนมัติ
- สร้าง service worker ใหม่จาก production build เพื่อ precache `/assets/app-logo.jpg`

### Validated
- `DATABASE_URL=postgresql://build:build@localhost:5432/build npm run build` ผ่านครบ รวม Webpack compile, TypeScript, page-data collection และ static-page generation; ยืนยันว่าโลโก้อยู่ใน `public/assets/` ซึ่ง Dockerfile คัดลอกไปยัง production runner

**Bump rationale:** แก้ production build แบบ backward-compatible โดยไม่เพิ่มพฤติกรรมใหม่ จึงเพิ่ม **PATCH** จาก `0.3.0` เป็น `0.3.1`

## [0.3.0] - 2026-08-04

### Added
- แสดงโลโก้โครงการขนาดใหญ่บนหน้า Landing หลังโหลดเสร็จ โดยใช้ไฟล์ `docs/wiki/design/_logo.jpg` และกำหนดข้อความทดแทนสำหรับ accessibility

### Changed
- นำ badge และข้อความ `สำหรับวัยเก๋า & ผู้สูงอายุ` ออกจากหน้า Landing แล้วแทนด้วยโลโก้โครงการในกรอบสีหลัก พื้นโทนอ่อน มุมมน และเงาเบา โดยไม่เปลี่ยนหน้า loading หรือ flow การนำทาง
- อัปเดตเวอร์ชันแอปและ lockfile จาก `0.2.0` เป็น `0.3.0`; เลขใน Menu Drawer เปลี่ยนตาม `package.json` โดยอัตโนมัติ

### Validated
- `npx tsc --noEmit` ผ่าน; เวอร์ชันใน `package.json` และ `package-lock.json` ตรงกันและผ่าน SemVer regex

**Bump rationale:** เพิ่มองค์ประกอบ UI/branding ใหม่แบบ backward-compatible หลัง release `0.2.0` จึงเพิ่ม **MINOR** เป็น `0.3.0` ตามนโยบาย pre-1.0 ของโครงการ

## [0.2.0] - 2026-08-04

### Added
- แสดงเลขเวอร์ชันแอปจาก `package.json` ที่ด้านล่างสุดของ Menu Drawer เพื่อให้ผู้ใช้และทีม QA ตรวจสอบ build ที่กำลังใช้งานได้
- รวมฟังก์ชันใหม่ที่สะสมหลัง `0.1.0` ได้แก่ Flow การเรียนแบบวิดีโอ→เกม, ระบบ resume/progress, เกมและหน้า intro, client-feedback UI และเครื่องมือสนับสนุนการทดสอบ/ติดตั้ง

### Changed
- อัปเดตเวอร์ชันแอปใน `package.json` และ `package-lock.json` จาก `0.1.0` เป็น `0.2.0`

### Validated
- ตรวจพบ commit ประเภท `feat` 95 รายการ และรหัส User Story ใน Product Backlog 86 รหัส ณ วันที่ออกเวอร์ชัน; ใช้เป็นหลักฐานว่าชุดเปลี่ยนแปลงมี functionality ใหม่จำนวนมาก ไม่ใช่ bug fix อย่างเดียว

**Bump rationale:** เพิ่ม functionality ใหม่แบบ backward-compatible หลัง `0.1.0` จึงเพิ่ม **MINOR** เป็น `0.2.0` และ reset PATCH เป็น `0` ตาม SemVer; โครงการยังเป็น prototype จึงคง MAJOR `0`

## 2026-08-04 (CODE — US-CF-33 resume flow + ปุ่มจบ "บทเรียนถัดไป")
- **[CODE] `src/app/page.tsx`** ([US-CF-33](./agile/user-stories/US-CF-33.md)) — Landing "กดที่นี่เพื่อเริ่ม" ถ้าเล่น flow ค้างกลางคัน (บางบทแต่ไม่ครบ) → resume เข้าบทที่ค้างเลย (ข้าม Start Menu) แก้ปัญหาเห็นหน้าชื่อคลิปซ้ำ (topic-1 vs topic-3); fresh/ครบแล้ว → Start Menu เหมือนเดิม
- **[CODE] ปุ่มจบเกม G1/G3/G6** — `ไปบทถัดไป` → **`บทเรียนถัดไป`** (ปรับถ้อยคำ US-CF-32); G13 คง "เสร็จสิ้นบทเรียน"
- **[VERIFY]** `tsc`/lint ผ่าน

## 2026-08-04 (CODE — restore โลโก้ไลน์ G6 + ปุ่มจบตามตำแหน่ง flow + G6 เฉลย 30 วิ)
- **[FIX] `G6LineSimulation.jsx`** — merge ทับทำให้ `imageSrc` โลโก้ไลน์ (US-CF-31) หาย → เพิ่มกลับ `imageSrc="/assets/icon-game/line-icon.png"`
- **[CODE] ปุ่มจบเกมตามตำแหน่ง flow** ([US-CF-32](./agile/user-stories/US-CF-32.md) รอบ 2) — G1/G3/G6 = **"ไปบทถัดไป"** (ไม่ใช่เกมท้าย), G13 = **"เสร็จสิ้นบทเรียน"** (ปุ่ม "ไปต่อ"→); "เล่นอีกรอบ" คงไว้
- **[CODE] `G6LineSimulation.jsx`** — หน้าเฉลย auto-advance `delayMs={30000}` (30 วิ, เดิม default 5 วิ)
- **[VERIFY]** `tsc` ผ่าน

## 2026-08-04 (CODE — US-CF-27: ปรับ G13 ตาม feedback)
- **[CODE] `src/components/G13ScoopStacker.tsx`** ตาม [US-CF-27](./agile/user-stories/US-CF-27.md) — แก้ข้อความ `objective` ให้ระบุว่าเป็น "เกมฝึกสมอง", และเปลี่ยนลูกไอติมให้วาดจากภาพ sprite `public/assets/ice-cream/*.png`
- **[DOC]** อัปเดต `US-CF-27.md`, `01-product-backlog.md` และ `changelog.md` (ตรวจสอบแล้วว่าปุ่ม "เล่นอีกรอบ" ถูกตั้งค่าไว้ถูกต้องอยู่ก่อนแล้ว)
- **[VERIFY]** รอ browser QA

## 2026-08-04 (CODE — US-CF-26: ปรับ G6 จำลองแชทไลน์)
- **[CODE] `src/components/G6LineSimulation.jsx`** ตาม [US-CF-26](./agile/user-stories/US-CF-26.md) — ปรับชื่อเกมเป็น "จำลองแชทไลน์", เปลี่ยนคำว่า "LINE" ในเนื้อหาเป็น "ไลน์", ปิดหน้าสถานการณ์ intro ชั่วคราวด้วย flag `SHOW_SCENARIO_INTRO = false`, และปรับปุ่มจบเกมเป็น "ไปบทถัดไป"
- **[DOC]** อัปเดต `design-g6.md`, `US-CF-26.md`, `US-CF-09B.md`, `US-CF-16.md`, `02-sprint-planning.md` และ `index.md`
- **[VERIFY]** `npx tsc --noEmit` และ `npm run lint` ผ่านสะอาด

## 2026-08-04 (CODE — US-CF-32: ตัดหน้าสรุปคะแนนออกจาก flow + ปุ่ม "เสร็จสิ้นบทเรียน")
- **[CODE] `src/app/lessons/[id]/game/page.tsx`** ตาม [US-CF-32](./agile/user-stories/US-CF-32.md) — flow จบเกม **ข้ามหน้า summary** → ไปหน้าชื่อคลิปบทถัดไป (video intro) หรือ G13 เลย (re-import `nextFlowLessonAfterGame`); manual ยังมี summary เหมือนเดิม; ดาวยังบันทึกทุกกรณี — ปรับจาก [US-CF-24](./agile/user-stories/US-CF-24.md)
- **[CODE] ปุ่มจบบทเรียน** → `เสร็จสิ้นบทเรียน` ให้ตรงกัน: G1 (`ดูคะแนนสรุป`→) + G6 (`จบเกมและรับดาว`→); G3 ถูกอยู่แล้ว
- **[VERIFY]** `tsc` ผ่าน; ไม่มี lint error ใหม่; รอ browser QA

## 2026-08-04 (CODE — US-CF-25 item 1: G3 header โจทย์เป็นกรอบสั้น)
- **[CODE] `src/components/G3AIOrNot.jsx`** (หน้าโจทย์ `!isAnswered`) ตาม [US-CF-25](./agile/user-stories/US-CF-25.md) — ตัด "หัวข้อวิเคราะห์: [claim ยาว]" ออก เหลือ **"ภาพนี้เป็นภาพจริงหรือ เอไอ"** ในกรอบสีหลัก (banner: `bg-[var(--primary)]` ตัวขาว `rounded-[15px]` `py-2.5` — เตี้ยกว่าตัวอย่าง) ไม่กินที่
- **[NOTE] item 2 (เพิ่มภาพถ่ายจริง 1–2 รูป) รอ asset** — q2/q4/q6 ปัจจุบันเป็น `isAi:false` แต่ดูเป็น AI-gen
- **[VERIFY]** `tsc` ผ่าน; รอ browser QA

## 2026-08-04 (CODE — US-CF-31: ไอคอนจริงในกล่อง intro เกม)
- **[CODE] `src/components/GameIntro.tsx`** — เพิ่ม prop `imageSrc`/`imageAlt` แสดงรูปไอคอนในกล่องหัวเรื่องเดิม (override lucide icon)
- **[CODE] ใส่ไอคอนต่อเกม** ตาม [US-CF-31](./agile/user-stories/US-CF-31.md): G1 `g1-icon.png`, G3 `g3-icon.png` (AI-gen), **G6 `line-icon.png` (โลโก้ไลน์จริง)** จาก `public/assets/icon-game/`; G13 มี cone (mediaSlot) อยู่แล้ว
- **[VERIFY]** `tsc` ผ่าน; ไม่มี lint error ใหม่; รอ browser QA
- **[NOTE]** ไฟล์ icon (g1/g3 ~1.5–2MB) ใหญ่สำหรับกล่อง 96px — ควร optimize/ย่อภายหลัง (แยก task ได้)

## 2026-08-04 (CODE — US-CF-29: G1 render bold จริง + ลบ ":" หมวดข่าว)
- **[NEW] `src/components/RichText.jsx`** — แปลง markdown `**เน้น**`→`<strong>` เป็น React node (ปลอดภัย ไม่ใช้ dangerouslySetInnerHTML)
- **[CODE] `G1FactCheck.jsx`** — ใช้ `RichText` กับ `explanation` (หน้าเฉลย) → เห็นตัวหนาจริง ไม่มี `**` โผล่; ลบ ":" จากหมวดข่าว q3/q4 (`ข่าวสารสุขภาพ`/`ข่าวสารการเตือนภัย`)
- **[CODE] `NewsMessageView.jsx`** — ใช้ `RichText` กับ claim ทั้งสกิน LINE/SMS (รองรับ bold ในหน้าจำลองแชท)
- **[VERIFY]** `tsc`/lint ผ่าน; ไม่มี ":" หมวดข่าวเหลือ; รอ browser QA

## 2026-08-04 (CODE — US-CF-30: จัดหน้าชื่อคลิป (video intro) กึ่งกลางแบบ Start Menu)
- **[CODE] `src/app/lessons/[id]/video/page.tsx`** (phase `intro`) ตาม [US-CF-30](./agile/user-stories/US-CF-30.md) — เปลี่ยนจาก `content-area my-auto` + ปุ่ม `mt-auto` (ชิดล่าง มีช่องว่างใหญ่) เป็น `screen-container justify-center` + ClipTitleCard + ปุ่ม "ดูคลิป" อยู่ใต้ข้อความทันที (จัดกลุ่มกึ่งกลางแบบ Start Menu)
- **[VERIFY]** `tsc` ผ่าน; ไม่มี lint error ใหม่; รอ browser QA

## 2026-08-04 (DOCS — feedback ต่อเนื่อง: US-CF-29/30/31)
- **[NEW] 3 task docs** (ML-2026-08-04 #14–17):
  - [US-CF-29](./agile/user-stories/US-CF-29.md) — G1 render `**bold**`→ตัวหนาจริง + ลบ ":" จากหมวดข่าว
  - [US-CF-30](./agile/user-stories/US-CF-30.md) — จัด layout หน้าชื่อคลิป (video intro) กึ่งกลางแบบ Start Menu
  - [US-CF-31](./agile/user-stories/US-CF-31.md) — หน้า intro เกม ใส่ไอคอนจริง (AI-gen ต่อเกม / โลโก้ไลน์ G6) แทน "?"
- ลงทะเบียนใน backlog + เพิ่มแถว #14–17 ใน [ML-2026-08-04](./agile/meeting-log/ML-2026-08-04-client-feedback.md); docs อย่างเดียว ยังไม่แตะโค้ด

## 2026-08-04 (CODE — US-CF-24: G1 วิธีเล่น/หมวดข่าว + flow หน้าคะแนน→หน้าชื่อคลิป)
- **[CODE] `src/components/G1FactCheck.jsx`** — objective วิธีเล่น → "ลองอ่านข้อความต่อไปนี้ แล้วพิจารณาว่าจริงหรือไม่"; claim ข้อน้ำมะนาวโซดา prefix `ข่าวสารการเตือนภัย:`→`ข่าวสารสุขภาพ:` (q4 พายุฝนคงไว้—เป็นการเตือนภัยจริง)
- **[CODE] flow หลังจบเกม (item 3)** ตาม [US-CF-24](./agile/user-stories/US-CF-24.md):
  - `src/app/lessons/[id]/game/page.tsx` — flow จบเกม → ไปหน้า **summary (ดาว)** เสมอ (เดิมไปคลิปตรง)
  - `src/app/lessons/[id]/summary/page.tsx` — แก้ flow-next ให้ใช้ `flow.ts` (G1→topic-3, G3→topic-6, G6→G13); ปุ่ม "ดูคลิปบทถัดไป"/"ไปเล่นเกมฝึกสมอง"
  - `src/app/lessons/[id]/video/page.tsx` — เพิ่ม phase **"intro"** หน้าชื่อคลิป (flow + topic-3/topic-6): "รับชมคลิป / [ชื่อ] / กันเลย!" + ปุ่ม "ดูคลิป" (auto 15 วิ); ชื่อคลิป topic-3="ทำไมคนถึงเชื่อข่าวปลอม", topic-6="เชื่อได้หรือไม่"
  - **[NEW] `src/components/ClipTitleCard.tsx`** — component ชื่อคลิป 3 บรรทัด ใช้ร่วม Start Menu (US-CF-22) + video intro
- **[VERIFY]** `tsc` ผ่าน; unit 19/19 ผ่าน; ไม่มี lint error ใหม่; รอ browser QA

## 2026-08-04 (CODE — US-CF-23: จังหวัด "อื่นๆ" + ช่วงอายุ "อื่นๆ" ในหน้ากรอกข้อมูล)
- **[CODE] `src/app/consent/page.tsx`** ตาม [US-CF-23](./agile/user-stories/US-CF-23.md) — เพิ่ม option `อื่นๆ` ท้าย dropdown จังหวัด; เมื่อเลือก "อื่นๆ" auto-set อำเภอ/ตำบล=`อื่นๆ` (ผ่าน `.min(1)` ใน schema) + **ซ่อน dropdown อำเภอ/ตำบล** (ไม่มี detail เพิ่ม); สรุปพื้นที่แสดง "พื้นที่: อื่นๆ"
- **[CODE] ช่วงอายุ "อื่นๆ"** — เพิ่ม option `{ label: "อื่นๆ", value: "other" }` + เพิ่ม `"other"` ใน `z.enum` ของ `ageGroup` (`src/lib/validations.ts`) เพื่อรองรับผู้เล่นอายุอื่น
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; unit tests 7/7 ผ่าน; ไม่มี lint error ใหม่; รอ browser QA

## 2026-08-04 (DOCS — แยกตาราง Client Feedback รอบ 2026-08-04)
- **[REORG] `01-product-backlog.md`** — ย้าย US-CF-21..28 ออกจากตาราง "Sprint 08" ไปเป็น section/ตารางใหม่ **"Client Feedback — รอบ 2026-08-04"** (คนละวันกับรอบ 2026-07-31 = US-CF-01..20) คง US-UX-08 ไว้ใน Sprint 08
- **[NEW] `02-sprint-planning.md`** — เพิ่ม section/ตาราง **"Client Feedback รอบ 2026-08-04 (task list)"** (US-CF-23..28 งานเร่งก่อนงานแพร่ 17–18 ส.ค.)

## 2026-08-04 (DOCS — US-CF-28: คำกลางทั้งแอป (ลบ "วัยเก๋า" + ตัด ครับ/ค่ะ/คะ))
- **[NEW] [US-CF-28](./agile/user-stories/US-CF-28.md)** — task copy sweep: ลบ "วัยเก๋า" ทุกที่ (19 จุด; live 5 ไฟล์: `app/layout.tsx`, `AppLayout.tsx`, `app/page.tsx`, `app/consent/page.tsx`, `app/certificate/page.tsx`; อีก 4 component เป็น dead) + ตัดคำลงท้าย ครับ/ค่ะ/คะ (ครับ ~66, ค่ะ ~166 บรรทัด) โดยเลี่ยง false positive `คะแนน`
- **[SCOPE ยืนยัน 2026-08-04]** ตัดคำลงท้าย **ทุกที่ = UI + TTS (speaker text) + JSON เกม**; docs อย่างเดียว ยังไม่แตะโค้ด รอสั่ง implement
- ลงทะเบียนใน [product-backlog](./agile/01-product-backlog.md)

## 2026-08-04 (DOCS — Client Feedback รอบ 2026-08-04: US-CF-23..27)
- **[NEW] `docs/agile/meeting-log/ML-2026-08-04-client-feedback.md`** — บันทึกผลตอบรับ 13 ข้อ (หน้ากรอกข้อมูล + G1/G3/G6/G13) พร้อมตารางสรุป
- **[NEW] แตกเป็น 5 task docs:**
  - [US-CF-23](./agile/user-stories/US-CF-23.md) — consent: เพิ่มจังหวัด "อื่นๆ"
  - [US-CF-24](./agile/user-stories/US-CF-24.md) — G1: วิธีเล่น + หมวดข่าว + ปุ่มข้อสุดท้าย
  - [US-CF-25](./agile/user-stories/US-CF-25.md) — G3: ลด header โจทย์ + เพิ่มภาพจริง
  - [US-CF-26](./agile/user-stories/US-CF-26.md) — G6: ชื่อ "จำลองแชทไลน์" + "ไลน์" + ตัดหน้าสถานการณ์ + ปุ่มจบ
  - [US-CF-27](./agile/user-stories/US-CF-27.md) — G13: ป้าย "เกมฝึกสมอง" + ปุ่ม "เล่นอีกรอบ" + sprite ไอติม (`public/assets/ice-cream/`)
- **[NOTE]** ยังเป็น docs อย่างเดียว (🔴 To Do) รอสั่ง implement ทีละอัน; บางข้อรอยืนยันทิศทาง (G1 ปุ่มคะแนน, G6 ปุ่มจบ) และ asset (G3 ภาพจริง)
- ลงทะเบียนใน [product-backlog](./agile/01-product-backlog.md)

## 2026-08-04 (CODE — US-CF-22: จัดข้อความหน้าเริ่ม Flow ชวนดูคลิปแรก 3 บรรทัด)
- **[CODE] `src/app/lessons/page.tsx`** (บล็อก `activeSubPage === "modes"`) ตาม [US-CF-22](./agile/user-stories/US-CF-22.md) — ลบ badge `รู้ทันสื่อวัยเก๋า` + หัวข้อ `พร้อมเริ่มเรียนรู้หรือยัง?` + คำอธิบายเดิม แล้วจัดข้อความชวนดูคลิป 3 บรรทัดตาม design ทีม: `พร้อมแล้วไปดูคลิป` (24px) / `"ใครๆก็ทำสื่อได้"` (34px extrabold) / `กันเลย!` (24px) จัดกึ่งกลาง + ปุ่ม `เริ่มเล่น` เดิม (ไม่แตะ logic)
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; รอ browser QA

## 2026-08-04 (CODE — US-UX-08: แสดงคำขวัญ "หยุด คิด ถาม ทำ" บนหน้าแรก)
- **[CODE] `src/app/page.tsx`** ตาม [US-UX-08](./agile/user-stories/US-UX-08.md) — เพิ่ม tagline `หยุด · คิด · ถาม · ทำ` (ตัวหนา 26px สี `--primary-dark`) + ไอคอน `ShieldCheck` ใต้หัวข้อรอง; นำคำขวัญหลักจาก [gdd/02-narrative.md](./gdd/02-narrative.md) มาแสดง; ไม่แตะ badge (สงวนให้โลโก้)
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; รอ browser QA

## 2026-08-04 (CODE — US-CF-21: ปรับข้อความ/ปุ่มหน้าแรก Landing)
- **[CODE] `src/app/page.tsx`** ตาม [US-CF-21](./agile/user-stories/US-CF-21.md) — H1 `รู้ทันสื่อ Interactive`→`รู้ทันสื่อ`; H2 →`เรียนรู้ความปลอดภัยออนไลน์ด้วยตัวคุณเอง`; ย่อหน้าแนะนำกระชับขึ้น (ตัด "ครับ!", "คุณพ่อคุณแม่และวัยเก๋า"→"ทุกท่าน", "สแกมเมอร์"→"พวกมิจฉาชีพ"); ปุ่ม `เริ่มต้นเรียนรู้`→`กดที่นี่เพื่อเริ่ม`
- **[SKIP] badge "สำหรับวัยเก๋า & ผู้สูงอายุ" → โลโก้** — ยังไม่ทำ รอ asset โลโก้จริง (เปิด follow-up เมื่อได้ไฟล์)
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; รอ browser QA

## 2026-08-04 (CODE — US-UX-07: หน้าเฉลย auto-advance 30 วิ + หยุดนับตอนแตะ/เลื่อน)
- **[CODE] `src/components/AutoAdvanceButton.jsx`** — เพิ่ม prop `paused`; เปลี่ยนตัวนับให้เก็บ "เวลาที่เหลือ" (`remainingRef`) ข้ามช่วง pause/resume แทน `setTimeout` ก้อนเดียว; แถบ progress ใช้ `animationPlayState` หยุดค้างเมื่อ paused
- **[CODE] `src/components/CustomScrollArea.jsx`** — เพิ่ม prop `onActiveChange(active)`; ตรวจ pointer/touch/scroll/wheel → active ตอนโต้ตอบ, กลับ false เมื่อปล่อยนิ้ว+นิ่งเกิน 700ms
- **[CODE] `G1FactCheck.jsx` / `G3AIOrNot.jsx`** — state `autoPaused` (reset ทุกโจทย์), ส่ง `onActiveChange` ให้ `CustomScrollArea` หน้าเฉลย + `delayMs={30000} paused` ให้ `AutoAdvanceButton` ตาม [US-UX-07](./agile/user-stories/US-UX-07.md)
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; รอ browser QA

## 2026-08-03 (CODE — US-CF-09B: แยกหัวข้อสถานการณ์ G6 เป็น 2 บรรทัด)
- **[CODE] `src/components/G6LineSimulation.jsx`** ตาม [US-CF-09B](./agile/user-stories/US-CF-09B.md) — ในหน้าแสดงโจทย์ (เฟส `!introDone`) split `scenario.title` ที่ ": " เป็น `scenarioLabel` ("สถานการณ์ที่ N") + `scenarioTitleText` (ชื่อเรื่อง) แล้ว render 2 บรรทัด; มี fallback บรรทัดเดียวถ้าไม่มี ": "
- **[NOTE] แก้ความเข้าใจ**: US-CF-09B คือ **หน้าแสดงโจทย์/สถานการณ์** ไม่ใช่ how-to-play intro (ปรับชื่อ/บริบทใน doc ให้ตรง)
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; ไม่เพิ่ม lint issue จากบรรทัดที่แก้ (lint errors เดิมใน G6 มาจาก commit ทีม `1c843ca` US-CF-12 — unescaped `"`, impure render)

## 2026-08-03 (CODE — US-UX-06: padding หัวข้อ+คำอธิบายโจทย์ G3)
- **[CODE] เพิ่ม `pt-[15px] px-[15px]`** ให้ `<div text-left shrink-0>` (หัวข้อ "หัวข้อวิเคราะห์:" + claim) ในหน้าโจทย์ G3 (`G3AIOrNot.jsx`, branch `!isAnswered`) ตาม [US-UX-06](./agile/user-stories/US-UX-06.md) — เนื้อหาไม่ชิดขอบ, ไม่ใส่ padding ล่าง
- **[VERIFY]** `tsc` ผ่าน; รอ browser QA

## 2026-08-03 (CODE — US-FLOW-02: progress bar flow-aware + ต่อโจทย์)
- **[CODE] `AppLayout.tsx`: รื้อ `getProgressPercentage` เป็น flow-aware** — เพิ่ม `FLOW_STEP_ORDER` (video/game×topic-1/3/6 + g13) + `flowStepIndex()`; base ตามตำแหน่งจริงในลำดับ → **monotonic ไม่ถอยหลัง** (แก้บั๊ก game→คลิปบทถัดไปที่เคยลด 66%→55%); onboarding/certificate เป็นค่าคงที่
- **[CODE] event bridge ต่อโจทย์** — เกมยิง `window` CustomEvent `flowStepProgress` (0..1) เมื่อไปโจทย์ถัดไป, AppLayout ฟัง → `setStepFraction` interpolate ในสไลซ์ของสเตป, รีเซ็ตเมื่อเปลี่ยน pathname; G1/G3/G6 ยิง `currentIdx/total`, G13 ยิงตาม timer (สเตปปิดท้ายไต่ ~100%)
- **[VERIFY]** `tsc` ผ่าน; unit tests 13 ผ่าน; ค่า monotonic 22→33→44→55→66→78→89→100; set-state-in-effect เป็นหนี้เดิม (effect นี้มี setSession/setTheme อยู่แล้ว, US-DEBT-01)

## 2026-08-03 (TASK — US-FLOW-02: รื้อระบบนับ progress)
- **[TASK] เพิ่ม [US-FLOW-02](./agile/user-stories/US-FLOW-02.md)** — progress bar ปัจจุบัน (`AppLayout.getProgressPercentage`) คิดจาก route ล้วน ๆ จึง (1) **ค้าง** ตอนอยู่ใน `/game`, และ (2) **ถอยหลัง** ในสาย video-first (`game` idx5 → `video` บทถัดไป idx4 = 66.6%→55.6%)
- **[GOAL] progress เดินหน้าตาม flow position** (คลิป→เกม→…→G13) แบบ monotonic (ไม่ถอยหลัง), ขยับเมื่อไปสเตปถัดไป, ถึง ~100% ตอนจบ; แนวทาง: map `FLOW_SEQUENCE`+`currentLessonId`+`currentStep` เป็น step index + กันถอยด้วย `Math.max(prev, computed)`
- **[SYNC]** ลงทะเบียนใน Product Backlog (Sprint 08) + Project Index; ยังไม่แตะโค้ด (task ใหม่ รอเริ่ม)

## 2026-08-03 (CODE — US-CF-03B: polish Intro (font + scroll) + กฏ AGENT.md)
- **[CODE] `src/components/GameIntro.tsx`** ตาม [US-CF-03B](./agile/user-stories/US-CF-03B.md) — ขยายฟอนต์ "วิธีเล่น" จาก `clamp(14,·,17)` เป็น `clamp(18,·,22)` (max ≥20px ตามเกณฑ์ผู้สูงอายุ); ยก min ของ objective/instructions เป็น 18px
- **[FIX] intro scroll ได้** — restructure เป็น `overflow-y-auto` + inner `min-h-full` → จอสูงพอจัดกึ่งกลาง, จอเตี้ยเลื่อนได้ ไม่โดนบีบจน UI พัง (กระทบทุกเกมที่ใช้ GameIntro: G1/G3/G6/G13)
- **[UI] ปุ่มเริ่มเล่น dock ชิดล่าง** — ย้ายปุ่มออกจากพื้นที่ scroll มาเป็นปุ่มเต็มความกว้างชิดล่าง (`btn w-full min-h-[100px] rounded-t-[25px] rounded-b-none text-[26px]`) สไตล์เดียวกับปุ่มหน้าอื่น
- **[RULE] เพิ่ม 2 กฏใน [AGENT.md](./AGENT.md)** (Design Tokens & Accessibility): (ก) ห้ามตัวหนังสือเล็ก — ≥20px ใช้กับทุก label/eyebrow/caption ไม่ใช่แค่ body, clamp max ต้อง ≥20px; (ข) ทุกหน้า/content ใหม่ต้อง scroll ได้ (`overflow-y-auto`+`min-h-full`) ห้าม layout บีบตายตัว
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; eslint GameIntro สะอาด; รอ browser QA จอเตี้ย

## 2026-08-03 (DOC — เพิ่ม User Stories CF-16 ถึง CF-20 จาก Client Feedback เพิ่มเติม)
- **[DOC] เพิ่ม 5 User Stories ใหม่ใน [Product Backlog](./agile/01-product-backlog.md) → Client Feedback** จากข้อเสนอแนะเพิ่มเติม 2026-08-03:
    - [US-CF-16](./agile/user-stories/US-CF-16.md) — G6: แยก "สถานการณ์" ออกจากชื่อเหตุการณ์
    - [US-CF-17](./agile/user-stories/US-CF-17.md) — G13: จำกัดแสดงไอศกรีมซ้อนสูงสุด 4 ลูก
    - [US-CF-18](./agile/user-stories/US-CF-18.md) — G13: เพิ่มไอศกรีมลูกที่ 2 เมื่อคะแนนถึง ~10
    - [US-CF-19](./agile/user-stories/US-CF-19.md) — G13: ไอติมคู่พิเศษ (double scoop) ให้ ×2 คะแนน
    - [US-CF-20](./agile/user-stories/US-CF-20.md) — G13: เปลี่ยนจาก touch-to-move เป็น drag-to-move
- **[DOC] Version bump** 1.5 → 1.6

## 2026-08-03 (CODE — US-CF-01B: Navigation drawer)
- **[CODE] เพิ่ม navigation drawer ใน `src/components/AppLayout.tsx`** ตาม [US-CF-01B](./agile/user-stories/US-CF-01B.md) — ปุ่ม ☰ (Menu) มุมซ้ายของ header เปิดเมนูสไลด์จากซ้าย + overlay dim (สไตล์ Google Drive ตามภาพทีม)
- **[CODE] ย้ายปุ่มรีเซ็ตเข้า drawer + เพิ่ม "ไปหน้าแรก"** — drawer มี 2 รายการ: "ไปหน้าแรก" (`router.push("/")` + log `nav_home_from_drawer`) และ "รีเซ็ตข้อมูล" (`handleResetAll` เดิม); **ไม่มีปุ่มปรับ font** (ตาม US-CF-01)
- **[UX] เปิด/ปิด**: overlay แตะปิด + ปุ่ม X; `transition-transform` สไลด์; ปุ่มเมนู `min-h-14`; z-50 เหนือ header; drawer อยู่ใน main return จึงไม่โผล่ใน `/dev`, `/facilitator`
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; eslint ไม่มี issue ใหม่ (คงหนี้เดิม theme/session unused, any, set-state-in-effect); รอ browser QA

## 2026-08-03 (CODE — US-CF-08: G1 โจทย์เป็นข้อความแชท LINE/SMS)
- **[CODE] สร้าง `src/components/NewsMessageView.jsx`** ตาม [US-CF-08](./agile/user-stories/US-CF-08.md) (client feedback #8) — แสดงโจทย์ข่าวเป็นข้อความเข้าในแอปแชทจริง 2 skin: **LINE** (พื้นครีมลายจุด/ฟองขาว แบบ G6) และ **SMS** (Google Messages ของ Android — header back+avatar+ไอคอน, ฟองเทาชิดซ้าย); แต่ละ skin มี avatar, ชื่อ/เบอร์ผู้ส่ง, timestamp + footer แจ้ง "หน้าจอจำลอง"
- **[DECISION] สุ่มสกิน LINE/SMS ต่อโจทย์** (ทีมเลือก 2026-08-03) — deterministic จาก question id (`channelForId`) ให้ได้ mix ทั้งสองแบบ, ไม่ flicker, และเป็น pure function (เลี่ยง Math.random ใน render ที่ผิดกฎ react)
- **[CODE] G1 render `<NewsMessageView>` แทน news card เดิม** ในสถานะโจทย์ — ไม่แตะ logic ตอบ/เฉลย/analytics
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; eslint สะอาด (0 issue) ทั้ง NewsMessageView + G1; รอ browser QA พอดีจอ mobile portrait

## 2026-08-03 (DOC — sync สถานะ client feedback ใน meeting-log)
- **[DOC] อัปเดตตาราง "รายการสิ่งที่ต้องดำเนินการ" ใน [ML-2026-07-31](./agile/meeting-log/ML-2026-07-31-client-feedback.md)** — #1 (`f567555`), #2 (`ed33259`), #3 (`ecccb48`), #6 (`bb3d694`), #7 (`aecd57e`) เป็น 🟢 Done code (รอ browser QA); #4 Done อยู่แล้ว (`8ba7c77`)
- **[DOC] ปรับ status line ด้านบน** เป็น 🟡 กำลังดำเนินการ (เสร็จโค้ด 6/15) + ลิงก์ task ต่อยอด US-CF-01B / US-CF-09B

## 2026-08-03 (CODE — US-CF-07: รื้อ Flow กลับเป็น video-first)
- **[CODE] รื้อสาย Flow กลับเป็น "คลิป→เกม"** ตาม [US-CF-07](./agile/user-stories/US-CF-07.md) (client feedback #7) กลับทิศจาก game-first (`863895c`):
  - `src/lib/flow.ts`: rename `nextFlowGameAfterVideo` → `nextFlowLessonAfterGame` (advance ลำดับหลัง "เกม" จบ) + แก้ doc comment เป็น video-first
  - `lessons/page.tsx`: entry Flow → `currentStep:"video"` + `/lessons/{first}/video`
  - `game/page.tsx`: หลังเกมจบ (flow) → คลิปบทถัดไป (`nextFlowLessonAfterGame`) หรือ `/lessons/flow-g13/game` ถ้าเป็นบทสุดท้าย
  - `video/page.tsx`: หลังคลิปจบ → เกมบทเดียวกัน (ทั้ง flow/manual); ลบ import flow ที่ไม่ใช้; ปรับ label ปุ่ม ("ไปเล่นเกม")
- **[SYNC] US-FLOW-01 → 🔨 โค้ด video-first เสร็จ** (รวม G13→Start Menu จาก US-CF-06); ลำดับสุดท้าย: คลิป(topic-1)→G1→คลิป(topic-3)→G3→คลิป(topic-6)→G6→G13→Start Menu
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; unit tests 13 ผ่าน (vitest); ไม่มี lint issue ใหม่ (คงหนี้เดิมของ page files — US-DEBT-01); รอ browser QA เดินสายเต็ม + resume + ยืนยัน Manual

## 2026-08-03 (TASK — US-CF-09B: แยกหัวข้อสถานการณ์ G6 เป็น 2 บรรทัด)
- **[TASK] เพิ่ม [US-CF-09B](./agile/user-stories/US-CF-09B.md)** (จอเดียวกับ [US-CF-09](./agile/user-stories/US-CF-09.md)) — หน้า intro สถานการณ์ของ G6 แยกหัวข้อจากบรรทัดเดียว `"สถานการณ์ที่ N: <ชื่อเรื่อง>"` เป็น 2 บรรทัด (ป้ายลำดับ + ชื่อเรื่อง) ตามภาพ before/after จากทีม
- **[SYNC]** ลงทะเบียนใน Product Backlog (บล็อก Client Feedback) และ Project Index; ยังไม่แตะโค้ด (task ใหม่ รอเริ่ม)

## 2026-08-03 (CODE — US-CF-06: จบ G13 → กลับ Start Menu)
- **[CODE] เปลี่ยนปลายทางหลังจบ G13** ใน `src/app/lessons/[id]/game/page.tsx` (branch `FLOW_G13_ID`) ตาม [US-CF-06](./agile/user-stories/US-CF-06.md) (client feedback #6) — จาก `router.push("/posttest")` → `router.push("/lessons")` (Start Menu ที่มีปุ่ม Play) พร้อม `saveProgress({ currentStep:"lessons", currentLessonId:undefined })`
- **[NOTE] posttest ถูกถอดออกจากปลาย Flow** → `/posttest` unreachable ผ่าน Flow; ทีมต้องตัดสินว่าจะย้าย/เก็บ posttest ไว้จุดใด (บันทึกใน US-CF-06 + US-FLOW-01)
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; eslint ไม่มี issue ใหม่ (คงหนี้เดิม set-state-in-effect); รอ browser QA end-to-end

## 2026-08-03 (CODE — US-CF-03: หน้าแนะนำก่อนเริ่มเกม (Intro Panel))
- **[CODE] สร้าง shared component `src/components/GameIntro.tsx`** ตาม [US-CF-03](./agile/user-stories/US-CF-03.md) (client feedback #3) — หน้าแนะนำ: ชื่อเกม + วัตถุประสงค์ 1 บรรทัด + กริดวิธีเล่น (ไอคอน+ข้อความ) + ปุ่ม "เริ่มเล่น"; props ยืดหยุ่น (icon/mediaSlot, container/startButton className) ออกแบบพอดีจอเดียวตามเกณฑ์ผู้สูงอายุ
- **[CODE] ใส่หน้าแนะนำใน G1/G3/G6** — G1/G3 เพิ่ม phase `showIntro` นำหน้าโจทย์แรก; G6 เพิ่ม phase `showHowTo` (how-to-play ระดับเกม) นำหน้า scenario intro เดิม; ทุกเกม log `game_intro_start`
- **[REFACTOR] G13 ใช้ GameIntro แทน tutorial เดิม + แก้เนื้อหา** — เปลี่ยนชื่อเป็น "ต่อไอติมรู้ทันสื่อ" + objective เชิงชวนเล่น; คงธีมแอมเบอร์ผ่าน `containerClassName`/`startButtonClassName` และรูปกรวยผ่าน `mediaSlot` (การขัดเกลา copy สร้างแรงจูงใจเพิ่มยังอยู่ใน US-CF-13)
- **[DECISION] แสดงหน้าแนะนำทุกครั้งที่เปิดเกม** (per-game, ไม่ใช้ localStorage flag) — ตอบ open question ของ US-CF-03
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; eslint 5 warnings เป็นหนี้เดิมทั้งหมด (`<img>` G3, `RESPONSE_*` unused G6) ไม่มี issue ใหม่; รอ browser QA พอดีจอ (AC #5)

## 2026-08-03 (CODE — US-CF-02: Start Menu เหลือปุ่ม Play เดียว)
- **[CODE] ซ่อนโหมด Manual + เปลี่ยนปุ่ม Auto Flow เป็นปุ่ม Play** ใน `src/app/lessons/page.tsx` ตาม [US-CF-02](./agile/user-stories/US-CF-02.md) (client feedback #2) — เพิ่ม flag `SHOW_MANUAL_MODE = false` (soft-hide, ไม่ลบโค้ด), ปุ่ม Flow กลายเป็นปุ่ม "เริ่มเล่น" + ไอคอน `Play` ปุ่มเดียวกลางจอ, ปรับ heading เป็น "พร้อมเริ่มเรียนรู้หรือยัง?"
- **[GUARD] mount logic ก็ gate ด้วย `SHOW_MANUAL_MODE`** — ผู้ใช้ที่มี cookie `learningMode=manual` เดิมจะไม่หลุดไปหน้า lessons list อีก แต่เข้า Start Menu (Play) เสมอ
- **[KEEP] ไม่แตะ `handleStartFlowMode`** (ข้อกำหนด: ห้ามเปลี่ยน behavior ของ Auto Flow) — หมายเหตุ: ปัจจุบันยัง game-first ตาม `863895c`, การรื้อกลับเป็น video-first เป็นงานของ [US-FLOW-01](./agile/user-stories/US-FLOW-01.md)
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; `eslint lessons/page.tsx` ไม่มี issue ใหม่ (คงหนี้เดิม: `useState<any>`, set-state-in-effect — US-DEBT-01); รอ browser QA (AC #4)

## 2026-08-03 (TASK — US-CF-01B: Menu Drawer + ปุ่มไปหน้าแรก)
- **[TASK] เพิ่ม [US-CF-01B](./agile/user-stories/US-CF-01B.md)** (ต่อยอด [US-CF-01](./agile/user-stories/US-CF-01.md)) — ย้าย action ใน header (ปุ่มรีเซ็ต) เข้า **menu drawer** + เพิ่มปุ่ม **"ไปหน้าแรก"** → Start Menu / Landing (`/`)
- **[CONSTRAINT] ไม่นำปุ่มปรับขนาด font (ก/ก+/ก++) กลับมา** — ทีมยืนยันไม่ต้องการให้ปรับขนาด font ได้อีก; "action เดิมบนแท็บปรับขนาด UI" ที่ย้ายเข้า drawer = ปุ่มรีเซ็ต ไม่รวม font
- **[SYNC]** ลงทะเบียนใน Product Backlog (บล็อก Client Feedback) และ Project Index; ยังไม่แตะโค้ด (task ใหม่ รอเริ่ม)

## 2026-08-03 (CODE — US-CF-01: ลบแท็บปรับขนาด UI)
- **[CODE] ลบ UI ปุ่มปรับขนาดตัวอักษร (ก/ก+/ก++) ออกจาก header** ใน `src/components/AppLayout.tsx` ตาม [US-CF-01](./agile/user-stories/US-CF-01.md) (client feedback #1) — ลบ state `size`, handler `changeSize`, และ `initialSize` ออกจาก destructure เพื่อไม่ให้เกิด unused-var; ปุ่มรีเซ็ต + header คงเดิม
- **[KEEP] คงกลไก font-size เบื้องหลัง** (AC #3) — `layout.tsx` ยังอ่าน cookie `naplab_ml_size` → `data-size`, สเกลใน `globals.css` ไม่แตะ; หากต้องเปิด UI ใหม่คืนปุ่มที่ comment ไว้ใน header
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; `eslint AppLayout.tsx` ไม่มี issue ใหม่ (คงหนี้เดิม: theme/session unused, `any`, set-state-in-effect — อยู่ใน US-DEBT-01); รอ browser QA ยืนยัน layout (AC #2)

## 2026-08-03 (DECISION — Client feedback 2026-07-31: กลับ Flow เป็น video-first + G13→Start Menu)
- **[DECISION] รับ client feedback [ML-2026-07-31](./agile/meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #6, #7** — Flow เรียนต่อเนื่องกลับเป็น **วิดีโอนำ→เกม** (คลิป→G1→คลิป→G3→คลิป→G6) และ **จบ G13 → กลับ Start Menu** (ไม่ไป posttest) → กลับทิศ [US-FLOW-01](./agile/user-stories/US-FLOW-01.md) commit `863895c` ที่เป็น game-first + posttest
- **[DOC] เขียน [US-FLOW-01](./agile/user-stories/US-FLOW-01.md) ใหม่เป็น v2.0** — flow diagram/AC/technical tasks เป็น video-first; ปิด Open Question ปลาย G13 (= Start Menu); ระบุชัดว่าโค้ด `863895c` ต้องรื้อกลับ; สถานะ 🔁 REVISED (ยัง mark done ไม่ได้ตาม AGENT ข้อ 1)
- **[DOC] เพิ่มหมายเหตุ Override ใน [US-CF-06](./agile/user-stories/US-CF-06.md) (ถอด posttest ปลาย Flow) และ [US-CF-07](./agile/user-stories/US-CF-07.md) (video-first แทน game-first)**
- **[SYNC] [Product Backlog](./agile/01-product-backlog.md)** — แก้แถว US-FLOW-01 (AC + สถานะ 🔁 REVISED); **sync สถานะ US-CF-04 ใน [ML-2026-07-31](./agile/meeting-log/ML-2026-07-31-client-feedback.md) เป็น 🟢 Done (`8ba7c77`)** ให้ตรงกับ backlog (ตรวจแล้ว: `GameChoiceButton.jsx` + globals.css + G1/G3/G6 แก้จริง)
- **[NOTE] ยังไม่แตะโค้ด** — รอบนี้อัปเดตเฉพาะเอกสารตามคำสั่ง "อัปเดตเอกสารก่อน"; การรื้อโค้ด video-first + G13→Start Menu เป็น task ถัดไป

## 2026-07-31 (FEEDBACK — เพิ่มผลตอบรับเรื่องเสียง Effect และ BG ของ G13)
- **[DOC] เพิ่มข้อ 11 ใน [FB-2026-07-31-playtest.md](./agile/feedback/FB-2026-07-31-playtest.md)** — บันทึกข้อเสนอแนะเพิ่มเติมจากผู้ทดสอบสำหรับเกมไอติม G13: เพิ่มเสียง Effect (SFX) เช่น เสียงวางสกู๊ป, รับออร์เดอร์, ตักสำเร็จ/ผิดพลาด และเสียงเพลงประกอบพื้นหลัง (BGM); อัปเดตตารางสรุป, รายละเอียด, ความเกี่ยวข้องกับ `US-GAME-13-R2` และรายการสิ่งที่จะต้องทำถัดไป

## 2026-07-31 (FIX — เริ่ม auto-advance หลังคลิปจบ)
- **[FIX] แก้จังหวะ countdown ของ `video/page.tsx`** — ก่อนคลิปจบ ปุ่ม "ต่อไป" เป็นปุ่มปกติและยังไม่จับเวลา; เมื่อ YouTube ส่งสถานะ `ENDED` จึง mount `AutoAdvanceButton` เพื่อแสดง progress เฉพาะในปุ่มถัดไปและ auto-advance หลัง 15 วินาที
- **[FIX] เล่นซ้ำ reset countdown** — กด "เล่นซ้ำ" จะ unmount progress/ยกเลิก timer ระหว่างดูใหม่ และเริ่มรอบ 15 วินาทีใหม่เมื่อคลิปจบอีกครั้ง
- **[UI] ทำ progress ให้มองเห็นบนปุ่มพื้นขาว** — เพิ่ม optional `progressClassName` ให้ shared `AutoAdvanceButton` (ค่า default เดิมยังเป็น `bg-white/30` จึงไม่กระทบ G1/G3/G6) และกำหนดหน้าคลิปเป็น `--primary-light`; แถบถูก clip อยู่เฉพาะครึ่งปุ่ม "ต่อไป" ส่วน "เล่นซ้ำ" ไม่มี progress
- **[DOC] Sync [US-VIDEO-01](./agile/user-stories/US-VIDEO-01.md) และ [Sprint 08](./agile/sprint-backlog/sprint-08.md) ให้ตรงพฤติกรรมที่แก้**

## 2026-07-31 (CODE — รื้อหน้าคลิปวิดีโอสั้น US-VIDEO-01)
- **[CODE] รื้อ `video/page.tsx` ตาม US-VIDEO-01** — header กระชับ (badge "บทที่ X" + ชื่อคลิป, `flex items-center` ให้ badge center แนวตั้งแม้ชื่อ wrap หลายบรรทัด); กล่องคลิปเป็น `flex-1 min-h-0` พื้นดำกรอบ teal ให้ YT iframe letterbox (fit-in) เต็มพื้นที่ที่เหลือ
- **[MECHANIC] ปุ่มล่าง 2 ตัว (เล่นซ้ำ | ต่อไป)** สไตล์ G1/G3/G6 (ติดกัน เส้นคั่น radius 25px บน) — "ต่อไป" กดข้ามได้ทันทีและใช้ `AutoAdvanceButton` แสดง progress/ไปเกมถัดไปเองเมื่อครบ 15 วิ (`video_auto_advance`); เมื่อคลิปจบหรือผู้ใช้กด "เล่นซ้ำ" จะยกเลิก auto-advance โดย "เล่นซ้ำ" ใช้ `seekTo(0,true)` + `playVideo()` และ log `replay_video`
- **[CLEANUP] ลบองค์ประกอบไม่จำเป็น** — subtitle "*กรุณารับชม...*", ปุ่ม external YouTube (`open_external_youtube`), ลิงก์ "ข้ามวิดีโอ (ทดสอบ)" (`skip_video`/`handleSkip`) และตัวแปรที่ค้าง (`videoFinished`, `videoUrl`)
- **[DOC] Sync [US-VIDEO-01](./agile/user-stories/US-VIDEO-01.md) และ [Sprint 08](./agile/sprint-backlog/sprint-08.md)** ให้ตรง implementation ใหม่; คงสถานะรอ QA เพราะยังไม่ได้ playtest บนอุปกรณ์จริง
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; eslint ไม่เพิ่ม issue ใหม่ (คงหนี้เดิมของไฟล์: YT `any`, `sdkLoaded` let, empty catch, setState-in-effect — อยู่ใน US-DEBT-01)

## 2026-07-31 (TASK — รื้อหน้าคลิปวิดีโอสั้น)
- **[TASK] เพิ่ม [US-VIDEO-01](./agile/user-stories/US-VIDEO-01.md)** — รื้อ UI หน้าคลิป (`video/page.tsx`) จาก design draft ผู้ใช้: header กระชับ (badge "บทที่ X" + ชื่อคลิปด้านบน, badge center แนวตั้งเมื่อชื่อยาว), คลิป fit-in ในกล่องใหญ่ขึ้น (letterbox ไม่ crop), ลบ subtitle/ปุ่ม external YouTube/ลิงก์ skip ทดสอบ
- **[MECHANIC] ปุ่มล่าง 2 ตัวสไตล์ G1/G3/G6** — เล่นซ้ำ | ต่อไป (ติดกัน มีเส้นคั่น); task draft เดิมเสนอปลดล็อกเมื่อคลิปจบหรือครบ 15 วินาที แต่ implementation ล่าสุดเปลี่ยนเป็นเริ่ม progress/auto-advance 15 วินาทีหลังคลิปจบเท่านั้น; "เล่นซ้ำ" ใช้ YouTube IFrame API (`seekTo(0)` + `playVideo()`) และ reset countdown
- **[SYNC]** register ใต้ [US-UX-05](./agile/user-stories/US-UX-05.md) ใน Sprint 08 (v1.2); ยังไม่แตะโค้ด implementation

## 2026-07-31 (CODE — G13 Canvas Remake v2)
- **[CODE] Remake `G13ScoopStacker.tsx` บน HTML Canvas** — React ดูแล tutorial/HUD/summary เท่านั้น; scoop, bomb, cone/tower, debris, collision และ wobble อยู่ใน `requestAnimationFrame` simulation
- **[MECHANIC] เกมรับไอติมจริง 120 วินาที** — เพิ่มเวลาจาก prototype 75 วินาทีเป็น 2 นาทีเพื่อเล่นได้จุใจและเห็น camera/sky progression; ตัด content pool/emoji/ข้อความ good-bad ออกจาก gameplay; scoop ต่อทันทีเมื่อชนยอดหอ (ลูกแรกชนกรวย); ระเบิดชนแล้วไอติมบนสุดร่วงไม่เกิน 2 ลูก; ไม่มี Game Over
- **[FIX] ไอติมลูกแรกแนบปากกรวย** — ชดเชยพื้นที่โปร่งด้านบนของ SVG ด้วย `CONE_SCOOP_OVERLAP` และใช้ offset เดียวกันทั้งตำแหน่งวาดกับ collision target จึงไม่เห็นช่องว่างระหว่างฐานกองกับขอบกรวย
- **[FEATURE] กล้องติดตามหอแบบเกมต่อตึก** — เมื่อยอดหอผ่านเส้น 48% ของ playfield ระบบเพิ่ม Canvas world offset ให้ยอดอยู่ในจอและเลื่อนกรวยลงแทนการย่อหอ; camera easing ถอยกลับอัตโนมัติเมื่อระเบิดทำชั้นลดลง พร้อม parallax เมฆเล็กน้อย
- **[FIX] พื้นที่ลากไม่หายตามกรวย** — เพิ่ม fixed input hit area ที่ช่วงล่าง 34% ของ playfield พร้อม pointer capture; ผู้เล่นเริ่มลากใหม่จากพื้นที่เดิมได้แม้ camera follow เลื่อนกรวยพ้นขอบจอ
- **[FEATURE] ท้องฟ้าเปลี่ยนตามความสูง** — map camera offset เป็น altitude 0–1 เพื่อค่อย ๆ blend ฟ้ากลางวันเป็นอวกาศ; เมฆจางลงและดาว deterministic 42 ดวงค่อย ๆ ปรากฏ/กระพริบ โดยย้อนสว่างกลับเมื่อหอเตี้ยลง
- **[FIX] World bounds + high-DPR** — canvas clip วัตถุพ้นจอ, cleanup debris, จำกัดกรวยในขอบ playfield, resize logical coordinates และ scale backing store ตาม `devicePixelRatio` โดยไม่เปลี่ยน physics
- **[ART] เพิ่ม `public/assets/g13-waffle-cone.svg`** — กรวย vector ทรงจริงพร้อมขอบและลายวาฟเฟิล; ไอติม/ระเบิดวาดด้วย Canvas path/gradient
- **[DOC] อัป `design-g13.md` เป็น v2** และ `US-GAME-13-R2` เป็น 🔍 In QA; ยังไม่ติ๊ก Acceptance Criteria จนกว่า runtime playtest ผ่าน
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; ESLint G13 ไม่มี error (warning `<img>` tutorial 1 รายการ); `git diff --check` ผ่าน

## 2026-07-30 (TASK — G13 Canvas Remake)
- **[TASK] เพิ่ม [US-GAME-13-R2](./agile/user-stories/US-GAME-13-R2.md)** — remake เกมวางไอติมใหม่บน HTML Canvas; ตัด emoji/ข้อความความรู้จากวัตถุเกม เปลี่ยนเป็นไอติมจริงและอุปสรรคระเบิดที่ทำไอติมบนสุดร่วงไม่เกิน 2 ลูก
- **[MECHANIC] ระบุ stack/collision ใหม่** — ลูกแรกลงกรวย ส่วนลูกถัดไปต่อทันทีเมื่อชนไอติมบนสุด; หอโยกมากขึ้นตามความสูง; วัตถุพ้น playfield ต้องถูก clip/cleanup ไม่ถูก CSS บีบ; คงเวลาเดิม 75 วินาทีและไม่มี Game Over
- **[ART] กำหนด asset กรวย SVG/vector** — ทรงกรวยจริงพร้อมลายวาฟเฟิล; runtime game object render ลง Canvas และรองรับ high-DPR โดย physics ไม่เปลี่ยน
- **[SYNC]** mark [US-GAME-13-R1](./agile/user-stories/US-GAME-13-R1.md) เป็น superseded และอัปเดต Product Backlog, Sprint 08 และ Project Index ให้ชี้ R2; ยังไม่แตะโค้ด implementation

## 2026-07-30 (UI — responsive font + ปิด browser text autosizing, G1/G3 reveal)
- **[DOC] ปรับ requirement หน้าเฉลย G1/G3 ให้ตรงแบบ G6** (`US-GAME-01-R1.md`, `US-GAME-03-R1.md`) — หลังตอบไม่ย้ำข่าว/ภาพเดิม; เหลือ verdict, คำอธิบายที่ scroll ภายใน และปุ่มถัดไป docked ด้านล่าง โดย G3 ยังคงแสดง `ai_disclosure` ในหน้าเฉลย
- **[CODE] ฟอนต์ของ minigame ใช้ fluid `clamp(...)` ครบทุกเกมที่มีใน Dev Game Hub** (`G1`–`G11`, `G13` และ `GameShell`) — ลดตาม viewport แคบโดยไม่ `zoom`/`transform` หรือบีบ root layout และมีขอบบนไม่ให้ขยายเกินค่าที่ออกแบบ
- **[FIX] ปิด browser/WebView text autosizing** (`src/app/globals.css`) — กำหนด `text-size-adjust: none` และ `-webkit-text-size-adjust: none` ที่ `html` เพื่อไม่ให้ display/font scale สูงขยายข้อความซ้ำจากค่าที่ component กำหนด; responsive clamp และตัวเลือกขนาดฟอนต์ของแอปยังทำงานแยกตามเดิม
- **[FIX] G3 กันภาพทับปุ่ม** (`G3AIOrNot.jsx`) — media อยู่ใน `flex-1 min-h-0` + `object-contain`; แถบปุ่มเป็น `shrink-0 relative z-20` จึงอยู่เหนือ media และกดได้เสมอ
- **[VERIFY]** `npx tsc --noEmit` ผ่าน; eslint เฉพาะ G1/G3/GameShell ไม่มี error (เหลือ warning `<img>` เดิม 1 รายการ); production bundle compile + type-check ผ่าน แต่ build หยุดตอน collect page data ที่ `/api/quiz-answers`

## 2026-07-30 (UI — ปุ่มดำเนินการต่อของเส้นทางหลัก)
- **[UI] ปุ่ม CTA ของเส้นทางหลักแนบขอบล่างแบบเดียวกับมินิเกม** — หน้า Landing, Consent และสถานะต่างๆ ของ Pretest/Posttest ใช้ `BottomActionButton` ร่วมกัน โดยไม่มี progress หรือ auto-advance; เนื้อหายังคง padding เดิมและเลื่อนได้แยกจากปุ่ม
- **[CODE] เพิ่มรูปแบบที่ reuse และ override ได้** (`src/components/BottomActionButton.tsx`) — แยกช่องปรับ `appearanceClassName`, `heightClassName`, `shapeClassName` และ `className` เพื่อให้แต่ละหน้าปรับเฉพาะส่วนได้โดยไม่ชนกับค่าเริ่มต้น
- **[SCOPE] ไม่เปลี่ยนหน้าเลือก Flow/Manual** (`src/app/lessons/page.tsx`) — ปุ่มตัวเลือกยังอยู่กึ่งกลางตามเดิม

## 2026-07-30 (UI — หน้าเกมหลักเต็มพื้นที่)
- **[UI] ตัด padding/gap ของ game route** (`src/app/lessons/[id]/game/page.tsx`) — ตัวเกมใน Flow/Manual กินพื้นที่เต็มความกว้างและความสูงที่เหลือใต้แถบชื่อเกม; คง App header, progress bar, แถบชื่อเกม และ UI ภายในแต่ละเกมไว้เหมือนเดิม โดยให้ padding เฉพาะแถบชื่อเกม

## 2026-07-30 (CODE — G6 ย้าย progress 30 วิของ intro ไปไว้บนปุ่ม)
- **[CODE] G6 intro ใช้ `AutoAdvanceButton`** (`G6LineSimulation.jsx`): ย้ายหลอด progress 30 วิ (auto ไปหน้าแชท) จาก progress bar แยกในหน้า intro → **ไปไว้บนปุ่ม "อ่านข้อความเลย"** (แถบ progress บนปุ่มเหมือนปุ่ม "ถัดไป", `delayMs={30000}`); ลบ useEffect timer เดิม + keyframe `g6IntroProgress` ที่ไม่ใช้แล้ว
- **[FIX] แยก callback auto/manual ของ `AutoAdvanceButton`** — เพิ่ม `onAutoAdvance` (fallback เป็น `onClick` เพื่อเข้ากันกับ G1/G3/G6 เดิม) ทำให้ G6 บันทึก `intro_skip` เฉพาะเมื่อผู้ใช้กดเอง ไม่บันทึกผิดเมื่อครบ 30 วิ

## 2026-07-30 (CODE — ปุ่ม "ถัดไป" auto-advance 5 วิ + progress (G1/G3/G6))
- **[CODE] `AutoAdvanceButton.jsx` (ใหม่) — ปุ่มถัดไปกดเองใน 5 วิ + แถบ progress บนปุ่ม** ใช้ร่วม G1/G3/G6 (`G1FactCheck.jsx`, `G3AIOrNot.jsx`, `G6LineSimulation.jsx`, `globals.css`):
  - หลังตอบ/เฉลย ปุ่ม "ถัดไป" นับ 5 วิ แล้วไปข้อถัดไปเอง (ผู้เล่นกดเองก่อนก็ได้); แถบ `bg-white/30` ค่อยๆ เต็มบนปุ่ม (keyframe `autoAdvanceProgress`)
  - ใช้ ref เก็บ callback ล่าสุด (timer ตั้งครั้งเดียวตอน mount ไม่ reset ทุก render) — ข้อสุดท้าย auto ไป onFinish เอง
  - ✅ tsc + lint สะอาด



## 2026-07-30 (CODE — G6 หน้าเฉลย layout แบบ G1 + bullet สั้น)
- **[CODE] G6 หน้าเฉลยเป็น layout แบบ G1** (`G6LineSimulation.jsx`): **แถบผลด้านบน** (คำชม "เยี่ยมมากค่ะ ปลอดภัย!" / "ยังไม่ปลอดภัยนะคะ" + ท่านเลือก X, สีเขียว/แดง) + **กล่องคำอธิบายเต็มจอ scroll ได้** (CustomScrollArea) แทนกล่องลอยกลางจอ
  - เนื้อหา "ทำไมแชทนี้ถึงอันตราย" เป็น **bullet สั้น** — เพิ่ม field `flag` (สรุป 1 บรรทัด) ให้ red flag ทั้ง 15 จุด (คง `desc` ยาวไว้อ้างอิง); ⚠️ copy สั้นเป็น UX summary — flag ทีมวิชาการรับรอง
  - ลบ import `CheckCircle2` ที่ไม่ใช้แล้ว; ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G6 รวมกล่องเฉลยเป็นกล่องเดียว)
- **[CODE] G6 รวมกล่อง "ผลที่เลือก" + "ทำไมอันตราย" เป็นกล่องเดียว** (`G6LineSimulation.jsx`): บนบอกผลที่เลือก (ถูก/ผิด) + verdict สั้น 1 บรรทัด → เส้นคั่น → "ทำไมแชทนี้ถึงอันตราย" + รายการเหตุผลในกล่องเดียวกัน; **ตัดข้อความ `feedback` เดิมที่พูดซ้ำ "ทำไมถูก/ผิด" ออก** (ซ้ำกับรายการเหตุผล); คงกล่องสรุป (หยุด คิด ถาม ทำ) แยก; ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G6 หน้าเฉลยเป็นคำอธิบาย ไม่ใช่วงกลมแดง)
- **[CODE] G6 เปลี่ยนหน้าเฉลย** (`G6LineSimulation.jsx`): เอาจอจำลอง + วงกลม/กรอบแดง + tap-to-expand ออกจากหน้าเฉลย (ผู้สูงอายุไม่เข้าใจ) → **แทนด้วยการ์ด "ทำไมแชทนี้ถึงอันตราย"** (รวม `desc` ของทุก red flag เป็นรายการข้อความ) + ผลที่เลือก + สรุป, scroll ด้วย `CustomScrollArea` (scrollbar เสมอ) แนวเดียวกับ G3
  - ⚠️ diverge จาก GDD (ที่ให้ตีกรอบ red flag บนแชท) — flag ทีมวิชาการ; โค้ด red-flag เดิมใน `renderPhoneFrame` คงไว้แต่ไม่ทำงาน (frame โชว์เฉพาะเฟส reading)
  - ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G6 หน่วงฟองข้อความ 5 วิ)
- **[CODE] G6** (`G6LineSimulation.jsx`): `BUBBLE_REVEAL_DELAY_MS` 900ms → **5000ms** (ฟองข้อความค่อยๆ ขึ้นทีละ 5 วิ ให้ผู้สูงอายุอ่านทัน); ฟองแรกแสดงทันที (delay 0) ฟองถัดไปหน่วง 5 วิ

## 2026-07-30 (CODE — G6 ปุ่มชิดจอ + ตัดลูกศรกลับ)
- **[CODE] G6** (`G6LineSimulation.jsx`): เอาช่องว่างระหว่างจอจำลองกับปุ่ม 3 ตัวเลือกออก (ลบ outer `gap-3` + button `mt-3` → ปุ่มชิดจอ; ย้าย spacing เป็น `mb-3` ที่แถว progress); **ตัดลูกศรกลับ `ArrowLeft` ที่หัวช่องแชทออก** (กันผู้สูงอายุเข้าใจผิดว่ากดออกจากเกมได้) + ลบ import; ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G6 คำสั่งตอบเป็นข้อความระบบในแชท + ลบ hint ซ้ำ)
- **[CODE] G6 ย้ายคำสั่ง "ตอบกลับยังไง" เข้าไปในแชท** (`G6LineSimulation.jsx`): แสดงเป็น **ข้อความระบบกลางแชท** (กรอบขอบมน ตัวหนา 20px คล้ายข้อความตอน block คน) เมื่ออ่านฟองครบ — เอา `<p>` instruction ใต้กรอบออก; auto-scroll deps เพิ่ม `conversationDone` ให้เลื่อนเห็นข้อความระบบ
- **[CODE] ลบกล่อง hint "ลองอ่านข้อความอีกครั้ง..." + logic idle-hint ทั้งหมด** (hintVisible state, idle-hint useEffect, `IDLE_HINT_DELAY_MS`, `hint_shown` event, setHintVisible) — ความหมายซ้ำกับข้อความระบบในแชท; ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G6 จอจำลองโล่ง: ตัด bar + scroll ตามจอจริง)
- **[CODE] G6 ปรับจอ LINE จำลองให้โล่ง + scroll ถูกต้อง** (`G6LineSimulation.jsx`): แยก render เป็น 3 เฟส (intro/reading/reveal), extract `renderPhoneFrame(frameClass, chatBodyClass)`:
  - **scroll ตามพื้นที่จริง (flex):** reading = กรอบ `flex-1` + chat body `flex-1 overflow-y-auto` (เดิม `max-h-[40vh]` ไม่ตามจอจริงตอนถูกบีบ); reveal = `max-h-[38vh]` ใน scroll-region
  - **ตัด status bar + input bar ออก** (คนแก่งงคิดว่าส่งข้อความจริง) — เหลือ header + ฟองข้อความ
  - ย้ายคำกำกับ "ไม่ใช่แอป LINE จริง" เป็นแถบเล็กในกรอบจอ (แทน input bar); ย้าย instruction มาใต้กรอบจอ (เดิมอยู่เหนือ กินที่)
  - ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G6 flow ใหม่ Intro→Chat แก้ crowding)
- **[CODE] G6 แยกเป็น 2 เฟสต่อสถานการณ์** (`G6LineSimulation.jsx`, [US-GAME-06-R1](./agile/user-stories/US-GAME-06-R1.md)): จอ 16:9 เดิม title+instruction+จอจำลอง+ปุ่ม บีบกันจนไม่เหลือที่ →
  - **Intro:** เต็มจอโชว์สถานการณ์ (หัวข้อ + คำนำ) + ปุ่ม "อ่านข้อความเลย →" (ข้าม) + **auto ไปแชทใน 30 วิ** (progress บางๆ, จังหวะนำทางไม่ทำโทษ)
  - **Chat:** จอจำลองได้พื้นที่เต็ม (ตัด title ใหญ่ออก เหลือ instruction เล็ก) → ฟองทยอยขึ้น (gate ด้วย `introDone`) → ปุ่ม 3 ตัวเลือกแสดงแทนปุ่มข้าม
  - state `introDone` (reset ทุกสถานการณ์), auto-advance useEffect 30s, keyframe `g6IntroProgress`
  - ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G6 ปุ่ม + จอ LINE responsive/auto-scroll)
- **[CODE] G6 ปรับปุ่มตอบ + จอจำลอง** (`G6LineSimulation.jsx`, [US-GAME-06-R1](./agile/user-stories/US-GAME-06-R1.md)):
  - ปุ่มตอบ: สลับลำดับ **ปฏิเสธ→ยอมรับ→นิ่งเฉย**, ไอคอนนิ้วโป้ง (`ThumbsUp`/`ThumbsDown`/`EyeOff` แทน Send/Ban), **สีเต็มปุ่ม** (ปฏิเสธ=แดง, ยอมรับ=เขียว, นิ่งเฉย=เหลือง), เอา sub-label วงเล็บออก, ชิดขอบล่าง + radius `25px 25px 0 0`
  - ⚠️ **flag แล้ว/ผู้ใช้ยืนยัน:** เขียว+👍 บน "ยอมรับ" (=ทำตามมิจ, เสี่ยง) ขัดกับเป้าหมายสอน + สีคงที่ = บอกใบ้ — ให้ UX/วิชาการทบทวนก่อน production
  - **จอ LINE จำลอง responsive:** โซนแชท `max-h-[40vh]` + `overflow-y-auto` (หด/ขยายตามความสูง viewport — ใช้ `vh` รองรับ WebView เก่า A10s; ค่า 40vh tunable) + **auto-scroll** ฟองล่าสุด (ref + useEffect on revealedCount)
  - ย้ายคำกำกับ "ไม่ใช่แอป LINE จริง" มาไว้ใต้จอจำลอง (ปุ่มชิดล่างสุด)
  - ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — G3 เอาวงกลมจุดสังเกตออก + หน้าเฉลยแบบ G1)
- **[CODE] G3 ลบระบบวงกลมแดง (hotspot) + หน้าเฉลยแบบ G1** (`G3AIOrNot.jsx`, [US-GAME-03-R1](./agile/user-stories/US-GAME-03-R1.md)):
  - **ลบ hotspot circles + tooltip + `@keyframes pulse`** ออกจากภาพ (ผู้สูงอายุไม่เข้าใจวงกลม + รกจอ) — เหลือเฉลยแค่ผล (จริง/ปลอม) + คำอธิบายข้อความ
  - หน้าเฉลยใช้โครงแบบ G1: การ์ดภาพ + **แถบผลเป็นหัวการ์ด** (สีตามผล) + **แผงคำอธิบาย `CustomScrollArea` (scroll bar เสมอ) ยืดชิดล่าง + ปุ่ม "ต่อไป" ลอยทับ** (radius 25px top); ซ่อนหัวข้อ claim ในหน้าเฉลยเพื่อลดความรก; คงป้าย `ai_disclosure` + ปุ่มซูม
  - ⚠️ **diverge จาก GDD §G3** (ที่กำหนด bounding-box จุดสังเกต) — flag ทีมวิชาการ; data `hotspots` ใน QUESTIONS ปล่อยไว้ไม่ใช้ (ตัดทีหลังได้)
  - ✅ tsc + lint สะอาด (เหลือ `<img>` warning เดิม)
- **[CODE] G3 ขยายฟอนต์หัวข้อคำถามให้เท่า G1** (`G3AIOrNot.jsx`): "หัวข้อวิเคราะห์:" 16→**29px หนา** (เท่าหัวข้อข่าว G1), ตัวโจทย์ 20→**26px** (เท่าเนื้อข่าว G1)

## 2026-07-30 (CODE — G3 ทำ layout/ปุ่มเหมือน G1)
- **[CODE] G3 รื้อ layout ให้เหมือน G1** (`G3AIOrNot.jsx`, [US-GAME-03-R1](./agile/user-stories/US-GAME-03-R1.md)): เปลี่ยนเป็น 3 โซน (toolbar บน / หัวข้อ+ภาพ+เฉลย scroll กลาง / ปุ่มตอบ 1 แถว**ชิดขอบล่าง**), ปุ่มตอบแล้วสลับเป็นปุ่ม "ต่อไป" (สูง 100px, radius `25px 25px 0 0`)
  - **เปลี่ยน label + ไอคอนให้เหมือน G1** (ตามคำสั่งผู้ใช้): จริง=👍`ThumbsUp`(เขียว)=`real`, ปลอม=👎`ThumbsDown`(แดง)=`ai`, ไม่แน่ใจ=❓`CircleHelp`(teal)=`unsure` (เลิกใช้ Bot/Camera)
  - ⚠️ **divergence จาก GDD** (คำ "สร้างโดย AI"/"ภาพถ่ายจริง" → "จริง/ปลอม") — logic (real/ai/unsure) + ai_disclosure ไม่เปลี่ยน; **flag ให้ทีมวิชาการยืนยันคำ "ปลอม"**
  - ✅ tsc + lint สะอาด (เหลือ pre-existing `<img>` warning เดิม)

## 2026-07-30 (US-DEVHUB-01 — เพิ่มฟอนต์ result modal ใน Dev Game Hub)
- **[DOC] สร้าง [US-DEVHUB-01](./agile/user-stories/US-DEVHUB-01.md)** — task เพิ่มขนาดฟอนต์หน้าสรุปผล (result modal) ใน Dev Game Hub; ระบุชัดว่าเป็น modal **dev-only** (`/dev/games`) ไม่ใช่หน้าสรุปจริงของผู้เล่น (`RewardScreen.jsx` — นอกขอบเขต)
- **[CODE] เพิ่มฟอนต์ result modal** (`src/app/dev/games/DevGameHubClient.tsx`): caption 14→24px, "ได้ N ดาว" 24→**34px**, ดาว 28→**44**, หมายเหตุ 12→22px, ปุ่ม default→**26px** + สูงขึ้น (py-3.5); คง logic/layout เดิม; ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — ปรับฟอนต์ปุ่มต่อไป / คำอธิบาย)
- **[CODE] G1 ปรับฟอนต์** (`G1FactCheck.jsx`): ปุ่ม "ต่อไป" 24→**26px** (+10%); เนื้อความคำอธิบาย 26→**23px** (−10%) (หัวข้อคำอธิบายคง 29px)

## 2026-07-30 (CODE — border radius ปุ่มชิดล่าง)
- **[CODE] ปุ่ม G1 ชิดล่าง → radius `25px 25px 0 0`** (`G1FactCheck.jsx`): กลุ่มปุ่มตอบ (จริง/ปลอม/ไม่แน่ใจ) + ปุ่ม "ต่อไป" ใช้ `rounded-t-[25px] rounded-b-none` (มนบน ล่างตรง เพราะชิดขอบล่างจอ) — utility ชนะ `.btn` ที่อยู่ใน `@layer components`

## 2026-07-30 (CODE — custom scroll bar แสดงตลอดเวลา)
- **[CODE] `CustomScrollArea.jsx` (ใหม่) + ใช้ในแผงคำอธิบาย G1** (`src/components/CustomScrollArea.jsx`, `G1FactCheck.jsx`, `globals.css`): มือถือ (iOS Safari/LINE in-app) ซ่อน native scrollbar แบบ auto-hide + CSS `::-webkit-scrollbar` บังคับให้แสดงตลอดไม่ได้ → ทำ scroll bar เอง: ซ่อน native ด้วย `.no-native-scrollbar` แล้ววาด track+thumb ที่อัปเดตตาม `scrollTop`/`scrollHeight` (onScroll) + `ResizeObserver` (รองรับผู้ใช้ปรับขนาดฟอนต์); thumb ใช้สี `--primary`; **reuse กับ G3/G6 ได้**; ✅ tsc + lint สะอาด

## 2026-07-30 (CODE — implement ปุ่มตอบ 1 แถว G1/G3/G6)
- **[CODE] แก้ปุ่มตอบเป็น 1 แถวตามสเปกที่เคาะ** (`G1FactCheck.jsx`, `G3AIOrNot.jsx`, `G6LineSimulation.jsx`) — โค้ดเสร็จ รอ QA playtest คลิกจริง:
  - เดิม 3 ปุ่มเรียงลง (`flex-col`, ~224px) → **1 แถว 3 ปุ่มเท่ากัน** (`flex` + `divide-x-2`), ปุ่มสูง `min-h-[100px]`, ไอคอนบน + คำล่าง (`flex-col items-center`), ติดกันมีเส้น border คั่น, ครอบด้วย `rounded-[var(--radius-lg)] border-2`
  - ไอคอน lucide (SVG): G1 = `ThumbsUp`/`ThumbsDown`/`CircleHelp`; G3 = `Bot`/`Camera`/`CircleHelp`; G6 = `Send`/`Ban`/`EyeOff` (แทน `ThumbsUp`/`ThumbsDown` เดิมที่สื่อผิดว่า "ยอมรับ" เป็นตัวเลือกดี)
  - label สั้นลง: G1 "จริง"/"ปลอม/มั่ว"/"ไม่แน่ใจ"; G3 คงคำเดิม 2 ปุ่ม + "ไม่แน่ใจ"; G6 ใช้คำกริยาหลัก (`RESPONSE_MAIN`) + ส่วนวงเล็บเป็น sub-label เล็ก
  - **G6 ทุกปุ่มสีเดียวกัน (teal) ไม่ใส่สีถูก/ผิด** — กันบอกใบ้คำตอบ; คงกติกาปุ่ม disabled จนอ่านฟองครบ
  - คง logic เกม/scoring/event เดิมทั้งหมด (แก้เฉพาะ presentation ของปุ่ม); ลบ `Eye` import ที่ไม่ได้ใช้ใน G3
- **[CODE] G1 จัด layout ใหม่ตาม feedback** (`G1FactCheck.jsx`): ข่าวสาร center กลางจอ (middle flex-1 `justify-center`), ปุ่มตอบชิดล่าง (bottom zone), **ปุ่ม "ข้อถัดไป" โผล่เฉพาะหลังตอบ** (เดิม disabled ตลอด → render เมื่อ `isAnswered`), ฟอนต์ข่าว +20% (intro 18→22px, claim 22→26px); แก้ escaped quote → **G1 lint สะอาด**
- **[CODE] G1 หน้าเฉลย (Answer Reveal) ตามภาพร่างผู้ใช้** (`G1FactCheck.jsx`): แถบผล ("ถูกต้อง เก่งมาก"/"รอบคอบมาก"/"ยังไม่ถูก มาดูเฉลยกัน") ย้ายไปเป็น**หัวติดกล่องข่าว** (สีตามผล success/primary/error, ใช้ token ธีม ไม่ใช้สี draft); แผงคำอธิบาย+จุดสังเกต **ยืดเต็มพื้นที่ที่เหลือ + scroll ในตัว** (`flex-1 overflow-y-auto`); ปุ่ม "ต่อไป" **ใหญ่เท่าปุ่มตอบ** (`min-h-[100px]`, teal primary); ปรับฟอนต์: เนื้อความคำอธิบาย 20→**26px** (เท่าข่าว), หัวข้อทั้งสองกล่อง 22/20→**29px** (หนา + ใหญ่กว่าเนื้อความ 10%); แผงคำอธิบาย**ยืดชิดขอบล่างจอ** (relative + `absolute inset-0`) โดยปุ่ม "ต่อไป" **ลอยซ้อนทับขอบล่างแผง** (`absolute bottom-0`) + text เว้น `pb-[120px]` ให้อยู่เหนือปุ่ม; ✅ tsc + lint สะอาด
  - ✅ `tsc --noEmit` ผ่าน + vitest unit 7/7 ผ่าน | pre-existing lint (G1 unescaped `"` บรรทัด 152, G3 `<img>`) ไม่เกี่ยวกับงานนี้ (อยู่ใน backlog 79 errors) | ⏳ ยังไม่ได้ playtest คลิกจริง + audit zero-scroll บน A10s

## 2026-07-30 (เคาะสเปกปุ่มตอบ G1/G3/G6 — เอกสารก่อนแก้โค้ด)
- **[DECISION] ปุ่มตอบเปลี่ยนจาก 3 แถวเรียงลง → 1 แถวแนวนอน** (จากภาพจริงที่ปุ่มกินเกือบครึ่งจอ) บันทึกใน [US-GAME-01-R1](./agile/user-stories/US-GAME-01-R1.md) / [US-GAME-03-R1](./agile/user-stories/US-GAME-03-R1.md) / [US-GAME-06-R1](./agile/user-stories/US-GAME-06-R1.md) — **ยังไม่แตะโค้ดตามที่ผู้ใช้สั่ง**:
  - 1 แถว 3 ปุ่มเท่ากัน, **ปุ่มสูงขึ้น**, **ติดกันไม่เว้นช่องไฟแต่มีเส้น border คั่นชัด**, ไอคอนบน+คำสั้นล่าง
  - ใช้ไอคอน SVG จาก `lucide-react` (ติดตั้งแล้ว `^0.475.0` — ไม่ต้องเพิ่ม dep; Google Material Symbols เป็นทางเลือก)
  - **ไอคอนต่างกันตามความหมายของแต่ละเกม** (ไม่ก๊อป 👍/👎 ข้ามเกม): G1 จริง/ปลอม/ไม่แน่ใจ = 👍`ThumbsUp`/👎`ThumbsDown`/❓`CircleHelp`; G3 AI/ภาพจริง/ไม่แน่ใจ = 🤖`Bot`/📸`Camera`/❓`CircleHelp`; G6 ยอมรับ/ปฏิเสธ/นิ่งเฉย = `Send`/`Ban`/`EyeOff` (เสนอ รอยืนยัน)
  - **G6 พิเศษ:** label มาจาก data รายสถานการณ์ + "ยอมรับ" เป็น action เสี่ยง → **ห้ามใส่สีถูก/ผิดที่ปุ่ม** (จะบอกใบ้คำตอบ) ใช้สีกลางทุกปุ่ม, ห้ามใช้ 👍 กับ "ยอมรับ"
  - ⚠️ ต้องยืนยันกับทีมวิชาการ: การตัดคำ "น่าจะ" (G1) และไอคอน G6
  - G13-R1 ระบุว่าสเปกนี้ **ไม่เกี่ยว** (ไม่มีปุ่มตัวเลือก — input ลากโคน)

## 2026-07-30 (Doc sync + task รื้อ UI 4 มินิเกม Flow)
- **[NEW] เพิ่ม task รื้อ UI/layout 4 มินิเกม (แยกรายเกม) ตาม GDD** — เป็น breakdown ของ [US-UX-05](./agile/user-stories/US-UX-05.md) ใน Sprint 08, ผูกกับ Flow ใหม่ ([US-FLOW-01](./agile/user-stories/US-FLOW-01.md)):
  - [US-GAME-01-R1](./agile/user-stories/US-GAME-01-R1.md) G1 (GDD: mechanics §G1), [US-GAME-03-R1](./agile/user-stories/US-GAME-03-R1.md) G3 (+ ai_disclosure), [US-GAME-06-R1](./agile/user-stories/US-GAME-06-R1.md) G6 (LINE fidelity v2.0), [US-GAME-13-R1](./agile/user-stories/US-GAME-13-R1.md) G13 (เกมปิดท้าย Flow)
  - ขอบเขต: UI ใหม่ + layout single-screen (zero-scroll) + logic บางจุดตาม GDD — **ยืนยันจากโค้ดว่ากลไกหลักตาม GDD แล้ว** (G6 มี reply-choice v2.0, G1 มี "ไม่แน่ใจ", G3 มี swipe/กรอบ/ai_disclosure) จึงเน้น UI/layout ไม่ใช่รื้อกลไก; รายการ logic fix เจาะจงให้ groom กับทีมตอนเริ่มงาน
  - G1/G3/G6 ยังเป็น legacy `.jsx` → แนะนำย้าย `.tsx` ระหว่างรื้อ; ลงทะเบียนใน Sprint 08 committed table (กลุ่มย่อยใต้ US-UX-05)

## 2026-07-30 (Doc sync — สถานะเอกสารตรงกับโค้ดที่ commit จริงบน `development`)
- **[SYNC] แก้ status drift ของ Sprint 08** (`01-product-backlog.md`, `sprint-08.md`) — ไฟล์ US แต่ละตัวอัปแล้วแต่ตารางรวมยังค้าง "🏗 Planned/[ ]":
  - US-DOC-01 → 🟢 Done (`9900ddd`), US-DEBT-01 → 🟢 Done ส่วนใหญ่ (`f401d0b`), US-FLOW-01 → 🔨 รอ QA (`863895c`), US-SEC-01 → 🔥 In Progress (`d5c2e9b`, รอ rotate จริง)
  - `sprint-08.md`: แก้ header timeline (วางไว้ พ.ย. แต่ทีมเริ่มลงมือจริง 27 ก.ค.) + ลบ risk "G13 ยังเป็นเอกสารอย่างเดียว" ที่ล้าสมัย (โค้ด G13 มีแล้ว)
- **[FIX] `docs/index.md`** — Current Sprint `Sprint 03 polishing` → `Sprint 08` (active), Last Updated → 2026-07-30, แก้ count Backlog (Should 5→7, Nice 3→4), G8/G11/G13 ในรายการ GDD จาก 🟡 ข้อเสนอ → 🔨/🟢 Prototype
- **[NEW] เพิ่ม user story ที่ขาด** — G8/G11/G13 มี component + data + ลงทะเบียน Dev Game Hub แล้วแต่ไม่มีใน backlog:
  - เพิ่มแถว US-GAME-08 (Should, 🟢 playtest แล้ว), US-GAME-11 (Should, 🔨), US-GAME-13 (Nice, 🔨 — terminal ของ US-FLOW-01) ใน Product Backlog
  - สร้างไฟล์ [US-GAME-11.md](./agile/user-stories/US-GAME-11.md) + [US-GAME-13.md](./agile/user-stories/US-GAME-13.md) (US-GAME-08.md มีอยู่แล้ว)
- ⚠️ **ยังไม่ได้ทำ (นอกขอบเขต doc-sync):** prototype G12 (Chuzzle) + US-GAME-11/12 ที่ทำเซสชันก่อนยังค้างบน branch `game-design` (`364e270`, `06c3378`) ยังไม่ merge เข้า `development` — `design-g12.md` โผล่ใน index แต่ไม่มีโค้ดบน branch นี้ (รอทีมตัดสินใจ merge); การ์ด G11 ใน Dev Game Hub ยังไม่ผูก `designDoc`; design-g11/g13 ยังเป็น 🏗️ Draft

## 2026-07-30 (CODE — G3 เอาวงกลมจุดสังเกตออก + หน้าเฉลยแบบ G1)
- **[CODE] G3 ลบระบบวงกลมแดง (hotspot) + หน้าเฉลยแบบ G1** (`G3AIOrNot.jsx`, [US-GAME-03-R1](./agile/user-stories/US-GAME-03-R1.md)):
  - **ลบ hotspot circles + tooltip + `@keyframes pulse`** ออกจากภาพ (ผู้สูงอายุไม่เข้าใจวงกลม + รกจอ) — เหลือเฉลยแค่ผล (จริง/ปลอม) + คำอธิบายข้อความ
  - หน้าเฉลยใช้โครงแบบ G1: การ์ดภาพ + **แถบผลเป็นหัวการ์ด** (สีตามผล) + **แผงคำอธิบาย `CustomScrollArea` (scroll bar เสมอ) ยืดชิดล่าง + ปุ่ม "ต่อไป" ลอยทับ** (radius 25px top); ซ่อนหัวข้อ claim ในหน้าเฉลยเพื่อลดความรก; คงป้าย `ai_disclosure` + ปุ่มซูม
  - ⚠️ **diverge จาก GDD §G3** (ที่กำหนด bounding-box จุดสังเกต) — flag ทีมวิชาการ; data `hotspots` ใน QUESTIONS ปล่อยไว้ไม่ใช้ (ตัดทีหลังได้)
  - ✅ tsc + lint สะอาด (เหลือ `<img>` warning เดิม)
- **[CODE] G3 ขยายฟอนต์หัวข้อคำถามให้เท่า G1** (`G3AIOrNot.jsx`): "หัวข้อวิเคราะห์:" 16→**29px หนา** (เท่าหัวข้อข่าว G1), ตัวโจทย์ 20→**26px** (เท่าเนื้อข่าว G1)

## 2026-07-27 (US-FLOW-01 — รื้อ Flow เรียนต่อเนื่อง)
- **[CODE] US-FLOW-01 — Flow ใหม่ "เกมนำ → คลิป" ปิดท้าย G13** (โค้ดเสร็จ รอ QA playtest):
  - `src/lib/flow.ts` (ใหม่): `FLOW_SEQUENCE=[topic-1,topic-3,topic-6]` + helpers; ข้าม G2/G5 ใน Flow (ยังเล่นได้ใน Manual)
  - `lessons/page.tsx`: Flow entry เข้า `/game` ก่อน + resume ตามลำดับ flow
  - `lessons/[id]/game/page.tsx`: จบเกม+flow → คลิป; เพิ่ม G13 (`flow-g13`) เป็น terminal → posttest
  - `lessons/[id]/video/page.tsx`: คลิปจบ+flow → เกมถัดไป/G13 + ป้ายปุ่มตามโหมด
  - ✅ tsc ผ่าน + ไม่มี rules-of-hooks violation | Manual mode ไม่แตะ
  - ⚠️ คลิป topic-6 ยัง placeholder; summary flow-branch กลายเป็น dead path (เก็บไว้)

## 2026-07-27 (เริ่มลงมือ Sprint 08 — งาน unblocked)
- **[DONE] US-DOC-01 — แก้เอกสารให้ตรงโค้ดจริง** (`AGENT.md`, `docs/software/02-architecture.md`):
  - `AGENT.md`: Tech Stack เป็น Next.js 16 App Router + TS + `pg` Pool + eslint + Vitest/Playwright (ไม่ใช่ Vite/Express/oxlint/"ไม่มี TS-test"); ลบอ้างอิง `src/App.jsx`/`src/App.css`/`src/index.css` → ชี้ App Router + `AppLayout.tsx` + `src/app/globals.css`; ระบุว่าใช้ `pg` ตรง ไม่มี Supabase Auth/RLS/Realtime และ `src/lib/supabase.ts` เป็น dead code
  - `02-architecture.md`: เพิ่ม callout สถานะจริง + แก้ §2.3 (Auth/Storage/Realtime = ยังไม่ implement)
  - `CLAUDE.md` ไม่ต้องแก้ (defer ไป AGENT.md อยู่แล้ว)
- **[SECURITY] US-SEC-01 (hotfix บางส่วน)** (`.env.example`, `.gitignore`):
  - ล้าง secret จริงออกจาก `.env.example` → เป็น placeholder ทั้งหมด; แก้ `.gitignore` ให้ `!.env.example` มีผล (เดิมโดน `.env*` ท้ายไฟล์ override)
  - ⚠️ **ยังต้อง rotate รหัส Supabase จริงใน dashboard** — รหัสเดิมอยู่ใน git history แล้ว การล้างไฟล์ไม่พอ
- **[DONE] US-DEBT-01 — เก็บกวาด dead code / repo hygiene**:
  - ลบ service `.js` ซ้ำ 3 ไฟล์ (dead — TS เลือก `.ts`), ไฟล์ขยะ `extracted_g9.{json,md,tsx}` + `docs/index_fixed{,2}.md`, `src/assets/{react,vite}.svg`, `.oxlintrc.json`; เลิก track `tsconfig.tsbuildinfo`
  - `next.config.ts`: เลิก hardcode IP → อ่าน `NEXT_ALLOWED_DEV_ORIGINS`; `src/lib/db.ts`: fail fast (`throw`) เมื่อไม่มี `DATABASE_URL`
  - **แก้ AC:** `vite` + `@vitejs/plugin-react` ไม่ลบ เพราะ `vitest.config.ts` ใช้จริง
  - ✅ tsc ผ่าน + vitest unit 7/7 ผ่าน | 🆕 finding: `npm run lint` มี 79 errors เดิม (out of scope, ตั้ง task แยก)
- **[NEW] เปิด Sprint 08 — รื้อ Flow เรียนต่อเนื่อง + Responsive/UX + Hardening & Cleanup** (`docs/agile/sprint-backlog/sprint-08.md`, `02-sprint-planning.md`, `01-product-backlog.md`, `docs/index.md`):
  - **จากคำสั่งทีม (2 งาน):**
    - **US-FLOW-01** — รื้อโหมด Flow เรียนต่อเนื่องอัตโนมัติให้เป็น "เกมนำ → คลิปสั้น": `G1 → คลิป → G3 → คลิป → G6 → คลิป → [คลิปจบ] → G13` (มินิเกมสนุกปิดท้าย ไม่เน้นเรียนรู้) — **แทน Flow เดิม (video→game รายบท)** ทั้งหมด
    - **US-UX-05** — ทำเกมทุกตัว (G1–G13) ให้ responsive single-screen + นำ design token/guideline จากทีม UX/UI มาใช้จริง
  - **จากรีวิวโค้ด+เอกสาร (ปัญหาที่พบ):**
    - **US-SEC-01** 🔥 — secret จริงหลุดใน `.env.example` (DATABASE_URL + Supabase key), API ทุก route ไม่มี auth (รวม `GET /api/action-logs` ที่เปิด analytics สาธารณะ), quiz เชื่อ `is_correct`/`score` จาก client + `quiz-questions` ส่งเฉลยให้ client, Zod schema มีแต่ไม่ถูกใช้, error leak `error.message` — **ส่วน rotate secret + ปิด analytics เป็น Hotfix ทำก่อนเชียงใหม่ 6 ส.ค.**
    - **US-DOC-01** — `AGENT.md`/`CLAUDE.md` ยังระบุ Vite+Express+Postgres+ไม่มี TS/test+oxlint+`src/App.jsx` ทั้งที่โค้ดจริงเป็น Next.js 16 App Router+TS+Vitest/Playwright+eslint+`pg` (commit `24a5862` migrate แต่ลืมอัปเดต) + architecture doc อ้าง Supabase Auth/RLS/Realtime ที่ไม่มีจริง
    - **US-DEBT-01** — service `.js` ซ้ำกับ `.ts` (dead code), ไฟล์ขยะ `extracted_g9.*` / `docs/index_fixed*.md`, vite deps ค้างใน `package.json`, `.gitignore` `!.env.example` ถูก override, hardcoded dev IP ใน `next.config.ts`
  - เพิ่ม 5 user stories: `US-FLOW-01`, `US-UX-05`, `US-SEC-01`, `US-DOC-01`, `US-DEBT-01`
  - Sprint 08 วาง timeline 2026-11-17 → 2026-12-12 (หลัง Sprint 07) — ไม่กระทบ roadmap เดิม; Current Sprint ยังเป็น Sprint 03

## 2026-07-26
- **[REPORT] จัดทำและตรวจสอบ Weekly Progress Report สัปดาห์ที่ 30 (20-26 กรกฎาคม 2026)** (`docs/reports/weekly/weekly-2026-W30.md`, `docs/agile/user-stories/US-GAME-13.md`, `docs/agile/01-product-backlog.md`, `docs/index.md`):
  - ตรวจสอบประวัติ Git Log และซอร์สโค้ดในรอบสัปดาห์ (Next.js Monorepo, Portainer Env Deployment, G12 Chuzzle Refinements, G13 Scoop Stacker Prototype, Epic E-WORLD / Sprint 07 Planning)
  - สร้าง User Story [US-GAME-13](./agile/user-stories/US-GAME-13.md) (G13 Scoop Stacker) เพื่อลงทะเบียนใน Product Backlog
  - รวบรวมสรุปความคืบหน้า รายงานระบบที่ยังขาด (Missing Systems) และแผนงานสัปดาห์ถัดไปลงใน `docs/reports/weekly/weekly-2026-W30.md`

## 2026-07-24
- **[FIX] Dev Game Hub เปิด/ปิดจาก Portainer env ได้โดยไม่ต้อง rebuild image** (`src/app/dev/games/page.tsx`, `src/lib/devHub.ts`, compose, `.env.example`):
  - สาเหตุเดิม: Client Component อ่าน `NEXT_PUBLIC_ENABLE_DEV_HUB` ซึ่ง Next.js ฝังค่าตอน `npm run build` — ใส่ใน Docker/Portainer ตอนรันจึงไม่มีผล
  - ย้าย gate ไป Server Component (`force-dynamic`) อ่าน `ENABLE_DEV_HUB` หรือ `NEXT_PUBLIC_ENABLE_DEV_HUB` ตอน request
  - UI ย้ายไป `DevGameHubClient.tsx`; อัปเดต README / application-flow / Portainer guide / US-03-R4

## 2026-07-22
- **[FIX] G12 — เรียงครบ 3 แล้วบางรอบไม่ติด/ไม่ขึ้นขอบขาว (จริงๆ รอบนั้นต้องการ 4)** (`src/data/g12-chuzzle-items.json`, `src/components/G12ChuzzleStop.tsx`, `docs/gdd/design-g12.md`):
  - **อาการ:** ผู้เล่นเรียงก้อนสีเดียวกัน 3 ก้อนแล้ว แต่ "บางครั้ง" ไม่ขึ้น highlight/ไม่เคลียร์
  - **ต้นเหตุ:** 2 ใน 8 รอบตั้ง `min_group_size = 4` (g12-c-005, g12-c-007) — รอบนั้นต้องเรียง **4** ก้อน 3 จึงไม่ติด · ซ้ำร้าย `seedBoard(size, minSize)` เลี่ยงเฉพาะกลุ่ม ≥ minSize จึง**ปล่อยให้มีกลุ่ม 3 ก้อนติดกันค้างบนกระดานตั้งแต่แรกในรอบที่ต้องการ 4** → ดูเหมือน "เรียงครบแล้ว" แต่ไม่นับ (ตรงกับสกรีนช็อตที่มี 3-in-a-row หลายแถวแต่ไม่ไฮไลต์) — logic (`findColorClusters`/`previewShiftSimple`) ถูกต้องอยู่แล้ว
  - **แก้:** ตั้ง `min_group_size = 3` **ทุกรอบ** (เดิม 2 รอบเป็น 4) เพื่อความสม่ำเสมอ/ชัดเจนกับผู้สูงอายุ และทำให้ seed ไม่ทิ้งกลุ่ม 3 ค้าง (seed เลี่ยงกลุ่ม ≥3 หมด) — engine ยังรองรับ N ถ้าจะเพิ่มความยากภายหลัง
  - เพิ่มความชัดของ hint กติการอบ: "ลากให้ก้อน**สีเดียวกันเรียงติดกัน 3 ก้อน**" ตัวหนา 18px (เดิม 16px จางๆ)
  - ✅ `tsc`/`eslint` ผ่าน, unit test match-ring 5/5 ผ่าน
- **[FIX] G12 — นิ้วมือไม่เลื่อนเองถ้าไม่แตะจอ (finger frozen จน pointer event มา re-render)** (`src/components/G12ChuzzleStop.tsx`):
  - **อาการ:** 👆 ขยับเฉพาะตอนผู้เล่นลาก/คลิก ไม่ไหลตาม delta-time เอง — soft timer จริงจึงไม่เดิน
  - **ต้นเหตุ:** การขับเคลื่อนนิ้วผูกกับ `startFinger`/`stopFinger` ที่จัดการ `requestAnimationFrame` เองด้วยมือ แล้วสตาร์ตผ่านห่วงโซ่เปราะ (mount effect → rAF wrapper → `startFinger`; ต่อรอบผ่าน `beginRound`) — ภายใต้ **React StrictMode** (`reactStrictMode: true`) รอบ mount→cleanup→mount ทำให้ cleanup เรียก `stopFinger()` ยกเลิก rAF ทิ้ง ลูปนิ้วเลยตายค้าง จนกว่าจะมี re-render จาก pointer event
  - **แก้:** เขียนใหม่ให้ขับเคลื่อนนิ้วด้วย **rAF `useEffect` ตัวเดียวที่ self-contained keyed ด้วย `[phase, roundIndex]`** — เริ่มลูปใหม่ต่อรอบ, cleanup `cancelAnimationFrame` เมื่อออกจาก "play" (ตามแพทเทิร์นมาตรฐานที่ทน StrictMode) — ตัด `startFinger`/`stopFinger`/`fingerRafRef`/`fingerStartRef` ทิ้ง, ใช้ `finishRoundRef` กัน stale closure
  - ✅ **verify ด้วย Playwright headless:** เปิด G12 แล้ว**ไม่แตะอะไรเลย** ตำแหน่งนิ้ว left = 16→30→47→62px ใน ~3s (เลื่อนเอง 46px) ไม่มี console error · `tsc`/`eslint` ผ่าน
- **[UPDATE] G12 — ตัด flow แบบบทเรียน: auto-advance ไม่มีปุ่ม "ถัดไป" + เพิ่มรอบ 8 → 10** (`src/components/G12ChuzzleStop.tsx`, `docs/gdd/design-g12.md`, `docs/agile/user-stories/US-GAME-12.md`):
  - **เอาปุ่ม "ลิงก์ถัดไป →" ออก** — จบรอบแล้วเกมเดินต่อเองอัตโนมัติ ไม่ต้องกดอะไร (destroy ~0.95s / miss ~1.6s ผ่าน `setTimeout` + auto-advance effect)
  - **แทนแผงเฉลย lesson-style (red_flags/explain/hotline + ปุ่ม) ด้วยแฟลชสั้นกลางจอ** (`pointer-events-none` overlay): ทัน = "ทำลายลิงก์จี้ทันแล้ว!", ไม่ทัน = **"คุณกดลิงก์อันตรายไปแล้ว"** (+ บรรทัดโดเมนหลัก · รัฐไทย = .go.th) — ไม่หักคะแนน ไม่มีจอแพ้
  - ทันแล้ว**สุ่มลิงก์ใหม่ต่อทันที** จนครบ **10 รอบ** (`SESSION_ROUNDS` 8 → 10); คลังลิงก์มี 8 ชิ้น จึงวนสับไพ่ซ้ำ (`while (out.length < SESSION_ROUNDS) out.push(...shuffle(POOL))`) ให้ครบ 10
  - อัปเดต design-g12.md (§2 loop mermaid + สรุปลูป, §3.1 ตารางผลรอบ, §4 layout ASCII, §4.3 แฟลชแทนแผง, §4.5 animation) และ US-GAME-12 (scope/AC/tasks) ให้ตรงพฤติกรรมใหม่
  - field `red_flags`/`explain`/`hotline` ใน `g12-chuzzle-items.json` ยังเก็บไว้ (ไม่ลบ) เผื่อใช้ในหน้าสรุปหรืออนาคต
  - ✅ `tsc`/`eslint` ผ่าน, `/dev/games` 200 · ⚠️ ยังรอ playtest คลิกจริงยืนยันจังหวะแฟลช/auto-advance บนเบราว์เซอร์

## 2026-07-21
- **[SYNC] ปิด gap เอกสารที่ค้างหลังทำ prototype G7–G12 (docs ≠ โค้ด/ backlog)** (`AGENT.md`, `docs/agile/01-product-backlog.md`, `docs/agile/user-stories/US-GAME-11.md`, `US-GAME-12.md`, `docs/index.md`, ลบ `docs/index_fixed.md`/`index_fixed2.md`):
  - **AGENT.md ตรงสแตกจริง:** แก้ Tech Stack `Vite + Express + oxlint + ไม่มี TS/test` → **Next.js 16 (App Router) + React 19 + TypeScript + Supabase/pg + Tailwind + Vitest/Playwright** (`npm test` มีจริง) · ระบุชัดว่าเป็น **hybrid mid-migration** (มีทั้ง `.js` เก่าและ `.ts` ที่ใช้จริง) · แก้ Sequence Engine `src/App.jsx` → Next.js App Router (`src/app/`) · แก้ theme token `src/index.css` → `src/app/globals.css` · เพิ่มรายชื่อเกม prototype G4/G7–G12 + Dev Hub
  - **สร้าง User Story ที่ขาด:** [US-GAME-11](./agile/user-stories/US-GAME-11.md) (หยุดนิ้ว! คิดก่อนกด) + [US-GAME-12](./agile/user-stories/US-GAME-12.md) (match-ring/อย่ากดลิงก์จี้) — ก่อนหน้านี้มี prototype โค้ดแต่ไม่มี backlog entry เลย · ลงทะเบียน G8/G11/G12 ใน [Product Backlog](./agile/01-product-backlog.md) (Should Have) พร้อมสถานะจริง
  - **index.md:** เพิ่มลิงก์ G4/G7 ที่หายไปในรายการ Detailed Game Design · แก้สถานะ G8 จาก "🟡 รอทีมจัด Sprint" → "🟢 Prototype (playtest ครบ 5 ด่าน)"
  - **ลบไฟล์ขยะ** `docs/index_fixed.md`, `docs/index_fixed2.md` (สำเนา index ที่ encoding พัง)
  - ⚠️ **ยังค้าง (นอกขอบรอบนี้):** Sprint 05/06 ยังวาง G5/G7/G4 เป็นงาน dev ทั้งที่เป็น QA/prototype แล้ว · deploy-camt wiki (Docker/Portainer) ยังไม่ทบทวนเทียบ Vercel · design-g11.md ยัง 🏗️ Draft ควรอัปเป็น prototype
- **[NEW] พัฒนา Prototype เกม G12 — อย่ากดลิงก์จี้ ถ้าไม่รีบหยุดกด** (`src/components/G12ChuzzleStop.tsx`, `src/lib/match-ring/`, `src/data/g12-chuzzle-items.json`, `src/app/dev/games/page.tsx`):
  - ชั้น logic clean-room ตาม §13: `RingGrid`, `shiftRow`/`shiftColumn`, `findColorClusters`, `seedBoard`, `resolveAfterCommit` — ห้าม copy จาก classic-chuzzle
  - UI: คอมเมนต์ย่อ + นิ้วเลื่อนซ้าย→ขวา + ปุ่มลิงก์ไฮไลต์ตาม progress + แผงเฉลย inline + กระดาน 5×5 ลากแถว/คอลัมน์ · เซสชัน 8 รอบ · ไม่หักคะแนนเมื่อไม่ทัน
  - unit test `src/tests/unit/match-ring.test.ts` ผ่าน · eslint/tsc (ไฟล์ G12) ผ่าน · สถานะเอกสาร → 🔨 Prototype · **ยังไม่ผูก** `/lessons/...`
- **[UPDATE] G12 v2.3 — เพิ่ม §13 Match-Ring Logic Spec (clean-room) สำหรับ implement** (`docs/gdd/design-g12.md`):
  - บันทึกระบบ logic ทั้งกระดาน: `RingGrid`, `shiftRow`/`shiftColumn`, `findColorClusters`, axis-drag state machine, seed board, cascade, race กับนิ้ว, โครงไฟล์ `src/lib/match-ring/`
  - กติกาห้าม copy โค้ด/ชื่อจาก repo อ้างอิง (ไม่มี LICENSE) — agent รอบถัดไปให้อ่าน §13 เป็นสัญญา implement
  - ย่อ §3 เป็นสรุปผู้เล่น แล้วชี้ไป §13; อัปเดต §11 ชื่อโมดูลให้สอดคล้อง
- **[UPDATE] G12 v2.2 — นิ้วเลื่อนซ้าย→ขวา + ปุ่มลิงก์ค่อยๆ ไฮไลต์/stroke จนกด** (`docs/gdd/design-g12.md`, `docs/gdd/01-mechanics.md`):
  - ต่างจาก G11 (นิ้วล่าง→บนจากขอบจอ) — G12 นิ้วอยู่ในแถวคอมเมนต์ย่อ เลื่อนแนวนอนเข้าหาปุ่ม "กดเปิดลิงก์"
  - progress ของนิ้วผูกกับความหนา stroke / ความสว่างขอบปุ่ม (0%→100%) จนถึงจังหวะกด · เปลี่ยนชื่อฟิลด์เป็น `finger_slide_ms`
- **[UPDATE] G12 v2.1 — เอานิ้วกลับมาเป็นตัวดึงสายตา + soft timer** (`docs/gdd/design-g12.md`, `docs/gdd/01-mechanics.md`, `docs/index.md`):
  - เหตุผล: ถ้าไม่มีสิ่งเคลื่อนไหว ผู้เล่นมักโฟกัสแต่ Chuzzle แล้วมองข้าม URL — นิ้วที่เลื่อนไปกดปุ่มสร้างความสนใจและผูกกับ "หยุดก่อนกด"
  - คงคอมเมนต์ย่อ + เรียงครบ = ทำลายลิงก์จี้ + แผงเฉลย inline · นิ้ว**ไม่ใช่ touch target** (ต่างจาก G11 — หยุดได้ด้วย Chuzzle เท่านั้น) · ไม่ทัน = ไม่หักคะแนน
- **[UPDATE] G12 v2.0 — เลิกใช้นิ้ว · เรียง Chuzzle = ทำลายลิงก์จี้ · คอมเมนต์ย่อแนว G9** (`docs/gdd/design-g12.md`, `docs/gdd/01-mechanics.md`, `docs/index.md`):
  - ตัดกลไกนิ้วมือทั้งหมด (โฟกัสเดียว: เรียงครบ → ทำลายการ์ดโดเมนลิงก์จี้ → แผงจุดสังเกต inline ใต้คอมเมนต์)
  - UI คอมเมนต์เป็นเวอร์ชันย่อของ G9 (ตัดโพสต์ต้นเรื่อง / engagement / ปุ่มตัดสิน) งบความสูง ≤ ~28% จอ ให้กระดานเป็นพื้นที่หลัก
  - ไม่แข่งเวลาต่อรอบ ไม่หักคะแนน จบด้วยจำนวนรอบหรือนาฬิกาเซสชันนุ่ม
- **[NEW] เพิ่มเอกสารออกแบบ G13 — ต่อไอติมรู้ทันสื่อ (Stack Smart Scoops)** (`docs/gdd/design-g13.md`, `docs/index.md`):
  - เกมแอคชั่น Catch & Stack อิงจาก [Scoops (NimbleBit)](https://www.onsecondscoop.com/2009/07/free-iphone-ipod-touch-game-for.html) + [Ice Cream Disaster](https://play.google.com/store/apps/details?id=com.capy.icecream) + ตัวอย่างวิดีโอ [m2-res_1080p.mp4](./gdd/image/m2-res_1080p.mp4)
  - กลไก: ลากโคนไอติมซ้าย-ขวารับสกู๊ป "ดี" (ข้อมูลถูกต้อง/พฤติกรรมดี เช่น "เช็กก่อนแชร์", ".go.th") หลบสกู๊ป "ร้าย" (ข้อมูลหลอก เช่น "กดรับเงินด่วน!", "bit.ly/xxx") — ซ้อนหอไอติมให้สูง + ระบบ wobble ตามความสูง
  - ไม่มี Game Over, ไม่หักดาวเมื่อเผลอรับสกู๊ปร้าย, จบเสมอ = ผ่านเสมอ — ตาม policy โครงการ
  - Component เสนอ: `G13ScoopStacker.tsx`, ข้อมูลสกู๊ป: `src/data/g13-scoop-items.json` (16 สกู๊ป + 2 พิเศษ)
  - จัดเป็น Format 3 (Motivation & Empowerment Action Game) ความสำคัญ Nice to Have, ยังไม่ผูก Topic/Sprint
  - ⚠️ **เอกสารอย่างเดียว ยังไม่แตะโค้ด** — รอทีมตอบ Open Questions 7 ข้อ + กำหนด Sprint
- **[UPDATE] G12 — แผงเฉลย / จุดสังเกต URL เป็น UI แบบ inline ใต้คอมเมนต์ ไม่ใช้ popup** (`docs/gdd/design-g12.md`):
  - ห้าม modal / overlay / slide-up ทับจอ — เฉลย, ส่องลิงก์, และสโลแกนแสดงในแผงติดใต้กล่องคอมเมนต์ คอมเมนต์กับกระดานยังมองเห็นได้
  - เพิ่ม §4.2 Inline Feedback Panel + ปรับ layout ASCII / scoring / art direction ให้สอดคล้อง
- **[NEW] เพิ่ม G12 — อย่ากดลิงก์จี้ ถ้าไม่รีบหยุดกด (Don't Click the Phish)** (`docs/gdd/design-g12.md`, `docs/gdd/01-mechanics.md`, `docs/index.md`):
  - เกม**ใหม่แยกจาก G11** — เรียนกลไกจาก [classic-chuzzle](https://github.com/TradeIdeasPhilip/classic-chuzzle): ลากหมุนแถว/คอลัมน์ จนกลุ่มสีเดียวกันที่ต่อกัน ≥ 3 (หรือ ≥ 4) แล้วเคลียร์ — ตัดบอมบ์/animation หนักเพื่อผู้สูงอายุ
  - ผสาน [G9](./gdd/design-g9.md) (กล่องคอมเมนต์ + ลิงก์อันตราย) กับแนว [G11](./gdd/design-g11.md) (นิ้วเลื่อนเข้าหาปุ่มกด) — เล่น Chuzzle ให้ทันก่อนนิ้วกด
  - กติกา: ทัน = ได้คะแนน + นิ้วหยุด + เฉลยลิงก์; ไม่ทัน = **ไม่หักคะแนน** + คำแนะนำ + สุ่มโจทย์ใหม่จนหมดเวลาเซสชัน (ไม่มี Game Over)
  - คืน `design-g11.md` เป็นไฟล์เดิม (หยุดนิ้ว! คิดก่อนกด — แตะมือ) และลงทะเบียนทั้ง G11 + G12 ใน Core Mechanics / Project Index
  - ⚠️ **เอกสารอย่างเดียว ยังไม่แตะโค้ด** — รอทีมจัด Sprint + ตอบ Open Questions
- **[NEW] วาง Sprint 07 + Epic E-WORLD — Top-Down Mini Prototype "รู้ทันกลางสายหมอก" (US-WORLD-01…09)** (`docs/agile/sprint-backlog/sprint-07.md`, `docs/agile/user-stories/US-WORLD-01.md`…`US-WORLD-09.md`, `docs/agile/01-product-backlog.md`, `docs/agile/02-sprint-planning.md`, `docs/index.md`):
  - รีวิว [04 Requirements Spec](./wiki/design/04-requirements-specification.md) + [05 Mini Prototype GDD](./wiki/design/05-mini-prototype-gdd.docx.md) → สรุปว่า **สร้างได้** เพราะมินิเกม 10 เกมที่ GDD ระบุ map 1:1 กับ component G1–G10 ที่มีอยู่แล้ว งานที่เหลือคือโลก top-down มาห่อให้เป็นเรื่องราว (ลดความรู้สึกเหมือนทำแบบทดสอบ)
  - **Key Decision: ใช้ Canvas 2D ไม่ใช่ Phaser** — จาก field feedback [MCI US-E9-07](/mnt/Storage-NVME1/PhaserProject/mci-attention-game-sorting-line/docs/agile/user-stories/US-E9-07.md) เครื่องสเปคต่ำ (Galaxy A10s, PowerVR GE8320, RAM 2–3GB) เข้า Phaser ไม่ได้; โลกนี้เป็นทางเดินเชื่อมมินิเกม ไม่ต้องการ engine เต็มตัว → Canvas 2D เบากว่า รองรับรูปภาพ+เอฟเฟคเบา cap FPS ง่าย (fallback DOM node-map ถ้ายังฝืด)
  - แตก 9 user stories ตาม 5 phase ของ GDD §26: US-WORLD-01 (Canvas world+เดิน), 02 (NPC+interaction), 03 (Event Bus + `MinigameResult` contract + migrate `onFinish` แบบ backward-compat), 04 (Dialogue), 05 (Quest/Incident/Day+สรุปวัน), 06 (เชื่อม G1–G10+Phone overlay), 07 (3 ค่าสถานะ+3 ตอนจบ), 08 (Save/Resume + จุดพัก "เล่นต่อ/พักก่อน"), 09 (Optimize A10s + a11y + emoji/SVG art)
  - ลงทะเบียน Epic E-WORLD ใน Product Backlog, เพิ่ม Sprint 07 (2026-10-12 → 2026-11-14, Planned/R&D) + gantt + risk เครื่องสเปคต่ำ ใน [Sprint Planning](./agile/02-sprint-planning.md), เพิ่มลิงก์ใน [index](./index.md)
  - ⚠️ **เอกสาร/แผนเท่านั้น ยังไม่แตะโค้ด** — Current Sprint ยังเป็น Sprint 03; ต้องแก้จุดที่ 04/05 ระบุ Phaser ให้สอดคล้องเมื่อเริ่มลงมือ (งานใน US-WORLD-01)
- **[NEW] เพิ่มเอกสารออกแบบ + พัฒนา Prototype เกม G7 วิ่งสู้ภัยไซเบอร์ (Cyber Runner) — US-GAME-07** (`docs/gdd/design-g7.md`, `src/components/G7CyberRunner.tsx`, `src/data/g7-hazards.json`, `src/app/dev/games/page.tsx`):
  - เขียน Detailed Design ก่อน (G7 เดิมมีแค่นิยามใน mechanics ตามกติกา AGENT "ห้ามเดาสเปกเอง"): auto-runner แบบ "วิ่งช้า ให้อภัยสูง ชนได้ไม่แพ้", การจัดการ Motion Sensitivity ของผู้สูงอายุ, คลังภัย และ event logging
  - พัฒนาเกมตามสเปก: ตัวละครอยู่ซ้าย ภัยเลื่อนเข้าจากขวาทีละ 1 อัน ความเร็วช้าคงที่ (ไม่เร่ง), **แตะที่ใดก็ได้ = กระโดด**, ข้ามสำเร็จ = +แต้มความมั่นใจ, ชน = หยุดฉาก + การ์ดสอนวิธีรับมือแล้ววิ่งต่อ — **ไม่มีจอแพ้/ไม่มีจับเวลา**
  - movement ใช้ `requestAnimationFrame` (ตามบทเรียน G5 เลี่ยง `setInterval`), รองรับ `prefers-reduced-motion` (ลดระยะกระโดด ไม่มี screen shake)
  - คลังภัย `src/data/g7-hazards.json` **8 อัน** (เบอร์แปลกโทรเข้า, SMS แนบลิงก์, โฆษณารวยเร็ว, ของรางวัลฟรี, ชวนลงทุน, ยาวิเศษ, ลิงก์ย่อ, อ้างเป็นตำรวจ) มี field `advice` + `ai_disclosure`
  - จบเกมส่งดาวผ่าน `onFinish(stars)` จาก first-try accuracy (≥80% = 3, ≥50% = 2, ต่ำกว่า = 1)
  - เชื่อมลิงก์ Detailed Design เข้า [01-mechanics.md](./gdd/01-mechanics.md), เปลี่ยนสถานะ G7 เป็น 🔨 Prototype, ลงทะเบียนใน [Dev Game Hub](./agile/user-stories/US-03-R4.md), อัปเดต User Story [`US-GAME-07`](./agile/user-stories/US-GAME-07.md) เป็น prototype
  - ✅ ตรวจแล้ว: `npx tsc --noEmit` + `eslint` ผ่าน, route `/dev/games` ตอบ HTTP 200 มีการ์ด G7, JSON 8 อันครบ field
  - ⚠️ **ยังไม่ได้ playtest คลิกเล่นจริงในเบราว์เซอร์** — ยังไม่ mark Acceptance Criteria เป็น done ตามกติกา AGENT ข้อ 1, คลังภัยรอทีมวิชาการตรวจ, ความเร็ว/หน้าต่างกระโดดรอจูนกับผู้สูงอายุจริง, ยังไม่ผูกเข้า flow ผู้เรียน
- **[NEW] เพิ่มเอกสารออกแบบรายละเอียดเกม G10 — นี้แอปฉัน นั้นแอปใคร? (Whose App Is That? / Spot the Fake App)** (`docs/gdd/design-g10.md`):
  - ร่างสเปกเกมจำลองหน้าจอรวมแอปในมือถือเป็น **ตารางไอคอน** ฝึกหา/ลบ **แอปปลอม** (แอปกู้เงิน/รีโมตดูดเงิน/ขอสิทธิ์เกิน) ออกจากเครื่อง โดยเก็บแอปจริงไว้
  - โครงสร้าง 3 เลเวล / 5 ด่าน ตามไอเดียทีม: เลเวล 1 ตาราง 2×2 (2 ด่าน), เลเวล 2 ตาราง 3×2 (2 ด่าน), เลเวล 3 ตาราง 3×3 แอปปลอมเหลือ 1 ตัวซ่อนในหมู่แอปจริง 8 ตัว (1 ด่าน) — ไอคอนใช้ชุดหน้าตาซ้ำเดิมให้ผู้สูงอายุจำง่าย
  - กำหนดจุดสังเกตแอปปลอม (ที่มาจากลิงก์ไม่ใช่ Store, ชื่อเลียนแบบ/สะกดเพี้ยน, ขอสิทธิ์เกิน เช่น อ่าน SMS/ควบคุมหน้าจอ), กลไกแตะตรวจ→ลบ, โครงสร้าง JSON `g10-app-items.json` และ event logging
  - **ตัดตัวจับเวลา (Timer) ออกจากภาพอ้างอิง** เพราะกติกาโครงการห้ามจับเวลากดดัน — ใช้ตัวนับ "เหลือแอปปลอมต้องหา" แทน
  - เชื่อมลิงก์ Detailed Design เข้า [01-mechanics.md](./gdd/01-mechanics.md) (เพิ่มหัวข้อ G10 ใต้รูปแบบที่ 2)
  - ⚠️ **เอกสารอย่างเดียว ยังไม่แตะโค้ด** — Draft/Proposal รอทีมยืนยันลำดับ Sprint + ทีมวิชาการตรวจคลังแอป ก่อนสร้าง prototype และ User Story `US-GAME-10`
- **[NEW] เพิ่มเอกสารออกแบบรายละเอียดเกม G9 — ลิงก์จี้หรือลิงก์จริง (Real or Fake Link)** (`docs/gdd/design-g9.md`):
  - ร่างสเปกเกมจำลองสถานการณ์ (รูปแบบที่ 2 เหมือน G6) จำลองหน้าฟีดโพสต์/ช่องคอมเมนต์แบบโซเชียลมีเดีย ฝึกแยก **ลิงก์ทางการจริง vs ลิงก์ปลอม** ด้วยกฎหลัก "หน่วยงานรัฐไทย = `.go.th` เท่านั้น"
  - โครงสร้าง 2 โหมด UI: ด่าน 1 = ฟีดโพสต์ (โฆษณาแปะลิงก์แอปกู้เงิน/จ่ายบิลปลอม/รีโมตดูดเงิน), ด่าน 2–3 = ช่องคอมเมนต์ (ลิงก์พนัน, ลิงก์ล่อ "อยู่ในคลิปนี้รึเปล่า?"/"ใครมาส่องโปรไฟล์คุณ")
  - กำหนดตารางกฎจุดสังเกต URL (ขีดกลางหลอกตา, โดเมนภาษาไทย, subdomain ลวง, TLD แปลก, แอปนอก Store), กลไก "🔍 ส่องลิงก์" ก่อนตัดสิน, โครงสร้าง JSON `g9-link-items.json` และ event logging
  - เชื่อมลิงก์ Detailed Design เข้า [01-mechanics.md](./gdd/01-mechanics.md) (เพิ่มหัวข้อ G9 ใต้รูปแบบที่ 2)
- **[UPDATE] G10: ปรับปุ่มปิดการ์ดตรวจสอบให้อยู่นอกกรอบ popup + เพิ่มปุ่ม "ครบแล้ว ✓" (จาก feedback)** (`src/components/G10WhoseApp.tsx`, `docs/gdd/design-g10.md`):
  - ปุ่มปิดการ์ดตรวจสอบเปลี่ยนจากลิงก์ตัวหนังสือ → **ปุ่มวงกลม X + ข้อความ "ปิด" อยู่นอกกรอบ popup บนพื้นมืด** (เด่นและกดง่ายขึ้น)
  - เพิ่มปุ่ม **"ครบแล้ว ✓"** ท้ายจอตาราง (คล้ายส่งคำตอบ): ลบปลอมครบ → ไปด่านต่อทันที, ยังเหลือ → popup เฉลยแอปที่มองข้าม (นับเป็นพลาดในการคิดดาว) แล้วไปต่อ — ไม่มีทางตัน/ไม่มีจอแพ้
  - อัปเดต flow ใน [design-g10.md](./gdd/design-g10.md): mermaid core loop, §5/§6 (ปุ่มปิด + ปุ่มครบแล้ว), §9 (การนับดาวเมื่อมองข้าม), §10 (event `stage_submit`)
  - ✅ ตรวจแล้ว: `tsc` + `eslint` ผ่าน, route 200
- **[NEW] พัฒนา Prototype เกม G10 นี้แอปฉัน นั้นแอปใคร? — US-GAME-10** (`src/components/G10WhoseApp.tsx`, `src/data/g10-app-items.json`, `src/app/dev/games/page.tsx`):
  - พัฒนาเกมตามสเปกใน [design-g10.md](./gdd/design-g10.md): 5 ด่าน (ตาราง 2×2 ×2 → 3×2 ×2 → 3×3 ×1), แตะแอปเปิดการ์ดตรวจสอบ (ชื่อ/ที่มา Store-ลิงก์/สิทธิ์ที่ขอ พร้อมไฮไลต์สิทธิ์อันตราย) → ลบปลอม/เก็บจริง, การ์ดเฉลย + red flags, ด่านผ่านเมื่อลบแอปปลอมครบ, ตัวนับ "เหลือแอปปลอมต้องหา", ปุ่มเสียงอ่าน
  - คลังแอป `src/data/g10-app-items.json` **22 รายการ** (จริง 12 + ปลอม 10) — **ไอคอน emoji ชุดเดียวกันทั้งจริงและปลอม** (ต่างที่ชื่อ/ที่มา/สิทธิ์) ตามหลักการ "หน้าตาเหมือนกันให้ผู้สูงอายุจำง่าย"
  - ไม่มีจับเวลา/จอแพ้ — ลบผิด/เก็บผิดได้การ์ดนุ่มนวล แอปยังอยู่ให้แก้ใหม่ (ไม่มี dead-end)
  - ลงทะเบียนใน [Dev Game Hub](./agile/user-stories/US-03-R4.md) — badge "🏗️ Prototype", เพิ่ม User Story [`US-GAME-10`](./agile/user-stories/US-GAME-10.md)
  - ✅ ตรวจแล้ว: `npx tsc --noEmit` + `eslint` ผ่าน, route `/dev/games` ตอบ HTTP 200 มีการ์ด G10, JSON 22 รายการ (real 12/fake 10) ครบ field
  - ⚠️ **ยังไม่ได้ playtest คลิกเล่นจริงในเบราว์เซอร์** — ยังไม่ mark Acceptance Criteria เป็น done ตามกติกา AGENT ข้อ 1, คลังแอปรอทีมวิชาการตรวจ, ยังไม่ผูกเข้า flow ผู้เรียน
- **[UPDATE] ปรับ layout เกม G9 ให้ตรงโครง Facebook จริง + เพิ่มเคส URL ยาว (จาก feedback playtest)** (`src/components/G9LinkInspector.tsx`, `src/data/g9-link-items.json`, `docs/gdd/design-g9.md`):
  - โพสต์: หัวโพสต์มี avatar + ชื่อเพจ + **verified badge** + บรรทัด "ได้รับการสนับสนุน"/เวลา + ไอคอนโลก, URL สีน้ำเงินในเนื้อ, และ **การ์ดพรีวิวลิงก์แบบ FB** (แถบ hostname ตัวใหญ่ + หัวข้อลิงก์)
  - คอมเมนต์: แสดง **โพสต์ต้นเรื่อง + แถบ engagement (ถูกใจ/คอมเมนต์/แชร์) + "ความคิดเห็นทั้งหมด"** แล้วตามด้วย comment card (avatar + ชื่อ + badge + เวลา + การ์ดลิงก์) ตามภาพอ้างอิงที่ทีมส่งมา
  - **เพิ่มเคสเลเวล 3 "URL ยาวมี path แต่เป็นของจริง"** `sabuyservice.pea.co.th/sub-menu/4fc04d8e-...` (โดเมนหลัก pea.co.th) คู่กับ "URL ยาวแต่ปลอม" `gov-support.rd-go-th.com/verify/...` — สอนว่า **ความยาว/รหัสท้ายไม่ใช่จุดตัดสิน ให้ดูโดเมนหลัก**
  - ปรับกฎที่สอนจาก "ส่วนติดก่อน / แรก" เป็น **"โดเมนหลัก (registrable)"** ครอบคลุมทั้ง `.go.th` (รัฐ) และ `.co.th` (บริษัท/รัฐวิสาหกิจไทย) — คลังโจทย์ L3 เพิ่มเป็น 8 ข้อ (safe 3/fake 5)
  - ✅ ตรวจแล้ว: `tsc` + `eslint` ผ่าน, route 200, JSON ครบ field (verified/link_headline/parent_author) และ owner_domain อยู่ใน link_full ทุกข้อ
- **[NEW] พัฒนา Prototype เกม G9 ลิงก์จี้หรือลิงก์จริง — US-GAME-09** (`src/components/G9LinkInspector.tsx`, `src/data/g9-link-items.json`, `src/app/dev/games/page.tsx`):
  - พัฒนาเกมตามสเปกใน [design-g9.md](./gdd/design-g9.md): 3 ด่าน (ฟีดโพสต์ → คอมเมนต์ → คอมเมนต์เนียนสุด) ด่านละ 5 ข้อ, ปุ่ม "🔍 ส่องลิงก์" เปิด URL เต็มพร้อมไฮไลต์โดเมนเจ้าของจริง (ส่วนติดก่อน `/` แรก), ตัดสิน ✓ ทางการ / ✗ ปลอม, การ์ดเฉลย + red flags + กฎ .go.th, การ์ดสรุปท้ายด่าน, ปุ่มเสียงอ่าน TTS
  - คลังโจทย์ `src/data/g9-link-items.json` **18 ข้อ** (6/ด่าน สุ่มเล่น 5) — ครอบคลุมขีดกลางหลอกตา, โดเมนภาษาไทย, subdomain ลวง, ลิงก์ล่อจิตวิทยา, แอปกู้เงิน/พนัน + เคสลิงก์ `.go.th` จริง
  - **จำลองโซเชียลกลางๆ ไม่ใช้โลโก้แบรนด์จริง** และ **ลิงก์ทุกอันเป็น string กดไม่ออกเว็บจริง** (กันกดลิงก์อันตรายจริง)
  - ลงทะเบียนใน [Dev Game Hub](./agile/user-stories/US-03-R4.md) — badge "🏗️ Prototype", เพิ่ม User Story [`US-GAME-09`](./agile/user-stories/US-GAME-09.md)
  - ✅ ตรวจแล้ว: `npx tsc --noEmit` + `eslint` ผ่าน, route `/dev/games` ตอบ HTTP 200 มีการ์ด G9, JSON 18 ข้อสมดุล (safe 2/fake 4 ต่อด่าน, owner_domain อยู่ใน link_full ครบ)
  - ⚠️ **ยังไม่ได้ playtest คลิกเล่นจริงในเบราว์เซอร์** — ยังไม่ mark Acceptance Criteria เป็น done ตามกติกา AGENT ข้อ 1, คลังโจทย์รอทีมวิชาการตรวจ, ยังไม่ผูกเข้า flow ผู้เรียน
- **[NEW] เพิ่มเอกสารออกแบบรายละเอียดเกม G4 — แชร์ดีไหม? (Privacy & Online Safety Game)** (`docs/gdd/design-g4.md`):
  - ร่างสเปกเกมตอบคำถามฝึกปกป้องความเป็นส่วนตัวออนไลน์ (Online Privacy) — แสดงภาพจำลองสิ่งที่ผู้สูงอายุมักแชร์ (บัตรประชาชน, ทะเบียนรถ, เช็คอินพิกัดบ้าน ฯลฯ) ให้ตัดสินใจ **แชร์ได้ปลอดภัย / ไม่ควรแชร์ / ไม่แน่ใจ ต้องเช็กก่อน**
  - ออกแบบตัวเลือกที่ 3 "ไม่แน่ใจ / ต้องเช็กก่อน" ให้เป็น **คำตอบที่ได้รับคำชม** (ไม่ใช่คำตอบผิด) ตาม Acceptance Criteria ข้อ 6 ของ [US-GAME-04](./agile/user-stories/US-GAME-04.md)
  - กำหนดคลังโจทย์แบบ data-driven (`src/data/g4-privacy-items.json`) พร้อม `category` จัดกลุ่มวิเคราะห์เชิงวิชาการ, ระบบเฉลยอธิบายผลกระทบ, ป้าย `ai_disclosure` และ event logging — component เป้าหมาย `G4ShareOrNot.tsx` คุยกับ `GameShell` ผ่าน `onFinish`/`logEvent`
  - เชื่อมลิงก์ Detailed Design เข้า [01-mechanics.md](./gdd/01-mechanics.md) (หัวข้อ G4) ให้ครบชุดเดียวกับ G5/G6/G8
- **[NEW] พัฒนา Prototype เกม G4 แชร์ดีไหม? — US-GAME-04** (`src/components/G4ShareOrNot.tsx`, `src/data/g4-privacy-items.json`, `src/app/dev/games/page.tsx`):
  - พัฒนาเกมตามสเปกใน [design-g4.md](./gdd/design-g4.md): เกมตอบคำถาม 3 ตัวเลือก (✓ แชร์ได้ / ✗ ไม่ควรแชร์ / ❓ ไม่แน่ใจ), หน้าเฉลยอธิบายผลกระทบ + แท็ก impact + เกณฑ์วิเคราะห์ 3 ข้อ, ปุ่มเสียงอ่าน TTS, progress dots และคำนวณดาวเบื้องหลัง
  - ตัวเลือก **"ไม่แน่ใจ / ต้องเช็กก่อน" = ได้รับคำชม** (นับเป็นพฤติกรรมปลอดภัยในโจทย์ no_share) ตาม Acceptance Criteria ข้อ 6
  - คลังโจทย์ `src/data/g4-privacy-items.json` **8 ข้อ** (ไม่ควรแชร์ 5 / แชร์ได้ 3) — **ใช้ emoji เป็นภาพชั่วคราว** (ยังไม่มี assets จริง), ป้าย `ai_disclosure` wire rendering ไว้แล้วแต่ข้อมูลตั้ง `false` ทุกข้อ
  - ลงทะเบียนใน [Dev Game Hub](./agile/user-stories/US-03-R4.md) — G4 เปลี่ยนจาก "ยังไม่พัฒนา" เป็น badge "🏗️ Prototype" กดเข้าเล่นได้
  - ✅ ตรวจแล้ว: `npx tsc --noEmit` + `eslint` ผ่าน (ไม่มี error/warning), route `/dev/games` ตอบ HTTP 200 มีการ์ด G4, JSON 8 ข้อถูกต้อง
  - ⚠️ **ยังไม่ได้ playtest คลิกเล่นจริงในเบราว์เซอร์** (component โหลดแบบ dynamic ssr:false) — ยังไม่ mark Acceptance Criteria เป็น done ตามกติกา AGENT ข้อ 1, คลังโจทย์ยังรอทีมวิชาการ NAPLAB ตรวจ, ยังไม่ผูกเข้า flow ผู้เรียน
- **[UPDATE] ปรับหน้ารวมเกม (Dev Game Hub) ให้แสดงป้ายสถานะรายเกม** (`src/app/dev/games/page.tsx`):
  - เพิ่ม badge สถานะ 4 แบบ (✅ เสร็จแล้ว / 🔍 รอตรวจ QA / 🏗️ Prototype / ⬜ ยังไม่พัฒนา) ในทุกการ์ด แทนป้าย "ยังไม่พัฒนา" เดิมที่บอกแค่เล่นได้/ไม่ได้ — สะท้อนสถานะจริงหลัง merge origin/main: G1/G2 เสร็จ, G3/G5/G6 รอ QA, G8 prototype, G4/G7 ยังไม่พัฒนา
  - ✅ ตรวจแล้ว: `npx tsc --noEmit` และ `eslint` ผ่านไม่มี error/warning

## 2026-07-19
- **[NEW] พัฒนา Prototype เกม G8 กระโดดแพรู้ทันมิจ — US-GAME-08** (`src/components/G8RaftCrossing.tsx`, `src/data/g8-raft-items.json`, `src/app/globals.css`, `src/app/dev/games/page.tsx`):
  - พัฒนาเกมตามสเปกใน [design-g8.md](./gdd/design-g8.md) ครบทุกกลไก: เลือกแพแบบแตะ 2 จังหวะ (แตะอ่าน → แตะยืนยันกระโดด), ห่วงยาง 5 หน่วย, โบนัสห่วงยางเมื่อกระโดดถูกครบ 5 แพติดกัน, เรือกู้ภัยแทนหน้าจอแพ้, จบด่าน และหน้าสรุปดาว
  - **ใช้ emoji + CSS gradient เป็นกราฟิกชั่วคราว** (ทะเลสาบไล่สี, ตัวละคร 🧓, ห่วงยาง 🛟, ธง 🚩) ยังไม่ต้องรอ assets จริงจากทีมออกแบบ
  - สร้างคลังโจทย์ `src/data/g8-raft-items.json` รวม **30 ข้อ** (SMS 18 + สายโทรเข้า 12) แต่ละข้อมี `red_flags` และ `explain` — ระบบจั่วโจทย์แบบไม่ซ้ำภายในหน้าจอเดียว (deck without replacement) และตรวจแล้วว่าทุกด่านมีโจทย์พอ
  - เพิ่มสไตล์ `.g8-*` ใน `globals.css` — ผิวน้ำไหว, แพลอย, อนิเมชั่นกระโดด, การเลื่อนฉาก พร้อม `@media (prefers-reduced-motion: reduce)` ที่ปิดการเคลื่อนไหวทั้งหมดและเปลี่ยนการเลื่อนฉากเป็น fade
  - ลงทะเบียนเกมใน [Dev Game Hub](./agile/user-stories/US-03-R4.md) — G8 เปลี่ยนจาก "ยังไม่พัฒนา" เป็นกดเข้าเล่นได้
  - เพิ่ม User Story [`US-GAME-08`](./agile/user-stories/US-GAME-08.md) พร้อมระบุขอบเขต prototype ชัดเจน (สิ่งที่ทำ/ไม่ทำในรอบนี้) และบรรจุเข้า [Sprint 03 polishing](./agile/sprint-backlog/sprint-03-polishing.md) + อัปเดตสถานะ G8 ใน [01-mechanics.md](./gdd/01-mechanics.md)
  - ⚠️ **ยังไม่ผูกเข้า flow ผู้เรียน** (`/lessons/[id]/game`) และยังไม่บันทึกดาวลงระบบจริง — เข้าถึงได้ทาง `/dev/games` เท่านั้นจนกว่าทีมจะอนุมัติ เพราะ Sprint 03 มีงาน QA + migration ค้างอยู่ก่อนงานอบรมเชียงใหม่
  - ✅ ตรวจสอบจริงแล้ว: `npx tsc --noEmit` และ lint ผ่าน, เล่นจบครบ 5 ด่านทั้งแบบเล่นถูกทั้งหมด (ได้ 3 ดาว โบนัสห่วงยางทำงาน) และแบบเล่นผิด (เห็นการ์ดเฉลย + เรือกู้ภัย + ได้ 1 ดาว), ยิง event ครบ 91–149 รายการต่อรอบ, ไม่มี JS error, หน้าจอ 390×844 และ 360×640 แสดงแพครบ 5 แถวโดยไม่ต้องเลื่อนจอและไม่ล้นแนวนอน
  - 🔎 **ข้อสังเกตรอ User Testing:** ข้อความตัวอย่างบนแพใช้ฟอนต์ 17px (ต่ำกว่ากติกา ≥20px) เพราะต้องใส่แพ 5 แถวในหน้าจอเดียวโดยไม่ให้เลื่อน — ข้อความเต็มในการ์ดขยายอ่านใช้ 22px ตามกติกา ต้องให้ผู้สูงอายุจริงลองอ่านก่อนสรุปว่ารับได้ไหม
- **[NEW] เพิ่มหน้ารวมเกมสำหรับทดสอบ (Dev Game Hub) — US-03-R4** (`src/app/dev/games/page.tsx`, `src/proxy.ts`, `src/components/AppLayout.tsx`, `.env.example`, `docs/agile/`):
  - สร้าง route `/dev/games` แสดงเกมทั้งหมด 8 รายการเป็นการ์ด (G1, G2, G3, G5, G6 กดเข้าเล่นได้ทันที ส่วน G4, G7, G8 แสดงสถานะ "ยังไม่พัฒนา") เพื่อเร่งงาน QA เกม G3/G5/G6 ที่ยังค้างอยู่ใน Sprint 03 ก่อนงานอบรมเชียงใหม่
  - ใช้ **mock `onFinish` และ mock `logEvent`** แทนของจริง — จบเกมแล้วแสดงจำนวนดาวที่เกมส่งกลับมาเป็น overlay พร้อมปุ่ม "เล่นใหม่"/"กลับหน้ารวมเกม" โดยไม่บันทึก progress และไม่ยิง event เข้าตาราง `action_logs` เพื่อไม่ให้ข้อมูลรอบทดสอบปนกับข้อมูลที่ทีมวิชาการใช้วิเคราะห์
  - เพิ่ม **แผงแสดง event log แบบเรียลไทม์** ท้ายหน้าจอ แสดงชื่อ event + payload + เวลา เพื่อให้ QA ตรวจได้ว่าเกมยิง log ครบตามสเปก (ตรวจจริงแล้วพบว่า G1 ยิงครบ 11 event ตลอดการเล่นหนึ่งรอบ)
  - เพิ่ม `/dev` เข้า whitelist ของ Middleware Guard ใน `src/proxy.ts` (เดิมถูกดักและ redirect ไป `/consent` ด้วยสถานะ 307) และให้ `AppLayout` ข้าม chrome ของผู้เรียน (header/progress bar) รวมถึง**ไม่สร้าง session** เมื่ออยู่ใต้ path `/dev` เพื่อไม่ให้เหลือร่องรอยในคุกกี้/localStorage
  - **ปิดกั้นบน production โดยค่าเริ่มต้น** — ต้องตั้ง env `NEXT_PUBLIC_ENABLE_DEV_HUB=true` เท่านั้นจึงเข้าได้ (เพิ่มตัวแปรใน `.env.example` และตาราง Environment variables ใน [คู่มือ deploy Portainer](./wiki/deploy-camt/docker-portainer-guide.md)) ⚠️ ห้ามเปิดบนเครื่องที่ผู้สูงอายุใช้งานจริงหน้างานอบรม
  - เพิ่ม User Story [`US-03-R4`](./agile/user-stories/US-03-R4.md) และบรรจุเข้าตารางงาน + Gantt ของ [Sprint 03 polishing](./agile/sprint-backlog/sprint-03-polishing.md)
  - ✅ ตรวจสอบจริงแล้ว (ไม่ได้ mark done จากการอ่านโค้ด): `npx tsc --noEmit` และ `npm run build` ผ่าน, รัน dev server แล้วเปิด `/dev/games` ได้สถานะ 200 พร้อมการ์ดครบ 8 ใบ, เล่นเกม G1 จนจบเห็น overlay "ได้ 1 ดาว", คุกกี้และ localStorage ว่างเปล่าหลังเล่นจบ, และทดสอบ production build โดยไม่ตั้ง env แล้วพบข้อความ "หน้ารวมเกมถูกปิดใช้งาน" ตามที่ออกแบบไว้
- **[NEW] เพิ่มเอกสารออกแบบรายละเอียดเกม G8 — กระโดดแพรู้ทันมิจ (Safe Raft Crossing)** (`docs/gdd/design-g8.md`):
  - ร่างสเปกเกมคัดแยกข้อความ SMS และสายโทรเข้าของมิจฉาชีพ นำเสนอในรูปแบบเกมกระโดดข้ามแพในทะเลสาบ (อ้างอิงรูปแบบเกมกบกระโดดใบบัว) โดยเปลี่ยนใบบัวเป็นแพข้อความและเปลี่ยนกบเป็นตัวละครคนตัวแทนผู้สูงวัย
  - กำหนดโครงสร้าง 5 ด่าน ไล่ระดับจาก SMS ล้วน → สายโทรเข้าล้วน (ชื่อผู้โทร + เบอร์แปลก) → ผสมทั้งสองชนิด พร้อมคลังโจทย์ตัวอย่างและโครงสร้างข้อมูล JSON แบบ data-driven (`red_flags`, `explain`, `ai_disclosure`)
  - กำหนด **กติกากล้องนิ่ง (Static Camera Rule)** — 1 หน้าจอแสดงแพคงที่ 5 แถว ฉากเลื่อนครั้งเดียวเมื่อกระโดดครบหน้าจอ เพื่อลดอาการเวียนศีรษะของผู้สูงอายุจากภาพเคลื่อนไหวต่อเนื่อง พร้อมรองรับ `prefers-reduced-motion`
  - ออกแบบ **ระบบห่วงยาง 5 หน่วย** (ตกน้ำเสียห่วงยาง 1, กระโดดถูกครบ 5 แพได้เพิ่ม 1) โดยปรับให้สอดคล้องกติกาโครงการ: เมื่อห่วงยางหมดจะ**ไม่มีหน้าจอแพ้ (Game Over)** แต่ใช้ระบบ "เรือกู้ภัยใจดี" พาไปทบทวนจุดสังเกตแล้วเล่นต่อจากแพเดิม ตาม [03-art-direction.md](./gdd/03-art-direction.md)
  - ระบุการควบคุมแบบแตะ 2 จังหวะ (แตะอ่าน → แตะยืนยันกระโดด) ไม่มีการจับเวลา, สเปกทางเทคนิคของ component `G8RaftCrossing` ที่คุยกับ `GameShell` ผ่าน `onFinish(stars)`/`logEvent` และรายการ event ที่ต้องบันทึกลง `action_logs`
  - เพิ่มหัวข้อ G8 ใน [01-mechanics.md](./gdd/01-mechanics.md) (กลุ่มรูปแบบที่ 3 Motivation & Empowerment) และเพิ่มหมวด "Detailed Game Design (ราย G-number)" ใน `docs/index.md` รวมลิงก์เอกสารออกแบบของ G5/G6/G8
  - ⚠️ ยังเป็นสถานะ **ข้อเสนอ (Proposal)** — ยังไม่ได้จัดลำดับความสำคัญและยังไม่มี User Story `US-GAME-08` ในระบบ Backlog (มี Open Questions รอทีมตัดสินใจ 4 ข้อในท้ายเอกสาร) และยังไม่แนะนำให้แทรกก่อนงานอบรมเชียงใหม่ 6–7 ส.ค.
- **[UPDATE] เปลี่ยนกลไกหลักของเกม G6 จำลองแชท LINE จาก "แตะจุด Red Flag" เป็น "เลือกตอบกลับ" (`docs/gdd/design-g6.md` v2.0, `src/components/G6LineSimulation.jsx`, `docs/agile/user-stories/US-GAME-06.md`, `docs/agile/sprint-backlog/sprint-03-polishing.md`):**
  - บทสนทนาในแต่ละสถานการณ์ทยอยขึ้นเองอัตโนมัติทีละฟอง (พร้อม Typing Indicator) แทนการให้ผู้เล่นแตะหาจุดผิดปกติเอง
  - เมื่ออ่านจบ ผู้เล่นเลือกตอบกลับ 1 ใน 3 ทาง: **ยอมรับ** (เสี่ยง), **ปฏิเสธ**, หรือ **นิ่งเฉย** (ทั้งสองแบบหลังถือว่าปลอดภัยเท่ากัน — ไม่มีการชี้ว่าทางใดดีกว่ากัน เนื่องจากเป็นประเด็นที่ควรให้ทีมวิชาการ NAPLAB ตัดสินใจ ไม่ใช่การกำหนดขึ้นเอง)
  - เพิ่มเนื้อหาข้อความเฉลยผลลัพธ์ต่อทางเลือก (9 ข้อความ ครบ 3 สถานการณ์ × 3 ทางเลือก) ปรับสูตรคำนวณดาวจากสัดส่วนทางเลือกที่ปลอดภัย
  - ปรับปุ่มตอบกลับให้เป็นปุ่มเต็มความกว้าง (min-height 64px) แทนแถวไอคอนเล็กในภาพอ้างอิงตั้งต้น เพื่อให้ผ่านเกณฑ์ Accessibility ขั้นต่ำ 48×48px ของโครงการ
  - ระหว่างตรวจสอบด้วยเบราว์เซอร์จริง (Playwright) พบและแก้บั๊ก layout: กรอบแชทจำลองยุบเหลือ 6px เมื่อเพิ่มการ์ดผลลัพธ์ใหม่ (ปัญหา flexbox `min-height:auto` รีเซ็ตเป็น 0 เมื่อ element มี `overflow: hidden`) — แก้ด้วย `shrink-0`
  - ทดสอบเล่นจริงครบ 3 สถานการณ์ผ่านเบราว์เซอร์จนจบเกมและได้รับดาวถูกต้อง ไม่มี console error
  - อัปเดต Acceptance Criteria ข้อ 3–5 และ Technical Tasks ใน US-GAME-06 ให้ตรงกับกลไกใหม่ ปรับบรรทัดสรุปงานใน sprint-03-polishing.md
- **[NEW] เพิ่ม Analytics API สำหรับสรุปข้อมูล Event Log (`src/lib/analytics.ts`, `src/app/api/action-logs/route.ts`):**
  - เพิ่มฟังก์ชัน `getActionLogAnalytics()` ดึงข้อมูลสรุป (aggregate) จากตาราง `action_logs` แยกตาม `event_name`, `page_url` และรายวัน พร้อมตัวกรอง `from`/`to`/`event_name`/`session_id`
  - เพิ่ม `GET /api/action-logs` เพื่อเรียกใช้ฟังก์ชันนี้ผ่าน HTTP, ตรวจสอบความถูกต้องของพารามิเตอร์วันที่ (คืน `400` ถ้า parse ไม่ได้)
  - ทดสอบยืนยันกับฐานข้อมูลจริง (229 แถวใน `action_logs`) และเรียกผ่าน dev server จริงแล้วได้ผลลัพธ์ถูกต้อง
  - เพิ่มเอกสารวิธีเรียกใช้ที่ [docs/software/03-data-schema.md § Analytics API](./software/03-data-schema.md#analytics-api-get-apiaction-logs) และอัปเดตบรรทัดอ้างอิงใน [docs/software/02-architecture.md](./software/02-architecture.md#22-backend--server-api-layer-nextjs-api-route-handlers)
- **[NEW] เพิ่มเอกสารรายละเอียดและข้อกำหนดเซสชัน (Session Specification)** (`docs/software/06-session-specification.md`):
  - สร้างเอกสารข้อกำหนดเชิงเทคนิคในการระบุตัวตนผู้ใช้และการทำ Session ID (UUID v4) พร้อมระบบสุ่มทดแทน (Fallback)
  - อธิบายกลไกสำรองคู่ออฟไลน์ฝั่งไคลเอนต์ (LocalStorage & Cookie Backup) เพื่อป้องกันข้อมูลสูญหายบน LINE WebView
  - รวบรวมแนวทางเลือกสำหรับการจัดการโอนย้ายเซสชันข้ามเบราว์เซอร์บนเครื่องเดียวกันโดยไม่ต้องเข้าสู่ระบบ เช่น URL Parameter Handoff, Short PIN Code, Browser Fingerprinting และ IP+GPS Clustering
  - อัปเดตไฟล์ดัชนีโครงการ `docs/index.md` ในหมวด Software Design
- **[UPDATE] ปรับปรุง App Flow สำหรับเข้าทำแบบทดสอบแบบคัดแยกกลุ่ม (Split-Path / Optional Testing)** (`src/proxy.ts`, `src/app/consent/page.tsx`, `src/app/pretest/page.tsx`, `src/app/posttest/page.tsx` และ `docs/`):
  - พัฒนาโครงสร้างการทำงานใหม่ให้ผู้ใช้ปกติข้าม Pre-test และ Post-test ทั้งหมดไปยังหน้า `/lessons` และ `/certificate` ได้ทันทีโดยไม่ถูกบังคับดัก
  - กำหนดช่องทางทำข้อสอบเฉพาะกลุ่มเป้าหมาย (Test Group) เมื่อเริ่มเข้าสู่ระบบผ่านลิงก์พาร์ทพิเศษ `/pretest` หรือ `/posttest` โดยระบบจะบันทึกตัวแปร `isTestingGroup: true` ลงในเซสชันคุกกี้โดยอัตโนมัติ
  - เพิ่มการตรวจสอบและส่งต่อพารามิเตอร์ `?redirect=/pretest` ไปยังหน้าลงทะเบียนยินยอมข้อมูล `/consent` เพื่อดึงผู้ใช้เฉพาะกลุ่มกลับมาเข้าทำข้อสอบ Pre-test หลังจากเสร็จสิ้นขั้นตอน Onboarding
  - ลบไฟล์ซ้ำซ้อน `src/middleware.ts` เพื่อป้องกันปัญหาชนกันกับไฟล์ระบบหลักที่โครงการตั้งชื่อไว้ว่า `src/proxy.ts`
  - อัปเดตผังและคู่มือการเชื่อมต่อข้อสอบใน [06-quiz-spec.md](./docs/gdd/06-quiz-spec.md) และเอกสารการไหลข้อมูล [04-application-flow.md](./docs/software/04-application-flow.md)
- **[NEW] เพิ่มเอกสารข้อมูลแบบทดสอบก่อนเรียน (Pre-test) และหลังเรียน (Post-test)** (`docs/gdd/06-quiz-spec.md`):
  - สร้างเอกสารข้อกำหนดและข้อมูลข้อสอบ Pre-test และ Post-test ระบุรายละเอียดคำถาม ข้อความภาษาไทย ตัวเลือก เฉลยข้อที่ถูกต้อง และคำอธิบายเฉลยที่ใช้ในระบบ
  - อธิบายโฟลว์ระบบ (Application Flow) และกลไกของระบบ Middleware Guard สำหรับควบคุมสิทธิ์การเข้าถึงและการเปลี่ยนเส้นทางของผู้เรียนสูงอายุ
  - ระบุโครงสร้างตารางระบบฐานข้อมูล Supabase ที่เกี่ยวข้อง ได้แก่ `quiz_questions`, `quiz_options`, `quiz_attempts` และ `quiz_answers` พร้อมทั้งรายละเอียด API endpoints
  - แก้ไขไวยากรณ์แผนภาพ Mermaid (Mermaid Graph Syntax Error) โดยใส่เครื่องหมายอัญประกาศครอบชื่อพาร์ทเพื่อแก้ไขข้อผิดพลาดในการเรนเดอร์กราฟ
  - อัปเดตไฟล์ดัชนีโครงการ `docs/index.md` ให้เข้ากับหมวดหมู่ Game Design
- **[UPDATE] ปรับเปลี่ยน Core Stack: Next.js + TypeScript, Tailwind CSS + shadcn/ui, React Hook Form + Zod, Supabase (Database, Auth, Storage, Real-time), ชุดการทดสอบ Vitest + Playwright, และกลยุทธ์ PWA/Offline-First** (`docs/software/`, `docs/gdd/` และ `docs/wiki/design/`):
  - ปรับเปลี่ยนสถาปัตยกรรมระบบและโครงสร้าง Stack เป็น Next.js App Router (TypeScript) ร่วมกับการใช้ Postgres Database ในโปรเจกต์เดียว (Single Project Monorepo) จัดการทั้ง Frontend และ Backend ในที่เดียวกัน
  - แนะนำและกำหนดสไตล์และคอมโพเนนต์ด้วย Tailwind CSS และ shadcn/ui เพื่อเพิ่มความยืดหยุ่นในการพัฒนาและปรับแต่งสไตล์ Accessibility สำหรับผู้สูงอายุ
  - แนะนำและเพิ่มเติมระบบจัดการแบบฟอร์ม (Form Management) ด้วย React Hook Form ร่วมกับ Zod ในการทำ Schema Validation เพื่อตรวจสอบความถูกต้องของข้อมูลทั้งฝั่ง Client และ Server API
  - กำหนดให้ใช้ Supabase (PostgreSQL, Auth, Storage และ Real-time) เป็นบริการหลังบ้านครบวงจรแทนระบบจัดการ VM Database ด้วยตนเอง
  - กำหนดโครงสร้างการทดสอบระบบ (Testing Framework) โดยใช้ Vitest สำหรับตรวจสอบตรรกะประมวลผล (Logic/Unit Tests) และใช้ Playwright สำหรับการทดสอบโฟลว์ผู้ใช้จริง (E2E User Journey Flow) บนจำลองเบราว์เซอร์มือถือ
  - กำหนดกลยุทธ์การทำ PWA และระบบทำงานแบบออฟไลน์ (Offline-First Strategy) โดยชี้แจงการทำงานของ Service Worker แคชทรัพยากรบน LINE WebView และกลไกบันทึกคิวข้อมูลออฟไลน์ (Offline Synchronization Queue) ฝั่ง Client
  - อัปเดต `docs/software/01-system-design.md` และ `docs/software/02-architecture.md` เพื่อปรับปรุงคำอธิบาย, ภาพรวม Mermaid Flowchart/Sequence Diagram ในการทำ Single Project Architecture, UI Styling Layer, Form Management Layer, Backend Layer (Supabase) และเพิ่มส่วนแนวทางการทดสอบ (Testing Strategy) รวมถึงกลยุทธ์ทำงานออฟไลน์ (PWA & Offline Strategy)
  - อัปเดต `docs/software/04-application-flow.md` เพื่อแปลงโครงสร้างเส้นทางหน้าจอจาก React SPA (React Router) มาเป็น Next.js directory-based routes (`app/page.tsx`, `app/consent/page.tsx` ฯลฯ) พร้อมอธิบายระบบป้องกันเส้นทาง (Router Guards) ด้วย Next.js Middleware (`middleware.ts`)
  - อัปเดต `docs/gdd/00-concept.md` และ `docs/index.md` ในส่วนตาราง Technical Stack และคำอธิบายความพร้อมของระบบ
  - อัปเดต `docs/software/03-data-schema.md` ในส่วนการระบุ Stack ของฐานข้อมูลหลัก เป็น Supabase (PostgreSQL, Auth, Storage, Real-time)
  - อัปเดต `docs/wiki/design/02-website-design-tokens.md` และ `03-application-guideline.md` เพื่อสาธิตการผูกค่าดีไซน์โทเค็นระดับจังหวัดและขนาดฟอนต์เข้ากับ `tailwind.config.ts` และการเขียน CSS variables ใน `app/globals.css` สำหรับการใช้ร่วมกับ shadcn/ui components รวมถึงตัวอย่างการเขียน Onboarding Schema Validation และ React Component ด้วย React Hook Form + Zod
  - เพิ่มเติมชุด User Stories การอพยพโครงสร้างเทคโนโลยี (`docs/agile/user-stories/US-MIGRATE-01.md` ถึง `US-MIGRATE-04.md`) และปรับปรุงแผนการทำงานใน `docs/agile/sprint-backlog/sprint-03-polishing.md`, `docs/agile/02-sprint-planning.md` และ `docs/agile/01-product-backlog.md` เพื่อบรรจุงานย้ายสแตกและชุดระบบทดสอบเข้าสู่แผน Sprint 3 อย่างเป็นทางการ
- **[NEW] สร้าง Supabase Project จริงสำหรับใช้งาน**:
  - สร้างโปรเจกต์ Supabase ชื่อ **ML Project** ด้วยบัญชี `admin.naplab@camt.info`
  - Project ID: `oiebsnikzjhzviixuvft`
  - ⚠️ รหัสผ่าน DB และ Secret Key **ไม่ได้บันทึกไว้ในเอกสารนี้** (ไฟล์ใน `docs/` ถูก commit เข้า git) — เก็บไว้ใน password manager หรือใส่ในไฟล์ `.env.local` (อยู่ใน `.gitignore` แล้ว) แทน
  - ยังไม่ได้เชื่อมต่อ credentials เข้ากับโค้ด/`.env.local` จริง — รอดำเนินการต่อ

## 2026-07-18
- **[UPDATE] ระบบบันทึก Log การใช้งาน และระบบแบบทดสอบ Pretest & Posttest** (`docs/software/` และ `docs/supabase-schema.sql`):
  - อัปเดต `docs/supabase-schema.sql` โดยการเพิ่มโครงสร้างตาราง `page_views` (Log การเข้าใช้งานพร้อมระบบเก็บเวลาและ Referrer), `quiz_questions`, `quiz_options`, `quiz_attempts` และ `quiz_answers` พร้อมทั้งเปิดสิทธิ์ Row Level Security (RLS) และสร้างนโยบายความปลอดภัยแบบไม่ระบุชื่อตัวตน (Anonymous Access Policies) เพื่อรองรับ PDPA
  - อัปเดต `docs/software/01-system-design.md` โดยเพิ่มเติมโมดูลแบบทดสอบ Pretest & Posttest, การไหลของข้อมูล Event Analytics ย่อยลง Subsystem, และอัปเดตแผนภาพ Mermaid Subsystem Breakdown
  - อัปเดต `docs/software/02-architecture.md` โดยอัปเดตบทบาทความรับผิดชอบของตาราง Database, เพิ่มโฟลว์ Pretest/Posttest Flow (Mermaid Sequence), และอธิบายกลไกการแทร็ก Page View Entry/Exit ในส่วนของ Log การใช้งาน
  - อัปเดต `docs/software/03-data-schema.md` โดยเพิ่มเติมตารางพจนานุกรมข้อมูล (Data Dictionary Table Specification) ทั้งหมด 5 ตารางใหม่ และอัปเดตโครงสร้าง Entity Relationship Diagram (Mermaid ER)
  - อัปเดต `docs/software/04-application-flow.md` โดยลงทะเบียนพาร์ท `/pretest` และ `/posttest` ใน Route Catalog และจัดวางสถานะ Guard Logic สำหรับการบังคับทำ Pre-test ก่อนเข้าศึกษาบทเรียน และบังคับทำ Post-test ก่อนเคลมใบประกาศนียบัตร (Certificate Screen)

## 2026-07-17
- **[NEW] ร่างเอกสารยื่นขอใช้เครื่องแม่ข่ายและโดเมนเนม CAMT** (`docs/wiki/deploy-camt/`):
  - เพิ่ม `README.md` — สรุปบริบทและเหตุผลที่ต้องมีเอกสารชุดนี้ (ทางเลือกใหม่ที่จะขอ subdomain `.camt.cmu.ac.th` + เครื่องแม่ข่ายแบบ Container จริง แทนวิธี URL Redirect เดิมที่เคยเลือกใน US-03-R2/US-03-04)
  - เพิ่ม `request-form-guide.md` — คู่มือกรอกฟอร์มทีละช่อง พร้อมร่างข้อความ "เหตุผล/ความจำเป็น", ตัวเลือกชื่อ subdomain 3 แบบ, และคำแนะนำระยะเวลาใช้งาน 2 ปี
  - เพิ่ม `attachment-checklist.md` — เช็คลิสต์เอกสารแนบที่ควรเตรียม พร้อมชี้ว่าฟอร์มต้นทางไม่ได้ระบุรายชื่อเอกสารบังคับไว้ ต้องยืนยันกับเจ้าหน้าที่ CAMT อีกครั้ง
  - เพิ่มลิงก์ในหน้า `index.md` ("Resources & Guidelines") ชี้มาที่เอกสารชุดนี้
  - ⚠️ ยังเป็นสถานะร่าง (ยังไม่ได้ยื่นคำขอจริง) — ถ้าอนุมัติแล้วต้องกลับมาอัปเดต `AGENT.md` (Deployment/Domain) และสถานะ US-03-R2/US-03-04 ให้ตรงกับความเป็นจริง
- **[NEW] เตรียมไฟล์ Docker + คู่มือ deploy ผ่าน Portainer** (รองรับข้อกำหนดส่งมอบ: package ขึ้น Docker Hub แบบ public ชั่วคราว → deploy ผ่าน Portainer ของเครื่องแม่ข่ายหลัก):
  - เพิ่มโฟลเดอร์ `docker/` ที่ root repo รวมไฟล์ config ทั้งหมด: `Dockerfile` (multi-stage: build ด้วย Node 24 → serve ด้วย `nginx:alpine`, ต้อง build ด้วย `-f docker/Dockerfile` แต่ context ยังเป็น root), `nginx.conf` (SPA rewrite), `Dockerfile.dockerignore` (ตั้งชื่อตามธรรมเนียม BuildKit เพราะ Dockerfile ไม่ได้อยู่ root)
  - เพิ่ม `docker/docker-compose.portainer.yml` — stack file สำหรับ Portainer, ไม่มี user/password ฝังในไฟล์ (ใช้ `${DOCKERHUB_IMAGE}`/`${HOST_PORT}` ตั้งผ่าน Portainer environment variables เท่านั้น) และมี named volume `nginx_logs` กัน log หายเวลา container ถูกลบ/redeploy
  - เพิ่ม `docs/wiki/deploy-camt/docker-portainer-guide.md` — ขั้นตอนเต็ม build/push/deploy/verify volume/update image เวอร์ชันใหม่ พร้อม checklist งานค้าง (ยืนยัน Docker Hub namespace จริง, spec ของ feature log การเข้าใช้งานที่ยังไม่ชัดเจน)
  - ⚠️ **พบบั๊กเดิมที่มีอยู่ก่อนแล้วระหว่างทดสอบ:** `package-lock.json` ไม่ sync กับ `package.json` (ขาด `@emnapi/core`/`@emnapi/runtime`) ทำให้ `npm ci` fail ทั้งบน Windows host และใน Docker build — ไม่เกี่ยวกับไฟล์ Docker ที่เพิ่มใหม่ ยืนยันแล้วด้วย `npm ci --dry-run` บนเครื่อง dev เอง ตัดสินใจปล่อยไว้ก่อนตามที่ผู้ใช้แจ้ง (ยังไม่แก้ในรอบนี้ — ต้องรัน `npm install` แล้ว commit lock file ใหม่ก่อน build จริงครั้งแรก)
  - อัปเดตลิงก์ใน `docs/wiki/deploy-camt/README.md` และ `request-form-guide.md` (ขั้นตอน "หลังยื่นคำขอ") ให้ชี้มาคู่มือนี้
  - ⚠️ สถานะร่างเตรียมไว้ล่วงหน้าเช่นกัน — ยังไม่ได้ build/push/deploy จริง รอคำขอเครื่องแม่ข่าย CAMT อนุมัติก่อน

## 2026-07-15
- **ปรับเปลี่ยนและควบรวมเป็น Sprint 03 polishing** (`docs/agile/sprint-backlog/sprint-03-polishing.md`):
  - ตรวจสอบความคืบหน้าของการพัฒนาโปรแกรมพบว่า โค้ดของทุกฟีเจอร์ใน Sprint 01 และ Sprint 02 พัฒนาเสร็จสิ้นทั้งหมดแล้วและบิลด์ผ่านสมบูรณ์
  - ปรับเปลี่ยนแผนงานโดยการเปลี่ยน "Sprint 01 Reboot" ไปเป็น **Sprint 03 polishing** (สถานะ Active ตั้งแต่วันที่ 2026-07-15 → 2026-08-05)
  - ควบรวมงานตรวจสอบคุณภาพ (QA เกมหลัก G3, G5, G6), งาน Theme/Visual Polish, งาน Domain Handoff และงาน Hardening ใน Sprint 03 เดิม (User Testing กับผู้สูงอายุ, การทดสอบ LINE browser, การซ้อม Flow และเตรียม QR สำหรับเชียงใหม่) เข้ามาอยู่ใน Sprint 03 polishing
  - ลบไฟล์แผนงานเก่า `sprint-01-reboot.md` และ `sprint-03.md` ออก
  - ปรับปรุงสถานะ User Stories ของ Sprint 02 ที่พัฒนาเสร็จแล้ว (`US-GAME-01`, `US-GAME-02`, `US-REWARD-01`, `US-LEAD-01`, `US-UX-01`, `US-DATA-02`) เป็น `✅ Done` และย้ายไฟล์ไปยังโฟลเดอร์เก็บถาวร `docs/agile/user-stories/archives/`
  - ปรับปรุง Status ของ User Stories ที่อยู่ระหว่างตรวจสอบ (`US-GAME-03`, `US-GAME-05`, `US-GAME-06`) ให้ชี้ลิงก์ตรวจสอบคุณภาพมายัง `Sprint 03 polishing`
  - อัปเดตตารางแผนงานใน `02-sprint-planning.md` และ `index.md` ให้เชื่อมโยงและสะท้อนสถานะปัจจุบันได้อย่างถูกต้อง สอดประสานกันทั้งระบบ
  - ปรับปรุงลิงก์ในหน้า `01-product-backlog.md` และ `wiki/dns-setup.md` ให้สอดคล้องกันทุกจุด
- **[NEW] จัดทำแนวทางการออกแบบหน้าจอสำหรับผู้สูงอายุแบบไม่เลื่อนหน้าจอ (Screen Design for Elderly):**
  - สร้างเอกสาร `docs/software/05-screen-design.md` เพื่อกำหนดสเปกและตารางการเลือกเก็บ/ตัดเนื้อหาสำหรับหน้าจอระบบทั้ง 7 หน้า โดยจำกัดเลย์เอาต์ไว้ที่ความสูง `100dvh` (No-Scroll Viewport Rule) เพื่อขจัดปัญหาความสับสนและข้อผิดพลาดในการเลื่อนจอของผู้เรียนสูงวัย
  - เพิ่มการเชื่อมโยงระบบเอกสารและปรับลำดับหัวข้อใน `docs/index.md`

## 2026-07-05
- **[NEW] จัดทำเอกสารออกแบบรายละเอียดของเกม G6 (design-g6.md):** ร่างสเปกการจำลองหน้าจอ LINE แบบละเอียด (Status bar, Chat header + ป้ายยืนยันตัวตน, ฟองข้อความ, การ์ดลิงก์ Open-Graph, ปุ่ม CTA แบบ Flex Message, Input bar), ชุดสถานการณ์หลอกลวง 3 รูปแบบพร้อม Red Flag Hotspots, ระบบ Hint แบบไม่จับเวลากดดัน, ระบบเฉลย และสเปกทางเทคนิคของ Component `G6LineSimulation.jsx`; เพิ่มลิงก์อ้างอิงจาก `gdd/01-mechanics.md`
- **ปรับปรุงโครงสร้าง แยกมินิเกม G5 แอคชั่นเป็น 2 เกมย่อย (G5 กางโล่ และ G7 กระโดดหลบภัย), จัดทำ Detailed Design, พัฒนาโปรแกรมระบบเกม และสลับรหัสเรื่องย่อยสอดคล้องกัน:**
  - [NEW] **พัฒนาหน้าจอเกม G5 (G5DigitalShield.jsx):** เขียนโค้ดระบบเกมกางโล่สลายสแกนเนอร์สำหรับผู้สูงวัยแบบแอคชั่นเดี่ยว, อนิเมชั่นสโลว์โมชั่นและสโลแกนหยุดคิดถามทำ, หน้าคำแนะนำบวกเมื่อปล่อยฟองหลุดขอบล่าง, และฟังก์ชันส่ง Asynchronous logs เข้าตาราง action_logs
  - **ปรับปรุงความลื่นไหลในการร่วงหล่นของฟองสแกม G5:** แทนที่ logic การอัปเดตตำแหน่ง Y เดิมที่ใช้ setInterval ถี่ๆ ด้วยระบบ Hardware-Accelerated CSS Transitions (`top 8.5s linear` และตรวจจับปลายทางผ่าน `onTransitionEnd`) ปรับปรุงเฟรมเรตให้ลื่นไหล 60fps/120fps บนหน้าจอมือถือทุกเครื่อง และขยายกรอบ Touch target wrapper ให้รองรับพิกัดจิ้มนิ้วกว้างเป็นพิเศษ
  - [NEW] **จัดทำเอกสารออกแบบรายละเอียดของเกม G5 (design-g5.md):** ร่างสเปกรายละเอียดการมีปฏิสัมพันธ์แบบแอคชั่นเดี่ยว, เลย์เอาต์และ UI, รายชื่อข้อความสิ่งเร้า 5 ชุด, อนิเมชั่นสโลแกน และการเชื่อมโยงระบบบันทึกเหตุการณ์ทางเทคนิค
  - ปรับปรุงและแบ่งย่อยเกมใน `gdd/00-concept.md` และ `gdd/01-mechanics.md`:
    - **G5 — หยุด คิด ถาม ทำ (กางโล่กู้ชีพ):** กำหนดให้เหลือเพียง Action เดียว (แตะสอยภัยเพื่อกางโล่) เพื่อให้ง่ายขึ้นสำหรับผู้สูงอายุ และลิงก์ไปหน้าออกแบบรายละเอียดเดี่ยว
    - [NEW] **G7 — วิ่งสู้ภัยไซเบอร์ (กระโดดหลบภัย):** เพิ่มมินิเกมวิ่งกระโดดข้ามอุปสรรคภัยสแกนเนอร์ ควบคุมแบบ Action เดียว (แตะจุดใดก็ได้เพื่อกระโดด)
  - จัดสัดส่วนรหัสเรื่องราวย่อย (User Stories) และไฟล์ให้ตรงตามลำดับ G-numbers และควบรวมฟีเจอร์ "ไม่แน่ใจ" (Unsure Option):
    - ควบรวมรายละเอียดของตัวเลือก "ไม่แน่ใจ" เข้าสู่เรื่องย่อยของเกมประเภท Content-Focused ทุกเกมโดยตรง ได้แก่ `US-GAME-01` (G1), `US-GAME-02` (G2), `US-GAME-03` (G3) และ `US-GAME-04` (G4) และยุบยกเลิกรหัสสำหรับไม่แน่ใจแยกเฉพาะตัวออก
    - **`US-GAME-04` (G4 - แชร์ดีไหม?):** จัดทำเอกสารสำหรับเกมตอบคำถามระดับแชร์ปลอดภัย (Nice / Sprint 06) พร้อมใส่ตัวเลือกไม่แน่ใจ
    - **`US-GAME-05` (G5 - หยุด คิด ถาม ทำ):** จัดทำเอกสารสำหรับเกมแตะกางโล่สลายภัย (Should / Sprint 05)
    - **`US-GAME-06` (G6 - จำลองแชท LINE):** ปรับแก้เรื่องราวย่อยเกมจำลองแชท LINE ให้ตรงกับรหัส G6 (Must / Sprint 02)
    - **`US-GAME-07` (G7 - วิ่งสู้ภัยไซเบอร์):** ปรับแก้เรื่องราวย่อยเกมกระโดดหลบภัยให้ตรงกับรหัส G7 (Should / Sprint 05)
    - [DELETE] ลบไฟล์ `US-GAME-08.md` ดั้งเดิมออก
  - ปรับปรุงการเชื่อมโยงระบบ Agile Backlogs:
    - ปรับปรุง `agile/01-product-backlog.md` เพื่อจัดสรรและเชื่อมโยงไฟล์ `US-GAME-04.md` ถึง `US-GAME-07.md`
    - ปรับปรุงแผนงานใน `agile/02-sprint-planning.md` และ `agile/sprint-backlog/sprint-02.md` ให้เชื่อม G6 เข้ากับ `US-GAME-06`
    - ปรับปรุงแผนงานใน `agile/sprint-backlog/sprint-05.md` เพื่อนำ G5 (`US-GAME-05`) และ G7 (`US-GAME-07`) เข้าสู่เป้าหมายการพัฒนาร่วมกัน
    - ปรับปรุงแผนงานใน `agile/sprint-backlog/sprint-06.md` เพื่อใช้รหัส `US-GAME-04` สำหรับเกมแชร์ดีไหม? G4

## 2026-07-03
- **ปิดงานและย้ายเอกสารแผนงาน Sprint 01 ไปยังโฟลเดอร์เก็บถาวร:**
  - ปรับปรุงสถานะงานย่อยใน `sprint-01.md` ให้เป็นเสร็จสมบูรณ์ `[x]` ทุกหัวข้อ (US-CORE-01 ถึง US-CORE-04)
  - ย้ายเอกสารจาก `docs/agile/sprint-backlog/sprint-01.md` ไปยังโฟลเดอร์เก็บถาวร `docs/agile/sprint-backlog/archives/sprint-01.md`
  - ปรับปรุงสถานะของ User Stories ใน Sprint 01 เป็นเสร็จสมบูรณ์ (`US-CORE-01` ถึง `US-CORE-04` เป็น `✅ Done`) และย้ายไฟล์ไปยัง `docs/agile/user-stories/archives/` เพื่อเก็บถาวร
  - อัปเดตสถานะของ Sprint 01 ใน `02-sprint-planning.md` เป็น **Completed** พร้อมปรับปรุงลิงก์และอ้างอิงให้ถูกต้อง
  - อัปเดตสถานะโครงการใน `index.md` ให้เข้าสู่ Sprint 02 อย่างเป็นทางการ
  - อัปเดตลิงก์พาร์ทใน `01-product-backlog.md` และ `sprint-01.md` ที่จัดเก็บใหม่เพื่อความถูกต้องแม่นยำของระบบเอกสาร
- **สร้างเอกสารรายละเอียด User Story ของ Sprint 02:**
  - แยกรายละเอียด User Story `US-GAME-01.md`, `US-GAME-02.md`, `US-GAME-03.md`, `US-REWARD-01.md`, `US-LEAD-01.md`, `US-UX-01.md`, และ `US-DATA-02.md` ในโฟลเดอร์ `docs/agile/user-stories/` เพื่อระบุรายละเอียด Description, Acceptance Criteria และ Technical Tasks
  - เชื่อมโยงรายละเอียด User Story ใน `docs/agile/01-product-backlog.md` และ `docs/agile/sprint-backlog/sprint-02.md`

## 2026-07-03
- **แยกรายละเอียด Sprint Planning เป็นเอกสารราย Sprint:**
  - สร้างไดเรกทอรี `docs/agile/sprint-backlog/` และสร้างเอกสารราย Sprint: `sprint-01.md` ถึง `sprint-06.md` เพื่อเก็บรายละเอียดเป้าหมาย ขอบเขตงานย่อย แผนเวลา ความเสี่ยง และ DoD ของแต่ละ Sprint
  - อัปเดตตารางและแผนภาพใน `docs/agile/02-sprint-planning.md` เพื่อเชื่อมโยงไปยังแผนงานแต่ละ Sprint
  - อัปเดต `docs/index.md` ให้มีลิงก์เข้าถึง Sprint Backlogs
- **สร้างเอกสารรายละเอียด User Story ของ Sprint 01:**
  - สร้างไดเรกทอรี `docs/agile/user-stories/` และแยกรายละเอียด User Story `US-CORE-01.md`, `US-CORE-02.md`, `US-CORE-03.md`, และ `US-CORE-04.md` เพื่อระบุรายละเอียด Description, Acceptance Criteria และ Technical Tasks
  - เชื่อมโยงรายละเอียด User Story ใน `docs/agile/01-product-backlog.md` และ `docs/agile/sprint-backlog/sprint-01.md`

## 2026-07-03
- **เพิ่มเอกสารโครงสร้างสถาปัตยกรรมและผังระบบ:** 
  - สร้าง `software/02-architecture.md` เพื่ออธิบายโครงสร้างแต่ละเลเยอร์และการไหลของข้อมูล Onboarding และ Event Logging 
  - สร้าง `software/04-application-flow.md` เพื่อแสดง Route และผังการเปลี่ยนหน้าจอที่สอดคล้องกับ User Journey ทั้งกลุ่มผู้นำชุมชนและผู้สูงอายุ
  - แก้ไขฟอร์แมตใน `agile/01-product-backlog.md` และเชื่อมโยงเอกสารทั้งหมดใน `index.md`

## 2026-07-03
- **ยืนยัน Technical Stack:** Vite + React (`vite-plugin-pwa`) / Supabase (Postgres + Edge Functions) / Cloudflare Pages (geolocation ผ่าน `request.cf.*` แทนบริการภายนอก) — อัปเดต `gdd/00-concept.md` (§2 Technical Stack + หมายเหตุ PWA), `software/01-system-design.md` (diagram, subsystem, NFR, Open Decisions), `software/03-data-schema.md` (IP Geolocation Flow), และ `index.md` (ปิดคำถามเปิดเรื่อง stack)

## 2026-07-03
- **ย้ายเอกสาร Requirement ต้นทาง** `Interactive เกม-ระบบ.docx` จาก root ของ repo ไปที่ `docs/wiki/base-requirement/` และอัพเดทลิงก์ใน `index.md`

## 2026-07-03
- **สร้างชุดเอกสารโครงการรุ่นแรก** จากเอกสาร Requirement `Interactive เกม-ระบบ.docx`:
  - `gdd/00-concept.md` — Concept, กลุ่มผู้ใช้ 2 กลุ่ม, สถาปัตยกรรม, นโยบายการนำเสนอเนื้อหาที่สร้างจาก AI
  - `gdd/01-mechanics.md` — Core loop และสเปกเกมย่อย G1–G5
  - `gdd/02-narrative.md` — โครงเนื้อหาหลักสูตรวิดีโอ 2 ชุด (3 Topics + "หยุด คิด ถาม ทำ")
  - `gdd/03-art-direction.md` — UI/UX และ Accessibility สำหรับผู้สูงวัย
  - `gdd/05-user-journey.md` — ข้อเสนอ User Journey สำหรับผู้นำชุมชนและผู้สูงอายุ (ส่วนที่ Requirement ยังไม่ได้ลงรายละเอียด)
  - `software/01-system-design.md` — Subsystem breakdown (Draft)
  - `software/03-data-schema.md` — Data schema + ประเด็น PDPA (Draft)
  - `agile/01-product-backlog.md` — Product backlog (Must 10 / Should 5 / Nice 3)
  - `agile/02-sprint-planning.md` — Roadmap ก.ค.–ต.ค. 2569, Gantt, ความเสี่ยง
  - `index.md` — Project index + คำถามเปิดถึงทีม
