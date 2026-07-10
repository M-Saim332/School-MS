import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CsvExport } from "@/components/reports/csv-export";
import { requireUser } from "@/lib/auth/session";
import { getReports } from "@/lib/services/reports";

export default async function ReportsPage() {
  const user = await requireUser("reports:view");
  const reports = await getReports(user);
  const attendanceRows = reports.attendance.map((row: any) => ({
    date: row.attendance_date,
    student: `${row.students?.first_name ?? ""} ${row.students?.last_name ?? ""}`.trim(),
    admission_number: row.students?.admission_number,
    class: row.classes?.name,
    status: row.status
  }));

  return (
    <>
      <PageHeader eyebrow="Reports" title="School Reports" description="Export attendance, enrollment, archived-student, and activity data for the current tenant." />
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
            <CsvExport rows={attendanceRows} filename="scholarly-attendance.csv" />
          </CardHeader>
          <CardContent>
            <ReportTable rows={attendanceRows.slice(0, 10)} columns={["date", "student", "class", "status"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Counts</CardTitle>
            <CsvExport rows={reports.enrollment as any} filename="scholarly-enrollment.csv" />
          </CardHeader>
          <CardContent>
            <ReportTable rows={(reports.enrollment as any[]).slice(0, 10)} columns={["grade_name", "class_name", "student_count"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Archived Students</CardTitle>
            <Badge>{reports.archived.length}</Badge>
          </CardHeader>
          <CardContent>
            <ReportTable rows={(reports.archived as any[]).slice(0, 10)} columns={["admission_number", "first_name", "last_name", "archived_at"]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <Badge>{reports.activity.length}</Badge>
          </CardHeader>
          <CardContent>
            <ReportTable rows={(reports.activity as any[]).slice(0, 10)} columns={["action", "entity_type", "created_at"]} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function ReportTable({ rows, columns }: { rows: any[]; columns: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="font-label text-xs uppercase tracking-wide text-muted">
          <tr>{columns.map((column) => <th key={column} className="py-3 pr-4">{column.replaceAll("_", " ")}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-outline/60">
              {columns.map((column) => <td key={column} className="py-3 pr-4">{String(row[column] ?? "—")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
