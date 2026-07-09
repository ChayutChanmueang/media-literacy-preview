# User Story: US-LEAD-01 - การแชร์ลิงก์เข้ากลุ่ม LINE ในแตะเดียว (One-tap LINE Sharing)

**Status:** 🏗 Planned
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-03

---

## 📖 Description
**ในฐานะ** ผู้นำชุมชน
**ฉันต้องการ** แชร์ลิงก์บทเรียนเข้ากลุ่ม LINE ได้ง่าย ๆ ในการแตะเพียงครั้งเดียว
**เพื่อให้** สะดวกในการส่งต่อเนื้อหาความรู้ให้กับสมาชิกในชุมชนผ่านช่องทางที่พวกเขาใช้งานประจำ

---

## ✅ Acceptance Criteria
1. [ ] มีปุ่ม "ส่งต่อใน LINE" พร้อมไอคอนแอป LINE ที่เห็นชัดเจนและกดง่าย
2. [ ] เมื่อกดปุ่ม ระบบจะสร้างข้อความเชิญชวนสำเร็จรูปและแชร์ลิงก์ Deep Link ไปยัง LINE เสนอห้องแชทให้เลือกทันที
3. [ ] ผู้เล่นที่คลิกลิงก์จาก LINE จะถูกพาเข้าสู่บทเรียนเฉพาะบทนั้นโดยตรงทันที (Direct Target Lesson) โดยไม่ต้องเริ่มใหม่ตั้งแต่บทแรก

---

## 🛠 Technical Tasks (LINE Integration & Deep Linking)
- [ ] เขียนฟังก์ชันสร้าง URL สำหรับแชร์ผ่าน LINE Schema (`https://social-plugins.line.me/lineit/share?url=...` หรือ `https://line.me/R/share?text=...`)
- [ ] กำหนดเนื้อหาข้อความแชร์ให้น่าสนใจ เช่น *"ชวนมาฝึกจับมิจฉาชีพด้วยกัน! เล่นเกมนี้ผ่านแล้วได้ดาวกี่ดวง มาลองดูสิ..."*
- [ ] ปรับตั้งค่าระบบ Routing ในฝั่ง React เพื่อรองรับคิวรีพารามิเตอร์ (เช่น `?lesson=topic-1`) และข้าม Onboarding ไปยังบทเรียนที่แชร์ได้โดยตรง
- [ ] ทดสอบความถูกต้องของลิงก์และการเปิดตัวแอปพลิเคชัน LINE บนโทรศัพท์เครื่องจริง

---

## 🔗 Related Files
- Backlog: [Product Backlog](../01-product-backlog.md)
- GDD: [Core Mechanics](../../gdd/01-mechanics.md)
- GDD: [User Journey](../../gdd/05-user-journey.md)
