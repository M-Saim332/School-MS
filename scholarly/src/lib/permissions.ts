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
  | "reports:view"
  | "activity:view"
  | "settings:manage"
  | "users:manage"
  | "approvals:view"
  | "approvals:review"
  | "teachers:manage"
  | "classes:manage";

const rolePermissions: Record<UserRole, Permission[]> = {
  principal: [
    "dashboard:view",
    "students:view",
    "students:create",
    "attendance:view",
    "staff:view",
    "academics:view",
    "reports:view",
    "activity:view",
    "approvals:view",
    "approvals:review",
    "teachers:manage",
    "classes:manage"
  ],
  teacher: ["dashboard:view", "students:view", "attendance:view", "attendance:submit", "academics:view"],
  student_staff: [
    "dashboard:view",
    "students:view",
    "students:create",
    "students:update",
    "students:archive",
    "attendance:view",
    "reports:view",
    "approvals:view"
  ],
  administrator: [
    "dashboard:view",
    "students:view",
    "students:create",
    "students:update",
    "students:archive",
    "attendance:view",
    "attendance:submit",
    "staff:view",
    "staff:manage",
    "academics:view",
    "academics:manage",
    "reports:view",
    "activity:view",
    "settings:manage",
    "users:manage",
    "approvals:view",
    "approvals:review",
    "teachers:manage",
    "classes:manage"
  ]
};

export function hasPermission(role: UserRole | undefined, permission: Permission) {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
}

export function getRolePermissions(role: UserRole) {
  return rolePermissions[role];
}

export function roleHome(role: UserRole) {
  if (role === "teacher") return "/dashboard?role=teacher";
  if (role === "administrator") return "/admin";
  return "/dashboard";
}
