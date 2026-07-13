"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { reviewExamApproval } from "@/lib/services/marks";
import { throwFriendlyError } from "@/lib/errors";

export async function reviewExamApprovalAction(approvalId: string, formData: FormData) {
  try {
    const user = await requireUser("marks:approve");
    const decision = formData.get("decision");
    if (decision !== "approved" && decision !== "rejected") throw new Error("Choose approve or reject.");

    await reviewExamApproval(user, approvalId, decision, String(formData.get("principal_comment") ?? ""));
    revalidatePath("/exam-approvals");
  } catch (error) {
    throwFriendlyError(error, "Approval could not be saved.");
  }
}
