"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClass } from "@/lib/services/academics";
import { assignTeacherToClass, unassignTeacherFromClass } from "@/lib/services/teachers";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().min(1, "Name is required"),
  grade_id: z.string().uuid("Grade is required"),
  section_id: z.string().uuid().optional().or(z.literal("")),
  academic_year_id: z.string().uuid("Academic year is required"),
  room: z.string().optional()
});

export async function createClassAction(formData: FormData) {
  const user = await requireUser("classes:manage");
  const data = classSchema.parse({
    name: formData.get("name"),
    grade_id: formData.get("grade_id"),
    section_id: formData.get("section_id") || undefined,
    academic_year_id: formData.get("academic_year_id"),
    room: formData.get("room") || undefined,
  });

  await createClass(user, { ...data, section_id: data.section_id || null });
  revalidatePath("/classes");
  revalidatePath("/academics");
}

export async function assignTeacherClassAction(formData: FormData) {
  const user = await requireUser("classes:manage");
  const teacherId = formData.get("teacher_id") as string;
  const classId = formData.get("class_id") as string;
  const subjectId = formData.get("subject_id") as string | undefined;

  await assignTeacherToClass(user, teacherId, classId, subjectId || undefined);
  revalidatePath("/classes");
  revalidatePath("/teachers");
}

export async function unassignTeacherClassAction(assignmentId: string) {
  const user = await requireUser("classes:manage");
  await unassignTeacherFromClass(user, assignmentId);
  revalidatePath("/classes");
  revalidatePath("/teachers");
}
