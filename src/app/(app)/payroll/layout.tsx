import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";

export default async function PayrollLayout({ children }: { children: ReactNode }) {
  await requireUser("payroll:view");
  return <>{children}</>;
}
