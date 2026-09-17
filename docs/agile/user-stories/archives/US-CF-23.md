# User Story: US-CF-23 - หน้ากรอกข้อมูล: เพิ่มตัวเลือกจังหวัด "อื่นๆ"

**Status:** 🟢 Done (code) 2026-08-04 — เพิ่ม option "อื่นๆ" + ซ่อนอำเภอ/ตำบล + auto-set "อื่นๆ" ให้ผ่าน validation ใน `src/app/consent/page.tsx`; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 ([ML](../meeting-log/ML-2026-08-04-client-feedback.md) #1)
**Owner:** TBD | **Priority:** Medium | **Estimate:** XS
**Version:** 1.0 | **Last Updated:** 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้เล่นที่มาจากจังหวัดนอกเหนือ 3 จังหวัดเป้าหมาย (เชียงใหม่/แพร่/น่าน)
**ฉันต้องการ** เลือกจังหวัด "อื่นๆ" ได้
**เพื่อให้** กรอกข้อมูลและเข้าใช้งานต่อได้ ไม่ติดที่ dropdown

---

## 🎯 สิ่งที่ต้องแก้ (`src/app/consent/page.tsx`)

- ตัวเลือกจังหวัด (dropdown `province` ที่ map จาก `locationData.provinces` — ปัจจุบัน 3 จังหวัด) → **เพิ่มตัวเลือก "อื่นๆ"** ต่อท้าย
- **ไม่ต้อง**มีช่องกรอกรายละเอียด/จังหวัดเพิ่มเมื่อเลือก "อื่นๆ" (feedback ระบุชัด "ไม่ต้องมีรายละเอียดเพิ่มให้กด")
- ตรวจว่า validation/บันทึก `province: "อื่นๆ"` ผ่าน (ไม่บังคับต้องเป็น 1 ใน 3)
- **(เพิ่ม 2026-08-04) ตัวเลือกช่วงอายุ**: เพิ่ม **"อื่นๆ"** (`value: "other"`) ต่อท้าย เพื่อรองรับผู้เล่นอายุอื่น — ต้องเพิ่ม `"other"` ใน `z.enum` ของ `ageGroup` ใน `src/lib/validations.ts` ด้วย

---

## ✅ Acceptance Criteria

1. [x] dropdown จังหวัดมีตัวเลือก "อื่นๆ" เพิ่มจาก 3 จังหวัดเดิม
1b. [x] ตัวเลือกช่วงอายุมี "อื่นๆ" (`other`) + `z.enum` รองรับ
2. [x] เลือก "อื่นๆ" แล้วกดต่อได้ (ไม่มี field รายละเอียดเพิ่ม, validation ผ่าน)
3. [~] บันทึก session/log ค่า province ได้ปกติ
4. [~] Layout/ธีมไม่พัง

---

## 🛠 Technical Tasks

- [x] เพิ่ม option "อื่นๆ" ใน `<select province>` (จาก `locationData` หรือ hardcode ต่อท้าย list)
- [x] เช็ค Zod (min(1) → set "อื่นๆ" อัตโนมัติ)/validation ให้รับค่า "อื่นๆ"
- [x] `tsc` ผ่าน; [ ] browser QA

---

## 🔗 Related

- Feedback: [ML-2026-08-04](../meeting-log/ML-2026-08-04-client-feedback.md) #1
- Component: `src/app/consent/page.tsx` (หมายเหตุ: `ConsentScreen.jsx` เป็น dead code — ห้ามแก้ผิดตัว)
