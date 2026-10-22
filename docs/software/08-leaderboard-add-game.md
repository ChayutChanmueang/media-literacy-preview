# 08 — คู่มือเพิ่มเกมเข้า Leaderboard (สำหรับ dev / AI agent)

> **อ่านก่อนเริ่ม:** ตอนนี้ G13 และ G18–G20K ต่อ Leaderboard บนฐานข้อมูลครบทุกจุด (G13 ยังเป็นกรณีพิเศษที่เขียนเช็ค `FLOW_G13_ID` ตรงๆ ใน `handleFinishGame`) ถ้าเพิ่มแค่ปุ่มในหน้าเลือกเกม จะได้กระดานเปล่าที่ไม่มีใครส่งคะแนนได้ เอกสารนี้รวบรวมทุกจุดที่ต้องแตะ
>
> สเปกตาราง `game_id` และ `player_info` อยู่ที่ [03 — Data Schema](./03-data-schema.md) · DDL อยู่ที่ [`docs/supabase-schema.sql`](../supabase-schema.sql) · user story หลัก: [US-CF-50](../agile/user-stories/US-CF-50.md) (Leaderboard แยกตามเกม), [US-CF-52](../agile/user-stories/US-CF-52.md) (popup เลือกเกม)

---

## 1. ภาพรวมการไหลของคะแนน

```
เกม (component)
  └─ onFinish(stars, score?)                       ← เกมต้องส่ง score มาเป็น argument ที่ 2
       ▼
src/app/lessons/[id]/game/page.tsx  handleFinishGame()
  ├─ leaderboardScoreService.savePendingScore(gid, score)   → sessionStorage (มีได้ทีละ 1 คะแนน)
  └─ setScorePrompt(...) → <SaveScorePopup> "เก็บคะแนนไหม?"
       ├─ ใช่ → /lessons/[id]/leaderboard?step=save    (หน้ากรอกชื่อ)
       └─ ไม่ → ลบ pending score → /lessons/[id]/leaderboard?skipped=1
       ▼
src/app/lessons/[id]/leaderboard/page.tsx  loadLeaderboard()
  ├─ localOnly ? localLeaderboardService.saveScore()          → localStorage
  │            : apiClient.saveGameResult() → POST /api/game-results → INSERT player_info
  └─ localOnly ? localLeaderboardService.getLeaderboard()
               : apiClient.getLeaderboard() → GET /api/leaderboard?gid=…   → SELECT player_info + game_id
       ▼
ปุ่ม "กดเพื่อเสร็จสิ้น" → handleFinishFunGame() → /lessons (โหมดอิสระ) หรือ /lessons/complete (Flow)

เมนู ☰ "กระดานคะแนน" (AppLayout) / ปุ่ม "เลือกเกม" (หน้า browse)
  └─ <LeaderboardGamePicker> → GET /api/leaderboard/games (เกม DB) + LOCAL_GAMES (เกม localOnly)
       └─ /lessons/[lessonId]/leaderboard?view=browse
```

Leaderboard มี 2 แบบ ตั้งค่าใน `src/lib/leaderboard.ts`

| แบบ | เก็บคะแนนที่ | ชื่อเกมมาจาก | ใช้กับ |
|---|---|---|---|
| **DB** (`LEADERBOARD_GAMES`) | ตาราง `player_info` (ทุกเครื่องเห็นร่วมกัน) | `game_id.name` ใน DB **เท่านั้น** | G13, G18, G19, G20 (+ G20K ใช้กระดาน G20) |
| **localOnly** (`LOCAL_LEADERBOARD_GAMES`) | `localStorage` ของเครื่องผู้เล่น (`naplab_ml_local_leaderboard`) | field `name` ใน config | ตอนนี้ไม่มี (เก็บกลไกไว้สำหรับเกมทดลอง) |

---

## 2. สถานะปัจจุบันของแต่ละเกม

