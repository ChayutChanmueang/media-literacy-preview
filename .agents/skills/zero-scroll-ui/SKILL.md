---
name: zero-scroll-ui
description: >
  Audits and helps design mobile screens that must fit entirely in one viewport
  with no scrolling (single-screen / zero-scroll UI), covering information
  architecture, interaction design, visual hierarchy, and technical layout. Use
  this skill whenever the user edits or creates a full-screen component in this
  project — files matching `*Screen.jsx` (ConsentScreen, LandingScreen,
  RewardScreen, CertificateScreen, VideoScreen), `GameShell.jsx`,
  `LessonSelector.jsx`, or the minigames `G1FactCheck` through
  `G6LineSimulation` — or whenever the user asks about layout overflow,
  unintended scrolling, mobile responsiveness, or requests a UI review. Trigger
  for requests like "หน้านี้ scroll ได้ ไม่ควร", "เช็คว่าหน้าจอนี้ล้นไหม",
  "review layout มือถือ", "ทำไม content เกินจอ", or "design a single-screen
  mobile UI". Enforces the "one screen, one main action" principle.
---

# Zero-Scroll Mobile UI Skill

ตรวจสอบ (หรือช่วยออกแบบ) หน้าจอมือถือให้ทำงานได้ครบในหนึ่งจอโดยไม่ต้อง scroll ยึดหลัก **"One screen, one main action"** — ถ้าข้อมูลเริ่มล้นจนต้อง scroll ให้พิจารณาตัดเป็นหลายหน้า (step-by-step) แทนการยัดทุกอย่างลงจอเดียว

## เมื่อไหร่ควรใช้

- ผู้ใช้แก้ไข/สร้าง component ในกลุ่ม "หน้าจอเต็ม" ของโปรเจกต์นี้: `*Screen.jsx` (ConsentScreen, LandingScreen, RewardScreen, CertificateScreen, VideoScreen), `GameShell.jsx`, `LessonSelector.jsx`, หรือมินิเกม `G1FactCheck` ถึง `G6LineSimulation`
- ผู้ใช้ถามเรื่อง layout ล้น, scroll ที่ไม่ตั้งใจ, responsive มือถือ, หรือขอ review UI

## กระบวนการ

1. **ระบุ component เป้าหมาย** และอ่านโค้ด + CSS ที่เกี่ยวข้อง (component เอง, `src/index.css`, inline style)
2. **ไล่ checklist 4 หมวด** ด้านล่างทีละข้อ — เก็บเป็นรายการปัญหาพร้อมตำแหน่งไฟล์/บรรทัด
3. **ทดสอบ viewport matrix**: อย่างน้อย
   - iPhone SE — 375×667 (จอสั้นสุดที่ยังพบบ่อย)
   - iPhone 14/15 — 390×844
   - Android กลาง — 360×740
   - แนวนอน (landscape) ของขนาดที่เล็กที่สุดที่รองรับ — height จะเหลือน้อยมาก มักเป็นจุดที่ scroll โผล่ก่อนใคร
4. **รายงานผล** เป็น bullet list: ไฟล์:บรรทัด + อาการ + หมวดที่เกี่ยวข้อง + วิธีแก้สั้นๆ เรียงจากกระทบมากไปน้อย
5. ถ้าเป็นการออกแบบหน้าใหม่ตั้งแต่ต้น ให้ใช้ checklist เดียวกันนี้เป็น pre-flight ก่อนเขียนโค้ด (คัดเนื้อหาก่อนวาง layout ไม่ใช่วาง layout แล้วค่อยตัด)

## Checklist

### 1. UX & Information Design
- [ ] แยก "ต้องเห็นทันที" ออกจาก "มีก็ดีแต่รอได้" แล้วตัดส่วนหลังออกจากจอแรก (ซ่อนไว้หลัง action หรือย้ายไปหน้าอื่น)
- [ ] จำนวนตัวเลือก/ปุ่มที่ผู้ใช้ต้องตัดสินใจพร้อมกันในจอเดียว ไม่เกิน ~4-5 ตัว (Hick's Law) และจำนวน "กลุ่มข้อมูล" ที่ต้องจำพร้อมกันไม่เกิน ~5-7 chunk (Miller's Law)
- [ ] จอนี้มี primary action เดียวที่ชัดเจน ไม่ใช่ CTA แข่งกันหลายปุ่มระดับเดียวกัน

