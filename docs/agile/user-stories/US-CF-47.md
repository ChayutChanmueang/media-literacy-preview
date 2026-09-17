# User Story: US-CF-47 - ลบปุ่มเล่นซ้ำและหยุด Auto-advance เมื่อเล่นซ้ำจาก Video Player

**Status:** 🔍 In QA — ลบปุ่มเล่นซ้ำและรวม logic reset countdown แล้ว รอ browser QA
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-07
**Owner:** TBD | **Priority:** ควรแก้ | **Estimate:** S  
**Version:** 1.1 | **Last Updated:** 2026-08-17

---

## 📖 Description

**ในฐานะ** ผู้เรียน (ผู้สูงอายุ)  
**ฉันต้องการ** ให้ popup menu ที่ขึ้นมาหลังวิดีโอจบไม่มีปุ่ม "เล่นซ้ำ" ซ้ำซ้อน เพราะ video player มีฟังก์ชันเล่นซ้ำอยู่แล้ว และเมื่อฉันกดเล่นซ้ำที่ตัว video player ระบบต้องหยุดนับเวลา auto-advance ไปเกมถัดไป  
**เพื่อที่จะ** ไม่สับสนกับปุ่มซ้ำซ้อน และเมื่อต้องการดูซ้ำจะไม่ถูกระบบพาไปเกมถัดไประหว่างกำลังดู

## 🐞 ที่มา / อาการของบั๊ก

- หลังคลิปจบ ปุ่ม "ถัดไป" จะเริ่มนับถอยหลัง 5 วินาทีแล้วพาไปเกมให้เอง (auto-advance)
- **อาการ:** ถ้าผู้เรียนกดเล่นซ้ำจาก **UI ของ YouTube เอง** (ปุ่ม replay / ปุ่ม play / ลากแถบเวลาย้อนกลับ) ตัวนับ **ยังเดินต่อ** แล้วพาไปหน้าเกมทั้งที่คลิปกำลังเล่นซ้ำอยู่
- **ไม่เกิด** เมื่อกดปุ่ม "เล่นซ้ำ" ที่เป็น UI ของแอปเอง
- ปัจจุบัน popup menu หลังวิดีโอจบมีปุ่ม "เล่นซ้ำ" ทั้งที่ตัว video player (YouTube / HTML5) มีฟังก์ชัน replay อยู่แล้ว — ทำให้มี 2 ทางเล่นซ้ำ ผู้สูงอายุอาจสับสน
- เมื่อผู้ใช้กดเล่นซ้ำผ่าน video player โดยตรง ระบบไม่ได้ตรวจจับการกระทำนี้ ทำให้ auto-continue countdown ยังคงนับอยู่ อาจพาไปเกมถัดไประหว่างที่ผู้ใช้กำลังดูวิดีโอซ้ำ

## 🔍 สาเหตุ (Root Cause)

`showControls` และ `countdownActive` เป็น state แยกกัน โดยตัวที่คุม timer จริงคือ `countdownActive` เดิมเมื่อเล่นซ้ำผ่าน UI ของ YouTube/HTML5 ระบบสั่งเพียง `setShowControls(false)` จึงซ่อนแถบปุ่มแต่ไม่ได้ unmount `AutoAdvanceButton`

`showControls` เพียงเลื่อนแถบปุ่มออกจากจอ (`translate-y-full`) — `AutoAdvanceButton` **ยังอยู่ใน DOM** และ `setTimeout` ที่ตั้งไว้ตอน mount จึงยังทำงาน (ดู [AutoAdvanceButton](../../../src/components/AutoAdvanceButton.jsx) ที่ clear timer ตอน unmount เท่านั้น)

## 🔧 การแก้ไข

