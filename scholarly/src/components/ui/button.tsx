import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-primary to-[#2d7dd2] text-white shadow-[0_12px_24px_rgba(51,102,204,0.18)] hover:brightness-105 disabled:bg-outline disabled:from-outline disabled:to-outline disabled:text-muted disabled:shadow-none",
  secondary: "bg-surface-low text-primary ring-1 ring-outline/25 hover:bg-primary-soft disabled:text-muted",
  ghost: "bg-transparent text-muted hover:bg-surface-low hover:text-primary disabled:text-outline",
  danger: "bg-danger text-white hover:bg-[#991b1b] disabled:bg-outline disabled:text-muted"
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs",
  md: "min-h-10 px-4 py-2 text-sm"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-[0.99]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
