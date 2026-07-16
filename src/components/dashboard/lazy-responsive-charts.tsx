"use client";

import dynamic from "next/dynamic";

const ChartLoading = ({ height = 300 }: { height?: number }) => (
  <div
    className="w-full animate-pulse rounded-[18px] bg-surface-low ring-1 ring-outline/40"
    style={{ height }}
    aria-hidden="true"
  />
);

const AttendanceTrendChartImpl = dynamic(
  () => import("@/components/dashboard/responsive-charts").then((mod) => mod.AttendanceTrendChart),
  { ssr: false, loading: () => <ChartLoading height={320} /> }
);

const ClassDistributionChartImpl = dynamic(
  () => import("@/components/dashboard/responsive-charts").then((mod) => mod.ClassDistributionChart),
  { ssr: false, loading: () => <ChartLoading height={300} /> }
);

export function LazyAttendanceTrendChart({ data }: { data: Array<{ date: string; attendance: number }> }) {
  return <AttendanceTrendChartImpl data={data} />;
}

export function LazyClassDistributionChart({ data }: { data: Array<{ class_name: string; student_count: number }> }) {
  return <ClassDistributionChartImpl data={data} />;
}
