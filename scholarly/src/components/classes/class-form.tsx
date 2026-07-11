"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-field";
import { createClassAction, updateClassAction } from "@/app/(app)/classes/actions";
import { Pencil, Plus, X } from "lucide-react";

export function ClassFormModal({
  grades,
  sections,
  academicYears,
  teachers,
  initialClass,
}: {
  grades: { id: string; name: string }[];
  sections: { id: string; name: string }[];
  academicYears: { id: string; name: string }[];
  teachers: { user_id: string; full_name: string }[];
  initialClass?: {
    id: string;
    name: string;
    grade_id: string;
    section_id: string | null;
    academic_year_id: string;
    room: string | null;
    head_teacher_id: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(initialClass);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialClass
      ? {
          name: initialClass.name,
          grade_id: initialClass.grade_id,
          section_id: initialClass.section_id ?? "",
          academic_year_id: initialClass.academic_year_id,
          room: initialClass.room ?? "",
          head_teacher_id: initialClass.head_teacher_id
        }
      : {}
  });

  const onSubmit = (data: any) => {
    setError(null);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("grade_id", data.grade_id);
    if (data.section_id) formData.append("section_id", data.section_id);
    formData.append("academic_year_id", data.academic_year_id);
    if (data.room) formData.append("room", data.room);
    formData.append("head_teacher_id", data.head_teacher_id);

    startTransition(async () => {
      try {
        if (initialClass) await updateClassAction(initialClass.id, formData);
        else await createClassAction(formData);
        reset();
        setOpen(false);
      } catch (err: any) {
        setError(err.message || "Failed to create class.");
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={editing ? "secondary" : "primary"} size={editing ? "sm" : "md"} className="flex items-center gap-2">
        {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {editing ? "Edit" : "Add Class"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-outline/40 px-6 py-4">
                <h2 className="text-xl font-display font-bold">{editing ? "Edit Class" : "Create New Class"}</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {error && (
                <div className="mb-4 rounded-md bg-danger-soft p-3 text-sm font-semibold text-danger">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Class Name *</label>
                  <Input {...register("name", { required: true })} placeholder="e.g. 10th Grade Math (A)" />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Grade *</label>
                  <Select {...register("grade_id", { required: true })}>
                    <option value="">Select Grade</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Section</label>
                  <Select {...register("section_id")}>
                    <option value="">None / Unassigned</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Academic Year *</label>
                  <Select {...register("academic_year_id", { required: true })}>
                    <option value="">Select Year</option>
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Head Teacher *</label>
                  <Select {...register("head_teacher_id", { required: true })}>
                    <option value="">Select Head Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.user_id} value={teacher.user_id}>{teacher.full_name}</option>
                    ))}
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Room Number</label>
                  <Input {...register("room")} placeholder="e.g. Room 101" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : editing ? "Save Class" : "Create Class"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
