import {
  Activity,
  BarChart3,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Shield,
  Users
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/students", label: "Students", icon: GraduationCap, permission: "students:view" },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, permission: "attendance:view" },
  { href: "/staff", label: "People", icon: Users, permission: "staff:view" },
  { href: "/academics", label: "Academics", icon: BarChart3, permission: "academics:view" },
  { href: "/reports", label: "Reports", icon: Activity, permission: "reports:view" },
  { href: "/admin", label: "Admin", icon: Shield, permission: "users:manage" },
  { href: "/settings", label: "Settings", icon: Settings, permission: "settings:manage" }
] satisfies Array<{ href: string; label: string; icon: typeof LayoutDashboard; permission: Permission }>;
