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
