# 🎮 รู้ทันสื่อวัยเก๋า (Media Literacy Interactive for Seniors)

**เว็บแอปพลิเคชันสร้างเสริมสมรรถนะการรู้เท่าทันสื่อ ไซเบอร์ และปัญญาประดิษฐ์ (AI) สำหรับผู้สูงอายุ**  
โครงการพัฒนาภายใต้ความร่วมมือของ **NAPLAB** มุ่งเน้นการสร้างเสริมภูมิคุ้มกันดิจิทัลด้วยการออกแบบที่คำนึงถึงความสะดวกในการใช้งานของผู้สูงวัย (Senior Accessibility Guidelines)

---

## 🎯 เกี่ยวกับโครงการ

เว็บแอปพลิเคชันนี้ออกแบบมาเพื่ออบรมและให้ความรู้แก่ผู้สูงอายุเกี่ยวกับภัยออนไลน์ ข่าวลือ ข่าวปลอม และสื่อที่สังเคราะห์ขึ้นด้วย AI ผ่านการรับชมวิดีโอสั้นและการเล่น **มินิเกมจำลองสถานการณ์จริง (Interactive Mini-Games)** โดยมีเป้าหมายหลักในการปฏิบัติตามหลักการ **"หยุด🛑 คิด🧠 ถาม💬 ทำ✅"** เพื่อชะลอการตอบสนองต่อสิ่งเร้าที่อันตราย

---

## 🛠️ เทคโนโลยีที่เลือกใช้ (Technical Stack)

- **Frontend Core:** React (v19.2) + Vite (v8.1)
- **Styling:** Vanilla CSS (เน้นความลื่นไหล การจัดเลย์เอาต์ขนาดใหญ่ คอนทราสต์สูง และการตอบสนองที่ลื่นไหล 60fps/120fps บนมือถือ)
- **PWA Capabilities:** `vite-plugin-pwa` (สนับสนุนการเข้าถึงแบบออฟไลน์ และติดตั้งลงหน้าโฮมสกรีนโดยไม่ต้องมี Store)
- **Backend & Database:** Supabase (สำหรับจัดการข้อมูลกลุ่มประชากรและเก็บบันทึกพฤติกรรมการเล่นเกม Action Logs)
- **Infrastructure:** Cloudflare Pages (สนับสนุน Geolocation ตรวจจับพื้นที่ จังหวัด/อำเภอ จาก IP ของ Client แบบไร้บล็อกดรอปดาวน์)
- **Linter & Tools:** Oxlint (รวดเร็วสูงและเป็นมิตรต่อนักพัฒนา)

---

## 🎮 รายละเอียดมินิเกม (Interactive Mini-Games)

ระบบประกอบด้วยมินิเกมหลัก 5 รูปแบบที่สอดคล้องตามหลักสูตรบทเรียน:

1. **จริงหรือมั่ว? (G1 - Fact Check Quiz):** ฝึกแยกแยะข่าวจริงและข่าวลือออนไลน์แบบเลือกตอบ 3 ทางเลือก (จริง / มั่ว / ไม่แน่ใจ) ไม่มีตัวจับเวลากดดัน
2. **จับสัญญาณมิจ (G2 - Spot the Scam Quiz):** ฝึกตรวจหาจุดน่าสงสัยในข้อความ SMS แนบลิงก์ หรือใบทวงหนี้ พร้อมระบบตีกรอบชี้เป้าความรู้เชิงวิชาการในหน้าเฉลย
3. **AI หรือ คน? (G3 - AI or Human Image Analyzer):** ฝึกสังเกตภาพถ่ายจริงเปรียบเทียบกับภาพสังเคราะห์จาก AI พร้อมฟังก์ชันซูมภาพ และป้ายแสดงความรับผิดชอบจริยธรรมสื่อ AI (`ai_disclosure`)
4. **กางโล่สลายภัย (G5 - Digital Shield Action):** เกมแตะสอยทำลายข้อความข่มขู่สิ่งเร้าที่ร่วงหล่นลงมาเพื่อกางเกราะป้องกันตัว พร้อมแอนิเมชัน Slow-motion สโลแกนโครงการ "หยุด คิด ถาม ทำ"
5. **จำลองแชท LINE (G6 - LINE Chat Simulation):** ห้องจำลองการทักแชทของมิจฉาชีพ เพื่อฝึกจดจำ Red Flag Hotspots (จุดอันตรายแดง) ในบทสนทนา เช่น ลิงก์ปลอม โค้ชการเงินปลอม หรือการขู่ด่วน

---

## 📂 โครงสร้างเอกสารโครงการ (Project Documentation)

เอกสารรายละเอียดการออกแบบระบบ ระบบงาน และความคืบหน้าของโครงการทั้งหมดจัดเก็บอยู่ภายใต้โฟลเดอร์ `docs/` ซึ่งทำงานประสานกันผ่าน Relative Links:

- **[Project Index (สารบัญหลัก)](./docs/index.md):** ภาพรวมสถานะปัจจุบัน คลังเอกสาร และคำถามเปิดถึงทีม
- **📘 Game Design (GDD):**
  - [GDD 00 - Concept & Architecture](./docs/gdd/00-concept.md) — คอนเซปต์กลุ่มเป้าหมาย สถาปัตยกรรม และนโยบาย AI
  - [GDD 01 - Core Mechanics](./docs/gdd/01-mechanics.md) — รายละเอียดระบบลูปและกลไกสะสมดาว
  - [GDD 03 - Art Direction & UI/UX](./docs/gdd/03-art-direction.md) — ข้อกำหนดสี ปุ่ม ฟอนต์ และ Accessibility สำหรับผู้สูงอายุ
