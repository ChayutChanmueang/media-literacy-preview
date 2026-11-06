import type { SupabaseClient } from "@supabase/supabase-js";

export async function authorizeExporter(
  supabase: Pick<SupabaseClient, "auth">,
  token: string,
): Promise<"unauthenticated" | "forbidden" | null> {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return "unauthenticated";
  return data.user.is_anonymous ? "forbidden" : null;
}