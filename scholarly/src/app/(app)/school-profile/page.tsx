import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth/session";
import { getSchoolProfile } from "@/lib/services/school";
import { SchoolProfileView } from "@/components/school-profile/school-profile-view";
import { SuccessMessage } from "@/components/ui/status-message";

export default async function SchoolProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser();
  const schoolProfile = await getSchoolProfile();

  return (
    <>
      <PageHeader
        eyebrow="Information"
        title="School Profile"
        description="View your school's information, branding, and contact details."
      />
      {params.saved === "profile" ? <SuccessMessage>School profile saved successfully.</SuccessMessage> : null}
      
      <div className="mt-6">
        <SchoolProfileView user={user} profile={schoolProfile} />
      </div>
    </>
  );
}