### 2. Interaction & Space Management
- [ ] ข้อมูลรองใช้ progressive disclosure แทนการเรียงต่อแนวตั้ง — tabs, carousel (ปัดซ้าย-ขวา), modal, bottom sheet
- [ ] ใช้ gesture (swipe, long-press, double-tap) แทนการเพิ่มปุ่มเมื่อเหมาะสม แต่ยังต้องมี fallback ที่กดได้ตรงๆ สำหรับคนที่ไม่รู้ gesture (โดยเฉพาะกลุ่มผู้ใช้เด็ก/ครูในโปรเจกต์นี้)
- [ ] เปลี่ยนสถานะด้วย micro-interaction/animation แทนการเปลี่ยนหน้าทั้งจอ เมื่อเป็นการ feedback สั้นๆ (ตอบถูก/ผิด, กดค้าง)

### 3. UI & Visual Design
- [ ] Visual hierarchy ชัดผ่านขนาด/น้ำหนักฟอนต์/สี — หัวข้อหลัก vs CTA vs ข้อมูลรองแยกออกจากกันได้ในแวบแรก
- [ ] เว้น white space แยกกลุ่มข้อมูล ไม่อัดจนอึดอัด แม้พื้นที่จำกัด
- [ ] ปุ่มกด/target ทั้งหมด ≥48×48dp และอยู่ในโซนที่นิ้วโป้งเอื้อมถึงง่าย (ค่อนไปทางล่าง-กลางจอ ไม่ใช่มุมบนสุด)
- [ ] **ฟอนต์ไทยโดยเฉพาะ**: line-height เพียงพอ (≥1.4) ไม่ให้สระบน/ล่าง วรรณยุกต์ถูกตัดที่ขอบจอหรือทับบรรทัดถัดไป — ปัญหานี้มักไม่โผล่ตอน dev ใช้ข้อความอังกฤษทดสอบ

### 4. Technical Layout
- [ ] ใช้ `100dvh`/`100svh` แทน `100vh` เพียวๆ สำหรับความสูงเต็มจอบนมือถือ (address bar ของมือถือ โผล่/หดแล้วเปลี่ยน viewport height จริง แต่ `100vh` ไม่ตามด้วย ทำให้เนื้อหาล้นหรือเหลือช่องว่างเกิน) — **แก้แล้วที่ `src/index.css` (`body`, `#root` ใช้ `height: 100dvh` + `overflow: hidden` เป็น shell), มี `.scroll-region` utility class ไว้ให้ใช้กับ container ย่อยที่เนื้อหายาวไม่คงที่**
- [ ] ไม่มี `overflow-y` แบบ implicit scroll หลุดออกมาจากการที่เนื้อหาสูงเกิน container โดยไม่ได้ตั้งใจ — ถ้าตั้งใจให้ scroll เฉพาะจุด (เช่น list ยาว) ต้อง scroll เฉพาะ container ย่อยนั้น ไม่ใช่ทั้งหน้า (ใช้ `.scroll-region` หรือ `.content-area` ซึ่งมี `flex:1; min-height:0; overflow-y:auto` ในตัวแล้ว — ระวัง: ทุก ancestor ของ container ที่ scroll ต้องมี `min-height: 0` ด้วย ไม่งั้น flex จะไม่ยอมให้ลูกหดตัวและ scroll ทำงานไม่ได้)
- [ ] **ถ้า shell ใช้ `overflow: hidden` เพื่อกันหน้า scroll ทั้งหน้า ต้องตรวจให้แน่ใจว่าทุกส่วนของทุกหน้าจอ (รวมถึง footer bar เล็กๆ หรือ fixed-height game area) อยู่ใน `.scroll-region` หรือพอดีกับพื้นที่จริง — ไม่งั้นเนื้อหาจะถูก "ตัดหายเงียบๆ" (clipped) แทนที่จะ scroll ได้ ซึ่งแย่กว่าการ scroll เพราะผู้ใช้มองไม่เห็นเลยว่ามีอะไรหายไป ต้องวัด `element.scrollHeight` ของ container ที่ scroll เทียบกับ viewport จริง ไม่ใช่แค่เช็ค `document.scrollHeight` ว่าหน้าไม่ scroll เพราะอาจเป็นเพราะโดน clip อยู่ก็ได้**
- [ ] เผื่อ safe-area-inset (notch, home indicator) ด้วย `env(safe-area-inset-*)` ถ้าปุ่มสำคัญอยู่ชิดขอบบน/ล่างจอ
- [ ] Layout ยืดหยุ่นด้วย flexbox/grid คำนวณสัดส่วนตาม aspect ratio ไม่ใช่ fixed pixel height ที่พังบนจอสั้น (เช่น iPhone SE) หรือจอยาวผิดปกติ — ถ้ามี fixed `minHeight` บน container ภายใน (เช่น game canvas, media player) ให้เปลี่ยนเป็น `flex: 1; min-height: 0` หรือคำนวณจาก `dvh` แทน ไม่งั้นจะไปบังคับความสูงขั้นต่ำที่ดันเนื้อหาอื่นล้นจอสั้น

