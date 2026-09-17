# User Story: US-CF-11 - G6: แจ้งเตือนผู้ใช้เมื่อกดองค์ประกอบหลอกลวง

**Status:** 🟢 Done
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** TBD
**Priority:** High
**Estimate:** M
**Version:** 1.0 | **Last Updated:** 2026-07-31
**Deadline:** 2026-08-04
**Source:** [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md) ข้อ #11

---

## 📖 Description

**ในฐานะ** ผู้เรียนที่เล่นเกม G6 "จำลองแชท LINE"
**ฉันต้องการ** ได้รับคำเตือนทันทีเมื่อฉันกดหรือแตะที่ลิงก์หรือปุ่มหลอกลวงในเกม
**เพื่อให้** เรียนรู้ว่าสิ่งเหล่านั้นเป็นอันตราย และสร้างการตระหนักรู้ในชีวิตจริง

---

## ✅ Acceptance Criteria

1. [x] เมื่อผู้ใช้กด/แตะ scam element ใน G6 เกมแสดง warning/toast ขึ้นมาทันที
2. [x] ข้อความเตือนระบุชัดเจนว่าไม่ควรกดลิงก์/ปุ่มลักษณะนั้นในชีวิตจริง
3. [x] Warning แสดงอยู่ระยะหนึ่งก่อนหายไปเอง (auto-dismiss) หรือมีปุ่มปิด
4. [x] ข้อความเตือนใช้ภาษาไทยที่ชัดเจนและเข้าใจง่ายสำหรับผู้สูงอายุ
5. [x] การแสดง warning ไม่รบกวน gameplay หลัก (เช่น ไม่บล็อกหน้าจอนานเกินไป)

---

## 🛠 Technical Tasks

- [x] ระบุ scam elements ทั้งหมดใน G6 ที่ผู้ใช้สามารถโต้ตอบได้
- [x] สร้าง Warning/Toast component ที่ใช้งานได้ทั่วทั้ง G6
- [x] เชื่อม event handler ของ scam element กับ Warning component
- [x] เขียน copy ข้อความเตือนภาษาไทยที่เหมาะสม
- [x] ทดสอบว่า warning แสดงถูกต้องใน scenario ทุก scenario ของ G6

---

## ❓ Open Questions

1. ควร count จำนวนครั้งที่ผู้ใช้กด scam element เพื่อ analytics ด้วยไหม?
2. Warning ควร auto-dismiss หลังกี่วินาที (แนะนำ 3–5 วินาที)?

---

## 🔗 Related Documents

- Backlog: [Product Backlog](../01-product-backlog.md)
- G6 rework: [US-GAME-06-R1](./US-GAME-06-R1.md)
- Meeting Log: [ML-2026-07-31-client-feedback.md](../meeting-log/ML-2026-07-31-client-feedback.md)
