# User Story: US-CF-29 - G1: แสดง bold จริง (แทน `**`) + ลบ ":" จากหมวดข่าว

**Status:** 🟢 Done (code) 2026-08-04 — `RichText` render `**bold**`→`<strong>` ใน G1 เฉลย + NewsMessageView; ลบ ":" q3/q4; `tsc`/lint ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 ([ML](../meeting-log/ML-2026-08-04-client-feedback.md) #14–15)
**Owner:** TBD | **Priority:** Medium | **Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้เล่น G1
**ฉันต้องการ** ให้ข้อความที่เน้นแสดงเป็น **ตัวหนาจริง** (ไม่ใช่เห็น `**` ติดมา) และหมวดข่าวไม่มี ":" ห้อยเกะกะ
**เพื่อให้** อ่านสวย เป็นธรรมชาติเหมือนข้อความจริง

---

## 🎯 สิ่งที่ต้องแก้

**1) แสดง `**bold**` เป็นตัวหนาจริง** (`src/components/G1FactCheck.jsx`)
- ปัจจุบันในหน้าเฉลย (`explanation`) มี markdown `**...**` (5 จุด เช่น `**ไม่มีหลักฐานทางวิทยาศาสตร์**`) แต่ render เป็น plain text → เห็น `**` ติดมา
- แก้ให้ render เป็น **ตัวหนาจริง** — ทำ helper เล็ก ๆ แปลง `**x**` → `<strong>x</strong>` (หรือ split เป็น segment) ใช้ตรงที่แสดง `explanation`
- ตรวจ **หน้าจำลองแชท** (claim ที่แสดงผ่าน `NewsMessageView`) ด้วย — ถ้ามี `**` ให้ใช้ helper เดียวกัน (ปัจจุบัน claim ไม่มี `**` แต่เผื่ออนาคต)
- *(หมายเหตุ: ห้ามใช้ `dangerouslySetInnerHTML` กับข้อมูลที่ไม่ควบคุม — ใช้ parser ที่ปลอดภัย render เป็น React node)*

**2) ลบ ":" จากหมวดข่าวใน claim**
- `ข่าวสารสุขภาพ:` → `ข่าวสารสุขภาพ` (q3)
- `ข่าวสารการเตือนภัย:` → `ข่าวสารการเตือนภัย` (q4)
- ทบทวน claim อื่นเผื่อมี ":" หมวดห้อยอยู่

---

## ✅ Acceptance Criteria

1. [ ] หน้าเฉลย G1 แสดงคำที่เน้นเป็นตัวหนาจริง ไม่มี `**` โผล่
2. [ ] claim หมวดข่าวไม่มี ":" ต่อท้ายหมวด
3. [ ] ไม่ใช้ `dangerouslySetInnerHTML` แบบไม่ปลอดภัย
4. [ ] `tsc`/lint ผ่าน

---

## 🛠 Technical Tasks

- [ ] helper `renderBold(text)` แปลง `**x**` → `<strong>` (pure, ปลอดภัย)
- [ ] ใช้ helper กับ `explanation` (และ claim ใน NewsMessageView ถ้าจำเป็น)
- [ ] ลบ ":" ใน `QUESTIONS[].claim` (q3, q4)
- [ ] `tsc`/lint + browser QA

---

## 🔗 Related

- Feedback: [ML-2026-08-04](../meeting-log/ML-2026-08-04-client-feedback.md) #14–15
- Component: `src/components/G1FactCheck.jsx`, `src/components/NewsMessageView.jsx`
- ต่อยอดจาก [US-CF-24](./US-CF-24.md) (หมวดข่าว), [US-CF-08](./US-CF-08.md) (chat view)
