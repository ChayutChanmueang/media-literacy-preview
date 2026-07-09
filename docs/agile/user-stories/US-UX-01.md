# User Story: US-UX-01 - การออกแบบเพื่อการเข้าถึงและการใช้งานของผู้สูงอายุ (Senior Accessibility Guidelines)

**Status:** 🏗 Planned
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-03

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุ
**ฉันต้องการ** หน้าจอแอปพลิเคชันที่มีตัวหนังสือขนาดใหญ่ ปุ่มกดชัดเจน และขั้นตอนการใช้งานที่เข้าใจง่าย
**เพื่อให้** สามารถเรียนรู้และทำกิจกรรมในแอปได้ด้วยตนเองโดยไม่ต้องมีผู้อื่นคอยแนะนำหรือช่วยเหลือ

---

## ✅ Acceptance Criteria
1. [ ] ผ่านการตรวจสอบเกณฑ์ Accessibility ตามระบุใน [Art Direction](../../gdd/03-art-direction.md):
   - ตัวอักษรเนื้อหาหลักขนาดไม่ต่ำกว่า `18px` หรือ `1.125rem`
   - คอนทราสต์ของสีข้อความและพื้นหลังตรงตามมาตรฐาน WCAG AAA (Contrast ratio อย่างน้อย `4.5:1` สำหรับเนื้อหาทั่วไป)
   - ขนาดพื้นที่สัมผัสของปุ่ม (Target Touch Size) ไม่ต่ำกว่า `48px x 48px` และระยะห่างที่เหมาะสมเพื่อป้องกันการกดพลาด
2. [ ] โครงสร้างระบบเข้าใจง่าย ไม่มีเมนูซับซ้อน (ใช้ linear flow ป้องกันการหลงทาง)
3. [ ] จัดการทดสอบและสังเกตการณ์การใช้งานจริงกับผู้สูงอายุกลุ่มเป้าหมาย (อายุ 60 ปีขึ้นไป) อย่างน้อย 3 คน และนำ Feedback มาแก้ไขจุดติดขัด

---

## 🛠 Technical Tasks (Senior UI/UX & User Testing)
- [ ] สร้างชุด CSS Classes / Variables ในไฟล์ CSS หลัก (`index.css`) เพื่อเป็นระบบ Design System สำหรับปุ่ม ข้อความ และเลย์เอาต์ขนาดใหญ่
- [ ] พัฒนา UI Components ทั้งหมดโดยยึดตาม Design System ที่กว้างขวางและตอบสนองได้ดี (Responsive Touch Targets)
- [ ] ดำเนินการรันชุดเครื่องมือทดสอบการเข้าถึง (เช่น Chrome Lighthouse Accessibility)
- [ ] จัดตั้งแผนการทดสอบแบบตัวต่อตัว (Observation Session) ร่วมกับผู้สูงอายุ 3 คนในระยะท้ายของ Sprint 02 หรือในช่วงต้นของ Sprint 03

---

## 🔗 Related Files
- Backlog: [Product Backlog](../01-product-backlog.md)
- GDD: [Art Direction & UI/UX](../../gdd/03-art-direction.md)
