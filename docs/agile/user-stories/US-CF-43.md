# User Story: US-CF-43 - Link เวลาแชร์ (Social Preview): ติดตั้งภาพตัวอย่างและ Open Graph metadata เพื่อความน่าสนใจเวลาแชร์

**Status:** 🔴 To Do  
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-06 ([FB](../feedback/FB-2026-08-06-client-feedback.md) #10)  
**Owner:** TBD | **Priority:** ปานกลาง | **Estimate:** S  
**Version:** 1.0 | **Last Updated:** 2026-08-06  

---

## 📖 Description

**ในฐานะ** ผู้นำชุมชนและทีมโครงการที่นำลิงก์แอปพลิเคชันไปส่งต่อผ่านช่องทางแชทและโซเชียลมีเดีย (LINE, Facebook, Messenger)  
**ฉันต้องการ** ให้มีรูปภาพ Preview (Thumbnails Card) และคำชี้แจงหัวเรื่องที่สวยงาม ปรากฏขึ้นมาโดยอัตโนมัติเมื่อแปะลิงก์  
**เพื่อให้** ลิงก์ดูเป็นมืออาชีพ มีความปลอดภัย น่าเชื่อถือ และเชิญชวนผู้สูงวัยให้กดคลิกเข้ามาร่วมเรียนรู้ได้อย่างมหาศาล  

---

## 🎯 สิ่งที่ต้องแก้ / รายละเอียดงาน

- ในปัจจุบัน เมื่อแชร์ลิงก์ของเว็บไซต์ โดเมนยังขาดการตั้งค่า **Open Graph Image (`og:image`)** ทำให้ในแอป LINE หรือโซเชียลไม่ปรากฏตัวอย่างรูปภาพ (Link Thumbnail Preview)  
- สิ่งที่ต้องดำเนินการ:
  1. จัดทำหรือนำรูปภาพกราฟิกโปสเตอร์ของโครงการ (ที่มีตราสัญลักษณ์โครงการ คำว่า "รู้ทันสื่อ" และบรรยากาศสดใส) มาสร้างเป็นไฟล์ `public/og-image.jpg` (ขนาดสัดส่วนมาตรฐาน เช่น $1200 \times 630$ หรือ $1200 \times 628$ พิกเซล)  
  2. กำหนดและปรับแต่งค่า `openGraph` และ `twitter` ภายใน object `metadata` ในไฟล์ `src/app/layout.tsx` (ของ Next.js App Router) โดยระบุ Title, Description, Type, และ Url ของ `og:image` ให้เรียบร้อย

---

## ✅ Acceptance Criteria

1. [ ] ไฟล์ภาพ Preview บ่งบอกเอกลักษณ์โครงการถูกเก็บบันทึกอยู่ในดิเรกทอรีสาธารณะ (เช่น `public/og-image.jpg`)
2. [ ] โครงสร้าง HTML ที่ render จาก Next.js มีแท็ก `<meta property="og:image" content="..." />`, `og:title`, `og:description` และแท็ก `twitter:card` ครบถ้วนและเป็นไปตามหลัก SEO / OG Specs
3. [ ] เมื่อนำ ลิงก์ไปจำลองในโปรแกรม LINE URL Preview หรือ Open Graph Tester จะมีภาพพรีวิวแนวนอนปรากฏอย่างงดงามและครบองค์ประกอบ

---

## 🛠 Technical Tasks

- [ ] คัดลอกหรือเจนเนอเรตภาพแบนเนอร์/โปสเตอร์โครงการมาจัดวางที่ `public/og-image.jpg` (อาจพิจารณาแปลงจาก `app-logo.jpg` หรือดีไซน์แบนเนอร์แนวนอนใหม่)
- [ ] แก้ไขไฟล์ `src/app/layout.tsx` ในส่วน `export const metadata: Metadata = { ... }` เพิ่มคีย์ `openGraph` และ `twitter` ให้ชี้ไปที่รูปภาพและคำเชิญชวนที่เหมาะสม
- [ ] ตรวจเช็คการสร้าง build หรือ `npx tsc --noEmit` ว่า metadata object ถูกต้องตาม Typescript ของ Next.js

---

## 🔗 Related

- Feedback: [FB-2026-08-06](../feedback/FB-2026-08-06-client-feedback.md) #10
- Backlog: [Product Backlog](../01-product-backlog.md)
- การตั้งค่า Web Icon ก่อนหน้า: Release `0.4.0` (Favicon in `layout.tsx`)
