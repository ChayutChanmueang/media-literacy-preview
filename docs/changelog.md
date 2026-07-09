# Documentation Changelog

## 2026-07-05
- **[NEW] จัดทำเอกสารออกแบบรายละเอียดของเกม G6 (design-g6.md):** ร่างสเปกการจำลองหน้าจอ LINE แบบละเอียด (Status bar, Chat header + ป้ายยืนยันตัวตน, ฟองข้อความ, การ์ดลิงก์ Open-Graph, ปุ่ม CTA แบบ Flex Message, Input bar), ชุดสถานการณ์หลอกลวง 3 รูปแบบพร้อม Red Flag Hotspots, ระบบ Hint แบบไม่จับเวลากดดัน, ระบบเฉลย และสเปกทางเทคนิคของ Component `G6LineSimulation.jsx`; เพิ่มลิงก์อ้างอิงจาก `gdd/01-mechanics.md`
- **ปรับปรุงโครงสร้าง แยกมินิเกม G5 แอคชั่นเป็น 2 เกมย่อย (G5 กางโล่ และ G7 กระโดดหลบภัย), จัดทำ Detailed Design, พัฒนาโปรแกรมระบบเกม และสลับรหัสเรื่องย่อยสอดคล้องกัน:**
  - [NEW] **พัฒนาหน้าจอเกม G5 (G5DigitalShield.jsx):** เขียนโค้ดระบบเกมกางโล่สลายสแกนเนอร์สำหรับผู้สูงวัยแบบแอคชั่นเดี่ยว, อนิเมชั่นสโลว์โมชั่นและสโลแกนหยุดคิดถามทำ, หน้าคำแนะนำบวกเมื่อปล่อยฟองหลุดขอบล่าง, และฟังก์ชันส่ง Asynchronous logs เข้าตาราง action_logs
  - **ปรับปรุงความลื่นไหลในการร่วงหล่นของฟองสแกม G5:** แทนที่ logic การอัปเดตตำแหน่ง Y เดิมที่ใช้ setInterval ถี่ๆ ด้วยระบบ Hardware-Accelerated CSS Transitions (`top 8.5s linear` และตรวจจับปลายทางผ่าน `onTransitionEnd`) ปรับปรุงเฟรมเรตให้ลื่นไหล 60fps/120fps บนหน้าจอมือถือทุกเครื่อง และขยายกรอบ Touch target wrapper ให้รองรับพิกัดจิ้มนิ้วกว้างเป็นพิเศษ
  - [NEW] **จัดทำเอกสารออกแบบรายละเอียดของเกม G5 (design-g5.md):** ร่างสเปกรายละเอียดการมีปฏิสัมพันธ์แบบแอคชั่นเดี่ยว, เลย์เอาต์และ UI, รายชื่อข้อความสิ่งเร้า 5 ชุด, อนิเมชั่นสโลแกน และการเชื่อมโยงระบบบันทึกเหตุการณ์ทางเทคนิค
  - ปรับปรุงและแบ่งย่อยเกมใน `gdd/00-concept.md` และ `gdd/01-mechanics.md`:
    - **G5 — หยุด คิด ถาม ทำ (กางโล่กู้ชีพ):** กำหนดให้เหลือเพียง Action เดียว (แตะสอยภัยเพื่อกางโล่) เพื่อให้ง่ายขึ้นสำหรับผู้สูงอายุ และลิงก์ไปหน้าออกแบบรายละเอียดเดี่ยว
    - [NEW] **G7 — วิ่งสู้ภัยไซเบอร์ (กระโดดหลบภัย):** เพิ่มมินิเกมวิ่งกระโดดข้ามอุปสรรคภัยสแกนเนอร์ ควบคุมแบบ Action เดียว (แตะจุดใดก็ได้เพื่อกระโดด)
  - จัดสัดส่วนรหัสเรื่องราวย่อย (User Stories) และไฟล์ให้ตรงตามลำดับ G-numbers และควบรวมฟีเจอร์ "ไม่แน่ใจ" (Unsure Option):
    - ควบรวมรายละเอียดของตัวเลือก "ไม่แน่ใจ" เข้าสู่เรื่องย่อยของเกมประเภท Content-Focused ทุกเกมโดยตรง ได้แก่ `US-GAME-01` (G1), `US-GAME-02` (G2), `US-GAME-03` (G3) และ `US-GAME-04` (G4) และยุบยกเลิกรหัสสำหรับไม่แน่ใจแยกเฉพาะตัวออก
    - **`US-GAME-04` (G4 - แชร์ดีไหม?):** จัดทำเอกสารสำหรับเกมตอบคำถามระดับแชร์ปลอดภัย (Nice / Sprint 06) พร้อมใส่ตัวเลือกไม่แน่ใจ
    - **`US-GAME-05` (G5 - หยุด คิด ถาม ทำ):** จัดทำเอกสารสำหรับเกมแตะกางโล่สลายภัย (Should / Sprint 05)
    - **`US-GAME-06` (G6 - จำลองแชท LINE):** ปรับแก้เรื่องราวย่อยเกมจำลองแชท LINE ให้ตรงกับรหัส G6 (Must / Sprint 02)
    - **`US-GAME-07` (G7 - วิ่งสู้ภัยไซเบอร์):** ปรับแก้เรื่องราวย่อยเกมกระโดดหลบภัยให้ตรงกับรหัส G7 (Should / Sprint 05)
    - [DELETE] ลบไฟล์ `US-GAME-08.md` ดั้งเดิมออก
  - ปรับปรุงการเชื่อมโยงระบบ Agile Backlogs:
    - ปรับปรุง `agile/01-product-backlog.md` เพื่อจัดสรรและเชื่อมโยงไฟล์ `US-GAME-04.md` ถึง `US-GAME-07.md`
    - ปรับปรุงแผนงานใน `agile/02-sprint-planning.md` และ `agile/sprint-backlog/sprint-02.md` ให้เชื่อม G6 เข้ากับ `US-GAME-06`
    - ปรับปรุงแผนงานใน `agile/sprint-backlog/sprint-05.md` เพื่อนำ G5 (`US-GAME-05`) และ G7 (`US-GAME-07`) เข้าสู่เป้าหมายการพัฒนาร่วมกัน
    - ปรับปรุงแผนงานใน `agile/sprint-backlog/sprint-06.md` เพื่อใช้รหัส `US-GAME-04` สำหรับเกมแชร์ดีไหม? G4

