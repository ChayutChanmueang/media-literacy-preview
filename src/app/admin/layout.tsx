import type { Metadata } from "next";

// Staff-only pages (docs/software/12) — reachable by URL only, never indexed.
export const metadata: Metadata = {
  title: "ดึงข้อมูล — รู้ทันสื่อ (เจ้าหน้าที่)",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen w-full bg-[#f1f5f9] text-[#0f172a]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">{children}</div>
    </div>
  );
}
