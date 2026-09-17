# User Story: US-UX-05 - ทำเกมให้ Responsive และนำ Design จาก UX/UI มาใช้จริง

**Status:** 🏗 Planned
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-27

---

## 📖 Description
**ในฐานะ** ผู้สูงอายุที่เปิดแอปจากเครื่องหลากรุ่น/หลายขนาดจอผ่านลิงก์ LINE
**ฉันต้องการ** ให้หน้าจอเกมทุกเกมแสดงผลพอดีจอ ไม่ล้น ไม่ต้องเลื่อน และหน้าตาตรงกับที่ทีม UX/UI ออกแบบไว้
**เพื่อให้** ใช้งานง่าย อ่านชัด และดูเป็นระบบเดียวกันทุกหน้าจอ

---

## ✅ Acceptance Criteria
1. [ ] เกมทุกตัว (G1–G13) แสดงผลแบบ **portrait-first ไม่มี scroll** (single-screen) ตั้งแต่จอเล็ก (~320px กว้าง / เครื่องสเปคต่ำเช่น A10s) ถึงจอใหญ่ — ผ่าน audit ของ [zero-scroll-ui](../../../.claude/skills/zero-scroll-ui/SKILL.md)
2. [ ] ใช้ design token กลางจากทีม UX/UI ([design-tokens.json](../../wiki/design/design-tokens.json) / [02 Website Design Tokens](../../wiki/design/02-website-design-tokens.md)) แทนค่าสี/ขนาดที่ hardcode ในเกม
3. [ ] คงเกณฑ์ Accessibility จาก [03 Art Direction](../../gdd/03-art-direction.md): ตัวอักษรเนื้อหา ≥ 20px, ปุ่ม ≥ 22px, Contrast ≥ 4.5:1, Touch target ≥ 48×48px
4. [ ] รองรับ dark mode (`prefers-color-scheme`) และการสลับธีมรายจังหวัด (teal/purple/orange/green) + ระดับขยายฟอนต์ (`data-size`) ที่มีอยู่ ไม่พังเมื่อ responsive
5. [ ] ยังคงกติกาสี-สื่อความหมายคู่ไอคอน (ถูก/ผิดมี ✓ ✗ เสมอ) หลังปรับ layout

---

## 🛠 Technical Tasks
- [ ] ตรวจเกมที่ยัง hardcode สี hex ตรง ๆ (เช่น `facilitator` ใช้ `#0f172a`, `#38bdf8`) แล้วย้ายไปใช้ CSS variable จาก token
- [ ] แทนหน่วยตายตัว (px คงที่) ด้วยหน่วยยืดหยุ่น (%, clamp(), flex/grid, `max-width:100%`, `svh`/`dvh` สำหรับ LINE in-app browser)
- [ ] รัน audit [zero-scroll-ui](../../../.claude/skills/zero-scroll-ui/SKILL.md) รายเกม (G1–G13) บันทึกผลผ่าน/ไม่ผ่าน
- [ ] เทียบกับ [Playground UI Visualization](../../wiki/design/ui-visualization.html) และ [03 Application Guideline](../../wiki/design/03-application-guideline.md) ให้หน้าจริงตรง design
- [ ] ทดสอบจริงบนจอเล็ก/เครื่องสเปคต่ำ (A10s) และใน LINE in-app browser ก่อนถือว่าผ่าน

---

## ❓ Open Questions
1. มีไฟล์ Figma/มาสเตอร์ดีไซน์ล่าสุดจากทีม UX/UI นอกเหนือจาก `docs/wiki/design/` ไหม (จะได้ sync ให้ตรง)?
2. ขอบเขต Sprint นี้ครอบทุกเกม G1–G13 หรือโฟกัสเฉพาะเกมในสาย Flow ใหม่ (G1/G3/G6/G13) ก่อน?

---

## 🔗 Related Files
- Design source: `docs/wiki/design/` (tokens, guideline, visualization)
- Accessibility: [03 Art Direction](../../gdd/03-art-direction.md), skill `zero-scroll-ui`
- โค้ดเกม: `src/components/G1FactCheck.jsx` … `G13ScoopStacker.tsx`, `src/components/GameShell.jsx`, `src/app/globals.css`
