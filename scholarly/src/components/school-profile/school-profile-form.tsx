"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { schoolProfileSchema, type SchoolProfileFormValues } from "@/lib/validation/school";
import { updateSchoolProfile } from "@/lib/services/school";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-field";
import type { AppUser } from "@/types/database";

export function SchoolProfileForm({ user, initialData }: { user: AppUser; initialData: SchoolProfileFormValues }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isReadOnly = !["principal", "administrator"].includes(user.role);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchoolProfileFormValues>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: initialData,
  });

  const logoUrl = watch("logoUrl");
  const faviconUrl = watch("faviconUrl");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "faviconUrl") => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      const filePath = `${user.schoolId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("branding").upload(filePath, file, {
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("branding").getPublicUrl(filePath);

      setValue(field, publicUrl, { shouldDirty: true });
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "File could not be uploaded."));
    }
  };

  const onSubmit = async (values: SchoolProfileFormValues) => {
    try {
      setIsSaving(true);
      setError(null);
      await updateSchoolProfile(values);
      router.push("/school-profile?saved=profile");
      router.refresh();
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "School profile could not be saved."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isReadOnly && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm font-semibold text-blue-800 ring-1 ring-blue-200">
          View Only — Only the Principal or Administrator can modify school information.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger ring-1 ring-danger/20">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <p className="text-sm text-muted">Primary details about the institution.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="School Name" error={errors.name?.message}>
            <Input {...register("name")} disabled={isReadOnly} />
          </Field>
          <Field label="Short Name" error={errors.shortName?.message}>
            <Input {...register("shortName")} disabled={isReadOnly} placeholder="e.g. GCF" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Motto" error={errors.motto?.message}>
              <Input {...register("motto")} disabled={isReadOnly} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <p className="text-sm text-muted">Upload your school logo and favicon for the application.</p>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-ink">School Logo</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-low ring-1 ring-outline/20 overflow-hidden">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted">No Logo</span>
                )}
              </div>
              {!isReadOnly && (
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={(e) => handleFileUpload(e, "logoUrl")}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-surface-low px-3 py-1.5 text-sm font-semibold text-primary ring-1 ring-outline/20 hover:bg-surface"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </label>
                  <p className="mt-1 text-xs text-muted">PNG, JPG, SVG up to 2MB.</p>
                </div>
              )}
            </div>
            <input type="hidden" {...register("logoUrl")} />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-ink">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-low ring-1 ring-outline/20 overflow-hidden">
                {faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={faviconUrl} alt="Favicon preview" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-muted">No Icon</span>
                )}
              </div>
              {!isReadOnly && (
                <div>
                  <input
                    type="file"
                    id="favicon-upload"
                    className="hidden"
                    accept="image/x-icon, image/png, image/svg+xml"
                    onChange={(e) => handleFileUpload(e, "faviconUrl")}
                  />
                  <label
                    htmlFor="favicon-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-surface-low px-3 py-1.5 text-sm font-semibold text-primary ring-1 ring-outline/20 hover:bg-surface"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Favicon
                  </label>
                  <p className="mt-1 text-xs text-muted">ICO, PNG, SVG (Square).</p>
                </div>
              )}
            </div>
            <input type="hidden" {...register("faviconUrl")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <p className="text-sm text-muted">Public contact details for the school.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Address" error={errors.address?.message}>
              <Input {...register("address")} disabled={isReadOnly} />
            </Field>
          </div>
          <Field label="Phone Number" error={errors.phone?.message}>
            <Input {...register("phone")} disabled={isReadOnly} />
          </Field>
          <Field label="Email Address" error={errors.email?.message}>
            <Input type="email" {...register("email")} disabled={isReadOnly} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Website" error={errors.website?.message}>
              <Input type="url" {...register("website")} disabled={isReadOnly} placeholder="https://" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {!isReadOnly && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
}
