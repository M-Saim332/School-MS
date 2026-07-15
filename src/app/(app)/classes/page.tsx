import { Suspense } from "react";
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
import { BookOpen, CalendarCheck, MapPin, ShieldCheck, Users, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ClassesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const user = await requireUser("classes:manage");
  
  // Fetch academic data (classes, grades, sections, years, subjects)
  const [academicData, classDetails] = await Promise.all([
    getAcademicOptions(user),
    getClassTeachersAndAttendance(user)
  ]);
  
  // Fetch teachers to populate class ownership and assignment dropdowns.
  const allStaff = await getStaff(user);
  const teachers = allStaff.filter((s: any) => s.role === "teacher");

  // Apply filters
  const filterGrade = params.grade ?? "all";
  const filterQ = (params.q ?? "").toLowerCase();

  const filteredClasses = academicData.classes.filter((cls) => {
    if (filterGrade !== "all" && cls.grade_id !== filterGrade) return false;
    if (filterQ) {
      const matchText = `${cls.name} ${cls.grade_name} ${cls.section_name ?? ""} ${cls.room ?? ""} ${cls.head_teacher_name ?? ""}`.toLowerCase();
      if (!matchText.includes(filterQ)) return false;
    }
    return true;
  });

  // Group filtered classes by grade
  const classesByGrade = filteredClasses.reduce((acc: Record<string, typeof filteredClasses>, cls: typeof filteredClasses[0]) => {
    const grade = cls.grade_name || "Unassigned";
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(cls);
    return acc;
  }, {});

  return (
    <>
      <PageHeader 
        eyebrow="Academics" 
        title="Class Management" 
        description="Organize the academic structure by creating classes, assigning teachers, and managing active enrollments."
        actions={
          <ClassFormModal 
            grades={academicData.grades} 
            sections={academicData.sections} 
            academicYears={academicData.years} 
            teachers={teachers}
          />
        }
      />

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
        <div className="space-y-10">
          {Object.entries(classesByGrade).map(([gradeName, classes]) => (
            <section key={gradeName}>
              <h2 className="mb-4 text-lg font-display font-bold text-ink border-b border-outline/40 pb-2">
                {gradeName}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {classes.map((cls) => {
                  const assignedTeachers = classDetails.teachersByClass[cls.id] ?? [];
                  const attendance = classDetails.attendanceByClass[cls.id];
                  const studentCount = classDetails.studentsByClass[cls.id] ?? 0;
                  
                  const totalRecords = attendance ? attendance.present + attendance.absent + attendance.late + attendance.excused : 0;
                  const attendanceRate = totalRecords > 0
                    ? Math.round(((attendance!.present + attendance!.late) / totalRecords) * 100)
                    : null;

                  return (
                    <Card key={cls.id} className="overflow-hidden flex flex-col">
                      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-tertiary-soft" />
                      
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink truncate">
                              <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                              <span className="truncate">{cls.name}</span>
                            </h3>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                              {cls.section_name && <Badge tone="gray">Sec: {cls.section_name}</Badge>}
                              <Badge tone="blue">{cls.academic_year_name}</Badge>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-1 flex-shrink-0">
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

                        <CardContent className="mt-4 grid gap-4 p-0">
                          {/* Info row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline/40 bg-surface-low p-3 text-sm">
                            <div className="flex items-center gap-1.5 text-ink">
                              <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                              <span className="font-semibold">{studentCount}</span> students
                            </div>
                            {cls.room && (
                              <div className="flex items-center gap-1.5 text-ink">
                                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                                <span>{cls.room}</span>
                              </div>
                            )}
                          </div>

                          {/* Head Teacher */}
                          <div className="rounded-lg bg-success-soft p-3 text-sm">
                            <div className="flex items-center gap-2 font-semibold text-success">
                              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                              Head Teacher
                            </div>
                            <p className="mt-1 font-semibold text-ink truncate">{cls.head_teacher_name ?? "Not assigned"}</p>
                            {cls.head_teacher_email ? <p className="text-xs text-muted truncate">{cls.head_teacher_email}</p> : null}
                          </div>

                          {/* Subject Teachers */}
                          <div className="rounded-lg border border-outline/40 p-3">
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="font-semibold text-muted flex items-center gap-2">
                                <Users className="h-4 w-4" /> Subject Teachers ({assignedTeachers.length})
                              </span>
                            </div>
                            {assignedTeachers.length > 0 ? (
                              <ul className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                                {assignedTeachers.map((t) => (
                                  <li key={t.id} className="flex items-center justify-between gap-2 rounded-md bg-surface-low px-3 py-2 text-sm">
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-ink truncate">{t.teacher_name}</p>
                                      {t.subject_name && (
                                        <p className="text-xs text-muted truncate">{t.subject_name}</p>
                                      )}
                                    </div>
                                    <RemoveAssignmentButton assignmentId={t.id} />
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted italic">No teachers assigned yet.</p>
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

                          {/* Attendance summary */}
                          {attendance && attendance.total_sessions > 0 && (
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-low p-3 text-sm">
                              <div className="flex items-center gap-2 font-semibold text-muted">
                                <CalendarCheck className="h-4 w-4" /> Attendance Rate
                              </div>
                              <span className={`font-bold ${attendanceRate !== null && attendanceRate >= 80 ? "text-success" : attendanceRate !== null && attendanceRate >= 60 ? "text-warning" : "text-danger"}`}>
                                {attendanceRate !== null ? `${attendanceRate}%` : "—"}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
