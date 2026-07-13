"use client";

import { useState } from "react";
import { Printer, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select, Field } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isThisMonth } from "date-fns";

interface ReportsClientProps {
  accounts: any[];
  payments: any[];
  classes: any[];
  sessions: any[];
}

type ReportType = "collection" | "outstanding" | "discount" | "ledger" | "daily" | "monthly";

export function ReportsClient({ accounts, payments, classes, sessions }: ReportsClientProps) {
  const [reportType, setReportType] = useState<ReportType>("collection");
  const [selectedSessionId, setSelectedSessionId] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Ledger Report Student selection
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const filteredPayments = payments.filter((p) => {
    // Session filter
    const account = accounts.find((a) => a.id === p.student_fee_account_id);
    if (!account) return false;

    const matchesSession = selectedSessionId === "all" || account.academic_year_id === selectedSessionId;
    const matchesClass = selectedClassId === "all" || account.class_id === selectedClassId;
    
    // Date filter
    let matchesDate = true;
    if (reportType === "daily") {
      matchesDate = isToday(new Date(p.payment_date));
    } else if (reportType === "monthly") {
      matchesDate = isThisMonth(new Date(p.payment_date));
    } else {
      const pDate = new Date(p.payment_date);
      if (dateFrom && pDate < new Date(dateFrom)) matchesDate = false;
      if (dateTo && pDate > new Date(dateTo)) matchesDate = false;
    }

    return matchesSession && matchesClass && matchesDate && !p.is_voided;
  });

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSession = selectedSessionId === "all" || acc.academic_year_id === selectedSessionId;
    const matchesClass = selectedClassId === "all" || acc.class_id === selectedClassId;

    if (reportType === "outstanding") {
      return matchesSession && matchesClass && Number(acc.remaining_balance) > 0;
    }
    if (reportType === "discount") {
      return matchesSession && matchesClass && acc.discount_type !== "none";
    }
    return matchesSession && matchesClass;
  });

  // Calculate totals
  const totalCollected = filteredPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const totalOutstanding = filteredAccounts.reduce((acc, a) => acc + Number(a.remaining_balance), 0);
  const totalExpected = filteredAccounts.reduce((acc, a) => acc + Number(a.total_payable), 0);

  // Selected student for ledger details
  const selectedLedgerAccount = accounts.find(a => a.id === selectedAccountId);
  const selectedLedgerPayments = payments.filter(p => p.student_fee_account_id === selectedAccountId);

  function exportCSV() {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `${reportType}_report.csv`;

    if (reportType === "collection" || reportType === "daily" || reportType === "monthly") {
      headers = ["Receipt No", "Student", "Admission No", "Class", "Method", "Amount", "Collected By", "Date"];
      rows = filteredPayments.map((p) => [
        p.receipt_number,
        p.student_name,
        p.admission_number,
        `${p.grade_name} ${p.class_name}`,
        p.payment_method,
        p.amount.toString(),
        p.received_by_name,
        p.payment_date
      ]);
    } else if (reportType === "outstanding") {
      headers = ["Student Name", "Admission No", "Class", "Total Expected", "Amount Paid", "Outstanding Balance", "Due Date"];
      rows = filteredAccounts.map((a) => [
        a.student_name,
        a.admission_number,
        `${a.grade_name} ${a.class_name}`,
        a.total_payable.toString(),
        a.amount_paid.toString(),
        a.remaining_balance.toString(),
        a.due_date
      ]);
    } else if (reportType === "discount") {
      headers = ["Student Name", "Admission No", "Class", "Discount Type", "Value", "Reason", "Approved By", "Applied Date"];
      rows = filteredAccounts.map((a) => [
        a.student_name,
        a.admission_number,
        `${a.grade_name} ${a.class_name}`,
        a.discount_type,
        a.discount_value.toString(),
        a.discount_reason || "None",
        a.discount_approved_by || "N/A",
        a.discount_applied_date || "N/A"
      ]);
    } else if (reportType === "ledger" && selectedLedgerAccount) {
      headers = ["Receipt No/Component", "Detail", "Amount Paid", "Status", "Date"];
      rows = [
        ["Fee Structure base", `Class: ${selectedLedgerAccount.grade_name}`, "0", "Payable Base", selectedLedgerAccount.created_at],
        ["Waiver Policy", `${selectedLedgerAccount.discount_type} discount`, "0", selectedLedgerAccount.discount_reason || "None", selectedLedgerAccount.discount_applied_date || "N/A"],
        ...selectedLedgerPayments.map(p => [
          p.receipt_number,
          p.payment_method,
          p.amount.toString(),
          p.is_voided ? "Voided" : "Posted",
          p.payment_date
        ])
      ];
      filename = `ledger_${selectedLedgerAccount.admission_number}.csv`;
    }

    if (!headers.length) return;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      {/* Parameter Cards (Hidden on print) */}
      <Card className="mb-6 p-4 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Field label="Select Report Type">
            <Select value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
              <option value="collection">General Collection Report</option>
              <option value="daily">Daily Collection (Today)</option>
              <option value="monthly">Monthly Collection (This Month)</option>
              <option value="outstanding">Outstanding Balance Report</option>
              <option value="discount">Applied Discount/Waiver Report</option>
              <option value="ledger">Student Ledger Card</option>
            </Select>
          </Field>

          <Field label="Academic Session">
            <Select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
              <option value="all">All Sessions</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Class Filter">
            <Select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade_name} • {c.name}
                </option>
              ))}
            </Select>
          </Field>

          {reportType === "collection" && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date From">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </Field>
              <Field label="Date To">
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </Field>
            </div>
          )}

          {reportType === "ledger" && (
            <Field label="Select Student Account">
              <Select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                <option value="">Select a student...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.student_name} ({a.admission_number})
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-outline/40 pt-4">
          <button
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-low px-4 text-sm font-semibold text-primary hover:bg-primary-soft"
          >
            <Printer className="h-4 w-4" /> Print Report
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-success px-4 text-sm font-semibold text-white hover:brightness-105"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </Card>

      {/* Printable Report Document */}
      <Card className="bg-white p-6 shadow-soft print:border-0 print:p-0 print:shadow-none">
        {/* Header Block (Only visible when printing) */}
        <div className="hidden print:block border-b-2 border-outline pb-4 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-display text-xl font-bold text-primary">Alexandria Academy</h1>
              <p className="text-xs text-muted">GoCampusFlow SaaS Student Management</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-ink uppercase tracking-wider">
                {reportType.replace("_", " ")} Report
              </p>
              <p className="text-xxs text-muted mt-1">Generated: {format(new Date(), "MMM d, yyyy HH:mm")}</p>
            </div>
          </div>
        </div>

        {/* Overview Stats for Report */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3 bg-surface-low rounded-lg p-4">
          <div>
            <span className="text-xxs font-bold text-muted uppercase tracking-wider">Expected billing</span>
            <p className="text-lg font-bold text-ink">${totalExpected.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xxs font-bold text-muted uppercase tracking-wider">Amount Collected</span>
            <p className="text-lg font-bold text-success">${totalCollected.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xxs font-bold text-muted uppercase tracking-wider">Outstanding Receivable</span>
            <p className="text-lg font-bold text-danger">${totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Collection-style Tables */}
          {(reportType === "collection" || reportType === "daily" || reportType === "monthly") && (
            <>
              {!filteredPayments.length ? (
                <div className="py-8 text-center text-sm text-muted">No collections recorded for the selected parameters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline font-label uppercase tracking-wider text-muted">
                        <th className="py-2">Receipt No</th>
                        <th className="py-2">Student</th>
                        <th className="py-2">Class</th>
                        <th className="py-2">Method</th>
                        <th className="py-2 text-right">Amount</th>
                        <th className="py-2">Collected By</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/40">
                      {filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-low/50">
                          <td className="py-2 font-mono font-semibold">{p.receipt_number}</td>
                          <td className="py-2">
                            <span className="font-semibold text-ink">{p.student_name}</span>
                            <span className="text-xxs text-muted block">Adm: {p.admission_number}</span>
                          </td>
                          <td className="py-2 text-muted">{p.grade_name} • {p.class_name}</td>
                          <td className="py-2 uppercase font-semibold text-primary">{p.payment_method.replace("_", " ")}</td>
                          <td className="py-2 text-right font-bold text-success">${Number(p.amount).toLocaleString()}</td>
                          <td className="py-2 text-muted">{p.received_by_name}</td>
                          <td className="py-2 text-muted">{format(new Date(p.payment_date), "MMM d, yyyy")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Outstanding report */}
          {reportType === "outstanding" && (
            <>
              {!filteredAccounts.length ? (
                <div className="py-8 text-center text-sm text-muted">No accounts match the filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline font-label uppercase tracking-wider text-muted">
                        <th className="py-2">Student</th>
                        <th className="py-2">Class</th>
                        <th className="py-2 text-right">Tuition Billing</th>
                        <th className="py-2 text-right">Waiver Applied</th>
                        <th className="py-2 text-right">Amount Paid</th>
                        <th className="py-2 text-right">Outstanding</th>
                        <th className="py-2">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/40">
                      {filteredAccounts.map((a) => (
                        <tr key={a.id} className="hover:bg-surface-low/50">
                          <td className="py-2">
                            <span className="font-semibold text-ink">{a.student_name}</span>
                            <span className="text-xxs text-muted block">Adm: {a.admission_number}</span>
                          </td>
                          <td className="py-2 text-muted">{a.grade_name} • {a.class_name}</td>
                          <td className="py-2 text-right font-semibold">${Number(a.total_payable).toLocaleString()}</td>
                          <td className="py-2 text-right text-success">
                            {a.discount_type !== "none" ? `${a.discount_type}: ${a.discount_value}` : "None"}
                          </td>
                          <td className="py-2 text-right font-semibold text-success">${Number(a.amount_paid).toLocaleString()}</td>
                          <td className="py-2 text-right font-bold text-danger">${Number(a.remaining_balance).toLocaleString()}</td>
                          <td className="py-2 text-muted">{format(new Date(a.due_date), "MMM d, yyyy")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Waiver report */}
          {reportType === "discount" && (
            <>
              {!filteredAccounts.length ? (
                <div className="py-8 text-center text-sm text-muted">No waiver programs applied.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline font-label uppercase tracking-wider text-muted">
                        <th className="py-2">Student</th>
                        <th className="py-2">Class</th>
                        <th className="py-2">Policy Type</th>
                        <th className="py-2">Discount Value</th>
                        <th className="py-2">Reason</th>
                        <th className="py-2">Remarks</th>
                        <th className="py-2">Approved By</th>
                        <th className="py-2">Date Applied</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/40">
                      {filteredAccounts.map((a) => (
                        <tr key={a.id} className="hover:bg-surface-low/50">
                          <td className="py-2">
                            <span className="font-semibold text-ink">{a.student_name}</span>
                            <span className="text-xxs text-muted block">Adm: {a.admission_number}</span>
                          </td>
                          <td className="py-2 text-muted">{a.grade_name} • {a.class_name}</td>
                          <td className="py-2 uppercase font-semibold text-primary">{a.discount_type}</td>
                          <td className="py-2 font-bold text-success">
                            {a.discount_type === "percentage" ? `${a.discount_value}%` : `$${a.discount_value}`}
                          </td>
                          <td className="py-2 text-muted uppercase tracking-wider text-xxs">{a.discount_reason?.replace("_", " ")}</td>
                          <td className="py-2 text-muted italic max-w-xs truncate">&quot;{a.discount_remarks || "N/A"}&quot;</td>
                          <td className="py-2 text-muted">{a.discount_approved_by}</td>
                          <td className="py-2 text-muted">{a.discount_applied_date ? format(new Date(a.discount_applied_date), "MMM d, yyyy") : "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Student Ledger details */}
          {reportType === "ledger" && (
            <>
              {!selectedLedgerAccount ? (
                <div className="py-8 text-center text-sm text-muted">Select a student account from the options above.</div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink">Ledger Summary</h3>
                    <p className="text-xs text-muted">
                      Student: {selectedLedgerAccount.student_name} ({selectedLedgerAccount.admission_number}) • Grade: {selectedLedgerAccount.grade_name}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-outline font-label uppercase tracking-wider text-muted">
                          <th className="py-2">Transaction Ref/Detail</th>
                          <th className="py-2">Method / Reason</th>
                          <th className="py-2 text-right">Amount Collected</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline/40">
                        <tr>
                          <td className="py-2 font-semibold">Standard Tuition Mapping</td>
                          <td className="py-2 text-muted">Mapped fee structure</td>
                          <td className="py-2 text-right text-muted">-</td>
                          <td className="py-2"><Badge tone="gray">PAYABLE</Badge></td>
                          <td className="py-2 text-muted">{format(new Date(selectedLedgerAccount.created_at), "MMM d, yyyy")}</td>
                        </tr>
                        {selectedLedgerAccount.discount_type !== "none" && (
                          <tr>
                            <td className="py-2 font-semibold text-success">Adjustment Waiver</td>
                            <td className="py-2 text-muted">
                              {selectedLedgerAccount.discount_reason?.replace("_", " ")} ({selectedLedgerAccount.discount_type})
                            </td>
                            <td className="py-2 text-right font-semibold text-success">
                              -{selectedLedgerAccount.discount_type === "percentage" ? `${selectedLedgerAccount.discount_value}%` : `$${selectedLedgerAccount.discount_value}`}
                            </td>
                            <td className="py-2"><Badge tone="green">Waiver</Badge></td>
                            <td className="py-2 text-muted">{selectedLedgerAccount.discount_applied_date ? format(new Date(selectedLedgerAccount.discount_applied_date), "MMM d, yyyy") : "N/A"}</td>
                          </tr>
                        )}
                        {selectedLedgerPayments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2 font-mono font-semibold text-primary">{p.receipt_number}</td>
                            <td className="py-2 text-muted">Installment payment ({p.payment_method})</td>
                            <td className="py-2 text-right font-bold text-success">${Number(p.amount).toLocaleString()}</td>
                            <td className="py-2">
                              {p.is_voided ? <Badge tone="red">Voided</Badge> : <Badge tone="green">Cleared</Badge>}
                            </td>
                            <td className="py-2 text-muted">{format(new Date(p.payment_date), "MMM d, yyyy")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </>
  );
}
