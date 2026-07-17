import type { UserRole } from "@/types/database";

type RoleLike = UserRole | "admin" | undefined;

export function canManageSchoolBranding(role: RoleLike) {
  return role === "administrator" || role === "admin" || role === "principal";
}

export function usesPrincipalAcademicControl(role: RoleLike) {
  return role === "principal";
}

export function usesAcademicEvaluationTabs(role: RoleLike) {
  return role === "teacher" || role === "student_staff" || role === "administrator" || role === "admin";
}
