# User Story: US-CF-51 - Polish UX/UI ตาม Design จาก UX/UI Designer

**Status:** 🔴 To Do  
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-14  
**Owner:** TBD | **Priority:** Should Have | **Estimate:** L  
**Version:** 1.0 | **Last Updated:** 2026-08-14  

---

## 📖 Description

**ในฐานะ** ผู้เรียน (ผู้สูงอายุ)  
**ฉันต้องการ** ให้หน้าจอทุกหน้าถูกปรับปรุง UX/UI ตาม design ที่ UX/UI designer ออกแบบมา  
**เพื่อที่จะ** มีประสบการณ์ใช้งานที่สวยงาม สอดคล้อง เข้าใจง่าย และรู้สึกเป็นมืออาชีพ

---

## 🎯 ขอบเขต

### หน้าจอที่ต้องดำเนินการ (TBD — รอ design asset)
งาน polish นี้ครอบคลุม **ทุกหน้าจอหลัก** ที่ designer ส่ง design มา ซึ่งอาจรวมถึง:
- หน้า Landing (`/`)
- หน้า Consent / Onboarding
- หน้า Start Menu (`/lessons`)
- หน้า Video Player
- หน้า Game Intro / Game UI (G1, G3, G6, G13)
- หน้า Summary / Score
- หน้า Completion / Certificate

### แนวทางการ Polish
1. **สี / Color Palette** — ปรับตาม design system ที่ designer กำหนด
2. **Typography** — ฟอนต์, ขนาด, น้ำหนัก, line-height ตาม spec
3. **Spacing / Layout** — margin, padding, gap ตาม design
4. **Components** — ปุ่ม, card, badge, input ตาม design
5. **Icons / Illustrations** — เปลี่ยนเป็น asset จาก designer
6. **Animation / Transition** — เพิ่ม/ปรับ micro-animation ตาม spec
7. **Responsive** — ตรวจสอบบนจอเล็ก (A10s), จอกลาง, จอใหญ่

---

## ✅ Acceptance Criteria

1. [ ] ได้รับ **design assets** จาก UX/UI designer (Figma / ไฟล์ภาพ / Design spec)
2. [ ] ทุกหน้าจอที่มี design → ปรับ UI ตรงตาม design (pixel-perfect หรือใกล้เคียงที่สุด)
3. [ ] ใช้ **design token กลาง** (สี, ฟอนต์, spacing) — ไม่ hardcode ค่าเฉพาะจุด
4. [ ] คงเกณฑ์ **Accessibility สำหรับผู้สูงอายุ** (ฟอนต์ ≥ 20px, ปุ่มใหญ่, contrast ratio)
5. [ ] **Zero-scroll** บนจอเล็กทุกหน้า (ยกเว้นหน้าที่ design กำหนดให้ scroll ได้)
6. [ ] `tsc --noEmit` ผ่าน + responsive ครบทุกขนาดจอ
7. [ ] (QA) ตรวจสอบเทียบ design ทุกหน้า

---

## 🛠 Technical Tasks

- [ ] รับ design assets จาก designer (Figma link / ไฟล์ภาพ / spec doc)
- [ ] สร้าง/อัปเดต design token (`globals.css` / theme) ตาม design system ใหม่
- [ ] ปรับ component ทีละหน้า:
  - [ ] Landing page
  - [ ] Consent / Onboarding
  - [ ] Start Menu
  - [ ] Video Player
  - [ ] Game Intro (G1/G3/G6/G13)
  - [ ] Game UI (G1/G3/G6/G13)
  - [ ] Summary / Score
  - [ ] Completion
- [ ] ทดสอบ responsive บนจอเล็ก (A10s), จอกลาง, จอใหญ่
- [ ] (QA) เทียบ design vs. implementation ทุกหน้า

---

## 📝 หมายเหตุ

- Story นี้เป็น **umbrella story** — อาจแตกย่อยเป็น sub-tasks หรือ user stories เพิ่มเมื่อได้รับ design assets
- **ยังไม่มี design assets ณ ตอนสร้าง story** — จะอัปเดตเมื่อได้รับจาก designer
- ควรทำหลังจากงาน Client Feedback ที่เร่งกว่าเสร็จแล้ว
- เกี่ยวข้องกับ [US-UX-05](./US-UX-05.md) (responsive + design UX/UI) แต่ขอบเขตกว้างกว่า

---

## 🔗 Related

- Responsive & Design: [US-UX-05](./US-UX-05.md)
- Art Direction: [03-art-direction](../../gdd/03-art-direction.md)
- Design Token / Theme: [US-MIGRATE-02](./US-MIGRATE-02.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
