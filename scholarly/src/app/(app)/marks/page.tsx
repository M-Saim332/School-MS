import { PageHeader } from "@/components/layout/page-header";
import { MarksWorkspace } from "@/components/marks-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { getTeacherMarksWorkspace } from "@/lib/services/marks";

export default async function MarksPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("marks:manage");
  const workspace = await getTeacherMarksWorkspace(user, {
    classId: params.classId,
    subjectId: params.subjectId,
    examId: params.examId
  });

  return (
    <>
      <PageHeader
        eyebrow="Assessment workflow"
        title="Marks Entry"
        description="Create quizzes or special exams, enter marks for assigned classes and subjects, and submit special exam results for Principal approval."
      />

      {!workspace.options.length ? (
        <EmptyState title="No mark-entry assignments" description="Teachers can enter marks only for classes/subjects assigned to them, or for classes where they are the head teacher." />
      ) : (
        <MarksWorkspace workspace={workspace} />
      )}
    </>
  );
}
