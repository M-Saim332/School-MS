import * as z from "zod";

export const schoolProfileSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters."),
  shortName: z.string().nullable().optional(),
  motto: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.union([z.literal(""), z.string().email("Invalid email address")]).nullable().optional(),
  website: z.union([z.literal(""), z.string().url("Invalid URL")]).nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
});

export type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;
