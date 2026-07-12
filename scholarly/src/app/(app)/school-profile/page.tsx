import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth/session";
import { getSchoolProfile } from "@/lib/services/school";
import { SchoolProfileView } from "@/components/school-profile/school-profile-view";

export default async function SchoolProfilePage() {
  const user = await requireUser();
  const schoolProfile = await getSchoolProfile();

  return (
    <>
      <PageHeader
        eyebrow="Information"
        title="School Profile"
        description="View your school's information, branding, and contact details."
      />
      
      <div className="mt-6">
        <SchoolProfileView user={user} profile={schoolProfile} />
      </div>
    </>
  );
}
