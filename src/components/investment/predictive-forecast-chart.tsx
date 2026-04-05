'use client';

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ForecastData } from '@/lib/types/analytics';

interface Props {
  data: ForecastData[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.name?.includes('Forecast') || false;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">{isForecast ? 'Forecast' : 'Historical'}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex gap-2">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="font-mono">${p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export function PredictiveForecastChart({ data }: Props) {
  const firstForecastIdx = data.findIndex((d) => d.isForecast);
  const pivotQuarter = firstForecastIdx > 0 ? data[firstForecastIdx - 1].quarter : null;

  const chartData = data.map((d) => ({
    quarter: d.quarter,
    ...(d.isForecast
      ? {
          forecastPrice: d.predictedPrice,
          lowerBound: d.lowerBound,
          upperBound: d.upperBound,
          confidenceBand: [d.lowerBound, d.upperBound],
        }
      : {
          historicalPrice: d.predictedPrice,
        }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="quarter"
          tick={{ fontSize: 11 }}
          tickLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        {pivotQuarter && (
          <ReferenceLine
            x={pivotQuarter}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{ value: 'Forecast →', position: 'insideTopRight', fontSize: 11 }}
          />
        )}

        {/* Confidence band — upper/lower as stacked area */}
        <Area
          dataKey="upperBound"
          stroke="none"
          fill="hsl(var(--primary) / 0.12)"
          name="Upper Bound"
          legendType="none"
          connectNulls
        />
        <Area
          dataKey="lowerBound"
          stroke="none"
          fill="hsl(var(--background))"
          name="Lower Bound"
          legendType="none"
          connectNulls
        />

        <Line
          type="monotone"
          dataKey="historicalPrice"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="Historical $/sqft"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecastPrice"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Forecast $/sqft"
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