ในไฟล์ `src/app/lessons/[id]/video/page.tsx` — ยกเลิก countdown ที่จุดที่คลิป "กลับมาเล่น" ทุกทาง:
- ลบ import `RotateCcw`, ฟังก์ชัน `handleReplay()` และปุ่ม "เล่นซ้ำ" ของแอปออก เหลือปุ่มไปเล่นเกมเต็มความกว้างเพียงปุ่มเดียว
- **YouTube:** ใน `onStateChange` เพิ่ม `setCountdownActive(false)` เมื่อสถานะเป็น `PLAYING (1)` หรือ `BUFFERING (3)` (BUFFERING เผื่อจังหวะก่อนเข้า PLAYING ตอนกด replay/ลากแถบเวลา) — คง log `play_video` ให้ยิงเฉพาะ `PLAYING` เหมือนเดิม
- **MP4 (`<video>`):** เพิ่ม `setCountdownActive(false)` ใน `onPlay` — บั๊กชนิดเดียวกันเมื่อกดเล่นซ้ำจาก native controls
- อัปเดตคอมเมนต์กำกับ `countdownActive` ให้ตรงความจริง (ของเดิมเขียน "15 วิ" ทั้งที่ปัจจุบันคือ 5 วิ และระบุแค่ปุ่มในแอป)

> เมื่อคลิปจบรอบใหม่ → `ENDED` → `countdownActive = true` → `AutoAdvanceButton` mount ใหม่เป็น instance ใหม่ จึง **นับ 5 วินาทีสดจากศูนย์** ไม่ค้างค่าเดิม

---

## ✅ Acceptance Criteria

1. [x] กดเล่นซ้ำจาก UI ของ YouTube (replay / play / ลากแถบเวลาย้อนกลับ) → countdown ปุ่ม "ถัดไป" ถูกยกเลิก ไม่ถูกพาไปหน้าเกม
2. [x] กดเล่นซ้ำจาก native controls ของ `<video>` (MP4) → ยกเลิก countdown เช่นเดียวกัน
3. [x] popup/overlay หลังวิดีโอจบไม่มีปุ่ม "เล่นซ้ำ" เหลือเฉพาะปุ่มไปเล่นเกมเต็มความกว้าง
4. [x] คลิปจบรอบใหม่ → เริ่มนับ 5 วินาทีใหม่จากศูนย์ตามปกติ
5. [x] `tsc --noEmit` ผ่าน และ `eslint` ไม่มี error เพิ่มจากเดิม
6. [ ] Browser QA ยืนยันทั้ง YouTube iframe และ HTML5 `<video>` ว่าเหลือปุ่มเดียวและ replay ไม่ถูก auto-advance กลางคัน

---

## 🛠 Technical Tasks

- [x] YouTube `onStateChange`: ยกเลิก countdown เมื่อ `PLAYING`/`BUFFERING`
- [x] MP4 `onPlay`: ยกเลิก countdown
- [x] อัปเดตคอมเมนต์กำกับ state ให้ตรงพฤติกรรมจริง
- [x] ลบปุ่ม "เล่นซ้ำ" (`RotateCcw`) และ `handleReplay()` ออกจาก popup/overlay
- [x] ปรับปุ่มไปเล่นเกมให้เต็มความกว้าง
- [x] `tsc --noEmit` ผ่าน; targeted ESLint ไม่พบ error จาก diff นี้ (ไฟล์ยังมี lint debt เดิม)
- [ ] (QA) ทดสอบบนอุปกรณ์จริง: กดเล่นซ้ำผ่าน player → countdown หยุด → ดูจบ → countdown เริ่มใหม่

---

## 🔗 Related

- Backlog: [Product Backlog](../01-product-backlog.md) — Client Feedback รอบ 2026-08-07
- หน้าคลิป: [US-VIDEO-01](./US-VIDEO-01.md) (ปุ่มถัดไปนับถอยหลัง), [US-CF-46](./US-CF-46.md) (ถอดปุ่มเปิดเสียง), [US-CF-44](./US-CF-44.md) (รองรับ MP4)
- Component ที่เกี่ยวข้อง: `src/components/AutoAdvanceButton.jsx`
- หน้าคลิป: [US-VIDEO-01](./US-VIDEO-01.md)
- Auto-advance: [US-CF-05](../user-stories/archives/US-CF-05.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
