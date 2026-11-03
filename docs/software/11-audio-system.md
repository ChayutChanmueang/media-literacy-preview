# 11 — ระบบเสียง (Audio System): สเปก + แผนการทำ

> **สถานะ:** 🔍 In QA — โค้ดเฟส 0–5 ลงแล้ว (2026-11-02) ผ่าน unit test + E2E บน Chrome แต่ **ยังไม่ได้ทดสอบบนมือถือจริง** (ข้อ 13) และ **ยังไม่มีไฟล์ BGM** (catalog `BGM` ว่าง → ทุกหน้าเงียบจนกว่าจะใส่ไฟล์) · ใช้ **Howler.js** (2026-11-02) · สิ่งที่ยังค้างดูข้อ 11
>
> **ขอบเขต:** ระบบเสียงกลาง **ระบบเดียว** ใช้ทั้งแอป (หน้าเมนู, หน้าเกม, หน้าคะแนน ฯลฯ) มี 2 ช่องเสียง (channel) คือ **BGM** (เพลงประกอบ) และ **SFX** (เสียงเอฟเฟกต์) — เปลี่ยนเพลงระหว่างหน้าด้วยการ **crossfade** ไม่ตัดเสียงกระตุก
>
> **ไม่อยู่ในขอบเขต:** เสียงอ่านโจทย์ (TTS / `speechSynthesis`) และเสียงคลิปวิดีโอ — สองอย่างนี้ยังเล่นแบบเดิม แต่ระบบเสียงต้อง "หรี่ BGM ให้" ตอนมันเล่น (ดูข้อ 6.5)
>
> ที่มาของงาน: [FB-2026-07-31 ข้อ 11](../agile/feedback/FB-2026-07-31-playtest.md) (ขอ SFX + BGM ใน G13), กติกา [03 — Art Direction](../gdd/03-art-direction.md) "เพลงประกอบเบา ๆ ปิดได้ง่าย (ปุ่มชัดเจน)", ไฟล์ SFX ชุดแรกที่เพิ่งเพิ่มใน `public/audio/{g13,g17,g19,g20}/`

---

## 1. สภาพปัจจุบันของโปรเจกต์ (สิ่งที่สเปกนี้ต้องรองรับ)

ตรวจโค้ด ณ 2026-11-02:

| เรื่อง | สภาพปัจจุบัน | ผลต่อการออกแบบ |
|---|---|---|
| Routing | Next.js 16 App Router, 1 step = 1 route; `src/app/layout.tsx` ครอบทุกหน้าด้วย `AppLayout` (client component) ซึ่ง **ไม่ถูก unmount ตอนเปลี่ยน route** | ที่วาง provider ที่อยู่ข้ามหน้าได้ → BGM เล่นต่อเนื่อง/crossfade ข้ามหน้าได้ |
| ไฟล์เสียง | `public/audio/g13/*.wav` (3), `g17` (3), `g19` (4), `g20` (4) — WAV ขนาด 8–74 KB, ยังไม่มีโค้ดไหนเรียกใช้ ยังไม่มี BGM | SFX สั้นมาก โหลดแบบ Web Audio ได้สบาย; BGM ยังต้องหา/ทำไฟล์ |
| Web Audio | `G18MemoryPads.tsx` สร้าง `AudioContext` ของตัวเอง (oscillator โทนปุ่ม), ปิดตอน unmount | ต้องย้ายไปใช้ `Howler.ctx` ไม่งั้นปุ่มปิดเสียงกลางไม่มีผลกับ G18 และ iOS จำกัดจำนวน context |
| TTS | `speechSynthesis` กระจายอยู่ใน G2, G4, G5, G9, G10, G12, `QuizScreen` (ปุ่ม 🔊 ของแต่ละเกมเอง) | BGM ต้องหรี่ตอนอ่านโจทย์ ไม่งั้นผู้สูงอายุฟังเสียงอ่านไม่ชัด |
| วิดีโอ | หน้า `/lessons/[id]/video` (YouTube / `<video>` เล่นมีเสียง), GP5 (คลิปเปิดเสียงได้) | หน้าคลิปต้องไม่มี BGM, GP5 ต้องหรี่ BGM ตอนเปิดเสียงคลิป |
| Game loop | G13, G17, G19, G20/G20K เป็น canvas + `requestAnimationFrame`, ตรรกะบางส่วนอยู่นอก React (เช่น `src/lib/g13Game.ts`) | API เล่น SFX ต้องเรียกได้จากโค้ดธรรมดา (ไม่ผูกกับ hook) และต้องกันเสียงซ้อนเมื่อยิงถี่ ๆ ทุกเฟรม |
| เบราว์เซอร์เป้าหมาย | LINE in-app browser (iOS/Android), Safari iPhone, Chrome Android — mobile-first | ต้องปลดล็อกเสียงด้วย user gesture, จัดการตอนสลับแอป/ล็อกจอ, iOS ไม่ให้ตั้ง `HTMLMediaElement.volume` |
| PWA | `@ducanh2912/next-pwa` — กฎ default แคชไฟล์ `/\.(?:mp3\|wav\|ogg)$/` แบบ **CacheFirst**, `maxEntries: 32`, อายุ 1 วัน | ใช้ได้ฟรีถ้าใช้ `.mp3`/`.wav` (ไม่ใช่ `.m4a`); service worker ดัก XHR ที่ Howler ใช้โหลดไฟล์ได้ด้วย; ระวังเพดาน 32 ไฟล์ และไฟล์ชื่อเดิมแต่เนื้อหาใหม่จะติดแคช |
| Middleware | `src/proxy.ts` matcher ยกเว้นแค่ `.png/.jpg/.mp3` → คำขอ `.wav` วิ่งผ่าน proxy ทุกครั้ง | ต้องยกเว้น `/audio/` ทั้งโฟลเดอร์ (ข้อ 9) |
| Dependencies | ยังไม่มี library เสียง | เพิ่ม `howler` (ข้อ 2) |
| Test | Vitest + jsdom (jsdom ไม่มี `AudioContext`), Playwright | mock โมดูล `howler` ใน unit test, แยก logic ที่ทดสอบได้ (route → เพลง, คำนวณ volume) เป็น pure function |

---

## 2. การตัดสินใจหลัก: ใช้ Howler.js + wrapper บาง ๆ

**Library:** `howler@2.2.4` + `@types/howler@2.2.13` (devDependency) — ใช้กันแพร่หลาย ~10 KB gz, รุ่นนี้นิ่งแล้ว (ออกปี 2023 ยังไม่มีรุ่นใหม่ — ยอมรับได้เพราะ API ที่เราใช้เป็นพื้นฐาน)

### 2.1 Howler ให้อะไรมาแล้ว (ไม่ต้องเขียนเอง)

| ความต้องการ | Howler |
|---|---|
| ปลดล็อกเสียงด้วย gesture แรก (iOS/LINE) | `Howler.autoUnlock` (เปิดเป็นค่าเริ่มต้น) + event `unlock` |
| โหลด/decode/cache ไฟล์, เล่นซ้อนกันได้ | `new Howl({ src, preload })`, cache buffer ตาม URL ในตัว, sound pool |
| Fade (ใช้ทำ crossfade / duck) | `howl.fade(from, to, ms, id?)` + event `fade` |
| Loop, ปรับเสียง/mute รายเสียงและทั้งระบบ | `loop`, `howl.volume()`, `howl.mute()`, `Howler.volume()`, `Howler.mute()` |
| จบชีวิตเสียงที่ไม่ใช้ | `howl.unload()` |
| Fallback เบราว์เซอร์ที่ไม่มี Web Audio | สลับไป HTML5 Audio ให้เอง |
| ประหยัดแบต | `Howler.autoSuspend` — suspend context เองเมื่อไม่มีเสียงเล่น 30 วิ แล้ว resume เองเมื่อเล่นใหม่ |
| เข้าถึง `AudioContext` สำหรับโทน synth | `Howler.ctx`, `Howler.masterGain` |

