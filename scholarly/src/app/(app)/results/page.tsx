import { Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/form-field";
import { requireUser } from "@/lib/auth/session";
import { formatExamType, getResultCardsWorkspace } from "@/lib/services/marks";

export default async function ResultsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("results:generate");
  const workspace = await getResultCardsWorkspace(user, {
    classId: params.classId,
    term: params.term
  });

  const selectedClass = (workspace.classes as any[]).find((item) => item.id === workspace.selectedClassId);
  const ready = workspace.readiness?.complete;

  return (
    <>
      <PageHeader
        eyebrow="Registrar output"
        title="Result Cards"
        description="Generate printable result cards only after required special exams are approved by the Principal."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Result Card Filters</CardTitle>
          {ready ? <Badge tone="green">Ready</Badge> : <Badge tone="yellow">Waiting for approvals</Badge>}
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]" action="/results">
            <Field label="Class">
              <Select name="classId" defaultValue={workspace.selectedClassId ?? ""}>
                {(workspace.classes as any[]).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.grades?.name} / {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Term">
              <Input name="term" defaultValue={workspace.term} />
            </Field>
            <div className="flex items-end">
              <button className="min-h-10 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" type="submit">
                Check
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!workspace.selectedClassId || !workspace.readiness ? (
        <EmptyState title="No classes available" description="Create classes and enroll students before generating result cards." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{selectedClass?.name ?? "Selected class"}</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  Required exams: {workspace.readiness.requiredExamTypes.map(formatExamType).join(", ")}
                </p>
              </div>
              {ready ? (
                <ButtonLink href={`/results/print?classId=${workspace.selectedClassId}&term=${encodeURIComponent(workspace.term)}`} target="_blank">
                  <Printer className="h-4 w-4" /> Download / Print All
                </ButtonLink>
              ) : null}
            </CardHeader>
            <CardContent>
              {ready ? (
                <div className="grid gap-2">
                  {workspace.readiness.students.map((student) => (
                    <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3">
                      <div>
                        <p className="font-semibold text-ink">{student.name}</p>
                        <p className="text-xs text-muted">{student.admission_number}</p>
                      </div>
                      <ButtonLink
                        href={`/results/print?classId=${workspace.selectedClassId}&term=${encodeURIComponent(workspace.term)}&studentId=${student.id}`}
                        target="_blank"
                        variant="secondary"
                        size="sm"
                      >
                        Print Individual
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Results are not ready" description="The Registrar can print result cards after every required subject exam is approved." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              {ready ? (
                <p className="rounded-lg bg-success-soft p-3 text-sm font-semibold text-success">All required special exams are approved. Result cards are unlocked.</p>
              ) : (
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-ink">Missing approved results</p>
                  {workspace.readiness.missing.length ? (
                    workspace.readiness.missing.map((item) => (
                      <div key={item} className="rounded-lg bg-warning-soft px-3 py-2 text-sm font-semibold text-warning">
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg bg-warning-soft p-3 text-sm font-semibold text-warning">No assigned subjects were found for this class.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
