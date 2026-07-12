import { z } from "zod";

export const attendanceStatusSchema = z.enum(["present", "absent", "late", "excused"]);

export const attendanceSubmissionSchema = z.object({
  class_id: z.string().uuid(),
  attendance_date: z.string().date(),
  records: z
    .array(
      z.object({
        student_id: z.string().uuid(),
        status: attendanceStatusSchema,
        note: z.string().trim().max(240).optional().nullable()
      })
    )
    .min(1, "At least one attendance record is required")
});

export type AttendanceSubmission = z.infer<typeof attendanceSubmissionSchema>;
