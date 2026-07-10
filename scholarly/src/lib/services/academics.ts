import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types/database";

export async function getAcademicOptions(user: AppUser) {
  const supabase = await createClient();
  const [years, grades, sections, subjects, classes] = await Promise.all([
    supabase.from("academic_years").select("*").eq("school_id", user.schoolId).order("starts_on", { ascending: false }),
    supabase.from("grades").select("*").eq("school_id", user.schoolId).order("sort_order"),
    supabase.from("sections").select("*").eq("school_id", user.schoolId).order("name"),
    supabase.from("subjects").select("*").eq("school_id", user.schoolId).order("name"),
    supabase
      .from("classes")
      .select("id,name,room,grade_id,section_id,academic_year_id,grades(name),sections(name),academic_years(name)")
      .eq("school_id", user.schoolId)
      .order("name")
  ]);

  return {
    years: years.data ?? [],
    grades: grades.data ?? [],
    sections: sections.data ?? [],
    subjects: subjects.data ?? [],
    classes: (classes.data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      room: row.room,
      grade_name: row.grades?.name ?? "Unassigned",
      section_name: row.sections?.name ?? null,
      academic_year_name: row.academic_years?.name ?? "Academic year"
    }))
  };
}

export async function getTeacherClasses(user: AppUser) {
  const supabase = await createClient();
  let query = supabase
    .from("teacher_assignments")
    .select("classes(id,name,room,grades(name),sections(name),academic_years(name)), subjects(name)")
    .eq("school_id", user.schoolId);

  if (user.role === "teacher") {
    query = query.eq("teacher_id", user.id);
  }

  const { data } = await query.order("created_at", { ascending: false });
  return (data ?? []).map((row: any) => ({
    id: row.classes?.id,
    name: row.classes?.name,
    room: row.classes?.room,
    grade_name: row.classes?.grades?.name,
    section_name: row.classes?.sections?.name,
    academic_year_name: row.classes?.academic_years?.name,
    subject_name: row.subjects?.name
  }));
}
