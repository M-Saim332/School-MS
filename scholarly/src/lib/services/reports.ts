import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types/database";

export async function getReports(user: AppUser) {
  const supabase = await createClient();
  const [attendance, archived, enrollment, activity] = await Promise.all([
    supabase
      .from("attendance_records")
      .select("attendance_date,status,classes(name),students(first_name,last_name,admission_number)")
      .eq("school_id", user.schoolId)
      .order("attendance_date", { ascending: false })
      .limit(200),
    supabase
      .from("students")
      .select("id,admission_number,first_name,last_name,archived_at")
      .eq("school_id", user.schoolId)
      .eq("status", "archived")
      .order("archived_at", { ascending: false }),
    supabase.from("class_enrollment_counts").select("grade_name,class_name,student_count").eq("school_id", user.schoolId),
    supabase.from("activity_logs").select("id,action,entity_type,created_at").eq("school_id", user.schoolId).order("created_at", { ascending: false }).limit(50)
  ]);

  return {
    attendance: attendance.data ?? [],
    archived: archived.data ?? [],
    enrollment: enrollment.data ?? [],
    activity: activity.data ?? []
  };
}
