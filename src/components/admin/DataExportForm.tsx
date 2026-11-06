"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "@/app/admin/actions";
import {
  COLUMN_DICTIONARY,
  DATASETS,
  GROUP_IDS,
  MODE_SITE_LABEL,
  STATIC_GROUP_COLUMNS,
  TIME_NOTE,
  unavailableNote,
  type DatasetAvailability,
  type DatasetId,
  type DatasetInfo,
  type ExportPageMeta,
  type FileId,
  type GroupId,
} from "@/lib/export/registry";
import type { AppMode } from "@/services/progressService";

/**
 * Staff data export form (docs/software/12 §6). Every dataset is listed on both sites; one this site
 * doesn't have is a disabled, unticked checkbox with a note saying where it lives.
 */

const PREFS_KEY = "naplab_ml_admin_export_prefs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ERROR_TEXT: Record<string, string> = {
  invalid_request: "คำขอไม่ถูกต้อง — ตรวจ session id และชุดข้อมูลที่เลือก",
  session_not_found: "ไม่พบ session นี้บนเซิร์ฟเวอร์นี้ (อาจอยู่บนเว็บอีกโหมด)",
  dataset_unavailable: "มีชุดข้อมูลที่เว็บนี้ไม่มี — รีเฟรชหน้าแล้วเลือกใหม่",
  db_mode_mismatch: "ฐานข้อมูลไม่ตรงกับโหมดของเว็บนี้ — แจ้งผู้ดูแลระบบ",
  not_migrated: "ฐานข้อมูลยังไม่ได้เตรียมสำหรับการดึงข้อมูล — แจ้งผู้ดูแลระบบ",
  forbidden: "บัญชีนี้ไม่มีสิทธิ์ดึงข้อมูล",
  export_failed: "ดึงข้อมูลไม่สำเร็จ กรุณาลองใหม่",
};

const MODE_BADGE: Record<AppMode, string> = {
  research: "bg-[#ede9fe] text-[#4c1d95] border-[#7c3aed]",
  normal: "bg-[#ccfbf1] text-[#115e59] border-[#0d9488]",
};

interface Prefs {
  selected: DatasetId[];
  saItems: boolean;
  registeredOnly: boolean;
}

function readPrefs(): Partial<Prefs> {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
  } catch {
    return {};
  }
}

function writePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // private mode / blocked storage — remembering choices is only a convenience
  }
}

function fileCount(selected: Set<DatasetId>) {
  const groups = GROUP_IDS.some((id) => selected.has(id)) ? 1 : 0;
  return groups + (selected.has("event_log") ? 1 : 0) + (selected.has("usage_detail") ? 2 : 0) + (selected.has("leaderboard") ? 1 : 0);
}

function DatasetCheckbox({
  info,
  availability,
  checked,
  onChange,
  children,
}: {
  info: DatasetInfo;
  availability: DatasetAvailability | undefined;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}) {
  const available = availability?.available ?? false;
  const noteId = `note-${info.id}`;
  return (
    <div className="py-1">
      <label className={`flex min-h-[48px] items-center gap-3 ${available ? "cursor-pointer" : "cursor-not-allowed"}`}>
        <input
          type="checkbox"
          className="h-6 w-6 shrink-0 accent-[#4c1d95]"
          checked={available && checked}
          disabled={!available}
          aria-describedby={available ? undefined : noteId}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className={available ? "text-body" : "text-body text-[#475569]"}>
          {info.label}
          {info.hint && <span className="ml-2 text-caption text-[#475569]">({info.hint})</span>}
        </span>
      </label>
      {!available && (
        <p id={noteId} className="ml-9 text-caption text-[#9a3412]">
          ⓘ {unavailableNote(info, availability?.reason)}
        </p>
      )}
      {children}
    </div>
  );
}

