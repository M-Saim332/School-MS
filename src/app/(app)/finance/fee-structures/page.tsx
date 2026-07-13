import { requireUser } from "@/lib/auth/session";
import { getFeeStructures } from "@/lib/services/finance";
import { getAcademicOptions } from "@/lib/services/academics";
import { PageHeader } from "@/components/layout/page-header";
import { FeeStructureClient } from "@/components/finance/fee-structure-client";

export default async function FeeStructuresPage() {
  const user = await requireUser("finance:view");
  const [structures, academics] = await Promise.all([
    getFeeStructures(user),
    getAcademicOptions(user)
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Fee Structures Management"
        description="Set up, edit, and audit standard fee schedules mapped by academic year and class."
      />
      <FeeStructureClient
        user={user}
        structures={structures}
        years={academics.years}
        classes={academics.classes}
      />
    </>
  );
}
