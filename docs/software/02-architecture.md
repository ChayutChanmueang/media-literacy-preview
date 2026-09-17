# รู้ทันสื่อ Interactive — System Architecture

**Version:** 1.4 | **Last Updated:** 2026-07-31 | **Owner:** NAPLAB Dev Team

> ⚠️ **สถานะการ implement จริง (ตรวจสอบ 2026-08-14):** เอกสารนี้บางส่วนอธิบาย Supabase BaaS แบบเต็ม (Auth / Realtime) แต่โค้ดจริง **ต่อ Postgres ตรงผ่าน `pg` Pool** (`src/lib/database.ts`) — **ไม่ได้ใช้ Supabase Auth, ไม่มี RLS** (schema ถอด RLS ออก ดู `docs/supabase-schema.sql`), **ยังไม่ใช้ Realtime**, และ **Supabase Storage ยังไม่ได้ต่อ** (ใบประกาศปัจจุบันแชร์เป็นลิงก์ข้อความ LINE ไม่ได้อัปโหลดรูป) ถ้าจะใช้ตามภาพนี้ต้อง implement เพิ่ม — ดู [US-DOC-01](../agile/user-stories/US-DOC-01.md), [US-SEC-01](../agile/user-stories/US-SEC-01.md)

เอกสารนี้อธิบายสถาปัตยกรรมระบบ (System Architecture) ของแอปพลิเคชันรู้ทันสื่อ Interactive ครอบคลุมการจัดแบ่งส่วนประกอบ การจัดวางระบบ (Deployment) และการไหลของข้อมูลหลัก โดยมีเป้าหมายเพื่อรองรับผู้ใช้ที่เป็นผู้สูงอายุในกลุ่มไลน์ชุมชน มีประสิทธิภาพสูงในพื้นที่ที่สัญญาณอินเทอร์เน็ตจำกัด และปฏิบัติตามหลักความปลอดภัยข้อมูลส่วนบุคคล (PDPA) อย่างเคร่งครัด

---

## 1. High-Level Architecture

ระบบถูกออกแบบในลักษณะ **Single Project Monorepo** โดยใช้ **Next.js ร่วมกับ TypeScript** ในการจัดการทั้ง Frontend (ผ่าน Next.js App Router Client Components) และ Backend/API (ผ่าน Route Handlers & Server Actions) ภายในโปรเจกต์เดียวกัน ทำให้อุปกรณ์เบราว์เซอร์ของฝั่งผู้ใช้เชื่อมต่อสื่อสารโดยตรงกับ Next.js Server ซึ่งประมวลผลอยู่บน **Docker Container (Node 24 Alpine)** แล้วเชื่อมต่อเข้ากับ **Supabase (PostgreSQL Database)** หรือบริการภายนอก:

```mermaid
flowchart TD
    subgraph Container ["Docker Environment: node:24-alpine"]
        subgraph NextJS ["Core Framework Layer: Next.js 16 + TypeScript"]
            subgraph ClientLayer ["Client Side: Next.js App Router Components"]
                direction TB
                SPA["Next.js Pages / Client Components"]
                SW["Service Worker / Cache"]
                LS["localStorage & Cookie"]
            end

            subgraph ServerLayer ["Server Side: App Router Node.js runtime"]
                SRV["Next.js Server: Port 8080"]
                API["API Route Handlers / Server Actions"]
                SRV --- API
            end
        end
    end

    subgraph PortainerHost ["CAMT Portainer / Host Machine"]
        HOST_PORT["Mapped Host Port: 10980:8080"]
        HOST_PORT --- SRV
    end

    subgraph DatabaseLayer ["Backend Service Layer: Supabase / PostgreSQL"]
        DB[("Supabase / Postgres Database")]
    end

    subgraph External ["External Services"]
        YT["YouTube Vertical Video Player"]
        LN["LINE In-App Browser & Share"]
    end

    SPA -->|1. Request Page / Navigation| SRV
    SRV -->|2. Render Client Components / Server-side HTML| SPA
    SPA -->|3. Play Video| YT
    SPA -->|4. Share Links| LN
    SPA -->|5. Call API /api/... or Server Actions| API
    API -->|6. Query & Update Data via pg Pool| DB
    SPA -.->|Read/Write State| LS
    SPA -.->|Offline Mode Support| SW
```

