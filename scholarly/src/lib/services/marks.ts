import { createClient } from "@/lib/supabase/server";
import { calculateGrade, defaultGradeScale, percentage, type GradeScale } from "@/lib/grades";
import { logActivity } from "@/lib/services/activity";
import type { AppUser, ExamStatus, ExamType, ResultApprovalStatus } from "@/types/database";
import { examSchema, markEntrySchema, specialExamTypes, type ExamFormValues, type MarkEntryValues } from "@/lib/validation/marks";

export const requiredResultExamTypes: ExamType[] = ["mid_term", "final_term"];

export function formatExamType(type: ExamType) {
  return type
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("-");
}

function isSpecialExam(type: ExamType) {
  return (specialExamTypes as readonly string[]).includes(type);
}

async function getGradeScale(user: AppUser): Promise<GradeScale[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grading_scales")
    .select("grade,min_percentage,max_percentage")
    .eq("school_id", user.schoolId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data?.length ? data.map((row: any) => ({ ...row, min_percentage: Number(row.min_percentage), max_percentage: Number(row.max_percentage) })) : defaultGradeScale;
}

async function assertTeacherCanUseSubject(user: AppUser, classId: string, subjectId: string) {
  if (user.role !== "teacher") throw new Error("Only teachers can manage marks.");
  const supabase = await createClient();
  const [headClass, assignment] = await Promise.all([
    supabase
      .from("classes")
      .select("id")
      .eq("school_id", user.schoolId)
      .eq("id", classId)
      .eq("head_teacher_id", user.id)
      .maybeSingle(),
    supabase
      .from("teacher_assignments")
      .select("id")
      .eq("school_id", user.schoolId)
      .eq("teacher_id", user.id)
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .maybeSingle()
  ]);

  if (headClass.error) throw new Error(headClass.error.message);
  if (assignment.error) throw new Error(assignment.error.message);
  if (!headClass.data && !assignment.data) throw new Error("You can enter marks only for assigned classes and subjects.");
}

async function getEditableExam(user: AppUser, examId: string) {
  const supabase = await createClient();
  const { data: exam, error } = await supabase
    .from("exams")
    .select("*")
    .eq("school_id", user.schoolId)
    .eq("id", examId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!exam) throw new Error("Exam not found.");
  if (exam.created_by !== user.id) throw new Error("You can edit only exams you created.");
  if (!["draft", "rejected"].includes(exam.status)) throw new Error("This exam is locked and cannot be edited.");
  await assertTeacherCanUseSubject(user, exam.class_id, exam.subject_id);
  return exam as any;
}

export async function getTeacherMarksWorkspace(user: AppUser, filters: { classId?: string; subjectId?: string; examId?: string } = {}) {
  const supabase = await createClient();
  const [assignments, headClasses, subjects] = await Promise.all([
    supabase
      .from("teacher_assignments")
      .select("class_id,subject_id,classes(id,name,room,grades(name),sections(name)),subjects(id,name,code)")
      .eq("school_id", user.schoolId)
      .eq("teacher_id", user.id)
      .not("subject_id", "is", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("classes")
      .select("id,name,room,grades(name),sections(name)")
      .eq("school_id", user.schoolId)
      .eq("head_teacher_id", user.id)
      .order("name"),
    supabase.from("subjects").select("id,name,code").eq("school_id", user.schoolId).order("name")
  ]);

  if (assignments.error) throw new Error(assignments.error.message);
  if (headClasses.error) throw new Error(headClasses.error.message);
  if (subjects.error) throw new Error(subjects.error.message);

  const optionMap = new Map<string, any>();
  for (const row of assignments.data ?? []) {
    const item: any = row;
    if (!item.classes?.id || !item.subjects?.id) continue;
    optionMap.set(`${item.classes.id}:${item.subjects.id}`, {
      class_id: item.classes.id,
      class_name: item.classes.name,
      grade_name: item.classes.grades?.name,
      section_name: item.classes.sections?.name,
      subject_id: item.subjects.id,
      subject_name: item.subjects.name,
      is_head_teacher: false
    });
  }

  for (const classRow of headClasses.data ?? []) {
    const cls: any = classRow;
    for (const subject of subjects.data ?? []) {
      const subj: any = subject;
      optionMap.set(`${cls.id}:${subj.id}`, {
        class_id: cls.id,
        class_name: cls.name,
        grade_name: cls.grades?.name,
        section_name: cls.sections?.name,
        subject_id: subj.id,
        subject_name: subj.name,
        is_head_teacher: true
      });
    }
  }

  const options = [...optionMap.values()].sort((a, b) => `${a.class_name} ${a.subject_name}`.localeCompare(`${b.class_name} ${b.subject_name}`));
  const selected = options.find((item) => item.class_id === filters.classId && item.subject_id === filters.subjectId) ?? options[0];

  const exams = selected
    ? await supabase
        .from("exams")
        .select("*")
        .eq("school_id", user.schoolId)
        .eq("class_id", selected.class_id)
        .eq("subject_id", selected.subject_id)
        .eq("created_by", user.id)
        .order("exam_date", { ascending: false })
    : { data: [], error: null };

  if (exams.error) throw new Error(exams.error.message);
  const selectedExam = (exams.data ?? []).find((exam: any) => exam.id === filters.examId) ?? exams.data?.[0] ?? null;

  const [roster, marks] = selected
    ? await Promise.all([
        supabase
          .from("enrollments")
          .select("students(id,first_name,last_name,admission_number)")
          .eq("school_id", user.schoolId)
          .eq("class_id", selected.class_id)
          .eq("status", "active")
          .order("created_at"),
        selectedExam
          ? supabase.from("marks").select("*").eq("school_id", user.schoolId).eq("exam_id", selectedExam.id)
          : Promise.resolve({ data: [], error: null })
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  if (roster.error) throw new Error(roster.error.message);
  if (marks.error) throw new Error(marks.error.message);

  const markMap = new Map((marks.data ?? []).map((mark: any) => [mark.student_id, mark]));

  return {
    options,
    selected,
    exams: exams.data ?? [],
    selectedExam,
    roster: (roster.data ?? [])
      .map((row: any) => ({
        student_id: row.students?.id,
        student_name: `${row.students?.first_name ?? ""} ${row.students?.last_name ?? ""}`.trim(),
        admission_number: row.students?.admission_number,
        mark: markMap.get(row.students?.id) ?? null
      }))
      .filter((row) => row.student_id)
      .sort((a, b) => a.student_name.localeCompare(b.student_name))
  };
}

export async function createExam(user: AppUser, values: ExamFormValues) {
  const parsed = examSchema.parse(values);
  await assertTeacherCanUseSubject(user, parsed.class_id, parsed.subject_id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .insert({
      ...parsed,
      school_id: user.schoolId,
      created_by: user.id,
      status: "draft"
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await logActivity(user, "exam_created", "exam", data.id, { exam_type: parsed.exam_type, title: parsed.title });
  return data.id as string;
}

export async function saveMarks(user: AppUser, values: MarkEntryValues) {
  const parsed = markEntrySchema.parse(values);
  const exam = await getEditableExam(user, parsed.exam_id);
  const scale = await getGradeScale(user);
  const supabase = await createClient();

  for (const record of parsed.records) {
    if (record.marks_obtained > Number(exam.max_marks)) {
      throw new Error("Marks obtained cannot exceed max marks.");
    }
  }

  const { error } = await supabase.from("marks").upsert(
    parsed.records.map((record) => ({
      school_id: user.schoolId,
      exam_id: exam.id,
      student_id: record.student_id,
      class_id: exam.class_id,
      subject_id: exam.subject_id,
      teacher_id: user.id,
      marks_obtained: record.marks_obtained,
      grade: calculateGrade(record.marks_obtained, Number(exam.max_marks), scale),
      status: exam.status === "rejected" ? "rejected" : "draft",
      teacher_comment: record.teacher_comment || null
    })),
    { onConflict: "school_id,exam_id,student_id" }
  );

  if (error) throw new Error(error.message);
  await logActivity(user, "marks_saved", "exam", exam.id, { records: parsed.records.length });
}

export async function submitExamForApproval(user: AppUser, examId: string) {
  const exam = await getEditableExam(user, examId);
  if (!isSpecialExam(exam.exam_type)) throw new Error("Quizzes do not require principal approval.");
  const supabase = await createClient();

  const [roster, marks] = await Promise.all([
    supabase
      .from("enrollments")
      .select("student_id")
      .eq("school_id", user.schoolId)
      .eq("class_id", exam.class_id)
      .eq("status", "active"),
    supabase.from("marks").select("student_id").eq("school_id", user.schoolId).eq("exam_id", exam.id)
  ]);

  if (roster.error) throw new Error(roster.error.message);
  if (marks.error) throw new Error(marks.error.message);
  const marked = new Set((marks.data ?? []).map((row: any) => row.student_id));
  const missing = (roster.data ?? []).filter((row: any) => !marked.has(row.student_id));
  if (missing.length) throw new Error("All enrolled students must be marked before submitting for approval.");

  const now = new Date().toISOString();
  const { error: marksError } = await supabase.from("marks").update({ status: "submitted" }).eq("school_id", user.schoolId).eq("exam_id", exam.id);
  if (marksError) throw new Error(marksError.message);

  const approvalPayload = {
    school_id: user.schoolId,
    exam_id: exam.id,
    submitted_by: user.id,
    status: "pending" as ResultApprovalStatus,
    principal_comment: null,
    reviewed_by: null,
    reviewed_at: null,
    submitted_at: now
  };

  const { data: existing } = await supabase.from("result_approvals").select("id,status").eq("school_id", user.schoolId).eq("exam_id", exam.id).maybeSingle();
  const approvalResult = existing
    ? await supabase.from("result_approvals").update(approvalPayload).eq("id", existing.id)
    : await supabase.from("result_approvals").insert(approvalPayload);

  if (approvalResult.error) throw new Error(approvalResult.error.message);

  const { error: examError } = await supabase
    .from("exams")
    .update({ status: "submitted", submitted_at: now })
    .eq("school_id", user.schoolId)
    .eq("id", exam.id);
  if (examError) throw new Error(examError.message);

  await logActivity(user, "exam_submitted_for_approval", "exam", exam.id, { exam_type: exam.exam_type, title: exam.title });
}

export async function getPrincipalExamApprovals(user: AppUser, status: ResultApprovalStatus | "all" = "pending") {
  const supabase = await createClient();
  let query = supabase
    .from("result_approvals")
    .select(
      "*,exams!inner(id,title,exam_type,term,exam_date,max_marks,status,classes(name,grades(name),sections(name)),subjects(name),creator:profiles!exams_created_by_fkey(full_name)),submitter:profiles!result_approvals_submitted_by_fkey(full_name)"
    )
    .eq("school_id", user.schoolId)
    .order("submitted_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function reviewExamApproval(user: AppUser, approvalId: string, decision: "approved" | "rejected", principalComment?: string | null) {
  const supabase = await createClient();
  const { data: approval, error } = await supabase
    .from("result_approvals")
    .select("*,exams!inner(id,status)")
    .eq("school_id", user.schoolId)
    .eq("id", approvalId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!approval) throw new Error("Approval request not found.");
  if (approval.status !== "pending") throw new Error("This result set has already been reviewed.");

  const now = new Date().toISOString();
  const examStatus: ExamStatus = decision === "approved" ? "approved" : "rejected";
  const { error: approvalError } = await supabase
    .from("result_approvals")
    .update({
      status: decision,
      principal_comment: principalComment || null,
      reviewed_by: user.id,
      reviewed_at: now
    })
    .eq("id", approvalId);
  if (approvalError) throw new Error(approvalError.message);

  const { error: examError } = await supabase
    .from("exams")
    .update({ status: examStatus, finalized_at: decision === "approved" ? now : null })
    .eq("school_id", user.schoolId)
    .eq("id", approval.exam_id);
  if (examError) throw new Error(examError.message);

  const { error: marksError } = await supabase.from("marks").update({ status: examStatus }).eq("school_id", user.schoolId).eq("exam_id", approval.exam_id);
  if (marksError) throw new Error(marksError.message);

  await logActivity(user, `exam_${decision}`, "exam", approval.exam_id, { principal_comment: principalComment || null });
}

export async function getResultCardsWorkspace(user: AppUser, filters: { classId?: string; term?: string } = {}) {
  const supabase = await createClient();
  const term = filters.term ?? "Term 1";
  const { data: classes, error: classError } = await supabase
    .from("classes")
    .select("id,name,grades(name),sections(name)")
    .eq("school_id", user.schoolId)
    .order("name");
  if (classError) throw new Error(classError.message);

  const selectedClassId = filters.classId ?? classes?.[0]?.id;
  const readiness = selectedClassId ? await getResultReadiness(user, selectedClassId, term) : null;
  return { classes: classes ?? [], selectedClassId, term, readiness };
}

async function getResultReadiness(user: AppUser, classId: string, term: string) {
  const supabase = await createClient();
  const [subjects, exams, students] = await Promise.all([
    supabase
      .from("teacher_assignments")
      .select("subject_id,subjects(id,name)")
      .eq("school_id", user.schoolId)
      .eq("class_id", classId)
      .not("subject_id", "is", null),
    supabase
      .from("exams")
      .select("id,subject_id,exam_type,status")
      .eq("school_id", user.schoolId)
      .eq("class_id", classId)
      .eq("term", term)
      .in("exam_type", requiredResultExamTypes)
      .eq("status", "approved"),
    supabase
      .from("enrollments")
      .select("students(id,first_name,last_name,admission_number)")
      .eq("school_id", user.schoolId)
      .eq("class_id", classId)
      .eq("status", "active")
      .order("created_at")
  ]);

  if (subjects.error) throw new Error(subjects.error.message);
  if (exams.error) throw new Error(exams.error.message);
  if (students.error) throw new Error(students.error.message);

  const subjectMap = new Map<string, string>();
  for (const row of subjects.data ?? []) {
    const item: any = row;
    if (item.subjects?.id) subjectMap.set(item.subjects.id, item.subjects.name);
  }

  const approvedKeys = new Set((exams.data ?? []).map((exam: any) => `${exam.subject_id}:${exam.exam_type}`));
  const missing: string[] = [];
  for (const [subjectId, subjectName] of subjectMap.entries()) {
    for (const type of requiredResultExamTypes) {
      if (!approvedKeys.has(`${subjectId}:${type}`)) missing.push(`${subjectName} ${formatExamType(type)}`);
    }
  }

  return {
    complete: subjectMap.size > 0 && missing.length === 0,
    missing,
    requiredExamTypes: requiredResultExamTypes,
    students: (students.data ?? []).map((row: any) => ({
      id: row.students?.id,
      name: `${row.students?.first_name ?? ""} ${row.students?.last_name ?? ""}`.trim(),
      admission_number: row.students?.admission_number
    })).filter((row) => row.id)
  };
}

export async function getPrintableResultCards(user: AppUser, filters: { classId: string; term: string; studentId?: string }) {
  const supabase = await createClient();
  const readiness = await getResultReadiness(user, filters.classId, filters.term);
  const { data: classRow, error: classError } = await supabase
    .from("classes")
    .select("id,name,grades(name),sections(name),academic_years(name)")
    .eq("school_id", user.schoolId)
    .eq("id", filters.classId)
    .maybeSingle();
  if (classError) throw new Error(classError.message);
  if (!classRow) throw new Error("Class not found.");

  if (!readiness.complete) return { complete: false, missing: readiness.missing, classRow, cards: [] };

  let studentsQuery = supabase
    .from("enrollments")
    .select("students(id,first_name,last_name,admission_number)")
    .eq("school_id", user.schoolId)
    .eq("class_id", filters.classId)
    .eq("status", "active")
    .order("created_at");

  if (filters.studentId) studentsQuery = studentsQuery.eq("student_id", filters.studentId);

  const [students, marks] = await Promise.all([
    studentsQuery,
    supabase
      .from("marks")
      .select("student_id,marks_obtained,grade,exams!inner(id,title,exam_type,term,max_marks,status,subjects(name))")
      .eq("school_id", user.schoolId)
      .eq("class_id", filters.classId)
      .eq("exams.term", filters.term)
      .eq("exams.status", "approved")
      .in("exams.exam_type", requiredResultExamTypes)
      .order("student_id")
  ]);

  if (students.error) throw new Error(students.error.message);
  if (marks.error) throw new Error(marks.error.message);

  const marksByStudent = new Map<string, any[]>();
  for (const mark of marks.data ?? []) {
    const item: any = mark;
    const list = marksByStudent.get(item.student_id) ?? [];
    list.push(item);
    marksByStudent.set(item.student_id, list);
  }

  const cards = (students.data ?? []).map((row: any) => {
    const student = row.students;
    const rows = marksByStudent.get(student?.id) ?? [];
    const totalObtained = rows.reduce((sum, item) => sum + Number(item.marks_obtained), 0);
    const totalMax = rows.reduce((sum, item) => sum + Number(item.exams?.max_marks ?? 0), 0);
    return {
      student: {
        id: student?.id,
        name: `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim(),
        admission_number: student?.admission_number
      },
      rows: rows.map((item) => ({
        subject_name: item.exams?.subjects?.name,
        exam_title: item.exams?.title,
        exam_type: item.exams?.exam_type as ExamType,
        marks_obtained: Number(item.marks_obtained),
        max_marks: Number(item.exams?.max_marks ?? 0),
        grade: item.grade
      })),
      totalObtained,
      totalMax,
      percentage: percentage(totalObtained, totalMax),
      overallGrade: calculateGrade(totalObtained, totalMax)
    };
  });

  return { complete: true, missing: [], classRow, cards };
}
