import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value : null))
  .pipe(z.string().url("Enter a valid URL").nullable());

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  avatarUrl: optionalUrl,
  phone: optionalText(40),
  bio: optionalText(280),
  department: optionalText(100),
  jobTitle: optionalText(100)
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
