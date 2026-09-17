# Weekly Progress Report: สัปดาห์ที่ 31-32 (27 กรกฎาคม - 8 สิงหาคม 2026)

## 📌 Executive Summary (ภาพรวมประจำสัปดาห์)

ในช่วงสัปดาห์ที่ 31–32 (27 ก.ค. – 8 ส.ค. 2026) ทีมพัฒนาระบบได้เร่งรัดและดำเนินการปรับปรุงระบบหลักเพื่อรองรับการใช้งานจริง ณ สนามทดสอบจังหวัดเชียงใหม่ (6–7 ส.ค. 2569) และเตรียมความพร้อมสำหรับจังหวัดแพร่และน่าน การดำเนินงานมุ่งเน้น **Hotfix Connection & Telemetry System**, **การรื้อและปรับปรุง Flow เรียนต่อเนื่อง**, **การเปิดตัวหน้าจอยินดีจบหลักสูตร (Course Completion Screen)**, **ระบบสุ่มคลังโจทย์ G3**, และ **การปรับปรุงการเล่นวิดีโอ/ออโต้เพลย์บนอุปกรณ์มือถือ** พร้อมทั้งปล่อยเวอร์ชันระบบอย่างต่อเนื่องตั้งแต่ v0.4.0 จนถึง **v0.8.1**

---

## 🚀 Key Highlights & Accomplishments (ผลงานหลักที่ทำเสร็จ)

### 1. 🌐 Infrastructure, Database Hotfix & Telemetry (โครงสร้างพื้นฐานและระบบล็อก)
- 🟢 **Supabase IPv4 Connection Pooler Hotfix (v0.8.1)**: สลับการเชื่อมต่อ `DATABASE_URL` ไปยัง **Supabase IPv4 Connection Pooler** (`aws-0-ap-northeast-1.pooler.supabase.com:6543`) บน CAMT Deployment (`https://ageconnect.camt.cmu.ac.th/`) แก้ไขปัญหาเครือข่ายที่ไม่รองรับ IPv6 Outbound (`ENETUNREACH`) ได้สำเร็จ
- 🟢 **Offline Log Storage Cap Expansion**: ขยายโควตาการเก็บบันทึก Log ออฟไลน์สำรอง (`MAX_OFFLINE_LOGS`) ใน `localStorage` จาก 100 รายการ เป็น **500 รายการต่อเครื่อง** พร้อมระบบ Auto-sync อัตโนมัติ ป้องกันข้อมูล Event Log ของผู้เล่นสูญหาย
- 🟢 **Action Telemetry Log Pipeline & Export Scripts**: พัฒนาสคริปต์ส่งออกข้อมูลและวิเคราะห์ Telemetry (`scripts/export-action-logs.cjs`, `scripts/analytics-queries.sql`, `scripts/run-analytics.cjs`) พร้อมเก็บรวบรวม Event Logs จริงแล้วกว่า 1,700+ รายการ

### 2. 🎓 Flow Restructuring & Learner Experience (การรื้อ Flow และประสบการณ์ผู้เรียน)
- 🟢 **Course Completion Screen (US-CF-42 / v0.7.0)**: พัฒนาหน้าแสดงความยินดีหลังจบเกมปิดท้าย G13 ที่ `/lessons/complete` พร้อมปุ่ม "กลับไปหน้าหลัก" เพียงปุ่มเดียว ซ่อน Learner Chrome Header และ Nav Drawer เพื่อป้องกันความสับสน
- 🟢 **Video Autoplay & Touch-to-Unmute (US-VIDEO-01 / v0.7.2)**: แก้ไขปัญหาเบราว์เซอร์มือถือบล็อก Autoplay วิดีโอแบบมีเสียง โดยเริ่มเล่นแบบปิดเสียงอัตโนมัติ (`mute:1`) พร้อมแสดงปุ่ม "แตะเพื่อเปิดเสียง" ขนาดใหญ่ และลดเวลานับถอยหลังปุ่มถัดไปเหลือ 5 วินาที (v0.7.3)
- 🟢 **Single Play Journey (US-CF-02 / US-CF-07)**: ปรับ Start Menu ให้มีปุ่ม "เริ่มเรียนรู้" ปุ่มเดียว นำเข้าสู่ Flow วิดีโอสั้นบทที่ 1 ทันที

