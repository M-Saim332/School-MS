import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth/session";
import { getSchoolProfile } from "@/lib/services/school";
import { SchoolProfileForm } from "@/components/school-profile/school-profile-form";

export default async function SchoolProfileEditPage() {
  const user = await requireUser();
  const schoolProfile = await getSchoolProfile();

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Edit School Profile"
        description="Manage your school's information, branding, and contact details."
      />
      
      <div className="mt-6">
        <SchoolProfileForm user={user} initialData={schoolProfile} />
      </div>
    </>
  );
}
