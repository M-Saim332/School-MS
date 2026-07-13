import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-soft px-4 py-3 text-sm font-semibold text-success">
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      {children}
    </div>
  );
}
