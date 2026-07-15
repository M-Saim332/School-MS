"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, CheckCircle2, IdCard, Lock, Mail, Phone } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-field";
import { updateProfileAction } from "@/app/(app)/profile/actions";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/profile";
import type { ProfileDetails } from "@/lib/services/profile";
import { initials } from "@/lib/utils";

export function ProfileForm({ profile }: { profile: ProfileDetails }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canEditRoleDetails = profile.role === "principal";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone ?? "",
      personalEmail: profile.personalEmail ?? "",
      department: profile.department ?? "",
      jobTitle: profile.jobTitle ?? "",
      address: profile.address ?? "",
      emergencyContactName: profile.emergencyContactName ?? "",
      emergencyContactPhone: profile.emergencyContactPhone ?? ""
    }
  });

  const displayName = watch("fullName") || profile.fullName;

  function onSubmit(values: ProfileFormValues) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateProfileAction(values);
        if (res && "error" in res) {
          setError(res.error as string);
        } else {
          setMessage("Profile updated successfully.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Profile could not be updated.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      {/* ── Avatar / Info Sidebar ── */}
      <aside className="card-surface overflow-hidden rounded-lg">
        <div className="bg-gradient-to-br from-primary via-[#2d7dd2] to-success p-6 text-white">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-white/20 text-2xl font-bold shadow-soft backdrop-blur">
            {initials(displayName)}
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">{displayName}</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
            {profile.role.replace("_", " ")}
          </p>
        </div>

        <div className="grid gap-4 p-5 text-sm">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">
                Work Email
              </p>
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
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">
                Current Title
              </p>
              <p className="mt-1 font-semibold text-ink">{profile.jobTitle || "Not set"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Phone</p>
              <p className="mt-1 font-semibold text-ink">
                {watch("phone") ? `+92 ${watch("phone")}` : "Not set"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Edit Form ── */}
      <section className="card-surface rounded-lg p-5 sm:p-6">
        <div className="mb-6">
          <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Account Details
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Profile Information</h2>
          <p className="mt-1 text-sm text-muted">
            Administrators can view your work details in the staff directory.
          </p>
        </div>

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Full name — editable by everyone */}
          <Field label="Full Name" error={errors.fullName?.message}>
            <Input {...register("fullName")} placeholder="Jane Doe" />
          </Field>

          {/* Phone — Pakistani format, UI shows 10-digit local number */}
          <Field
            label="Phone"
            error={errors.phone?.message}
            hint="Enter 10-digit number starting with 3 (e.g. 3001234567)"
          >
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-outline/60 bg-surface-low px-3 text-sm font-semibold text-muted">
                +92
              </span>
              <Input
                {...register("phone")}
                className="rounded-l-none"
                placeholder="3001234567"
                maxLength={10}
              />
            </div>
          </Field>

          {/* Personal Email */}
          <Field label="Personal Email" error={errors.personalEmail?.message}>
            <Input
              {...register("personalEmail")}
              type="email"
              placeholder="personal@gmail.com"
            />
          </Field>

          {/* Department — editable only for principals */}
          <Field
            label="Department"
            hint={!canEditRoleDetails ? "Only the principal can change department details." : undefined}
            error={errors.department?.message}
          >
            {canEditRoleDetails ? (
              <Input {...register("department")} placeholder="Admissions, Mathematics, Operations..." />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-outline/60 bg-surface-low px-3 py-2.5 text-sm">
                <Lock className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                <span className="text-ink">{profile.department || "—"}</span>
              </div>
            )}
          </Field>

          {/* Job Title — editable only for principals */}
          <Field
            label="Job Title"
            hint={!canEditRoleDetails ? "Only the principal can change job title details." : undefined}
            error={errors.jobTitle?.message}
          >
            {canEditRoleDetails ? (
              <Input {...register("jobTitle")} placeholder="Registrar, Teacher, Principal..." />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-outline/60 bg-surface-low px-3 py-2.5 text-sm">
                <Lock className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                <span className="text-ink">{profile.jobTitle || "—"}</span>
              </div>
            )}
          </Field>

          {/* Address */}
          <div className="md:col-span-2">
            <Field label="Address" error={errors.address?.message}>
              <Input {...register("address")} placeholder="Home or office address" />
            </Field>
          </div>

          {/* Emergency Contact */}
          <Field label="Emergency Contact Name" error={errors.emergencyContactName?.message}>
            <Input {...register("emergencyContactName")} placeholder="Full name" />
          </Field>
          <Field label="Emergency Contact Phone" error={errors.emergencyContactPhone?.message}>
            <Input {...register("emergencyContactPhone")} placeholder="+92 3001234567" />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <ButtonLink href="/change-password" variant="secondary">
            Change Password
          </ButtonLink>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </section>
    </form>
  );
}
