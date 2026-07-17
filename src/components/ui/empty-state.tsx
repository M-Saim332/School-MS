import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-56 flex-col items-center justify-center rounded-lg bg-surface-low p-8 text-center", className)}>
      <Inbox className="mb-3 h-8 w-8 text-primary" aria-hidden="true" />
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
