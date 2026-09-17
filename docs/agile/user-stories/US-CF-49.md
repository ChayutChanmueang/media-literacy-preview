# User Story: US-CF-49 - ปุ่มข้ามวิดีโอเมื่อโหลดนานเกิน 7 วินาที

**Status:** 🟢 Done  
**Epic:** [Product Backlog](../01-product-backlog.md) — Client Feedback 2026-08-14  
**Owner:** TBD | **Priority:** ควรแก้ | **Estimate:** M  
**Version:** 1.1 | **Last Updated:** 2026-08-18  

---

## 📖 Description

**ในฐานะ** ผู้เรียน (ผู้สูงอายุ) ที่อยู่ในพื้นที่เน็ตช้า  
**ฉันต้องการ** ให้ระบบเสนอปุ่ม "ข้าม" วิดีโอเมื่อรอโหลดนานเกิน 7 วินาที เพื่อให้ฉันเลือกได้ว่าจะรอต่อหรือข้ามไปเกมถัดไป  
**เพื่อที่จะ** ไม่ต้องรอคลิปโหลดจนหมดความอดทนและเลิกใช้แอป

---

## 🎯 ที่มา / ปัญหา

- ในพื้นที่เน็ตช้า (3G / สัญญาณอ่อน) วิดีโอ YouTube อาจโหลดไม่ขึ้นนาน ทำให้ผู้สูงอายุรอจนท้อแท้และปิดแอปไป
- ผู้ใช้ไม่มีทางข้ามไปยังเกมถัดไปได้เอง (ปุ่ม "ต่อไป" จะปรากฏเฉพาะเมื่อวิดีโอเล่นจบเท่านั้น)
- ต้องมีกลไกช่วยเหลือเมื่อรอนาน แต่ไม่บังคับข้าม — ให้ผู้ใช้ตัดสินใจเอง

## 🔧 การแก้ไข

ในไฟล์ `src/app/lessons/[id]/video/page.tsx`:

### กลไก Loading Timeout
1. เริ่มจับเวลา **7 วินาที** เมื่อหน้าวิดีโอ mount (หรือเมื่อ YouTube player สร้างขึ้น)
2. ถ้าวิดีโอ **ยังไม่เริ่มเล่น** (ไม่ได้รับ `PLAYING` state) ภายใน 7 วินาที → แสดงปุ่ม "ข้าม" แบบ slide-up เหมือนปุ่ม "ต่อไป" (continue) ที่ปรากฏหลังวิดีโอจบ
   - **ข้อยกเว้น:** ถ้า player พร้อมแล้ว (`onReady` / `onLoadedData` + เรียก `play()` แล้ว) แต่ยังไม่เคย buffer เลย ให้ถือว่าเบราว์เซอร์บล็อก autoplay ไม่ใช่โหลดช้า — **ไม่แสดงปุ่มข้าม** ผู้เรียนกดปุ่มเล่นของตัวเล่นเอง
3. ถ้าวิดีโอ **โหลดสำเร็จ** (ได้รับ `PLAYING` state) ก่อนหรือหลัง 7 วินาที → **ซ่อนปุ่ม "ข้าม" ทันที** (ถ้าแสดงอยู่)

### UI ปุ่มข้าม
- ใช้ animation slide-up จากล่าง (เหมือน continue button หลังวิดีโอจบ)
- ข้อความ: **"ข้ามวิดีโอ"** (แทนที่ "ต่อไป")
- ไอคอน: `SkipForward` หรือเทียบเท่า
- กดแล้ว → นำทางไปยังเกม/ขั้นตอนถัดไปตาม flow เดิม

### Tracking
- Log event `video_skip_slow_load` เมื่อผู้ใช้กดข้าม + duration ที่รอ
- Log event `video_slow_load_shown` เมื่อปุ่มข้ามปรากฏ (แต่ผู้ใช้ยังไม่กด)
- Log event `video_slow_load_resolved` เมื่อวิดีโอโหลดสำเร็จหลังปุ่มข้ามปรากฏแล้ว (ผู้ใช้ไม่ได้ข้าม)