---

## 2. Component Detail

### 2.1 Client Layer (Next.js App Router Client Components)
สถาปัตยกรรมฝั่งผู้ใช้เน้นความมีน้ำหนักเบาและตอบสนองได้รวดเร็ว (Mobile-First):
- **Next.js Client Components (TypeScript):** ส่วนติดต่อผู้ใช้ พัฒนาด้วย React ภายใต้ Next.js App Router ซึ่งจะทำ Code-Splitting และ Server-Side Rendering (SSR) / Static Site Generation (SSG) อัตโนมัติ เพื่อรีดประสิทธิภาพในการดาวน์โหลดครั้งแรกบนเครือข่ายมือถือ 3G
- **UI & Styling Stack:** จัดการหน้าตาของระบบผ่าน **Tailwind CSS** เพื่อความรวดเร็วและกระชับในการเขียนคลาสสไตล์ พร้อมใช้งาน **shadcn/ui** (โครงสร้างจาก Radix UI Primitives) เป็นคลังคอมโพเนนต์สำเร็จรูปที่มีความยืดหยุ่นสูง สามารถคัดลอกโค้ดมาปรับแต่งโครงสร้าง CSS เพิ่มเติมในโครงการได้โดยตรงเพื่อตอบโจทย์ Accessibility ของผู้สูงอายุ
- **Form & Data Validation:** การกรอกข้อมูลและการทำแบบฟอร์ม (เช่น ฟอร์ม Onboarding ขอความยินยอม/ระบุช่วงอายุ/เลือกสถานที่ และ ฟอร์มกรอกชื่อเล่นบนใบประกาศ) จะถูกจัดการผ่าน **React Hook Form** เพื่อประสิทธิภาพในการเรนเดอร์และการทำ State Management ร่วมกับ **Zod** ในการทำ Schema Validation เพื่อตรวจสอบเงื่อนไขความถูกต้องของฟิลด์ข้อมูล ทั้งในระดับ UI ฝั่งไคลเอ็นต์ และจุดรับข้อมูลฝั่งเซิร์ฟเวอร์ (API Route Handlers)
- **Progressive Web App (PWA):** ใช้ PWA configuration (เช่น `@ducanh2912/next-pwa` หรือคล้ายกัน) เพื่อแคช Static assets (ไฟล์รูปภาพ, CSS, เสียงอ่านโจทย์) บน Service Worker ช่วยเพิ่มความเร็วในการเปิดซ้ำ และแก้ปัญหาสัญญาณอินเทอร์เน็ตหลุด
- **Hybrid Persistence Store:** ผสมผสานการใช้ `localStorage` และ Cookie (`SameSite=Lax`, `Max-Age` 1 ปี) ในการรักษาสถานะ `session_id`, `age_range` และความคืบหน้าของบทเรียน ป้องกันการสูญหายของข้อมูลจากการเคลียร์แคชโดยอัตโนมัติบน LINE In-App Browser

