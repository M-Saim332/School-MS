import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { StudentFilters } from "@/components/student-filters";
import { StudentTable } from "@/components/students/student-table";
import { SuccessMessage } from "@/components/ui/status-message";
import { requireUser } from "@/lib/auth/session";
import { getStudents } from "@/lib/services/students";
import { getClassOptions } from "@/lib/services/academics";
import { hasPermission } from "@/lib/permissions";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("students:view");
  const [students, classOptions] = await Promise.all([
    getStudents(user, { q: params.q, status: params.status ?? "active", classId: params.classId, page: Number(params.page ?? 1) }),
    getClassOptions(user)
  ]);

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Student Management"
        description="Search, filter, profile, archive, and manage students within the current school tenant."
        actions={hasPermission(user.role, "students:create") ? <ButtonLink href="/students/new">Add student</ButtonLink> : null}
      />
      {params.saved === "archived" ? <SuccessMessage>Student archived successfully.</SuccessMessage> : null}

      <StudentFilters q={params.q} status={params.status} classId={params.classId} classOptions={classOptions} />

      <StudentTable rows={students.rows} />
      <p className="mt-4 text-sm text-muted">
        Showing {students.rows.length} of {students.count} students.
      </p>
    </>
  );
}
