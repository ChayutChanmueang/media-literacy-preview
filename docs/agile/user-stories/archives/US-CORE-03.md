# User Story: US-CORE-03 - การรับชมคลิปวิดีโอรู้ทันสื่อ (Vertical Video Player)

**Status:** ✅ Done
**Epic:** [Core / โครงระบบ](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.1 (Completed) | **Last Updated:** 2026-07-03

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** ดูคลิปวิดีโอเนื้อหา "รู้ทันสื่อ" แนวตั้งภายในแอปพลิเคชัน
**เพื่อให้** สามารถทำความเข้าใจและเรียนรู้เกี่ยวกับประเด็นสแกมหรือสื่อลวงต่างๆ ได้สะดวกขึ้น

---

## ✅ Acceptance Criteria
1. [x] รองรับการแสดงผลและเล่นวิดีโอ YouTube Embed ในโหมดแนวตั้ง (Vertical/Portrait Aspect Ratio)
2. [x] สามารถตรวจจับเหตุการณ์การดูวิดีโอจนจบ (On Video Ended) เพื่อเปิดใช้งานปุ่มกดไปยังเกมถัดไป
3. [x] มีปุ่มลิงก์ Fallback สำหรับคลิกไปเปิดดูบนแอปพลิเคชัน YouTube หลักภายนอกได้โดยตรงในกรณีเกิดข้อผิดพลาดในการเล่นวิดีโอในตัวแอป

---

## 🛠 Technical Tasks (Video Player Development)
- [x] ติดตั้งและตั้งค่าการทำงานร่วมกับ YouTube Iframe Player API
- [x] พัฒนา React Video Player Component ที่ปรับความกว้าง/ความสูงตามจอภาพแนวตั้งของผู้ใช้ (Responsive UI)
- [x] เขียนฟังก์ชันจับ event `YT.PlayerState.ENDED` เพื่ออัปเดตสถานะความคืบหน้าของบทเรียน
- [x] ตกแต่งปุ่ม Fallback ลิงก์ไป YouTube ให้เข้าใจง่ายและกดง่ายสำหรับผู้สูงอายุ

---

## 🔗 Related Files
- Backlog: [Product Backlog](../01-product-backlog.md)
- GDD: [Core Mechanics](../../gdd/01-mechanics.md)
- GDD: [Content & Curriculum](../../gdd/02-narrative.md)
