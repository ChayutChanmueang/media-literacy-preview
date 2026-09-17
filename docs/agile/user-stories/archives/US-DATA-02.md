# User Story: US-DATA-02 - ระบบบันทึกพฤติกรรมการใช้งานแบบอะซิงโครนัส (Asynchronous Action Logging)

**Status:** ✅ Done
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.1 | **Last Updated:** 2026-07-15

---

## 📖 Description
**ในฐานะ** ทีมโครงการ
**ฉันต้องการ** บันทึกประวัติและเวลาการกดใช้งานฟังก์ชันต่างๆ ของผู้เล่นในลักษณะเบื้องหลัง (Asynchronous)
**เพื่อให้** สามารถวิเคราะห์การลื่นไหลของแต่ละขั้นตอน (Funnel Analysis) และระบุจุดติดขัดที่ผู้ใช้งานมักจะปิดแอปหนี

---

## ✅ Acceptance Criteria
1. [ ] มีกลไกการส่งข้อมูลเหตุการณ์ (Event Dispatcher) ครอบคลุมพฤติกรรมสำคัญ:
   - การคลิกข้ามคลิปวิดีโอ (Skip Video)
   - การเข้าสู่หน้าเกมแต่ละข้อ (Enter Question)
   - การคลิกปุ่มเสียงอ่านโจทย์ (Toggle Audio Reader)
   - การปิดระบบกลางคันหรือย้อนกลับ (Navigation/Back Actions)
   - การแชร์ LINE (Share Click)
2. [ ] ข้อมูลที่ส่งต้องมีการประทับเวลาฝั่งผู้ใช้งาน (Client-side Timestamp) เพื่อความเที่ยงตรงของเวลาในการทำแต่ละกิจกรรม
3. [ ] บันทึกลงตารางข้อมูล `action_logs` ใน Supabase Database โดยทำงานเป็น Background Process ไม่ทำให้หน้าจอค้างหรือชะงักระหว่างเล่นเกม

---

## 🛠 Technical Tasks (Action Logging Framework)
- [ ] เขียนคำสั่ง SQL เพื่อสร้างตาราง `action_logs` ในฐานข้อมูล Supabase พร้อมการออกแบบสคีมา (เช่น `session_id`, `event_name`, `metadata`, `client_timestamp`)
- [ ] พัฒนา Logging Client Library/Helper ในฝั่ง React เพื่อส่ง Event แบบ Async (ใช้ `navigator.sendBeacon` หรือ non-blocking Axios request)
- [ ] แทรก Logger hooks ในส่วนหน้าจอวิดีโอ (Video Screen) และเกม (G1, G2, G3) เพื่อส่งพฤติกรรมจริงของผู้ใช้
- [ ] ทดสอบประสิทธิภาพการยิง Event เมื่อมีการสลับสัญญาณอินเทอร์เน็ตหรือจำลองกรณีเชื่อมต่อล่าช้า

---

## 🔗 Related Files
- Backlog: [Product Backlog](../01-product-backlog.md)
- Software Design: [Data Schema](../../software/03-data-schema.md)
- Software Design: [System Design](../../software/01-system-design.md)