## ⚠️ ข้อจำกัดที่ห้ามแตะเพื่อแก้ overflow

ถ้าโปรเจกต์มี accessibility requirement เฉพาะ (เช่น senior/ผู้สูงอายุ: font-size ≥18-20px, ปุ่มขั้นต่ำ 48-56px — ดู design tokens ใน `src/index.css`) **ห้ามใช้การลดขนาดฟอนต์หรือลดความสูงปุ่มเป็นทางแก้ overflow** แม้จะเป็นทางที่ง่ายที่สุดก็ตาม เพราะเป็นการแลก accessibility requirement ที่ตั้งใจไว้กับพื้นที่หน้าจอ ให้แก้ด้วยการ (1) ตัด/ยุบ chrome ที่ซ้ำซ้อน (header ซ้ำ, คำอธิบายที่พูดซ้ำกับเนื้อหาข้างใน) และ (2) ทำ container ที่เนื้อหายาวไม่คงที่ให้ scroll ได้ภายในตัวเอง (ดู Technical Layout ด้านบน) แทน

## Anti-patterns ที่ควร flag ทันที

- วางปุ่ม CTA หลักมากกว่า 1 ปุ่มในระดับความสำคัญเท่ากันบนจอเดียว
- List ที่ยาวไม่จำกัด (เช่น รายการบทเรียน, ตัวเลือกเกม) ใส่ในหน้าที่ควรเป็น single action โดยไม่ทำ pagination/step wizard
- Fixed height/pixel ที่ไม่เผื่อจอสั้น (คำนวณจาก desktop breakpoint แล้วลืมเทสจอมือถือจริง)
- ข้อความยาวไม่มี truncation/ellipsis หรือไม่มีการทดสอบกับข้อความไทยจริง (ภาษาไทยมักยาวกว่าอังกฤษ ~20-30%)

## รูปแบบผลลัพธ์

ถ้าพบปัญหา ให้รายงานเป็นรายการ เรียงจากกระทบมากไปน้อย แต่ละรายการระบุ:
- ไฟล์:บรรทัด
- อาการ (เช่น "ที่ 375×667 การ์ดปุ่มยินยอมถูกดันล้นออกนอกจอ ต้อง scroll ถึงจะกดปุ่มยืนยันได้")
- หมวดที่เกี่ยวข้อง (1-4 ด้านบน)
- ข้อเสนอแก้ไขสั้นๆ

ถ้าไม่พบปัญหา ให้บอกตรงๆ ว่าผ่าน checklist ข้อไหนบ้าง ไม่ต้องสร้างปัญหาที่ไม่มีจริง
