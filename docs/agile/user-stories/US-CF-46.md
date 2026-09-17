# User Story: US-CF-46 - ถอดปุ่ม "แตะเพื่อเปิดเสียง" ออก และให้คลิปเล่นมีเสียงเลย

**Status:** 🟢 Done (Needs QA)  
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-07  
**Owner:** TBD | **Priority:** ควรแก้ | **Estimate:** XS  
**Version:** 1.0 | **Last Updated:** 2026-08-07  

---

## 📖 Description

**ในฐานะ** ผู้เรียน (ผู้สูงอายุ)  
**ฉันต้องการ** ให้คลิปวิดีโอ (ทั้ง YouTube และไฟล์ MP4 ที่ไม่ได้มาจาก YouTube) เล่นแบบมีเสียงทันที  
**เพื่อที่จะ** ไม่มีปุ่มเกะกะบังหน้าจอคลิป และไม่ต้องกดปุ่มเพิ่มเพื่อเปิดเสียง

---

## 🎯 ที่มา / ปัญหา

- งานแก้ autoplay ก่อนหน้า (Release `0.7.2`, ดู [changelog](../../changelog.md)) เข้าใจ feedback คลาดเคลื่อน จึงเลือกวิธี **เริ่มเล่นแบบปิดเสียง (`mute:1`) + เพิ่มปุ่ม "แตะเพื่อเปิดเสียง"** กลางบนจอ
- ผลตอบรับล่าสุด (2026-08-07): ปุ่ม "แตะเพื่อเปิดเสียง" **เกะกะบังคลิปมาก** และไม่ต้องการปุ่มนี้ — ต้องการให้คลิปเล่นมีเสียงเลยทั้ง YouTube และ MP4

## 🔧 การแก้ไข

ในไฟล์ `src/app/lessons/[id]/video/page.tsx`:
- **ลบปุ่ม overlay "แตะเพื่อเปิดเสียง"** (พร้อม state `isMuted`, ฟังก์ชัน `handleUnmute`, และ import `VolumeX`) ออกทั้งหมด
- **YouTube:** เปลี่ยน `playerVars.mute` จาก `1` → `0` (เล่นมีเสียงเลย) และเอา `setIsMuted(true)` ใน `onReady` ออก
- **MP4 (`<video>`):** `attemptMp4Autoplay` เล่นแบบมีเสียง (`v.muted=false; v.play()`); ถ้าเบราว์เซอร์บล็อก autoplay-with-sound ไม่ทำ fallback ปิดเสียงเงียบ ๆ อีกต่อไป — ปล่อยให้ผู้ใช้กดปุ่มเล่นบน native `controls` ของ `<video>` เอง (มี `controls` อยู่แล้ว)

> **หมายเหตุ (ข้อจำกัดเบราว์เซอร์):** เบราว์เซอร์มือถืออาจบล็อก autoplay แบบมีเสียงถ้าไม่มี user gesture แต่ในโฟลว์นี้ผู้ใช้กด "ดูคลิป"/นำทางมาเอง (เป็น user gesture) เสียงจึงเล่นได้ในกรณีทั่วไป และหากถูกบล็อก ยังมี native controls ของ YouTube/`<video>` ให้กดเล่นเองได้ — ไม่ต้องมีปุ่มพิเศษ

---

## ✅ Acceptance Criteria

1. [x] ไม่มีปุ่ม "แตะเพื่อเปิดเสียง" บนหน้าคลิปอีกต่อไป (ลบ overlay + state + handler + import ครบ)
2. [x] YouTube: `playerVars.mute = 0` — คลิปเริ่มเล่นแบบมีเสียง
3. [x] MP4: เล่นแบบมีเสียง ไม่มี fallback ปิดเสียงเงียบ
4. [x] `tsc --noEmit` ผ่าน ไม่มี reference ค้าง (`isMuted`/`handleUnmute`/`VolumeX`/`unmute`)
5. [ ] (QA) ทดสอบบนอุปกรณ์จริง: เข้าหน้าคลิปทั้ง YouTube และ MP4 แล้วมีเสียงเล่น โดยไม่มีปุ่มเปิดเสียง

---

## 🛠 Technical Tasks

- [x] ลบ block ปุ่ม `แตะเพื่อเปิดเสียง` ใน JSX
- [x] ลบ state `isMuted` / ฟังก์ชัน `handleUnmute` / import `VolumeX`
- [x] YouTube `mute: 1` → `0`; เอา `setIsMuted(true)` ใน `onReady` ออก
- [x] ลดรูป `attemptMp4Autoplay` ให้เล่นมีเสียงอย่างเดียว
- [ ] (QA) ทดสอบเสียงบนอุปกรณ์จริงทั้ง 2 แหล่งวิดีโอ

---

## 🔗 Related

- Backlog: [Product Backlog](../01-product-backlog.md) — Client Feedback รอบ 2026-08-07
- แทนที่พฤติกรรมเดิมจาก: Release `0.7.2` (autoplay muted + ปุ่มแตะเพื่อเปิดเสียง) — ดู [changelog](../../changelog.md)
- หน้าคลิป: [US-VIDEO-01](./US-VIDEO-01.md), รองรับ MP4: [US-CF-44](./US-CF-44.md)
