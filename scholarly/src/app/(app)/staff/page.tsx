import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/form-field";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { getStaff } from "@/lib/services/staff";

export default async function StaffPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("staff:view");
  const staff = await getStaff(user, params.role ?? "all", params.q ?? "");

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Teachers and Staff"
        description="Review staff profiles, departments, statuses, roles, and class assignment summaries."
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
            <Card key={member.member_id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{member.full_name}</h2>
                  <p className="mt-1 text-sm text-muted">{member.email}</p>
                </div>
                <Badge tone={member.status === "active" ? "green" : "gray"}>{member.status}</Badge>
              </div>
              <CardContent className="mt-4 grid gap-2 p-0 text-sm text-muted">
                <p><span className="font-semibold text-ink">Role:</span> {member.role.replace("_", " ")}</p>
                <p><span className="font-semibold text-ink">Department:</span> {member.department ?? "Not set"}</p>
                <p><span className="font-semibold text-ink">Title:</span> {member.job_title ?? "Not set"}</p>
                <p><span className="font-semibold text-ink">Assigned classes:</span> {member.assigned_classes ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
