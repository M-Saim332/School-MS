"use client";

import { useRef } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form-field";

type ClassOption = {
  id: string;
  name: string;
  grade_name: string | null;
};

export function StudentFilters({
  q,
  status,
  classId,
  classOptions
}: {
  q?: string;
  status?: string;
  classId?: string;
  classOptions: ClassOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function submitFilters() {
    formRef.current?.requestSubmit();
  }

  return (
    <Card className="mb-5 p-4">
      <form ref={formRef} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]" action="/students">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input name="q" defaultValue={q} className="pl-9" placeholder="Search name or admission number" />
        </div>
        <Select name="status" defaultValue={status ?? "active"} onChange={submitFilters}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="graduated">Graduated</option>
          <option value="transferred">Transferred</option>
          <option value="archived">Archived</option>
        </Select>
        <Select name="classId" defaultValue={classId ?? "all"} onChange={submitFilters}>
          <option value="all">All classes</option>
          {classOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.grade_name} - {item.name}
            </option>
          ))}
        </Select>
      </form>
    </Card>
  );
}
