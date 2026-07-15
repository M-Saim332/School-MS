import { Suspense } from "react";
import { Mail, Phone, AtSign, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { getStaff } from "@/lib/services/staff";
import { hasPermission } from "@/lib/permissions";
import { StaffFormModal } from "@/components/teachers/staff-form";
import { StaffFilterForm } from "@/components/staff/staff-filter-form";
import { createClient } from "@/lib/supabase/server";

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrator",
  principal: "Principal",
  teacher: "Teacher",
  student_staff: "Registrar / Student Staff"
};

function getRoleLabel(role: string, customRoleName?: string | null): string {
  if (customRoleName) return customRoleName;
  return ROLE_LABELS[role] ?? role.replace(/_/g, " ");
}

export default async function StaffPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const user = await requireUser("staff:view");

  // Fetch custom roles for the filter dropdown and role name resolution
  const supabase = await createClient();
  const { data: customRoles } = await supabase
    .from("custom_roles")
    .select("id,name")
    .eq("school_id", user.schoolId)
    .order("name");

  const staff = await getStaff(user, params.role ?? "all", params.q ?? "");
  const canCreateUsers = hasPermission(user.role, "teachers:manage", user.permissions);
  const allowedRoles =
    user.role === "administrator"
      ? (["administrator", "principal", "teacher", "student_staff"] as const)
      : (["teacher", "student_staff"] as const);

  return (
    <>
      <PageHeader
        eyebrow="School Directory"
        title="Staff"
        description="View all staff profiles, departments, roles, statuses, and class assignment summaries."
        actions={
          canCreateUsers ? (
            <StaffFormModal allowedRoles={[...allowedRoles]} triggerLabel="Add Staff Member" />
          ) : null
        }
      />

      {/* Search & Filter — no submit button, auto-applies on change */}
      <Card className="mb-5 p-4">
        <Suspense>
          <StaffFilterForm customRoles={customRoles ?? []} />
        </Suspense>
      </Card>

      {!staff.length ? (
        <EmptyState
          title="No staff found"
          description="Try a different search or role filter, or invite new staff from Settings."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {staff.map((member: any) => (
            <Card key={member.member_id} className="overflow-hidden">
              {/* Coloured top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-tertiary-soft" />

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold text-ink truncate">
                      {member.full_name}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{member.email}</span>
                    </p>
                    {member.personal_email && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        <AtSign className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{member.personal_email}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge tone={member.status === "active" ? "green" : "gray"}>
                      {member.status}
                    </Badge>
                    {member.must_change_password ? (
                      <Badge tone="yellow">Password reset</Badge>
                    ) : null}
                  </div>
                </div>

                <CardContent className="mt-4 grid gap-2 p-0 text-sm text-muted">
                  {/* Role */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">Role:</span>
                    <span>{getRoleLabel(member.role, member.custom_role_name)}</span>
                  </div>

                  {/* Department */}
                  {(member.department || member.job_title) && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>
                        {[member.department, member.job_title].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  {member.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>{member.phone}</span>
                    </p>
                  )}

                  {/* Classes */}
                  <p>
                    <span className="font-semibold text-ink">Assigned classes:</span>{" "}
                    {member.assigned_classes ?? 0}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
