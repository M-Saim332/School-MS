"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getMissingColumnName } from "@/lib/supabase/errors";
import { getSchoolMetadata, optionalSchoolColumns } from "@/lib/supabase/school-metadata";
import { schoolProfileSchema, type SchoolProfileFormValues } from "@/lib/validation/school";

export async function getSchoolProfile() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await getSchoolMetadata(user.schoolId);

  if (error || !data) throw new Error(error?.message ?? "School profile not found.");

  return {
    name: data.name,
    shortName: data.short_name,
    motto: data.motto,
    address: data.address,
    phone: data.phone,
    email: data.email,
    website: data.website,
    logoUrl: data.logo_url,
    faviconUrl: data.favicon_url,
  };
}

export async function updateSchoolProfile(values: SchoolProfileFormValues) {
  const user = await getCurrentUser();
  if (!user || !["principal", "administrator"].includes(user.role)) {
    throw new Error("Unauthorized: Only the Principal or Administrator can update the school profile.");
  }

  const parsed = schoolProfileSchema.parse(values);
  const supabase = await createClient();
  let updates: Record<string, string | null> = {
    name: parsed.name,
    short_name: parsed.shortName ?? null,
    motto: parsed.motto ?? null,
    address: parsed.address ?? null,
    phone: parsed.phone ?? null,
    email: parsed.email === "" ? null : (parsed.email ?? null),
    website: parsed.website === "" ? null : (parsed.website ?? null),
    logo_url: parsed.logoUrl ?? null,
    favicon_url: parsed.faviconUrl ?? null,
  };

  let { error } = await supabase
    .from("schools")
    .update(updates)
    .eq("id", user.schoolId);

  while (error) {
    const missingColumn = getMissingColumnName(error, optionalSchoolColumns);
    if (!missingColumn) break;

    const remainingUpdates = { ...updates };
    delete remainingUpdates[missingColumn];
    updates = remainingUpdates;

    error = (
      await supabase
        .from("schools")
        .update(updates)
        .eq("id", user.schoolId)
    ).error;
  }

  if (error) throw new Error(error.message);
}
