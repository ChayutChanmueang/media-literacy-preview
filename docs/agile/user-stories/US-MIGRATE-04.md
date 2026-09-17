# User Story: US-MIGRATE-04 - เขียนระบบการทดสอบตรรกะและโฟลว์ผู้ใช้จริงด้วย Vitest + Playwright (Vitest & Playwright Testing)

**Status:** ⏳ Planned
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-19

---

## 📖 Description
**ในฐานะ** ทีมประกันคุณภาพซอฟต์แวร์ (QA)
**ฉันต้องการ** มีระบบการทดสอบตรรกะประมวลผลและการทดสอบจำลองพฤติกรรมการใช้งานบนเบราว์เซอร์ของผู้เรียนจริงแบบอัตโนมัติ
**เพื่อให้** มั่นใจว่าฟังก์ชันการให้คะแนนและลูปการเรียนรู้ไม่มีการสะดุดหรือหลุดรันไทม์ และระบบรักษาสถานะออฟไลน์ได้จริงบน WebView ของ LINE

---

## ✅ Acceptance Criteria
1. [ ] ติดตั้งและตั้งค่า **Vitest** สำหรับประมวลผลการทดสอบ Logic/Unit tests ใน Next.js
2. [ ] เขียน Unit Tests ตรวจสอบตรรกะหลักของระบบดังนี้:
   - ตรวจความถูกต้องของ Onboarding Zod Schema (เช่น การบังคับเลือกตำแหน่งเมื่อยอมรับเงื่อนไขพิกัด)
   - ตรวจสอบฟังก์ชันการนับคะแนนและเฉลยคำถาม (Quiz Scoring Engine) ทั้งแบบ Pretest และ Posttest
   - ตรวจสอบฟังก์ชันการถอด/สลับระดับขนาดฟอนต์ (Font Size Accessibility Scale Helpers)
3. [ ] ติดตั้งและตั้งค่า **Playwright** สำหรับประมวลผลการทดสอบจำลองภาพและ E2E Tests
4. [ ] เขียนสคริปต์ Playwright สำหรับการจำลองโฟลว์ผู้ใช้งานเต็มลูป (E2E User Journey):
   - จำลองผู้เล่นกดยินยอมและกรอกอายุ -> ทำแบบทดสอบก่อนเรียน -> เลือกบทเรียน -> เรียนรู้ -> เล่นด่านเกมจนครบด่าน -> ได้ดาวสะสมครบ -> ทำแบบทดสอบหลังเรียน -> กรอกชื่อเพื่อดาวน์โหลดใบประกาศ -> เรียกฟังก์ชันแชร์ LINE
   - จำลองสภาพแวดล้อมโทรศัพท์มือถือ (Mobile Browser Emulation) และการแสดงผล WebView ใน LINE
5. [ ] เขียน E2E Tests จำลองสถานะออฟไลน์ (Network Offline Mode):
   - ทำการบล็อกสัญญาณเครือข่ายระหว่างเล่นเกม ตรวจสอบว่าระบบแสดง UI เตือนออฟไลน์หรือไม่ และสถิติความก้าวหน้าสามารถกักตุนลงคิว IndexedDB และถูกส่งขึ้น API ใหม่เมื่อต่อเน็ตออนไลน์ได้สำเร็จจริง

---

## 🛠 Technical Tasks
- [ ] ติดตั้งและคอนฟิก Vitest ในสภาพแวดล้อม Next.js
- [ ] เขียนและทดสอบ Unit Test Cases ของคำนวณผลการสอบและ Zod Validation
- [ ] ติดตั้ง Playwright และรันสคริปต์สร้างการทดสอบอัตโนมัติเบื้องต้น
- [ ] เขียน Playwright Test Scenario จำลอง Onboarding to Certificate Flow
- [ ] เขียน E2E Test จำลอง Router Guards Redirect Block
- [ ] จำลองการตัดสัญญาณเน็ตผ่าน Playwright API เพื่อยืนยัน Offline Caching

---

## 🔗 Related Files
- Testing Specs: [docs/software/02-architecture.md](../../docs/software/02-architecture.md#5-testing-strategy-แนวทางการทดสอบระบบ)
- App Flow Specs: [docs/software/04-application-flow.md](../../docs/software/04-application-flow.md)
