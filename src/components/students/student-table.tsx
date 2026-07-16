import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPercent } from "@/lib/utils";

const statusTone = {
  active: "green",
  graduated: "blue",
  transferred: "yellow",
  archived: "gray",
  cancelled: "red",
  pending_approval: "yellow",
  pending_cancellation: "yellow"
} as const;

export function StudentTable({ rows }: { rows: any[] }) {
  if (!rows.length) {
    return <EmptyState title="No students found" description="Try a different search, status, class filter, or add a new student." />;
  }

  return (
    <div className="card-surface overflow-hidden rounded-[18px]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="font-label text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Admission</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3">Attendance</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student) => (
              <tr key={student.id} className="border-t border-outline hover:bg-surface-low">
                <td className="px-4 py-4">
                  <Link href={`/students/${student.id}`} className="font-semibold text-primary hover:text-primary-ink">
                    {student.first_name} {student.last_name}
                  </Link>
                  <p className="text-xs text-muted">{student.email ?? "No email"}</p>
                </td>
                <td className="px-4 py-4 font-semibold">{student.admission_number}</td>
                <td className="px-4 py-4 text-muted">
                  {student.grade_name ?? "Unassigned"} {student.section_name ? `• ${student.section_name}` : ""}
                </td>
                <td className="px-4 py-4 text-muted">{student.guardian_name ?? "Not recorded"}</td>
                <td className="px-4 py-4 font-semibold">{formatPercent(student.attendance_rate)}</td>
                <td className="px-4 py-4">
                  <Badge tone={statusTone[student.status as keyof typeof statusTone] ?? "gray"}>{student.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {rows.map((student) => (
          <Link key={student.id} href={`/students/${student.id}`} className="rounded-2xl bg-surface-low p-4 ring-1 ring-outline/70 transition hover:bg-primary-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-xs text-muted">{student.admission_number}</p>
              </div>
              <Badge tone={statusTone[student.status as keyof typeof statusTone] ?? "gray"}>{student.status}</Badge>
            </div>
            <p className="mt-3 text-sm text-muted">
              {student.grade_name ?? "Unassigned"} {student.section_name ? `• ${student.section_name}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
