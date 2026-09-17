# User Story: US-VIDEO-01 - รื้อ UI/Layout หน้าคลิปวิดีโอสั้น (Clip Screen Rework)

**Status:** 🔨 โค้ดเสร็จ รอ QA playtest (2026-07-31) — header/คลิป fit-in/ปุ่ม 2 ตัว/progress + auto-advance 15 วิหลังคลิปจบ/เล่นซ้ำ implement แล้ว; เหลือ single-screen audit บนจอเล็ก/A10s/LINE + ทดสอบ replay/auto-advance บนอุปกรณ์จริง
**Sprint:** [Sprint 08](../sprint-backlog/sprint-08.md) — breakdown ของ [US-UX-05](./US-UX-05.md) (responsive + นำ design UX/UI มาใช้จริง)
**Priority:** Must — หน้าคลิปอยู่ใน Flow ใหม่ (เกม → **คลิป** → เกมถัดไป, [US-FLOW-01](./US-FLOW-01.md))
**Estimate:** M
**Component:** `src/app/lessons/[id]/video/page.tsx` (`VideoLessonPage`)

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** ให้หน้าคลิปวิดีโอสั้นแสดงคลิปได้ใหญ่เต็มตา ชื่อบท/ชื่อคลิปอยู่ด้านบนกระชับ และมีปุ่มไปต่อ/เล่นซ้ำที่กดง่าย
**เพื่อที่จะ** ดูคลิปได้ชัดบนมือถือเครื่องเล็กโดยไม่ต้องเลื่อนจอ และไม่ติดค้างถ้าคลิปไม่จบ

## 🎯 ปัญหาเดิม

- **คลิปแสดงเล็กเกินไป** (`height: min(46dvh, 400px)`) — พื้นที่หน้าจอถูกกินโดยชื่อบท + คำอธิบาย + ปุ่มลิงก์นอก
- มีข้อความ/ปุ่มที่ไม่จำเป็น: `*กรุณารับชมคลิปวิดีโอให้จบ...*`, ปุ่ม "เปิดดูด้วยแอป YouTube", ลิงก์ "ข้ามวิดีโอ (สำหรับทดสอบ)"
- **ปุ่มต่อไปถูกปลดล็อกเฉพาะตอนคลิปจบเท่านั้น** — ถ้า event `ENDED` ไม่มา (เช่นผู้ใช้หยุดคลิปค้าง) จะติดหน้านี้ กดต่อไม่ได้

## 🎨 Design ใหม่ (จาก draft ผู้ใช้ 2026-07-31)

### 1. Header กระชับด้านบน
- ย้าย **"บทที่ X" (badge สี teal) + ชื่อคลิป** ขึ้นไปชิดด้านบนในแถบเดียว (แทนบรรทัด lessonNum เดี่ยว ๆ กลางจอ)
- **ลบข้อความ `*กรุณารับชมคลิปวิดีโอให้จบ...*` ออก**
- **Responsive ชื่อคลิป:**
  - ชื่อสั้น → badge "บทที่ X" กับชื่อคลิปอยู่แถวเดียว จัดให้ badge อยู่กึ่งกลางแนวตั้งเทียบชื่อ
  - ชื่อยาว → ชื่อคลิป wrap หลายบรรทัด และ **badge "บทที่ X" เลื่อนลงมาอยู่กึ่งกลางแนวตั้ง** เทียบกับบล็อกชื่อหลายบรรทัด (ดู draft: badge จัดกึ่งกลางกับกล่องชื่อ)

### 2. พื้นที่คลิปใหญ่ขึ้น (fit-in ในกล่อง)
- ให้คลิปกินพื้นที่ตรงกลางให้มากที่สุด (แทน `min(46dvh, 400px)` เดิม) — ขยายเต็มพื้นที่ที่เหลือระหว่าง header กับปุ่มล่าง
- **กล่องคลิป** = กรอบสี teal/เขียว (design token) พื้นหลังดำ; **วิดีโอ fit-in (letterbox / object-contain) ภายในกล่อง** — คลิป Shorts 9:16 จะมีแถบดำซ้าย-ขวาเมื่อกล่องกว้างกว่าอัตราส่วน (ตาม draft) โดยไม่ crop คลิป
- คงกรอบมน + เงา (design token)

### 3. ปุ่มล่าง — 2 ตัวเลือกสไตล์เกม G1/G3/G6
> ✅ **ยืนยันแล้ว: YouTube IFrame API สั่งเล่นซ้ำได้** — หน้านี้ใช้ `window.YT.Player` อยู่แล้ว เล่นซ้ำได้ด้วย `seekTo(0)` + `playVideo()` จึงมีปุ่ม "เล่นซ้ำ" ได้จริง

- **แถวปุ่ม 2 ปุ่ม เท่ากัน ติดกัน มีเส้น border คั่นตรงกลาง** (แบบเกม G1/G3/G6 แต่เหลือ 2 ปุ่มแทน 3), radius `25px 25px 0 0` ชิดขอบล่าง
  - **เล่นซ้ำ** (`RotateCcw`) → `seekTo(0)` + `playVideo()` เล่นคลิปใหม่จากต้น
  - **ต่อไป** (`ArrowRight`, label ตามโหมด: Flow = "ไปเล่นเกมถัดไป"/"ไปเล่นเกมปิดท้าย 🍦", Manual = "ไปทำแบบฝึกหัด (เกม)")
