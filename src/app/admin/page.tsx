import { notFound, redirect } from "next/navigation";
import { isDataExportEnabled } from "@/lib/adminAuth";

export default function AdminIndexPage() {
  if (!isDataExportEnabled()) notFound();
  redirect("/admin/data-export");
}
