# User Story: US-UX-08 - แสดงคำขวัญหลัก "หยุด คิด ถาม ทำ" บนหน้าแรก

**Status:** 🟢 Done (code) 2026-08-04 — เพิ่ม tagline `หยุด · คิด · ถาม · ทำ` ใต้หัวข้อรองใน `src/app/page.tsx`; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Branding / UX polish
**Owner:** TBD
**Priority:** Low
**Estimate:** XS
**Version:** 1.0 | **Last Updated:** 2026-08-04
**Source:** ทีม 2026-08-04 (นำคำขวัญจาก GDD มาแสดงบนหน้าแรกเพื่อเสริม branding)

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่เปิดแอปครั้งแรก
**ฉันต้องการ** เห็นคำขวัญหลัก "หยุด คิด ถาม ทำ" ตั้งแต่หน้าแรก
**เพื่อให้** จำหลักคิดสำคัญได้ตั้งแต่ก่อนเริ่มเรียน (ก่อนเชื่อ ก่อนโอน ก่อนแชร์)

> คำขวัญนี้เป็นแกนหลักใน [`gdd/02-narrative.md`](../../gdd/02-narrative.md) — เป็นสารหลักของ Topic 2 + ชุดที่ 2 (เชิงทัศนคติ) และแทรกในหน้าสรุปของทุกเกม (เช่น G4/G5/G6)

---

## 🎯 สิ่งที่ต้องแก้ (`src/app/page.tsx`)

เพิ่ม tagline คำขวัญ **ใต้หัวข้อรอง** (ระหว่าง H2 กับย่อหน้าแนะนำ):
- ข้อความ: `หยุด · คิด · ถาม · ทำ` (ตัวหนา สี `--primary-dark`, 26px — เกณฑ์ผู้สูงอายุ ≥20px)
- ไอคอนโล่ (`ShieldCheck` จาก lucide) สี `--primary` นำหน้า
- **ไม่แตะ badge บนสุด** (สงวนไว้ให้โลโก้จริงตาม [US-CF-21](./US-CF-21.md) ข้อ 1)

---

## ✅ Acceptance Criteria

1. [x] หน้าแรกแสดง `หยุด · คิด · ถาม · ทำ` ใต้หัวข้อรอง
2. [x] ฟอนต์ ≥20px (ใช้ 26px ตัวหนา) — เกณฑ์ Accessibility ผู้สูงอายุ
3. [x] มีไอคอนโล่ประกอบ, สีตรง design token
4. [x] ไม่กระทบ badge/หัวข้อ/ปุ่มเดิม
5. [~] Layout พอดีจอ ไม่ดัน content ล้น — **รอ browser QA**

---

## 🛠 Technical Tasks

- [x] import `ShieldCheck` จาก lucide-react
- [x] เพิ่มบล็อก tagline คำขวัญใน `src/app/page.tsx` (ระหว่าง `<h2>` กับ `<p>`)
- [x] `tsc --noEmit` ผ่าน
- [ ] browser QA: ยืนยันการแสดงผล + zero-scroll บนจอเล็ก

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Narrative (ที่มาคำขวัญ): [gdd/02-narrative.md](../../gdd/02-narrative.md)
- Landing copy feedback: [US-CF-21](./US-CF-21.md)
- Component: `src/app/page.tsx`
