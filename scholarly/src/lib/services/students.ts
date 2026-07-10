import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types/database";
import { studentSchema, type StudentFormValues } from "@/lib/validation/students";
import { logActivity } from "@/lib/services/activity";

export type StudentFilters = {
  q?: string;
  status?: string;
  classId?: string;
  page?: number;
};

export async function getStudents(user: AppUser, filters: StudentFilters = {}) {
  const supabase = await createClient();
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("student_directory")
    .select("*", { count: "exact" })
    .eq("school_id", user.schoolId)
    .range(from, to)
    .order("last_name");

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.classId && filters.classId !== "all") query = query.eq("class_id", filters.classId);
  if (filters.q) query = query.or(`first_name.ilike.%${filters.q}%,last_name.ilike.%${filters.q}%,admission_number.ilike.%${filters.q}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return { rows: data ?? [], count: count ?? 0, page, pageSize };
}

export async function getStudent(user: AppUser, id: string) {
  const supabase = await createClient();
  const [student, guardians, attendance] = await Promise.all([
    supabase.from("student_directory").select("*").eq("school_id", user.schoolId).eq("id", id).maybeSingle(),
    supabase
      .from("student_guardian_details")
      .select("*")
      .eq("school_id", user.schoolId)
      .eq("student_id", id)
      .order("is_primary", { ascending: false }),
    supabase
      .from("attendance_records")
      .select("attendance_date,status,note,classes(name)")
      .eq("school_id", user.schoolId)
      .eq("student_id", id)
      .order("attendance_date", { ascending: false })
      .limit(20)
  ]);

  if (student.error) throw new Error(student.error.message);
  return {
    student: student.data,
    guardians: guardians.data ?? [],
    attendance: attendance.data ?? []
  };
}

export async function createStudent(user: AppUser, values: StudentFormValues) {
  const parsed = studentSchema.parse(values);
  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      school_id: user.schoolId,
      admission_number: parsed.admission_number,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      preferred_name: parsed.preferred_name || null,
      date_of_birth: parsed.date_of_birth,
      gender: parsed.gender || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      admission_date: parsed.admission_date,
      status: parsed.status
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { data: guardian, error: guardianError } = await supabase
    .from("guardians")
    .insert({
      school_id: user.schoolId,
      full_name: parsed.guardian_name,
      relationship: parsed.guardian_relationship,
      email: parsed.guardian_email || null,
      phone: parsed.guardian_phone,
      emergency_contact_name: parsed.emergency_contact_name,
      emergency_contact_phone: parsed.emergency_contact_phone
    })
    .select("id")
    .single();

  if (guardianError) throw new Error(guardianError.message);

  await supabase.from("student_guardians").insert({
    school_id: user.schoolId,
    student_id: student.id,
    guardian_id: guardian.id,
    is_primary: true
  });

  if (parsed.class_id) {
    const { data: activeYear } = await supabase
      .from("academic_years")
      .select("id")
      .eq("school_id", user.schoolId)
      .eq("is_active", true)
      .maybeSingle();
    await supabase.from("enrollments").insert({
      school_id: user.schoolId,
      student_id: student.id,
      class_id: parsed.class_id,
      academic_year_id: activeYear?.id,
      status: "active"
    });
  }

  await logActivity(user, "student_created", "student", student.id, {
    admission_number: parsed.admission_number,
    name: `${parsed.first_name} ${parsed.last_name}`
  });

  return student.id as string;
}

export async function updateStudent(user: AppUser, id: string, values: StudentFormValues) {
  const parsed = studentSchema.parse(values);
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      admission_number: parsed.admission_number,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      preferred_name: parsed.preferred_name || null,
      date_of_birth: parsed.date_of_birth,
      gender: parsed.gender || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      admission_date: parsed.admission_date,
      status: parsed.status
    })
    .eq("school_id", user.schoolId)
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logActivity(user, "student_updated", "student", id, { admission_number: parsed.admission_number });
}

export async function archiveStudent(user: AppUser, id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("school_id", user.schoolId)
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logActivity(user, "student_archived", "student", id);
}
