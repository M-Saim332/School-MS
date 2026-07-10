import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, UserRole } from "@/types/database";
import { hasPermission, type Permission } from "@/lib/permissions";

type MemberRow = {
  school_id: string;
  role: UserRole;
  schools: { name: string } | null;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileResult, memberResult] = await Promise.all([
    supabase.from("profiles").select("full_name,email,avatar_url").eq("id", user.id).maybeSingle(),
    supabase
      .from("school_members")
      .select("school_id, role, schools(name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle<MemberRow>()
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

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? user.email ?? "Scholarly User",
    avatarUrl: profile?.avatar_url ?? null,
    schoolId: member.school_id,
    schoolName: member.schools?.name ?? "School",
    role: member.role
  };
}

export async function requireUser(permission?: Permission) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (permission && !hasPermission(user.role, permission)) redirect("/unauthorized");
  return user;
}
