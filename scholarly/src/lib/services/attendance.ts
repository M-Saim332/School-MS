import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types/database";
import { attendanceSubmissionSchema, type AttendanceSubmission } from "@/lib/validation/attendance";
import { logActivity } from "@/lib/services/activity";

export async function getAttendanceContext(user: AppUser, classId?: string, date?: string) {
  const supabase = await createClient();
  const attendanceDate = date ?? new Date().toISOString().slice(0, 10);
  let classQuery = supabase
    .from("classes")
    .select("id,name,room,grades(name),sections(name),academic_years(name)")
    .eq("school_id", user.schoolId)
    .order("name");

  if (user.role === "teacher") {
    const { data: assignments } = await supabase
      .from("teacher_assignments")
      .select("class_id")
      .eq("school_id", user.schoolId)
      .eq("teacher_id", user.id);
    classQuery = classQuery.in("id", (assignments ?? []).map((item) => item.class_id));
  }

  const { data: classes } = await classQuery;
  const selectedClassId = classId ?? classes?.[0]?.id;
  const [enrollments, records] = selectedClassId
    ? await Promise.all([
        supabase
          .from("enrollments")
          .select("id, students(id, first_name, last_name, admission_number)")
          .eq("school_id", user.schoolId)
          .eq("class_id", selectedClassId)
          .eq("status", "active")
          .order("created_at"),
        supabase
          .from("attendance_records")
          .select("student_id,status,note")
          .eq("school_id", user.schoolId)
          .eq("class_id", selectedClassId)
          .eq("attendance_date", attendanceDate)
      ])
    : [{ data: [] }, { data: [] }];

  const recordMap = new Map((records.data ?? []).map((record: any) => [record.student_id, record]));
  const roster = (enrollments.data ?? [])
    .map((row: any) => {
      const existing = recordMap.get(row.students?.id);
      return {
        enrollment_id: row.id,
        student_id: row.students?.id,
        student_name: `${row.students?.first_name ?? ""} ${row.students?.last_name ?? ""}`.trim(),
        admission_number: row.students?.admission_number,
        current_status: existing?.status ?? null,
        note: existing?.note ?? null
      };
    })
    .filter((row) => row.student_id)
    .sort((a, b) => a.student_name.localeCompare(b.student_name));

  const session = selectedClassId
    ? await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("school_id", user.schoolId)
        .eq("class_id", selectedClassId)
        .eq("attendance_date", attendanceDate)
        .maybeSingle()
    : { data: null };

  return {
    classes: (classes ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      room: row.room,
      grade_name: row.grades?.name,
      section_name: row.sections?.name,
      academic_year_name: row.academic_years?.name
    })),
    selectedClassId,
    attendanceDate,
    roster,
    session: session.data
  };
}

export async function submitAttendance(user: AppUser, values: AttendanceSubmission) {
  const parsed = attendanceSubmissionSchema.parse(values);
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("attendance_sessions")
    .upsert(
      {
        school_id: user.schoolId,
        class_id: parsed.class_id,
        attendance_date: parsed.attendance_date,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        status: "submitted"
      },
      { onConflict: "school_id,class_id,attendance_date" }
    )
    .select("id")
    .single();

  if (sessionError) throw new Error(sessionError.message);

  const { error: recordsError } = await supabase.from("attendance_records").upsert(
    parsed.records.map((record) => ({
      school_id: user.schoolId,
      session_id: session.id,
      class_id: parsed.class_id,
      student_id: record.student_id,
      attendance_date: parsed.attendance_date,
      status: record.status,
      note: record.note || null,
      recorded_by: user.id
    })),
    { onConflict: "school_id,student_id,class_id,attendance_date" }
  );

  if (recordsError) throw new Error(recordsError.message);
  await logActivity(user, "attendance_submitted", "attendance_session", session.id, {
    class_id: parsed.class_id,
    attendance_date: parsed.attendance_date,
    records: parsed.records.length
  });
}
