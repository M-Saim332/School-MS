import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getStaff } from "@/lib/services/staff";
import { getRolePermissions } from "@/lib/permissions";

export default async function AdminPage() {
  const user = await requireUser("users:manage");
  const members = await getStaff(user);

  return (
    <>
      <PageHeader eyebrow="System" title="Administrator Console" description="Manage user membership, role policy, and school-level settings without exposing service-role credentials." />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <Badge tone="blue">{members.length} members</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: any) => (
                    <tr key={member.member_id} className="border-t border-outline/60">
                      <td className="py-3 pr-4 font-semibold">{member.full_name}</td>
                      <td className="py-3 pr-4">{member.email}</td>
                      <td className="py-3 pr-4">{member.role.replace("_", " ")}</td>
                      <td className="py-3 pr-4"><Badge>{member.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent className="space-y-4">
            {(["administrator", "principal", "teacher", "student_staff"] as const).map((role) => (
              <div key={role} className="rounded-lg bg-surface-low p-4">
                <p className="font-semibold capitalize text-ink">{role.replace("_", " ")}</p>
                <p className="mt-1 text-sm text-muted">{getRolePermissions(role).join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
