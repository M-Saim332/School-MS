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
      .select("id,name,room,grade_id,section_id,academic_year_id,head_teacher_id,grades(name),sections(name),academic_years(name),head_teacher:profiles!classes_head_teacher_id_fkey(full_name,email)")
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
      academic_year_name: row.academic_years?.name ?? "Academic year",
      grade_id: row.grade_id,
      section_id: row.section_id,
      academic_year_id: row.academic_year_id,
      head_teacher_id: row.head_teacher_id,
      head_teacher_name: row.head_teacher?.full_name ?? null,
      head_teacher_email: row.head_teacher?.email ?? null
    }))
  };
}

export async function getTeacherSubjectAssignments(user: AppUser) {
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

export async function getTeacherHeadClasses(user: AppUser) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const query = supabase
    .from("classes")
    .select("id,name,room,grades(name),sections(name),academic_years(name),attendance_sessions!left(id,attendance_date)")
    .eq("school_id", user.schoolId)
    .eq("head_teacher_id", user.id)
    .eq("attendance_sessions.attendance_date", today)
    .order("name");

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    room: row.room,
    grade_name: row.grades?.name,
    section_name: row.sections?.name,
    academic_year_name: row.academic_years?.name,
    attendance_marked_today: Boolean(row.attendance_sessions?.length)
  }));
}

async function assertHeadTeacher(user: AppUser, teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_members")
    .select("id")
    .eq("school_id", user.schoolId)
    .eq("user_id", teacherId)
    .eq("role", "teacher")
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Head teacher must be an active teacher in this school.");
}

export async function createClass(user: AppUser, data: { name: string; grade_id: string; section_id?: string | null; academic_year_id: string; room?: string | null; head_teacher_id: string }) {
  await assertHeadTeacher(user, data.head_teacher_id);
  const supabase = await createClient();
  const { error } = await supabase.from("classes").insert({
    school_id: user.schoolId,
    name: data.name,
    grade_id: data.grade_id,
    section_id: data.section_id || null,
    academic_year_id: data.academic_year_id,
    room: data.room || null,
    head_teacher_id: data.head_teacher_id
  });

  if (error) throw new Error(error.message);
}

export async function updateClass(user: AppUser, classId: string, data: { name: string; grade_id: string; section_id?: string | null; academic_year_id: string; room?: string | null; head_teacher_id: string }) {
  await assertHeadTeacher(user, data.head_teacher_id);
  const supabase = await createClient();
  const { error } = await supabase
    .from("classes")
    .update({
      name: data.name,
      grade_id: data.grade_id,
      section_id: data.section_id || null,
      academic_year_id: data.academic_year_id,
      room: data.room || null,
      head_teacher_id: data.head_teacher_id
    })
    .eq("school_id", user.schoolId)
    .eq("id", classId);

  if (error) throw new Error(error.message);
}