---

## ✅ Acceptance Criteria

1. [x] ถ้าวิดีโอ **ไม่เริ่มเล่นภายใน 7 วินาที** → ปุ่ม "ข้ามวิดีโอ" slide-up ขึ้นมาจากล่าง
2. [x] ปุ่ม "ข้ามวิดีโอ" ใช้ style/animation เหมือนปุ่ม "ต่อไป" (continue) ที่ปรากฏหลังวิดีโอจบ — แค่เปลี่ยนข้อความเป็น "ข้ามวิดีโอ"
3. [x] กดปุ่ม "ข้ามวิดีโอ" → นำทางไปเกม/ขั้นตอนถัดไปตาม flow (เหมือนกด "ต่อไป")
4. [x] ถ้าวิดีโอ **โหลดสำเร็จ** (เริ่มเล่น) → ปุ่ม "ข้ามวิดีโอ" **ซ่อนทันที** ไม่ว่าจะผ่าน 7 วินาทีแล้วหรือยัง
5. [x] ถ้าวิดีโอโหลดสำเร็จก่อน 7 วินาที → ปุ่ม "ข้ามวิดีโอ" **ไม่ปรากฏเลย**
6. [x] Log events: `video_slow_load_shown`, `video_skip_slow_load` (+ duration), `video_slow_load_resolved`
7. [x] ทำงานถูกต้องทั้ง YouTube iframe และ HTML5 `<video>` (MP4)
8. [x] `tsc --noEmit` ผ่าน + layout ไม่พัง
9. [x] ถ้า player พร้อมแล้วแต่ยังไม่เคย buffer (autoplay ถูกบล็อก) → ปุ่ม "ข้ามวิดีโอ" **ไม่ปรากฏ**

---

## 🛠 Technical Tasks

- [x] เพิ่ม state `showSkipButton` (boolean) และ `loadingTimerRef` (timeout ref)
- [x] เริ่ม timer 7 วินาทีใน `useEffect` mount → set `showSkipButton = true` เมื่อครบ
- [x] ดักจับ YouTube `onStateChange` → `PLAYING` / HTML5 `playing` event → ล้าง timer + set `showSkipButton = false`
- [x] Render ปุ่ม "ข้ามวิดีโอ" (slide-up animation) เมื่อ `showSkipButton === true` — reuse style จากปุ่ม continue/auto-advance
- [x] ปุ่มกดแล้ว → เรียก navigation ไป step ถัดไปตาม flow + log event
- [x] เพิ่ม log events ตาม spec
- [x] (QA) ทดสอบโดย throttle เน็ตเป็น Slow 3G → ปุ่มข้ามปรากฏหลัง 7 วิ; กดข้ามได้; เน็ตดี → ปุ่มไม่ปรากฏ

---

## 📝 หมายเหตุ

- ค่า timeout 7 วินาทีเลือกมาจากผลวิจัยว่าผู้ใช้สูงอายุจะเริ่มหมดความอดทนหลังรอ ~5–10 วินาที; 7 วินาทีเป็นจุดกลาง
- ปุ่มนี้ **ไม่บังคับข้าม** — ผู้ใช้ยังรอวิดีโอโหลดได้ ถ้าวิดีโอโหลดสำเร็จปุ่มจะหายไปเอง
- ไม่กระทบ auto-advance countdown หลังวิดีโอจบ (เป็นคนละกลไก)

---

## 🔗 Related

- หน้าคลิป: [US-VIDEO-01](./US-VIDEO-01.md)
- Auto-advance: [US-CF-05](../user-stories/archives/US-CF-05.md)
- Flow: [US-FLOW-01](./US-FLOW-01.md)
- Offline queue: US-CORE-05 (future)
- Backlog: [Product Backlog](../01-product-backlog.md)
