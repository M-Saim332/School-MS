import { PageHeader } from "@/components/layout/page-header";
import { ProfileView } from "@/components/profile/profile-view";
import { requireUser } from "@/lib/auth/session";
import { getProfileDetails } from "@/lib/services/profile";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfileDetails(user);

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title="Profile"
        description="View your profile details."
      />
      <ProfileView profile={profile} />
    </>
  );
}
