import {
  Activity,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  BookOpen,
  Coins
} from "lucide-react";
import type { Permission } from "@/lib/permissions";
import type { UserRole } from "@/types/database";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: Permission;
  subItems?: Array<{ href: string; label: string; permission: Permission }>;
  roles?: UserRole[];
  hiddenForRoles?: UserRole[];
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/approvals", label: "Action Center", icon: ClipboardCheck, permission: "approvals:view" },
  { href: "/students", label: "Students", icon: GraduationCap, permission: "students:view" },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, permission: "attendance:view" },
  { href: "/exam-approvals", label: "Exam Approvals", icon: FileCheck2, permission: "marks:approve" },
  {
    href: "/admin/academic-control",
    label: "Academic Control",
    icon: BarChart3,
    permission: "academics:view",
    roles: ["principal"]
  },
  {
    href: "/academics",
    label: "Academics",
    icon: BarChart3,
    permission: "academics:view",
    hiddenForRoles: ["principal"],
    subItems: [
      { href: "/academics/exams-setup", label: "Exams & Marks Setup", permission: "academics:view" },
      { href: "/academics/results", label: "Results Portal", permission: "results:view" }
    ]
  },
  {
    href: "/finance",
    label: "Finance",
    icon: Coins,
    permission: "finance:view",
    subItems: [
      { href: "/finance/dashboard", label: "Dashboard", permission: "finance:view" },
      { href: "/finance/fees", label: "Fee Management", permission: "finance:view" },
      { href: "/finance/fee-structures", label: "Fee Structures", permission: "finance:view" },
      { href: "/finance/receipts", label: "Receipts", permission: "finance:view" },
      { href: "/finance/reports", label: "Reports", permission: "finance:view" },
      { href: "/finance/payroll", label: "Payroll", permission: "payroll:view" }
    ]
  },
  { href: "/staff", label: "Staff", icon: Users, permission: "staff:view" },
  { href: "/classes", label: "Classes", icon: BookOpen, permission: "classes:manage" },
  { href: "/reports", label: "Reports", icon: Activity, permission: "reports:view" },
  { href: "/admin", label: "Admin", icon: Shield, permission: "users:manage" },
  { href: "/settings", label: "Settings", icon: Settings, permission: "settings:manage" }
];
