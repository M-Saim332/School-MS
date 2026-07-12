import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/lib/auth/session";
import { getProfileDetails } from "@/lib/services/profile";

export default async function ProfileEditPage() {
  const user = await requireUser();
  const profile = await getProfileDetails(user);

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title="Edit Profile"
        description="Keep your profile current so administrators can see the right contact, department, and role context."
      />
      <div className="mt-6">
        <ProfileForm profile={profile} />
      </div>
    </>
  );
}
