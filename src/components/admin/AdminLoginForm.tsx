"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/admin/actions";

const INITIAL: SignInState = { error: null };

export default function AdminLoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1">
        <span className="text-caption">อีเมล</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="min-h-[48px] rounded-lg border border-[#94a3b8] px-3 text-body focus:border-[#4c1d95] focus:outline-none focus:ring-2 focus:ring-[#c4b5fd]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-caption">รหัสผ่าน</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-[48px] rounded-lg border border-[#94a3b8] px-3 text-body focus:border-[#4c1d95] focus:outline-none focus:ring-2 focus:ring-[#c4b5fd]"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-[#fef2f2] px-3 py-2 text-caption text-[#991b1b]">
          ✗ {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-[48px] rounded-lg bg-[#4c1d95] px-4 text-button text-white hover:bg-[#3b0764] disabled:opacity-60"
      >
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
