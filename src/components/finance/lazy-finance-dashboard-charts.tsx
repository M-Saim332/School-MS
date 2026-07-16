"use client";

import dynamic from "next/dynamic";

const ChartLoading = () => (
  <div className="h-[300px] w-full animate-pulse rounded-[18px] bg-surface-low ring-1 ring-outline/40" aria-hidden="true" />
);

const OutstandingByClassChartImpl = dynamic(
  () => import("@/components/finance/finance-dashboard-charts").then((mod) => mod.OutstandingByClassChart),
  { ssr: false, loading: ChartLoading }
);

const CollectionMethodChartImpl = dynamic(
  () => import("@/components/finance/finance-dashboard-charts").then((mod) => mod.CollectionMethodChart),
  { ssr: false, loading: ChartLoading }
);

export function LazyOutstandingByClassChart({ data }: { data: Array<{ className: string; amount: number }> }) {
  return <OutstandingByClassChartImpl data={data} />;
}

export function LazyCollectionMethodChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return <CollectionMethodChartImpl data={data} />;
}
