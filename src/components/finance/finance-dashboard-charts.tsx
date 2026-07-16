"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export function OutstandingByClassChart({ data }: { data: Array<{ className: string; amount: number }> }) {
  if (!data.length || data.every(d => d.amount === 0)) {
    return (
      <EmptyState
        title="No outstanding fees"
        description="All classes have fully paid their tuition."
        className="min-h-[280px]"
      />
    );
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: -2, bottom: 18 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="className" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(value) => [`$${value}`, "Outstanding"]} />
          <Bar name="Outstanding Balance" dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CollectionMethodChart({ data }: { data: Array<{ name: string; value: number }> }) {
  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <EmptyState
        title="No collections yet"
        description="Collection distribution will show when payments are recorded this month."
        className="min-h-[280px]"
      />
    );
  }

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${value}`, "Collected"]} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
