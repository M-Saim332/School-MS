import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^[+()\-\s0-9]{7,24}$/, "Enter a valid phone number")
  .or(z.literal(""))
  .nullable()
  .optional();

export const studentSchema = z.object({
  admission_number: z.string().trim().min(2, "Admission number is required").max(32),
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  preferred_name: z.string().trim().max(80).optional().nullable(),
  date_of_birth: z.string().date("Enter a valid birth date"),
  gender: z.string().trim().max(32).optional().nullable(),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")).nullable().optional(),
  phone,
  address: z.string().trim().max(240).optional().nullable(),
  admission_date: z.string().date("Enter a valid admission date"),
  status: z.enum(["active", "graduated", "transferred", "archived"]),
  class_id: z.string().transform(v => v === "" ? null : v).pipe(z.string().uuid("Choose a valid class").nullable()).optional().nullable(),
  guardian_name: z.string().trim().min(1, "Guardian name is required").max(120),
  guardian_relationship: z.string().trim().min(1, "Relationship is required").max(60),
  guardian_email: z.string().trim().email("Enter a valid guardian email").or(z.literal("")).nullable().optional(),
  guardian_phone: z.string().trim().regex(/^[+()\-\s0-9]{7,24}$/, "Enter a valid guardian phone"),
  emergency_contact_name: z.string().trim().min(1, "Emergency contact is required").max(120),
  emergency_contact_phone: z.string().trim().regex(/^[+()\-\s0-9]{7,24}$/, "Enter a valid emergency phone")
});

export type StudentFormValues = z.infer<typeof studentSchema>;
