import { z } from "zod";

export const examTypeSchema = z.enum(["quiz", "monthly", "mid_term", "final_term"]);
export const specialExamTypes = ["monthly", "mid_term", "final_term"] as const;

export const examSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  exam_type: examTypeSchema,
  title: z.string().trim().min(2, "Title is required").max(120),
  term: z.string().trim().min(2, "Term is required").max(80),
  exam_date: z.string().date(),
  max_marks: z.coerce.number().positive("Max marks must be greater than zero").max(1000)
});

export const markEntrySchema = z.object({
  exam_id: z.string().uuid(),
  records: z
    .array(
      z.object({
        student_id: z.string().uuid(),
        marks_obtained: z.coerce.number().min(0),
        teacher_comment: z.string().trim().max(240).optional().nullable()
      })
    )
    .min(1, "At least one mark is required")
});

export const approvalDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  principal_comment: z.string().trim().max(500).optional().nullable()
});

export type ExamFormValues = z.infer<typeof examSchema>;
export type MarkEntryValues = z.infer<typeof markEntrySchema>;
