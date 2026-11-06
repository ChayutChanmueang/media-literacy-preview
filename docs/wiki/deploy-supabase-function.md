# Deploy Edge Function ดึงข้อมูล (`ml_functions`)

**สถานะ:** ฟังก์ชันขึ้นบน Supabase Cloud โปรเจกต์ **ML Project** (`oiebsnikzjhzviixuvft`) แล้วเมื่อ 2026-11-06 และเว็บเรียกฟังก์ชันนี้จาก `POST /api/admin/export` — ตั้ง `APP_MODE=research` แล้ว, `SUPABASE_DB_URL` เป็นค่าที่ Cloud ฉีดให้, ยังไม่ได้ขึ้นบนเครื่อง self-host 202, 233
**แดชบอร์ด:** [Functions ของโปรเจกต์นี้](https://supabase.com/dashboard/project/oiebsnikzjhzviixuvft/functions)
**เกี่ยวข้อง:** [12 — หน้าดึงข้อมูล](../software/12-data-export-page.md) · โค้ดอยู่ที่ `supabase/functions/ml_functions/`

หน้า `/admin/data-export` ส่งคำขอไปที่ฟังก์ชันนี้เพื่ออ่านตารางที่มีอยู่แล้ว ไม่มีตารางเก็บรายงาน ฟังก์ชันต้องอยู่บน Supabase เครื่องเดียวกับข้อมูลที่จะดึง

---

## 1. สิ่งที่ต้องมี

- รันคำสั่งจาก **รากของ repo** (โฟลเดอร์ที่มี `supabase/config.toml` อยู่ข้างใน ไม่ใช่จากในโฟลเดอร์ `supabase/` เอง)
- CLI คือแพ็กเกจ `supabase` ในโปรเจกต์ เรียกด้วย `npx supabase` — พิมพ์ `supabase` ตรงๆ จะได้ `command not found` เพราะไม่ได้ติดตั้งทั้งเครื่อง
- ล็อกอินครั้งแรก: `npx supabase login` ตรวจด้วย `npx supabase projects list` ต้องเห็นโปรเจกต์ **ML Project**
- CLI ที่ใช้อยู่คือรุ่น **3** ธงต่างจากคู่มือเก่า

| อย่าใช้ | ใช้แทน |
| --- | --- |
| `supabase` (ไม่มีใน PATH) | `npx supabase` |
| ชื่อ `ml-function` | ชื่อโฟลเดอร์จริง `ml_functions` |
| `--project-ref <ref>` | `--remote=<ref>` มีเครื่องหมาย `=` |
| `--remote <ref>` (เว้นวรรค) | `--remote=<ref>` ไม่เช่นนั้น CLI ตีความชื่อโปรเจกต์คลุมเครือ |

---

## 2. Deploy ขึ้น Supabase Cloud

คำสั่งที่รันผ่านแล้วบนโปรเจกต์ ML Project:

```bash
npx supabase functions deploy ml_functions --remote=oiebsnikzjhzviixuvft --use-api --yes
```

- `--use-api` ให้ฝั่ง Supabase จัดชุดไฟล์เอง ไม่ต้องมี Docker ในเครื่องที่รันคำสั่ง
- `--yes` ยืนยันโดยไม่ถาม (CLI รุ่น 3 ไม่รับคำตอบ yes จากไฟล์ `.env`)
- สำเร็จแล้วแดชบอร์ดมีฟังก์ชันชื่อ `ml_functions` โค้ดที่ถูกอัปโหลดรวมไฟล์ใน `supabase/functions/ml_functions/` และไฟล์ที่มัน import จาก `src/lib/export/` กับ `src/lib/flow.ts`

deploy ซ้ำเมื่อแก้โค้ดฟังก์ชันหรือชุดคำสั่งที่มัน import ใช้คำสั่งเดิม

---

## 3. ตั้ง secret หลัง deploy

Cloud ฉีด `SUPABASE_URL` และ anon key ให้อยู่แล้ว ต้องตั้งเองอีกสองตัว ฟังก์ชันถึงจะอ่านฐานข้อมูลได้

```bash
npx supabase secrets set --remote=oiebsnikzjhzviixuvft \
  APP_MODE=research \
  SUPABASE_DB_URL='postgresql://postgres.<ref>:<รหัสผ่าน>@db.oiebsnikzjhzviixuvft.supabase.co:5432/postgres'
```

- ห้ามเขียนรหัสผ่านจริงลงเอกสารหรือลง git
- ห้ามใช้ `supabase secrets set --env-file .env` — ไฟล์นั้นมีค่าอื่นปน และ `DATABASE_URL` ชี้พอร์ต pooler `6543` ซึ่งใช้กับฟังก์ชันนี้ไม่ได้
- `SUPABASE_DB_URL` ต้องเป็นการเชื่อมต่อตรง พอร์ต **5432** โฮสต์ `db.<project-ref>.supabase.co` เพราะฟังก์ชันเปิด transaction อ่านอย่างเดียวค้างไว้ตลอดการดึง
- `APP_MODE` ต้องตรงกับเว็บที่เรียกฟังก์ชันนี้ โปรเจกต์ Cloud ชุดนี้ใช้ `research` เว็บโหมดปกติต้องเป็น `normal` และต้องเป็นคนละโปรเจกต์/คนละฟังก์ชัน

ตั้ง secret แล้วไม่ต้อง deploy ซ้ำ ฟังก์ชันอ่านค่าใหม่ในคำขอถัดไป

---

## 4. ให้เว็บเรียกฟังก์ชันนี้

ที่เว็บ (ไม่ใช่ที่ฟังก์ชัน) ตั้งแล้วรีสตาร์ต ไม่ต้อง rebuild

| ตัวแปร | ค่า |
| --- | --- |
| `SUPABASE_URL` | `https://oiebsnikzjhzviixuvft.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | publishable key หรือ anon key ของโปรเจกต์เดียวกัน |
| `DATA_EXPORT_DIRECT` | ปล่อยว่าง — เว็บจะเรียกฟังก์ชัน |

ถ้ายังไม่ได้ขึ้นฟังก์ชันหรือยังไม่ได้ตั้ง secret ให้ตั้ง `DATA_EXPORT_DIRECT=true` ชั่วคราว เว็บจะอ่าน `DATABASE_URL` เอง ผลไฟล์เหมือนกัน

บัญชีที่ดาวน์โหลดได้ต้องเป็นบัญชีที่ไม่ใช่ anonymous ใน Supabase Auth ของโปรเจกต์นั้น โดยไม่ต้องกำหนด role ตาม [12 ข้อ 5.2](../software/12-data-export-page.md#52-เจ้าหน้าที่เพิ่มบัญชีผู้ใช้-d4) — **ต้องปิดการสมัครเอง** และจำกัดบัญชีทั้งหมดในโปรเจกต์ให้เป็นผู้ที่ได้รับอนุญาตดึงข้อมูล รวมถึงการเรียก Edge Function โดยตรง

---

## 5. เครื่อง self-host (202 และ 233)

ยังไม่ได้ deploy ทางนี้ `supabase functions deploy` ขึ้นได้เฉพาะโปรเจกต์ Cloud ที่ล็อกอินไว้ เครื่อง self-host ใช้ image ใน [`supabase/Dockerfile`](../../supabase/Dockerfile) แล้วรัน [`supabase/docker-compose.yml`](../../supabase/docker-compose.yml) บน network `supabase_default` ของ stack Supabase เครื่องนั้น

แต่ละเครื่องตั้ง `APP_MODE` ของตัวเอง (`normal` ที่ 202, `research` ที่ 233) และ `SUPABASE_DB_URL` ชี้ Postgres ตรงของเครื่องนั้น (`@db:5432`) ไม่ใช่พอร์ต 6543 เว็บของเครื่องนั้นใช้ `SUPABASE_URL` ที่ container เรียก Kong ของเครื่องเดียวกันได้
