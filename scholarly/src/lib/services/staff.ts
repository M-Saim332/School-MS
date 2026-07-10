import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types/database";

export async function getStaff(user: AppUser, role = "all", q = "") {
  const supabase = await createClient();
  let query = supabase
    .from("staff_directory")
    .select("*")
    .eq("school_id", user.schoolId)
    .order("full_name");

  if (role !== "all") query = query.eq("role", role);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,department.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
