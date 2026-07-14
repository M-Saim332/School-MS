import { requireUser } from "@/lib/auth/session";
import { getProfileDetails } from "@/lib/services/profile";
import { getSchoolSettings, getAcademicYears, getSchoolMembers } from "@/lib/services/settings";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const user = await requireUser("settings:manage");

  const [profile, schoolSettings, academicYears, members] = await Promise.all([
    getProfileDetails(user),
    getSchoolSettings(user),
    getAcademicYears(user),
    user.role === "administrator" ? getSchoolMembers(user) : Promise.resolve([])
  ]);

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
      />
    </>
  );
}
