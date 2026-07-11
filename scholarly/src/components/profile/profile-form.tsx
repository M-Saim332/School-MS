"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, CheckCircle2, IdCard, Mail, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form-field";
import { updateProfileAction } from "@/app/(app)/profile/actions";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile";
import type { ProfileDetails } from "@/lib/services/profile";
import { initials } from "@/lib/utils";

export function ProfileForm({ profile }: { profile: ProfileDetails }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl ?? "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      department: profile.department ?? "",
      jobTitle: profile.jobTitle ?? ""
    }
  });

  const displayName = watch("fullName") || profile.fullName;
  const avatarUrl = watch("avatarUrl");

  function onSubmit(values: ProfileFormValues) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await updateProfileAction(values);
        setMessage("Profile updated. Administrators will see the latest staff details.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Profile could not be updated.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="card-surface overflow-hidden rounded-lg">
        <div className="bg-gradient-to-br from-primary via-[#2d7dd2] to-success p-6 text-white">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-white/20 text-2xl font-bold shadow-soft backdrop-blur">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(displayName)
            )}
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">{displayName}</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-white/80">{profile.role.replace("_", " ")}</p>
        </div>

        <div className="grid gap-4 p-5 text-sm">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Email</p>
              <p className="mt-1 font-semibold text-ink">{profile.email ?? "Not provided"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <IdCard className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">School</p>
              <p className="mt-1 font-semibold text-ink">{profile.schoolName}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <BriefcaseBusiness className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Current title</p>
              <p className="mt-1 font-semibold text-ink">{watch("jobTitle") || "Not set"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Phone</p>
              <p className="mt-1 font-semibold text-ink">{watch("phone") || "Not set"}</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="card-surface rounded-lg p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-primary">Account details</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Profile Information</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-tertiary-soft/70 px-3 py-2 text-xs font-bold uppercase tracking-wide text-tertiary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Admin visible
          </div>
        </div>

        {message ? (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {message}
          </div>
        ) : null}
        {error ? <div className="mb-5 rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.message}>
            <Input {...register("fullName")} placeholder="Jane Doe" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} placeholder="+1 555 0100" />
          </Field>
          <Field label="Department" error={errors.department?.message}>
            <Input {...register("department")} placeholder="Admissions, Mathematics, Operations..." />
          </Field>
          <Field label="Job title" error={errors.jobTitle?.message}>
            <Input {...register("jobTitle")} placeholder="Registrar, Teacher, Principal..." />
          </Field>
          <div className="md:col-span-2">
            <Field label="Avatar URL" error={errors.avatarUrl?.message}>
              <Input {...register("avatarUrl")} placeholder="https://example.com/photo.jpg" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Short bio" error={errors.bio?.message}>
              <Textarea {...register("bio")} placeholder="A short professional note for administrators and school leadership." />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </section>
    </form>
  );
}