### 2.2 สิ่งที่ยังต้องเขียนเอง (wrapper ~150–200 บรรทัด)

| ความต้องการ | เหตุผลที่ Howler ไม่มี | วิธี |
|---|---|---|
| **ช่องเสียง BGM / SFX** (volume + mute แยกกัน) | Howler มีแค่ระดับ "ทั้งระบบ" กับ "ราย Howl" ไม่มี group/bus | wrapper เก็บ Howl แยกตามช่อง แล้วตั้ง `howl.volume(def.gain × channelVolume × duck)` / `howl.mute(channelMuted)` ทุกตัวในช่องเมื่อค่าเปลี่ยน |
| **Crossfade ระหว่างเพลง** | มีแค่ `fade()` ราย Howl | สั่ง fade out เพลงเก่า + fade in เพลงใหม่พร้อมกัน (ข้อ 6.2) |
| เลือก BGM ตาม route | เรื่องของแอป | `bgmRoutes.ts` (pure function) + `AudioProvider` |
| Duck BGM ตอน TTS/วิดีโอ | — | ref-count ต่อ reason แล้ว `fade()` เพลงปัจจุบัน (ข้อ 6.5) |
| หยุดเสียงเมื่อสลับแอป/ล็อกจอ | Howler ไม่ฟัง `visibilitychange` | `Howler.mute(true)` + pause BGM ตอน hidden (ข้อ 6.4) |
| กันเสียงยิงถี่ใน game loop | `pool` ของ Howler คือขนาด pool ไม่ใช่เพดานเสียงที่ดังพร้อมกัน | `maxVoices` / `minIntervalMs` ใน wrapper (ข้อ 6.3) |
| เก็บค่าตั้งข้าม session | — | localStorage + cookie (ข้อ 6.6) |

**หลักการ:** wrapper เป็น **singleton module ฝั่ง client** (`src/lib/audio/audioEngine.ts`) → เกม canvas/โค้ดนอก React เรียก `audio.playSfx(...)` ได้ตรง ๆ ส่วน React ใช้ผ่าน hook บาง ๆ (`useSyncExternalStore`) และมี `<AudioProvider>` ตัวเดียวใน `AppLayout` คอยดูแล lifecycle + เลือก BGM ตาม route — **คอมโพเนนต์ห้าม import `howler` ตรง** ให้ผ่าน wrapper เสมอ เพื่อให้ช่องเสียง/mute/duck ทำงานครบ

### 2.3 ⚠️ ข้อแลกเปลี่ยนสำคัญ: BGM ต้องใช้โหมด Web Audio (`html5: false`)

Howler มี 2 โหมด:
- **`html5: true`** (stream ผ่าน `<audio>`) — ประหยัด RAM แต่ fade ใช้ `element.volume` ซึ่ง **iOS ไม่ยอมให้ตั้ง** → บน iPhone/LINE iOS เพลงจะตัดเข้า-ออกทันที fade ไม่ทำงาน ปรับความดัง BGM ก็ไม่ได้
- **`html5: false`** (Web Audio, ค่าเริ่มต้น) — fade/volume ทำงานทุกเครื่อง loop ต่อเนื่องไม่มีช่องว่าง แต่ **decode ทั้งเพลงลง RAM** (~11 MB/นาที ถ้า stereo 48 kHz; mono ครึ่งหนึ่ง)

**ตัดสิน:** ใช้ `html5: false` กับทุกเสียง แล้วคุม RAM ด้วยกติกา asset + การ unload:
- BGM เป็น **loop สั้น 45–75 วินาที แบบ mono** (เพลงประกอบเกมแบบวนเหมาะกับผู้สูงอายุอยู่แล้ว) → ~4–7 MB ต่อเพลงเมื่อ decode (รายละเอียดการ optimize ทั้งหมดอยู่ข้อ 10)
- ในหน่วยความจำมี BGM ไม่เกิน 2 เพลง (เพลงปัจจุบัน + เพลงที่กำลัง fade out) — เพลงที่ fade out จบแล้ว **ไม่ถูกเรียกซ้ำภายใน 60 วิ → `unload()`**
- ถ้าภายหลังต้องใช้เพลงยาว ค่อยพิจารณาทางเลือก (ต่อ `<audio>` ของ Howler เข้า Web Audio graph เอง — ต้องแตะ internal ของ Howler จึงไม่ทำตอนนี้)

---

## 3. สถาปัตยกรรม

### 3.1 โครงเสียง

```
                                     ┌─ Howl "menu"  (BGM, loop) ── volume = gain × bgmVolume × duck, mute = bgmMuted
Howler (global) ── Howler.masterGain ┼─ Howl "game"  (BGM, loop)    (crossfade = fade out ตัวเก่า + fade in ตัวใหม่พร้อมกัน)
  Howler.mute() ตอนแอปถูกซ่อน         ├─ Howl "g13.scoopCatch" (SFX) ── volume = gain × sfxVolume, mute = sfxMuted
                                     ├─ Howl "g17.paddleBounce" (SFX) …
                                     └─ toneGain (GainNode เอง, ค่า = sfxVolume หรือ 0) ◄─ OscillatorNode (G18)
```

- 1 ไฟล์เสียง = 1 `Howl` (สร้างแบบ lazy ครั้งแรกที่ใช้/preload แล้วเก็บไว้ใน `Map<key, Howl>`)
- volume ที่ตั้งให้ Howl คำนวณด้วย pure function `effectiveVolume(def, settings, duck)` (ทดสอบ unit ได้)
- `Howler.volume()` (master) ไม่ใช้เก็บค่าผู้ใช้ — สงวนไว้กับ `Howler.mute()` ตอน visibility เท่านั้น

### 3.2 โครงไฟล์

```
src/lib/audio/
  audioEngine.ts      ← singleton wrapper บน Howler: ช่องเสียง, BGM/crossfade, SFX, duck, visibility, settings
  audioCatalog.ts     ← รายการเสียงทั้งหมด (key → src, gain, loop, maxVoices) — type-safe keys
  audioMath.ts        ← pure functions: effectiveVolume(), resolveBgm(pathname) (ทดสอบ unit ได้)
  audioSettings.ts    ← อ่าน/เขียนค่าตั้ง (volume/mute) ลง localStorage + cookie
  speech.ts           ← speak()/cancelSpeech() ห่อ speechSynthesis + duck (เฟส 4)
  useAudio.ts         ← hooks: useAudioSettings(), useBgmOverride(), usePreloadSfx()
src/components/
  AudioProvider.tsx   ← mount ครั้งเดียวใน src/app/layout.tsx: โหลด Howler, visibility, เลือก BGM ตาม route, unload SFX เกม
  AudioToggle.tsx     ← ปุ่มเปิด/ปิดเสียง ใช้ซ้ำใน drawer และในเกม
public/audio/
  bgm/                ← menu-v1.mp3, game-v1.mp3, …
  g13/ g17/ g19/ g20/ ← SFX รายเกม (โครงเดิม)
  ui/                 ← SFX กลาง: correct, star, …
  CREDITS.md          ← ที่มา + license ทุกไฟล์
```

**SSR:** `howler` อ้าง `window` ตอนเริ่มทำงาน → `audioEngine.ts` โหลดด้วย `await import("howler")` แบบ lazy ครั้งแรกที่ฝั่ง client ต้องใช้ (ได้ผลพลอยได้: ไม่เพิ่มขนาด bundle หน้าแรก) — ระหว่างยังโหลดไม่เสร็จ `playSfx` ทิ้งเสียง, `setRouteBgm` จำ key ไว้

---

## 4. Catalog เสียง (`audioCatalog.ts`)

ทุกเสียงต้องลงทะเบียนที่นี่ที่เดียว — **ห้ามเขียน path ไฟล์เสียงในคอมโพเนนต์** เพื่อให้ preload/ตรวจไฟล์หาย/ปรับความดังทำที่จุดเดียว

