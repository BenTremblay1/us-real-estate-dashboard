'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { EconomicData } from '@/lib/types/economic';

const INDICATORS: { key: keyof EconomicData; label: string; format: (v: number) => string; color: string }[] = [
  { key: 'mortgageRate30Y', label: '30Y Mortgage Rate', format: (v) => `${v.toFixed(2)}%`, color: 'hsl(220 70% 50%)' },
  { key: 'federalFundsRate', label: 'Fed Funds Rate', format: (v) => `${v.toFixed(2)}%`, color: 'hsl(280 60% 50%)' },
  { key: 'unemploymentRate', label: 'Unemployment', format: (v) => `${v.toFixed(1)}%`, color: 'hsl(0 65% 50%)' },
  { key: 'housePriceIndex', label: 'House Price Index', format: (v) => v.toFixed(1), color: 'hsl(140 60% 40%)' },
  { key: 'cpi', label: 'CPI', format: (v) => v.toFixed(1), color: 'hsl(35 90% 50%)' },
];

interface Props {
  data: EconomicData[];
}

export function EconomicIndicatorsPanel({ data }: Props) {
  const [activeIndicator, setActiveIndicator] = useState<keyof EconomicData>('mortgageRate30Y');

  const indicator = INDICATORS.find((i) => i.key === activeIndicator) ?? INDICATORS[0];

  const chartData = data.map((d) => ({
    quarter: d.quarter,
    value: d[activeIndicator] as number,
  }));

  const current = chartData[chartData.length - 1]?.value;
  const previous = chartData[chartData.length - 2]?.value;
  const change = current !== undefined && previous !== undefined ? current - previous : 0;

  return (
    <div className="space-y-4">
      {/* Indicator selector */}
      <div className="flex flex-wrap gap-2">
        {INDICATORS.map((ind) => (
          <button
            key={String(ind.key)}
            onClick={() => setActiveIndicator(ind.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              activeIndicator === ind.key
                ? 'border-transparent text-white'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            }`}
            style={activeIndicator === ind.key ? { backgroundColor: ind.color } : {}}
          >
            {ind.label}
          </button>
        ))}
      </div>

      {/* Current value callout */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tabular-nums">
          {current !== undefined ? indicator.format(current) : '—'}
        </span>
        <span
          className={`text-sm font-medium ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-muted-foreground'}`}
        >
          {change > 0 ? '+' : ''}{change.toFixed(2)} QoQ
        </span>
        <span className="text-xs text-muted-foreground ml-auto">2026-Q1</span>
      </div>

      {/* Line chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="quarter"
            tick={{ fontSize: 10 }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={indicator.format}
            width={45}
          />
          <Tooltip
            formatter={(v) => [typeof v === 'number' ? indicator.format(v) : String(v), indicator.label]}
            labelStyle={{ fontSize: 11 }}
            contentStyle={{ fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={indicator.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
