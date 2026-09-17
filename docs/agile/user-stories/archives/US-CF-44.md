# User Story: US-CF-44 - ระบบเล่นวิดีโอสำรอง (MP4 Fallback & Direct Player) สำหรับบทเรียน

**Status:** 🟢 Done  
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback / Fail-safe Video Player  
**Owner:** TBD | **Priority:** ปานกลาง | **Estimate:** M  
**Version:** 1.0 | **Last Updated:** 2026-08-06  

---

## 📖 Description

**ในฐานะ** ผู้เรียนและทีมผู้สอนที่ใช้งานระบบบทเรียน (Lesson Flow)  
**ฉันต้องการ** ให้เครื่องเล่นวิดีโอ (Video Player) ในหน้าบทเรียนรองรับการเล่นจากไฟล์ **.mp4** โดยตรง หรือมีระบบสำรอง (Fail-safe Fallback) ในกรณีที่ลิงก์ YouTube ไม่สามารถใช้งานได้หรือถูกบล็อกทางเครือข่าย  
**เพื่อให้** ผู้เรียนยังคงสามารถดูวิดีโอเนื้อหาจนจบ บันทึกความคืบหน้า (Progress) และใช้งานปุ่ม "ถัดไป" (Auto-advance 15 วินาที) หรือปุ่ม "เล่นซ้ำ" ได้อย่างราบรื่นและแม่นยำเช่นเดียวกับการดูผ่าน YouTube Iframe API  

---

## 🎯 สิ่งที่ต้องแก้ / รายละเอียดงาน

1. **รองรับแหล่งวิดีโอทางเลือก (.mp4):**  
   - ปรับโครงสร้างข้อมูล `VIDEO_MAP` ใน `src/app/lessons/[id]/video/page.tsx` และในโหมด Facilitator (`src/app/facilitator/[id]/page.tsx`) ให้สามารถกำหนดค่าเป็นพาธของไฟล์ `.mp4` (เช่น ไฟล์จาก cloud storage หรือ `/assets/videos/`) เพิ่มเติมจาก ID ของ YouTube
2. **ปรับ Video Player ให้รองรับทั้ง Iframe และ `<video>` แท็ก:**  
   - ตรวจจับแหล่งที่มา หากเป็น YouTube ID ให้เรนเดอร์ผ่าน `YT.Player` เดิม แต่หากเป็นไฟล์ `.mp4` ให้เรนเดอร์ผ่านแท็ก `<video>` มาตรฐานของ HTML5 พร้อมดีไซน์ให้ซ่อนคอนโทรลหรือแสดงปุ่มควบคุมได้อย่างกลมกลืน
3. **รักษาความต่อเนื่องของ Flow และ Event Tracking:**  
   - ฟังการณ์เบราว์เซอร์ (`onPlay`, `onEnded`) ของ HTML5 Video ให้ทำงานเชื่อมโยงกับระบบบันทึกสถานะ (`apiClient.saveLessonProgress`), การส่ง Log Analytics, และการนับถอยหลังปุ่มถัดไป 15 วินาทีเมื่อคลิปจบอย่างถูกต้อง 100%
   - ปุ่ม "เล่นซ้ำ" สามารถรีเซ็ตเวลา (`currentTime = 0`) และเล่นใหม่ได้โดยไม่ต้องรีโหลดหน้า

---

## ✅ Acceptance Criteria

1. [ ] สามารถระบุโครงสร้างใน `VIDEO_MAP` เป็นไฟล์ `.mp4` หรือ YouTube URL/ID ก็ได้ตามที่ตั้งค่า
2. [ ] เมื่อเรนเดอร์ไฟล์ `.mp4` ระบบใช้แท็ก `<video>` ของ HTML5 โดยมี UI และพฤติกรรมการเล่น/ซ่อนแถบควบคุมสอดคล้องกับ YouTube Iframe API
3. [ ] เมื่อวิดีโอ `.mp4` เล่นจบ (`onEnded`) ระบบนำเสนอแถบควบคุมปุ่ม "ถัดไป" (พร้อมตัวนับถอยหลัง 15 วินาที) และปุ่ม "เล่นซ้ำ" พร้อมกับบันทึกความคืบหน้าลงดาต้าเบสและ Analytics ได้อย่างแม่นยำ

---

## 🛠 Technical Tasks

- [ ] ปรับอินเทอร์เฟซ `VIDEO_MAP` ให้อนุญาตการใส่ `videoSrc?: string;` หรือระบุชนิดแหล่งที่มา `type?: 'youtube' | 'mp4'`
- [ ] อัปเดตตรรกะใน `src/app/lessons/[id]/video/page.tsx` เพื่อแยกการเรนเดอร์ระหว่าง YouTube iframe กับ HTML5 `<video>`
- [ ] เชื่อมโยง event `onEnded` ของแท็ก `<video>` เข้ากับฟังก์ชัน `setCountdownActive(true)`, `setShowControls(true)`, และ `saveLessonProgress()`
- [ ] ผูกฟังก์ชัน `handleReplay` ให้รองรับการทำงานกับ `HTMLVideoElement.currentTime = 0` และ `.play()`
- [ ] ตรวจสอบความสมบูรณ์ของ Type ด้วย `npx tsc --noEmit` และการทำงานด้วย `npm run test`

---

## 🔗 Related

- Backlog: [Product Backlog](../01-product-backlog.md)
- Video Component: `src/app/lessons/[id]/video/page.tsx`
- Facilitator View: `src/app/facilitator/[id]/page.tsx`
