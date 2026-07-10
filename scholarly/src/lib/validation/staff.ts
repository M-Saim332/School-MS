import { z } from "zod";

export const staffSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(140),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(["principal", "teacher", "student_staff", "administrator"]),
  department: z.string().trim().max(80).optional().nullable(),
  job_title: z.string().trim().max(80).optional().nullable(),
  status: z.enum(["active", "invited", "disabled"])
});

export type StaffFormValues = z.infer<typeof staffSchema>;
