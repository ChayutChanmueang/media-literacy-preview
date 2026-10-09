# แผนปรับปรุงประสิทธิภาพ (Performance Optimization Plan)

**สถานะ:** 📝 ข้อเสนอ — ยังไม่ได้แก้โค้ดใน repo | **วันที่ตรวจ:** 2026-09-28 | **Branch ที่ตรวจ:** `development` (`0785525`, v0.13.0)
**เงื่อนไขหลัก:** ทุกข้อในแผนนี้ต้อง **ไม่เปลี่ยนหน้าตา (visual) และไม่เปลี่ยนการทำงาน (functionality)** ที่ผู้ใช้เห็น — ข้อไหนมีผลข้างเคียงแม้เล็กน้อยจะระบุไว้ชัดในหัวข้อ "ผลต่อ visual / functionality" และข้อที่เปลี่ยนพฤติกรรมจริงถูกแยกไปไว้ที่ [หัวข้อ 5](#5-สิ่งที่ไม่แนะนำในรอบนี้)

---

## 1. สรุปสั้น

อาการ "แอปช้า / หน่วง" มาจาก 3 สาเหตุหลัก เรียงตามน้ำหนัก:

1. **Service Worker (PWA) ดาวน์โหลดไฟล์ล่วงหน้า ~196 MB ต่อเครื่องใหม่** — 170.7 MB ในนั้นเป็นไฟล์ `public/assets/video/StopThinkAskDo_Draft1.mp4` ที่ **ไม่มีโค้ดส่วนไหนอ้างถึงแล้ว** (บทเรียนย้ายไปใช้ YouTube ตั้งแต่ 13–17 ส.ค.) แต่ `next-pwa` ยัง precache ทุกไฟล์ใน `public/` อยู่ การดาวน์โหลดนี้วิ่งเบื้องหลังตอนเปิดแอปครั้งแรก แย่งแบนด์วิดท์กับคลิป YouTube, JS และ API — หนักที่สุดคือหน้างานอบรมที่ผู้สูงอายุหลายสิบเครื่องใช้ Wi-Fi/สัญญาณเดียวกัน
2. **ฐานข้อมูลเป็นคอขวดเมื่อผู้ใช้พร้อมกันหลายคน** — pool ฝั่ง production เปิดได้แค่ **3 connection** (`max: 3`), log แต่ละ event ใช้ **2 query ต่อกัน**, DB อยู่ region **Tokyo** และ request ที่รอ connection เกิน **4 วินาทีจะ error** (ไม่ใช่แค่ช้า) — ผลคือกดจบเกมแล้วค้าง, บันทึกความคืบหน้าหาย, log ไปกองใน offline queue
3. **ทุกหน้า render แบบ dynamic บนเซิร์ฟเวอร์ทุกครั้ง** เพราะ root layout อ่าน `cookies()` และ JS ที่โหลดทุกหน้าพ่วง `zod` + `ua-parser-js` มาด้วยโดยไม่จำเป็น

ถ้าทำแค่ **P0 ทั้ง 3 ข้อ** (แก้ config + ย่อรูป ไม่แตะ logic) precache จะลดจาก ~196 MB เหลือราว **14 MB** และจำนวน connection ที่ API ใช้รับผู้ใช้พร้อมกันจะเพิ่มจาก 3 เป็นราว 10 (ปรับได้ผ่าน env)

### ตารางสรุปข้อเสนอ

| รหัส | เรื่อง | ผลที่คาด | แรงงาน | ความเสี่ยง |
|---|---|---|---|---|
| [P0-1](#p0-1-ตัดไฟล์ที่ไม่ได้ใช้ออกจาก-precache) | ตัดไฟล์ที่ไม่ได้ใช้ออกจาก precache | precache 196 → 18.2 MB (วัดจริง) | 10 นาที | ต่ำมาก |
| [P0-2](#p0-2-ย่อไอคอนที่ใหญ่เกินขนาดที่แสดงจริง) | ย่อไอคอนที่ใหญ่เกินขนาดแสดงจริง | −4.5 MB, ไอคอนหน้าเลือกเกม/หน้าแนะนำเกมขึ้นเร็วขึ้น | 30 นาที | ต่ำมาก |
| [P0-3](#p0-3-ปรับ-db-connection-pool-ให้เหมาะกับ-docker) | ปรับ DB pool ให้เหมาะกับ Docker | ลดคิว/timeout ของ API ตอนคนพร้อมกันเยอะ | 30 นาที | ต่ำ |
| [P1-1](#p1-1-ไม่ต้องรอบันทึกความคืบหน้าก่อนเปลี่ยนหน้าเมื่อจบเกม) | ไม่ต้องรอบันทึก DB ก่อนเปลี่ยนหน้าเมื่อจบเกม | กดจบเกมแล้วไปหน้าคะแนนทันที | 10 นาที | ต่ำ |
| [P1-2](#p1-2-แยก-storage-key-ออก-เพื่อไม่ให้-zod-ติดไปทุกหน้า) | แยก storage key ออก ไม่ให้ `zod` ติดไปทุกหน้า | −13.3 KB gz ต่อหน้า (วัดจริง) | 15 นาที | ต่ำมาก |
| [P1-3](#p1-3-apiaction-logs-ลด-db-round-trip-จาก-2-เหลือ-1) | `/api/action-logs` ลด DB round-trip 2 → 1 | เวลา DB ต่อ log ลดราวครึ่ง | 30 นาที | ต่ำ |
| [P1-4](#p1-4-อุ่นเครื่อง-youtube-ระหว่างหน้าชื่อคลิป) | โหลดสคริปต์ YouTube ระหว่างหน้าชื่อคลิป | คลิปเริ่มเล่นเร็วขึ้นหลังกด "เริ่มชมคลิป" | 30 นาที | ต่ำ |
| [P1-5](#p1-5-ตัด-consolelog-ออกใน-production-build) | ตัด `console.log` ใน production | ลดงาน/หน่วยความจำบนมือถือสเปกต่ำ | 5 นาที | ต่ำมาก |
| [P2-1](#p2-1-ทำ-root-layout-ให้เป็น-static) | ทำ root layout เป็น static | ทุกหน้ายกเว้น `/lessons/[id]/*` กลายเป็น static (ทดลอง build ผ่านแล้ว) | 2–4 ชม. + QA | กลาง |
| [P2-2](#p2-2-lazy-load-ua-parser-js) | Lazy-load `ua-parser-js` | −~12 KB gz ต่อหน้า | 1 ชม. | กลาง |
| [P2-3](#p2-3-ตั้ง-cache-control-ให้รูปใน-public) | ตั้ง `Cache-Control` ให้รูปใน `public/` | ลด request ซ้ำ (เครื่องที่ไม่มี SW) | 15 นาที | ต่ำ |
| [P2-4](#p2-4-บีบอัดรูป-g3-แบบ-lossless-เท่านั้น) | บีบอัดรูป G3 แบบ lossless | −10–30% ของ ~4.8 MB (ประมาณการ) | 30 นาที | ต่ำ |
| [P2-5](#p2-5-โครงสร้างพื้นฐาน-db-region--docker--reverse-proxy) | โครงสร้างพื้นฐาน (DB region / Docker / proxy) | ลด latency ต่อ query, deploy เร็วขึ้น | ต้องวัดก่อน | ต่ำ–กลาง |
| [P2-6](#p2-6-ข้อเล็กน้อย) | ข้อเล็กน้อยอื่น ๆ | เล็กน้อย | — | ต่ำ |

---

## 2. วิธีตรวจและข้อจำกัด

**สิ่งที่ทำ:** อ่านโค้ดทั้ง client/server/config, จากนั้น copy โปรเจกต์ไปไว้ในโฟลเดอร์ชั่วคราวนอก repo แล้วรัน `next build --webpack` + `next start` จริง เพื่อวัด (1) ตาราง route ว่า static/dynamic, (2) ขนาด `<script>` ที่แต่ละหน้าโหลดจริง (gzip), (3) รายการ precache ที่ `next-pwa` สร้าง, (4) header ที่เซิร์ฟเวอร์ส่ง — และทดลองแก้ข้อ P0-1, P1-2, P2-1 ในสำเนานั้นเพื่อยืนยันว่า build ผ่านและได้ผลตามที่อ้าง **repo จริงไม่ถูกแก้ไข**

**ข้อจำกัด (ต้องรู้ก่อนอ่านตัวเลข):**
- ไม่มีข้อมูลจาก production จริง (ไม่มี APM/RUM) — ตัวเลขฝั่ง network/DB ที่เขียนว่า "ประมาณการ" ต้องวัดซ้ำบนเครื่องจริง (มีวิธีวัดใน [หัวข้อ 6](#6-ลำดับการทำและวิธีตรวจสอบ))
- อัตรา log ต่อผู้ใช้คำนวณจาก `docs/analytics/action_logs.csv` (14 sessions, 19 ก.ค. – 7 ส.ค. 2569, ส่วนใหญ่เป็น session ทดสอบ) — ใช้เป็นตัวเลขหยาบเท่านั้น
- ไม่ได้ตรวจ reverse proxy หน้าเครื่อง CAMT, การตั้งค่าบน Vercel และ plan/limit ของ Supabase

---

## 3. ผลการวัด (Baseline)

| รายการ | ค่าปัจจุบัน | ที่มา |
|---|---|---|
| ขนาด precache ของ Service Worker ต่อเครื่องใหม่ | **~196 MB** (137 ไฟล์) — MP4 170.7 MB + รูป ~23 MB + JS ~1.8 MB | `public/sw.js` ที่ build ได้ |
| ไฟล์ใหญ่สุดใน precache (ไม่นับ MP4) | `g3-icon.png` 2.5 MB, `goosl-marbles/thumbnail.png` 1.7 MB, `g1-icon.png` 1.6 MB, รูป AI ของ G3 × 2 ชุดซ้ำ (6 ไฟล์ละ 0.7–1.0 MB) | เดียวกัน |
| ประเภทการ render ของทุกหน้า | **ทุก route เป็น `ƒ (Dynamic)`** | ตาราง route ของ `next build` |
| JS ที่หน้า video / score / questions โหลด | 197.7 KB gz (รวม polyfills 39.5 KB ที่เบราว์เซอร์ใหม่ข้าม) | วัดจาก `<script>` ที่เสิร์ฟจริง |
| JS ที่หน้า `/lessons` โหลด | 203.3 KB gz | เดียวกัน |
| `zod` + `ua-parser-js` ใน bundle ที่ทุกหน้าโหลด | 84 KB raw / 24.6 KB gz (chunk เดียวกัน) | เดียวกัน |
| DB pool (production) | `max: 3`, `idleTimeoutMillis: 15000`, `connectionTimeoutMillis: 4000` | [`src/lib/database.ts:55-60`](../../src/lib/database.ts) |
| DB query ต่อ log 1 event | 2 query ต่อกัน (upsert session แล้ว insert log) | [`src/app/api/action-logs/route.ts:42-62`](../../src/app/api/action-logs/route.ts) |
| Region ของ Supabase pooler | `aws-0-ap-northeast-1` (Tokyo) ตาม `.env.example` — **ต้องยืนยันค่า production** | `.env.example` |
| อัตรา log ต่อผู้ใช้ที่กำลังใช้งาน | median ~12 event/นาที, p90 ~31 event/นาที | `docs/analytics/action_logs.csv` |
| `Cache-Control` ของรูปใน `public/` | `public, max-age=0` (revalidate ทุกครั้ง) | header จาก `next start` |

---

## 4. ข้อเสนอแนะ

### P0 — ทำก่อน: ผลมาก ความเสี่ยงต่ำ ไม่แตะ logic

#### P0-1 ตัดไฟล์ที่ไม่ได้ใช้ออกจาก precache

**ปัญหา:** [`next.config.ts:4-8`](../../next.config.ts) เปิด `@ducanh2912/next-pwa` โดยไม่ตั้ง `publicExcludes` จึง precache **ทุกไฟล์ใน `public/`** ตอน Service Worker ติดตั้ง (ครั้งแรกที่เปิดแอป) — ถ้าดาวน์โหลดไม่ครบ (เน็ตหลุด/พื้นที่เต็ม) การติดตั้ง SW จะล้มและ **เริ่มดาวน์โหลดใหม่ในการเปิดครั้งถัดไป**

ไฟล์ที่ precache ทั้งที่ไม่มีใครใช้:

| ไฟล์ | ขนาด | เหตุผลที่ตัดได้ |
|---|---|---|
| `public/assets/video/StopThinkAskDo_Draft1.mp4` | 170.7 MB | เพิ่มมาใน `902b1c7` (6 ส.ค.) สำหรับคลิปบทที่ 6 ปัจจุบัน `src/data/videos.json` ทุกบทตั้ง `play: "youtube"` และ `s3: ""` — ไม่มีโค้ดอ้างถึงไฟล์นี้ |
| `public/images/g3-q1.png` … `g3-q6.png` | 5.4 MB | **ไบต์ตรงกันทุกไฟล์ (md5 เดียวกัน)** กับ `public/assets/g3-images/ai-generated/*` ที่ G3 ใช้จริง และไม่มีโค้ดอ้างถึง path `images/g3-q*` |
| `public/games/goosl-marbles/thumbnail.png` | 1.7 MB | ใช้เป็น `og:image` ของหน้าเกม (ภาพพรีวิวตอนแชร์ลิงก์) เท่านั้น ไม่ได้แสดงในแอป |
| `public/assets/g3-images/README.md` | 5 KB | เอกสารประกอบ |

**วิธีแก้** (ทดลอง build แล้ว — ไฟล์ข้างบนหายจาก precache ส่วนรูปที่ใช้จริงยังอยู่ครบ):

```ts
// next.config.ts
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  publicExcludes: [
    "!noprecache/**/*", // ค่า default ของ next-pwa — ต้องใส่ซ้ำเพราะเรากำลัง override
    "!assets/video/**/*",
    "!images/g3-q*.png",
    "!games/goosl-marbles/thumbnail.png",
    "!assets/g3-images/README.md",
  ],
});
```

**ขั้นถัดไป (แยก PR, ต้องให้ทีมยืนยันก่อน):** ย้าย MP4 ออกจาก `public/` ไปไว้ที่ object storage (MinIO/S3 ตามที่ `videos.json` รองรับอยู่แล้วผ่าน field `s3`) และลบ `public/images/g3-q*.png` — เพราะ Dockerfile copy `public/` ทั้งโฟลเดอร์ลง image ([`docker/Dockerfile:29`](../../docker/Dockerfile)) ทำให้ image ใหญ่ขึ้น ~176 MB ทุก deploy (ถ้ายังต้องการ MP4 เป็น fallback ตาม [US-CF-44](../agile/user-stories/archives/US-CF-44.md) ให้เก็บไว้ที่ storage แทน)

**ผลต่อ visual / functionality:** ไม่มี — precache เป็นการดาวน์โหลดเบื้องหลังเท่านั้น ไฟล์ที่ตัดไม่มีหน้าจอไหนแสดง เครื่องที่เคยติดตั้ง SW เวอร์ชันเก่าจะลบ cache ที่ไม่อยู่ใน manifest ใหม่ให้เอง (`cleanupOutdatedCaches` เปิดอยู่แล้ว) → คืนพื้นที่เครื่องผู้ใช้ด้วย

**ผลที่วัดได้:** precache **~196 MB → 18.2 MB** (131 ไฟล์)

**วิธีตรวจ:** หลัง build ให้ `grep -o 'url:"[^"]*"' public/sw.js | grep -E "video|g3-q|thumbnail"` ต้องไม่เจอ; ใน Chrome DevTools → Application → Storage ดูขนาดหลังเปิดแอปครั้งแรก

---

#### P0-2 ย่อไอคอนที่ใหญ่เกินขนาดที่แสดงจริง

**ปัญหา:** ไอคอนบางไฟล์มีความละเอียดสูงกว่าที่จอแสดงหลายเท่า — ถูกโหลดทั้งตอนเปิดหน้าเลือกเกม ([`src/app/lessons/page.tsx:86`](../../src/app/lessons/page.tsx) แสดงที่ 60 px) และหน้าแนะนำเกม ([`src/components/GameIntro.tsx:55`](../../src/components/GameIntro.tsx) แสดงที่ 120 px) และถูก precache ด้วย

| ไฟล์ | ขนาดจริง | แสดงที่ (CSS px) | ขนาดไฟล์ | เสนอให้ย่อเป็น |
|---|---|---|---|---|
| `public/assets/icon-game/g3-icon.png` | 1254×1254 | 60 และ 120 | 2.46 MB | 360×360 |
| `public/assets/icon-game/g1-icon.png` | 1254×1254 | 60 และ 120 | 1.57 MB | 360×360 |
| `public/images/lessons/category-fun.png` | 735×764 | 60 | 463 KB | 180×187 (คงสัดส่วนเดิม) |
| `public/images/lessons/category-learning.png` | 640×640 | 60 | 452 KB | 180×180 |
| `public/images/lessons/category-video.png` | 640×640 | 60 | 90 KB | 180×180 |

ขนาดที่เสนอ = 3 เท่าของขนาดแสดงผลที่ใหญ่ที่สุด (รองรับจอ devicePixelRatio 3 ซึ่งเป็นค่าสูงสุดของมือถือทั่วไป) เบราว์เซอร์ย่อรูปลงเหลือเท่านี้ตอนแสดงอยู่แล้ว ภาพบนจอจึงเหมือนเดิม

**วิธีแก้:** ย่อด้วยเครื่องมือที่ใช้ Lanczos (เช่น `npx sharp-cli` หรือ Squoosh) โดย **คงชื่อไฟล์และนามสกุลเดิม** → ไม่ต้องแก้โค้ดเลย (sharp เขียนทับไฟล์ต้นฉบับตรง ๆ ไม่ได้ ให้ออกไปโฟลเดอร์ชั่วคราวก่อน ตรวจภาพ แล้วค่อยย้ายทับ)

```bash
npx sharp-cli -i public/assets/icon-game/g1-icon.png public/assets/icon-game/g3-icon.png -o ./resized/ resize 360 360
npx sharp-cli -i public/images/lessons/category-learning.png public/images/lessons/category-video.png -o ./resized/ resize 180 180
npx sharp-cli -i public/images/lessons/category-fun.png -o ./resized/ resize 180   # กำหนดแค่ความกว้าง = คงสัดส่วนเดิม
```

**ผลต่อ visual / functionality:** ไม่มี (ที่ DPR ≤ 3) — ให้ถ่าย screenshot หน้า `/lessons` (หมวด "เกมเพื่อการเรียนรู้") และหน้าแนะนำ G1/G3 ก่อน-หลังเทียบกัน
**ผลที่คาด:** −~4.5 MB จาก 5.0 MB (ประมาณการ: PNG 360 px ราว 100–250 KB/ไฟล์) → precache รวมราว **14 MB**

---

#### P0-3 ปรับ DB connection pool ให้เหมาะกับ Docker

**ปัญหา:** [`src/lib/database.ts:55-60`](../../src/lib/database.ts) ตั้ง `max: 3` ใน production ซึ่งเหมาะกับ serverless (Vercel มีหลาย instance) แต่บน Docker/Portainer มี **process เดียวรับผู้ใช้ทุกคนด้วย 3 connection**

- `pg-pool` จะ **ตัด request ที่รอคิวเกิน `connectionTimeoutMillis` (4 วินาที)** ด้วย error `timeout exceeded when trying to connect` (ดู `node_modules/pg-pool/index.js:216-225`) → API ตอบ 500 → log ไปเข้า offline queue แล้ว sync ซ้ำทีหลัง (โหลดเพิ่ม) และ `saveLessonProgress` ที่ล้มจะถูกกลืนเงียบ ๆ
- `idleTimeoutMillis: 15000` → ว่างเกิน 15 วินาที connection ถูกปิด request ถัดไปต้องเปิด TCP + TLS + auth ใหม่ไป Tokyo (หลาย round-trip) → เกิด latency spike เป็นช่วง ๆ
- ประมาณการ: ผู้ใช้ 50 คนพร้อมกัน × ~12 event/นาที = ~10 request/วินาที × 2 query ต่อ request — ถ้า round-trip ไป Tokyo ~70–100 ms (**ต้องวัด**) connection 3 เส้นรับได้ราว 15–20 log/วินาที ช่วงที่ทุกคนกดพร้อมกัน (ผู้ดำเนินกิจกรรมสั่ง "กดต่อไป") จึงเกินได้ง่าย

**วิธีแก้:** ให้ปรับผ่าน env ได้ โดย **ค่า default เท่าเดิม** (Vercel ไม่เปลี่ยน) แล้วตั้งค่าที่เหมาะใน Portainer

```ts
// src/lib/database.ts
function intFromEnv(name: string, fallback: number, min = 0): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= min ? value : fallback;
}

function createDatabasePool(): pg.Pool {
  const isProduction = process.env.NODE_ENV === "production";
  const pool = new pg.Pool({
    connectionString: getConnectionString(),
    max: intFromEnv("DB_POOL_MAX", isProduction ? 3 : 10, 1),
    min: intFromEnv("DB_POOL_MIN", 0),
    idleTimeoutMillis: intFromEnv("DB_POOL_IDLE_MS", isProduction ? 15_000 : 30_000),
    connectionTimeoutMillis: intFromEnv("DB_POOL_CONNECT_TIMEOUT_MS", isProduction ? 4_000 : 3_000, 1),
  });
  // ...
}
```

```yaml
# docker/docker-compose.portainer.yml → environment (ค่าเริ่มต้นที่แนะนำ ปรับตามผล load test)
- DB_POOL_MAX=${DB_POOL_MAX:-10}
- DB_POOL_MIN=${DB_POOL_MIN:-2}
- DB_POOL_IDLE_MS=${DB_POOL_IDLE_MS:-60000}
```

หมายเหตุ: `min` ของ `pg-pool` ไม่ได้เปิด connection ล่วงหน้า แต่จะ **ไม่ปิด connection ที่ว่างจนเหลือต่ำกว่าค่านี้** — จึงช่วยตัด latency spike จากการ handshake ใหม่หลังช่วงเงียบ
ต้องเช็คว่าจำนวน client ของ Supabase transaction pooler (port 6543) ตาม plan ที่ใช้รับได้ (โดยทั่วไปหลักร้อย — 10 เส้นเหลือเฟือ) และอย่าลืมบวกของ Vercel ถ้าใช้ DB เดียวกัน

**ผลต่อ visual / functionality:** ไม่มี — เปลี่ยนแค่ความจุ/คิว (และ error 500 ตอนคนเยอะจะลดลง ซึ่งเป็นพฤติกรรมที่ควรเป็นอยู่แล้ว)
**วิธีตรวจ:** load test `/api/action-logs` บน staging ก่อน-หลัง (ดู [หัวข้อ 6](#6-ลำดับการทำและวิธีตรวจสอบ)) เทียบ p95 latency และอัตรา error

---

### P1 — แก้โค้ดเล็กน้อย ความเสี่ยงต่ำ

#### P1-1 ไม่ต้องรอบันทึกความคืบหน้าก่อนเปลี่ยนหน้าเมื่อจบเกม

**ปัญหา:** [`src/app/lessons/[id]/game/page.tsx:92-102`](../../src/app/lessons/[id]/game/page.tsx) `await apiClient.saveLessonProgress(...)` **ก่อน** `router.push` ไปหน้าคะแนน ผู้ใช้จึงต้องรอ network + DB (+ คิวของ P0-3 ซึ่งอาจนานถึง 4 วินาทีแล้วล้ม) หลังกดจบเกมทุกครั้ง ขณะที่หน้าคลิปเรียก API ตัวเดียวกันแบบไม่รอผลอยู่แล้ว ([`video/page.tsx:36-40`](../../src/app/lessons/[id]/video/page.tsx), `:224-228`)

**วิธีแก้:** ยิงแบบไม่รอ (fire-and-forget) โดยคง error handling เดิม

```ts
// บันทึกดาว + ความคืบหน้าเกมลง DB (เกมจบแล้ว) — ไม่รอผลเพื่อให้ไปหน้าคะแนนได้ทันที เหมือนหน้าคลิป
apiClient
  .saveLessonProgress(sessionId, lessonId, undefined, new Date().toISOString())
  .catch((err) => {
    console.error("[GameShell] Network error saving progress, local caching covers this:", err);
  });
```

(เสริม ไม่บังคับ) ใส่ `keepalive: true` ใน `fetch` ของ `apiClient.post` ([`src/services/apiClient.ts:9`](../../src/services/apiClient.ts)) เพื่อให้ request ยังส่งต่อได้แม้ผู้ใช้ปิดแท็บทันที (body ของแอปนี้เล็กกว่าเพดาน 64 KB ของ keepalive)

**ผลต่อ visual / functionality:** request และข้อมูลที่บันทึกเหมือนเดิมทุกไบต์ ไม่มีโค้ดส่วนไหนใช้ผลลัพธ์ของ request นี้ และแอปเป็น SPA (`router.push`) request จึงวิ่งต่อหลังเปลี่ยนหน้า สิ่งที่เปลี่ยนมีแค่ผู้ใช้ไม่ต้องรอ

---

#### P1-2 แยก storage key ออก เพื่อไม่ให้ `zod` ติดไปทุกหน้า

**ปัญหา:** [`src/services/progressService.ts:7-8`](../../src/services/progressService.ts) import ค่าคงที่ string 2 ตัว (`LEADERBOARD_PLAYER_KEY`, `LEADERBOARD_PENDING_SCORE_KEY`) มาจาก `leaderboardPlayerService` / `leaderboardScoreService` ซึ่ง import `zod` — และ `progressService` ถูกใช้ใน `AppLayout` (root layout) ทำให้ **`zod` ทั้งไลบรารีติดไปกับทุกหน้า** แม้หน้าส่วนใหญ่ไม่ได้ validate อะไรเลย

**วิธีแก้:** ย้ายค่าคงที่ไปไฟล์ที่ไม่มี dependency แล้ว re-export จากที่เดิม (test และโค้ดอื่นที่ import จาก service เดิมยังใช้ได้)

```ts
// src/services/storageKeys.ts (ไฟล์ใหม่ — ห้าม import อะไรที่หนัก)
export const LEADERBOARD_PLAYER_KEY = "naplab_ml_leaderboard_player";
export const LEADERBOARD_PENDING_SCORE_KEY = "naplab_ml_leaderboard_pending_score";
```

```ts
// src/services/progressService.ts
import { LEADERBOARD_PLAYER_KEY, LEADERBOARD_PENDING_SCORE_KEY } from "./storageKeys";

// src/services/leaderboardPlayerService.ts (แทนบรรทัด export const เดิม)
import { LEADERBOARD_PLAYER_KEY } from "./storageKeys";
export { LEADERBOARD_PLAYER_KEY };

// src/services/leaderboardScoreService.ts (แทนบรรทัด export const เดิม)
import { LEADERBOARD_PENDING_SCORE_KEY } from "./storageKeys";
export { LEADERBOARD_PENDING_SCORE_KEY };
```

**ผลที่วัดได้ (ทดลอง build แล้ว):**

| หน้า | ก่อน | หลัง |
|---|---|---|
| `/lessons/[id]/video`, `/score`, `/self-assessment/*/questions` | 197.7 KB gz | **184.4 KB gz** (−13.3) |
| `/lessons` | 203.3 KB gz | **192.7 KB gz** (−10.6) |
| `/` | 205.6 KB gz | **195.0 KB gz** (−10.6) |

`zod` (12.8 KB gz) ไปโหลดเฉพาะหน้าที่ใช้จริง (leaderboard, certificate, game)

**ผลต่อ visual / functionality:** ไม่มี — ค่าของ key เหมือนเดิมทุกตัวอักษร (ข้อมูลใน localStorage/sessionStorage ของผู้ใช้เดิมยังอ่านได้)

---

#### P1-3 `/api/action-logs` ลด DB round-trip จาก 2 เหลือ 1

**ปัญหา:** [`src/app/api/action-logs/route.ts:42-62`](../../src/app/api/action-logs/route.ts) ทุก event ทำ `INSERT INTO sessions ... ON CONFLICT DO NOTHING` แล้วค่อย `INSERT INTO action_logs` — 2 round-trip ไป DB ต่อ event (~12 ครั้ง/นาที/ผู้ใช้) และถือ connection จาก pool ที่มีแค่ 3 เส้นนานเป็น 2 เท่า

**วิธีแก้:** รวมเป็น statement เดียวด้วย data-modifying CTE (FK ของ `action_logs` ถูกตรวจตอนจบ statement จึงเห็นแถว session ที่ CTE เพิ่งใส่)

```ts
const validSessionId = session_id && isUuid(session_id) ? session_id : null;

const result = await pool.query(
  `WITH ensure_session AS (
     INSERT INTO sessions (id, age_range, role, location_consent, created_at)
     SELECT $1::uuid, 'unknown', 'elder', false, NOW()
     WHERE $1::uuid IS NOT NULL
     ON CONFLICT (id) DO NOTHING
   )
   INSERT INTO action_logs (session_id, event_name, page_url, payload, created_at)
   VALUES ($1::uuid, $2, $3, $4, NOW())
   RETURNING *;`,
  [validSessionId, event_name, page_url || null, payload ? JSON.stringify(payload) : null],
);
```

คง `RETURNING *` และรูปแบบ response `{ success: true, log }` ไว้เหมือนเดิม เพื่อไม่ให้ API contract เปลี่ยน (ฝั่ง client ไม่ได้อ่านค่า `log` — ถ้าอยากลด payload ขากลับค่อยตัดเป็น `RETURNING id, created_at` ใน PR แยก)
ใช้ pattern เดียวกันกับ `/api/page-views` ได้ (แต่ตอนนี้ไม่มี client เรียก `logPageView` จึงไม่เร่ง)

**ผลต่อ visual / functionality:** ข้อมูลที่ลง DB เหมือนเดิม (ค่า default ของ session, `created_at = NOW()` ฝั่งเซิร์ฟเวอร์)
**วิธีตรวจ:** บน staging ทดสอบ 3 กรณี — session ยังไม่มีใน DB, มีแล้ว, `session_id` ไม่ใช่ UUID (ต้องได้ `session_id = NULL` เหมือนเดิม)

---

#### P1-4 อุ่นเครื่อง YouTube ระหว่างหน้าชื่อคลิป

**ปัญหา:** ในโหมด Flow หน้าคลิปแสดง "หน้าชื่อคลิป" ([`video/page.tsx:341-358`](../../src/app/lessons/[id]/video/page.tsx)) นานสูงสุด 15 วินาทีก่อนเล่น แต่สคริปต์ `https://www.youtube.com/iframe_api` เพิ่งถูกใส่เมื่อ `phase === "video"` ([`:79-116`](../../src/app/lessons/[id]/video/page.tsx)) — ผู้ใช้กด "เริ่มชมคลิป" แล้วต้องรอ DNS + TLS + โหลดสคริปต์ + โหลด iframe ต่อกันทั้งหมด

**วิธีแก้:** แยกการ "โหลดสคริปต์" ออกเป็น effect ของตัวเองที่ทำงานตั้งแต่ mount (เมื่อไม่ใช่ `skipped` และไม่ใช่ MP4) ส่วนการสร้าง `YT.Player` ยังทำตอน `phase === "video"` เหมือนเดิม — โค้ดเดิมรองรับกรณีสคริปต์โหลดไว้แล้ว/กำลังโหลดอยู่แล้ว (เช็ค `window.YT` ที่บรรทัด 105 และ `window.YT.Player` / `onYouTubeIframeAPIReady` ที่บรรทัด 237-241)

```tsx
import { preconnect } from "react-dom";

// โหลดสคริปต์ YouTube ล่วงหน้าตั้งแต่หน้าชื่อคลิป (ยังไม่สร้าง player)
useEffect(() => {
  if (skipped || videoSrc || typeof window === "undefined" || window.YT !== undefined) return;
  preconnect("https://www.youtube.com");
  preconnect("https://i.ytimg.com");
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}, [skipped, videoSrc]);
```

แล้วลบส่วน inject สคริปต์ (บรรทัด 104-116) ออกจาก effect เดิม

(เสริม) ระหว่างดูคลิป สั่ง `import("@/components/G1FactCheck")` (ตาม lessonId) เพื่อให้ chunk ของเกมพร้อมก่อนเข้าหน้าเกม — ผลน้อยกว่าเพราะ SW precache JS ทุก chunk ไว้แล้ว มีประโยชน์กับเครื่องที่ยังไม่มี SW (เช่น เปิดครั้งแรก)

**ผลต่อ visual / functionality:** ไม่มี — โหลดเบื้องหลังเท่านั้น หน้าชื่อคลิปและลำดับ event (`enter_video`, ตัวจับเวลา 7 วินาทีของปุ่ม "ข้าม") ยังเริ่มที่ `phase === "video"` เหมือนเดิม

---

#### P1-5 ตัด `console.log` ออกใน production build

**ปัญหา:** [`src/services/loggingService.ts:52`](../../src/services/loggingService.ts) พิมพ์ object ของทุก event ลง console (~12 ครั้ง/นาที) เบราว์เซอร์เก็บ object ที่ถูก log ค้างไว้ใน buffer ของ console แม้ไม่ได้เปิด DevTools → เปลืองหน่วยความจำบนมือถือสเปกต่ำตลอด session

**วิธีแก้:** ให้ SWC ตัดตอน build เฉพาะ production โดยเก็บ `console.error` / `console.warn` ไว้

```ts
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // ...
};
```

**ผลต่อ visual / functionality:** ไม่มี — กระทบแค่ข้อความ debug ใน console ของ production (dev ยังเห็นครบ)

---

### P2 — ทำเมื่อมีเวลา / ต้อง QA มากขึ้น

#### P2-1 ทำ root layout ให้เป็น static

**ปัญหา:** [`src/app/layout.tsx:28-30`](../../src/app/layout.tsx) เรียก `cookies()` ทำให้ **ทุก route เป็น dynamic** — เซิร์ฟเวอร์ต้อง render HTML/RSC ใหม่ทุก request และ router ของ Next.js prefetch/cache หน้าล่วงหน้าไม่ได้ ทั้งที่
- theme ถูก hardcode เป็น `purple` แล้ว (cookie `naplab_ml_session` ที่อ่านมาไม่ได้ใช้)
- cookie `naplab_ml_size` ไม่มีโค้ดไหนตั้งค่าแล้ว (UI ปุ่มขนาดฟอนต์ถูกซ่อนตาม US-CF-01 — `AppLayout.tsx:110,132` มีแต่ลบ) จะมีค่าเฉพาะเครื่องที่เคยตั้งไว้สมัยก่อน

**วิธีแก้ (ทดลอง build ผ่านแล้ว):**
1. เลิกอ่าน `cookies()` ใน layout แล้วตั้ง `data-size` ด้วย inline script เล็ก ๆ ใน `<head>` ซึ่งรัน **ก่อน paint ครั้งแรก** — เครื่องที่ยังมี cookie ขนาดฟอนต์เดิมจึงเห็นขนาดเดิมโดยไม่กระพริบ
2. ใส่ `suppressHydrationWarning` ที่ `<html>` (เฉพาะ attribute ของ element นี้)
3. หน้า score ([`src/app/lessons/[id]/score/page.tsx:16-18`](../../src/app/lessons/[id]/score/page.tsx)) ใช้ `useSearchParams()` ซึ่งหน้า static บังคับต้องมี `<Suspense>` — เพื่อให้ paint แรกเหมือนเดิม แนะนำให้อ่าน `next` จาก `window.location.search` ตอนกดปุ่มแทน (การ์ดคะแนนไม่ได้ขึ้นกับค่านี้) แทนการห่อ Suspense ที่ fallback ว่าง

```tsx
// src/app/layout.tsx
const SIZE_BOOTSTRAP = `try{var m=document.cookie.match(/(?:^|; )naplab_ml_size=([^;]*)/);if(m&&m[1])document.documentElement.setAttribute("data-size",decodeURIComponent(m[1]))}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = "purple";
  const size = "normal";
  return (
    <html lang="th" data-theme={theme} data-size={size} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SIZE_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex justify-center bg-[#f8fafc]">
        <AppLayout initialTheme={theme} initialSize={size}>{children}</AppLayout>
      </body>
    </html>
  );
}
```

**ผลที่วัดได้:** `/`, `/consent`, `/consent/location`, `/lessons`, `/lessons/complete`, `/pretest`, `/posttest`, `/certificate`, `/facilitator` และ `/self-assessment/*` กลายเป็น static (เสิร์ฟ HTML ที่ render ไว้แล้ว) — `/lessons/[id]/*` ยังเป็น dynamic; ถ้าต้องการให้ static ด้วย ให้เพิ่ม server `layout.tsx` ที่มี `generateStaticParams()` คืน lesson id ที่รู้ (`topic-1`…`topic-6`, `flow-g13`) โดย **ไม่ตั้ง** `dynamicParams = false` (id อื่นยัง render ได้เหมือนเดิม)

**ทำไมเป็น P2:** ได้ผลดี แต่แตะ root ของทุกหน้า — `proxy.ts` (guard redirect) ยังทำงานกับหน้า static ตามปกติ แต่ต้อง QA ทั้ง flow บน LINE in-app browser, ทดสอบเครื่องที่มี cookie `naplab_ml_size=large` ค้าง และทดสอบ guard ของ research mode (pretest/posttest) ให้ครบ

---

#### P2-2 Lazy-load `ua-parser-js`

**ปัญหา:** [`progressService.ts:6`](../../src/services/progressService.ts) import `UAParser` แบบ static → ~12 KB gz ติดไปทุกหน้า ทั้งที่ใช้แค่ตอนสร้าง session ครั้งแรกของเครื่อง (`getDeviceMetadata`)
**วิธีแก้:** เปลี่ยนเป็น `await import("ua-parser-js")` ตอนต้องสร้าง metadata แล้วบันทึกเพิ่มลง session เมื่อได้ผล
**ข้อควรระวัง (จึงเป็น P2):** `getOrCreateSession()` เป็นฟังก์ชัน sync — session ใหม่จะมี `deviceMetadata` ช้าลงหลายสิบ ms การ sync ขึ้น DB เกิดหลังผู้ใช้ยินยอม (`consentGiven && ageGroup`) ซึ่งตอนนั้น metadata พร้อมแล้ว ข้อมูลใน DB จึงควรเหมือนเดิม แต่ **ต้องยืนยันด้วยการตรวจคอลัมน์ `sessions.device_metadata` ของ session ใหม่บน staging**

---

#### P2-3 ตั้ง `Cache-Control` ให้รูปใน `public/`

**ปัญหา:** Next.js เสิร์ฟไฟล์ใน `public/` ด้วย `Cache-Control: public, max-age=0` (วัดจริง) เครื่องที่ไม่มี Service Worker (เช่น in-app browser บางรุ่น) ต้องถามเซิร์ฟเวอร์ซ้ำทุกครั้ง
**วิธีแก้:**

```ts
// next.config.ts → nextConfig
async headers() {
  return [
    { source: "/assets/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
  ];
},
```

**ห้าม** ตั้งกับ `/sw.js` (ต้องคง `max-age=0` เพื่อให้อัปเดต SW ได้)
**ข้อควรระวัง:** ถ้าเปลี่ยนรูปโดยใช้ชื่อไฟล์เดิม เครื่องผู้ใช้อาจเห็นรูปเก่าได้ถึง 1 วัน (ปัจจุบัน SW ก็เสิร์ฟแบบ stale-while-revalidate อายุ 30 วันอยู่แล้ว จึงไม่ได้แย่ลงจากเดิม) — ถ้าจะเปลี่ยนรูปสำคัญให้เปลี่ยนชื่อไฟล์

---

#### P2-4 บีบอัดรูป G3 แบบ lossless เท่านั้น

- `public/assets/g3-images/real-photo/*.png` และ `edited-composite/*.png` (12 ไฟล์, 520–624 px, รวม ~4.8 MB) → บีบแบบ **lossless** (เช่น `oxipng -o 4`) ได้ pixel เดิมทุกจุด คาดว่าเล็กลง 10–30% (ประมาณการ) โดยไม่ต้องแก้ path
- ⚠️ `public/assets/g3-images/ai-generated/*.png` จริง ๆ เป็นไฟล์ **JPEG** 1024×1024 คุณภาพสูง (0.7–1.0 MB) — **ห้ามบีบแบบ lossy** เพราะเกม G3 ให้ผู้เล่นสังเกต "ร่องรอย AI" ในภาพ การบีบซ้ำอาจเพิ่ม/ลบ artifact ซึ่งเท่ากับเปลี่ยนเนื้อหาเกม ถ้าจะลดขนาดต้องให้ทีมเนื้อหาอนุมัติก่อน

---

#### P2-5 โครงสร้างพื้นฐาน (DB region / Docker / reverse proxy)

1. **วัด round-trip ไป DB จากเครื่องแม่ข่ายจริงก่อนตัดสินใจ** (รันใน container production):
   ```bash
   node -e "const pg=require('pg');const p=new pg.Pool({connectionString:process.env.DATABASE_URL});(async()=>{await p.query('select 1');const t=[];for(let i=0;i<20;i++){const s=performance.now();await p.query('select 1');t.push(performance.now()-s)}t.sort((a,b)=>a-b);console.log('median ms',t[10].toFixed(1),'p90 ms',t[18].toFixed(1));await p.end()})()"
   ```
   ถ้า median สูงกว่า ~50 ms ให้พิจารณาย้าย Supabase project ไป `ap-southeast-1` (Singapore) ซึ่งใกล้ไทยกว่า Tokyo — เป็นงาน migration ใหญ่ แต่ไม่ต้องแก้โค้ด
2. **Docker image:** ตั้ง `output: "standalone"` แล้ว copy แค่ `.next/standalone`, `.next/static`, `public` แทน `node_modules` ทั้งก้อน (ตอนนี้ติด devDependencies อย่าง Playwright/Vitest ไปด้วย — [`docker/Dockerfile:31`](../../docker/Dockerfile)), ใช้ `npm ci` แทน `npm install` และรัน `node server.js` แทน `npm run start` → image เล็กลง deploy/restart เร็วขึ้น ใช้ RAM น้อยลง (ไม่ได้ลด latency ต่อ request โดยตรง)
3. **Reverse proxy หน้าเครื่อง CAMT:** ยืนยันว่าเปิด HTTP/2 และ keep-alive และไม่บีบอัดซ้ำกับ Next.js (Next บีบ gzip ให้แล้ว) — รายงานนี้ไม่ได้เข้าถึง proxy ตัวนี้

---

#### P2-6 ข้อเล็กน้อย

- `LeaderboardGamePicker` ถูก import แบบ static ใน `AppLayout` ([`AppLayout.tsx:8`](../../src/components/AppLayout.tsx)) แต่แสดงเฉพาะตอนเปิดจากเมนู → เปลี่ยนเป็น `next/dynamic` ได้ (ประหยัดไม่กี่ KB)
- `import pkg from "../../package.json"` ([`AppLayout.tsx:10`](../../src/components/AppLayout.tsx)) ฝัง package.json ทั้งไฟล์ลง bundle เพื่อใช้แค่เลขเวอร์ชัน → เปลี่ยนเป็น `NEXT_PUBLIC_APP_VERSION` ที่ตั้งตอน build (ประหยัด ~1 KB)
- `/api/quiz-questions` query DB ทุกครั้งที่เปิดแบบทดสอบ → cache ในหน่วยความจำได้ แต่ **ถ้าแก้คำถามใน DB จะเห็นผลช้าไปตาม TTL** — ทำเฉพาะเมื่อทีมยอมรับข้อนี้ได้

---

## 5. สิ่งที่ไม่แนะนำในรอบนี้

ข้อต่อไปนี้ช่วยเรื่องความเร็วได้ แต่ **เปลี่ยน functionality, visual หรือความหมายของข้อมูลวิจัย** จึงไม่อยู่ในแผนนี้ ถ้าจะทำต้องให้ทีมตัดสินใจก่อน:

| ข้อเสนอ | เหตุผลที่ยังไม่ควรทำ |
|---|---|
| รวม log หลาย event แล้วส่งทีเดียว (batching) | เซิร์ฟเวอร์บันทึก `created_at = NOW()` ([`action-logs/route.ts:53`](../../src/app/api/action-logs/route.ts)) ถ้า batch เวลาใน DB จะเลื่อนไปตามรอบการส่ง → **ข้อมูลเวลาที่ทีมวิจัยใช้วิเคราะห์เปลี่ยน** ทำได้เฉพาะเมื่อตกลงใช้ `created_at` จากฝั่ง client ที่ส่งมาอยู่แล้ว ([`loggingService.ts:49`](../../src/services/loggingService.ts)) |
| ตัดรูปที่ใช้จริง (G3, ไอติม G13) ออกจาก precache | ลดการโหลดครั้งแรกได้อีกหลาย MB แต่เปลี่ยนพฤติกรรม offline และทำให้รูป G3 โหลดช้าลงตอนเล่นครั้งแรก (ถ้าเลือกทำ ให้ preload 6 รูปของรอบตอน G3 mount) |
| ลด devicePixelRatio ของ canvas G13 (3 → 2), ถอด animation / `backdrop-filter` | ภาพ/การเคลื่อนไหวเปลี่ยนที่ตาเห็นได้ |
| บีบรูป AI ของ G3 แบบ lossy | เปลี่ยนเนื้อหาเกม (ดู P2-4) |

---

## 6. ลำดับการทำและวิธีตรวจสอบ

**ลำดับ PR ที่แนะนำ** (แยก commit ตามงาน ตามกติกาใน `AGENT.md`):

1. **PR-1 (assets + PWA config):** P0-1 + P0-2 → deploy แล้ววัดขนาด storage/เวลาเปิดครั้งแรกทันที (น่าจะเห็นผลชัดที่สุด)
2. **PR-2 (DB pool):** P0-3 + ตั้ง env ใน Portainer → load test ก่อน-หลัง
3. **PR-3 (client/server เล็ก ๆ):** P1-1 ถึง P1-5
4. **PR-4 (static layout):** P2-1 พร้อม QA เต็ม flow บน LINE in-app browser
5. P2 ที่เหลือตามเวลาที่มี

**Checklist ตรวจสอบทุก PR:**

- [ ] **Visual:** ถ่าย screenshot หน้าหลักก่อน-หลังด้วย Playwright (ต่อยอดจาก `src/tests/e2e/journey.spec.ts`) แล้ว diff — landing, consent, lessons (ทุก sub-page), หน้าชื่อคลิป, หน้าแนะนำ G1/G3/G6, หน้าคะแนน
- [ ] **Functionality:** `npm test`, `npm run test:e2e`, `npx tsc --noEmit`, `npm run lint` และเล่นจริงบน LINE in-app browser (Android) ครบ flow: landing → consent → lessons → คลิป → เกม → คะแนน → บทถัดไป → จบ
- [ ] **ข้อมูล:** ตรวจว่า `action_logs`, `lesson_progress`, `sessions` ของ session ทดสอบมีครบเหมือนก่อนแก้
- [ ] **ขนาด/ความเร็ว:** `next build --webpack` ดูตาราง route (○ / ƒ), DevTools → Network (Slow 4G, Disable cache) ดู "transferred" ตอนเปิดครั้งแรก, Application → Storage หลัง SW ติดตั้ง, Lighthouse (mobile)
- [ ] **Load test (PR-2, PR-3):** บน staging เช่น `npx autocannon -c 20 -d 60 -m POST -H "content-type: application/json" -b '{"session_id":"<uuid>","event_name":"perf_test","page_url":"/perf"}' https://<staging>/api/action-logs` เทียบ p95 latency และจำนวน non-2xx ก่อน-หลัง (ใช้ `event_name` เฉพาะ แล้วลบแถวทดสอบออกหลังจบ เพื่อไม่ปนข้อมูลวิจัย)

---

## ภาคผนวก — ไฟล์/บรรทัดที่อ้างถึง

| ไฟล์ | เรื่อง |
|---|---|
| [`next.config.ts`](../../next.config.ts) | PWA precache (P0-1), removeConsole (P1-5), headers (P2-3) |
| [`src/lib/database.ts`](../../src/lib/database.ts) | DB pool (P0-3) |
| [`src/app/lessons/[id]/game/page.tsx`](../../src/app/lessons/[id]/game/page.tsx) | await ก่อนเปลี่ยนหน้า (P1-1) |
| [`src/services/progressService.ts`](../../src/services/progressService.ts) | import ที่ลาก zod / ua-parser (P1-2, P2-2) |
| [`src/app/api/action-logs/route.ts`](../../src/app/api/action-logs/route.ts) | 2 query ต่อ event (P1-3) |
| [`src/app/lessons/[id]/video/page.tsx`](../../src/app/lessons/[id]/video/page.tsx) | โหลดสคริปต์ YouTube (P1-4) |
| [`src/services/loggingService.ts`](../../src/services/loggingService.ts) | console.log ต่อ event (P1-5) |
| [`src/app/layout.tsx`](../../src/app/layout.tsx), [`src/app/lessons/[id]/score/page.tsx`](../../src/app/lessons/[id]/score/page.tsx) | dynamic rendering (P2-1) |
| [`docker/Dockerfile`](../../docker/Dockerfile), [`docker/docker-compose.portainer.yml`](../../docker/docker-compose.portainer.yml) | image / env ของ pool (P0-3, P2-5) |
