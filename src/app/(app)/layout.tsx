import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { getSchoolProfile } from "@/lib/services/settings";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const schoolProfile = await getSchoolProfile(user);
  const settings = schoolProfile.settings ?? {};

  return (
    <AppShell
      user={user}
      branding={{
        logoUrl: settings.schoolLogoUrl ?? null,
        faviconUrl: settings.schoolFaviconUrl ?? null
      }}
    >
      {children}
    </AppShell>
  );
}
