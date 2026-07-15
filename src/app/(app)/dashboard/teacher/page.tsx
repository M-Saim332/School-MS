import { requireUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard";
import { getTeacherHeadClasses } from "@/lib/services/academics";
import { getAnnouncements } from "@/lib/services/announcements";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatDatePK } from "@/lib/utils";
import { GraduationCap, UserRoundCheck, Users, CalendarX2, CalendarCheck, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboardPage() {
  const user = await requireUser("dashboard:view");
  if (user.role !== "teacher") {
    throw new Error("Unauthorized access to Teacher Dashboard");
  }

  const [dashboard, headClasses, announcements] = await Promise.all([
    getDashboardData(user),
    getTeacherHeadClasses(user),
    getAnnouncements(user)
  ]);

  return (
    <>
      <PageHeader
        eyebrow={user.schoolName}
        title="Teacher Dashboard"
        description="View your assigned classes, register student attendance, update quiz/test marks, and view announcements."
      />

      {/* Quick Actions */}
      <section className="mb-6">
        <h3 className="mb-3 font-display text-base font-bold text-muted uppercase tracking-wide">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/attendance"
            className="group flex items-center gap-3 rounded-xl border border-outline/40 bg-surface-low p-4 transition hover:border-primary hover:bg-primary-soft/10"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary group-hover:bg-primary group-hover:text-white transition">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">Mark Attendance</p>
              <p className="text-xs text-muted">Record today&apos;s class attendance</p>
            </div>
          </Link>
          <Link
            href="/academics"
            className="group flex items-center gap-3 rounded-xl border border-outline/40 bg-surface-low p-4 transition hover:border-accent hover:bg-accent/5"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">My Classes</p>
              <p className="text-xs text-muted">View subject assignments</p>
            </div>
          </Link>
        </div>
      </section>

      <div className="mb-6 rounded-lg bg-danger-soft p-4 text-danger">
        <p className="text-sm font-semibold">Attendance is locked to the assigned class head teacher and can be submitted once per class per day.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={dashboard.totalStudents.toLocaleString()} hint="School enrollment" icon={GraduationCap} />
        <StatCard label="Teachers" value={dashboard.totalTeachers.toLocaleString()} hint="School staff count" icon={UserRoundCheck} />
        <StatCard label="Staff" value={dashboard.totalStaff.toLocaleString()} hint="Active accounts" icon={Users} />
        <StatCard label="Absent today" value={dashboard.absentToday.toLocaleString()} hint="Daily absences" icon={CalendarX2} />
      </section>

      {/* Head Teacher Classes */}
      <section className="mt-6">
        <h3 className="mb-4 font-display text-lg font-bold text-ink">My Assigned Head Classes</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {headClasses.length ? (
            headClasses.map((item: any) => (
              <Card key={item.id} className="p-5">
                <div className="flex justify-between items-start">
                  <Badge tone={item.attendance_marked_today ? "green" : "blue"}>
                    {item.attendance_marked_today ? "Marked today" : "Head teacher"}
                  </Badge>
                </div>
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
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="No head-teacher class" description="Only a class head teacher can mark attendance. Subject assignments remain visible in Academics." />
            </div>
          )}
        </div>
      </section>

      {/* Announcements */}
      <section className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Announcements</CardTitle>
            <Link href="/announcements" className="text-xs font-bold text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {!announcements.length ? (
              <EmptyState title="No active announcements" description="There are no announcements currently posted." />
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="border-b border-outline/25 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-ink">{a.title}</h4>
                      <Badge tone={a.priority === "critical" ? "red" : a.priority === "high" ? "yellow" : "blue"}>
                        {a.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted line-clamp-2">{a.description}</p>
                    <p className="mt-2 text-xs text-muted">
                      Published: {formatDatePK(a.publish_date)} by {a.created_by_name ?? "Principal"}
                    </p>
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
