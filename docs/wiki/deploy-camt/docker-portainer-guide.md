# 🐳 คู่มือ Package ขึ้น Docker Hub + Deploy ผ่าน Portainer (CAMT)

**สถานะ:** 🔍 เตรียมไฟล์/ขั้นตอนไว้ล่วงหน้า — **ยังไม่ต้องรันจริงจนกว่าจะได้รับอนุมัติคำขอเครื่องแม่ข่าย** (ดู [README.md](./README.md) และ [request-form-guide.md](./request-form-guide.md))

ไฟล์ที่เกี่ยวข้องอยู่ใต้โฟลเดอร์ [`docker/`](../../../docker/) ที่ root ของ repo:

| ไฟล์ | หน้าที่ |
| --- | --- |
| [`docker/Dockerfile`](../../../docker/Dockerfile) | Multi-stage build: `npm run build` ด้วย Node 24 แล้วรันตัวรันไทม์ Node.js สำหรับ Express API Backend |
| [`docker/nginx.conf`](../../../docker/nginx.conf) | (สิทธิ์สำรอง/ไม่ได้ใช้) ไฟล์คอนฟิก Nginx เดิม |
| [`docker/Dockerfile.dockerignore`](../../../docker/Dockerfile.dockerignore) | กันไม่ให้ `node_modules`, `.env*`, `docs/` หลุดเข้า build context — ตั้งชื่อตามธรรมเนียม BuildKit (`<Dockerfile>.dockerignore`) เพราะ Dockerfile ไม่ได้อยู่ที่ root เหมือน `.dockerignore` ปกติ |
| [`docker/docker-compose.portainer.yml`](../../../docker/docker-compose.portainer.yml) | Stack file ใช้วางใน Portainer — สำหรับรัน Web App คู่กับ PostgreSQL |

> ⚠️ **Build context ต้องเป็น root ของ repo เสมอ** (ไม่ใช่โฟลเดอร์ `docker/`) เพราะ Dockerfile ต้อง `COPY` ทั้ง `package.json` และ `src/` ที่อยู่ที่ root — ใช้ `-f docker/Dockerfile` ระบุตำแหน่ง Dockerfile แต่ยังส่ง `.` (root) เป็น context เหมือนเดิม (ดูคำสั่งเต็มด้านล่าง)

---

## 1. หลักการสำคัญที่ต้องเข้าใจก่อน

- โปรเจกต์เปลี่ยนมาใช้ **Node.js Express backend** (`server.js`) ในการเสิร์ฟไฟล์และรัน API ดังนั้นความต้องการหลักของรันไทม์คือต้องเชื่อมต่อกับ **PostgreSQL Database** เพื่อเก็บข้อมูล Log ต่างๆ
- ในไฟล์ `docker-compose.portainer.yml` ได้ทำการผนวกคอนเทนเนอร์ฐานข้อมูล `db` (Postgres 15) เข้ามาอยู่ใน Stack เดียวกัน ทำให้ Portainer สามารถสปินอัปทั้งเว็บแอปพลิเคชันและฐานข้อมูลร่วมกันได้ทันที
- คอนเทนเนอร์ฐานข้อมูลจะมีการ Mount ตัวสคริปต์ [supabase-schema.sql](../../../docs/supabase-schema.sql) ในโฟลเดอร์ `/docker-entrypoint-initdb.d/` ซึ่งช่วยสร้าง Schema และตารางเริ่มต้นให้เองโดยอัตโนมัติ (จะรองรับเฉพาะการ deploy แบบดึงข้อมูลผ่าน Git Repository บน Portainer เท่านั้น)

---

## 2. Build image ในเครื่อง

```bash
# รันจาก root ของ repo (context = .) แต่ชี้ -f ไปที่ Dockerfile ใน docker/
docker build \
  -f docker/Dockerfile \
  -t naplabstudio/media-literacy:latest \
  .
```

แทน `naplabstudio` ด้วยชื่อบัญชี Docker Hub ของคุณ (กรณีต้องการเปลี่ยน)

ทดสอบก่อน push (ต้องระบุ DATABASE_URL ของฐานข้อมูลทดสอบด้วย):