### 3. 🎮 Mini-game Reworks & Content Shuffling (การอัปเกรดมินิเกมและคลังเนื้อหา)
- 🟢 **G3 AI หรือ คน? (US-GAME-03-R2 / v0.6.0)**:
  - สร้างคลังโจทย์ 17 ข้อ (`src/data/g3-questions.json`) ครอบคลุมภาพ AI 6 ภาพ, ภาพตัดต่อ 1 ภาพ และภาพจริง 10 ภาพ
  - พัฒนาระบบสุ่มโจทย์ Fisher–Yates 6 ข้อ/รอบ คุมสัดส่วนภาพจริง 3 / ภาพปลอม 3 เสมอ
  - เพิ่มการระบุประเภทภาพปลอมในหน้าเฉลย (ภาพ AI vs ภาพตัดต่อ)
- 🟢 **G6 LINE Chat Simulation (US-GAME-06-R1 / v0.5.0 & v0.7.1)**:
  - แก้ไขพฤติกรรม Timer ให้อ่านฟรีซเวลาหน้าเฉลยเมื่อผู้ใช้อ่าน/แตะจอ (30 วินาที)
  - ปรับปรุงช่วงเวลาการทยอยแสดงข้อความแชต 2 วินาทีหลังกดเริ่มเล่น
- 🟢 **G13 Scoop Stacker (US-GAME-13-R2 / v0.7.3)**:
  - ถอดแถบข้อความคำแนะนำด้านล่างออก เพื่อเพิ่มพื้นที่การสัมผัสและการมองเห็นหอไอติมบนหน้าจอมือถือ

### 4. 🎨 PWA, Branding & Design Systems
- 🟢 **Favicon & Web Metadata (v0.4.0)**: ติดตั้ง `public/favicon.ico` และกำหนด `icons` ใน metadata หลัก
- 🟢 **Branded Logo Asset (v0.3.1)**: จัดทำตราสัญลักษณ์โครงการ (`public/assets/app-logo.jpg`) สำหรับหน้า Landing และ Docker Runner

### 5. 📦 Agile Documentation & User Stories Archiving
- 🟢 **User Stories Archiving**: ตรวจสอบและย้าย User Stories ที่เสร็จสมบูรณ์แล้ว (`Status: Done`) จำนวน **48 รายการ** (เช่น US-CF-01 ถึง 44 ที่ผ่านการพัฒนา, US-DOC-01, US-DEBT-01, US-FLOW-02, ฯลฯ) เข้าไปจัดเก็บในคลังเอกสารประวัติ [`docs/agile/user-stories/archives/`](../../agile/user-stories/archives/) เพื่อให้โฟลเดอร์หลักคงเหลือเฉพาะงานที่ยังอยู่ในสถานะ In Progress / Backlog (45 รายการ)

---

## ⚙️ Code Progress & Technical Updates (รายละเอียดการพัฒนาทางเทคนิค)

- **Modified & Added Key Components**:
  - `src/services/loggingService.ts` (ขยาย offline cap & sync logic)
  - `src/app/lessons/complete/page.tsx` (หน้า Course Completion ใหม่)
  - `src/app/lessons/[id]/video/page.tsx` (ปรับปรุง autoplay, touch-to-unmute และ countdown)
  - `src/components/G3AIOrNot.jsx` & `src/data/g3-questions.json` (ระบบสุ่มโจทย์ 17 ข้อ)
  - `src/components/G6LineSimulation.jsx` (ปรับปรุง timer & layout)
  - `src/components/G13ScoopStacker.tsx` (ขยายพื้นที่เล่นเกม)
  - `scripts/export-action-logs.cjs` & `scripts/analytics-queries.sql`
