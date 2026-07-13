import type { ReactNode } from "react";
import { Activity, CalendarCheck, Percent, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { AttendanceOverview as AttendanceOverviewData } from "@/lib/services/attendance";

function formatPercent(value: number | null) {
  return value === null ? "No data" : `${value}%`;
}

function formatDate(value: string | null) {
  if (!value) return "Not marked yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function toneForRate(value: number | null) {
  if (value === null) return "gray";
  if (value >= 80) return "green";
  if (value >= 60) return "yellow";
  return "red";
}

export function AttendanceOverview({ overview }: { overview: AttendanceOverviewData }) {
  if (!overview.classes.length) {
    return <EmptyState title="No classes found" description="Create classes before attendance summaries can be shown." />;
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Running attendance" value={formatPercent(overview.running_attendance_rate)} hint="Present and late records across all classes." icon={<Percent className="h-5 w-5" />} />
        <SummaryCard label="Marked attendances" value={overview.marked_sessions.toLocaleString()} hint="Total submitted class attendance days." icon={<CalendarCheck className="h-5 w-5" />} />
        <SummaryCard label="Active students" value={overview.total_students.toLocaleString()} hint="Students currently enrolled in classes." icon={<Users className="h-5 w-5" />} />
        <SummaryCard label="Classes tracked" value={overview.total_classes.toLocaleString()} hint="Classes included in this attendance view." icon={<Activity className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Class Attendance Overview</CardTitle>
            <p className="mt-1 text-sm text-muted">A principal-friendly summary of attendance health by class.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline/40 font-label text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4">Class</th>
                  <th className="py-3 pr-4">Attendance</th>
                  <th className="py-3 pr-4">Marked days</th>
                  <th className="py-3 pr-4">Students</th>
                  <th className="py-3 pr-4">Present / Late</th>
                  <th className="py-3 pr-4">Absent</th>
                  <th className="py-3 pr-4">Last marked</th>
                </tr>
              </thead>
              <tbody>
                {overview.classes.map((item) => (
                  <tr key={item.id} className="border-b border-outline/25">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-ink">{item.name}</p>
                      <p className="text-xs text-muted">
                        {item.grade_name ?? "No grade"}
                        {item.section_name ? ` / ${item.section_name}` : ""}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge tone={toneForRate(item.attendance_rate)}>{formatPercent(item.attendance_rate)}</Badge>
                    </td>
                    <td className="py-4 pr-4 font-semibold">{item.marked_sessions.toLocaleString()}</td>
                    <td className="py-4 pr-4">{item.active_students.toLocaleString()}</td>
                    <td className="py-4 pr-4 text-success">{(item.present + item.late).toLocaleString()}</td>
                    <td className="py-4 pr-4 text-danger">{item.absent.toLocaleString()}</td>
                    <td className="py-4 pr-4 text-muted">{formatDate(item.latest_marked_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">{icon}</div>
        <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </CardContent>
    </Card>
  );
}
