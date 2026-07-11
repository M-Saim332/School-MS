import { Mail, Phone, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/form-field";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { getStaff } from "@/lib/services/staff";
import { hasPermission } from "@/lib/permissions";
import { StaffFormModal } from "@/components/teachers/staff-form";

export default async function StaffPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("staff:view");
  const staff = await getStaff(user, params.role ?? "all", params.q ?? "");
  const canCreateUsers = hasPermission(user.role, "teachers:manage");
  const allowedRoles = user.role === "administrator" ? ["administrator", "principal", "teacher", "student_staff"] as const : ["teacher", "student_staff"] as const;

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Teachers and Staff"
        description="Review staff profiles, departments, statuses, roles, and class assignment summaries."
        actions={canCreateUsers ? <StaffFormModal allowedRoles={[...allowedRoles]} triggerLabel="Add User" /> : null}
      />
      <Card className="mb-5 p-4">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]" action="/staff">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <Input name="q" defaultValue={params.q} className="pl-9" placeholder="Search people, email, department" />
          </div>
          <Select name="role" defaultValue={params.role ?? "all"}>
            <option value="all">All roles</option>
            <option value="principal">Principals</option>
            <option value="teacher">Teachers</option>
            <option value="student_staff">Student-management staff</option>
            <option value="administrator">Administrators</option>
          </Select>
          <button className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-[#2259bf]">Filter</button>
        </form>
      </Card>
      {!staff.length ? (
        <EmptyState title="No staff found" description="Try another search or invite staff from the administrator panel." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {staff.map((member: any) => (
            <Card key={member.member_id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-tertiary-soft" />
              <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{member.full_name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {member.email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={member.status === "active" ? "green" : "gray"}>{member.status}</Badge>
                  {member.must_change_password ? <Badge tone="yellow">Password reset</Badge> : null}
                </div>
              </div>
              <CardContent className="mt-4 grid gap-2 p-0 text-sm text-muted">
                <p><span className="font-semibold text-ink">Role:</span> {member.role.replace("_", " ")}</p>
                <p><span className="font-semibold text-ink">Department:</span> {member.department ?? "Not set"}</p>
                <p><span className="font-semibold text-ink">Title:</span> {member.job_title ?? "Not set"}</p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span><span className="font-semibold text-ink">Phone:</span> {member.phone ?? "Not set"}</span>
                </p>
                <p><span className="font-semibold text-ink">Assigned classes:</span> {member.assigned_classes ?? 0}</p>
                {member.bio ? <p className="mt-2 rounded-lg bg-surface-low p-3 leading-6 text-ink">{member.bio}</p> : null}
              </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
