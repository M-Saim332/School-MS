"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studentSchema, type StudentFormValues } from "@/lib/validation/students";

export function StudentForm({
  initialValues,
  classes,
  onSubmit,
  submitLabel
}: {
  initialValues?: Partial<StudentFormValues>;
  classes: Array<{ id: string; name: string; grade_name: string; section_name: string | null }>;
  onSubmit: (values: StudentFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      admission_number: "",
      first_name: "",
      last_name: "",
      preferred_name: "",
      date_of_birth: "",
      gender: "",
      email: "",
      phone: "",
      address: "",
      admission_date: new Date().toISOString().slice(0, 10),
      status: "active",
      class_id: "",
      guardian_name: "",
      guardian_relationship: "",
      guardian_email: "",
      guardian_phone: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      ...initialValues
    }
  });

  function submit(values: StudentFormValues) {
    startTransition(async () => {
      await onSubmit(values);
    });
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(submit)}>
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Admission number" error={errors.admission_number?.message}>
            <Input {...register("admission_number")} />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="First name" error={errors.first_name?.message}>
            <Input {...register("first_name")} />
          </Field>
          <Field label="Last name" error={errors.last_name?.message}>
            <Input {...register("last_name")} />
          </Field>
          <Field label="Preferred name" error={errors.preferred_name?.message}>
            <Input {...register("preferred_name")} />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <Input {...register("gender")} />
          </Field>
          <Field label="Date of birth" error={errors.date_of_birth?.message}>
            <Input type="date" {...register("date_of_birth")} />
          </Field>
          <Field label="Admission date" error={errors.admission_date?.message}>
            <Input type="date" {...register("admission_date")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} />
          </Field>
          <Field label="Class assignment" error={errors.class_id?.message}>
            <Select {...register("class_id")}>
              <option value="">No class yet</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.grade_name} • {item.name}
                  {item.section_name ? ` • ${item.section_name}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Address" error={errors.address?.message}>
            <Textarea {...register("address")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guardian and Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Guardian name" error={errors.guardian_name?.message}>
            <Input {...register("guardian_name")} />
          </Field>
          <Field label="Relationship" error={errors.guardian_relationship?.message}>
            <Input {...register("guardian_relationship")} />
          </Field>
          <Field label="Guardian email" error={errors.guardian_email?.message}>
            <Input type="email" {...register("guardian_email")} />
          </Field>
          <Field label="Guardian phone" error={errors.guardian_phone?.message}>
            <Input {...register("guardian_phone")} />
          </Field>
          <Field label="Emergency contact" error={errors.emergency_contact_name?.message}>
            <Input {...register("emergency_contact_name")} />
          </Field>
          <Field label="Emergency phone" error={errors.emergency_contact_phone?.message}>
            <Input {...register("emergency_contact_phone")} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
