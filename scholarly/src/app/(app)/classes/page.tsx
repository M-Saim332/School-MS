import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getAcademicOptions } from "@/lib/services/academics";
import { getStaff } from "@/lib/services/staff";
import { ClassFormModal } from "@/components/classes/class-form";
import { TeacherAssignmentModal } from "@/components/classes/teacher-assignment-form";
import { BookOpen, MapPin, ShieldCheck, Users } from "lucide-react";

export default async function ClassesPage() {
  const user = await requireUser("classes:manage");
  
  // Fetch academic data (classes, grades, sections, years, subjects)
  const academicData = await getAcademicOptions(user);
  
  // Fetch teachers to populate class ownership and assignment dropdowns.
  const allStaff = await getStaff(user);
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
              {classes.map((cls) => (
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
                    <div className="flex justify-end">
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
                    
                    <div className="rounded-lg bg-surface-low p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-muted flex items-center gap-2">
                          <Users className="h-4 w-4" /> Subject teachers
                        </span>
                      </div>
                      {/* Note: We would map over actual teacher assignments here if fetched in getAcademicOptions. */}
                      <p className="text-xs text-muted mb-3 italic">Use assignment tool below to allocate staff.</p>
                      
                      <TeacherAssignmentModal 
                        classId={cls.id} 
                        className={cls.name} 
                        teachers={teachers} 
                        subjects={academicData.subjects} 
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
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