| เกม | lessonId | แถวใน `game_id` | config ใน `leaderboard.ts` | เกมส่ง `score` มาไหม | เปิดถามเก็บคะแนนไหม | อยู่ใน popup เลือกเกมไหม |
|---|---|---|---|---|---|---|
| G13 ต่อไอติมฝึกสมอง | `flow-g13` | ✓ | DB + `MAX_SCORE` 500 | ✓ (ส่งเป็น argument **ที่ 1**, ดูข้อ 5.1) | ✓ (เขียนเช็ค G13 ตรงๆ) | ✓ |
| G1, G2, G3, G5, G6 | `topic-1/2/3/5/6` | ✓ | DB + `MAX_SCORE` 1,000 | ✗ ส่งแค่ดาว | ✗ | ✗ |
| G15, G16, G17 | `g15/g16/g17` | ✓ | ✗ ไม่มี | ✗ ส่งแค่ดาว | ✗ | ✗ |
| G18, G19, G20 | `g18/g19/g20` | ✓ | DB + `MAX_SCORE` 100 / 20,000 / 15 | ✓ (`bestRef.current`) | ✓ (เงื่อนไขกลาง `leaderboardGame && score`) | ✓ |
| G20K (อีกรุ่นของ G20) | `g20k` | ใช้แถว `G20` | DB `gid: "G20"` (กระดานเดียวกับ G20) | ✓ | ✓ | ✗ (เปิดผ่าน G20 อยู่แล้ว) |

> ทุก DB ที่แอปต่อ (Supabase cloud และ self-host ทุกเครื่อง) มีแถว `game_id` ครบ G1–G20 แล้ว (ไม่มี G4, G7–G12, G14) ข้อมูล ณ 2026-10-21 · ถ้าเพิ่มเกมใหม่ ต้องใส่แถวให้ **ครบทุก DB**

---

## 3. Checklist — ย้ายเกม localOnly ไปใช้ DB

> ทำแล้วกับ G18, G19, G20, G20K (2026-10-21) — ข้อ 3–4 (เงื่อนไข popup และปุ่มจบ) แก้เป็นแบบกลางแล้ว เกมที่ย้ายต่อจากนี้ไม่ต้องแก้สองจุดนี้อีก

เกมกลุ่มนี้ส่งคะแนนและมี popup อยู่แล้ว จึงเป็นงานที่เล็กที่สุด

1. **DB** — ตรวจว่ามีแถวใน `game_id` ของ **ทุก** DB (ดูข้อ 7.1) ตอนนี้มีครบแล้ว
2. **`src/lib/leaderboard.ts`**
   - ย้าย entry จาก `LOCAL_LEADERBOARD_GAMES` ไปไว้ใน `LEADERBOARD_GAMES` แล้ว **ลบ `localOnly` และ `name` ออก** (ชื่อจะดึงจาก DB แทน) ส่วน `icon` เก็บไว้
   - เพิ่ม `MAX_SCORE_BY_GID` (ดูข้อ 5.3) ถ้าไม่เพิ่ม API จะตอบ 400 ทุกครั้ง
   - เพิ่มเกมใน `BROWSABLE_LEADERBOARD_GAMES` (ถ้าไม่เพิ่ม เกมจะหายจาก popup เลือกเกม เพราะ `LOCAL_BROWSABLE_LEADERBOARD_GAMES` ไม่มีเกมนี้แล้ว)
3. **`src/app/lessons/[id]/game/page.tsx`** — เงื่อนไขที่เปิด popup ใน `handleFinishGame` ตอนนี้เช็คแค่ `leaderboardGame?.localOnly` เกมที่ย้ายไป DB จะหลุดเงื่อนไขนี้ **ต้องแก้ตามข้อ 4.3**
4. **`src/app/lessons/[id]/leaderboard/page.tsx`** — ปุ่ม "กดเพื่อเสร็จสิ้น" แสดงเฉพาะ `gid === "G13" || localOnly` **ต้องแก้ตามข้อ 4.4** ไม่งั้นผู้เล่นจะค้างอยู่หน้ากระดาน
5. **เทสต์** — `src/tests/unit/local-leaderboard.test.ts` ยืนยันว่า G18–G20 เป็น local-only และ **ไม่อยู่** ใน `isSupportedLeaderboardGid` ต้องแก้เทสต์นี้ และเพิ่มเคสฝั่ง DB ใน `src/tests/unit/leaderboard-player.test.ts`
6. **ข้อมูลเก่าในเครื่องผู้เล่น** — คะแนนใน `localStorage` ของเกมนี้ **จะไม่ถูกย้ายไป DB** และจะไม่แสดงอีก (ยังค้างอยู่ใน key `naplab_ml_local_leaderboard`) แจ้งทีมก่อนว่ายอมรับได้ไหม
7. ทำข้อ 6 (เอกสาร) และข้อ 8 (ตรวจสอบ)