```bash
docker run --rm -p 8080:8080 -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/dbname" naplabstudio/media-literacy:latest
# เปิด http://localhost:8080 เช็คว่าแอปโหลดและใช้งานได้ปกติ
```

---

## 3. Push ขึ้น Docker Hub แบบ public ชั่วคราว

```bash
docker login
docker push naplabstudio/media-literacy:latest
```

> ⚠️ **"Public ชั่วคราว" หมายถึง:** เปิด repo เป็น public ระหว่างที่ CAMT ยังดึง image ไป deploy ผ่าน Portainer ไม่ได้ (Portainer ต้อง pull จาก registry ที่เข้าถึงได้) เมื่อ deploy สำเร็จและยืนยันว่า pull ได้แล้ว **ให้กลับมาตั้ง repo เป็น private** ที่ Docker Hub (Repository → Settings → Make private) หรือประสานกับเจ้าหน้าที่ CAMT ว่ามีวิธี auth ดึง private image ได้หรือไม่ (Portainer รองรับ registry credential แยกอยู่แล้ว ไม่จำเป็นต้องเปิด public ถาวร)
>
> หมายเหตุ: ค่า `VITE_SUPABASE_ANON_KEY` ที่ฝังใน bundle จะมองเห็นได้จาก browser DevTools อยู่แล้วไม่ว่า image จะ public หรือ private (เป็นธรรมชาติของ client-side SPA) — ที่ต้องปิด public คือป้องกันไม่ให้คนนอกเห็นโครงสร้าง image/Dockerfile/dependency version โดยไม่จำเป็น ไม่ใช่เพื่อซ่อนความลับ runtime

---

## 4. Deploy ผ่าน Portainer

