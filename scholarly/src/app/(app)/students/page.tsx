import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { StudentTable } from "@/components/students/student-table";
import { requireUser } from "@/lib/auth/session";
import { getStudents } from "@/lib/services/students";
import { getAcademicOptions } from "@/lib/services/academics";
import { hasPermission } from "@/lib/permissions";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("students:view");
  const [students, academics] = await Promise.all([
    getStudents(user, { q: params.q, status: params.status ?? "active", classId: params.classId, page: Number(params.page ?? 1) }),
    getAcademicOptions(user)
  ]);

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Student Management"
        description="Search, filter, profile, archive, and manage students within the current school tenant."
        actions={hasPermission(user.role, "students:create") ? <ButtonLink href="/students/new">Add student</ButtonLink> : null}
      />

      <Card className="mb-5 p-4">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px_auto]" action="/students">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <Input name="q" defaultValue={params.q} className="pl-9" placeholder="Search name or admission number" />
          </div>
          <Select name="status" defaultValue={params.status ?? "active"}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
            <option value="archived">Archived</option>
          </Select>
          <Select name="classId" defaultValue={params.classId ?? "all"}>
            <option value="all">All classes</option>
            {academics.classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.grade_name} • {item.name}
              </option>
            ))}
          </Select>
          <button className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-[#2259bf]">Filter</button>
        </form>
      </Card>

      <StudentTable rows={students.rows} />
      <p className="mt-4 text-sm text-muted">
        Showing {students.rows.length} of {students.count} students.
      </p>
    </>
  );
}
