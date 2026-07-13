"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Input, Select, Field } from "@/components/ui/form-field";
import { createFeeStructureAction, updateFeeStructureAction, deleteFeeStructureAction } from "@/app/(app)/finance/actions";
import { hasPermission } from "@/lib/permissions";
import type { AppUser } from "@/types/database";

interface FeeStructureClientProps {
  user: AppUser;
  structures: any[];
  years: any[];
  classes: any[];
}

export function FeeStructureClient({ user, structures, years, classes }: FeeStructureClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<any | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canManage = hasPermission(user.role, "finance:manage");

  // Form states
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [tuition, setTuition] = useState("0");
  const [admission, setAdmission] = useState("0");
  const [exam, setExam] = useState("0");
  const [library, setLibrary] = useState("0");
  const [lab, setLab] = useState("0");
  const [transport, setTransport] = useState("0");
  const [misc, setMisc] = useState("0");

  const totalFee =
    Number(tuition || 0) +
    Number(admission || 0) +
    Number(exam || 0) +
    Number(library || 0) +
    Number(lab || 0) +
    Number(transport || 0) +
    Number(misc || 0);

  function handleOpenCreate() {
    setEditingStructure(null);
    setAcademicYearId(years[0]?.id || "");
    setClassId(classes[0]?.id || "");
    setTuition("0");
    setAdmission("0");
    setExam("0");
    setLibrary("0");
    setLab("0");
    setTransport("0");
    setMisc("0");
    setError(null);
    setIsOpen(true);
  }

  function handleOpenEdit(struct: any) {
    setEditingStructure(struct);
    setAcademicYearId(struct.academic_year_id);
    setClassId(struct.class_id);
    setTuition(struct.tuition_fee.toString());
    setAdmission(struct.admission_fee.toString());
    setExam(struct.examination_fee.toString());
    setLibrary(struct.library_fee.toString());
    setLab(struct.laboratory_fee.toString());
    setTransport(struct.transport_fee.toString());
    setMisc(struct.miscellaneous_charges.toString());
    setError(null);
    setIsOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("academic_year_id", academicYearId);
    formData.append("class_id", classId);
    formData.append("tuition_fee", tuition);
    formData.append("admission_fee", admission);
    formData.append("examination_fee", exam);
    formData.append("library_fee", library);
    formData.append("laboratory_fee", lab);
    formData.append("transport_fee", transport);
    formData.append("miscellaneous_charges", misc);

    startTransition(async () => {
      try {
        if (editingStructure) {
          await updateFeeStructureAction(editingStructure.id, formData);
        } else {
          await createFeeStructureAction(formData);
        }
        setIsOpen(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this fee structure? This will affect any student fee accounts mapped to it.")) return;
    
    startTransition(async () => {
      try {
        await deleteFeeStructureAction(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete fee structure.");
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Fee Structures list</h2>
        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-soft hover:brightness-105"
          >
            <Plus className="h-4 w-4" /> Create Structure
          </button>
        )}
      </div>

      {!structures.length ? (
        <EmptyState
          title="No Fee Structures Mapped"
          description="Create fee structures for classes to generate student accounts and invoices."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Tuition</th>
                <th className="px-4 py-3">Admission</th>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Library</th>
                <th className="px-4 py-3">Lab</th>
                <th className="px-4 py-3">Transport</th>
                <th className="px-4 py-3">Misc</th>
                <th className="px-4 py-3 font-bold text-ink">Total</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {structures.map((struct) => {
                const total =
                  Number(struct.tuition_fee) +
                  Number(struct.admission_fee) +
                  Number(struct.examination_fee) +
                  Number(struct.library_fee) +
                  Number(struct.laboratory_fee) +
                  Number(struct.transport_fee) +
                  Number(struct.miscellaneous_charges);
                return (
                  <tr key={struct.id} className="border-t border-outline/60 hover:bg-surface-low/70">
                    <td className="px-4 py-4 font-semibold text-primary">{struct.academic_years?.name}</td>
                    <td className="px-4 py-4 font-semibold text-ink">
                      {struct.classes?.grade_name} • {struct.classes?.name}
                    </td>
                    <td className="px-4 py-4">${Number(struct.tuition_fee).toLocaleString()}</td>
                    <td className="px-4 py-4">${Number(struct.admission_fee).toLocaleString()}</td>
                    <td className="px-4 py-4">${Number(struct.examination_fee).toLocaleString()}</td>
                    <td className="px-4 py-4">${Number(struct.library_fee).toLocaleString()}</td>
                    <td className="px-4 py-4">${Number(struct.laboratory_fee).toLocaleString()}</td>
                    <td className="px-4 py-4">${Number(struct.transport_fee).toLocaleString()}</td>
                    <td className="px-4 py-4">${Number(struct.miscellaneous_charges).toLocaleString()}</td>
                    <td className="px-4 py-4 font-bold text-ink">${total.toLocaleString()}</td>
                    {canManage && (
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(struct)}
                            className="rounded p-1 text-muted hover:bg-surface-low hover:text-primary"
                            aria-label="Edit fee structure"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(struct.id)}
                            className="rounded p-1 text-muted hover:bg-danger-soft hover:text-danger"
                            aria-label="Delete fee structure"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-outline/40 p-4">
              <h3 className="text-lg font-bold text-ink">
                {editingStructure ? "Edit Fee Structure" : "Create Fee Structure"}
              </h3>
              <button onClick={() => setIsOpen(false)} className="rounded p-1 hover:bg-surface-low text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
                {error && (
                  <div className="rounded-lg bg-danger-soft p-3 text-sm font-semibold text-danger">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Academic Session">
                    <Select
                      value={academicYearId}
                      onChange={(e) => setAcademicYearId(e.target.value)}
                      disabled={!!editingStructure}
                    >
                      {years.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Class">
                    <Select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      disabled={!!editingStructure}
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.grade_name} • {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tuition Fee ($)">
                    <Input type="number" min="0" value={tuition} onChange={(e) => setTuition(e.target.value)} required />
                  </Field>
                  <Field label="Admission Fee ($)">
                    <Input type="number" min="0" value={admission} onChange={(e) => setAdmission(e.target.value)} required />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Examination Fee ($)">
                    <Input type="number" min="0" value={exam} onChange={(e) => setExam(e.target.value)} required />
                  </Field>
                  <Field label="Library Fee ($)">
                    <Input type="number" min="0" value={library} onChange={(e) => setLibrary(e.target.value)} required />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Laboratory Fee ($)">
                    <Input type="number" min="0" value={lab} onChange={(e) => setLab(e.target.value)} required />
                  </Field>
                  <Field label="Transport Fee ($)">
                    <Input type="number" min="0" value={transport} onChange={(e) => setTransport(e.target.value)} required />
                  </Field>
                </div>

                <Field label="Miscellaneous Charges ($)">
                  <Input type="number" min="0" value={misc} onChange={(e) => setMisc(e.target.value)} required />
                </Field>

                <div className="mt-2 rounded-lg bg-surface-low p-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted">Calculated Total Fee:</span>
                  <span className="font-display text-lg font-bold text-ink">${totalFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-outline/40 p-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-surface-low px-4 py-2 text-sm font-semibold text-muted hover:bg-outline/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:brightness-105 disabled:bg-outline"
                >
                  {pending ? "Saving..." : "Save Structure"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
