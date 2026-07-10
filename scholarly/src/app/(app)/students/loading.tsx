import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-24" />
      <Skeleton className="h-20" />
      <Skeleton className="h-[420px]" />
    </div>
  );
}