## 2026-07-03
- **ปิดงานและย้ายเอกสารแผนงาน Sprint 01 ไปยังโฟลเดอร์เก็บถาวร:**
  - ปรับปรุงสถานะงานย่อยใน `sprint-01.md` ให้เป็นเสร็จสมบูรณ์ `[x]` ทุกหัวข้อ (US-CORE-01 ถึง US-CORE-04)
  - ย้ายเอกสารจาก `docs/agile/sprint-backlog/sprint-01.md` ไปยังโฟลเดอร์เก็บถาวร `docs/agile/sprint-backlog/archives/sprint-01.md`
  - ปรับปรุงสถานะของ User Stories ใน Sprint 01 เป็นเสร็จสมบูรณ์ (`US-CORE-01` ถึง `US-CORE-04` เป็น `✅ Done`) และย้ายไฟล์ไปยัง `docs/agile/user-stories/archives/` เพื่อเก็บถาวร
  - อัปเดตสถานะของ Sprint 01 ใน `02-sprint-planning.md` เป็น **Completed** พร้อมปรับปรุงลิงก์และอ้างอิงให้ถูกต้อง
  - อัปเดตสถานะโครงการใน `index.md` ให้เข้าสู่ Sprint 02 อย่างเป็นทางการ
  - อัปเดตลิงก์พาร์ทใน `01-product-backlog.md` และ `sprint-01.md` ที่จัดเก็บใหม่เพื่อความถูกต้องแม่นยำของระบบเอกสาร
- **สร้างเอกสารรายละเอียด User Story ของ Sprint 02:**
  - แยกรายละเอียด User Story `US-GAME-01.md`, `US-GAME-02.md`, `US-GAME-03.md`, `US-REWARD-01.md`, `US-LEAD-01.md`, `US-UX-01.md`, และ `US-DATA-02.md` ในโฟลเดอร์ `docs/agile/user-stories/` เพื่อระบุรายละเอียด Description, Acceptance Criteria และ Technical Tasks
  - เชื่อมโยงรายละเอียด User Story ใน `docs/agile/01-product-backlog.md` และ `docs/agile/sprint-backlog/sprint-02.md`

