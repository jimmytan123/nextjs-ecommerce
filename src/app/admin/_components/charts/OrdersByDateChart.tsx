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

const data = [
  {
    value: 12,
    date: '2024-05-02',
  },
  {
    value: 25,
    date: '2024-05-01',
  },
  {
    value: 5,
    date: '2024-04-30',
  },
];

export default function OrdersByDateChart() {
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
          dataKey="value"
          type="monotone"
          name="Total Sales"
          stroke="hsl(var(--primary))"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
