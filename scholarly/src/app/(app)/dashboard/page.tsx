import { CalendarX2, FileText, GraduationCap, UserRoundCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AttendanceTrendChart, ClassDistributionChart } from "@/components/dashboard/responsive-charts";
import { getDashboardData } from "@/lib/services/dashboard";
import { getTeacherHeadClasses } from "@/lib/services/academics";
import { requireUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser("dashboard:view");
  const isTeacher = user.role === "teacher";
  const [dashboard, headTeacherClasses] = await Promise.all([
    getDashboardData(user),
    isTeacher ? getTeacherHeadClasses(user) : Promise.resolve([]),
  ]);
  const canCreateStudents = hasPermission(user.role, "students:create");
  const canViewAttendance = hasPermission(user.role, "attendance:view");
  const canManageMarks = hasPermission(user.role, "marks:manage");
  const canGenerateResults = hasPermission(user.role, "results:generate");
  const dashboardTitle = isTeacher ? "Teacher Dashboard" : user.role === "student_staff" ? "Registrar Dashboard" : "Principal Dashboard";

  return (
    <>
      <PageHeader
        eyebrow={user.schoolName}
        title={dashboardTitle}
        description={
          isTeacher
            ? "Your head-teacher class, attendance actions, and class health at a glance."
            : "A tenant-safe overview of students, staff, attendance, and recent school activity."
        }
        actions={
          <>
            {canViewAttendance ? (
              <ButtonLink href="/attendance" variant="secondary">
                Attendance
              </ButtonLink>
            ) : null}
            {canManageMarks ? (
              <ButtonLink href="/marks" variant="secondary">
                Marks
              </ButtonLink>
            ) : null}
            {canCreateStudents ? <ButtonLink href="/students/new">New student</ButtonLink> : null}
          </>
        }
      />

      <div className="mb-6 rounded-lg bg-danger-soft p-4 text-danger">
        <p className="text-sm font-semibold">Attendance is locked to the assigned class head teacher and can be submitted once per class per day.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={dashboard.totalStudents.toLocaleString()} hint="Active enrollment" icon={GraduationCap} />
        <StatCard label="Teachers" value={dashboard.totalTeachers.toLocaleString()} hint={isTeacher ? "School-wide visible summary" : "Active teacher accounts"} icon={UserRoundCheck} />
        <StatCard label="Staff" value={dashboard.totalStaff.toLocaleString()} hint="Active members" icon={Users} />
        <StatCard label="Absent today" value={dashboard.absentToday.toLocaleString()} hint={`Rate: ${formatPercent(dashboard.attendanceRate)}`} icon={CalendarX2} />
      </section>

      {isTeacher ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {headTeacherClasses.length ? (
            headTeacherClasses.slice(0, 6).map((item: any) => (
              <Card key={item.id} className="p-5">
                <Badge tone={item.attendance_marked_today ? "green" : "blue"}>
                  {item.attendance_marked_today ? "Marked today" : "Head teacher"}
                </Badge>
                <h2 className="mt-4 font-display text-2xl font-semibold text-ink">{item.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {item.grade_name} {item.section_name ? `- ${item.section_name}` : ""} {item.room ? `- ${item.room}` : ""}
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <ButtonLink href={`/students?classId=${item.id}`} variant="secondary" className="w-full">
                    Student list
                  </ButtonLink>
                  <ButtonLink href={`/attendance?classId=${item.id}`} className="w-full">
                    {item.attendance_marked_today ? "View attendance" : "Mark attendance"}
                  </ButtonLink>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState title="No head-teacher class" description="Only a class head teacher can mark attendance. Subject assignments remain visible in Academics." className="lg:col-span-3" />
          )}
        </section>
      ) : null}

      {canGenerateResults && user.role === "student_staff" ? (
        <section className="mt-6">
          <Card className="overflow-hidden">
            <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">Result Cards</h2>
                  <p className="mt-1 text-sm text-muted">Generate class or individual printable result cards after Principal approval is complete.</p>
                </div>
              </div>
              <ButtonLink href="/results">Open Result Cards</ButtonLink>
            </div>
          </Card>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTrendChart data={dashboard.attendanceTrend} />
          </CardContent>
        </Card>
        <ActivityFeed items={dashboard.activity} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassDistributionChart data={dashboard.classDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboard.recentAdmissions.length ? (
              <EmptyState title="No recent admissions" description="New students admitted in the last 30 days appear here." />
            ) : (
              <div className="space-y-3">
                {dashboard.recentAdmissions.map((student: any) => (
                  <div key={student.id} className="rounded-lg bg-surface-low p-3">
                    <p className="font-semibold text-ink">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-muted">{student.admission_number} - {student.admission_date}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
