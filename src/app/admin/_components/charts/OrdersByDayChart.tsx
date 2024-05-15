'use client';

import { formatCurrency } from '@/lib/formatters';
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OrdersByDayChartProps {
  data: {
    date: string;
    totalSales: number;
  }[];
}

export default function OrdersByDayChart({ data }: OrdersByDayChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(var(--muted))" />
        <XAxis dataKey="date" stroke="hsl(var(--primary))" />
        <YAxis
          tickFormatter={(tick) => formatCurrency(tick)}
          stroke="hsl(var(--primary))"
        />
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Line
          dot={false}
          dataKey="totalSales"
          type="monotone"
          name="Total Sales"
          stroke="hsl(var(--primary))"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
