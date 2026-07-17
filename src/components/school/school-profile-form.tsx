"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Globe, Lock, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-field";
import { saveSchoolProfileAction } from "@/app/(app)/school-profile/actions";
import { initials } from "@/lib/utils";

type Props = {
  canManage: boolean;
  schoolName: string;
  schoolTimezone: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
  faviconUrl: string;
  brandVersion: string;
};

function displayValue(value: string, fallback = "Not set") {
  return value.trim().length ? value : fallback;
}

export function SchoolProfileForm({
  canManage,
  schoolName,
  schoolTimezone,
  email,
  phone,
  website,
  logoUrl,
  faviconUrl,
  brandVersion
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoObjectUrl, setLogoObjectUrl] = useState<string | null>(null);
  const [faviconObjectUrl, setFaviconObjectUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: schoolName,
    timezone: schoolTimezone,
    email,
    phone,
    website,
    logoUrl,
    faviconUrl
  });

  const displayName = form.name.trim() || schoolName;
  useEffect(() => {
    if (!logoFile) {
      setLogoObjectUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoObjectUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!faviconFile) {
      setFaviconObjectUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(faviconFile);
    setFaviconObjectUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [faviconFile]);

  const logoPreviewUrl = logoObjectUrl ?? form.logoUrl.trim();
  const faviconPreviewUrl = faviconObjectUrl ?? form.faviconUrl.trim();
  const hasLogo = logoPreviewUrl.length > 0;
  const hasFavicon = faviconPreviewUrl.length > 0;

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
  }

  function handleFaviconFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setFaviconFile(file);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage) return;
    if (!form.name.trim()) {
      setMessage(null);
      setError("School name is required.");
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const payload = new FormData();
      payload.set("name", form.name.trim());
      payload.set("timezone", form.timezone);
      payload.set("email", form.email.trim());
      payload.set("phone", form.phone.trim());
      payload.set("website", form.website.trim());
      payload.set("currentLogoUrl", form.logoUrl.trim());
      payload.set("currentFaviconUrl", form.faviconUrl.trim());
      payload.set("currentBrandVersion", brandVersion);
      if (logoFile) payload.set("logoFile", logoFile);
      if (faviconFile) payload.set("faviconFile", faviconFile);

      const res = await saveSchoolProfileAction(payload);

      if (res && "error" in res) {
        setError(res.error as string);
      } else {
        setMessage("School profile updated successfully.");
        if (res.schoolLogoUrl) {
          updateField("logoUrl", res.schoolLogoUrl);
        }
        if (res.schoolFaviconUrl) {
          updateField("faviconUrl", res.schoolFaviconUrl);
        }
        setLogoFile(null);
        setFaviconFile(null);
        router.refresh();
      }
    });
  }

  const readOnly = !canManage;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="card-surface overflow-hidden rounded-lg">
        <div className="bg-gradient-to-br from-primary via-[#2d7dd2] to-success p-6 text-white">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white/20 shadow-soft backdrop-blur">
            {hasLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreviewUrl} alt={`${displayName} logo`} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">{initials(displayName)}</span>
            )}
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">{displayName}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
            School Profile
            {readOnly ? <Lock className="h-4 w-4" aria-hidden="true" /> : null}
          </p>
        </div>

        <div className="grid gap-4 p-5 text-sm">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">School Email</p>
              <p className="mt-1 break-all font-semibold text-ink">{displayValue(form.email)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Phone Number</p>
              <p className="mt-1 font-semibold text-ink">{displayValue(form.phone)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Globe className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Website</p>
              {form.website.trim() ? (
                <a
                  href={form.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all font-semibold text-primary hover:underline"
                >
                  {form.website}
                </a>
              ) : (
                <p className="mt-1 font-semibold text-ink">Not set</p>
              )}
            </div>
          </div>
          {hasLogo ? (
            <a
              href={logoPreviewUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-2 rounded-lg bg-surface-low px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary-soft"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download School Logo
            </a>
          ) : null}

          {canManage && hasFavicon ? (
            <div className="rounded-lg border border-outline/40 bg-surface-low p-4">
                <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">Favicon Preview</p>
                <div className="mt-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-outline/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={faviconPreviewUrl} alt={`${displayName} favicon`} className="h-8 w-8 object-contain" />
                </div>
              </div>
            ) : null}
        </div>
      </aside>

      <section className="card-surface rounded-lg p-5 sm:p-6">
        <div className="mb-6">
          <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-primary">School Details</p>
          <h2 className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold text-ink">
            Profile Information
            {readOnly ? <Lock className="h-5 w-5 text-muted" aria-hidden="true" /> : null}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {canManage
              ? "Update your school's shared contact details and branding."
              : "This shared school profile is locked for your role. You can review the details and download the current logo."}
          </p>
        </div>

        {message ? (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mb-5 rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="School Name">
            <Input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Enter school name"
              disabled={readOnly}
            />
          </Field>

          <Field label="School Email">
            <Input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="school@example.com"
              disabled={readOnly}
            />
          </Field>

          <Field label="Phone Number">
            <Input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+92 300 1234567"
              disabled={readOnly}
            />
          </Field>

          <Field label="Website">
            <Input
              type="url"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://www.yourschool.edu"
              disabled={readOnly}
            />
          </Field>

          {canManage ? (
            <>
              <div className="md:col-span-2">
                <Field label="School Logo" hint="Upload a PNG, JPG, WEBP, SVG, or ICO image. Everyone can preview and download the logo.">
                  <Input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon" onChange={handleLogoFileChange} />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Favicon" hint="Upload a square image or ICO file. Only principals and administrators can view or change the favicon.">
                  <Input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon" onChange={handleFaviconFileChange} />
                </Field>
              </div>
            </>
          ) : null}

          {!hasLogo && canManage ? (
            <div className="md:col-span-2 rounded-lg border border-dashed border-outline/60 bg-surface-low px-4 py-3 text-sm text-muted">
              Upload a school logo to show it here and enable downloads for staff.
            </div>
          ) : null}
        </div>

        {canManage ? (
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save School Profile"}
            </Button>
          </div>
        ) : null}
      </section>
    </form>
  );
}
