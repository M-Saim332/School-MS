import { redirect } from "next/navigation";

export default function LegacyPayrollDashboardPage() {
  redirect("/finance/payroll");
}
