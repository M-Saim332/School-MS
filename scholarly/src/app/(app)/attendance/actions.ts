"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { submitAttendance } from "@/lib/services/attendance";
import { throwFriendlyError } from "@/lib/errors";
import type { AttendanceSubmission } from "@/lib/validation/attendance";

export async function submitAttendanceAction(values: AttendanceSubmission) {
  try {
    const user = await requireUser("attendance:submit");
    await submitAttendance(user, values);
    revalidatePath("/attendance");
  } catch (error) {
    throwFriendlyError(error, "Attendance could not be submitted.");
  }
}
