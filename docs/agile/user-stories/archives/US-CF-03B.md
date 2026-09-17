# User Story: US-CF-03B - Polish หน้า Intro: ขยายฟอนต์ "วิธีเล่น" + scroll ได้ + ปุ่ม docked ชิดล่าง

**Status:** 🟢 Done (code) 2026-08-03 — ขยายฟอนต์ "วิธีเล่น" (≥20px) + ห่อ `GameIntro` ให้ scroll ได้ + ย้ายปุ่มเริ่มเล่น dock ชิดล่างเต็มจอ + เพิ่มกฏ font/scroll ใน AGENT.md; `tsc` ผ่าน (แนะนำ browser QA จอเตี้ย)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** High
**Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-08-03
**Source:** คำสั่งทีมเพิ่มเติม 2026-08-03 (polish ต่อจาก [US-CF-03](./US-CF-03.md))

---

## 📖 Description

**ในฐานะ** ผู้สูงอายุที่เปิดหน้าแนะนำเกม (Intro Panel)
**ฉันต้องการ** ให้ตัวอักษร "วิธีเล่น" ใหญ่พออ่านสบาย และหน้าแนะนำไม่ถูกบีบจน UI พังบนจอเตี้ย
**เพื่อให้** อ่านง่ายและใช้งานได้จริงบนอุปกรณ์ทุกขนาด

---

## 🐞 ปัญหาที่พบ

1. ฟอนต์คำว่า **"วิธีเล่น"** ใน `GameIntro` เล็กเกินไป (`clamp(14px,3.7vw,17px)` — max 17px **ต่ำกว่าเกณฑ์ ≥ 20px** ของผู้สูงอายุ)
2. หน้า intro ของทุกเกม **scroll ไม่ได้** — บนจอที่ไม่สูงพอ เนื้อหาถูกบีบ (flex shrink) จน layout พัง
3. **ปุ่มเริ่มเล่นไม่เหมือนหน้าอื่น** — เป็นปุ่มลอยกลางจอ (`max-w-xs min-h-16`) ควรเป็นปุ่ม **dock ชิดล่างเต็มความกว้าง** สไตล์เดียวกับหน้าอื่น (`min-h-[100px] rounded-t-[25px] rounded-b-none`)

---

## ✅ Acceptance Criteria

1. [x] ฟอนต์ "วิธีเล่น" ขยายเป็น `clamp(18px,4.8vw,22px)` (max ≥ 20px ตามเกณฑ์); objective/instructions ยก min เป็น 18px ด้วย
2. [x] `GameIntro` scroll ได้: `overflow-y-auto` + inner `min-h-full` → จอสูงพอ = จัดกึ่งกลาง, จอเตี้ย = เลื่อนดูได้ ไม่โดนบีบ
3. [x] ปุ่มเริ่มเล่น dock ชิดล่างเต็มความกว้าง (`btn w-full min-h-[100px] rounded-t-[25px] rounded-b-none text-[26px]`) แยกออกจากพื้นที่ scroll — สไตล์เดียวกับปุ่มหน้าอื่น
4. [x] ครอบคลุมทุกเกมที่ใช้ `GameIntro` (G1/G3/G6/G13) เพราะเป็น shared component
5. [x] เพิ่มกฏใน [AGENT.md](../../../AGENT.md): (ก) ห้ามตัวหนังสือเล็ก ใช้กับทุก label/caption, (ข) หน้า/content ใหม่ต้อง scroll ได้
6. [ ] browser QA: เปิด intro บนจอเตี้ย (เช่น landscape/จอเล็ก) ยืนยันเลื่อนได้, ไม่บีบ, ปุ่มติดล่าง

---

## 🛠 Technical Tasks

- [x] `src/components/GameIntro.tsx`: ขยายฟอนต์ "วิธีเล่น" + restructure เป็น scroll area (`overflow-y-auto` + `min-h-full`) + ย้ายปุ่มเริ่มเล่นออกมา dock ชิดล่างเต็มจอ
- [x] เพิ่มกฏ 2 ข้อใน `AGENT.md` (accessibility): ห้าม font เล็ก (ทุก label) + หน้า/content ใหม่ต้อง scroll ได้
- [ ] browser QA จอเตี้ยทั้ง 4 เกม

---

## 🔗 Related Documents

- ต้นทาง: [US-CF-03](./US-CF-03.md) (Intro Panel)
- กฏ: [AGENT.md](../../../AGENT.md) → Design Tokens & Accessibility
- Backlog: [Product Backlog](../01-product-backlog.md)
</content>
