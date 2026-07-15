import type { UserRole } from "@/types/database";

export type Permission =
  | "dashboard:view"
  | "students:view"
  | "students:create"
  | "students:update"
  | "students:archive"
  | "attendance:view"
  | "attendance:submit"
  | "staff:view"
  | "staff:manage"
  | "academics:view"
  | "academics:manage"
  | "marks:manage"
  | "marks:approve"
  | "results:view"
  | "results:generate"
  | "reports:view"
  | "activity:view"
  | "settings:manage"
  | "users:manage"
  | "approvals:view"
  | "approvals:review"
  | "teachers:manage"
  | "classes:manage"
  | "finance:view"
  | "finance:manage"
  | "payroll:view"
  | "payroll:manage"
  | "announcements:view"
  | "announcements:manage";

export const AVAILABLE_PERMISSIONS: Permission[] = [
  "dashboard:view", "students:view", "students:create", "students:update", "students:archive",
  "attendance:view", "attendance:submit", "staff:view", "staff:manage", "academics:view",
  "academics:manage", "marks:manage", "marks:approve", "results:view", "results:generate",
  "reports:view", "activity:view", "settings:manage", "users:manage", "approvals:view",
  "approvals:review", "teachers:manage", "classes:manage", "finance:view", "finance:manage",
  "payroll:view", "payroll:manage", "announcements:view", "announcements:manage"
];

const rolePermissions: Record<UserRole, Permission[]> = {
  principal: [
    "dashboard:view",
    "students:view",
    "students:create",
    "students:update",
    "students:archive",
    "attendance:view",
    "staff:view",
    "academics:view",
    "marks:approve",
    "results:view",
    "results:generate",
    "reports:view",
    "activity:view",
    "approvals:view",
    "approvals:review",
    "teachers:manage",
    "classes:manage",
    "finance:view",
    "finance:manage",
    "payroll:view",
    "payroll:manage",
    "announcements:view",
    "announcements:manage"
  ],
  teacher: [
    "dashboard:view",
    "students:view",
    "attendance:view",
    "attendance:submit",
    "academics:view",
    "marks:manage",
    "results:view",
    "payroll:view",
    "announcements:view"
  ],
  student_staff: [
    "dashboard:view",
    "students:view",
    "attendance:view",
    "results:view",
    "results:generate",
    "reports:view",
    "approvals:view",
    "finance:view",
    "announcements:view"
  ],
  administrator: [
    "dashboard:view",
    "students:view",
    "students:create",
    "students:update",
    "students:archive",
    "attendance:view",
    "staff:view",
    "staff:manage",
    "academics:view",
    "academics:manage",
    "results:view",
    "results:generate",
    "reports:view",
    "activity:view",
    "settings:manage",
    "users:manage",
    "approvals:view",
    "approvals:review",
    "teachers:manage",
    "classes:manage",
    "finance:view",
    "finance:manage",
    "payroll:view",
    "payroll:manage",
    "announcements:view",
    "announcements:manage"
  ]
};

export function hasPermission(role: UserRole | undefined, permission: Permission, userPermissions?: string[] | null) {
  if (!role) return false;
  if (permission === "announcements:manage" && (role === "principal" || role === "administrator")) {
    return true;
  }
  if (permission === "settings:manage" && (role === "principal" || role === "administrator")) {
    return true;
  }
  // If we have a resolved permission list from the DB, use that
  if (userPermissions != null) return userPermissions.includes(permission);
  // Fall back to static lookup
  return rolePermissions[role].includes(permission);
}

export function getRolePermissions(role: UserRole) {
  return rolePermissions[role];
}

export function roleHome(role: UserRole) {
  if (role === "administrator") return "/admin";
  if (role === "student_staff") return "/students";
  return "/dashboard";
}