```ts
export const BGM = {
  menu: { src: "/audio/bgm/menu-v1.mp3", gain: 0.8 },
  game: { src: "/audio/bgm/game-v1.mp3", gain: 0.7 }, // เพลงเกมกลาง (fallback)
  // เกมที่อยากมีเพลงของตัวเองค่อยเพิ่ม เช่น g13: { src: "/audio/bgm/g13-v1.mp3", gain: 0.7 }
} as const satisfies Record<string, BgmDef>;

export const SFX = {
  "g13.scoopCatch":  { src: "/audio/g13/scoopCatch.wav", gain: 0.8, maxVoices: 3 },
  "g13.bombHit":     { src: "/audio/g13/bombHit.wav", gain: 0.7 },
  "g17.paddleBounce":{ src: "/audio/g17/paddleBounce.wav", gain: 0.6, maxVoices: 2, minIntervalMs: 60 },
  "g20.dragLoop":    { src: "/audio/g20/dragLoop.wav", gain: 0.5, loop: true },
  // …
} as const satisfies Record<string, SfxDef>;

export type BgmKey = keyof typeof BGM;
export type SfxKey = keyof typeof SFX;
```

| Field | ความหมาย |
|---|---|
| `gain` | ปรับความดังรายไฟล์ (normalize เบื้องต้น) คูณกับ volume ของช่อง |
| `loop` | BGM loop เสมอ; SFX ที่ loop (เช่น `dragLoop`) ต้องหยุดด้วย handle ที่ `playSfx` คืนมา |
| `maxVoices` | จำนวนเสียงนี้ที่ดังพร้อมกันได้ — เกินแล้ว `stop(id)` ตัวเก่าสุด (default 4) |
| `minIntervalMs` | กันยิงถี่เกิน (เช่น ลูกบอลชนกำแพงหลายครั้งใน 1 เฟรม) — default 30 ms |

ถ้าภายหลัง SFX ของเกมหนึ่งมีหลายสิบไฟล์ ค่อยพิจารณารวมเป็น **audio sprite** ไฟล์เดียว (Howler รองรับ `sprite`) เพื่อลดจำนวนคำขอและไม่ชนเพดานแคช PWA

---

## 5. Public API (`audioEngine.ts`)

```ts
export const audio = {
  start(): Promise<void>;                      // โหลด Howler (AudioProvider เรียกตอน idle)

  // --- BGM ---
  setRouteBgm(key: string | null): void;       // AudioProvider เรียกตาม route; null = fade out เงียบ
  // key เดิมกำลังเล่นอยู่ → ไม่ทำอะไร (เพลงไม่เริ่มใหม่ตอนเปลี่ยนหน้าในกลุ่มเดียวกัน); key ที่ไม่มีใน BGM = เงียบ
  pushBgmOverride(key: string | null): number; // ใช้ผ่าน useBgmOverride — ชนะ route
  popBgmOverride(token: number): void;

  // --- SFX ---
  playSfx(key: SfxKey, opts?: { volume?: number; rate?: number }): number | null; // sound id (ใช้หยุดเสียง loop)
  stopSfx(key: SfxKey, id: number | null | undefined): void;
  preloadSfx(keys: readonly SfxKey[]): void;   // สร้าง Howl ล่วงหน้า (ใช้ผ่าน usePreloadSfx ตอน mount เกม)
  playTone(hz: number, ms: number, opts?: { type?: OscillatorType; peak?: number }): void; // G18 — ใช้ Howler.ctx
  stopAllSfx(): void;                          // AudioProvider เรียกเมื่อออกจากหน้าเล่นเกม
  unloadSfxGroup(group: string): void;         // "g13" ฯลฯ — AudioProvider เรียกหลังออกจากเกม 60 วิ

  // --- ducking ---
  duck(reason: string): void;                  // ref-count ต่อ reason
  unduck(reason: string): void;

  // --- visibility ---
  setHidden(hidden: boolean): void;            // AudioProvider เรียกจาก visibilitychange/pagehide/pageshow

  // --- settings ---
  getSettings(): AudioSettings;                // { bgmVolume, sfxVolume, bgmMuted, sfxMuted, bgmTouched }
  updateSettings(patch: Partial<AudioSettings>): void;
  subscribe(listener: () => void): () => void; // สำหรับ useSyncExternalStore
  debugState(): object;                        // window.__audioDebug (นอก production) สำหรับ E2E
};
```

กติกาการเรียกใช้:
- ทุกเมธอด **no-op อย่างปลอดภัย** ถ้าอยู่ฝั่ง server, Howler ยังโหลดไม่เสร็จ, ไฟล์โหลดไม่สำเร็จ (`loaderror`) หรือเล่นไม่ได้ (`playerror`) — **เสียงต้องไม่ทำให้เกม crash หรือค้าง**
- "ปลดล็อกแล้ว" = `Howler.ctx.state` เคยเป็น `"running"` (ฟัง `statechange`) — `playSfx` ก่อนนั้น → ทิ้ง (ไม่เก็บคิว) เพราะเสียงที่ดังทีหลังเหตุการณ์ทำให้สับสน; BGM ก่อนนั้น → จำ key ไว้ เริ่มโหลด+เล่นเมื่อปลดล็อก · หลังปลดล็อกแล้ว context ที่ถูก `autoSuspend` ไม่ถือว่าล็อก (Howler resume ให้เองตอนเล่น)
- **ข้อจำกัดของ Howler ที่ต้องรู้:** `play()` ตอน context ไม่ running จะ **เข้าคิวแล้วดังทีหลัง** และ event ต่าง ๆ (`end`/`stop`) ยิงแบบ async — wrapper จึงเช็คสถานะเองก่อนเล่น และปล่อย voice เองตอนตัดเสียงเก่า (ไม่รอ event)
- Howler แนบ listener ปลดล็อกเฉพาะตอนสร้าง Howl ตัวแรก — wrapper เรียก `Howler._unlockAudio()` (method ภายใน, รุ่น 2.2.4 ที่ pin ไว้) ทันทีที่โหลดเสร็จ เพื่อให้การแตะครั้งแรกบนหน้าไหนก็ได้ปลดล็อก — **ถ้าอัปเกรด Howler ต้องเช็คจุดนี้**
- React StrictMode mount ซ้ำ 2 รอบต้องไม่สร้าง Howl ซ้ำ (ทุกอย่าง lazy + idempotent ผ่าน `Map`)

---

## 6. พฤติกรรมโดยละเอียด

### 6.1 การปลดล็อกเสียง (autoplay policy)

ใช้ `Howler.autoUnlock` ของ Howler (ฟัง `touchstart`/`touchend`/`click`/`keydown` บน document ให้เอง) — wrapper แค่ฟัง event `unlock` ของ Howl BGM ที่รออยู่แล้วสั่ง `play()` + fade in

หน้าแรก (`/`) มีปุ่ม "เริ่ม" อยู่แล้ว → การแตะครั้งแรกนั้นเองจะปลดล็อก (BGM เมนูเริ่มดังตอนแตะครั้งแรก ไม่ใช่ตอนเปิดหน้า — ยอมรับได้) · ต้องให้ Howler โหลด (dynamic import) ตั้งแต่ `AudioProvider` mount เพื่อให้ listener ปลดล็อกติดก่อนผู้ใช้แตะ

### 6.2 BGM ตาม route + crossfade

`resolveBgm(pathname, hasTrack): string | null` (ใน `audioMath.ts`) — `AudioProvider` เรียกทุกครั้งที่ `usePathname()` เปลี่ยน แล้วส่งให้ `audio.setRouteBgm()`

| Route | BGM (เสนอ) | หมายเหตุ |
|---|---|---|
| `/`, `/consent`, `/consent/location`, `/lessons`, `/lessons/complete`, `/certificate` | `menu` | เปลี่ยนหน้าในกลุ่มนี้ เพลงเล่นต่อไม่เริ่มใหม่ |
| `/lessons/[id]/video` | `null` (fade out) | คลิปมีเสียงของตัวเอง |
| `/lessons/[id]/game` | `BGM[lessonId]` ถ้ามี ไม่งั้น `game` | crossfade จาก `menu` → เพลงเกม |
| `/lessons/[id]/score`, `/lessons/[id]/leaderboard` | เพลงของเกมนั้น (เล่นต่อ) | ไม่สลับเพลงทันทีหลังจบเกม ลดความกระตุก |
| `/pretest`, `/posttest`, `/self-assessment/**` | `null` | ⚠️ Open decision ข้อ 12 — แบบสอบถามวิจัย ควรเงียบให้มีสมาธิ |
| `/facilitator/**`, `/dev/**` | `null` | จอวิทยากร/เครื่องมือ dev |