### 2.2 Backend & Server API Layer (Next.js API Route Handlers)
- **TypeScript Backend:** Next.js รันสภาวะแวดล้อม Node.js หลังบ้านเพื่อทำ API Service ในตัวโดยไม่ต้องมี Backend Service แยกต่างหาก 
- **Next.js Route Handlers:** พัฒนา REST API ในรูปแบบ TypeScript ไฟล์แยกตาม path ภายใต้ `app/api/` เพื่อเชื่อมต่อกับ Database:
  * `app/api/sessions/route.ts` - บันทึกข้อมูลอายุ/Consent พร้อมพื้นที่ที่ผู้เรียนเลือกเอง
  * `app/api/page-views/route.ts` - เก็บบันทึกประวัติการเข้าหน้าจอและคำนวณ Duration
  * `app/api/action-logs/route.ts` - `POST` เก็บบันทึก Event log ของปุ่มและพฤติกรรมในหน้าจอ, `GET` ดึงข้อมูลสรุปเชิงวิเคราะห์ (Analytics) จาก log ที่เก็บไว้ — ดูวิธีเรียกใช้ที่ [03-data-schema.md § Analytics API](./03-data-schema.md#analytics-api-get-apiaction-logs)
  * `app/api/lesson-progress/route.ts` - บันทึกดาวและความสำเร็จของคลิปและเกมรายบท
  * `app/api/quiz-questions/route.ts` - ดึงโจทย์และเฉลย Pretest/Posttest
  * `app/api/quiz-attempts/route.ts` & `app/api/quiz-answers/route.ts` - บันทึกคะแนนผลทดสอบและการตอบรายข้อ
- **Server-Side Integration:** สามารถเข้าถึง Database ได้โดยตรงผ่าน Next.js Server Components หรือ Server Actions ในจุดที่เหมาะสมเพื่อลด Latency ในการเรียก API หลายขั้นตอน

### 2.3 Backend Service Layer (Postgres / Supabase)
- **Database (PostgreSQL บน Supabase) — ใช้จริง:** เก็บข้อมูลเชิงสัมพันธ์ (ตาราง `sessions`, `page_views`, `action_logs` ฯลฯ) เข้าถึงผ่าน `pg` Pool ตรง ๆ จาก Route Handlers (`src/lib/database.ts`) ทุก query เป็น parameterized query
- **Authentication — ยังไม่ implement:** ระบบเป็น no-login/นิรนามผ่าน client-generated session UUID (`progressService`) ไม่ได้ใช้ Supabase Auth และ **API ทุก route ยังไม่มี auth guard** (ดู [US-SEC-01](../agile/user-stories/US-SEC-01.md))
- **Storage — ยังไม่ต่อ (แผน):** ตั้งใจใช้เก็บภาพใบประกาศ แต่ปัจจุบัน `CertificateScreen` แชร์เป็นลิงก์ข้อความ LINE ยังไม่ได้ generate/อัปโหลดรูป
- **Real-time — ยังไม่ใช้ (แผน):** ตั้งใจใช้ซิงก์สถิติ Facilitator Dashboard ในอนาคต

### 2.4 External Integration
- **YouTube IFrame API:** ฝังตัวเล่นวิดีโอแนวตั้ง (9:16) ในหน้าแอปพลิเคชัน และดักจับความก้าวหน้าการรับชมเพื่อระบุว่าดูวิดีโอจบเรียบร้อยแล้วหรือไม่
- **LINE In-App Browser:** สภาพแวดล้อมที่ออกแบบมารองรับการแสดงผลของ WebView LINE

### 2.5 Container & Deployment Architecture (Docker & Portainer)
- **Multi-stage Build Strategy (`docker/Dockerfile`):**
  1. `dependencies` (Base: `node:24-alpine`): ติดตั้ง npm packages สำหรับการ build ด้วย `--legacy-peer-deps`
  2. `build`: ทำการ build bundle (`npm run build`) โดยกำหนด `ARG BUILD_DATABASE_URL=postgresql://build:build@localhost:5432/build` เป็น placeholder ป้องกันไม่ให้ Next.js ถอนตัวเนื่องจากไม่มีค่า database ในขั้นตอนดึง metadata
  3. `runner`: สร้างคอนเทนเนอร์ขนาดเล็กสุด คัดลอกเฉพาะ `.next`, `public`, `node_modules`, `package.json` แล้วรัน `npm run start` บนพอร์ต `8080`
- **Dynamic Runtime Environment Control:**
  - รองรับการกำหนดตัวแปร `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ENABLE_DEV_HUB`, และ `NEXT_PUBLIC_ENABLE_DEV_HUB` ผ่าน Environment Variables ของ Portainer
  - หน้า `/dev/games` อ่านค่า `ENABLE_DEV_HUB` ฝั่งเซิร์ฟเวอร์แบบ dynamic (`force-dynamic`) ทำให้สามารถเปิด/ปิดการเข้าถึง Tool หน้างาน Production ได้จาก Portainer dashboard ทันทีโดยไม่ต้อง Rebuild Docker Image
- **Deployment Topology Options:**
  - **Local Development / Container Test (`docker/docker-compose.yml`):** แมปพอร์ต `8080:8080` และมีทางเลือกสปินอัป Postgres 15 local container พร้อม mount DDL script `docs/supabase-schema.sql`
  - **CAMT Production Stack (`docker/docker-compose.portainer.yml`):** สปินอัปเฉพาะ web container `ageconnect-ml-318` จาก Docker Hub image (`naplabstudio/media-literacy:latest`) แมปพอร์ตโฮสต์ `10980:8080` ต่อตรงไปยัง Supabase Cloud Database

---

## 3. Data Flow & Subsystems

### 3.1 การไหลของข้อมูลการสร้าง Session (Onboarding Flow)
การสร้างผู้ใช้งานและยืนยันตำแหน่งภายใต้กฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA) มีขั้นตอนการสื่อสารข้อมูลดังนี้:

```mermaid
sequenceDiagram
    autonumber
    actor Elder as ผู้สูงอายุ
    participant Browser as Client Browser (LINE)
    participant API as Next.js Server API
    participant DB as Supabase

    Elder->>Browser: แตะลิงก์เข้าสู่หน้าเว็บครั้งแรก
    Browser->>API: ส่ง HTTP Get Request เพื่อขอหน้าเว็บ
    API-->>Browser: ตอบกลับหน้า HTML และ JS Client Components
    Browser->>Browser: ตรวจสอบความยินยอม (Consent Page)
    Note over Browser: ผู้ใช้ยืนยันอายุ และเลือกจังหวัด/อำเภอ/ตำบลเอง
    Elder->>Browser: ยินยอมและยืนยันข้อมูล
    Browser->>API: เรียก API บันทึกเซสชัน POST /api/sessions (อายุ, พื้นที่ที่เลือก)
    API->>DB: บันทึกข้อมูลลงตาราง sessions
    DB-->>API: ยืนยันสำเร็จ
    API-->>Browser: ส่งกลับ session_id และบันทึกลง Cookie / LocalStorage
    Browser->>Elder: พาเข้าสู่หน้าแบบทดสอบก่อนเรียน (Pretest)
```

### 3.2 ระบบประมวลผลพฤติกรรมการใช้งาน (Asynchronous Event Logging)
เพื่อความเร็วในการแสดงผลฝั่ง Client ทุกการส่งสถิติพฤติกรรมผู้ใช้จะไม่บล็อกการทำกิจกรรมบนจอภาพ:

1. **ดักจับพฤติกรรม (Client-side Listeners):** ระบบตรวจจับการกดปุ่ม (เช่น ปุ่มเล่นเสียงอ่าน, ปุ่มข้าม, ปุ่มแชร์ดาว)
2. **คิวส่งข้อมูล (Async Queue/Service Worker):** Client ส่งข้อมูล Event เข้าสู่เบื้องหลังแบบไม่รอคอยผลลัพธ์ (Non-blocking POST Request)
3. **จัดเก็บ (DB Insertion):** REST API `/api/action-logs` รับข้อมูล นำไปบันทึกเข้าตาราง `action_logs` ใน Postgres ทันที

### 3.3 การไหลของข้อมูลการทำ Pre-test / Post-test (Pretest/Posttest Flow)
ระบบข้อสอบก่อนเรียนและหลังเรียนจะดึงข้อมูลโครงสร้างข้อสอบและส่งผลคะแนนคืนแบบสองทิศทางดังนี้:

```mermaid
sequenceDiagram
    autonumber
    actor Elder as ผู้สูงอายุ
    participant Browser as Client Browser (LINE)
    participant API as Next.js Server API
    participant DB as Supabase

    Browser->>API: ดึงรายการข้อสอบและตัวเลือก GET /api/quiz-questions?type=pretest|posttest
    API->>DB: ดึงตาราง quiz_questions + quiz_options
    DB-->>API: ส่งข้อมูลข้อสอบและเฉลยกลับ
    API-->>Browser: ส่งข้อสอบและตัวเลือกให้ Client
    Browser->>Browser: แสดงผลข้อสอบทีละข้อ
    Elder->>Browser: เลือกตอบคำถามจนครบทุกข้อ
    Browser->>Browser: คำนวณคะแนนรวมฝั่ง Client
    Browser->>API: บันทึกรอบการสอบ POST /api/quiz-attempts (session_id, test_type, score)
    API->>DB: เพิ่มข้อมูลลงตาราง quiz_attempts
    DB-->>API: ส่งกลับ attempt_id ล่าสุด
    API-->>Browser: ส่งกลับ attempt_id
    Browser->>API: ส่งรายละเอียดคำตอบ POST /api/quiz-answers (attempt_id, answers)
    API->>DB: บันทึกข้อมูลคำตอบรายข้อลงตาราง quiz_answers
    DB-->>API: บันทึกเสร็จสมบูรณ์
    API-->>Browser: ยืนยันผลลัพธ์
    Browser->>Browser: นำทางเข้าสู่หน้าจอถัดไป (หน้าเลือกบทเรียน / หน้าใบประกาศ)
```

