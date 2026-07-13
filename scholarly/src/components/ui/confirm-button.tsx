"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getFriendlyErrorMessage } from "@/lib/errors";

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
          try {
            await action();
          } catch (error) {
            alert(getFriendlyErrorMessage(error));
          }
        });
      }}
    >
      {pending ? "Working..." : label}
    </Button>
  );
}
