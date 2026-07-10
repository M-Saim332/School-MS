"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-field";
import { createClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-ink">Sign in</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Use your school invitation or Supabase Auth account to enter Scholarly.</p>
      {error ? <div className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        <Field label="Email address">
          <Input name="email" type="email" autoComplete="email" required placeholder="you@school.edu" />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button disabled={loading} className="mt-2 w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link className="font-semibold text-primary hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
        <span className="text-muted">Invitation required</span>
      </div>
    </>
  );
}
