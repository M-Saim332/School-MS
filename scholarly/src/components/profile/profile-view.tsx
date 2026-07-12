import { BriefcaseBusiness, IdCard, Mail, Phone, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { ProfileDetails } from "@/lib/services/profile";
import { initials } from "@/lib/utils";

export function ProfileView({ profile }: { profile: ProfileDetails }) {
  const displayName = profile.fullName;
  const avatarUrl = profile.avatarUrl;

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
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
              <p className="mt-1 font-semibold text-ink">{profile.jobTitle || "Not set"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Phone</p>
              <p className="mt-1 font-semibold text-ink">{profile.phone || "Not set"}</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="card-surface rounded-lg p-5 sm:p-6 flex flex-col">
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

        <div className="grid gap-6 md:grid-cols-2 flex-1">
          <div>
            <p className="text-sm font-semibold text-muted">Full name</p>
            <p className="mt-1 font-medium text-ink">{profile.fullName || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Phone</p>
            <p className="mt-1 font-medium text-ink">{profile.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Department</p>
            <p className="mt-1 font-medium text-ink">{profile.department || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Job title</p>
            <p className="mt-1 font-medium text-ink">{profile.jobTitle || "Not set"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-muted">Short bio</p>
            <p className="mt-1 font-medium text-ink">{profile.bio || "No bio provided."}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 pt-6 border-t border-outline/10">
          <ButtonLink href="/change-password" variant="secondary">
            Change Password
          </ButtonLink>
          <ButtonLink href="/profile/edit">
            Edit Profile
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