### 3.4 ระบบจัดเก็บ Log การเข้าใช้งานหน้าเว็บ (User Access Logging Flow)
เพื่อวัดอัตราผู้ใช้ถอนตัว (Drop-off Rate) และปริมาณการเข้าใช้งานหน้าเว็บแต่ละส่วน:
1. **การเข้าหน้าเว็บ (Page Entry):** ทันทีที่มีการนำทางหน้าจอใหม่ใน React Router, ระบบ Client จะทำการบันทึก Page URL และประทับเวลาเริ่มต้น จากนั้นทำการส่ง Asynchronous POST ไปยัง `/api/page-views` เพื่อบันทึกเป็นแถวข้อมูลเริ่มต้น
2. **การออกหน้าเว็บ (Page Exit / Page Transition):** เมื่อผู้ใช้กดเปลี่ยนหน้าหรือปิดหน้าต่างเบราว์เซอร์, Client จะดักจับ Event การเปลี่ยน route หรือ unload เพื่อจับเวลาที่อยู่บนหน้านั้น และส่งคำร้อง POST ไปยัง `/api/page-views` เพื่ออัปเดตช่องข้อมูลเวลาใช้งานสะสม (`duration_seconds`)
3. **การประมวลผลออฟไลน์:** หากไม่มีสัญญาณเน็ต ข้อมูล Log การเข้าใช้จะสะสมใน Queue ของ LocalStorage เช่นเดียวกับระบบพฤติกรรม และพร้อมอัปโหลดซิงก์เมื่อกลับมาเชื่อมต่อเครือข่ายสำเร็จ

---

## 4. Security & Compliance (PDPA)

สถาปัตยกรรมด้านความปลอดภัยนี้ถูกออกแบบขึ้นเพื่อปกป้องผู้เล่นสูงวัยและปฏิบัติตามกฎหมาย:
1. **การปฏิเสธการระบุตัวตน (Anonymity by Default):** แอปพลิเคชันไม่มีช่องทางการป้อนข้อมูลชื่อจริง นามสกุลจริง เบอร์โทรศัพท์ หรือเลขประจำตัวใด ๆ
2. **สิทธิ์ในการระบุพื้นที่ (Consent-Based Location):** ผู้เรียนเลือกจังหวัด/อำเภอ/ตำบลเองจากรายการ ระบบไม่ขอสิทธิ์ GPS และไม่เก็บพิกัดละติจูด/ลองจิจูดจากเบราว์เซอร์ ระบบไม่เก็บ IP ดิบเข้าฐานข้อมูลใด ๆ
3. **การป้องกันฐานข้อมูล (Server-managed Security):** การเขียนข้อมูลทั้งหมดต้องวิ่งผ่าน REST API ของระบบหลังบ้าน โดยตรง ไม่ได้เปิดสิทธิ์ให้ Client ทำการคิวรีฐานข้อมูลโดยตรง ช่วยลดความเสี่ยงจากการพยายามเข้าถึงของบุคคลภายนอก

---

## 5. Testing Strategy (แนวทางการทดสอบระบบ)

การทดสอบระบบแบ่งแยกตามหน้าที่ของเฟรมเวิร์ก เพื่อให้ครอบคลุมทั้งความถูกต้องของตรรกะประมวลผลและการใช้งานจริง:

### 5.1 การทดสอบตรรกะระดับหน่วย (Logic Testing with Vitest)
**Vitest** ถูกใช้ในการเขียน Unit Tests / Integration Tests สำหรับตรวจสอบความถูกต้องของฟังก์ชันตรรกะ (Business Logic) ที่ไม่ต้องพึ่งพาการทำงานของเบราว์เซอร์จริง:
- **ฟังก์ชันตรวจสอบข้อมูล (Validation Logic):** ตรวจสอบการทำงานของ Zod Schemas ในการคัดกรองข้อมูลดิบ เช่น ฟอร์ม Consent/Onboarding
- **ฟังก์ชันคำนวณคะแนนบทเรียน (Score & Game Engine Logic):** ตรวจสอบความถูกต้องของการคำนวณดาว, ผลคะแนนเฉลยแบบทดสอบ (Quiz Grading) ฝั่ง Client
- **ฟังก์ชันจัดการเซสชัน (State Helpers):** ตรวจสอบ helper functions สำหรับการซิงก์ LocalStorage และ Cookies
- **API Route Handlers:** จำลอง Request/Response เพื่อตรวจสอบ API endpoints ภายใน Next.js หลังบ้าน

