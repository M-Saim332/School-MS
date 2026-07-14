import { requireUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard";
import { getFinanceDashboard } from "@/lib/services/finance";
import { getResultsManagementWorkspace } from "@/lib/services/marks";
import { getAnnouncements } from "@/lib/services/announcements";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ClassDistributionChart } from "@/components/dashboard/responsive-charts";
import { formatPKR, formatDatePK } from "@/lib/utils";
import { GraduationCap, Users, CalendarX2, AlertTriangle, FileText, Bell } from "lucide-react";
import Link from "next/link";

export default async function PrincipalDashboardPage() {
  const user = await requireUser("dashboard:view");
  if (user.role !== "principal") {
    throw new Error("Unauthorized access to Principal Dashboard");
  }

  const [dashboard, finance, results, announcements] = await Promise.all([
    getDashboardData(user),
    getFinanceDashboard(user),
    getResultsManagementWorkspace(user, { status: "pending_approval" }),
    getAnnouncements(user)
  ]);

  const pendingApprovalsCount = results.filter(r => r.workflowStatus === "pending_approval").length;

  return (
    <>
      <PageHeader
        eyebrow={user.schoolName}
        title="Principal Dashboard"
        description="Oversee academic progress, fee collections, active announcements, and approve student results."
      />

      {/* Alert and Actions summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {pendingApprovalsCount > 0 ? (
          <div className="rounded-lg bg-warning-soft p-4 text-warning flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">{pendingApprovalsCount} exam result sets are pending approval.</p>
              <Link href="/results?status=pending_approval" className="text-xs font-bold underline hover:brightness-110">
                Go to Result Approvals &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-success-soft p-4 text-success flex items-center gap-3">
            <FileText className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-semibold">All major exam uploads have been reviewed and approved.</p>
          </div>
        )}

        <div className="rounded-lg bg-primary-soft p-4 text-primary flex items-center gap-3">
          <Bell className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">{announcements.length} active public announcements.</p>
            <Link href="/announcements" className="text-xs font-bold underline hover:brightness-110">
              Manage Announcements &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={dashboard.totalStudents.toLocaleString()} hint="Active enrollment" icon={GraduationCap} />
        <StatCard label="Teachers" value={dashboard.totalTeachers.toLocaleString()} hint="Active instructors" icon={Users} />
        <StatCard label="Outstanding Fees" value={formatPKR(finance.totalOutstanding)} hint="Pending collection" icon={AlertTriangle} />
        <StatCard label="Absent today" value={dashboard.absentToday.toLocaleString()} hint="Attendance exceptions" icon={CalendarX2} />
      </section>

      {/* Charts and Feeds */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassDistributionChart data={dashboard.classDistribution} />
          </CardContent>
        </Card>
        <ActivityFeed items={dashboard.activity} />
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
              <EmptyState title="No active announcements" description="Create an announcement to broadcast school updates." />
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
