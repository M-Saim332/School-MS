"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";

export function AttendanceTrendChart({ data }: { data: Array<{ date: string; attendance: number }> }) {
  if (!data.length) {
    return <EmptyState title="No attendance yet" description="Attendance trends will appear after teachers submit daily records." className="min-h-[280px]" />;
  }

  return (
    <div className="h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3366cc" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#3366cc" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e9e8e9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={12} minTickGap={22} />
          <YAxis tick={{ fontSize: 12 }} width={42} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
          <Area type="monotone" dataKey="attendance" stroke="#3366cc" strokeWidth={2.5} fill="url(#attendanceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClassDistributionChart({ data }: { data: Array<{ class_name: string; student_count: number }> }) {
  if (!data.length) {
    return <EmptyState title="No class data" description="Class distribution appears after enrollments are created." className="min-h-[260px]" />;
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 18 }}>
          <CartesianGrid stroke="#e9e8e9" vertical={false} />
          <XAxis dataKey="class_name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={54} />
          <YAxis tick={{ fontSize: 12 }} width={36} allowDecimals={false} />
          <Tooltip formatter={(value) => [value, "Students"]} />
          <Legend verticalAlign="top" height={24} />
          <Bar name="Students" dataKey="student_count" fill="#3366cc" radius={[6, 6, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
