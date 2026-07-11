"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-field";
import { staffFormSchema, type StaffFormValues } from "@/lib/validation/staff";
import { createStaffAction } from "@/app/(app)/teachers/actions";
import { Plus, X } from "lucide-react";

export function StaffFormModal() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { role: "teacher" }
  });

  const onSubmit = (data: StaffFormValues) => {
    setError(null);
    startTransition(async () => {
      try {
        await createStaffAction(data);
        reset();
        setOpen(false);
      } catch (err: any) {
        setError(err.message || "Failed to create account.");
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add Staff
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-outline/40 px-6 py-4">
              <h2 className="text-xl font-display font-bold">Provision New Account</h2>
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
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Full Name *</label>
                  <Input {...register("full_name")} placeholder="Jane Doe" error={errors.full_name?.message} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Email Address *</label>
                  <Input {...register("email")} type="email" placeholder="jane.doe@school.edu" error={errors.email?.message} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Temporary Password *</label>
                  <Input {...register("password")} type="text" placeholder="Auto-generated or type a secure one..." error={errors.password?.message} />
                  <p className="mt-1 text-xs text-muted">The user will use this password to sign in.</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Role *</label>
                  <Select {...register("role")} error={errors.role?.message}>
                    <option value="teacher">Teacher</option>
                    <option value="student_staff">Registrar (Student Staff)</option>
                    <option value="administrator">Administrator</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Department</label>
                  <Input {...register("department")} placeholder="e.g. Science" error={errors.department?.message} />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Provisioning..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
