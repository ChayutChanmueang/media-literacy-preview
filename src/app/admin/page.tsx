import { notFound, redirect } from "next/navigation";
import { isDataExportEnabled } from "@/lib/adminAuth";

// SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are runtime env. Without this the page is prerendered at
// `next build` (where they are unset, e.g. in the Docker image build) and /admin is baked in as a 404.
export const dynamic = "force-dynamic";

export default function AdminIndexPage() {
  if (!isDataExportEnabled()) notFound();
  redirect("/admin/data-export");
}