- **Releases Delivered**:
  - `v0.4.0` → `v0.5.0` → `v0.6.0` → `v0.7.0` → `v0.7.1` → `v0.7.2` → `v0.7.3` → `v0.8.1` (Hotfix Connection)
- **Quality Verification**:
  - `npx tsc --noEmit` ผ่านสมบูรณ์ทุก build
  - Unit Tests ผ่าน 19/19
  - ผ่านการสอบทาน Zero-Scroll UI บนหน้าจอทดสอบขนาด 375×667, 390×844, 360×740 และ 667×375

---

## 📋 MISSING SYSTEMS ANALYSIS (สรุประบบที่ยังขาดอยู่อย่างชัดเจน)

จากการวิเคราะห์เปรียบเทียบโค้ดปัจจุบันกับความต้องการตามแผนงาน (GDD / Backlog):

1. 🔴 **Elderly User Feedback & Field Evaluation Data Integration**:
   - **สิ่งที่ขาดไป**: ข้อมูลผลลัพธ์การใช้งานจริงจากการลงพื้นที่จังหวัดเชียงใหม่ (6–7 ส.ค.) เพื่อนำมาปรับค่าความเร็ว (Physics), ขนาดตัวหนังสือ และจังหวะเวลา Auto-advance
   - **ผลกระทบ**: อาจมีบางจุดที่ผู้สูงอายุในจังหวัดถัดไป (แพร่/น่าน) ทำไม่ทัน
   - **Action Item**: สรุป Playtest Feedback จากเชียงใหม่เพื่อปรับปรุงเกมก่อนลงพื้นที่แพร่ (17–18 ส.ค.)

2. 🔴 **Server-side Quiz Validation & Auth Protection**:
   - **สิ่งที่ขาดไป**: การคำนวณและตรวจสอบผลคะแนน Pre-test / Post-test / Game Score ฝั่ง Server-side (ปัจจุบันยังอาศัย Client State ในการส่งผลลง DB)
   - **ผลกระทบ**: เสี่ยงต่อการส่งข้อมูลคะแนนที่ไม่ถูกต้องเข้าฐานข้อมูล
   - **Action Item**: Implement Server Action / API Validation ใน Sprint 08 hardening

3. 🔴 **Full Lesson Map Registration for Remaining Games**:
   - **สิ่งที่ขาดไป**: มินิเกม G4, G5, G7, G8, G9, G10, G11, G12 ยังคงเล่นได้ผ่าน Dev Game Hub `/dev/games` เป็นหลัก ยังไม่ได้ลงทะเบียนครบทุก Topic ใน Main Lesson Map
   - **ผลกระทบ**: ผู้เรียนในโหมดปกติเข้าเล่นได้เฉพาะ G1, G3, G6, G13
   - **Action Item**: เชื่อมโยงมินิเกมที่เหลือเข้ากับ Topic Lesson Maps ในเฟสถัดไป

---

## 🎯 Next Priorities (แผนงานสัปดาห์ถัดไป)

1. **ประเมินผลและปรับปรุงระบบจากข้อเสนอแนะเชียงใหม่**: วิเคราะห์ Event Logs (1,700+ รายการ) และปรับปรุง UX/UI
2. **เตรียมความพร้อมสำหรับการลงพื้นที่จังหวัดแพร่ (17-18 ส.ค. 2569)**: ตรวจสอบความเสถียรของระบบ PWA ออฟไลน์และการเก็บบันทึกข้อมูล
3. **Hardening & Security Cleanup (US-SEC-01 / US-DEBT-01)**: เพิ่ม Auth Protection บน Analytics API และทำ Clean-up โค้ดส่วนที่เหลือ
