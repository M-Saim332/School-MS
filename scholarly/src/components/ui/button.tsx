import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-[#2259bf] disabled:bg-outline disabled:text-muted",
  secondary: "bg-surface-low text-primary hover:bg-primary-soft disabled:text-muted",
  ghost: "bg-transparent text-muted hover:bg-surface-low hover:text-primary disabled:text-outline",
  danger: "bg-danger text-white hover:bg-[#991b1b] disabled:bg-outline disabled:text-muted"
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-[0.99]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