- **ปุ่ม "ต่อไป" เริ่มแถบ progress 15 วิ + auto-advance หลังคลิปจบ** (ใช้ `AutoAdvanceButton` ตัวเดียวกับ G1/G3/G6, `delayMs=15000`): ก่อนคลิปจบเป็นปุ่มปกติ ไม่มี progress; เมื่อได้รับสถานะ `ENDED` จึงเริ่มนับและ**ไปเกมถัดไปให้เองเมื่อครบ 15 วินาที** (ผู้ใช้กดไปต่อเองก่อนได้ตลอด)
  - แถบ progress อยู่ **เฉพาะภายในครึ่งปุ่ม "ต่อไป"** และใช้ `--primary-light` เพื่อให้มองเห็นบนพื้นปุ่มสีขาว; ปุ่ม "เล่นซ้ำ" ไม่มี progress
  - **กด "เล่นซ้ำ" = ยกเลิกและรีเซ็ต countdown** (unmount `AutoAdvanceButton`) ระหว่างดูซ้ำไม่มีการนับเวลา และจะเริ่มนับ 15 วิใหม่เมื่อคลิปจบรอบใหม่
  - แทนลิงก์ "ข้ามวิดีโอ (สำหรับทดสอบ)" + timer แยกเดิม; event `video_auto_advance` เมื่อครบเวลาไปเอง
  - หมายเหตุ implementation: หน้านี้เป็น `.tsx` จึง cast `AutoAdvanceButton` (.jsx) เป็น FC เฉพาะที่; shared component เพิ่มเพียง optional `progressClassName` และคง default `bg-white/30` เพื่อไม่เปลี่ยนหน้าตา G1/G3/G6

### 4. ลบองค์ประกอบที่ไม่จำเป็น
- ลบปุ่ม "เปิดดูด้วยแอป YouTube" (external link) ออก
- ลบลิงก์ "ข้ามวิดีโอ (สำหรับทดสอบ)" ออก (แทนด้วย progress + auto-advance 15 วิ)

## ✅ Acceptance Criteria

- [ ] Header: badge "บทที่ X" + ชื่อคลิปอยู่ด้านบนกระชับ; ชื่อยาว wrap แล้ว badge จัดกึ่งกลางแนวตั้ง; ชื่อสั้นอยู่แถวเดียว
- [ ] คลิปแสดงใหญ่ขึ้นชัดเจน + **fit-in** ในกล่อง (ไม่ crop, มี letterbox เมื่อจำเป็น)
- [ ] ปุ่มล่างเป็น **2 ปุ่ม (เล่นซ้ำ | ต่อไป) ติดกัน มีเส้นคั่น** แบบ G1/G3/G6
- [ ] ปุ่ม "ต่อไป" กดข้ามได้ทันที; progress + auto-advance **15 วิเริ่มหลังคลิปจบเท่านั้น**; การกด "เล่นซ้ำ" ต้องยกเลิก/reset countdown และเริ่มคลิปจากต้น โดย countdown รอบใหม่เริ่มเมื่อคลิปจบอีกครั้ง
- [ ] ลบ subtitle, ปุ่ม external YouTube, ลิงก์ skip ทดสอบ ออกครบ
- [ ] ผ่าน audit `zero-scroll-ui` บนจอเล็ก/A10s/LINE browser (ไม่มี scroll)
- [ ] ใช้ design token กลาง; รองรับ dark/theme/size; คง event logging เดิม (`enter_video`, `play_video`, `video_complete` + เพิ่ม `replay_video`, `video_auto_advance`)
- [ ] คงลอจิกปลายทาง Flow/Manual เดิม (`nextFlowGameAfterVideo`, G13 finale) ไม่พัง

## 🛠 Technical Tasks

- [x] รื้อ layout หน้า `video/page.tsx` เป็น 3 โซน: header กระชับ / กล่องคลิป fit-in (flex-1) / แถวปุ่ม 2 ปุ่มชิดล่าง (2026-07-31)
- [x] ใช้ `AutoAdvanceButton` เพิ่ม progress 15 วิ + auto-advanceหลัง YouTube ส่งสถานะ `ENDED`; ปุ่มกดข้ามได้ทันที และ log `video_auto_advance` เมื่อครบเวลา (2026-07-31)
- [x] กด "เล่นซ้ำ" แล้ว unmount `AutoAdvanceButton` เพื่อยกเลิก/reset countdown จนกว่าคลิปจะจบรอบใหม่ โดยไม่แก้ shared `AutoAdvanceButton.jsx` (2026-07-31)
- [x] ต่อปุ่ม "เล่นซ้ำ" กับ `playerRef.current.seekTo(0, true)` + `playVideo()` + log `replay_video` (2026-07-31)
- [x] จัด badge "บทที่ X" ให้ center แนวตั้งเทียบชื่อ (flex items-center) รองรับชื่อ 1–3 บรรทัด (2026-07-31)
- [x] `tsc` ผ่าน; eslint ไม่เพิ่ม issue ใหม่ (เหลือหนี้เดิมของไฟล์ — YT `any`/empty catch ใน US-DEBT-01) (2026-07-31)
- [ ] playtest คลิกจริง (คลิปจบ / auto-advance 15 วิ / กดต่อทันที / เล่นซ้ำ) + single-screen audit

## 🔗 Related
- Parent: [US-UX-05](./US-UX-05.md) | Flow: [US-FLOW-01](./US-FLOW-01.md)
- Video registry: [04 — Video Clip Registry](../../gdd/04-video-clips.md)
