import { requireUser } from "@/lib/auth/session";
import { getProfileDetails } from "@/lib/services/profile";
import { 
  getSchoolSettings,
  getAcademicYears,
  getSchoolMembers
} from "@/lib/services/settings";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const user = await requireUser("settings:manage");

  const supabase = await createClient();

  const [profile, schoolSettings, academicYears, members, customRolesRes, rolePermsRes, overridesRes] = await Promise.all([
    getProfileDetails(user),
    getSchoolSettings(user),
    getAcademicYears(user),
    user.role === "administrator" ? getSchoolMembers(user) : Promise.resolve([]),
    user.role === "administrator" ? supabase.from("custom_roles").select("*").eq("school_id", user.schoolId).order("name") : Promise.resolve({ data: [] }),
    user.role === "administrator" ? supabase.from("role_permissions").select("*").eq("school_id", user.schoolId) : Promise.resolve({ data: [] }),
    user.role === "administrator" ? supabase.from("user_permission_overrides").select("*").eq("school_id", user.schoolId) : Promise.resolve({ data: [] })
  ]);

  const customRoles = customRolesRes.data ?? [];
  const rolePermissions = rolePermsRes.data ?? [];
  const userOverrides = overridesRes.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Account & School Settings"
        description="Configure your personal profile details, security settings, notification preferences, school settings, and user roles."
      />

      <SettingsTabs
        user={user}
        profile={profile}
        schoolSettings={schoolSettings}
        academicYears={academicYears}
        members={members}
        customRoles={customRoles}
        rolePermissions={rolePermissions}
        userOverrides={userOverrides}
      />
    </>
  );
}
