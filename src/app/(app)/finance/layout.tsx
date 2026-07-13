import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";

export default async function FinanceLayout({ children }: { children: ReactNode }) {
  // Validate that the user has general access to the finance module
  await requireUser("finance:view");
  return <>{children}</>;
}
