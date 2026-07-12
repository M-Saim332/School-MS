"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { schoolProfileSchema, type SchoolProfileFormValues } from "@/lib/validation/school";

export async function getSchoolProfile() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .select("name, short_name, motto, address, phone, email, website, logo_url, favicon_url")
    .eq("id", user.schoolId)
    .single();

  if (error) throw new Error(error.message);

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

  const { error } = await supabase
    .from("schools")
    .update({
      name: parsed.name,
      short_name: parsed.shortName,
      motto: parsed.motto,
      address: parsed.address,
      phone: parsed.phone,
      email: parsed.email === "" ? null : parsed.email,
      website: parsed.website === "" ? null : parsed.website,
      logo_url: parsed.logoUrl,
      favicon_url: parsed.faviconUrl,
    })
    .eq("id", user.schoolId);

  if (error) throw new Error(error.message);
}
