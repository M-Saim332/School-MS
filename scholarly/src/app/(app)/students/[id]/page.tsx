import { notFound } from "next/navigation";
import { Archive, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { SuccessMessage } from "@/components/ui/status-message";
import { requireUser } from "@/lib/auth/session";
import { getStudent } from "@/lib/services/students";
import { hasPermission } from "@/lib/permissions";
import { archiveStudentAction } from "@/app/(app)/students/actions";

export default async function StudentProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireUser("students:view");
  const { student, guardians, attendance } = await getStudent(user, id);
  if (!student) notFound();

  async function archive() {
    "use server";
    await archiveStudentAction(id);
  }

  return (
    <>
      <PageHeader
        eyebrow={student.admission_number}
        title={`${student.first_name} ${student.last_name}`}
        description={`${student.grade_name ?? "Unassigned"} ${student.section_name ? `• ${student.section_name}` : ""}`}
        actions={
          <>
            {hasPermission(user.role, "students:update") ? <ButtonLink href={`/students/${id}/edit`} variant="secondary">Edit</ButtonLink> : null}
            {hasPermission(user.role, "students:archive") && student.status !== "archived" && !student.status.startsWith("pending") ? (
              <ConfirmButton 
                label={user.role === "student_staff" ? "Request Cancellation" : "Archive"} 
                confirmText={user.role === "student_staff" ? "Submit a cancellation request for this student to the Principal?" : "Archive this student? This keeps the record but removes it from active lists."} 
                action={archive} 
              />
            ) : null}
          </>
        }
      />
      {query.saved === "created" ? <SuccessMessage>Student saved successfully.</SuccessMessage> : null}
      {query.saved === "updated" ? <SuccessMessage>Student updated successfully.</SuccessMessage> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <Badge tone={student.status.startsWith("pending") ? "yellow" : student.status === "archived" ? "gray" : "green"}>
              {student.status.replace("_", " ")}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Birth date" value={student.date_of_birth} />
            <Info label="Admission date" value={student.admission_date} />
            <Info label="Class" value={student.class_name ?? "Unassigned"} />
            <Info label="Attendance" value={student.attendance_rate ? `${Math.round(student.attendance_rate)}%` : "No data"} />
            <Info label="Email" value={student.email ?? "Not recorded"} icon={<Mail className="h-4 w-4" />} />
            <Info label="Phone" value={student.phone ?? "Not recorded"} icon={<Phone className="h-4 w-4" />} />
            <div className="sm:col-span-2">
              <Info label="Address" value={student.address ?? "Not recorded"} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guardians</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guardians.map((guardian: any) => (
              <div key={guardian.guardian_id} className="rounded-lg bg-surface-low p-4">
                <p className="font-semibold text-ink">{guardian.full_name}</p>
                <p className="text-sm text-muted">{guardian.relationship} • {guardian.phone}</p>
                <p className="text-sm text-muted">{guardian.email ?? "No email"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <Archive className="h-5 w-5 text-primary" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="font-label text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Class</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record: any) => (
                  <tr key={`${record.attendance_date}-${record.status}`} className="border-t border-outline/60">
                    <td className="py-3 pr-4">{record.attendance_date}</td>
                    <td className="py-3 pr-4">{record.classes?.name}</td>
                    <td className="py-3 pr-4"><Badge>{record.status}</Badge></td>
                    <td className="py-3 pr-4 text-muted">{record.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg bg-surface-low p-4">
      <p className="mb-2 flex items-center gap-2 font-label text-xs font-bold uppercase tracking-wide text-muted">
        {icon}
        {label}
      </p>
      <p className="font-semibold text-ink">{value}</p>
    </div>
  );
}
