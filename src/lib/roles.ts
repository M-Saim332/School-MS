import type { UserRole } from "@/types/database";

export function canManageSchoolBranding(role: UserRole | undefined) {
  return role === "administrator" || role === "principal";
}

export function usesPrincipalAcademicControl(role: UserRole | undefined) {
  return role === "principal";
}

export function usesAcademicEvaluationTabs(role: UserRole | undefined) {
  return role === "teacher" || role === "head_teacher" || role === "student_staff" || role === "administrator";
}