- **💻 Software Design:**
  - [System Design](./docs/software/01-system-design.md) — โครงสร้างย่อยของระบบและการประเมินความปลอดภัย
  - [Application Flow & Routing](./docs/software/04-application-flow.md) — ผังการนำทางแต่ละหน้าและการเปลี่ยนหน้าแบบ SPA
  - [Data Schema](./docs/software/03-data-schema.md) — ตารางบันทึกพฤติกรรม ข้อกฎหมาย PDPA และการทำ Geolocation
- **🚀 Agile Project Management:**
  - [Product Backlog](./docs/agile/01-product-backlog.md) — แฟ้มรวบรวม User Stories ทั้งหมด
  - [Roadmap & Sprint Schedule](./docs/agile/02-sprint-planning.md) — ปฏิทินกำหนดการอบรมรายจังหวัดและ Gantt Chart
  - [Sprint Backlog (ปัจจุบัน: Sprint 03)](./docs/agile/sprint-backlog/sprint-03-polishing.md) — เป้าหมาย ขอบเขตงาน และเกณฑ์การตรวจรับของ Sprint ปัจจุบัน

---

## ⚡ เริ่มต้นพัฒนา (Getting Started)

### การเตรียมความพร้อม (Prerequisites)
ตรวจสอบให้แน่ใจว่าติดตั้ง Node.js (แนะนำ v18 ขึ้นไป) บนเครื่องของคุณแล้ว

### ขั้นตอนติดตั้งและรันระบบ
1. โคลนคลังโค้ดนี้ลงเครื่องของคุณ
2. ติดตั้งโมดูลและไลบรารีที่เกี่ยวข้อง:
   ```bash
   npm install
   ```
3. รันระบบสำหรับเขียนโค้ดและทดสอบในเครื่อง (Local Dev Server):
   ```bash
   npm run dev
   ```
4. ตรวจสอบคุณภาพโค้ดด้วย Linter:
   ```bash
   npm run lint
   ```
5. บิลด์ระบบสำหรับส่งมอบงาน (Production Build):
   ```bash
   npm run build
   ```

### 🕹️ หน้ารวมเกมสำหรับทดสอบ (Dev Game Hub)

เครื่องมือภายในทีม QA สำหรับเข้าเล่นมินิเกมทุกตัวได้ทันที **โดยไม่ต้องผ่านหน้ายินยอม/วิดีโอ และไม่บันทึกข้อมูลใดๆ ลงระบบจริง** (`onFinish`/`logEvent` ถูก mock ไว้ดูบนหน้าจอเท่านั้น พร้อม Event log panel ตรวจว่ายิง log ครบไหม)

1. รัน dev server ด้วย `npm run dev`
2. เปิดเบราว์เซอร์ไปที่ **[`/dev/games`](http://localhost:3000/dev/games)**
3. แตะการ์ดเกมที่ต้องการทดสอบ — เกมที่พร้อมเล่นจะมีปุ่ม ▶️ ส่วนเกมที่ยังไม่พัฒนา (เช่น G4, G7) จะเป็นการ์ด disabled

> หน้านี้เปิดใช้อัตโนมัติเมื่อรันแบบ dev (`NODE_ENV !== "production"`) — หากต้องการเปิดบนเซิร์ฟเวอร์ production ให้ตั้ง env `ENABLE_DEV_HUB=true` (หรือ `NEXT_PUBLIC_ENABLE_DEV_HUB=true`) แล้ว restart container — ไม่ต้อง rebuild image
> ไฟล์: `src/app/dev/games/page.tsx`

---

## ☁️ การ Deploy และ Hosting

ระบบ deploy อยู่บน **Vercel** ภายใต้ทีม [naplab-studio](https://vercel.com/naplab-studio) — โปรเจกต์: [media-literacy](https://vercel.com/naplab-studio/media-literacy) (บัญชีดูแล: `admin.naplab@camt.info`)

- โดเมนปัจจุบันอยู่ระหว่างช่วงเปลี่ยนผ่านจาก subdomain สถาบัน/แหล่งทุนเดิม ไปเป็นโดเมนที่เข้าถึงง่ายกว่า — ดูรายละเอียดและสถานะล่าสุดที่ [DNS Setup Guidelines](./docs/wiki/dns-setup.md) และ [Sprint 03 polishing](./docs/agile/sprint-backlog/sprint-03-polishing.md)
- การ build/deploy ใช้ค่าเริ่มต้นของ Vercel framework preset สำหรับ Vite (ดู `vercel.json`)

---

## 📞 การติดต่อประสานงาน
โครงการนี้นำทีมพัฒนาโดย **NAPLAB Media Literacy Development Team**  
กรุณาประสานงานฝ่าย IT เกี่ยวกับการตั้งค่า DNS หรือระบบโดเมนย่อยสถาบันการศึกษาตามคู่มือ [DNS Setup Guidelines](./docs/wiki/dns-setup.md)
