# User Story: US-CF-48 - ให้วิดีโอ YouTube เล่นเสียงอัตโนมัติเมื่อผู้เรียนเริ่มดูคลิป

**Status:** 🟢 Done — ผู้ใช้ยืนยันผลทดสอบ Runtime แล้ว
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-14  
**Owner:** TBD | **Priority:** ควรแก้ | **Estimate:** S  
**Version:** 1.1 | **Last Updated:** 2026-08-17

---

## 📖 Description

**ในฐานะ** ผู้เรียน (ผู้สูงอายุ)  
**ฉันต้องการ** ให้วิดีโอ YouTube เล่นเสียงอัตโนมัติทันทีเมื่อเริ่มดูคลิป โดยไม่ต้องกดปุ่มเปิดเสียงเพิ่ม  
**เพื่อที่จะ** ดูคลิปได้สะดวกและไม่พลาดเนื้อหาเสียงบรรยาย

---

## 🎯 ที่มา / ปัญหา

- แม้ [US-CF-46](./US-CF-46.md) จะแก้ไขให้ตั้ง `mute: 0` และถอดปุ่ม "แตะเพื่อเปิดเสียง" ออกแล้ว แต่ในบางสถานการณ์บนอุปกรณ์มือถือ เบราว์เซอร์อาจยังบล็อก autoplay แบบมีเสียงได้
- ต้องมั่นใจว่า YouTube iframe ได้รับ user gesture ก่อนเล่น (ผู้ใช้กดปุ่ม "ดูคลิป" / "เริ่มเล่น" เป็น user gesture อยู่แล้ว) และ player เริ่มเล่นพร้อมเสียงทุกครั้ง
- หากเบราว์เซอร์บังคับ mute → ต้องมี fallback ให้ผู้ใช้แตะที่วิดีโอ 1 ครั้งแล้วเสียงเปิดได้เอง (ไม่ต้องมีปุ่มพิเศษ)

## 🔧 การแก้ไข

ในไฟล์ `src/app/lessons/[id]/video/page.tsx`:
1. YouTube `playerVars` ตั้ง `autoplay: 1`, `mute: 0` และ `controls: 1`
2. `onReady` เรียก `playVideo()` เพื่อเริ่มเล่นทันที โดยไม่สร้าง state หรือ overlay สำหรับเปิดเสียงเพิ่ม
3. หากนโยบายของเบราว์เซอร์บล็อก autoplay แบบมีเสียง ผู้ใช้ยังแตะปุ่มเล่นจาก native YouTube controls ได้
4. MP4 ตั้ง `muted = false` ก่อนเรียก `play()` และคง native controls เป็น fallback เช่นเดียวกัน

> ผลตรวจโค้ด: implementation ที่ใช้งานจริงไม่ได้เรียก `unMute()`, `setVolume(100)` หรือสร้าง event `video_sound_autoplay` ตามแนวทางร่างเดิม เนื่องจาก `mute: 0` ร่วมกับ user gesture ใน flow ปัจจุบันทำงานได้แล้ว และผู้ใช้ยืนยันผลทดสอบ Runtime

---

## ✅ Acceptance Criteria

1. [x] วิดีโอ YouTube เล่นพร้อมเสียงทันทีเมื่อเข้าหน้าคลิป (หลังผู้ใช้กดปุ่มเข้ามา)
2. [x] ไม่มีปุ่ม/overlay เปิดเสียงพิเศษใด ๆ
3. [x] ผู้ใช้สามารถแตะวิดีโอเพื่อเล่นผ่าน native YouTube controls ได้ หาก autoplay ถูกบล็อก
4. [x] MP4 fallback ยังคงเล่นมีเสียงตามเดิม (ไม่กระทบ)
5. [x] `tsc --noEmit` ผ่าน
6. [x] ผู้ใช้ยืนยันว่าทดสอบ Runtime แล้วทำงานถูกต้อง

---

## 🛠 Technical Tasks

- [x] ยืนยัน `playerVars.autoplay: 1`, `mute: 0` และ `controls: 1`
- [x] ยืนยัน `onReady` เรียก `playVideo()`
- [x] ยืนยันว่าไม่มีปุ่ม/overlay เปิดเสียงพิเศษ
- [x] ยืนยัน MP4 ใช้ `muted = false` และมี native controls
- [x] QA — ผู้ใช้ยืนยันผลทดสอบ Runtime ว่าเสียงทำงานถูกต้อง

---

## 🔗 Related

- งานก่อนหน้า: [US-CF-46](./US-CF-46.md) (ถอดปุ่มแตะเพื่อเปิดเสียง)
- หน้าคลิป: [US-VIDEO-01](./US-VIDEO-01.md)
- รองรับ MP4: [US-CF-44](../user-stories/archives/US-CF-44.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
