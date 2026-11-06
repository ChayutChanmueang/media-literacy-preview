import { notFound, redirect } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import DataExportForm from "@/components/admin/DataExportForm";
import { getExportMode, isDataExportEnabled } from "@/lib/adminAuth";
import { getDatabasePool } from "@/lib/database";
import { countLeaderboardWithoutSession, readCounts, readDbFacts } from "@/lib/export/queries";
import type { ExportPageMeta } from "@/lib/export/registry";
import { datasetAvailability, dbMatchesMode } from "@/lib/export/run";
import { createSupabaseServerClient, getAdminIdentity } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function loadMeta(mode: ReturnType<typeof getExportMode>): Promise<ExportPageMeta | null> {
  try {
    const pool = getDatabasePool();
    const facts = await readDbFacts(pool);
    const counts = await readCounts(pool);
    const datasets = datasetAvailability(mode, facts);
    const leaderboardOn = datasets.some((d) => d.id === "leaderboard" && d.available);
    return {
      generatedAt: new Date().toISOString(),
      sessionCount: counts.sessionCount,
      eventCount: counts.eventCount,
      datasets,
      dbMatchesMode: dbMatchesMode(mode, facts),
      leaderboardWithoutSession: leaderboardOn ? await countLeaderboardWithoutSession(pool) : null,
    };
  } catch (error) {
    console.error("[DataExport] Could not read export metadata:", error);
    return null;
  }
}

export default async function DataExportPage() {
  if (!isDataExportEnabled()) notFound();

  const identity = await getAdminIdentity(await createSupabaseServerClient(), { fresh: false });
  if (identity.status === "anonymous") redirect("/admin/login?next=/admin/data-export");

  if (identity.status === "forbidden") {
    return (
      <main className="mx-auto mt-12 max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-h2">บัญชีนี้ไม่มีสิทธิ์ดึงข้อมูล</h1>
        <p className="mt-3 text-body">
          เซสชันนี้เป็นผู้ใช้แบบไม่ระบุตัวตน — ออกจากระบบแล้วเข้าใหม่ด้วยบัญชีที่เจ้าหน้าที่สร้างให้
        </p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="min-h-[48px] rounded-lg border border-[#4c1d95] px-4 text-button text-[#4c1d95] hover:bg-[#f5f3ff]"
          >
            ออกจากระบบ
          </button>
        </form>
      </main>
    );
  }

  const mode = getExportMode();
  return <DataExportForm mode={mode} email={identity.email ?? identity.userId} meta={await loadMeta(mode)} />;
}
