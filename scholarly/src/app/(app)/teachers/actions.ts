"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createStaffAccount, updateStaffStatus, assignTeacherToClass } from "@/lib/services/teachers";
import { throwFriendlyError } from "@/lib/errors";
import type { StaffFormValues } from "@/lib/validation/staff";

export async function createStaffAction(values: StaffFormValues) {
  try {
    const user = await requireUser("teachers:manage");
    await createStaffAccount(user, values);
    revalidatePath("/teachers");
    revalidatePath("/staff");
  } catch (error) {
    throwFriendlyError(error, "Account could not be created.");
  }
}

export async function assignTeacherAction(teacherId: string, classId: string, subjectId?: string) {
  try {
    const user = await requireUser("teachers:manage");
    await assignTeacherToClass(user, teacherId, classId, subjectId);
    revalidatePath("/teachers");
    revalidatePath("/academics");
  } catch (error) {
    throwFriendlyError(error, "Teacher could not be assigned.");
  }
}

export async function updateStatusAction(memberId: string, status: "active" | "disabled") {
  try {
    const user = await requireUser("teachers:manage");
    await updateStaffStatus(user, memberId, status);
    revalidatePath("/teachers");
    revalidatePath("/staff");
  } catch (error) {
    throwFriendlyError(error, "Status could not be updated.");
  }
}
