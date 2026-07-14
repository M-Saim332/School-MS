import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppUser } from "@/types/database";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile";

type ProfileDetailsRow = {
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
};

type MemberDetailsRow = {
  department: string | null;
  job_title: string | null;
};

export type ProfileDetails = ProfileFormValues & {
  email: string | null;
  role: AppUser["role"];
  schoolName: string;
};

export async function getProfileDetails(user: AppUser): Promise<ProfileDetails> {
  const supabase = await createClient();

  const [profileResult, memberResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,avatar_url,phone,bio,address,emergency_contact_name,emergency_contact_phone")
      .eq("id", user.id)
      .maybeSingle<ProfileDetailsRow>(),
    supabase
      .from("school_members")
      .select("department,job_title")
      .eq("school_id", user.schoolId)
      .eq("user_id", user.id)
      .maybeSingle<MemberDetailsRow>()
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (memberResult.error) throw new Error(memberResult.error.message);

  const profile = profileResult.data;
  const member = memberResult.data;

  return {
    fullName: profile?.full_name ?? user.fullName,
    email: profile?.email ?? user.email,
    avatarUrl: profile?.avatar_url ?? user.avatarUrl,
    phone: profile?.phone ?? null,
    bio: profile?.bio ?? null,
    department: member?.department ?? user.department,
    jobTitle: member?.job_title ?? user.jobTitle,
    address: profile?.address ?? null,
    emergencyContactName: profile?.emergency_contact_name ?? null,
    emergencyContactPhone: profile?.emergency_contact_phone ?? null,
    role: user.role,
    schoolName: user.schoolName
  };
}

export async function updateProfileDetails(user: AppUser, values: ProfileFormValues) {
  const parsed = profileFormSchema.parse(values);
  const adminClient = createAdminClient();

  const [{ error: profileError }, { error: memberError }] = await Promise.all([
    adminClient
      .from("profiles")
      .update({
        full_name: parsed.fullName,
        avatar_url: parsed.avatarUrl,
        phone: parsed.phone,
        bio: parsed.bio,
        address: parsed.address,
        emergency_contact_name: parsed.emergencyContactName,
        emergency_contact_phone: parsed.emergencyContactPhone
      })
      .eq("id", user.id),
    adminClient
      .from("school_members")
      .update({
        department: parsed.department,
        job_title: parsed.jobTitle
      })
      .eq("school_id", user.schoolId)
      .eq("user_id", user.id)
  ]);

  if (profileError) throw new Error(profileError.message);
  if (memberError) throw new Error(memberError.message);
}
