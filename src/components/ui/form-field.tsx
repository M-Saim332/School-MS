import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] placeholder:text-muted/70 focus:border-primary focus:ring-0 disabled:bg-surface-low",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:ring-0 disabled:bg-surface-low",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:ring-0 disabled:bg-surface-low",
        className
      )}
      {...props}
    />
  );
}
