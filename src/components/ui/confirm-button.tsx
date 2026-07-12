"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmButton({
  label,
  confirmText,
  action,
  variant = "danger"
}: {
  label: string;
  confirmText: string;
  action: () => Promise<void>;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          await action();
        });
      }}
    >
      {pending ? "Working..." : label}
    </Button>
  );
}
