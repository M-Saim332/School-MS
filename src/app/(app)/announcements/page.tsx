import { requireUser } from "@/lib/auth/session";
import { getAnnouncements } from "@/lib/services/announcements";
import { hasPermission } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDatePK } from "@/lib/utils";
import { CreateAnnouncementDialog } from "@/components/announcements/create-announcement-dialog";
import { ArchiveAnnouncementButton } from "@/components/announcements/archive-announcement-button";
import { Bell, Calendar, Users } from "lucide-react";

const PRIORITY_TONE: Record<string, "blue" | "yellow" | "red" | "green"> = {
  low: "blue",
  medium: "yellow",
  high: "yellow",
  critical: "red"
};

const TYPE_LABELS: Record<string, string> = {
  general: "General",
  academic: "Academic",
  holiday: "Holiday",
  emergency: "Emergency",
  meeting: "Meeting",
  examination: "Examination",
  urgent: "Urgent"
};

export default async function AnnouncementsPage() {
  const user = await requireUser("announcements:view");
  const canManage = hasPermission(user.role, "announcements:manage", user.permissions);
  const announcements = await getAnnouncements(user);

  return (
    <>
      <PageHeader
        eyebrow="School"
        title="Announcements"
        description={
          canManage
            ? "Create, manage and broadcast announcements to all school staff."
            : "Active announcements from the school administration."
        }
        actions={canManage ? <CreateAnnouncementDialog /> : null}
      />

      {!announcements.length ? (
        <EmptyState
          title="No active announcements"
          description={canManage ? "Create your first announcement using the button above." : "No announcements have been posted yet."}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className={`overflow-hidden transition ${!a.is_read ? "ring-2 ring-primary/20" : ""}`}>
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-5">
                  {/* Priority strip */}
                  <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    a.priority === "critical" ? "bg-danger-soft text-danger" :
                    a.priority === "high" ? "bg-warning-soft text-warning" :
                    a.priority === "medium" ? "bg-primary-soft text-primary" :
                    "bg-surface-low text-muted"
                  }`}>
                    <Bell className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-bold text-ink">{a.title}</h2>
                      {!a.is_read && (
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                      )}
                      <Badge tone={PRIORITY_TONE[a.priority] ?? "blue"}>{a.priority}</Badge>
                      <Badge tone="blue">{TYPE_LABELS[a.type] ?? a.type}</Badge>
                    </div>

                    <p className="mt-2 text-sm text-muted leading-relaxed">{a.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDatePK(a.publish_date)}
                        {a.expiry_date && ` – ${formatDatePK(a.expiry_date)}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Audience: {a.audience_type}
                        {a.audience_value ? ` (${a.audience_value})` : ""}
                      </span>
                      {a.created_by_name && (
                        <span>Posted by {a.created_by_name}</span>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex-shrink-0">
                      <ArchiveAnnouncementButton announcementId={a.id} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
