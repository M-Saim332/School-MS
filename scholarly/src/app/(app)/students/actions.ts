"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { archiveStudent, createStudent, updateStudent } from "@/lib/services/students";
import { throwFriendlyError } from "@/lib/errors";
import type { StudentFormValues } from "@/lib/validation/students";

export async function createStudentAction(values: StudentFormValues) {
  let id: string;
  try {
    const user = await requireUser("students:create");
    id = await createStudent(user, values);
  } catch (error) {
    throwFriendlyError(error, "Student could not be saved.");
  }
  revalidatePath("/students");
  redirect(`/students/${id}?saved=created`);
}

export async function updateStudentAction(id: string, values: StudentFormValues) {
  try {
    const user = await requireUser("students:update");
    await updateStudent(user, id, values);
  } catch (error) {
    throwFriendlyError(error, "Student could not be updated.");
  }
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  redirect(`/students/${id}?saved=updated`);
}

export async function archiveStudentAction(id: string) {
  try {
    const user = await requireUser("students:archive");
    await archiveStudent(user, id);
  } catch (error) {
    throwFriendlyError(error, "Student could not be archived.");
  }
  revalidatePath("/students");
  redirect("/students?status=archived&saved=archived");
}
