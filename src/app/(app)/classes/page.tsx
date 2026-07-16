import { Suspense } from "react";
import type { ReactNode } from "react";
import { BookOpen, BookOpenCheck, CalendarCheck, CalendarDays, GraduationCap, Layers3, MapPin, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getAcademicOptions, getClassTeachersAndAttendance } from "@/lib/services/academics";
import { getStaff } from "@/lib/services/staff";
import { ClassFormModal } from "@/components/classes/class-form";
import { TeacherAssignmentModal } from "@/components/classes/teacher-assignment-form";
import { DeleteClassButton, RemoveAssignmentButton } from "@/components/classes/class-actions";
import { ClassFilterForm } from "@/components/classes/class-filter-form";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ClassesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const user = await requireUser("classes:manage");

  const [academicData, classDetails] = await Promise.all([
    getAcademicOptions(user),
    getClassTeachersAndAttendance(user)
  ]);

  const allStaff = await getStaff(user);
  const teachers = allStaff.filter((staffMember: any) => staffMember.role === "teacher");

  const filterGrade = params.grade ?? "all";
  const filterQ = (params.q ?? "").toLowerCase();

  const filteredClasses = academicData.classes.filter((cls) => {
    if (filterGrade !== "all" && cls.grade_id !== filterGrade) return false;
    if (!filterQ) return true;

    const matchText = `${cls.name} ${cls.grade_name} ${cls.section_name ?? ""} ${cls.room ?? ""} ${cls.head_teacher_name ?? ""}`.toLowerCase();
    return matchText.includes(filterQ);
  });

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Class Management"
        description="Organize the academic structure, assign teachers, and manage each class from one place."
        actions={
          <ClassFormModal
            grades={academicData.grades}
            sections={academicData.sections}
            academicYears={academicData.years}
            teachers={teachers}
          />
        }
      />

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Academic years" value={academicData.years.length} icon={<CalendarDays className="h-5 w-5" />} />
        <SummaryCard title="Grades" value={academicData.grades.length} icon={<GraduationCap className="h-5 w-5" />} />
        <SummaryCard title="Sections" value={academicData.sections.length} icon={<Layers3 className="h-5 w-5" />} />
        <SummaryCard title="Subjects" value={academicData.subjects.length} icon={<BookOpenCheck className="h-5 w-5" />} />
      </section>

      <Card className="mb-5 p-4">
        <Suspense>
          <ClassFilterForm grades={academicData.grades} />
        </Suspense>
      </Card>

      {filteredClasses.length === 0 ? (
        <EmptyState
          title="No classes found"
          description="Create a new class or try clearing your search filters."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {filteredClasses.map((cls) => {
            const assignedTeachers = classDetails.teachersByClass[cls.id] ?? [];
            const attendance = classDetails.attendanceByClass[cls.id];
            const studentCount = classDetails.studentsByClass[cls.id] ?? 0;
            const totalRecords = attendance ? attendance.present + attendance.absent + attendance.late + attendance.excused : 0;
            const attendanceRate = totalRecords > 0
              ? Math.round(((attendance.present + attendance.late) / totalRecords) * 100)
              : null;

            return (
              <Card key={cls.id} className="flex h-full flex-col overflow-hidden">
                <div className="h-1.5 bg-primary" />

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2 text-xs">
                        <Badge tone="blue">{cls.grade_name}</Badge>
                        {cls.section_name ? <Badge tone="gray">Section {cls.section_name}</Badge> : null}
                        <Badge tone="blue">{cls.academic_year_name}</Badge>
                      </div>
                      <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                        <BookOpen className="h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="truncate">{cls.name}</span>
                      </h3>
                    </div>

                    <div className="flex flex-shrink-0 justify-end gap-1">
                      <ClassFormModal
                        grades={academicData.grades}
                        sections={academicData.sections}
                        academicYears={academicData.years}
                        teachers={teachers}
                        initialClass={{
                          id: cls.id,
                          name: cls.name,
                          grade_id: cls.grade_id,
                          section_id: cls.section_id,
                          academic_year_id: cls.academic_year_id,
                          room: cls.room,
                          head_teacher_id: cls.head_teacher_id
                        }}
                      />
                      <DeleteClassButton classId={cls.id} className={cls.name} />
                    </div>
                  </div>

                  <CardContent className="mt-4 grid flex-1 gap-4 p-0">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-outline/40 bg-surface-low p-3 text-sm">
                        <div className="mb-1 flex items-center gap-1.5 text-muted">
                          <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                          Students
                        </div>
                        <p className="text-lg font-bold text-ink">{studentCount}</p>
                      </div>
                      <div className="rounded-lg border border-outline/40 bg-surface-low p-3 text-sm">
                        <div className="mb-1 flex items-center gap-1.5 text-muted">
                          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                          Room
                        </div>
                        <p className="text-lg font-bold text-ink">{cls.room ?? "Not set"}</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-success-soft p-3 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-success">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Head Teacher
                      </div>
                      <p className="mt-1 truncate font-semibold text-ink">{cls.head_teacher_name ?? "Not assigned"}</p>
                      {cls.head_teacher_email ? <p className="truncate text-xs text-muted">{cls.head_teacher_email}</p> : null}
                    </div>

                    <div className="rounded-lg border border-outline/40 p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-semibold text-muted">
                          <Users className="h-4 w-4" /> Subject Teachers ({assignedTeachers.length})
                        </span>
                      </div>
                      {assignedTeachers.length > 0 ? (
                        <ul className="space-y-1.5 pr-1">
                          {assignedTeachers.map((teacher) => (
                            <li key={teacher.id} className="flex items-center justify-between gap-2 rounded-md bg-surface-low px-3 py-2 text-sm">
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-ink">{teacher.teacher_name}</p>
                                {teacher.subject_name ? <p className="truncate text-xs text-muted">{teacher.subject_name}</p> : null}
                              </div>
                              <RemoveAssignmentButton assignmentId={teacher.id} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs italic text-muted">No teachers assigned yet.</p>
                      )}
                      <div className="mt-3">
                        <TeacherAssignmentModal
                          classId={cls.id}
                          className={cls.name}
                          teachers={teachers}
                          subjects={academicData.subjects}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 rounded-lg bg-surface-low p-3 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-muted">
                        <CalendarCheck className="h-4 w-4" /> Attendance Rate
                      </div>
                      <span
                        className={`font-bold ${
                          attendanceRate !== null && attendanceRate >= 80
                            ? "text-success"
                            : attendanceRate !== null && attendanceRate >= 60
                              ? "text-warning"
                              : attendanceRate !== null
                                ? "text-danger"
                                : "text-muted"
                        }`}
                      >
                        {attendanceRate !== null ? `${attendanceRate}%` : "No records yet"}
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">{title}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
        </div>
        <div className="rounded-lg bg-primary-soft p-3 text-primary">{icon}</div>
      </div>
    </Card>
  );
}
