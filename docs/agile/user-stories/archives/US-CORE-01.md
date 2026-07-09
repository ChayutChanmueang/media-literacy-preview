# User Story: US-CORE-01 - เริ่มต้นใช้งานง่ายผ่านลิงก์ LINE (LINE In-App Integration)

**Status:** ✅ Done
**Epic:** [Core / โครงระบบ](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.1 (Completed) | **Last Updated:** 2026-07-03

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** เปิดแอปจากลิงก์ใน LINE แล้วเริ่มเรียนได้ทันที
**เพื่อให้** ไม่ต้องติดตั้งหรือสมัครอะไรให้ยุ่งยาก

---

## ✅ Acceptance Criteria
1. [x] สามารถเข้าใช้งานแอปพลิเคชันผ่าน LINE in-app browser ได้อย่างสมบูรณ์โดยไม่มีข้อบกพร่องทางหน้าจอ (UI distortion)
2. [x] ไม่มีระบบสมัครสมาชิกหรือขั้นตอนการลงชื่อเข้าใช้ (No Login Required) เพื่อลดอุปสรรคการเข้าถึงของผู้สูงอายุ
3. [x] หน้าแรกและโครงสร้างพื้นฐานโหลดเสร็จสมบูรณ์ภายในเวลาน้อยกว่า 3 วินาที บนเครือข่ายความเร็วระดับ 3G (จำลอง)

---

## 🛠 Technical Tasks (Vite + React Setup)
- [x] ตั้งค่าโครงการเบื้องต้นโดยใช้ Vite + React (TypeScript/JavaScript)
- [x] ตั้งค่าและทดสอบ `vite-plugin-pwa` เพื่อเปิดใช้งาน Service Worker และการแคชหน้าเว็บล่วงหน้า
- [x] พัฒนาหน้าจอแรกเริ่ม (Landing/Welcome Page) ที่สะอาดตา ปุ่มกดชัดเจน
- [x] ทดสอบเปิดลิงก์และหน้าเว็บใน LINE in-app browser ทั้งอุปกรณ์ระบบปฏิบัติการ iOS และ Android

---

## 🔗 Related Files
- Backlog: [Product Backlog](../01-product-backlog.md)
- GDD: [Concept & Architecture](../../gdd/00-concept.md)
- Software Design: [Application Flow & Routing](../../software/04-application-flow.md)