## 4. Checklist — เพิ่ม Leaderboard บน DB ให้เกมที่ยังไม่มี (G1–G6, G15–G17 หรือเกมใหม่)

### 4.1 DB
- เพิ่มแถว `game_id` ใน **ทุก** DB (G1–G20 มีแล้ว) และเพิ่มแถวเดียวกันในส่วน seed ของ `docs/supabase-schema.sql`
```sql
INSERT INTO public.game_id (gid, name) VALUES ('G21', 'ชื่อเกม')
ON CONFLICT (gid) DO UPDATE SET name = EXCLUDED.name;
```
- ⚠️ seed ใน `supabase-schema.sql` ใช้ `DO UPDATE SET name` ชื่อในไฟล์จึง **ต้องตรงกับ DB เสมอ** ไม่งั้นการรันไฟล์จะเขียนทับชื่อจริงใน DB

### 4.2 Config — `src/lib/leaderboard.ts`
```ts
const LEADERBOARD_GAMES: Record<string, LeaderboardGame> = {
  // key = lessonId (ส่วน [id] ของ URL /lessons/[id]/…) — ไม่ใช่ gid
  g15: { lessonId: "g15", gid: "G15", icon: "/images/lessons/category-learning.png" },
};
const MAX_SCORE_BY_GID = { /* … */ G15: 1_000 };
export const BROWSABLE_LEADERBOARD_GAMES = [LEADERBOARD_GAMES["flow-g13"], LEADERBOARD_GAMES["g15"]];
```
- `SUPPORTED_GIDS` คำนวณจาก `LEADERBOARD_GAMES` เอง ไม่ต้องแก้
- **ห้ามใส่ `name`** ในเกม DB (ตั้งใจให้ชื่อมาจาก `game_id` แหล่งเดียว)
- `icon` ใช้เฉพาะใน popup เลือกเกม ถ้าไม่ใส่จะแสดงแค่ชื่อ

### 4.3 ให้เกมส่งคะแนน และเปิด popup — `src/app/lessons/[id]/game/page.tsx`
1. **ตัวเกม** ต้องเรียก `onFinish(stars, score)` โดย `score` เป็นจำนวนเต็ม ≥ 0 (ดู G18 `src/components/G18MemoryPads.tsx` ที่ส่ง `bestRef.current` เป็นตัวอย่าง) แล้วแก้ type ของ prop `onFinish` ในเกมให้รับ argument ที่ 2
2. **`handleFinishGame`** มี 2 ทางที่จะเปิด popup คือ
   - `if (lessonId === FLOW_G13_ID) { … }` — เขียนสำหรับ G13 ตรงๆ
   - เงื่อนไขกลาง (แก้แล้วตอนย้าย G18–G20K) ครอบคลุมทุกเกมที่มี config และส่ง `score` มา — เกมใหม่แค่ส่ง `score` ก็เข้าเงื่อนไขนี้
   ```ts
   const leaderboardGame = getLeaderboardGame(lessonId);
   if (leaderboardGame && typeof score === "number") {
     leaderboardScoreService.savePendingScore(leaderboardGame.gid, score);
     …
   }
   ```
   ⚠️ บล็อกนี้อยู่ **หลัง** `apiClient.saveLessonProgress(...)` และการให้ดาว จึงยังบันทึกความคืบหน้าบทเรียนตามปกติ ถ้าย้ายตำแหน่งต้องรักษาส่วนนี้ไว้
