import { createClient } from "@/lib/supabase/server";
import type { AppUser, Json } from "@/types/database";

export async function logActivity(user: AppUser, action: string, entityType: string, entityId: string | null, metadata: Json = {}) {
  const supabase = await createClient();
  await supabase.from("activity_logs").insert({
    school_id: user.schoolId,
    actor_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}

export async function getActivityLogs(user: AppUser, limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, action, entity_type, created_at, metadata, profiles(full_name)")
    .eq("school_id", user.schoolId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
