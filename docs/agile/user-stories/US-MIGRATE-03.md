# User Story: US-MIGRATE-03 - พัฒนาระบบจัดการแบบฟอร์มด้วย React Hook Form + Zod และเชื่อมโยงข้อมูลหลังบ้านเข้ากับ Supabase (Form Management & Supabase Integration)

**Status:** ⏳ Planned
**Epic:** [Product Backlog](../01-product-backlog.md)
**Owner:** TBD
**Version:** 1.0 | **Last Updated:** 2026-07-19

---

## 📖 Description
**ในฐานะ** ทีมพัฒนาระบบหลังบ้าน
**ฉันต้องการ** ใช้ระบบจัดการแบบฟอร์มที่มีประสิทธิภาพสูงพร้อมเครื่องมือตรวจสอบความถูกต้องของข้อมูล (Schema Validation) และใช้ Supabase ในการจัดการฐานข้อมูลและจัดเก็บไฟล์สื่อ
**เพื่อให้** ข้อมูลการเรียนและสถิติดิจิทัลบันทึกได้อย่างปลอดภัย ได้ภาพใบประกาศที่สมบูรณ์ และมีกลไกเก็บข้อมูลแบบออฟไลน์สำหรับพื้นที่สัญญาณอินเทอร์เน็ตไม่เสถียร

---

## ✅ Acceptance Criteria
1. [ ] กำหนด Zod validation schemas สำหรับฟอร์ม Consent, ฟอร์มเลือกพิกัด และ ฟอร์มทำแบบทดสอบ/กรอกชื่อเล่น เพื่อใช้งานตรวจสอบข้อมูลทั้งฝั่ง Client และในระดับ API
2. [ ] พัฒนาฟอร์มกรอกข้อมูลความยินยอม/ช่วงอายุ/เลือกจังหวัดอำเภอตำบล โดยผูกการจัดการสถานะด้วย **React Hook Form** และแก้ปัญหาระบบ Re-render ล่าช้าขณะใช้งาน
3. [ ] ติดตั้งและตั้งค่าการทำงานร่วมกับ **Supabase Client SDK** ใน Next.js ทั้งฝั่ง Client และ Server (API Route Handlers)
4. [ ] พัฒนา Next.js API Routes (`app/api/...`) ให้รองรับการทำงาน Asynchronous รับข้อมูลและบันทึกลงตารางที่เกี่ยวข้องของ Supabase ได้แก่:
   - บันทึกเซสชันลงตาราง `sessions`
   - บันทึกประวัติหน้าเพจลงตาราง `page_views`
   - บันทึกสถิติกดปุ่มลงตาราง `action_logs`
   - บันทึกดาวบทเรียนลงตาราง `lesson_progress`
   - บันทึกผลสอบ Pretest/Posttest ลงตาราง `quiz_attempts` และ `quiz_answers`
5. [ ] พัฒนาระบบ **Offline Synchronization Queue** บน Client (โดยใช้ IndexedDB หรือ localStorage) เพื่อกักเก็บข้อมูล Log หรือผลคะแนนสอบที่เกิดตอนอินเทอร์เน็ตหลุดเอาไว้ และส่งกลับเซิร์ฟเวอร์แบบ FIFO อัตโนมัติเมื่อตรวจพบสถานะ `online`

---

## 🛠 Technical Tasks
- [ ] เขียนและทดสอบ Zod Validation Schema สำหรับฟอร์ม Onboarding
- [ ] ติดตั้ง `@supabase/supabase-js` และ `@supabase/ssr` ใน Next.js
- [ ] เขียน API Routes รับส่งข้อมูลประสานกับ Supabase Client
- [ ] พัฒนา React Hook Form Component สำหรับหน้า OnboardingConsent
- [ ] พัฒนาระบบคิวข้อมูลออฟไลน์และติดตั้งตัวจับสถานะ Network online/offline
- [ ] ทดสอบความถูกต้องในการจัดเก็บไฟล์ภาพใบประกาศบน Supabase Storage

---

## 🔗 Related Files
- Data Specs: [docs/software/03-data-schema.md](../../docs/software/03-data-schema.md)
- Offline & PWA Specs: [docs/software/02-architecture.md](../../docs/software/02-architecture.md#6-pwa--offline-first-strategy-กลยุทธ์การทำ-pwa-และระบบทำงานออฟไลน์)
- Guideline Code: [docs/wiki/design/03-application-guideline.md](../../docs/wiki/design/03-application-guideline.md#5-การจัดการฟอร์มและการ-validation-ข้อมูล-react-hook-form--zod)
