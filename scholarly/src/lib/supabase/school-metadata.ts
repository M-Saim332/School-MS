import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMissingColumnName } from "@/lib/supabase/errors";

const optionalSchoolColumns = [
  "short_name",
  "motto",
  "address",
  "phone",
  "email",
  "website",
  "logo_url",
  "favicon_url",
] as const;

type SchoolMetadataRow = {
  name: string;
  short_name?: string | null;
  motto?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
};

type SchoolNameOnlyRow = {
  name: string;
  short_name?: null;
  motto?: null;
  address?: null;
  phone?: null;
  email?: null;
  website?: null;
  logo_url?: null;
  favicon_url?: null;
};

export type SchoolMetadata = {
  name: string;
  short_name: string | null;
  motto: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  favicon_url: string | null;
};

type SchoolMetadataResult = {
  data: SchoolMetadata | null;
  error: { message: string } | null;
};

function withNullOptionalFields(data: SchoolNameOnlyRow | SchoolMetadataRow): SchoolMetadata {
  return {
    name: data.name,
    short_name: data.short_name ?? null,
    motto: data.motto ?? null,
    address: data.address ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    website: data.website ?? null,
    logo_url: data.logo_url ?? null,
    favicon_url: data.favicon_url ?? null,
  };
}

export const getSchoolMetadata = cache(async (schoolId: string): Promise<SchoolMetadataResult> => {
  const supabase = await createClient();
  const schoolResult = await supabase
    .from("schools")
    .select("name, short_name, motto, address, phone, email, website, logo_url, favicon_url")
    .eq("id", schoolId)
    .single<SchoolMetadataRow>();

  if (!getMissingColumnName(schoolResult.error, optionalSchoolColumns)) {
    return {
      data: schoolResult.data ? withNullOptionalFields(schoolResult.data) : null,
      error: schoolResult.error ? { message: schoolResult.error.message } : null,
    };
  }

  const fallbackResult = await supabase
    .from("schools")
    .select("name")
    .eq("id", schoolId)
    .single<SchoolNameOnlyRow>();

  return {
    data: fallbackResult.data ? withNullOptionalFields(fallbackResult.data) : null,
    error: fallbackResult.error ? { message: fallbackResult.error.message } : null,
  };
});

export { optionalSchoolColumns };
