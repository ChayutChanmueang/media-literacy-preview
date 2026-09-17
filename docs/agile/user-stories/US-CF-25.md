# User Story: US-CF-25 - G3 "AI หรือ คน?": ลด header โจทย์ + เพิ่มภาพจริง

**Status:** 🟡 Partial (code) 2026-08-04 — item 1 (ตัด header → "ภาพนี้เป็นภาพจริงหรือ เอไอ" ในกรอบสีหลัก) เสร็จ; **item 2 (ภาพถ่ายจริง) รอ asset** (ปัจจุบัน q2/q4/q6 เป็น isAi:false แต่ดูเป็น AI-gen); `tsc` ผ่าน
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-04 ([ML](../meeting-log/ML-2026-08-04-client-feedback.md) #5–6)
**Owner:** TBD | **Priority:** Medium | **Estimate:** M (ต้องหา asset ภาพจริง)
**Version:** 1.0 | **Last Updated:** 2026-08-04

---

## 📖 Description

**ในฐานะ** ผู้เล่น G3 ที่ต้องดูภาพแล้วตัดสินว่าจริงหรือ AI
**ฉันต้องการ** ให้ข้อความบนภาพสั้น ไม่กินพื้นที่ และมีภาพถ่ายจริงปนด้วย
**เพื่อให้** โฟกัสที่ภาพ และได้ฝึกแยกทั้งภาพจริงและภาพ AI

---

## 🎯 สิ่งที่ต้องแก้ (`src/components/G3AIOrNot.jsx`)

**1) ลด header โจทย์ (หน้าโจทย์ `!isAnswered`)**
- ปัจจุบันแสดง `หัวข้อวิเคราะห์:` + `claim` (เช่น "ภาพโฆษณา: แพทย์หญิงผู้เชี่ยวชาญชวนซื้อยาบำรุงหัวใจ...") กินพื้นที่มาก
- **เอาออกทั้งหมด** แล้วใส่แค่ประโยคสั้น: **"ภาพนี้เป็นภาพจริงหรือ เอไอ"**
- *(หมายเหตุ: `claim`/คำอธิบายละเอียดยังใช้ในหน้าเฉลยได้ตามเดิม — ตัดเฉพาะ header หน้าโจทย์)*

**2) เพิ่มภาพถ่ายจริง 1–2 รูป**
- เพิ่มโจทย์ `isAi: false` (ภาพถ่ายจริง) อีก 1–2 ข้อ ให้ mix ภาพจริง/AI สมดุลขึ้น
- ต้องเตรียม asset ภาพถ่ายจริง (ใส่ใน `public/images/` เช่น `g3-qN.png`) + `explanation` จุดสังเกตว่าทำไมเป็นภาพจริง
- ภาพจริงต้อง **ไม่มี** ป้าย `aiDisclosure`

---

## ✅ Acceptance Criteria

1. [x] หน้าโจทย์ G3 แสดงเฉพาะ "ภาพนี้เป็นภาพจริงหรือ เอไอ" (กรอบสีหลัก banner) — ไม่มี "หัวข้อวิเคราะห์:"/claim ยาว
2. [ ] มีโจทย์ภาพถ่ายจริงเพิ่ม 1–2 ข้อ (`isAi:false`, ไม่มี ai_disclosure, มี explanation) — **รอไฟล์ภาพถ่ายจริง** (q2/q4/q6 ที่มีดูเป็น AI-gen)
3. [ ] คงนโยบาย: ทุกภาพ AI ยังมีป้าย ai_disclosure ในหน้าเฉลย
4. [ ] Layout ไม่พัง, ข้อความ ≥20px

---

## 🛠 Technical Tasks

- [ ] แก้ block หน้าโจทย์ใน `G3AIOrNot.jsx` ให้แสดงประโยคสั้นแทน header+claim
- [ ] จัดหา/ใส่ภาพถ่ายจริง 1–2 รูป + เพิ่ม entry ใน `QUESTIONS`
- [ ] `tsc` + browser QA

---

## 🔗 Related

- Feedback: [ML-2026-08-04](../meeting-log/ML-2026-08-04-client-feedback.md) #5–6
- Component: `src/components/G3AIOrNot.jsx` | เกม: [US-GAME-03](./US-GAME-03.md)
- เกี่ยวข้อง padding header: [US-UX-06](./US-UX-06.md)
