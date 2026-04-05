'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { CorrelationData } from '@/lib/types/analytics';

interface Props {
  correlations: CorrelationData[];
}

function getBarColor(value: number): string {
  if (value >= 0.5) return '#22c55e';
  if (value >= 0.2) return '#86efac';
  if (value >= -0.2) return '#94a3b8';
  if (value >= -0.5) return '#fca5a5';
  return '#ef4444';
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { y: string; value: number } }[];
}) => {
  if (!active || !payload?.length) return null;
  const { y, value } = payload[0].payload;
  const strength =
    Math.abs(value) >= 0.7
      ? 'Strong'
      : Math.abs(value) >= 0.4
      ? 'Moderate'
      : 'Weak';
  const direction = value >= 0 ? 'positive' : 'negative';
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
      <p className="font-semibold">{y}</p>
      <p className="text-muted-foreground">
        {strength} {direction} correlation
      </p>
      <p className="font-mono">{value.toFixed(3)}</p>
    </div>
  );
};

export function CorrelationMatrix({ correlations }: Props) {
  const chartData = correlations.map((c) => ({
    y: c.y,
    value: c.value,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
          <XAxis
            type="number"
            domain={[-1, 1]}
            tick={{ fontSize: 10 }}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <YAxis
            type="category"
            dataKey="y"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {[
          { color: '#22c55e', label: 'Strong positive (≥0.5)' },
          { color: '#86efac', label: 'Moderate positive' },
          { color: '#94a3b8', label: 'Weak (±0.2)' },
          { color: '#fca5a5', label: 'Moderate negative' },
          { color: '#ef4444', label: 'Strong negative (≤−0.5)' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
