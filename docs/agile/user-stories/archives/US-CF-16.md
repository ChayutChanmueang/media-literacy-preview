# User Story: US-CF-16 - G6: แยกคำว่า "สถานการณ์" ออกจากชื่อเหตุการณ์

**Status:** 🟢 Done
*(หมายเหตุ: โค้ดส่วนนี้ยังอยู่ครบแต่หน้าจอถูกปิดชั่วคราวด้วย flag `SHOW_SCENARIO_INTRO = false` จาก US-CF-26)*
**Epic:** [Client Feedback — 4 ส.ค. 2569](../01-product-backlog.md#client-feedback--deadline-4-สค-2569)
**Owner:** Antigravity
**Priority:** Medium
**Estimate:** S
**Version:** 1.0 | **Last Updated:** 2026-08-04
**Deadline:** 2026-08-04
**Source:** Client Feedback เพิ่มเติม 2026-08-03

---

## 📖 Description

**ในฐานะ** ผู้เล่นเกม G6 จำลองแชท LINE
**ฉันต้องการ** ให้คำว่า "สถานการณ์" แยกออกจากชื่อเหตุการณ์ (event title) อย่างชัดเจน
**เพื่อให้** อ่านหัวข้อได้ง่ายขึ้น ไม่สับสนว่าส่วนไหนเป็นลำดับสถานการณ์ ส่วนไหนเป็นชื่อเรื่อง

---

## 🎯 Before / After

**ก่อน (รวมกัน):**
```
สถานการณ์ที่ 1: เจ้าหน้าที่สรรพากรทวงภาษีค้างจ่าย
```

**หลัง (แยกชัดเจน):**
```
สถานการณ์ที่ 1
เจ้าหน้าที่สรรพากรทวงภาษีค้างจ่าย
```

---

## ✅ Acceptance Criteria

1. [x] คำว่า "สถานการณ์ที่ N" แสดงแยกเป็นบรรทัดหรือ element แยกจากชื่อเหตุการณ์ ในทุกจุดที่แสดง event title ใน G6
2. [x] ชื่อเหตุการณ์ (ส่วนหลัง ": ") แสดงเด่นชัดกว่าป้ายลำดับ
3. [x] ใช้ได้ครบทุกสถานการณ์ (s1/s2/s3) โดยไม่ต้องแก้ข้อมูลทีละอัน
4. [x] Layout ไม่พัง/ไม่ scroll บนจอ mobile portrait

---

## 🛠 Technical Tasks

- [x] ระบุทุกจุดใน G6 component ที่แสดง event title (หน้า intro, header ระหว่างเล่น, หน้าสรุป)
- [x] แยก title string ที่รูปแบบ `"สถานการณ์ที่ N: <ชื่อเรื่อง>"` ออกเป็น 2 ส่วน
- [x] Render ป้ายลำดับ ("สถานการณ์ที่ N") และชื่อเรื่องแยก element / แยกบรรทัด
- [x] Fallback กรณี title ไม่มี ": " — แสดงบรรทัดเดียวตามเดิม
- [x] Browser QA ทั้ง 3 สถานการณ์บน mobile portrait

---

## 🔗 Related Documents

- เกี่ยวข้อง (2 บรรทัด intro): [US-CF-09B](./US-CF-09B.md)
- G6 remake: [US-GAME-06-R1](./US-GAME-06-R1.md)
- Backlog: [Product Backlog](../01-product-backlog.md)
