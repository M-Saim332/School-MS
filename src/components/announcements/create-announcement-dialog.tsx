"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { createAnnouncementAction } from "@/app/(app)/announcements/actions";
import type { AnnouncementPriority, AnnouncementType, AnnouncementAudienceType } from "@/types/database";

export function CreateAnnouncementDialog({
  triggerLabel = "New Announcement",
  triggerClassName,
  onSuccess
}: {
  triggerLabel?: string;
  triggerClassName?: string;
  onSuccess?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as AnnouncementPriority,
    type: "general" as AnnouncementType,
    audience_type: "all" as AnnouncementAudienceType,
    audience_value: "",
    publish_date: today,
    expiry_date: ""
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    startTransition(async () => {
      const res = await createAnnouncementAction({
        ...form,
        expiry_date: form.expiry_date || null,
        audience_value: form.audience_value || null
      } as any);
      if (res.error) {
        setError(res.error);
      } else {
        setOpen(false);
        setForm({ title: "", description: "", priority: "medium", type: "general", audience_type: "all", audience_value: "", publish_date: today, expiry_date: "" });
        if (onSuccess) {
          await onSuccess();
        }
        router.refresh();
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-[0_32px_80px_rgba(27,28,29,0.18)]">
        <div className="border-b border-outline/40 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-ink">New Announcement</h2>
          <p className="text-sm text-muted">Broadcast a message to all school staff members.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Title <span className="text-danger">*</span></label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Important Staff Meeting" className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Description <span className="text-danger">*</span></label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Provide full details of the announcement..." className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="holiday">Holiday</option>
                <option value="emergency">Emergency</option>
                <option value="meeting">Meeting</option>
                <option value="examination">Examination</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Audience</label>
            <select value={form.audience_type} onChange={(e) => set("audience_type", e.target.value)} className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="all">All Staff</option>
              <option value="teachers">Teachers Only</option>
              <option value="registrar">Registrar Only</option>
              <option value="admin">Admin Only</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Publish Date</label>
              <input type="date" value={form.publish_date} onChange={(e) => set("publish_date", e.target.value)} className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Expiry Date <span className="text-xs text-muted">(optional)</span></label>
              <input type="date" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-danger">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-outline/60 px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-low">Cancel</button>
            <button type="submit" disabled={isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60">
              {isPending ? "Publishing..." : "Publish Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? "inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-soft hover:brightness-105"}
      >
        {triggerLabel}
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
