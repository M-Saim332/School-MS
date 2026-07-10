import { CalendarX2, GraduationCap, UserRoundCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AttendanceTrendChart, ClassDistributionChart } from "@/components/dashboard/responsive-charts";
import { getDashboardData } from "@/lib/services/dashboard";
import { getTeacherClasses } from "@/lib/services/academics";
import { requireUser } from "@/lib/auth/session";
import { formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser("dashboard:view");
  const [dashboard, teacherClasses] = await Promise.all([getDashboardData(user), getTeacherClasses(user)]);
  const isTeacher = user.role === "teacher";

  return (
    <>
      <PageHeader
        eyebrow={user.schoolName}
        title={isTeacher ? "Teacher Dashboard" : "Principal Dashboard"}
        description={
          isTeacher
            ? "Your assigned classes, attendance actions, and class health at a glance."
            : "A tenant-safe overview of students, staff, attendance, and recent school activity."
        }
        actions={
          <>
            <ButtonLink href="/attendance" variant="secondary">
              Log attendance
            </ButtonLink>
            <ButtonLink href="/students/new">New student</ButtonLink>
          </>
        }
      />

      <div className="mb-6 rounded-lg bg-danger-soft p-4 text-danger">
        <p className="text-sm font-semibold">Attendance and role changes are protected by Supabase RLS and server-side permission checks.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={dashboard.totalStudents.toLocaleString()} hint="Active enrollment" icon={GraduationCap} />
        <StatCard label="Teachers" value={dashboard.totalTeachers.toLocaleString()} hint={isTeacher ? "School-wide visible summary" : "Active teacher accounts"} icon={UserRoundCheck} />
        <StatCard label="Staff" value={dashboard.totalStaff.toLocaleString()} hint="Active members" icon={Users} />
        <StatCard label="Absent today" value={dashboard.absentToday.toLocaleString()} hint={`Rate: ${formatPercent(dashboard.attendanceRate)}`} icon={CalendarX2} />
      </section>

      {isTeacher ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {teacherClasses.length ? (
            teacherClasses.slice(0, 6).map((item: any) => (
              <Card key={item.id} className="p-5">
                <Badge tone="blue">{item.subject_name ?? "Class"}</Badge>
                <h2 className="mt-4 font-display text-2xl font-semibold text-ink">{item.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {item.grade_name} {item.section_name ? `• ${item.section_name}` : ""} {item.room ? `• ${item.room}` : ""}
                </p>
                <ButtonLink href={`/attendance?classId=${item.id}`} className="mt-5 w-full">
                  Open roster
                </ButtonLink>
              </Card>
            ))
          ) : (
            <EmptyState title="No assigned classes" description="Your administrator can assign classes from Academic Management." className="lg:col-span-3" />
          )}
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
                    <p className="text-xs text-muted">{student.admission_number} • {student.admission_date}</p>
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
