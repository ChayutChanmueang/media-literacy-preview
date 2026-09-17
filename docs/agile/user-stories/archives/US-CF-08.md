# User Story: US-CF-08 - G1: ออกแบบ UI ข้อความข่าวให้ดูเหมือน LINE / SMS

**Status:** 🟢 Done (code) 2026-08-03 — สร้าง `NewsMessageView` แสดงโจทย์เป็นข้อความแชท **สุ่ม LINE/SMS** ต่อข้อ ใน G1; `tsc`/eslint สะอาด (แนะนำ browser QA)
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** Medium
**Estimate:** M
**Version:** 1.2 | **Last Updated:** 2026-08-18

> 💡 **แนวทางที่ทีมเลือก (2026-08-03):** แทนที่จะ fix เป็น LINE หรือ SMS อย่างเดียว → **สุ่มสกินต่อโจทย์** ให้มีทั้งข้อความจาก LINE และ SMS
> - **LINE skin**: reuse สไตล์จากเกม G6 (พื้นครีมลายจุด ฟองขาว header avatar)
> - **SMS skin**: ดีไซน์ตาม Google Messages ของ Android (กลุ่มเป้าหมายส่วนใหญ่ใช้ Android) — header เหลือเฉพาะ avatar + ชื่อ/เบอร์, ฟองเทาชิดซ้าย
> - การสุ่มเป็น **deterministic ต่อ question id** (mix ทั้งสองแบบ, ไม่ flicker, testได้)
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #8

---

## 📖 Description

**ในฐานะ** ผู้ใช้ที่เล่นเกม G1 "จริงหรือมั่ว?"
**ฉันต้องการ** ให้ข้อความข่าวที่โจทย์แสดงดูเหมือนแอปส่งข้อความจริง เช่น LINE หรือ SMS
**เพื่อให้** โจทย์มีความสมจริง น่าเชื่อถือ และฝึกสังเกตสื่อได้ดียิ่งขึ้น

---

## ✅ Acceptance Criteria

1. [x] UI ข้อความโจทย์ใน G1 มี: ฟองข้อความ (chat bubble), ชื่อ/เบอร์ผู้ส่ง, timestamp — ครบทั้ง LINE และ SMS skin
2. [x] visual สอดคล้อง: LINE (ครีมลายจุด/ฟองขาว แบบ G6) หรือ SMS (พื้นขาว/ฟองเทา แบบ Google Messages) โดยสุ่มต่อโจทย์
3. [x] ไม่กระทบ logic การตอบ/เฉลย — เปลี่ยนเฉพาะการแสดงโจทย์ (question view) ปุ่มตอบ/reveal เดิมทั้งหมด
4. [~] mobile portrait — body มี `overflow-y-auto` รองรับข้อความยาว; **รอ browser QA ยืนยันพอดีจอ**

---

## 🛠 Technical Tasks

- [x] สร้าง `src/components/NewsMessageView.jsx` — 2 skin (LINE/SMS) พร้อม header (avatar+ชื่อ/เบอร์), ฟองข้อความ, timestamp; หัวแชทไม่ใส่ปุ่มกลับ/โทร/วิดีโอ/ค้นหา/เมนู เพื่อไม่ให้ผู้สูงอายุเข้าใจผิด
- [x] G1: เพิ่ม `channelForId()` (deterministic mix) + render `<NewsMessageView>` แทน news card เดิมในสถานะโจทย์
- [x] analytics เดิมไม่เปลี่ยน — `answer_question`/`toggle_audio`/`game_complete` ยิงเหมือนเดิม (ไม่แตะ handler)
- [x] `tsc`/eslint สะอาด; deterministic channel ให้ mix ทั้ง 5 โจทย์ (sms/line/sms/line/sms)
- [ ] browser QA: ดูโจทย์ทั้ง 5 ข้อทั้ง LINE และ SMS skin บน mobile portrait

## 🔭 ตามต่อ (อนาคต)
- ปัจจุบัน LINE skin ทำใหม่ให้ "เข้าชุด" กับ G6 (ไม่ได้ extract component ร่วมจริง) — หากต้องการ reuse ระดับโค้ดจริง ควร refactor แยก LINE chat frame ของ G6 ออกเป็น shared component (แยก task)

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G1 rework: [US-GAME-01-R1](./US-GAME-01-R1.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