### 5.2 การทดสอบโฟลว์ผู้ใช้จริง (End-to-End Testing with Playwright)
**Playwright** ถูกใช้ในการทดสอบโฟลว์การใช้งานตั้งแต่หน้าแรกจนจบหลักสูตร (E2E User Journey Flow) โดยทำการจำลองการรันผ่านเบราว์เซอร์บนมือถือ (Mobile Emulation) และ WebView ใน LINE App:
- **Onboarding & Guard Flow:** จำลองผู้ใช้เปิด Deep Link หน้าบทที่ 3 ตรวจสอบว่าระบบเปลี่ยนหน้า (Redirect) ไปหน้า Consent และบังคับทำ Pretest ก่อนที่จะยอมให้เข้ามาดูวิดีโอจริงตามสเปกของ Router Guards หรือไม่
- **Interactive Game Flow:** จำลองการกดตอบคำถามในมินิเกม G1–G6 ตรวจสอบการแสดงผลกล่องเฉลย, คะแนนสะสม และการได้รับดาวเมื่อตอบถูก
- **PWA & Offline Flow:** ทดสอบการตัดการเชื่อมต่อเครือข่ายจำลอง เพื่อดูว่า Service Worker และคิว Asynchronous ของระบบยังทำงานได้หรือไม่
- **Certificate Generation & Share:** จำลองผู้ใช้ป้อนชื่อเล่น ตรวจสอบการดาวน์โหลดรูปภาพใบประกาศ และการเรียกใช้ LINE Share URL Parameters

---

## 6. PWA & Offline-First Strategy (กลยุทธ์การทำ PWA และระบบทำงานออฟไลน์)

การทำงานแบบออฟไลน์ (Offline Mode) บนสมาร์ตโฟนของผู้สูงอายุมีความสำคัญสูง เนื่องจากปัญหาสัญญาณอินเทอร์เน็ตไม่เสถียรในพื้นที่ชุมชนและปัญหาแคชหลุดง่ายใน LINE In-App Browser (WebView):

```mermaid
flowchart TD
    subgraph Client [Client Browser - Offline Mode]
        Req[Client API / Action Request]
        Cache[(Browser Cache Storage)]
        Q[(Offline Sync Queue: IndexedDB)]
        UI[Toast Alert: 'กำลังทำงานออฟไลน์']
    end
    subgraph Server [Backend - Online Mode]
        API[Next.js API Handler]
        DB[(Supabase DB)]
    end

    Req -->|1. Try Network| API
    Req -.->|2. Network Fail / Timeout| Q
    Q -->|3. Alert User| UI
    Cache -->|4. Load Cached Assets/Pages| Req
    
    Q -->|5. Detect navigator.onLine / Event 'online'| Flush[Flush Queue FIFO]
    Flush -->|6. Sync Data| API
    API -->|7. Persist Logs & Scores| DB
```

### 6.1 การทำงานของ Service Worker ใน LINE WebView
* **ความเข้าใจผิดทั่วไป:** หลายคนเข้าใจว่า PWA ไม่สามารถทำงานบน LINE WebView ได้ แต่แท้จริงแล้ว **Service Worker ( caching และ offline access) ทำงานได้ตามปกติ** บน LINE WebView ของ iOS และ Android รุ่นปัจจุบัน
* **ข้อจำกัดเชิงเทคนิค:** ข้อจำกัดเดียวของ LINE WebView คือไม่รองรับ API ตัวกระตุ้นปุ่ม "เพิ่มลงหน้าจอโฮม" (Add to Home Screen - A2HS) เท่านั้น ดังนั้น ผู้เรียนยังคงสามารถเข้าเรียน เล่นเกมแบบออฟไลน์ผ่านเบราว์เซอร์ของ LINE ได้โดยใช้คุณสมบัติการแคชของ PWA

