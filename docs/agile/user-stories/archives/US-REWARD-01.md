# User Story: US-REWARD-01 - ระบบสะสมดาวความสำเร็จ (Star & Progress System)

**Status:** ✅ Done
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.1 | **Last Updated:** 2026-07-15

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** ได้รับดาวความสำเร็จเมื่อเล่นผ่านในแต่ละบทเรียน
**เพื่อให้** รู้สึกภูมิใจในความก้าวหน้าของตนเองและมีแรงจูงใจในการเรียนรู้หัวข้อถัดไป

---

## ✅ Acceptance Criteria
1. [ ] แสดงผลดาวที่สะสมสำเร็จของแต่ละบทบนแผนผังหน้าหลักหรือหน้าเลือกบทเรียน (Lesson Map / Selection Screen)
2. [ ] ข้อมูลดาวและความก้าวหน้าต้องไม่สูญหายไปแม้จะมีการปิดหน้าต่างเบราว์เซอร์หรือปิดแอปพลิเคชันไปแล้ว โดยใช้ระบบจัดเก็บข้อมูลแบบ Hybrid (Cookie ร่วมกับ LocalStorage)

---

## 🛠 Technical Tasks (Star System Development)
- [ ] ออกแบบและเขียนแอนิเมชันเอฟเฟกต์สำหรับรางวัลรูปดาว (เช่น หมุนขยายเมื่อได้ดาวใหม่) เพื่อสร้างความประทับใจ
- [ ] พัฒนา Progress Persistence Service เพื่อจัดการกับการเซฟและโหลดคะแนนผ่าน LocalStorage พร้อมกลไก Backup ลงใน Cookie (เนื่องจาก LINE in-app browser อาจเคลียร์คลังข้อมูลแบบด่วน)
- [ ] พัฒนา UI หน้าเลือกบทเรียน (Lesson Dashboard UI) ที่แสดงความคืบหน้าการได้ดาวของแต่ละบท (Topic 1, Topic 2, Topic 3)
- [ ] เขียนโค้ดเชื่อมโยง Event ตอนจบหน้าเกมเพื่อสะสมดาวเข้าสู่ระบบความคืบหน้า

---

## 🔗 Related Files
- Backlog: [Product Backlog](../01-product-backlog.md)
- GDD: [Core Mechanics](../../gdd/01-mechanics.md) (ระบบสะสมคะแนน/ดาว)