3. **เกมในสาย Flow (`topic-1`, `topic-6`, `topic-3`)** — ถ้าเปิด popup ในโหมด Flow ผู้เล่นจะออกจากลำดับ Flow ไปที่หน้ากระดาน แล้วปุ่มจบ (`handleFinishFunGame`) จะพาไป `/lessons/complete` **ข้ามบทที่เหลือ** ต้องตัดสินใจกับทีมก่อน ทางที่ปลอดภัยคือเปิด popup เฉพาะ `learningMode === "manual"` หรือให้ปุ่มจบไปต่อด้วย `nextFlowLessonAfterGame()` (`src/lib/flow.ts`)

### 4.4 ปุ่มจบบนหน้ากระดาน — `src/app/lessons/[id]/leaderboard/page.tsx`
- ส่วนท้ายของหน้าแสดงปุ่ม "กดเพื่อเสร็จสิ้น" ทุกครั้งที่ไม่ใช่โหมด browse แล้ว (แก้ตอนย้าย G18–G20K) ไม่ต้องแก้เพิ่ม
- `handleFinishFunGame` ส่งไป `/lessons` (โหมดอิสระ) หรือ `/lessons/complete` (Flow) ถ้าเกมเป็นส่วนหนึ่งของ Flow ดูข้อ 4.3 ข้อ 3

### 4.5 จุดที่ไม่ต้องแก้ (ใช้ได้กับทุก gid อยู่แล้ว)
- `src/app/api/leaderboard/route.ts`, `src/app/api/game-results/route.ts`, `src/app/api/leaderboard/games/route.ts`
- `src/services/leaderboardScoreService.ts`, `leaderboardPlayerService.ts`, `apiClient.ts`
- `src/components/LeaderboardGamePicker.tsx`, `SaveScorePopup.tsx`
- `src/components/AppLayout.tsx` (เมนู ☰ "กระดานคะแนน" เปิด picker เดียวกัน · ซ่อนในโหมดวิจัย `appMode === "research"`)

## 5. ข้อควรระวัง

### 5.1 `stars` กับ `score` เป็นคนละค่า
- `handleFinishGame(starsEarned, score?)` — ดาวจริงที่ให้คือ `TEMP_AWARDED_STARS` (`src/lib/gameScore.ts`) ไม่ใช่ค่าที่เกมส่งมา
- **G13 เป็นข้อยกเว้น:** ส่งความสูงหอเป็น argument **ที่ 1** (`onFinish(height)`) และเข้าบล็อก `FLOW_G13_ID` ที่ใช้ `starsEarned` เป็นคะแนน **เกมใหม่ห้ามเลียนแบบ** ให้ส่ง `score` เป็น argument ที่ 2 แบบ G18–G20
- ถ้าจะรวม G13 เข้าเงื่อนไขกลางในข้อ 4.3 ต้องแก้ G13 ให้ส่ง `onFinish(stars, height)` พร้อมกัน และระวังว่าบล็อก G13 ตอนนี้ **ข้ามหน้าคะแนน `/score` และไม่เรียก `saveLessonProgress`**

### 5.2 Pending score มีได้ทีละ 1 ค่า
`leaderboardScoreService` เก็บใน `sessionStorage` key `naplab_ml_leaderboard_pending_score` ช่องเดียว และ `getPendingScore(gid)` คืนค่าเฉพาะ gid ที่ตรงกัน ห้ามเปลี่ยนเป็น `localStorage` (คะแนนค้างข้าม session จะถูกส่งซ้ำ) และ `attempt_uuid` ต้องสร้างใหม่ทุกรอบ (ใช้กันส่งคะแนนซ้ำผ่าน `ON CONFLICT (attempt_uuid)`)

