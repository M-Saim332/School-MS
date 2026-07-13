import { requireUser } from "@/lib/auth/session";
import { getPaymentHistory } from "@/lib/services/finance";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PrintButton } from "@/components/finance/print-button";
import { format } from "date-fns";
import Link from "next/link";
import { Search, Printer, ArrowLeft } from "lucide-react";

export default async function ReceiptsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("finance:view");

  const id = params.id;

  if (id) {
    // Single Receipt View Mode (Print-Optimized)
    const supabase = await createClient();
    
    // Fetch payment details
    const { data: payment } = await supabase
      .from("payment_history_view")
      .select("*")
      .eq("school_id", user.schoolId)
      .eq("id", id)
      .maybeSingle();

    if (!payment) {
      return (
        <div className="py-12">
          <EmptyState title="Receipt Not Found" description="The requested payment transaction could not be located." />
          <div className="mt-4 text-center">
            <Link href="/finance/receipts" className="text-primary font-bold hover:underline">&larr; Back to receipts list</Link>
          </div>
        </div>
      );
    }

    // Fetch associated student fee account and structure details
    const { data: feeAccount } = await supabase
      .from("student_fee_accounts")
      .select("*, fee_structures(*)")
      .eq("school_id", user.schoolId)
      .eq("id", payment.student_fee_account_id)
      .maybeSingle<any>();

    const fs = feeAccount?.fee_structures;
    const baseTotal = fs
      ? Number(fs.tuition_fee) +
        Number(fs.admission_fee) +
        Number(fs.examination_fee) +
        Number(fs.library_fee) +
        Number(fs.laboratory_fee) +
        Number(fs.transport_fee) +
        Number(fs.miscellaneous_charges)
      : 0;

    const discountAmount =
      feeAccount?.discount_type === "percentage"
        ? baseTotal * (Number(feeAccount.discount_value) / 100)
        : feeAccount?.discount_type === "fixed"
        ? Number(feeAccount.discount_value)
        : 0;

    const remaining = Number(feeAccount?.total_payable || 0) - Number(feeAccount?.amount_paid || 0);

    return (
      <div className="mx-auto max-w-3xl py-4 print:py-0">
        {/* Navigation / Actions Bar (Hidden on print) */}
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-soft print:hidden">
          <Link
            href="/finance/receipts"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-low px-4 text-sm font-semibold text-primary hover:bg-primary-soft"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Link>
          <PrintButton />
        </div>

        {/* Printable Receipt Layout */}
        <div className="card-surface rounded-xl p-8 bg-white text-ink print:border-0 print:p-0 print:shadow-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-outline/50 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
                  CF
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-primary">Alexandria Academy</h1>
                  <p className="text-xxs font-semibold uppercase tracking-wider text-muted">GoCampusFlow Student Management</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted max-w-xs">
                100 Campus Drive, Suite A<br />
                Chicago, IL 60601<br />
                support@gocampusflow.com
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                Official Receipt
              </span>
              <p className="mt-3 font-mono text-sm font-bold text-ink">{payment.receipt_number}</p>
              <p className="text-xxs text-muted uppercase tracking-wider mt-1">
                Date: {format(new Date(payment.payment_date), "MMMM d, yyyy")}
              </p>
              {payment.is_voided && (
                <div className="mt-2 rounded bg-danger-soft px-3 py-1 text-xs font-bold uppercase text-danger">
                  VOID TRANSACTION
                </div>
              )}
            </div>
          </div>

          {/* Student Info */}
          <div className="mt-6 grid gap-4 rounded-lg bg-surface-low p-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xxs font-bold uppercase tracking-wider text-muted">Student Details</h3>
              <p className="mt-1 font-bold text-ink">{payment.student_name}</p>
              <p className="text-xs text-muted">Admission Number: {payment.admission_number}</p>
            </div>
            <div>
              <h3 className="text-xxs font-bold uppercase tracking-wider text-muted">Academic Program</h3>
              <p className="mt-1 font-semibold text-ink">
                Class: {payment.grade_name} {payment.section_name ? `• ${payment.section_name}` : ""}
              </p>
              <p className="text-xs text-muted">Session: {payment.academic_year_name}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="mt-8">
            <h3 className="font-display text-sm font-bold text-ink mb-3 uppercase tracking-wider">Fee Account Breakdown</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline/60 text-muted uppercase font-label tracking-wide">
                  <th className="py-2">Fee component</th>
                  <th className="py-2 text-right">Standard Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/40">
                {fs && (
                  <>
                    <tr>
                      <td className="py-2 text-muted">Tuition Fee</td>
                      <td className="py-2 text-right font-medium">${Number(fs.tuition_fee).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted">Admission Charges</td>
                      <td className="py-2 text-right font-medium">${Number(fs.admission_fee).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted">Examination Fees</td>
                      <td className="py-2 text-right font-medium">${Number(fs.examination_fee).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted">Library Access</td>
                      <td className="py-2 text-right font-medium">${Number(fs.library_fee).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted">Laboratory Charges</td>
                      <td className="py-2 text-right font-medium">${Number(fs.laboratory_fee).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted">Transportation Charges</td>
                      <td className="py-2 text-right font-medium">${Number(fs.transport_fee).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted">Miscellaneous Charges</td>
                      <td className="py-2 text-right font-medium">${Number(fs.miscellaneous_charges).toLocaleString()}</td>
                    </tr>
                  </>
                )}
                {!fs && (
                  <tr>
                    <td className="py-3 text-muted italic">No custom fee structure mapped yet.</td>
                    <td className="py-3 text-right font-medium">$0</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Aggregates / Payment Ledger summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal Base Fees:</span>
                <span className="font-semibold text-ink">${baseTotal.toLocaleString()}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Waiver / Discount ({feeAccount?.discount_type === "percentage" ? `${feeAccount.discount_value}%` : "Fixed"}):</span>
                  <span className="font-semibold">-${discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-outline/60 pt-2 font-bold text-ink">
                <span>Total Payable:</span>
                <span>${Number(feeAccount?.total_payable || 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between bg-primary-soft/40 rounded px-2 py-1.5 font-bold text-primary">
                <span>Collected in this installment:</span>
                <span>${Number(payment.amount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-muted px-2 py-0.5">
                <span>Cumulative Paid to Date:</span>
                <span>${Number(feeAccount?.amount_paid || 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-t border-outline/60 pt-2 font-bold text-danger">
                <span>Outstanding Balance:</span>
                <span>${remaining.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method / Audit Metadata */}
          <div className="mt-8 grid gap-4 border-t border-outline/50 pt-6 sm:grid-cols-2 text-xs">
            <div className="space-y-1.5 text-muted">
              <p>
                Payment Method: <strong className="text-ink">{payment.payment_method.replace("_", " ").toUpperCase()}</strong>
              </p>
              {payment.transaction_number && (
                <p>Transaction Number: <strong className="text-ink">{payment.transaction_number}</strong></p>
              )}
              {payment.reference_number && (
                <p>Reference Number: <strong className="text-ink">{payment.reference_number}</strong></p>
              )}
              {payment.remarks && (
                <p className="italic">Note: &quot;{payment.remarks}&quot;</p>
              )}
            </div>

            <div className="flex flex-col justify-between items-end text-right">
              <div>
                <p className="text-muted">Collected By:</p>
                <p className="font-semibold text-ink">{payment.received_by_name}</p>
              </div>
              <div className="mt-4 w-40 border-b border-outline/80 pb-1"></div>
              <p className="text-xxs text-muted mt-1">Registrar Authorized Signature</p>
            </div>
          </div>

          {/* Void Log details if applicable */}
          {payment.is_voided && (
            <div className="mt-6 rounded-lg bg-danger-soft/20 border border-danger/20 p-3 text-xs text-danger">
              <p className="font-bold">VOID AUDIT TRAIL LOG RECORDED:</p>
              <p className="mt-1">Voided by {payment.voided_by_name} on {format(new Date(payment.voided_at), "MMM d, yyyy HH:mm")}</p>
              <p className="mt-0.5">Reason: &quot;{payment.void_reason}&quot;</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 border-t border-outline/30 pt-4 text-center text-xxs text-muted">
            This is a computer-generated fee receipt. Alexandria Academy, GoCampusFlow.
          </div>
        </div>
      </div>
    );
  }

  // ----------------- Default Mode: Listing Receipts -----------------
  const list = await getPaymentHistory(user, {
    q: params.q,
    method: params.method,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo
  });

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Payment Receipts Log"
        description="Search, view, audit, and print official payment receipts captured within the tenant."
      />

      <Card className="mb-5 p-4">
        <form className="grid gap-3 md:grid-cols-5" action="/finance/receipts">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input name="q" defaultValue={params.q} className="pl-9" placeholder="Search Receipt / Name..." />
          </div>

          <Select name="method" defaultValue={params.method ?? "all"}>
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="online_payment">Online Payment</option>
          </Select>

          <Input type="date" name="dateFrom" defaultValue={params.dateFrom} placeholder="Date From" />
          <Input type="date" name="dateTo" defaultValue={params.dateTo} placeholder="Date To" />

          <button className="min-h-11 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-[#2259bf]">
            Filter
          </button>
        </form>
      </Card>

      {!list.length ? (
        <EmptyState title="No Receipts Found" description="Try a different search or filter date range." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Admission</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Collected By</th>
                <th className="px-4 py-3">Payment Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p: any) => (
                <tr key={p.id} className="border-t border-outline/60 hover:bg-surface-low/70">
                  <td className="px-4 py-4 font-mono font-semibold">{p.receipt_number}</td>
                  <td className="px-4 py-4 font-semibold text-ink">{p.student_name}</td>
                  <td className="px-4 py-4 text-muted">{p.admission_number}</td>
                  <td className="px-4 py-4 font-semibold text-success">${Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-4 text-muted">
                    <Badge tone="blue">{p.payment_method.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-4 text-muted">{p.received_by_name}</td>
                  <td className="px-4 py-4 text-muted">
                    {format(new Date(p.payment_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-4">
                    {p.is_voided ? (
                      <Badge tone="red">Voided</Badge>
                    ) : (
                      <Badge tone="green">Active</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/finance/receipts?id=${p.id}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface-low px-2.5 text-xs font-bold text-primary hover:bg-primary-soft transition"
                    >
                      <Printer className="h-3 w-3" /> View/Print
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
