"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-field";
import { getSupabaseBrowserErrorMessage } from "@/lib/supabase/browser-error";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8 || password !== confirm) {
      setLoading(false);
      setError("Use at least 8 characters and make sure both passwords match.");
      return;
    }
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.replace("/sign-in?message=Password updated. Please sign in again.");
    } catch (error) {
      setError(getSupabaseBrowserErrorMessage(error, "Unable to update your password right now. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-ink">Choose a new password</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Your password should be unique and at least 8 characters long.</p>
      {error ? <div className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <Field label="New password">
          <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Field label="Confirm password">
          <Input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
        <Button disabled={loading}>{loading ? "Updating..." : "Update password"}</Button>
      </form>
    </>
  );
}
