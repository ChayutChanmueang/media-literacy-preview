"use server";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isDataExportEnabled, safeAdminNext } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SignInState {
  error: string | null;
}

// Every login reaches Supabase Auth from this container's IP, so Auth's own per-IP limit would count
// all staff together — limit failed attempts per visitor IP here instead.
const FAILURE_WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;
const failures = new Map<string, number[]>();

function recentFailures(ip: string, now: number) {
  const recent = (failures.get(ip) ?? []).filter((at) => at > now - FAILURE_WINDOW_MS);
  failures.set(ip, recent);
  return recent;
}

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  if (!isDataExportEnabled()) notFound();

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  if (recentFailures(ip, now).length >= MAX_FAILURES) {
    return { error: "ลองเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (!error.status || error.status >= 500) {
      console.error("[DataExport] Supabase Auth unreachable during sign-in:", error.message);
      return { error: "เชื่อมต่อระบบยืนยันตัวตนไม่ได้ กรุณาลองใหม่ หรือแจ้งผู้ดูแลระบบ" };
    }
    failures.get(ip)?.push(now);
    // One message for every credential problem — never reveal whether the email has an account
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  failures.delete(ip);
  redirect(safeAdminNext(formData.get("next")));
}

export async function signOut(): Promise<void> {
  if (isDataExportEnabled()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
