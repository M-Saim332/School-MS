import { z } from "zod";

export const staffFormSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["teacher", "head_teacher", "staff", "student_staff", "cashier", "principal", "administrator"]),
  department: z.string().trim().max(100).optional().nullable(),
  job_title: z.string().trim().max(100).optional().nullable(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;
