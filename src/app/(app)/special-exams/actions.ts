"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createSpecialExam } from "@/lib/services/special-exams";

export async function createSpecialExamAction(formData: FormData) {
  const user = await requireUser("academics:view");
  await createSpecialExam(user, formData);
  revalidatePath("/special-exams");
  revalidatePath("/admin/academic-control");
  revalidatePath("/academics/exams-setup");
  revalidatePath("/marks");
  revalidatePath("/academics/results");
}