**Crossfade** (`syncBgm()` ใน engine — เรียกเมื่อ route / override / ค่าตั้ง / การซ่อนแอปเปลี่ยน):
1. `next === current` → return
2. เพลงเก่า: `old.fade(old.volume(), 0, fadeMs)` → เมื่อได้ event `fade` (และ volume เป็น 0 จริง) → `pause()` (ไม่ `stop()` เพื่อจำตำแหน่ง — กลับมาเพลงเดิมภายใน 60 วิ เล่นต่อจากเดิม, เกินนั้น `unload()` ตามข้อ 2.3)
3. เพลงใหม่: `volume(0)` → `play()` → `fade(0, target, fadeMs)` — `target = effectiveVolume(...)`
4. เปลี่ยนเพลงอีกระหว่าง fade (ผู้ใช้กดเร็ว) → เรียก `fade()` ใหม่จาก `howl.volume()` ปัจจุบันเสมอ (fade ใหม่ของ Howler ยกเลิกตัวเก่าของเสียงเดียวกัน) → ไม่กระโดด ไม่มีเสียงคลิก
5. ผู้ใช้ปรับ volume/mute ระหว่าง fade → fade ไปค่าเป้าหมายใหม่แทน (ไม่ set ตรง ๆ ให้ชนกับ fade ที่ค้าง)
6. ค่าเริ่มต้น: crossfade **1,200 ms**, fade out ไปเงียบ **800 ms**, fade in ครั้งแรกหลังปลดล็อก **1,500 ms**

**Override จากเกม:** เกมที่อยากเปลี่ยนเพลงตาม phase (เช่น หน้า intro เงียบ, ช่วงเล่นมีเพลง) ใช้ `useBgmOverride(key | null)` — มีผลขณะ component mount อยู่ และคืนค่าเป็นของ route เมื่อ unmount (override ชนะ route)

### 6.3 SFX

- `playSfx` → `howl.play()` ได้ sound id → ตั้ง volume/rate ราย id ถ้ามี opts → wrapper เก็บ id ที่ยังดังอยู่ (ลบเมื่อ event `end`/`stop`) เพื่อบังคับ `maxVoices` และจดเวลาเล่นล่าสุดเพื่อ `minIntervalMs`
- Howl ยังโหลดไม่เสร็จ → **ทิ้งเสียงนั้น** (ไม่ปล่อยให้ Howler เข้าคิวเล่นทีหลัง) — เกมควร `preloadSfx()` ตอนอยู่หน้า `GameIntro`
- ออกจากหน้าเกม (route เปลี่ยน) → `stopAllSfx()` อัตโนมัติจาก `AudioProvider` (กัน `dragLoop` ค้าง)
- **กติกาเนื้อหา (จาก GDD):** ไม่มีเสียงตกใจ/เสียงชนดัง/เสียง "แพ้" — เสียงตอบผิดต้องนุ่มนวล ([design-g7](../gdd/design-g7.md)); เสียงต้องไม่เป็นช่องทางเดียวที่บอกผลลัพธ์ (ต้องมีภาพ ✓ ✗ เสมอ เพราะผู้ใช้อาจปิดเสียง/หูตึง)

### 6.4 สลับแอป / ล็อกจอ / แท็บถูกซ่อน

Howler ไม่จัดการให้ → `AudioProvider` ฟังเอง:
- `visibilitychange` → `hidden` หรือ `pagehide` (LINE บางเครื่องยิงอันนี้แทน): `Howler.mute(true)` + `pause()` BGM ปัจจุบัน
- `visible`: `Howler.mute(false)` + `play()` BGM ต่อ (ถ้า context ถูกระบบ suspend และต้องมี gesture ใหม่ `autoUnlock` ของ Howler จะ resume ให้ตอนแตะครั้งถัดไป)
- iOS ตัดเสียงเมื่อมีสายเข้า (context `interrupted`) → จัดการเหมือนข้อบน

### 6.5 Ducking (หรี่ BGM ตอน TTS / วิดีโอ)

- `duck(reason)` → ค่า duck = **0.2** → `fade()` BGM ปัจจุบันไปค่าเป้าหมายใหม่ใน 200 ms; `unduck(reason)` ครบทุก reason → duck = 1, fade กลับใน 400 ms
- ref-count ต่อ reason (`"tts"`, `"video"`) กัน unduck ก่อนเวลาเมื่อมีหลายแหล่ง; ค่า duck ถูกใช้ใน `effectiveVolume` ด้วย จึงไม่หายเมื่อมี crossfade ระหว่าง duck
- TTS: helper กลาง `speak(text)` ใน `src/lib/audio/speech.ts` ห่อ `SpeechSynthesisUtterance` + `duck("tts")` ตอน `onstart`, `unduck` ตอน `onend`/`onerror`/`cancel` — ทยอยเปลี่ยน G2/G4/G5/G9/G10/G12/QuizScreen มาใช้ (เฟส 4)
- GP5: เปิดเสียงคลิป → `duck("video")`, ปิดเสียง/เปลี่ยนคลิป/unmount → `unduck("video")`

### 6.6 ค่าตั้ง (settings) และการเก็บ

```ts
interface AudioSettings { bgmVolume: number; sfxVolume: number; bgmMuted: boolean; sfxMuted: boolean } // volume 0..1
const DEFAULTS = { bgmVolume: 0.35, sfxVolume: 0.8, bgmMuted: false, sfxMuted: false };
```

- BGM ตั้งต้นเบา (0.35) ตามกติกา "เพลงประกอบเบา ๆ" — ความดังจริงคูณ `gain` ของไฟล์
- เก็บใน `localStorage` key `naplab_ml_audio` + cookie ชื่อเดียวกัน (1 ปี) ตามแนวทาง hybrid ของ `progressService` เพราะ LINE ชอบล้าง storage — ไม่ใช่ข้อมูลวิจัย ถ้าหายก็กลับเป็น default ได้ ไม่ต้องส่งขึ้น server
- ปุ่มรีเซ็ตใน drawer / `progressService.resetAll()` → ลบค่าเสียงด้วย
- เปลี่ยนค่า → `loggingService.logEvent("audio_setting_change", { channel, muted, volume })` (debounce slider 500 ms) เพื่อดูว่าผู้ใช้ปิดเพลงบ่อยแค่ไหน

### 6.7 UI ควบคุมเสียง

> ⏸ **ปิดไว้ก่อน (2026-11-02):** `AUDIO_CONTROLS_ENABLED = false` ใน `src/lib/audio/audioSettings.ts` — ไม่แสดงหัวข้อ "เสียง" ใน drawer ☰ และปุ่มเปิด/ปิดเสียงในเกม จนกว่าทีมจะตัดสินว่าจะให้ผู้เล่นปิดเสียงได้หรือไม่ (Open decision ข้อ 12.8) · ระหว่างปิด engine ใช้ค่าเริ่มต้นเสมอ ไม่อ่านค่าที่เคยบันทึกในเครื่อง (กันเครื่องที่เคยกดปิดเสียงไว้ค้างเงียบโดยไม่มีปุ่มให้เปิด) · โค้ดและ E2E ของปุ่มยังอยู่ครบ — เปิดกลับ = เปลี่ยนค่าเป็น `true` ค่าเดียว (E2E 2 เคสของปุ่มจะกลับมารันเอง)

