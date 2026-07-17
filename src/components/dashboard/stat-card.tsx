import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
          <p className="mt-3 font-display text-4xl font-semibold leading-none text-ink">{value}</p>
          {hint ? <p className="mt-3 text-sm text-muted">{hint}</p> : null}
        </div>
        <div className="rounded-lg bg-primary-soft p-3 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
