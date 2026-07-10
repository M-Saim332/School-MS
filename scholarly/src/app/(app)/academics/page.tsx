import { BookOpenCheck, CalendarDays, GraduationCap, Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getAcademicOptions } from "@/lib/services/academics";

export default async function AcademicsPage() {
  const user = await requireUser("academics:view");
  const academics = await getAcademicOptions(user);

  return (
    <>
      <PageHeader
        eyebrow="Structure"
        title="Academic Management"
        description="Academic years, grades, sections, subjects, classes, teacher assignments, and enrollments are normalized in Supabase."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary title="Academic years" value={academics.years.length} icon={<CalendarDays />} />
        <Summary title="Grades" value={academics.grades.length} icon={<GraduationCap />} />
        <Summary title="Sections" value={academics.sections.length} icon={<Layers3 />} />
        <Summary title="Subjects" value={academics.subjects.length} icon={<BookOpenCheck />} />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-3 pr-4">Class</th>
                    <th className="py-3 pr-4">Grade</th>
                    <th className="py-3 pr-4">Section</th>
                    <th className="py-3 pr-4">Room</th>
                    <th className="py-3 pr-4">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {academics.classes.map((item) => (
                    <tr key={item.id} className="border-t border-outline/60">
                      <td className="py-3 pr-4 font-semibold">{item.name}</td>
                      <td className="py-3 pr-4">{item.grade_name}</td>
                      <td className="py-3 pr-4">{item.section_name ?? "—"}</td>
                      <td className="py-3 pr-4">{item.room ?? "—"}</td>
                      <td className="py-3 pr-4">{item.academic_year_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Year</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {academics.years.map((year: any) => (
              <div key={year.id} className="rounded-lg bg-surface-low p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-ink">{year.name}</p>
                  {year.is_active ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted">{year.starts_on} to {year.ends_on}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Summary({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-wide text-muted">{title}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
        </div>
        <div className="rounded-lg bg-primary-soft p-3 text-primary">{icon}</div>
      </div>
    </Card>
  );
}