| ที่ | รูปแบบ |
|---|---|
| Drawer (☰) ใน `AppLayout` | หัวข้อ "เสียง" มี 2 แถว: "เพลงประกอบ" และ "เสียงเอฟเฟกต์" — แต่ละแถวเป็นปุ่ม toggle (ไอคอน `Music`/`Volume2` ↔ `VolumeX` **+ ข้อความ "เปิด"/"ปิด"**) + slider ความดัง |
| หน้าเล่นเกม (header ถูกซ่อน) | `GameAudioToggle` (ไอคอน + "เปิด"/"ปิด") ตรงกลาง `GameStageHeader` (เกมสนุก G13, G17–G20K) และมุมซ้ายบนของ `GameIntro` (ทุกเกมที่ใช้หน้า intro — มุมขวาบนเป็นของปุ่ม dev "ข้าม") — กดครั้งเดียวปิด/เปิด **ทั้ง BGM และ SFX** (ผู้สูงอายุต้องการปุ่มเดียวที่ชัด) · วัดจริงที่จอ 320px: header ไม่ล้น (ไม่นับปุ่ม dev) |

ข้อบังคับ accessibility เดิมยังใช้: ปุ่ม ≥ 48×48px, ข้อความ ≥ 20px, ไม่ใช้สีอย่างเดียวบอกสถานะ, `aria-pressed` + `aria-label` ภาษาไทย ("ปิดเพลง"/"เปิดเพลง")

---

## 7. React integration

```tsx
// src/app/layout.tsx — วางข้าง <AppLayout> (ไม่ห่อ children, render null) จึงมีตัวเดียวเสมอ
// ไม่ว่า AppLayout จะ return แบบ facilitator / dev / ปกติ
<AudioProvider />
```

`AudioProvider` ทำ 3 อย่าง: (1) โหลด Howler ตอน `requestIdleCallback` + ติด/ถอด listener `visibilitychange`/`pagehide`/`pageshow` (2) `useEffect([pathname])` → `audio.setRouteBgm(resolveBgm(pathname))` + `stopAllSfx()` เมื่อไม่ได้อยู่หน้าเล่นเกม (3) ตั้งเวลา `unloadSfxGroup()` 60 วิหลังออกจากกลุ่ม route ของเกม · stack ของ `useBgmOverride` อยู่ใน engine (`pushBgmOverride`/`popBgmOverride`)

```ts
// ในเกม
usePreloadSfx(["g13.scoopCatch", "g13.scoopCatchX2", "g13.bombHit"]); // ตอน mount
audio.playSfx("g13.scoopCatch");                                         // ใน game loop / event handler
const { bgmMuted, sfxMuted } = useAudioSettings();                       // ใน UI
```

> ทำไมไม่ใช้ React Context ส่งตัว engine: เกม canvas เรียกจาก `g13Game.ts` ซึ่งไม่ใช่ component — import singleton ตรง ๆ ง่ายกว่าและไม่ทำให้ re-render ทั้งต้นไม้ทุกครั้งที่ setting เปลี่ยน

---

## 8. ไฟล์เสียง (asset guideline)

