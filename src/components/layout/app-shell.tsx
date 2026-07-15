"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BriefcaseBusiness, Building2, ChevronDown, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AppUser } from "@/types/database";
import { hasPermission } from "@/lib/permissions";
import { cn, initials } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";
import { createClient } from "@/lib/supabase/browser";
import { AnnouncementBell } from "@/components/layout/announcement-bell";
import { BrandingFaviconSync } from "@/components/layout/branding-favicon-sync";

type SchoolBranding = {
  logoUrl: string | null;
  faviconUrl: string | null;
};

export function AppShell({ user, branding, children }: { user: AppUser; branding: SchoolBranding; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const items = navItems.filter((item) => {
    if (item.href === "/academics" && hasPermission(user.role, "classes:manage", user.permissions)) {
      return false;
    }

    return hasPermission(user.role, item.permission, user.permissions);
  });
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Auto-expand the current module when navigating inside it.
    setExpandedModules((current) => {
      let next = current;
      for (const item of items) {
        if (!item.subItems) continue;
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
          if (current[item.href]) continue;
          if (next === current) next = { ...current };
          next[item.href] = true;
        }
      }
      return next;
    });
  }, [items, pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!hasPermission(user.role, "approvals:review", user.permissions)) return;

    // Fetch initial count
    async function fetchCount() {
      const { count } = await supabase
        .from("approval_requests")
        .select("*", { count: "exact", head: true })
        .eq("school_id", user.schoolId)
        .eq("status", "pending");
      if (count !== null) setPendingCount(count);
    }
    
    fetchCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("approval_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "approval_requests",
          filter: `school_id=eq.${user.schoolId}`
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.permissions, user.schoolId, user.role, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  const renderProfileAvatar = () => (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-sm font-bold text-primary ring-1 ring-white/80">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(user.fullName)
      )}
    </div>
  );

  const sidebar = (
    <aside className="flex h-full w-[280px] flex-col bg-white p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-[#2d7dd2] text-white shadow-soft">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt={`${user.schoolName} logo`} className="h-full w-full object-cover" />
          ) : (
            <BookOpen aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="font-display text-2xl font-bold leading-tight text-primary">GoCampusFlow</p>
          <p className="font-label text-xs font-semibold uppercase tracking-wider text-muted">{user.schoolName}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isApprovals = item.href === "/approvals";
          const showBadge = isApprovals && pendingCount > 0 && hasPermission(user.role, "approvals:review", user.permissions);

          if (item.subItems) {
            const allowedSubItems = item.subItems.filter(sub => hasPermission(user.role, sub.permission, user.permissions));
            if (allowedSubItems.length === 0) return null;
            const expanded = expandedModules[item.href] ?? active;
            return (
              <div key={item.href} className="space-y-1">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedModules((current) => ({ ...current, [item.href]: !(current[item.href] ?? active) }))
                  }
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition",
                    active ? "bg-primary-soft text-primary shadow-[inset_3px_0_0_#3366cc]" : "text-muted hover:bg-surface-low hover:text-primary"
                  )}
                  aria-expanded={expanded}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition",
                        active ? "bg-white/80 text-primary" : "bg-surface-low text-muted group-hover:bg-white group-hover:text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {item.label}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition", expanded ? "rotate-180" : "")} aria-hidden="true" />
                </button>

                {expanded && (
                  <div className="ml-5 space-y-0.5 border-l border-outline/40 pl-2">
                    {allowedSubItems.map((sub) => {
                      const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                      return (
                        <Link
                          href={sub.href}
                          key={sub.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-semibold transition",
                            isSubActive
                              ? "bg-primary-soft text-primary font-bold shadow-[inset_2px_0_0_#3366cc]"
                              : "text-muted hover:bg-surface-low hover:text-primary"
                          )}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                active ? "bg-primary-soft text-primary shadow-[inset_3px_0_0_#3366cc]" : "text-muted hover:bg-surface-low hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition",
                    active ? "bg-white/80 text-primary" : "bg-surface-low text-muted group-hover:bg-white group-hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {item.label}
              </div>
              {showBadge && (
                <span className="flex h-5 items-center justify-center rounded-full bg-danger px-2 text-xs font-bold text-white">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/profile"
        onClick={() => setOpen(false)}
        className="mt-4 rounded-lg bg-gradient-to-br from-surface-low to-primary-soft/70 p-3 text-sm transition hover:from-primary-soft hover:to-success-soft"
      >
        <p className="font-label text-xs font-bold uppercase tracking-wide text-primary">Signed in as</p>
        <p className="mt-1 truncate font-semibold text-ink">{user.fullName}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{user.jobTitle ?? user.role.replace("_", " ")}</p>
      </Link>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-ink">
      <BrandingFaviconSync faviconUrl={branding.faviconUrl} />
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[280px] bg-white/95 shadow-[1px_0_0_rgba(195,198,213,0.32)] backdrop-blur lg:block">{sidebar}</div>
      <div className={cn("fixed inset-0 z-50 bg-black/30 lg:hidden", open ? "block" : "hidden")} onClick={() => setOpen(false)} />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] transform bg-white shadow-soft transition lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-end p-3">
          <button className="rounded-lg p-2 hover:bg-surface-low" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebar}
      </div>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 bg-white/82 px-4 shadow-[0_1px_0_rgba(195,198,213,0.32)] backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-surface-low lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-[220px] max-w-md flex-1 items-center gap-2 rounded-lg bg-surface-low px-3 py-2 ring-1 ring-outline/25 sm:flex">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Search records..." aria-label="Search records" />
            </div>
          </div>
          <div className="relative flex items-center gap-3" ref={menuRef}>
            {hasPermission(user.role, "announcements:view", user.permissions) && (
              <AnnouncementBell user={user} />
            )}
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex min-w-0 items-center gap-3 rounded-lg bg-surface-low py-1.5 pl-1.5 pr-2 ring-1 ring-outline/25 transition hover:bg-primary-soft/80"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              {renderProfileAvatar()}
              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-sm font-bold text-ink">{user.fullName}</p>
                <p className="font-label text-xs uppercase tracking-wide text-muted">{user.role.replace("_", " ")}</p>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted transition", profileOpen ? "rotate-180" : "")} aria-hidden="true" />
            </button>

            <div
              className={cn(
                "absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-lg bg-white/90 p-2 opacity-0 shadow-[0_24px_60px_rgba(27,28,29,0.12)] ring-1 ring-outline/30 backdrop-blur-xl transition",
                profileOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1"
              )}
              role="menu"
            >
              <div className="flex gap-3 rounded-lg bg-gradient-to-br from-primary-soft/80 to-success-soft/70 p-3">
                {renderProfileAvatar()}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{user.fullName}</p>
                  <p className="truncate text-xs font-semibold text-muted">{user.email ?? user.schoolName}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="truncate">{user.jobTitle ?? user.department ?? user.role.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 grid gap-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-low hover:text-primary"
                  role="menuitem"
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Profile
                </Link>
                <Link
                  href="/school-profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-low hover:text-primary"
                  role="menuitem"
                >
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  School Profile
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-muted transition hover:bg-danger-soft hover:text-danger"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
