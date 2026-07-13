"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Plus, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/form-field";
import { createExamAction, saveMarksAction, submitExamForApprovalAction } from "@/app/(app)/marks/actions";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { calculateGrade } from "@/lib/grades";
import type { ExamStatus, ExamType } from "@/types/database";

type MarksOption = {
  class_id: string;
  class_name: string;
  grade_name?: string | null;
  section_name?: string | null;
  subject_id: string;
  subject_name: string;
  is_head_teacher: boolean;
};

type ExamRow = {
  id: string;
  class_id: string;
  subject_id: string;
  exam_type: ExamType;
  title: string;
  term: string;
  exam_date: string;
  max_marks: number | string;
  status: ExamStatus;
};

type RosterRow = {
  student_id: string;
  student_name: string;
  admission_number: string;
  mark: {
    marks_obtained?: number | string | null;
    grade?: string | null;
    teacher_comment?: string | null;
  } | null;
};

type MarksWorkspaceData = {
  options: MarksOption[];
  selected: MarksOption | null;
  exams: ExamRow[];
  selectedExam: ExamRow | null;
  roster: RosterRow[];
};

const examTypes: Array<{ value: ExamType; label: string }> = [
  { value: "quiz", label: "Quiz" },
  { value: "monthly", label: "Monthly" },
  { value: "mid_term", label: "Mid-Term" },
  { value: "final_term", label: "Final-Term" }
];

const statusTone = {
  draft: "gray",
  submitted: "yellow",
  approved: "green",
  rejected: "red"
} as const;

function optionValue(option: MarksOption) {
  return `${option.class_id}:${option.subject_id}`;
}

function splitOptionValue(value: string) {
  const [classId, subjectId] = value.split(":");
  return { classId, subjectId };
}

function formatExamType(type: ExamType) {
  return type
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("-");
}