## 2026-07-03
- **แยกรายละเอียด Sprint Planning เป็นเอกสารราย Sprint:**
  - สร้างไดเรกทอรี `docs/agile/sprint-backlog/` และสร้างเอกสารราย Sprint: `sprint-01.md` ถึง `sprint-06.md` เพื่อเก็บรายละเอียดเป้าหมาย ขอบเขตงานย่อย แผนเวลา ความเสี่ยง และ DoD ของแต่ละ Sprint
  - อัปเดตตารางและแผนภาพใน `docs/agile/02-sprint-planning.md` เพื่อเชื่อมโยงไปยังแผนงานแต่ละ Sprint
  - อัปเดต `docs/index.md` ให้มีลิงก์เข้าถึง Sprint Backlogs
- **สร้างเอกสารรายละเอียด User Story ของ Sprint 01:**
  - สร้างไดเรกทอรี `docs/agile/user-stories/` และแยกรายละเอียด User Story `US-CORE-01.md`, `US-CORE-02.md`, `US-CORE-03.md`, และ `US-CORE-04.md` เพื่อระบุรายละเอียด Description, Acceptance Criteria และ Technical Tasks
  - เชื่อมโยงรายละเอียด User Story ใน `docs/agile/01-product-backlog.md` และ `docs/agile/sprint-backlog/sprint-01.md`

## 2026-07-03
- **เพิ่มเอกสารโครงสร้างสถาปัตยกรรมและผังระบบ:** 
  - สร้าง `software/02-architecture.md` เพื่ออธิบายโครงสร้างแต่ละเลเยอร์และการไหลของข้อมูล Onboarding และ Event Logging 
  - สร้าง `software/04-application-flow.md` เพื่อแสดง Route และผังการเปลี่ยนหน้าจอที่สอดคล้องกับ User Journey ทั้งกลุ่มผู้นำชุมชนและผู้สูงอายุ
  - แก้ไขฟอร์แมตใน `agile/01-product-backlog.md` และเชื่อมโยงเอกสารทั้งหมดใน `index.md`

## 2026-07-03
- **ยืนยัน Technical Stack:** Vite + React (`vite-plugin-pwa`) / Supabase (Postgres + Edge Functions) / Cloudflare Pages (geolocation ผ่าน `request.cf.*` แทนบริการภายนอก) — อัปเดต `gdd/00-concept.md` (§2 Technical Stack + หมายเหตุ PWA), `software/01-system-design.md` (diagram, subsystem, NFR, Open Decisions), `software/03-data-schema.md` (IP Geolocation Flow), และ `index.md` (ปิดคำถามเปิดเรื่อง stack)

## 2026-07-03
- **ย้ายเอกสาร Requirement ต้นทาง** `Interactive เกม-ระบบ.docx` จาก root ของ repo ไปที่ `docs/wiki/base-requirement/` และอัพเดทลิงก์ใน `index.md`

## 2026-07-03
- **สร้างชุดเอกสารโครงการรุ่นแรก** จากเอกสาร Requirement `Interactive เกม-ระบบ.docx`:
  - `gdd/00-concept.md` — Concept, กลุ่มผู้ใช้ 2 กลุ่ม, สถาปัตยกรรม, นโยบายการนำเสนอเนื้อหาที่สร้างจาก AI
  - `gdd/01-mechanics.md` — Core loop และสเปกเกมย่อย G1–G5
  - `gdd/02-narrative.md` — โครงเนื้อหาหลักสูตรวิดีโอ 2 ชุด (3 Topics + "หยุด คิด ถาม ทำ")
  - `gdd/03-art-direction.md` — UI/UX และ Accessibility สำหรับผู้สูงวัย
  - `gdd/05-user-journey.md` — ข้อเสนอ User Journey สำหรับผู้นำชุมชนและผู้สูงอายุ (ส่วนที่ Requirement ยังไม่ได้ลงรายละเอียด)
  - `software/01-system-design.md` — Subsystem breakdown (Draft)
  - `software/03-data-schema.md` — Data schema + ประเด็น PDPA (Draft)
  - `agile/01-product-backlog.md` — Product backlog (Must 10 / Should 5 / Nice 3)
  - `agile/02-sprint-planning.md` — Roadmap ก.ค.–ต.ค. 2569, Gantt, ความเสี่ยง
  - `index.md` — Project index + คำถามเปิดถึงทีม
