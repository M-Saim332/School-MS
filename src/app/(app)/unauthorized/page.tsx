import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-danger" aria-hidden="true" />
        <h1 className="font-display text-3xl font-semibold text-ink">You do not have access to this area</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Your role can still use the areas listed in the navigation. Ask an administrator if your responsibilities changed.</p>
        <ButtonLink href="/dashboard" className="mt-6">
          Back to dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
