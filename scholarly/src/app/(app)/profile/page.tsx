import { PageHeader } from "@/components/layout/page-header";
import { ProfileView } from "@/components/profile/profile-view";
import { SuccessMessage } from "@/components/ui/status-message";
import { requireUser } from "@/lib/auth/session";
import { getProfileDetails } from "@/lib/services/profile";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser();
  const profile = await getProfileDetails(user);

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title="Profile"
        description="View your profile details."
      />
      {params.saved === "profile" ? <SuccessMessage>Profile saved successfully.</SuccessMessage> : null}
      <ProfileView profile={profile} />
    </>
  );
}
