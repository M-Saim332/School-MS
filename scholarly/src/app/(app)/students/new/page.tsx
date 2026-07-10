import { PageHeader } from "@/components/layout/page-header";
import { StudentForm } from "@/components/students/student-form";
import { requireUser } from "@/lib/auth/session";
import { getAcademicOptions } from "@/lib/services/academics";
import { createStudentAction } from "@/app/(app)/students/actions";

export default async function NewStudentPage() {
  const user = await requireUser("students:create");
  const academics = await getAcademicOptions(user);

  return (
    <>
      <PageHeader eyebrow="Admissions" title="Add Student" description="Create a validated student record and optional active class enrollment." />
      <StudentForm classes={academics.classes} onSubmit={createStudentAction} submitLabel="Create student" />
    </>
  );
}
