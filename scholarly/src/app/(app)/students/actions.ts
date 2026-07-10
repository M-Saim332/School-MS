"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { archiveStudent, createStudent, updateStudent } from "@/lib/services/students";
import type { StudentFormValues } from "@/lib/validation/students";

export async function createStudentAction(values: StudentFormValues) {
  const user = await requireUser("students:create");
  const id = await createStudent(user, values);
  revalidatePath("/students");
  redirect(`/students/${id}`);
}

export async function updateStudentAction(id: string, values: StudentFormValues) {
  const user = await requireUser("students:update");
  await updateStudent(user, id, values);
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  redirect(`/students/${id}`);
}

export async function archiveStudentAction(id: string) {
  const user = await requireUser("students:archive");
  await archiveStudent(user, id);
  revalidatePath("/students");
  redirect("/students?status=archived");
}
