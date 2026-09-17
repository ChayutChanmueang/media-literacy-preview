# User Story: US-UX-06 - Polish: เพิ่ม padding 15px (บน/ซ้าย/ขวา) ให้หัวข้อ+คำอธิบายโจทย์ G3

**Status:** 🟢 Done (code) 2026-08-03 — เพิ่ม `pt-[15px] px-[15px]` ให้ `<div text-left shrink-0>` ใน `G3AIOrNot.jsx`; `tsc` ผ่าน (แนะนำ browser QA)
**Epic:** [Product Backlog](../01-product-backlog.md) — UX polish (กลุ่มเดียวกับ [US-UX-05](./US-UX-05.md))
**Owner:** TBD
**Priority:** Low
**Estimate:** S
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Source:** คำสั่งทีม 2026-08-03 (พบตอนทดสอบ G3)

---

## 📖 Description

**ในฐานะ** ผู้เล่นเกม G3 "AI หรือ คน?"
**ฉันต้องการ** ให้ข้อความหัวข้อ ("หัวข้อวิเคราะห์:") และคำอธิบายโจทย์ (claim) มีระยะห่างจากขอบ ไม่ชิดขอบจอ
**เพื่อให้** อ่านสบายตาและดูเป็นระเบียบขึ้น

---

## 🎯 สิ่งที่ต้องแก้

เพิ่ม padding **บน / ซ้าย / ขวา = 15px** (ขยับเนื้อหาเข้ามา) ให้ element นี้ในหน้าโจทย์ของ G3:

```html
<div class="text-left shrink-0">
  <span class="... font-bold text-[var(--text-secondary)]">หัวข้อวิเคราะห์:</span>
  <p class="... font-bold leading-snug mt-2">ภาพโฆษณา: ...</p>
</div>
```

---

## ✅ Acceptance Criteria

1. [x] `<div class="text-left shrink-0">` ใน G3 มี padding บน/ซ้าย/ขวา 15px (`pt-[15px] px-[15px]`)
2. [x] ไม่ใส่ padding ล่าง (คงระยะกับภาพด้านล่างเดิม)
3. [~] Layout ไม่พัง (อยู่ใน branch `!isAnswered` เท่านั้น ไม่กระทบ reveal) — **รอ browser QA**

---

## 🛠 Technical Tasks

- [x] ใน `src/components/G3AIOrNot.jsx` (branch `!isAnswered`) เพิ่ม `pt-[15px] px-[15px]` ให้ `<div className="text-left shrink-0">`
- [ ] browser QA: ยืนยันระยะห่างและ layout ทั้ง 6 โจทย์

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G3: [US-GAME-03](./US-GAME-03.md)
</content>