### 5.3 คะแนนสูงสุด (`MAX_SCORE_BY_GID`)
- API ปฏิเสธคะแนนที่เกินค่านี้ (กันโกงคะแนน) และ DB มี `CHECK (score BETWEEN 0 AND 1000000)` อีกชั้น
- ตั้งจากเพดานจริงของเกมใน GDD (`docs/gdd/design-g*.md`) ถ้าเกมไม่มีเพดาน (เล่นได้ไม่จบ) ให้ตั้งค่าที่สูงกว่าผู้เล่นทำได้จริงพอสมควร แต่ไม่เกิน 1,000,000
- คะแนนต้องเป็นจำนวนเต็ม (`z.number().int()`) ถ้าเกมคิดคะแนนเป็นทศนิยมต้องปัดก่อนส่ง

### 5.4 ชื่อเกมมีหลายที่
| ที่ | ใช้แสดงที่ไหน |
|---|---|
| `game_id.name` ใน DB | หัวหน้ากระดาน + popup เลือกเกม (เกม DB) |
| `name` ใน `LOCAL_LEADERBOARD_GAMES` | หัวหน้ากระดาน + popup (เกม local) |
| `FUN_GAMES` / `LEARNING_GAMES` ใน `src/app/lessons/page.tsx` | การ์ดในหน้าหมวดหมู่ |
| `src/app/dev/games/DevGameHubClient.tsx` | หน้า dev hub (QA) |

ตอนนี้มีชื่อที่ไม่ตรงกันอยู่แล้ว: G20 ใน DB เป็น "ผักบุ้งลอยฟ้าช" แต่หน้าหมวดหมู่เป็น "ผักบุ้งลอยฟ้า" ถ้าแก้ชื่อใน DB ต้องแก้ให้ครบทุก DB และในไฟล์ seed ด้วย

### 5.5 Production ต้องมี constraint ครบ
`POST /api/game-results` ใช้ `ON CONFLICT (attempt_uuid)` ถ้า DB ไม่มี `UNIQUE (attempt_uuid)` บน `player_info` การบันทึกคะแนน **error ทุกครั้ง** (เคยเกิดกับ DB self-host มาแล้ว แก้เมื่อ 2026-10-21) เช็คด้วย query ในข้อ 7.1

### 5.6 เกมที่ต้องไม่อยู่ในเมนูเลือกเกม
เกมทดลองหรือเกมที่ยังไม่เปิดให้เล่นจริง ให้ใส่ config แต่ **ไม่ใส่** ใน `BROWSABLE_LEADERBOARD_GAMES`

### 5.7 หลายรุ่นของเกมเดียวกันใช้กระดานเดียว
ตั้ง `gid` ของรุ่นอื่นให้เป็น gid ของเกมหลัก (เช่น `g20k: { lessonId: "g20k", gid: "G20" }`) คะแนนจะลงแถว `G20` และใช้ `MAX_SCORE_BY_GID.G20` ไม่ต้องเพิ่มแถว `game_id` — log ของตัวเกมยังแยกรุ่นด้วย `game_id: "G20K"` ได้ (มาจาก `getGameId` ในหน้าเกม ไม่เกี่ยวกับ config กระดาน) ใส่เฉพาะรุ่นหลักใน `BROWSABLE_LEADERBOARD_GAMES` เพื่อไม่ให้ชื่อเกมซ้ำในเมนู

## 6. เอกสารที่ต้องอัปเดตตาม (กติกาใน `AGENT.md`)
- `docs/supabase-schema.sql` — seed `game_id` (ถ้าเพิ่ม gid ใหม่)
- ตารางสถานะในข้อ 2 ของไฟล์นี้
- user story ของเกมนั้น หรือ [US-CF-50](../agile/user-stories/US-CF-50.md) — ห้าม mark Done จนกว่าจะตรวจตามข้อ 8 จริง
- `docs/changelog.md`

## 7. Query ที่ใช้บ่อย

