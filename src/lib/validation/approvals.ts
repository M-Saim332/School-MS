import { z } from "zod";

export const reviewRequestSchema = z.object({
  decision: z.enum(["approved", "denied"]),
  denial_reason: z.string().trim().optional().nullable()
}).refine((data) => {
  if (data.decision === "denied" && (!data.denial_reason || data.denial_reason.length < 10)) {
    return false;
  }
  return true;
}, {
  message: "Please provide a detailed reason (at least 10 characters) when denying a request",
  path: ["denial_reason"]
});

export type ReviewRequestValues = z.infer<typeof reviewRequestSchema>;