export default function DataExportForm({ mode, email, meta }: { mode: AppMode; email: string; meta: ExportPageMeta | null }) {
  const availability = useMemo(() => new Map((meta?.datasets ?? []).map((d) => [d.id, d])), [meta]);
  const isAvailable = (id: DatasetId) => availability.get(id)?.available ?? false;

  const [scope, setScope] = useState<"all" | "session">("all");
  const [sessionId, setSessionId] = useState("");
  const [registeredOnly, setRegisteredOnly] = useState(false);
  const [pairOnly, setPairOnly] = useState(false);
  const [selected, setSelected] = useState<Set<DatasetId>>(new Set());
  const [saItems, setSaItems] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ counts: Record<string, number>; notes: string[] } | null>(null);
  const [showDictionary, setShowDictionary] = useState(false);

  // Restore last choices (never the session id); a dataset this site lacks is never restored as ticked
  useEffect(() => {
    const prefs = readPrefs();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser storage after hydration
    setSelected(new Set((prefs.selected ?? ["age", "location"]).filter((id) => availability.get(id)?.available)));
    if (typeof prefs.saItems === "boolean") setSaItems(prefs.saItems);
    if (typeof prefs.registeredOnly === "boolean") setRegisteredOnly(prefs.registeredOnly);
    setPrefsLoaded(true);
  }, [availability]);

  useEffect(() => {
    if (prefsLoaded) writePrefs({ selected: [...selected], saItems, registeredOnly });
  }, [prefsLoaded, selected, saItems, registeredOnly]);

  const toggle = (id: DatasetId, on: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    if (id === "self_assessment" && !on) setPairOnly(false);
  };
  const selectAll = () => setSelected(new Set(DATASETS.map((d) => d.id).filter(isAvailable)));
  const clearAll = () => {
    setSelected(new Set());
    setPairOnly(false);
  };

  const effective = new Set([...selected].filter(isAvailable));
  const saOn = effective.has("self_assessment");
  const files = fileCount(effective);
  const trimmedSession = sessionId.trim();
  const sessionInvalid = scope === "session" && !UUID.test(trimmedSession);
  const blocked = !meta || !meta.dbMatchesMode || !meta.migrated;
  const canDownload = !busy && !blocked && files > 0 && !sessionInvalid;

  const previewColumns = useMemo(() => {
    const columns = ["session_id"];
    for (const id of GROUP_IDS) {
      if (!effective.has(id)) continue;
      columns.push(...STATIC_GROUP_COLUMNS[id]);
      if (id === "self_assessment" && saItems) columns.push("sa_pre_01…", "sa_post_…");
      if (id === "event_breakdown") columns.push("ev_<event_name>…");
      if (id === "completion_funnel") columns.push("funnel_<step>_at…", "funnel_furthest_step");
      if (id === "lesson_progress") columns.push("lesson_<id>_video_at…");
    }
    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `effective` is derived from `selected`
  }, [selected, saItems, availability]);

  async function download() {
    setBusy(true);
    setError(null);
    setDone(null);
    const groups = GROUP_IDS.filter((id) => effective.has(id));
    const fileIds = (["event_log", "usage_detail", "leaderboard"] as FileId[]).filter((id) => effective.has(id));
    try {
      const response = await fetch("/api/admin/export", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: scope === "all" ? { type: "all" } : { type: "session", session_id: trimmedSession },
          row_filter: { registered_only: registeredOnly, self_assessment_pair_only: saOn && pairOnly },
          groups,
          group_options: { self_assessment_items: saItems },
          files: fileIds,
        }),
      });
      if (response.status === 401) {
        window.location.href = "/admin/login?next=/admin/data-export";
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(ERROR_TEXT[body.error as string] ?? ERROR_TEXT.export_failed);
        return;
      }
      const blob = await response.blob();
      const name = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? "export";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      let counts: Record<string, number> = {};
      let notes: string[] = [];
      try {
        counts = JSON.parse(response.headers.get("X-Export-Row-Counts") ?? "{}");
        notes = JSON.parse(decodeURIComponent(response.headers.get("X-Export-Notes") ?? "%5B%5D"));
      } catch {
        // counts are informational only
      }
      setDone({ counts, notes });
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  const groupInfos = DATASETS.filter((d) => d.kind === "group");
  const fileInfos = DATASETS.filter((d) => d.kind === "file");
  const saInfo = DATASETS.find((d) => d.id === "self_assessment")!;

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-h2">ดึงข้อมูล</h1>
          <p className={`mt-2 inline-block rounded-full border-2 px-3 py-1 text-caption ${MODE_BADGE[mode]}`}>
            {MODE_SITE_LABEL[mode]}
          </p>
          {meta && (
            <p className="mt-2 text-caption text-[#475569]">
              {meta.sessionCount.toLocaleString("th-TH")} sessions · {meta.eventCount.toLocaleString("th-TH")} events ·
              ข้อมูล ณ {new Date(meta.generatedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
            </p>
          )}
        </div>
        <form action={signOut} className="flex flex-col items-end gap-1">
          <span className="text-caption text-[#475569]">{email}</span>
          <button type="submit" className="min-h-[48px] rounded-lg border border-[#475569] px-4 text-button hover:bg-[#f1f5f9]">
            ออกจากระบบ
          </button>
        </form>
      </header>

      {!meta && (
        <p role="alert" className="rounded-xl bg-[#fef2f2] p-4 text-body text-[#991b1b]">
          ✗ โหลดข้อมูลเซิร์ฟเวอร์ไม่สำเร็จ กรุณารีเฟรชหน้า — ถ้ายังไม่ได้ แจ้งผู้ดูแลระบบ
        </p>
      )}
      {meta && !meta.dbMatchesMode && (
        <p role="alert" className="rounded-xl bg-[#fef2f2] p-4 text-body text-[#991b1b]">
          ✗ ฐานข้อมูลอาจไม่ใช่ของเซิร์ฟเวอร์โหมดวิจัย (ไม่พบตารางแบบประเมิน) — ปิดการดาวน์โหลดไว้ แจ้งผู้ดูแลระบบให้ตรวจ DATABASE_URL
        </p>
      )}
      {meta && meta.dbMatchesMode && !meta.migrated && (
        <p role="alert" className="rounded-xl bg-[#fef2f2] p-4 text-body text-[#991b1b]">
          ✗ ฐานข้อมูลยังไม่ได้เตรียมสำหรับการดึงข้อมูล (ไม่มีตาราง data_export_audit) — แจ้งผู้ดูแลระบบให้รัน scripts/migrate-data-export.cjs
        </p>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-h3">1) ข้อมูลของใคร</h2>
        <fieldset className="mt-3 flex flex-col gap-1">
          <legend className="sr-only">ขอบเขตข้อมูล</legend>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
            <input type="radio" name="scope" className="h-6 w-6 accent-[#4c1d95]" checked={scope === "all"} onChange={() => setScope("all")} />
            <span className="text-body">ทุกคน</span>
          </label>
          <label className="flex min-h-[48px] cursor-pointer flex-wrap items-center gap-3">
            <input type="radio" name="scope" className="h-6 w-6 accent-[#4c1d95]" checked={scope === "session"} onChange={() => setScope("session")} />
            <span className="text-body">เฉพาะ session id:</span>
            <input
              type="text"
              inputMode="text"
              spellCheck={false}
              aria-label="session id"
              aria-invalid={scope === "session" && trimmedSession !== "" && sessionInvalid}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={sessionId}
              onFocus={() => setScope("session")}
              onChange={(event) => setSessionId(event.target.value)}
              className="min-h-[48px] min-w-0 flex-1 rounded-lg border border-[#94a3b8] px-3 font-mono text-caption"
            />
          </label>
          {scope === "session" && trimmedSession !== "" && sessionInvalid && (
            <p className="text-caption text-[#991b1b]">✗ รูปแบบ session id ไม่ถูกต้อง</p>
          )}
        </fieldset>
        <div className="mt-2 border-t border-[#e2e8f0] pt-2">
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
            <input type="checkbox" className="h-6 w-6 accent-[#4c1d95]" checked={registeredOnly} onChange={(e) => setRegisteredOnly(e.target.checked)} />
            <span className="text-body">เฉพาะคนที่ลงทะเบียนแล้ว</span>
          </label>
          <div>
            <label className={`flex min-h-[48px] items-center gap-3 ${saOn ? "cursor-pointer" : "cursor-not-allowed"}`}>
              <input
                type="checkbox"
                className="h-6 w-6 accent-[#4c1d95]"
                checked={saOn && pairOnly}
                disabled={!saOn}
                aria-describedby={saOn ? undefined : "note-pair-only"}
                onChange={(e) => setPairOnly(e.target.checked)}
              />
              <span className={saOn ? "text-body" : "text-body text-[#475569]"}>เฉพาะคนที่ทำแบบประเมินครบทั้งก่อนและหลังเรียน</span>
            </label>
            {!saOn && (
              <p id="note-pair-only" className="ml-9 text-caption text-[#9a3412]">
                ⓘ{" "}
                {isAvailable("self_assessment")
                  ? "ใช้ได้เมื่อติ๊ก \"แบบประเมินตนเองก่อน/หลังเรียน\" ด้านล่าง"
                  : unavailableNote(saInfo, availability.get("self_assessment")?.reason)}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h3">2) เลือกข้อมูล</h2>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="min-h-[48px] rounded-lg border border-[#94a3b8] px-3 text-button hover:bg-[#f1f5f9]">
              เลือกทั้งหมด
            </button>
            <button type="button" onClick={clearAll} className="min-h-[48px] rounded-lg border border-[#94a3b8] px-3 text-button hover:bg-[#f1f5f9]">
              ล้าง
            </button>
          </div>
        </div>

        <h3 className="mt-4 text-body-lg">ข้อมูลรายคน → รวมเป็นไฟล์เดียว participants.csv (1 แถวต่อคน)</h3>
        <div className="mt-1">
          {groupInfos.map((info) => (
            <DatasetCheckbox
              key={info.id}
              info={info}
              availability={availability.get(info.id)}
              checked={selected.has(info.id)}
              onChange={(on) => toggle(info.id, on)}
            >
              {info.id === "self_assessment" && isAvailable("self_assessment") && (
                <label className={`ml-9 flex min-h-[48px] items-center gap-3 ${saOn ? "cursor-pointer" : "cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    className="h-6 w-6 accent-[#4c1d95]"
                    checked={saOn && saItems}
                    disabled={!saOn}
                    onChange={(e) => setSaItems(e.target.checked)}
                  />
                  <span className={saOn ? "text-caption" : "text-caption text-[#475569]"}>รวมคำตอบรายข้อ (sa_pre_01 … sa_post_12)</span>
                </label>
              )}
            </DatasetCheckbox>
          ))}
        </div>

        <h3 className="mt-4 text-body-lg">ไฟล์แยก (หลายแถวต่อคน)</h3>
        <div className="mt-1">
          {fileInfos.map((info) => (
            <DatasetCheckbox
              key={info.id}
              info={info}
              availability={availability.get(info.id)}
              checked={selected.has(info.id)}
              onChange={(on) => toggle(info.id, on)}
            >
              {info.id === "leaderboard" && isAvailable("leaderboard") && !!meta?.leaderboardWithoutSession && (
                <p className="ml-9 text-caption text-[#475569]">
                  มีคะแนนเก่า {meta.leaderboardWithoutSession} แถวที่ไม่รู้ว่าเป็นของ session ไหน — จะรวมเฉพาะตอนดึง &quot;ทุกคน&quot; โดยไม่มีตัวกรอง
                </p>
              )}
            </DatasetCheckbox>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        {effective.size > 0 && GROUP_IDS.some((id) => effective.has(id as GroupId)) && (
          <div>
            <p className="text-caption text-[#475569]">คอลัมน์ใน participants.csv:</p>
            <p className="mt-1 break-words font-mono text-caption">{previewColumns.join(", ")}</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowDictionary((v) => !v)}
            aria-expanded={showDictionary}
            className="min-h-[48px] rounded-lg border border-[#94a3b8] px-4 text-button hover:bg-[#f1f5f9]"
          >
            คำอธิบายคอลัมน์
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!canDownload}
            className="min-h-[48px] rounded-lg bg-[#4c1d95] px-6 text-button text-white hover:bg-[#3b0764] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
          >
            {busy ? "กำลังเตรียมไฟล์…" : files === 0 ? "เลือกข้อมูลก่อน" : files === 1 ? "ดาวน์โหลด (.csv)" : `ดาวน์โหลด (.zip, ${files} ไฟล์)`}
          </button>
        </div>

        {showDictionary && (
          <div className="mt-4 rounded-xl bg-[#f8fafc] p-4">
            <p className="text-caption">{TIME_NOTE}</p>
            <ul className="mt-2 flex flex-col gap-2">
              {COLUMN_DICTIONARY.map((entry) => (
                <li key={`${entry.file}-${entry.column}`} className="text-caption">
                  <span className="font-mono">[{entry.file}] {entry.column}</span> — {entry.meaning}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div aria-live="polite">
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-[#fef2f2] px-3 py-2 text-body text-[#991b1b]">
              ✗ {error}
            </p>
          )}
          {done && (
            <div className="mt-4 rounded-lg bg-[#f0fdf4] px-3 py-2 text-[#166534]">
              <p className="text-body">✓ ดาวน์โหลดแล้ว</p>
              <ul className="mt-1">
                {Object.entries(done.counts).map(([file, count]) => (
                  <li key={file} className="text-caption">
                    {file} — {count.toLocaleString("th-TH")} แถว{count === 0 ? " (ไม่มีข้อมูล มีแต่หัวคอลัมน์)" : ""}
                  </li>
                ))}
              </ul>
              {done.notes.map((note) => (
                <p key={note} className="mt-1 text-caption">
                  ⓘ {note}
                </p>
              ))}
            </div>
          )}
        </div>
        <p className="mt-4 text-caption text-[#475569]">⚠️ ข้อมูลวิจัย — ห้าม commit เข้า repo และห้ามแชร์สาธารณะ</p>
      </section>
    </main>
  );
}
