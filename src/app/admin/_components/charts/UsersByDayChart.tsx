'use client';

import { formatNumber } from '@/lib/formatters';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UsersByDayChartProps {
  data: {
    date: string;
    totalUsers: number;
  }[];
}

export default function UsersByDayChart({ data }: UsersByDayChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <BarChart data={data}>
        <CartesianGrid stroke="hsl(var(--muted))" />
        <XAxis dataKey="date" stroke="hsl(var(--primary))" />
        <YAxis
          tickFormatter={(tick) => formatNumber(tick)}
          stroke="hsl(var(--primary))"
        />
        <Tooltip
          formatter={(value) => formatNumber(value as number)}
          cursor={{ fill: 'hsl(var(--muted))' }}
        />
        <Bar
          dataKey="totalUsers"
          name="New Customers"
          stroke="hsl(var(--primary))"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