export function MarksWorkspace({ workspace }: { workspace: MarksWorkspaceData }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const selectedExam = workspace.selectedExam;
  const locked = selectedExam ? ["submitted", "approved"].includes(selectedExam.status) : true;
  const isSpecial = selectedExam ? selectedExam.exam_type !== "quiz" : false;
  const selectedOptionValue = workspace.selected ? optionValue(workspace.selected) : "";

  function goToSelection(value: string) {
    const { classId, subjectId } = splitOptionValue(value);
    router.push(`/marks?classId=${classId}&subjectId=${subjectId}`);
  }

  function goToExam(examId: string) {
    if (!workspace.selected) return;
    const params = new URLSearchParams({
      classId: workspace.selected.class_id,
      subjectId: workspace.selected.subject_id
    });
    if (examId) params.set("examId", examId);
    router.push(`/marks?${params.toString()}`);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[minmax(260px,1.4fr)_minmax(220px,1fr)_auto] lg:items-end">
          <Field label="Class and subject">
            <Select value={selectedOptionValue} onChange={(event) => goToSelection(event.target.value)} aria-label="Select class and subject">
              {workspace.options.map((option) => (
                <option key={optionValue(option)} value={optionValue(option)}>
                  {option.class_name} / {option.subject_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Exam">
            <Select value={selectedExam?.id ?? ""} onChange={(event) => goToExam(event.target.value)} aria-label="Select exam">
              {workspace.exams.length ? null : <option value="">No exams yet</option>}
              {workspace.exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} / {formatExamType(exam.exam_type)} / {exam.status}
                </option>
              ))}
            </Select>
          </Field>

          <Button type="button" onClick={() => setCreateOpen((current) => !current)} disabled={!workspace.selected} className="w-full lg:w-auto">
            <Plus className="h-4 w-4" />
            {createOpen ? "Close Form" : "Create Exam"}
          </Button>
        </CardContent>
      </Card>

      {createOpen ? <CreateExamPanel selected={workspace.selected} onClose={() => setCreateOpen(false)} /> : null}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{selectedExam ? selectedExam.title : "Marks Table"}</CardTitle>
            <p className="mt-1 text-sm text-muted">
              {selectedExam
                ? `${workspace.selected?.class_name} / ${workspace.selected?.subject_name} / ${formatExamType(selectedExam.exam_type)} / ${Number(selectedExam.max_marks)} marks`
                : "Create or select an exam to enter marks."}
            </p>
          </div>
          {selectedExam ? <Badge tone={statusTone[selectedExam.status]}>{selectedExam.status}</Badge> : null}
        </CardHeader>
        <CardContent>
          {!selectedExam ? (
            <EmptyState title="No exam selected" description="Create an exam with the button above, or choose an existing one from the exam dropdown." />
          ) : (
            <MarksEntryForm
              key={selectedExam.id}
              exam={selectedExam}
              roster={workspace.roster}
              locked={locked}
              canSubmit={isSpecial && !locked}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateExamPanel({ selected, onClose }: { selected: MarksOption | null; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await createExamAction(formData);
        onClose();
        router.push(`/marks?classId=${result.classId}&subjectId=${result.subjectId}&examId=${result.examId}`);
        router.refresh();
      } catch (err) {
        setError(getFriendlyErrorMessage(err, "Exam could not be created."));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Create Exam</CardTitle>
          <p className="mt-1 text-sm text-muted">{selected ? `${selected.class_name} / ${selected.subject_name}` : "Choose a class and subject before creating an exam."}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-5">
          <input type="hidden" name="class_id" value={selected?.class_id ?? ""} />
          <input type="hidden" name="subject_id" value={selected?.subject_id ?? ""} />

          {error ? <div className="rounded-lg bg-danger-soft p-3 text-sm font-semibold text-danger">{error}</div> : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Exam type">
              <Select name="exam_type" defaultValue="quiz">
                {examTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </Field>
            <div className="md:col-span-2 xl:col-span-2">
              <Field label="Title">
                <Input name="title" placeholder="Quiz 1, Mid-Term, Final-Term..." required />
              </Field>
            </div>
            <Field label="Term">
              <Input name="term" defaultValue="Term 1" required />
            </Field>
            <Field label="Date">
              <Input name="exam_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </Field>
            <Field label="Max marks">
              <Input name="max_marks" type="number" min="1" step="0.01" defaultValue="100" required />
            </Field>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !selected}>
              {pending ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function MarksEntryForm({
  exam,
  roster,
  locked,
  canSubmit
}: {
  exam: ExamRow;
  roster: RosterRow[];
  locked: boolean;
  canSubmit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitPending, startSubmitTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(roster.map((student) => [student.student_id, student.mark?.marks_obtained == null ? "" : String(student.mark.marks_obtained)]))
  );
  const maxMarks = Number(exam.max_marks);

  const grades = useMemo(
    () =>
      Object.fromEntries(
        roster.map((student) => {
          const value = values[student.student_id];
          return [student.student_id, value === "" ? (student.mark?.grade ?? "-") : calculateGrade(Number(value), maxMarks)];
        })
      ),
    [maxMarks, roster, values]
  );

  function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await saveMarksAction(formData);
        setMessage(`${result.saved} mark${result.saved === 1 ? "" : "s"} saved.`);
        router.refresh();
      } catch (err) {
        setError(getFriendlyErrorMessage(err, "Marks could not be saved."));
      }
    });
  }

  function onSubmitForApproval() {
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.append("exam_id", exam.id);

    startSubmitTransition(async () => {
      try {
        await submitExamForApprovalAction(formData);
        setMessage("Submitted for Principal approval.");
        router.refresh();
      } catch (err) {
        setError(getFriendlyErrorMessage(err, "This exam could not be submitted for approval."));
      }
    });
  }

  if (!roster.length) {
    return <EmptyState title="No enrolled students" description="Students must be actively enrolled in this class before marks can be entered." />;
  }

  return (
    <form onSubmit={onSave} className="grid gap-4">
      <input type="hidden" name="exam_id" value={exam.id} />

      {locked ? (
        <div className="flex items-center gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm font-semibold text-warning">
          <Lock className="h-4 w-4" />
          This result set is locked while submitted or approved.
        </div>
      ) : null}
      {message ? (
        <div className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      ) : null}
      {error ? <div className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger">{error}</div> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-outline/40 text-xs uppercase tracking-wide text-muted">
              <th className="py-3 pr-3">Student</th>
              <th className="py-3 pr-3">Admission #</th>
              <th className="py-3 pr-3">Marks</th>
              <th className="py-3 pr-3">Grade</th>
              <th className="py-3 pr-3">Comment</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((student) => {
              const grade = grades[student.student_id] ?? "-";
              return (
                <tr key={student.student_id} className="border-b border-outline/25">
                  <td className="py-3 pr-3 font-semibold">{student.student_name}</td>
                  <td className="py-3 pr-3 text-muted">{student.admission_number}</td>
                  <td className="py-3 pr-3">
                    <Input
                      name={`mark_${student.student_id}`}
                      type="number"
                      min="0"
                      max={maxMarks}
                      step="0.01"
                      value={values[student.student_id] ?? ""}
                      onChange={(event) => setValues((current) => ({ ...current, [student.student_id]: event.target.value }))}
                      disabled={locked}
                      required
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <Badge tone={grade === "F" ? "red" : "green"}>{grade}</Badge>
                  </td>
                  <td className="py-3 pr-3">
                    <Input name={`comment_${student.student_id}`} defaultValue={student.mark?.teacher_comment ?? ""} disabled={locked} placeholder="Optional" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="submit" variant="secondary" disabled={locked || pending}>
          <CheckCircle2 className="h-4 w-4" />
          {pending ? "Saving..." : "Save Marks"}
        </Button>
        {canSubmit ? (
          <Button type="button" onClick={onSubmitForApproval} disabled={submitPending}>
            <Send className="h-4 w-4" />
            {submitPending ? "Submitting..." : "Submit for Approval"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
