"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn, formatDatePK } from "@/lib/utils";
import type { AppUser, AnnouncementWithRead, AnnouncementPriority } from "@/types/database";

const PRIORITY_STYLES: Record<AnnouncementPriority, string> = {
  low: "bg-surface-low text-muted",
  medium: "bg-primary-soft text-primary",
  high: "bg-warning-soft text-warning",
  critical: "bg-danger-soft text-danger"
};

const PRIORITY_DOT: Record<AnnouncementPriority, string> = {
  low: "bg-muted",
  medium: "bg-primary",
  high: "bg-warning",
  critical: "bg-danger"
};

export function AnnouncementBell({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementWithRead[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const supabase = useCallback(() => createClient(), []);

  const unreadCount = announcements.filter((a) => !a.is_read).length;

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Realtime subscription
  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel("announcements_bell")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements", filter: `school_id=eq.${user.schoolId}` }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user.schoolId, supabase, fetchAnnouncements]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    // Optimistically update
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
    await fetch("/api/announcements/mark-read", { method: "POST", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
  }

  async function handleMarkAllRead() {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, is_read: true })));
    await fetch("/api/announcements/mark-all-read", { method: "POST" });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-surface-low ring-1 ring-outline/25 transition hover:bg-primary-soft/70"
        aria-label={`Announcements${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5 text-muted" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <div
        className={cn(
          "absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[360px] rounded-xl bg-white/95 shadow-[0_24px_60px_rgba(27,28,29,0.14)] ring-1 ring-outline/30 backdrop-blur-xl transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        )}
        role="dialog"
        aria-label="Announcements panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline/40 px-4 py-3">
          <div>
            <p className="font-semibold text-ink">Announcements</p>
            {unreadCount > 0 && (
              <p className="text-xs text-muted">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted">Loading…</div>
          ) : !announcements.length ? (
            <div className="py-10 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-outline" />
              <p className="text-sm text-muted">No active announcements</p>
            </div>
          ) : (
            <div className="divide-y divide-outline/30">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "group cursor-pointer px-4 py-3 transition hover:bg-surface-low/80",
                    !a.is_read && "bg-primary-soft/20"
                  )}
                  onClick={() => !a.is_read && handleMarkRead(a.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && !a.is_read && handleMarkRead(a.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <span className={cn("inline-flex h-2 w-2 rounded-full", PRIORITY_DOT[a.priority])} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("truncate text-sm font-semibold", a.is_read ? "text-ink" : "text-primary")}>
                          {a.title}
                        </p>
                        {!a.is_read && (
                          <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{a.description}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", PRIORITY_STYLES[a.priority])}>
                          {a.priority}
                        </span>
                        <span className="text-[10px] text-muted">{formatDatePK(a.publish_date)}</span>
                        {a.created_by_name && (
                          <span className="text-[10px] text-muted">by {a.created_by_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-outline/40 px-4 py-2.5">
          <a href="/announcements" className="text-xs font-semibold text-primary hover:underline">
            View all announcements →
          </a>
        </div>
      </div>
    </div>
  );
}