1. เข้าระบบ Portainer ของเครื่องแม่ข่าย CAMT ที่ **[https://dev2.camt.cmu.ac.th/](https://dev2.camt.cmu.ac.th/)**
2. เลือก **Use internal authentication** แล้วเข้าใช้งานด้วยสิทธิ์ล็อกอินใน [`info.md`](./info.md):
   - **Username:** `ageconnect`
   - **Password:** `?#KU!*gb85QeN~e`
3. เข้าไปที่ **Primary** → **Stacks** → **Add stack**
4. ตั้งชื่อ stack: `ageconnect-ml-318`
5. เลือกวิธีใส่ compose file แบบใดแบบหนึ่ง:
   - **Repository** (แนะนำ): ชี้ไปที่ Git Repository นี้ + path `docker/docker-compose.portainer.yml` เพื่อให้ตัว DB สามารถเข้าถึงสคริปต์สร้างตาราง `supabase-schema.sql` ในโปรเจกต์ได้ผ่าน Volume mount
   - **Web editor**: วางเนื้อหาไฟล์ [`docker/docker-compose.portainer.yml`](../../../docker/docker-compose.portainer.yml) ตรงๆ (แต่ต้องรันสคริปต์ DDL เพื่อสร้างตารางในฐานข้อมูลเองในภายหลัง เนื่องจากไม่สามารถดึงไฟล์สคริปต์มาทำ volume mount ได้)
6. เลื่อนลงมาที่ **Environment variables** (คนละส่วนกับตัว compose file) แล้วระบุค่าความต้องการของโปรเจกต์:

   | Name | Value | Description |
   | --- | --- | --- |
   | `DOCKERHUB_IMAGE` | `naplabstudio/media-literacy:latest` | ชื่ออิมเมจบน Docker Hub |
   | `HOST_PORT` | `10980` (หรือตามพอร์ตภายใน `109XX` ที่จัดสรร) | พอร์ตภายในเครื่องโฮสต์ (Internal Host Port) |
   | `DATABASE_URL` | `postgres://postgres.oiebsnikzjhzviixuvft:Z0ZN77MbTYIwLtPc@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Connection String ของ Supabase IPv4 Connection Pooler (พอร์ต 6543) |
   | `ENABLE_DEV_HUB` | `false` (ตั้ง `true` เฉพาะตอน QA/demo) | เปิดหน้ารวมเกม `/dev/games` — อ่านตอน runtime ไม่ต้อง rebuild image ⚠️ ห้ามเปิดบนเครื่องที่ผู้สูงอายุใช้จริงหน้างาน |

   > 💡 **เงื่อนไขข้อกำหนดเรื่องพอร์ตของ CAMT:**
   > - **พอร์ตออกสู่ภายนอก (External Port):** `10980`
   > - **พอร์ตภายในเครื่องโฮสต์ (Internal Host Port):** `109XX` (โดย `XX` อยู่ในช่วง `00` - `99` เช่น `10980`)

   **ห้ามระบุรหัสผ่าน/ชื่อผู้ใช้งานลงในตัวไฟล์ yaml โดยตรง** — ให้กรอกผ่านกล่องนี้หรือไฟล์ `.env` ที่อัปโหลดแยกเท่านั้นเพื่อความปลอดภัย
7. กด **Deploy the stack**
8. ตรวจสอบว่าสถานะของ container ทุกตัวใน Stack เปลี่ยนเป็น `healthy` จากนั้นเปิดทดสอบหน้าเว็บผ่านพอร์ตที่ระบุ

---

## 5. ตรวจสอบว่า volume กันข้อมูลหายจริง

ตัวฐานข้อมูลจะเก็บไฟล์ไว้ใน Volume `postgres_data` เพื่อความปลอดภัยของข้อมูลแม้ถูก redeploy:

```bash
# ดู volume ที่ Portainer/Docker สร้างให้ (ชื่อจะมี prefix ชื่อ stack นำหน้า เช่น media-literacy_postgres_data)
docker volume ls | grep postgres_data

# ลองปิดแล้วเปิด Container ใหม่ (ผ่าน Portainer: Stacks > media-literacy > Stop > Start)
# จากนั้นเช็คว่าข้อมูล session หรือ log เก่ายังอยู่ในฐานข้อมูล
```

ถ้า container ถูกลบ/redeploy แล้วข้อมูลเดิมหายไป แสดงว่า volume ไม่ได้ทำงานตามปกติ — ให้ตรวจสอบการกำหนด volume ในหน้าจัดการ Stack ของ Portainer หรือตรวจสอบสิทธิ์การเขียนไฟล์ของ Docker daemon บนเครื่องโฮสต์

---

## 6. อัปเดต image เวอร์ชันใหม่ (หลัง deploy ครั้งแรก)

1. Build + push tag ใหม่ (แนะนำใช้ tag ตาม commit/วันที่ แทน `latest` เพียวๆ เมื่อระบบใช้งานจริงแล้ว เพื่อ rollback ง่าย)
2. ใน Portainer: แก้ค่า `DOCKERHUB_IMAGE` ใน Environment variables ของ stack เป็น tag ใหม่
3. กด **Update the stack** → เลือก **Re-pull image and redeploy**
4. Volume `postgres_data` จะไม่ถูกลบระหว่างขั้นตอนนี้ (อยู่นอก container lifecycle)

---

## 7. งานที่ยังไม่ได้ทำ (ต้องกลับมาทำหลังคำขอ CAMT อนุมัติ)

- [x] ยืนยันชื่อ Docker Hub namespace จริง (ใช้ชื่อบัญชี `naplabstudio` ในคู่มือและ `docker/docker-compose.portainer.yml` เรียบร้อยแล้ว)
- [x] **แก้ `package-lock.json` ให้ sync กับ `package.json` แล้ว** — (ดำเนินการเรียบร้อยแล้วโดยการรัน `npm install` บนเครื่อง dev และบันทึกข้อมูลใน lockfile สำเร็จ)
- [ ] ยืนยันพอร์ต/reverse proxy ฝั่ง CAMT ว่าจะ map เข้า container พอร์ต 8080 ยังไง (Portainer เอง หรือมี proxy ชั้นนอกอีกที)
- [ ] ตัดสินใจเรื่อง spec ของ "log การเข้าใช้งานเพื่อวิเคราะห์ผลการเผยแพร่" ให้ชัดเจน (เก็บจากฐานข้อมูลผ่าน API หรือมี endpoint บันทึก log ดิบเพิ่มเติม) แล้วอัปเดตคู่มือนี้ + `AGENT.md` ให้ตรง
- [ ] เมื่อ deploy จริงสำเร็จ กลับมาอัปเดต `AGENT.md` (หัวข้อ Deployment/Domain) และ `docs/changelog.md` ตามธรรมเนียมโปรเจกต์

