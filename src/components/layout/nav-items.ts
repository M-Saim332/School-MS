import {
  Activity,
  BarChart3,
  Banknote,
  Bell,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Shield,
  UserCog,
  Users,
  BookOpen,
  Coins
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: Permission;
  subItems?: Array<{ href: string; label: string; permission: Permission }>;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/approvals", label: "Action Center", icon: ClipboardCheck, permission: "approvals:view" },
  { href: "/students", label: "Students", icon: GraduationCap, permission: "students:view" },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, permission: "attendance:view" },
  { href: "/marks", label: "Marks", icon: FileText, permission: "marks:manage" },
  { href: "/exam-approvals", label: "Exam Approvals", icon: FileCheck2, permission: "marks:approve" },
  { href: "/results", label: "Results", icon: FileText, permission: "results:view" },
  {
    href: "/finance",
    label: "Finance",
    icon: Coins,
    permission: "finance:view",
    subItems: [
      { href: "/finance/dashboard", label: "Dashboard", permission: "finance:view" },
      { href: "/finance/fee-structures", label: "Fee Structures", permission: "finance:view" },
      { href: "/finance/student-fees", label: "Student Fees", permission: "finance:view" },
      { href: "/finance/payments", label: "Payments", permission: "finance:view" },
      { href: "/finance/receipts", label: "Receipts", permission: "finance:view" },
      { href: "/finance/reports", label: "Reports", permission: "finance:view" }
    ]
  },
  {
    href: "/payroll",
    label: "Payroll",
    icon: Banknote,
    permission: "payroll:view",
    subItems: [
      { href: "/payroll/dashboard", label: "Dashboard", permission: "payroll:view" },
      { href: "/payroll/salary-slips", label: "Salary Slips", permission: "payroll:view" },
      { href: "/payroll/adjustments", label: "Adjustments", permission: "payroll:manage" },
      { href: "/payroll/history", label: "History", permission: "payroll:view" }
    ]
  },
  { href: "/staff", label: "People", icon: Users, permission: "staff:view" },
  { href: "/teachers", label: "Teachers", icon: UserCog, permission: "teachers:manage" },
  { href: "/classes", label: "Classes", icon: BookOpen, permission: "classes:manage" },
  { href: "/academics", label: "Academics", icon: BarChart3, permission: "academics:view" },
  { href: "/reports", label: "Reports", icon: Activity, permission: "reports:view" },
  { href: "/announcements", label: "Announcements", icon: Bell, permission: "announcements:view" },
  { href: "/admin", label: "Admin", icon: Shield, permission: "users:manage" },
  { href: "/settings", label: "Settings", icon: Settings, permission: "settings:manage" }
];
