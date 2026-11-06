import { notFound, redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getExportMode, isDataExportEnabled, safeAdminNext } from "@/lib/adminAuth";
import { MODE_SITE_LABEL } from "@/lib/export/registry";
import { createSupabaseServerClient, getAdminIdentity } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!isDataExportEnabled()) notFound();
  const next = safeAdminNext((await searchParams).next);

  const identity = await getAdminIdentity(await createSupabaseServerClient(), { fresh: false });
  if (identity.status !== "anonymous") redirect(next);

  return (
    <main className="mx-auto mt-12 max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-h2">เข้าสู่ระบบเจ้าหน้าที่</h1>
      <p className="mt-2 text-caption text-[#475569]">
        ดึงข้อมูล — {MODE_SITE_LABEL[getExportMode()]} · ใช้บัญชีที่เจ้าหน้าที่สร้างให้ใน Supabase ของเซิร์ฟเวอร์นี้
      </p>
      <AdminLoginForm next={next} />
    </main>
  );
}
