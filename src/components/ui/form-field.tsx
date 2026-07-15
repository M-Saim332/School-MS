import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  error,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-medium text-muted">{hint}</span> : null}
      {error ? <span className="text-sm font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  const isDateInput = props.type === "date";

  return (
    <input
      ref={ref}
      className={cn(
        "min-h-11 w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] placeholder:text-muted/70 focus:border-primary focus:ring-0 disabled:bg-surface-low",
        isDateInput &&
          "pr-10 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70",
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        "min-h-11 w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:ring-0 disabled:bg-surface-low",
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:ring-0 disabled:bg-surface-low",
        className
      )}
      {...props}
    />
  );
});
