# User Story: US-CORE-04 - ระบบควบคุมลำดับบทเรียน (Sequence Engine)

**Status:** ✅ Done
**Epic:** [Core / โครงระบบ](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.1 (Completed) | **Last Updated:** 2026-07-03

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** ให้ระบบนำทางและควบคุมขั้นตอนการเรียนไปทีละสเต็ป (ดูคลิป -> เล่นเกม -> ไปหน้าถัดไป)
**เพื่อให้** สามารถทำตามขั้นตอนได้ครบถ้วนโดยไม่หลงทางหรือสับสนกับระบบของแอป

---

## ✅ Acceptance Criteria
1. [x] ระบบต้องคอยนำทางและบังคับให้เป็นไปตามลำดับ (Landing -> Onboarding -> Video -> Game -> Score/Reward -> Next Lesson)
2. [x] มีเพียงปุ่มดำเนินการหลัก (Primary CTA) เพียงปุ่มเดียวในแต่ละหน้าจอย่อยเพื่อป้องกันความสับสน
3. [x] บันทึกสถานะบทเรียนที่เรียนถึงปัจจุบันของผู้เล่นลงใน Cookies หรือ LocalStorage เพื่อให้ผู้เล่นกลับมาทำบทเรียนต่อได้ทันทีหากปิดหน้าระหว่างเล่น

---

## 🛠 Technical Tasks (Sequence Engine Development)
- [x] ออกแบบ State Machine สำหรับควบคุมลำดับหน้าจอตามบทเรียนและหัวข้อ
- [x] พัฒนา Router logic ใน React เพื่อนำผู้เล่นไปยังหน้าที่เหมาะสมตามลำดับของ State
- [x] ออกแบบระบบ Local Cache (Progress Service) ในการบันทึกสถานะบทเรียนที่ทำผ่านไปแล้ว
- [x] ออกแบบและจัดวางปุ่ม "ถัดไป" ให้อยู่ในตำแหน่งส่วนล่างที่มองเห็นชัดเจนที่สุดและมีการเน้นสีให้ดูโดดเด่น

---

## 🔗 Related Files
- Backlog: [Product Backlog](../01-product-backlog.md)
- GDD: [Core Mechanics](../../gdd/01-mechanics.md)
- Software Design: [Application Flow & Routing](../../software/04-application-flow.md)
