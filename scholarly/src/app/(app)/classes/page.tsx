import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getAcademicOptions, getClassTeachersAndAttendance } from "@/lib/services/academics";
import { getStaff } from "@/lib/services/staff";
import { ClassFormModal } from "@/components/classes/class-form";
import { TeacherAssignmentModal } from "@/components/classes/teacher-assignment-form";
import { DeleteClassButton, RemoveAssignmentButton } from "@/components/classes/class-actions";
import { BookOpen, CalendarCheck, MapPin, ShieldCheck, Users } from "lucide-react";

export default async function ClassesPage() {
  const user = await requireUser("classes:manage");
  
  // Fetch academic data (classes, grades, sections, years, subjects)
  const [academicData, classDetails, allStaff] = await Promise.all([
    getAcademicOptions(user),
    getClassTeachersAndAttendance(user),
    getStaff(user)
  ]);
  const teachers = allStaff.filter((s: any) => s.role === "teacher");

  // Group classes by grade
  const classesByGrade = academicData.classes.reduce((acc: Record<string, any[]>, cls: any) => {
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
        description="Organize the academic structure by creating classes and assigning teachers."
        actions={
          <ClassFormModal 
            grades={academicData.grades} 
            sections={academicData.sections} 
            academicYears={academicData.years} 
            teachers={teachers}
          />
        }
      />

      <div className="space-y-10">
        {Object.entries(classesByGrade).map(([gradeName, classes]) => (
          <section key={gradeName}>
            <h2 className="mb-4 text-lg font-display font-bold text-ink border-b border-outline/40 pb-2">
              {gradeName}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => {
                const assignedTeachers = classDetails.teachersByClass[cls.id] ?? [];
                const attendance = classDetails.attendanceByClass[cls.id];
                const totalRecords = attendance ? attendance.present + attendance.absent + attendance.late + attendance.excused : 0;
                const attendanceRate = totalRecords > 0
                  ? Math.round(((attendance!.present + attendance!.late) / totalRecords) * 100)
                  : null;

                return (
                <Card key={cls.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {cls.name}
                        </CardTitle>
                        {cls.section_name && (
                          <p className="mt-1 text-sm font-semibold text-muted">Section: {cls.section_name}</p>
                        )}
                      </div>
                      <Badge tone="gray">{cls.academic_year_name}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex justify-end gap-2">
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
                    {cls.room && (
                      <div className="flex items-center gap-2 text-sm text-ink">
                        <MapPin className="h-4 w-4 text-muted" />
                        Room: <span className="font-semibold">{cls.room}</span>
                      </div>
                    )}
                    <div className="rounded-lg bg-success-soft p-3 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-success">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Head teacher
                      </div>
                      <p className="mt-1 font-semibold text-ink">{cls.head_teacher_name ?? "Not assigned"}</p>
                      {cls.head_teacher_email ? <p className="text-xs text-muted">{cls.head_teacher_email}</p> : null}
                    </div>

                    {/* Assigned Teachers */}
                    <div className="rounded-lg bg-surface-low p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-muted flex items-center gap-2">
                          <Users className="h-4 w-4" /> Subject Teachers ({assignedTeachers.length})
                        </span>
                      </div>
                      {assignedTeachers.length > 0 ? (
                        <ul className="space-y-1.5">
                          {assignedTeachers.map((t) => (
                            <li key={t.id} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm">
                              <span className="font-semibold text-ink">{t.teacher_name}</span>
                              {t.subject_name && (
                                <Badge tone="gray">{t.subject_name}</Badge>
                              )}
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

                    {/* Attendance Report */}
                    <div className="rounded-lg bg-surface-low p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
                        <CalendarCheck className="h-4 w-4" /> Attendance Report
                      </div>
                      {attendance && attendance.total_sessions > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-white p-2 text-center">
                            <p className="text-xs text-muted">Sessions</p>
                            <p className="text-lg font-bold text-ink">{attendance.total_sessions}</p>
                          </div>
                          <div className="rounded-md bg-white p-2 text-center">
                            <p className="text-xs text-muted">Rate</p>
                            <p className={`text-lg font-bold ${attendanceRate !== null && attendanceRate >= 80 ? "text-success" : attendanceRate !== null && attendanceRate >= 60 ? "text-warning" : "text-danger"}`}>
                              {attendanceRate !== null ? `${attendanceRate}%` : "—"}
                            </p>
                          </div>
                          <div className="rounded-md bg-white p-2 text-center">
                            <p className="text-xs text-muted">Present</p>
                            <p className="text-sm font-bold text-success">{attendance.present}</p>
                          </div>
                          <div className="rounded-md bg-white p-2 text-center">
                            <p className="text-xs text-muted">Absent</p>
                            <p className="text-sm font-bold text-danger">{attendance.absent}</p>
                          </div>
                          {attendance.late > 0 && (
                            <div className="rounded-md bg-white p-2 text-center">
                              <p className="text-xs text-muted">Late</p>
                              <p className="text-sm font-bold text-warning">{attendance.late}</p>
                            </div>
                          )}
                          {attendance.excused > 0 && (
                            <div className="rounded-md bg-white p-2 text-center">
                              <p className="text-xs text-muted">Excused</p>
                              <p className="text-sm font-bold text-muted">{attendance.excused}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic">No attendance data yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </section>
        ))}
        {Object.keys(classesByGrade).length === 0 && (
          <div className="p-8 text-center text-muted card-surface rounded-lg">
            No classes found. Create one to get started.
          </div>
        )}
      </div>
    </>
  );
}
