import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSchoolMetadata } from "@/lib/supabase/school-metadata";
import type { AppUser, UserRole } from "@/types/database";
import { hasPermission, type Permission } from "@/lib/permissions";

type MemberRow = {
  school_id: string;
  role: UserRole;
  department: string | null;
  job_title: string | null;
  schools: {
    name: string;
  } | null;
};

async function getActiveMember(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("school_members")
    .select("school_id, role, department, job_title, schools(name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<MemberRow>();
}

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileResult, memberResult] = await Promise.all([
    supabase.from("profiles").select("full_name,email,avatar_url,must_change_password").eq("id", user.id).maybeSingle(),
    getActiveMember(user.id)
  ]);

  const profile = profileResult.data;
  const member = memberResult.data;

  if (!member) {
    console.error(`getCurrentUser failed for user ${user.id}:`, JSON.stringify({
      profileError: profileResult.error,
      memberError: memberResult.error,
      memberData: memberResult.data
    }, null, 2));
    return null;
  }

  const schoolResult = await getSchoolMetadata(member.school_id);
  const school = schoolResult.data;

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? user.email ?? "GoCampusFlow User",
    avatarUrl: profile?.avatar_url ?? null,
    schoolId: member.school_id,
    schoolName: school?.name ?? member.schools?.name ?? "School",
    schoolShortName: school?.short_name ?? null,
    schoolLogoUrl: school?.logo_url ?? null,
    schoolFaviconUrl: school?.favicon_url ?? null,
    role: member.role,
    department: member.department,
    jobTitle: member.job_title,
    mustChangePassword: Boolean(profile?.must_change_password)
  };
});

export async function requireUser(permission?: Permission) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (permission && !hasPermission(user.role, permission)) redirect("/unauthorized");
  return user;
}
