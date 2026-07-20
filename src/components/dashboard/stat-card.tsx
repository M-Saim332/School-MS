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
    <Card className="group p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
          <p className="mt-4 font-display text-4xl font-bold leading-none tracking-tight text-ink">{value}</p>
          {hint ? <p className="mt-3 text-sm font-medium leading-5 text-muted">{hint}</p> : null}
        </div>
        <div className="rounded-2xl bg-primary-soft p-3 text-primary transition duration-200 group-hover:bg-primary group-hover:text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