### 6.2 นโยบายการแคชทรัพยากร (Caching Strategies)
การแคชข้อมูลจะจัดทำผ่าน Service Worker (กำหนดสเปกใน `@ducanh2912/next-pwa` ของ Next.js) แบ่งออกเป็น 2 ส่วน:
1. **Cache-First (สำหรับ Static Assets, Media & Code):**
   - ไฟล์ JS Chunks, CSS, โครงสร้าง UI ของ shadcn/ui, ไลบรารีเอนจิ้นเกม Phaser 4
   - สื่อประกอบการสอน: ภาพสไปรต์การ์ดเกมย่อย G1–G6, ภาพไอคอน, และไฟล์เสียงอ่านโจทย์คำถาม (.mp3)
   - *พฤติกรรม:* ระบบจะตรวจสอบใน Browser Cache Storage ก่อน หากมีจะโหลดทันทีเพื่อประหยัดเน็ตมือถือและรองรับการเล่นแบบออฟไลน์ 100%
2. **Network-First with Cache Fallback (สำหรับ Content JSON & API Routes):**
   - คำร้องขอข้อมูลโครงสร้างบทเรียน และรายการคำถามแบบทดสอบ (Pretest/Posttest)
   - *พฤติกรรม:* ระบบจะพยายามดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์ก่อนเสมอ หากเชื่อมต่อไม่ได้เนื่องจากอินเทอร์เน็ตขาดหาย จะดึงไฟล์คำถามที่ถูกบันทึกสำรอง (Cache Fallback) ไว้ในเครื่องมาให้ผู้เรียนทำแบบทดสอบต่อโดยไม่ต้องปิดหน้าระบบ

### 6.3 ระบบจัดการคิวส่งข้อมูลออฟไลน์ (Offline Synchronization Queue)
เมื่อเกิดเหตุการณ์เน็ตหลุดระหว่างที่ผู้เรียนทำแบบสอบถามหรือเล่นเกมผ่านแต่ละด่าน ระบบจะรองรับข้อมูลดังนี้:
* **การบันทึกคิวแบบ Asynchronous (Queue Registry):**
  - ข้อมูล Logs พฤติกรรมการเล่น (Action Logs) และ ผลคะแนนแบบทดสอบ (Quiz Scores/Answers) ที่ต้องการส่ง API ไปยัง `/api/action-logs` หรือ `/api/quiz-attempts` จะถูกเก็บสำรองลงใน **IndexedDB** หรือ **localStorage** ของเบราว์เซอร์ในรูปแบบ JSON Queue
* **การซิงก์ข้อมูลอัตโนมัติ (Auto-Sync Listener):**
  - ตัวแอปพลิเคชันฝั่ง Client จะลงทะเบียน Event Listener ตรวจจับสถานะการเชื่อมต่อ:
    ```typescript
    window.addEventListener('online', () => {
      // เรียกฟังก์ชัน Flush ข้อมูลในคิวออฟไลน์ขึ้นเซิร์ฟเวอร์ตามลำดับเวลา (FIFO)
      syncOfflineQueue();
    });
    ```
  - มีกลไกการส่งข้อมูลซ้ำ (Retry Mechanism) กรณีส่งแล้วเน็ตหลุดซ้ำอีกรอบ เพื่อป้องกันข้อมูลสูญหาย
* **การแจ้งเตือนผู้ใช้งาน (Graceful Offline UI):**
  - เมื่อตรวจพบว่าเครือข่ายตัดการทำงาน ระบบจะแสดง Toast หรือแถบแจ้งเตือนด้านบนด้วยข้อความที่เป็นมิตรและเข้าใจง่ายสำหรับผู้สูงอายุ เช่น *"ขณะนี้สัญญาณอินเทอร์เน็ตขาดหาย คะแนนและสถิติของท่านจะถูกบันทึกไว้ในเครื่องชั่วคราว และจะอัปเดตให้อัตโนมัติเมื่อสัญญาณเน็ตกลับมา"*

---

## Related Documents
- System Design: [System Design](./01-system-design.md)
- Data Schema: [Data Schema](./03-data-schema.md)
- Concept: [Concept & Architecture](../gdd/00-concept.md)