| | BGM | SFX |
|---|---|---|
| Format | **MP3 mono** 44.1 kHz 80–96 kbps (iOS เล่นได้ทุกรุ่น, เข้ากฎแคช PWA, mono ลด RAM ครึ่งหนึ่ง — ข้อ 10.3) | MP3 mono 96 kbps (WAV เฉพาะไฟล์ที่ MP3 ทำให้เสียงช้ากว่าภาพ — ข้อ 10.3) |
| ความยาว / ขนาด | **loop 45–75 วิ** (ข้อ 2.3 — ถูก decode ลง RAM ทั้งเพลง), ≤ 900 KB | < 1.5 วิ, ≤ 100 KB |
| ความดัง | normalize ~ −20 LUFS (เบากว่า SFX) | ~ −16 LUFS, ไม่มี peak แหลม |
| Loop | ตัดหัว-ท้ายให้ต่อกันเนียน — โหมด Web Audio ของ Howler loop ไม่มีช่องว่าง แต่ MP3 encoder ใส่ความเงียบหัวไฟล์ ~25 ms ให้ตัดออก/ใช้ encoder ที่เขียน gapless info | — |
| ชื่อไฟล์ | **ใส่เวอร์ชันในชื่อ** (`menu-v1.mp3` → `menu-v2.mp3`) เพราะ PWA แคช CacheFirst — ไฟล์ชื่อเดิมจะติดของเก่า (เคยเกิดแล้วกับ `facet-bg.svg` ของ G18); อย่าใช้ `?v=` เพราะ regex แคชของ PWA ไม่จับ query string | เหมือนกัน |
| ลิขสิทธิ์ / AI | บันทึกที่มา + license ใน `public/audio/CREDITS.md`; ถ้าสร้างจาก AI ต้องทำตาม[นโยบาย AI](../gdd/00-concept.md#5-นโยบายการนำเสนอเนื้อหาที่สร้างจาก-ai-⚠️) | เหมือนกัน |

> แคช PWA: กฎ default มีเพดาน 32 ไฟล์ / อายุ 1 วัน และ `public/` ทั้งหมดถูก precache — ข้อ 10.2 แก้ทั้งสองเรื่อง (ตัดออกจาก precache + runtime cache ของเราเอง 64 ไฟล์ / 30 วัน)

---

## 9. งานแก้จุดอื่นที่ต้องทำพร้อมกัน

1. **`src/proxy.ts`** — เพิ่ม `audio/` ใน negative lookahead ของ matcher (เช่น `…|sw.js|audio/|.*\\.png$…`) ไม่ให้คำขอไฟล์เสียงวิ่งผ่าน middleware
2. **`G18MemoryPads.tsx`** — ลบ `AudioContext` ของตัวเอง (`audioRef`, `ensureAudio`, `close()` ตอน unmount) เปลี่ยน `playTone` เป็น `audio.playTone(PADS[i].toneHz, ms, { type: "triangle", peak: 0.18 })` — ใน wrapper สร้าง oscillator บน `Howler.ctx` ต่อผ่าน `toneGain` (ค่าตาม SFX volume/mute) เข้า `Howler.masterGain`
3. **`docs/gdd/design-g19-fruit-match.md`, `design-g20-veggie-toss.md`** — ตอนนี้เขียนว่า "ไม่มีเสียงประกอบ" ต้องแก้เมื่อใส่ SFX จริง
4. **`AGENT.md`** — เพิ่มกติกาสั้น ๆ: "เสียงทุกชนิดผ่าน `src/lib/audio` เท่านั้น ห้าม import `howler` ตรง / `new Audio()` / `new AudioContext()` ในคอมโพเนนต์ — ดู docs/software/11"

---

## 10. การ optimize (ขนาดดาวน์โหลด / RAM / CPU / แบตเตอรี่)

ผู้ใช้หลักใช้มือถือสเปกต่ำ ผ่านเน็ตมือถือในต่างจังหวัด หรือ Wi-Fi ห้องอบรมที่ใช้ร่วมกันหลายสิบเครื่อง ([แผน performance](../implementation_plan/performance-optimization-plan.md) พบว่า bandwidth ตอนเปิดแอปครั้งแรกเป็นคอขวดหลัก) → ระบบเสียงต้อง **ไม่ทำให้แอปเปิดช้าลง ไม่แย่ง bandwidth กับ YouTube และไม่ทำให้เกมกระตุก**

### 10.1 งบประมาณ (budget) ที่ต้องผ่านก่อน merge

| ตัวชี้วัด | งบ | วัดอย่างไร |
|---|---|---|
| JS ที่เพิ่มใน first load ของทุกหน้า | ≤ 3 KB gz (wrapper + catalog + provider) — **`howler` ต้องไม่อยู่ใน first load** | ผลลัพธ์ `npm run build` (First Load JS) เทียบก่อน/หลัง |
| คำขอไฟล์เสียงก่อนผู้ใช้แตะจอครั้งแรก | **0** | DevTools Network บนหน้า `/` |
| ไฟล์เสียงใน precache ของ Service Worker | **0** | ค้น `/audio/` ใน `public/sw.js` หลัง build |
| ดาวน์โหลดเสียงก่อนเริ่มเกมแรก (BGM เมนู + BGM เกม + SFX เกมนั้น) | ≤ 1.5 MB | DevTools Network |
| คำขอไฟล์เสียงบนหน้าคลิป | **0** (ไม่แย่ง YouTube) | DevTools Network |
| RAM ที่ decode ค้างไว้รวม | ≤ 20 MB | Safari Web Inspector / Chrome remote debugging — สลับเมนู ↔ เกม 10 รอบแล้วต้องไม่โตขึ้นเรื่อย ๆ |
| เสียงดังพร้อมกันทั้งระบบ | ≤ 12 voices | `__audioDebug.activeVoices` |
| การโหลดไฟล์ระหว่างเล่นเกม | **0** (preload ครบตั้งแต่หน้า intro) | DevTools Network ระหว่างเล่น |

**ผลวัด 2026-11-02** (build production + E2E บน dev server, ยังไม่ใช่มือถือจริง):
- ✅ `howler` อยู่ใน chunk แยกที่โหลดแบบ lazy — ไม่อยู่ใน chunk ของ layout / main
- ✅ `public/sw.js`: ไม่มีไฟล์ `/audio/` ใน precache, กฎ `static-audio-assets` ของเรา (64 ไฟล์ / 30 วัน) อยู่ลำดับแรกของกฎ asset
- ✅ หน้า `/` ไม่มีคำขอไฟล์เสียงเลยก่อนแตะ, หน้าคลิปไม่มีคำขอไฟล์เสียง (E2E)
- ✅ เข้า G13: โหลด SFX 3 ไฟล์ของเกมนี้ตอนหน้า intro (~105 KB WAV)
- ☐ JS first load ที่เพิ่ม (Next 16 ไม่พิมพ์ขนาดใน build output — ต้องวัดด้วย DevTools), RAM, เสียงพร้อมกันตอนเล่นจริง

### 10.2 เครือข่ายและแคช

1. **ตัด `public/audio/` ออกจาก precache ของ PWA** — ตอนนี้ `next-pwa` precache ทุกไฟล์ใน `public/` ตอน Service Worker ติดตั้ง → ถ้าไม่ตัด ทุกเครื่องใหม่จะโหลด BGM + SFX **ของทุกเกม** ตั้งแต่เปิดแอปครั้งแรก แม้ไม่เคยเล่นเกมนั้น (ปัญหาเดียวกับวิดีโอ 170 MB ใน [P0-1](../implementation_plan/performance-optimization-plan.md#p0-1-ตัดไฟล์ที่ไม่ได้ใช้ออกจาก-precache)) — เพิ่ม `"!audio/**/*"` ใน `publicExcludes` ของ `withPWAInit` (array เดียวกับที่ P0-1 เสนอ — ถ้าทำ P0-1 แล้วให้เพิ่มบรรทัดเดียว ถ้ายังต้องใส่ `"!noprecache/**/*"` ซึ่งเป็นค่า default ด้วย)
2. **Runtime cache ของเราเอง** แทนกฎ default (เพดาน 32 ไฟล์ / อายุ 1 วัน): เพิ่ม `workboxOptions.runtimeCaching` สำหรับ `/\/audio\/.*\.(?:mp3|wav)$/` แบบ `CacheFirst`, `maxEntries: 64`, `maxAgeSeconds: 30 วัน` — ปลอดภัยเพราะชื่อไฟล์มีเวอร์ชัน (ข้อ 8) · ตรวจใน `public/sw.js` ที่ build ออกมาว่ากฎของเราอยู่ **ก่อน** กฎ default (กฎแรกที่ match ชนะ)
3. **HTTP `Cache-Control` สำหรับเครื่องที่ไม่มี Service Worker** (in-app browser บางรุ่น): เพิ่ม `headers()` ใน `next.config.ts` → `/audio/:path*` = `public, max-age=31536000, immutable` (Next.js เสิร์ฟ `public/` ด้วย `max-age=0` เป็นค่าเริ่มต้น — แนวเดียวกับ [P2-3](../implementation_plan/performance-optimization-plan.md#p2-3-ตั้ง-cache-control-ให้รูปใน-public)) — ใช้ `immutable` ได้ก็เพราะกติกา **ไฟล์ที่ปล่อยแล้วห้ามแก้เนื้อหาใต้ชื่อเดิม** (ข้อ 8)
4. **ลำดับการโหลด** — เสียงต้องไม่แย่งกับของที่ผู้ใช้รออยู่:
   - Howler (โค้ด ~10 KB): โหลดหลังหน้า interactive ผ่าน `requestIdleCallback` (fallback `setTimeout` 1.5 วิ) — ไม่ใช่ตอน render
   - BGM: เริ่มดาวน์โหลด **หลังผู้ใช้แตะจอครั้งแรก** (= ตอนปลดล็อกเสียง) เท่านั้น ตาม budget "0 คำขอไฟล์เสียงก่อนแตะ" — ช่วงรอโหลดถูกกลบด้วย fade in
   - BGM เกม + SFX เกม: โหลดตอนอยู่หน้า `GameIntro` (ผู้ใช้กำลังอ่านวิธีเล่น) ผ่าน `usePreloadSfx` / preload BGM ของเกมนั้น
   - หน้าคลิป (`/lessons/[id]/video`): **ห้ามเริ่มโหลดเสียงใด ๆ** — คำขอที่ค้างอยู่ปล่อยให้จบได้ แต่ไม่เริ่มใหม่
5. **โหมดประหยัดเน็ต:** ถ้า `navigator.connection?.saveData === true` หรือ `effectiveType` เป็น `slow-2g`/`2g` **และผู้ใช้ยังไม่เคยตั้งค่าเพลงเอง** → ไม่โหลด BGM อัตโนมัติ (ถือว่า BGM ปิด) แต่ยังโหลด SFX (ไฟล์เล็ก) — ผู้ใช้เปิดเพลงเองจาก drawer ได้ (API นี้มีบน Chrome Android/LINE Android, iOS ไม่มี = ทำงานปกติ)

### 10.3 ขนาดไฟล์

- **BGM เป็น mono** 80–96 kbps: ลำโพงมือถือเป็นเสียงเดียวอยู่แล้ว และ **RAM ตอน decode ลดครึ่ง** (~5.5 MB/นาที ที่ 48 kHz แทน ~11 MB) → loop 60 วิ ≈ 600–700 KB ดาวน์โหลด, ~6 MB RAM
- **SFX:** WAV 14 ไฟล์ที่มีตอนนี้รวม ~420 KB — แปลงเป็น MP3 mono 96 kbps จะเหลือราว 60–90 KB (ตัวอย่าง: `ffmpeg -i in.wav -ac 1 -b:a 96k -write_xing 1 out-v1.mp3`) · ⚠️ MP3 มีช่องเงียบหัวไฟล์ ~25 ms ถ้าฟังแล้วเสียงชน/จับ "ช้ากว่าภาพ" ให้คงเป็น WAV เฉพาะไฟล์นั้น (WAV decode ทันที ขนาดก็ไม่มาก)
- **Audio sprite (ทางเลือก, เฟส 6):** รวม SFX ของแต่ละเกมเป็นไฟล์เดียว + ตาราง `sprite` ใน catalog (Howler รองรับ รวมถึง loop ใน sprite) → คำขอ/การ decode/ช่องแคช 1 ต่อเกมแทน 3–4 · ทำเมื่อจำนวนไฟล์เสียงเริ่มเกินเพดานแคชหรือเกมมี SFX หลายไฟล์ (ต้องมีสคริปต์ dev สร้าง sprite ด้วย ffmpeg — ไม่ใช่ runtime)

### 10.4 หน่วยความจำ

- BGM ค้างในหน่วยความจำไม่เกิน 2 เพลง; เพลงที่ไม่ถูกใช้ 60 วิ → `unload()` (ข้อ 2.3)
- **SFX ของเกม:** ออกจากกลุ่ม route ของเกมนั้น (`/lessons/[id]/{game,score,leaderboard}`) ครบ 60 วิ → `unload()` ทุก Howl ที่ key ขึ้นต้นด้วยรหัสเกมนั้น · SFX กลาง `ui.*` เก็บไว้ตลอด
- เกมที่สลับ phase ไปมา (เล่นซ้ำ/เล่นใหม่) ใช้ Howl เดิม — ห้ามสร้าง Howl ใหม่ต่อรอบเล่น
- `unload()` ของ Howler ลบ buffer ออกจาก cache ภายในด้วย (เมื่อไม่มี Howl อื่นใช้ไฟล์เดียวกัน) — 1 ไฟล์ต้องมี Howl เดียวใน wrapper เพื่อไม่ให้ buffer ค้าง

### 10.5 CPU / game loop (hot path ของ `playSfx`)

- `playSfx` ถูกเรียกใน `requestAnimationFrame` ได้ → ต้องเป็น O(1): lookup ใน `Map`, เช็ค `minIntervalMs`/`maxVoices` ด้วยตัวเลขที่เก็บไว้แล้ว, **ไม่สร้าง object/array ใหม่ต่อการเรียก** (นอกจากที่ Howler สร้างเอง), ไม่ `console.log`
- **ห้าม `setState` และห้าม `loggingService.logEvent` ใน `playSfx`** — เสียงไม่ใช่ event ที่ต้อง log และ re-render ทุกครั้งที่มีเสียงจะทำให้เกม canvas กระตุก
- เพดานเสียงรวมทั้งระบบ **12 voices** (นอกเหนือจาก `maxVoices` รายเสียง) — มือถือ Android สเปกต่ำเสียงแตก/กิน CPU เมื่อมี source node พร้อมกันมาก ๆ; เกินเพดาน → ทิ้งเสียงใหม่ (ไม่ตัดตัวที่กำลังดัง)
- **ค่าตั้ง:** ลาก slider → รวมการอัปเดต volume ของ Howl ทั้งช่องให้เหลือไม่เกิน 1 ครั้งต่อเฟรม (`requestAnimationFrame`), เขียน localStorage + cookie แบบ debounce 300 ms, log แบบ debounce 500 ms
- **React:** `useAudioSettings` ใช้ `useSyncExternalStore` โดย `getSnapshot` ต้องคืน object **ตัวเดิม** จนกว่าค่าจะเปลี่ยนจริง (ไม่งั้น render วนไม่จบ) · คอมโพเนนต์ที่แค่เล่นเสียงไม่ต้อง subscribe — เรียก `audio.playSfx` ตรง ๆ

### 10.6 แบตเตอรี่

- **ปิดเพลง = `pause()` เพลง ไม่ใช่เล่นต่อที่ volume 0** (เปิดกลับ = `play()` + fade in จากตำแหน่งเดิม) — เช่นเดียวกับ route ที่ BGM เป็น `null` เมื่อ fade out จบ → ไม่มีเสียงเล่นเลย `Howler.autoSuspend` จึง suspend `AudioContext` ได้หลัง 30 วิ (ประหยัดแบต/CPU ระหว่างทำแบบทดสอบ/ดูคลิป)
- SFX ที่ loop (`dragLoop`) ต้อง `stop()` ทันทีที่หยุดใช้ ไม่ปล่อยไว้ที่ volume 0
- แอปถูกซ่อน → `pause()` (ข้อ 6.4)

### 10.7 ความหน่วงที่ผู้ใช้รู้สึก

- Howler โหลดแบบ lazy ผ่าน `requestIdleCallback` ตอน `AudioProvider` mount — โดยปกติเสร็จก่อนผู้ใช้อ่านหน้าแรกจบ; ถ้าผู้ใช้แตะก่อน Howler โหลดเสร็จ จะปลดล็อกไม่ทันในการแตะนั้น (iOS ต้อง resume ภายใน gesture เดียวกัน) → BGM เริ่มที่การแตะครั้งถัดไป — ยอมรับได้ ไม่ต้องดึง Howler เข้า first load
- Fade in 1.5 วิตอนเริ่มเพลงช่วยกลบช่วงที่ไฟล์เพิ่ง decode เสร็จ
- ปุ่ม "เริ่ม" ในหน้า `GameIntro` ไม่ต้องรอเสียงโหลดเสร็จ — ถ้ายังไม่เสร็จ เกมเริ่มได้เลย SFX ที่ยังไม่พร้อมถูกทิ้ง (ข้อ 6.3) และ BGM เกมเข้ามาเมื่อพร้อม

---

## 11. แผนการทำ (Implementation Plan)

แบ่งเฟสให้แต่ละเฟส merge ได้เองและผู้ใช้เห็นผลทีละขั้น

> ✅ = ทำแล้วและตรวจด้วย unit test / E2E / build จริง (2026-11-02) · ☐ = ยังค้าง — **ทั้งระบบยังไม่ได้ทดสอบบนมือถือจริง** จึงยังไม่ถือว่า Done

### เฟส 0 — เตรียม
- [ ] ตัดสิน Open decisions ข้อ 12 — ตอนนี้โค้ดใช้ค่าตามข้อเสนอทุกข้อไปก่อน (เปิด BGM เบา 0.35, เพลงเกมเพลงเดียว, หน้าแบบทดสอบเงียบ, ไม่มี SFX ของ UI, ปล่อยตามสวิตช์เงียบของ iPhone)
- [ ] หา/ทำไฟล์ BGM `menu` และ `game` (loop สั้น mono ตามข้อ 8 / 10.3, license ใช้ได้) แล้วเพิ่มบรรทัดใน `BGM` ของ `audioCatalog.ts` (มีบรรทัดตัวอย่างที่ comment ไว้) + `public/audio/CREDITS.md` บอกที่มา/license ของไฟล์ SFX ชุดแรกด้วย
- [x] แก้ `proxy.ts` matcher (ข้อ 9.1)
- [x] `next.config.ts`: ตัด `audio/` ออกจาก precache, runtime cache ของเสียง (64 ไฟล์ / 30 วัน, อยู่ลำดับแรกของกฎ asset), `Cache-Control` immutable — ตรวจใน `public/sw.js` ที่ build แล้ว
- [ ] แปลง SFX WAV → MP3 mono (ข้อ 10.3) — **ยังไม่ทำ:** เครื่องที่ทำงานไม่มี ffmpeg และต้องมีคนฟังเทียบทีละไฟล์; WAV ชุดปัจจุบันรวม ~420 KB ใช้ได้ไปก่อน (ไม่อยู่ใน precache แล้ว)
- [x] `howler@2.2.4` + `@types/howler@2.2.13`

### เฟส 1 — Wrapper + ค่าตั้ง + SFX
- [x] `audioCatalog.ts`, `audioSettings.ts` (localStorage + cookie, default, clamp, ล้างค่าพร้อมปุ่มรีเซ็ตใน drawer)
- [x] `audioMath.ts`: `effectiveVolume()`, `resolveBgm()`, `gameLessonOf()`, `isConstrainedNetwork()`
- [x] `audioEngine.ts` ตามข้อ 5 / 10.5
- [x] Unit test `src/tests/unit/audio.test.ts` (Howler mock): ยังไม่โหลด/ยังไม่ปลดล็อก/ไฟล์ยังไม่พร้อม = ไม่เล่น, minInterval, maxVoices, เพดานรวม 12, mute/volume ทุก Howl, snapshot คงที่, บันทึกค่าแบบ debounce, ค่าตั้งรอด reload (localStorage / cookie) + ซ่อมค่าเสีย

### เฟส 2 — BGM + crossfade + UI
- [x] BGM: crossfade, key เดิมไม่เริ่มใหม่, pause หลัง fade + unload หลัง 60 วิ, ไม่โหลดก่อนปลดล็อก, ปิดเพลง = pause, duck, override, ซ่อนแอป, เน็ตช้า (unit test) — ⚠️ ยังไม่เคยฟังจริงเพราะยังไม่มีไฟล์ BGM
- [x] ลำดับการโหลด: Howler ตอน idle, BGM หลังแตะ, SFX เกมตอน mount เกม, หน้าคลิปไม่โหลด (E2E)
- [x] `resolveBgm()` + unit test ครบทุก route ใน `src/app`
- [x] `AudioProvider` (ใน `layout.tsx`), `useBgmOverride`, `useAudioSettings`, `usePreloadSfx`
- [x] `GameAudioToggle` ใน `GameStageHeader`/`GameIntro` + แถว "เสียง" ใน drawer (drawer เลื่อนได้แล้ว), log `audio_setting_change` (E2E)
- [x] `window.__audioDebug` นอก production

### เฟส 3 — SFX ในเกม
- [x] G13: รับไอติม / รับคู่ / โดนระเบิด
- [x] G17: ชนแถบ / แตกกล่อง / เก็บไอเทม
- [x] G19: สลับ / จับคู่ / ผลไม้ตก / ของพิเศษระเบิด
- [x] G20 + G20K: เสียงลากเล็ง (loop หยุดตอนปล่อย/ยกเลิก/unmount) / โยน / ลงจาน / พลาด
- [x] G18 ใช้ `audio.playTone` แทน `AudioContext` ของตัวเอง
- [x] unload SFX ของเกม 60 วิหลังออกจากกลุ่ม route ของเกมนั้น
- [ ] SFX กลาง `ui.*` — รอ Open decision ข้อ 12.4 + ไฟล์เสียง
- [x] แก้ GDD G19 / G20 ที่เขียนว่าไม่มีเสียง
- [ ] ปรับ `gain` / `maxVoices` / `minIntervalMs` ใน catalog หลังฟังบนเครื่องจริง (ค่าตอนนี้ตั้งจากการเดา)

### เฟส 4 — Ducking กับ TTS / วิดีโอ
- [x] `duck/unduck` + test ref-count
- [x] `src/lib/audio/speech.ts` แล้วย้าย G2, G4, G5, G9, G10, G12, `QuizScreen` มาใช้ (ไม่มี `speechSynthesis` ตรงในคอมโพเนนต์แล้ว)
- [x] GP5 duck ตอนเปิดเสียงคลิป

### เฟส 5 — QA + เอกสาร
- [x] E2E `src/tests/e2e/audio.spec.ts` (5 เคส) + `fun-game-viewport.spec.ts` ยังผ่านทั้ง 25 เคสหลังเพิ่มปุ่มใน header
- [ ] Manual QA matrix (ข้อ 13) บนมือถือจริง — **ยังไม่ทำ** รวมถึงดู RAM ตอนสลับเมนู ↔ เกมหลายรอบ
- [ ] วัด budget ข้อ 10.1 ที่เหลือ (RAM, เสียงพร้อมกันระหว่างเล่นจริง) — ผลที่วัดแล้วอยู่ใต้ตารางข้อ 10.1
- [x] อัปเดต `AGENT.md`, `docs/index.md`, `docs/changelog.md`, สถานะ feedback ข้อ 11

### เฟส 6 — Audio sprite (ทางเลือก)
- [ ] สคริปต์ dev สร้าง sprite ต่อเกมด้วย ffmpeg + ตาราง `sprite` ใน catalog (ข้อ 10.3)

---

## 12. Open decisions (ต้องให้ทีมตัดสิน)

| # | คำถาม | ข้อเสนอ |
|---|---|---|
| 1 | BGM เปิดเป็นค่าเริ่มต้นไหม? | **เปิด แต่เบา (0.35)** — ปิดได้ทันทีจากปุ่มในเกม/drawer; ถ้าทดสอบหน้างานแล้วรบกวนวิทยากร ค่อยเปลี่ยนเป็นปิดตั้งต้น (แก้ค่า default ค่าเดียว) |
| 2 | เพลงเกม: เพลงเดียวทุกเกม หรือแยกรายเกม? | เริ่มด้วย `game` เพลงเดียว + เปิดช่องให้เพิ่มรายเกมใน catalog ภายหลัง (ไม่ต้องแก้โค้ด) |
| 3 | หน้าแบบทดสอบ pre/post และ self-assessment มีเพลงไหม? | **เงียบ** — เป็นเครื่องมือวิจัย ไม่อยากให้ตัวแปรเพลงมีผลกับคำตอบ |
| 4 | มี SFX ของ UI ทั่วไป (กดปุ่ม/ตอบถูก/ได้ดาว) นอกเกมสนุกไหม? | มีแค่ตอบถูก/ได้ดาว (positive reinforcement) ไม่ใส่เสียงกดปุ่มทุกปุ่ม |
| 5 | iPhone สวิตช์ปิดเสียง (silent switch): โหมด Web Audio จะเงียบเมื่อเปิดโหมดเงียบ | ปล่อยตามสวิตช์ (เคารพการตั้งค่าเครื่อง) แต่ใส่ใน FAQ วิทยากร "ไม่มีเสียง → เช็คปุ่มข้างเครื่อง"; ทางเลือก: ตั้ง `navigator.audioSession.type = "playback"` (Safari 17+) ให้ดังแม้เปิดโหมดเงียบ |
| 6 | แหล่งเพลง / license / ใช้ AI สร้างไหม? | ใช้เพลง royalty-free ที่ระบุ license ชัด; ถ้าใช้ AI ต้องแสดงการเปิดเผยตามนโยบาย |
| 7 | Facilitator Mode (จอฉาย) มีเพลงไหม? | ไม่มี (ห้องอบรมมีเสียงวิทยากร) |
| 8 | ให้ผู้เล่นปิดเสียง / ปรับความดังเองได้ไหม? | ⏸ ตอนนี้ซ่อนปุ่มไว้ (`AUDIO_CONTROLS_ENABLED = false`) — รอทีมตัดสิน; ข้อควรคิด: กติกา [Art Direction](../gdd/03-art-direction.md) เขียนว่า "เพลงประกอบเบา ๆ ปิดได้ง่าย (ปุ่มชัดเจน)" ถ้าตัดสินไม่ให้ปิด ควรแก้กติกานั้นให้ตรงกัน |

---

## 13. Manual QA matrix

| กรณี | iPhone Safari | LINE iOS | LINE Android | Chrome Android |
|---|---|---|---|---|
| แตะครั้งแรกแล้ว BGM เมนูดัง (fade in) | | | | |
| เมนู → เกม crossfade ไม่มีช่องเงียบ/เสียงคลิก | | | | |
| เมนู ↔ เมนู เพลงเล่นต่อ ไม่เริ่มใหม่ | | | | |
| หน้าคลิป BGM เงียบ, กลับมาเพลงต่อ | | | | |
| SFX ยิงถี่ (G17 ลูกบอล) ไม่หน่วง/ไม่แตก | | | | |
| ปิดเพลง/ปิดเอฟเฟกต์ แยกกันได้, reload แล้วค่ายังอยู่ | | | | |
| สลับแอป/ล็อกจอ → เงียบ; กลับมา → เล่นต่อ | | | | |
| TTS อ่านโจทย์ → BGM หรี่ แล้วกลับ | | | | |
| G18 โทนปุ่มเงียบเมื่อปิด SFX | | | | |
| สลับเมนู ↔ เกม 10 รอบ ไม่ค้าง/ไม่ถูกปิดแท็บเพราะ RAM | | | | |
| เปิดโหมดเงียบ (iOS) — พฤติกรรมตรงกับข้อ 12.5 | | — | — | |
| หน้าแรก: ไม่มีคำขอไฟล์เสียงก่อนแตะจอ; หน้าคลิป: ไม่มีคำขอไฟล์เสียงเลย | | | | |
| เปิดแอปรอบสอง (มีแคชแล้ว) ไฟล์เสียงมาจากแคช ไม่โหลดซ้ำ | | | | |
| เปิด Data Saver (Android) — BGM ไม่โหลดเอง, SFX ยังดัง | — | — | | |
| เน็ตช้า/ออฟไลน์: เกมเล่นได้ปกติแม้ไฟล์เสียงโหลดไม่ขึ้น | | | | |
