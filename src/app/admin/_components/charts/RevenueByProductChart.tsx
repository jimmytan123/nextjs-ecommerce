'use client';

import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';

interface RevenueByProductChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export default function RevenueByProductChart({
  data,
}: RevenueByProductChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <PieChart>
        <Tooltip
          formatter={(value) => formatCurrency(value as number)}
          cursor={{ fill: 'hsl(var(--muted))' }}
        />
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="name"
          fill="hsl(var(--primary))"
          label={(item) => item.name}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
