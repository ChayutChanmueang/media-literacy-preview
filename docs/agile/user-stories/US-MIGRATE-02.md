# User Story: US-MIGRATE-02 - ติดตั้งสไตล์และคอมโพเนนต์ด้วย Tailwind CSS + shadcn/ui (Tailwind & shadcn/ui Styling)

**Status:** ⏳ Planned
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-19

---

## 📖 Description
**ในฐานะ** ผู้เรียนสูงวัย
**ฉันต้องการ** หน้าจอที่มีความสอดคล้องของธีมสีประจำจังหวัด มีความโค้งมนของปุ่ม ขนาดปุ่มสัมผัสใหญ่เป็นพิเศษ และสามารถปรับขนาดอักษรได้
**เพื่อให้** ฉันสามารถสัมผัสปุ่มและอ่านข้อความช่วยเหลือได้อย่างสะดวกสบายโดยปราศจากอุปสรรคทางสายตาและการเคลื่อนไหว

---

## ✅ Acceptance Criteria
1. [ ] ติดตั้งและกำหนดค่า **Tailwind CSS** ใน Next.js พร้อมใช้งานร่วมกับไฟล์ `tailwind.config.ts`
2. [ ] ตั้งค่าการผูกธีมสีระดับจังหวัดใน `tailwind.config.ts` เข้ากับ CSS Variables ตามข้อกำหนดการแสดงผลธีม (ม่วง เชียงใหม่, เขียว น่าน, ส้ม แพร่, เขียวหัวเป็ด mint)
3. [ ] ติดตั้ง **shadcn/ui** ลงในโปรเจกต์ และนำเข้าคอมโพเนนต์ที่จำเป็น ได้แก่ `Button`, `Card`, `AlertDialog`, `Form`, `Switch`, และ `Select`
4. [ ] กำหนดค่า `@tailwind base` และ CSS variables ส่วนกลางใน `app/globals.css` พร้อมผูกสเตตแอตทริบิวต์ `data-size="normal|large|xlarge"` ในระดับบนสุดของเพจเพื่อปรับขนาด Font-size อัตโนมัติ (ขนาดตัวอักษรเริ่มต้นสำหรับผู้สูงอายุต้องมีขนาด 18px–20px เป็นอย่างน้อย)
5. [ ] คอมโพเนนต์ปุ่มกดหลักใน UI ของแอป ต้องมีขนาดความสูง Touch Target อย่างต่ำ **56px ถึง 64px** และขอบมนโค้งอย่างน้อย **16px (`rounded-lg` หรือ `rounded-2xl`)** เพื่อความปลอดภัยในการสัมผัส

---

## 🛠 Technical Tasks
- [ ] คอนฟิกไฟล์ `tailwind.config.ts` และจับคู่ CSS custom properties
- [ ] ติดตั้ง shadcn/ui CLI และทำการ Initial settings ในโปรเจกต์
- [ ] เขียนและทดสอบการสลับค่า `data-theme` บน `<html />` และการอ่านค่า LocalStorage
- [ ] ประกาศ CSS variables ขนาดฟอนต์สำหรับสเตต `data-size` ใน `app/globals.css`
- [ ] ปรับแก้คอมโพเนนต์ปุ่มและฟอร์มทั้งหมดใน UI หน้าจอให้มีขนาดความสูงตาม AC (56px–64px)

---

## 🔗 Related Files
- Design Tokens Specs: [docs/wiki/design/02-website-design-tokens.md](../../docs/wiki/design/02-website-design-tokens.md)
- Styling Specs: [docs/wiki/design/03-application-guideline.md](../../docs/wiki/design/03-application-guideline.md)
