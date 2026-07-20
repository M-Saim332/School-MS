"use client";

import type { FormEvent, ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function TransportRefreshForm({
  action,
  className,
  children
}: {
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    setError(null);

    startTransition(async () => {
      try {
        await action(formData);
        form.reset();
        window.dispatchEvent(new CustomEvent("transport-action-success"));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transport update failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className} aria-busy={pending}>
      {error ? <div className="rounded-lg bg-danger-soft p-3 text-sm font-semibold text-danger">{error}</div> : null}
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
