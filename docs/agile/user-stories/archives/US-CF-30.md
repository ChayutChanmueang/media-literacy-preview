# User Story: US-CF-30 - จัด layout หน้าชื่อคลิป (video intro) ให้อยู่กึ่งกลางแบบ Start Menu

**Status:** 🟢 Done (code) 2026-08-04 — เปลี่ยน phase intro เป็น `screen-container justify-center` + ปุ่มใต้ข้อความ (แบบ Start Menu) ใน `video/page.tsx`; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 ([ML](../meeting-log/ML-2026-08-04-client-feedback.md) #16)
**Owner:** TBD | **Priority:** Low | **Estimate:** XS
**Version:** 1.0 | **Last Updated:** 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่เห็นหน้าชื่อคลิป (intro ก่อนดูวิดีโอ ตาม [US-CF-24](./US-CF-24.md))
**ฉันต้องการ** ให้ข้อความชื่อคลิปกับปุ่ม "ดูคลิป" อยู่ใกล้กันกึ่งกลางจอ แบบเดียวกับหน้า Start Menu
**เพื่อให้** ดูเป็นระเบียบ ไม่มีช่องว่างใหญ่ระหว่างข้อความกับปุ่ม

---

## 🎯 สิ่งที่ต้องแก้ (`src/app/lessons/[id]/video/page.tsx` — phase `intro`)

- ปัจจุบันหน้า intro ใช้ `content-area my-auto` (ข้อความกึ่งกลาง) + ปุ่ม `mt-auto` (ชิดล่าง) → มีช่องว่างใหญ่ระหว่างชื่อคลิปกับปุ่ม
- ปรับให้เป็นแบบ **Start Menu** (`lessons/page.tsx` `activeSubPage === "modes"`): `screen-container justify-center` + `ClipTitleCard` + ปุ่มอยู่ **ใต้ข้อความทันที** (จัดกลุ่มกึ่งกลางจอ) ไม่ดันปุ่มลงล่างสุด
- คงปุ่ม "ดูคลิป" + auto-advance 15 วิเหมือนเดิม

---

## ✅ Acceptance Criteria

1. [ ] หน้าชื่อคลิป: ข้อความ + ปุ่ม "ดูคลิป" จัดกลุ่มกึ่งกลางจอ (ปุ่มอยู่ใต้ข้อความ ไม่ชิดล่างสุด)
2. [ ] เหมือน layout หน้า Start Menu (อ้างอิงภาพที่ทีมให้)
3. [ ] auto-advance 15 วิ + กดเองยังทำงาน
4. [ ] `tsc` ผ่าน

---

## 🛠 Technical Tasks

- [ ] เปลี่ยนโครง phase `intro` ใน `video/page.tsx` ให้จัดกึ่งกลาง (เทียบ Start Menu)
- [ ] `tsc` + browser QA

---

## 🔗 Related

- Feedback: [ML-2026-08-04](../meeting-log/ML-2026-08-04-client-feedback.md) #16
- ต่อยอดจาก [US-CF-24](./US-CF-24.md) (สร้างหน้า intro) / [US-CF-22](./US-CF-22.md) (Start Menu layout)
- Component: `src/app/lessons/[id]/video/page.tsx`, `src/components/ClipTitleCard.tsx`
