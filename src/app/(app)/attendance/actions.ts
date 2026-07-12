"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { submitAttendance } from "@/lib/services/attendance";
import type { AttendanceSubmission } from "@/lib/validation/attendance";

export async function submitAttendanceAction(values: AttendanceSubmission) {
  const user = await requireUser("attendance:submit");
  await submitAttendance(user, values);
  revalidatePath("/attendance");
}
