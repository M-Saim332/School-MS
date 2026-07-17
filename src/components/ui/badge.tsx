import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const toneClasses = {
  blue: "bg-primary-soft text-primary",
  green: "bg-success-soft text-success",
  yellow: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  gray: "bg-surface-low text-muted"
};

export function Badge({
  className,
  tone = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof toneClasses }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide", toneClasses[tone], className)}
      {...props}
    />
  );
}
