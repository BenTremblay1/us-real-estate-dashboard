'use client';

import { metrics } from '@/lib/config/metrics';
import { cn } from '@/lib/utils';

interface Props {
  activeMetric: string;
  onMetricChange: (key: string) => void;
}

const GRADIENT_STOPS = [
  { pct: 0, color: '#22c55e' },
  { pct: 33, color: '#eab308' },
  { pct: 66, color: '#f97316' },
  { pct: 100, color: '#ef4444' },
];

const gradientCss = `linear-gradient(to right, ${GRADIENT_STOPS.map((s) => `${s.color} ${s.pct}%`).join(', ')})`;

export function LayerSelector({ activeMetric, onMetricChange }: Props) {
  const active = metrics.find((m) => m.key === activeMetric);

  return (
    <div className="space-y-3">
      {/* Metric buttons */}
      <div className="flex flex-wrap gap-1.5">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => onMetricChange(m.key)}
            title={m.description}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
              activeMetric === m.key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Color scale legend */}
      {active && (
        <div className="space-y-1">
          <div className="h-2.5 w-full rounded-full" style={{ background: gradientCss }} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{active.colorScheme === 'descending' ? 'High' : 'Low'}</span>
            <span className="font-medium text-foreground">{active.label} ({active.unit})</span>
            <span>{active.colorScheme === 'descending' ? 'Low' : 'High'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
