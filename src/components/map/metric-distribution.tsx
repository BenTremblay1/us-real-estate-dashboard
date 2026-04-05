'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { USProperty } from '@/lib/types/property';
import { getMetricByKey, getMetricIntensity } from '@/lib/config/metrics';

function toHsl(intensity: number): string {
  // green (120°) → yellow (60°) → red (0°)
  const hue = Math.round((1 - intensity) * 120);
  return `hsl(${hue}, 70%, 50%)`;
}

interface Props {
  properties: USProperty[];
  metricKey: string;
  bins?: number;
}

export function MetricDistribution({ properties, metricKey, bins = 12 }: Props) {
  const metricConfig = getMetricByKey(metricKey);

  const { chartData, domain } = useMemo(() => {
    const values = properties
      .map((p) => (p as unknown as Record<string, unknown>)[metricKey] as number)
      .filter((v) => v !== undefined && v !== null && !isNaN(v));

    if (!values.length) return { chartData: [], domain: [0, 1] };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / bins || 1;

    const buckets = Array.from({ length: bins }, (_, i) => ({
      label: metricConfig?.format(min + i * step) ?? `${(min + i * step).toFixed(0)}`,
      count: 0,
      intensity: (i + 0.5) / bins,
    }));

    for (const v of values) {
      const idx = Math.min(Math.floor(((v - min) / (max - min || 1)) * bins), bins - 1);
      buckets[idx].count++;
    }

    // Re-compute intensity properly for descending metrics
    const finalBuckets = buckets.map((b, i) => ({
      ...b,
      intensity: metricConfig
        ? getMetricIntensity(min + i * step, min, max, metricConfig.colorScheme)
        : (i + 0.5) / bins,
    }));

    return { chartData: finalBuckets, domain: [min, max] };
  }, [properties, metricKey, bins, metricConfig]);

  if (!chartData.length) {
    return <div className="text-xs text-muted-foreground py-4 text-center">No data</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap={1}>
          <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as { label: string; count: number };
              return (
                <div className="rounded border bg-background px-2 py-1 text-xs shadow">
                  <div className="font-medium">{d.label}</div>
                  <div className="text-muted-foreground">{d.count} properties</div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={toHsl(entry.intensity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
        <span>Low</span>
        <span>{properties.length} properties</span>
        <span>High</span>
      </div>
    </div>
  );
}
