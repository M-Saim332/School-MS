"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut, Menu, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AppUser } from "@/types/database";
import { hasPermission } from "@/lib/permissions";
import { cn, initials } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";
import { createClient } from "@/lib/supabase/browser";

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navItems.filter((item) => hasPermission(user.role, item.permission));

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  const sidebar = (
    <aside className="flex h-full w-[280px] flex-col bg-white p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
          <BookOpen aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold leading-tight text-primary">Scholarly</p>
          <p className="font-label text-xs font-semibold uppercase tracking-wider text-muted">Education Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-low hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={signOut}
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-muted hover:bg-surface-low hover:text-danger"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Sign out
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-outline bg-white lg:block">{sidebar}</div>
      <div className={cn("fixed inset-0 z-50 bg-black/30 lg:hidden", open ? "block" : "hidden")} onClick={() => setOpen(false)} />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] transform border-r border-outline bg-white transition lg:hidden",
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
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-outline bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-surface-low lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-[220px] max-w-md flex-1 items-center gap-2 rounded-lg bg-surface-low px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Search records..." aria-label="Search records" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-ink">{user.fullName}</p>
              <p className="font-label text-xs uppercase tracking-wide text-muted">{user.role.replace("_", " ")}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
              {initials(user.fullName)}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