### 7.1 เช็คความพร้อมของ DB (รันกับทุก DB)
```sql
-- เกมที่ลงทะเบียนแล้ว
SELECT gid, name FROM public.game_id ORDER BY length(gid), gid;

-- ต้องได้ 1 แถว: UNIQUE (attempt_uuid)
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.player_info'::regclass AND pg_get_constraintdef(oid) = 'UNIQUE (attempt_uuid)';

-- ต้องมี player_info_leaderboard_idx และ player_info_player_uuid_idx
SELECT indexrelid::regclass FROM pg_index WHERE indrelid = 'public.player_info'::regclass;
```

### 7.2 ดูคะแนนของเกม
```sql
SELECT name, score, created_at FROM public.player_info
WHERE gid = 'G18' ORDER BY score DESC, created_at ASC LIMIT 10;
```

## 8. วิธีตรวจว่าใช้ได้จริง
1. `npm test` และ `npx tsc --noEmit` ผ่าน
2. `npm run dev` แล้วเข้าโหมดอิสระ เล่นเกมจนจบ
   - popup "เก็บคะแนนไหม?" ขึ้น → กด **ใช่** → กรอกชื่อ → กระดานแสดงคะแนนพร้อมแถวสีเหลืองของเรา → กด **กดเพื่อเสร็จสิ้น** แล้วกลับหน้าหมวดหมู่ได้
   - เล่นอีกรอบ กด **ไม่** → ไปกระดานพร้อมข้อความ "ดูอันดับโดยไม่เก็บคะแนน" และคะแนนรอบนั้นไม่ถูกบันทึก
3. เปิดเมนู ☰ → "กระดานคะแนน" → เกมขึ้นในรายการ เปิดแล้วเห็นคะแนนเดียวกัน (ทดสอบบนอีกเครื่องหรือ incognito เพื่อยืนยันว่ามาจาก DB ไม่ใช่ `localStorage`)
4. ใน DevTools → Network: `POST /api/game-results` ได้ **201** (ส่งซ้ำ `attempt_uuid` เดิมได้ 200 `{ duplicate: true }`), `GET /api/leaderboard?gid=…` ได้ **200**
5. รัน query ข้อ 7.2 ใน DB ที่แอปต่ออยู่ เห็นแถวคะแนนใหม่
6. ถ้าเป็นเกมในสาย Flow ทดสอบโหมด Flow ด้วยว่าลำดับบทไม่เสีย (ข้อ 4.3 ข้อ 3)

### อาการผิดปกติที่เจอบ่อย
| อาการ | สาเหตุ |
|---|---|
| `POST /api/game-results` → 400 "คะแนนหรือรหัสเกมอยู่นอกช่วงที่กำหนด" | gid ไม่อยู่ใน `LEADERBOARD_GAMES` หรือไม่มี `MAX_SCORE_BY_GID` หรือคะแนนเกินเพดาน |
| `POST /api/game-results` → 500 | ไม่มีแถวใน `game_id` (FK fail) หรือไม่มี `UNIQUE (attempt_uuid)` (ดู log ฝั่ง server) |
| `GET /api/leaderboard` → 400 "ไม่พบเกมที่ต้องการดูอันดับ" | gid ไม่อยู่ใน `LEADERBOARD_GAMES` |
| `GET /api/leaderboard` → 404 "ยังไม่ได้เปิดใช้ Leaderboard สำหรับเกมนี้" | ไม่มีแถวใน `game_id` ของ DB ที่ต่ออยู่ |
| เกมไม่ขึ้นใน popup เลือกเกม | ไม่อยู่ใน `BROWSABLE_LEADERBOARD_GAMES` หรือ DB ไม่มีแถว `game_id` (API กรองทิ้งเงียบๆ) |
| จบเกมแล้วไม่มี popup ถามเก็บคะแนน | เกมไม่ได้ส่ง `score` (argument ที่ 2) หรือไม่มี config ใน `LEADERBOARD_GAMES` (ข้อ 4.3) |
| ส่ง 5 ครั้งใน 1 นาทีแล้วได้ 429 | rate limit ของ `/api/game-results` (5 ครั้ง/นาที ต่อ IP+ผู้เล่น+เกม) เป็นพฤติกรรมปกติ |
