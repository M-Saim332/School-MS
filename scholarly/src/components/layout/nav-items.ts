import {
  Activity,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Shield,
  UserCog,
  Users,
  BookOpen
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/approvals", label: "Action Center", icon: ClipboardCheck, permission: "approvals:view" },
  { href: "/students", label: "Students", icon: GraduationCap, permission: "students:view" },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, permission: "attendance:view" },
  { href: "/marks", label: "Marks", icon: FileText, permission: "marks:manage" },
  { href: "/exam-approvals", label: "Exam Approvals", icon: FileCheck2, permission: "marks:approve" },
  { href: "/results", label: "Result Cards", icon: FileText, permission: "results:generate" },
  { href: "/staff", label: "People", icon: Users, permission: "staff:view" },
  { href: "/teachers", label: "Teachers", icon: UserCog, permission: "teachers:manage" },
  { href: "/classes", label: "Classes", icon: BookOpen, permission: "classes:manage" },
  { href: "/academics", label: "Academics", icon: BarChart3, permission: "academics:view" },
  { href: "/reports", label: "Reports", icon: Activity, permission: "reports:view" },
  { href: "/admin", label: "Admin", icon: Shield, permission: "users:manage" }
] satisfies Array<{ href: string; label: string; icon: typeof LayoutDashboard; permission: Permission }>;
