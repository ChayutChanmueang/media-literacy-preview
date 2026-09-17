# User Story: US-CF-03 - เพิ่มหน้าแนะนำ (Intro Panel) ก่อนเริ่มเกม

**Status:** 🟢 Done (code) 2026-08-03 — สร้าง shared `GameIntro.tsx` + ใส่หน้าแนะนำใน G1/G3/G6 และ refactor intro ของ G13 มาใช้ตัวเดียวกัน; `tsc` ผ่าน ไม่มี lint issue ใหม่ (แนะนำ browser QA)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** High
**Estimate:** M
**Version:** 1.1 | **Last Updated:** 2026-08-03
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #3

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่เริ่มเล่นเกมเป็นครั้งแรก
**ฉันต้องการ** เห็นหน้าแนะนำที่บอกวัตถุประสงค์และวิธีเล่นก่อนเริ่ม gameplay
**เพื่อให้** เข้าใจเกมและมีความพร้อมก่อนเริ่มฝึก

---

## ✅ Acceptance Criteria

1. [x] มีหน้า Intro Panel แสดงก่อน gameplay — shared component `src/components/GameIntro.tsx` ใช้ใน G1/G3/G6 (นำหน้าเกม) และ G13 (refactor tutorial เดิมมาใช้)
2. [x] หน้าแนะนำมี: ชื่อเกม + **วัตถุประสงค์ 1 บรรทัด** + **กริดวิธีเล่นพื้นฐาน** (ไอคอน + ข้อความ)
3. [x] มีปุ่ม "เริ่มเล่น" ปิดหน้าแนะนำและเข้าเกม (log `game_intro_start` ต่อเกม)
4. [x] **แสดงทุกครั้งที่เปิดเกม** (per-game, ไม่มี localStorage flag) — ตัดสิน 2026-08-03 (ตอบ open Q #1, #3)
5. [~] Design สอดคล้อง visual แอป — ใช้ design token กลาง; G13 คงธีมแอมเบอร์ผ่าน prop; **รอ browser QA ยืนยันไม่ scroll บนจอเล็ก**

---

## 🛠 Technical Tasks

- [x] ออกแบบ Intro Panel component (`GameIntro.tsx`) — props: title, objective, instructions[], onStart, icon/mediaSlot, container/startButton className
- [x] ตัดสินใจ: แสดงทุกครั้งที่เปิดเกม (ไม่ใช้ LocalStorage flag) — per-game
- [x] Implement + เชื่อมก่อน gameplay: G1/G3 (phase `showIntro`), G6 (phase `showHowTo` นำหน้า scenario intro เดิม), G13 (refactor `phase==="tutorial"` มาใช้ GameIntro)
- [ ] browser QA บน mobile portrait (จอเล็ก/A10s): ยืนยันหน้าแนะนำพอดีจอไม่ scroll ทั้ง 4 เกม

---

## ❓ Open Questions

1. ~~ควรแสดงหน้าแนะนำทุกครั้งที่เข้าเกม หรือเฉพาะครั้งแรก?~~ ✅ ทุกครั้งที่เปิดเกม (2026-08-03)
2. copy ภาษาไทย: ร่างเบื้องต้นครบทั้ง 4 เกมแล้ว — G13 intro ยังมี task ขัดเกลาให้สร้างแรงจูงใจเพิ่มใน [US-CF-13](./US-CF-13.md)
3. ~~global หรือ per-game?~~ ✅ per-game (แต่ละเกมมีหน้าแนะนำของตัวเอง)

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
