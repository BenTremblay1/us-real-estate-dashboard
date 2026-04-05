'use client';

import { useMemo } from 'react';
import type { USProperty } from '@/lib/types/property';
import type { PropertyScore } from '@/lib/types/analytics';
import { getMetricByKey, getMetricStats } from '@/lib/config/metrics';
import { LayerSelector } from './layer-selector';
import { MetricDistribution } from './metric-distribution';
import { PropertyDetail } from './property-detail';
import { Building2, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface Props {
  allProperties: USProperty[];
  visibleProperties: USProperty[];
  activeMetric: string;
  onMetricChange: (key: string) => void;
  selectedProperty?: USProperty | null;
  selectedScore?: PropertyScore | null;
  onClearSelection?: () => void;
}

export function MapSidebar({ allProperties, visibleProperties, activeMetric, onMetricChange, selectedProperty, selectedScore, onClearSelection }: Props) {
  const metricConfig = getMetricByKey(activeMetric);

  const stats = useMemo(() => {
    const props = visibleProperties.length > 0 ? visibleProperties : allProperties;
    return {
      count: props.length,
      avgPrice: props.reduce((s, p) => s + p.listPrice, 0) / (props.length || 1),
      avgPpsf: props.reduce((s, p) => s + p.pricePerSqft, 0) / (props.length || 1),
      avgDom: props.reduce((s, p) => s + p.daysOnMarket, 0) / (props.length || 1),
      metricStats: getMetricStats(props as unknown as Record<string, unknown>[], activeMetric),
    };
  }, [visibleProperties, allProperties, activeMetric]);

  // Show property detail panel when a property is selected
  if (selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty}
        score={selectedScore ?? undefined}
        onClose={() => onClearSelection?.()}
      />
    );
  }

  const kpis = [
    { icon: Building2, label: 'Properties', value: stats.count.toLocaleString() },
    { icon: DollarSign, label: 'Avg Price', value: `$${(stats.avgPrice / 1000).toFixed(0)}K` },
    { icon: TrendingUp, label: 'Avg $/sqft', value: `$${stats.avgPpsf.toFixed(0)}` },
    { icon: Clock, label: 'Avg DOM', value: `${stats.avgDom.toFixed(0)}d` },
  ];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-3">
      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 gap-2">
        {kpis.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-2.5 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </div>
            <div className="text-base font-bold tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      {/* Layer selector */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Metric Layer
        </h3>
        <LayerSelector activeMetric={activeMetric} onMetricChange={onMetricChange} />
      </div>

      {/* Distribution histogram */}
      {metricConfig && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Distribution — {metricConfig.label}
          </h3>
          <MetricDistribution
            properties={visibleProperties.length > 0 ? visibleProperties : allProperties}
            metricKey={activeMetric}
          />
          <div className="grid grid-cols-3 gap-1 text-xs">
            {[
              { label: 'Min', value: metricConfig.format(stats.metricStats.min) },
              { label: 'Avg', value: metricConfig.format(stats.metricStats.avg) },
              { label: 'Max', value: metricConfig.format(stats.metricStats.max) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center rounded bg-muted/50 py-1">
                <div className="text-muted-foreground">{label}</div>
                <div className="font-medium tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property type breakdown */}
      <PropertyTypeBreakdown properties={visibleProperties.length > 0 ? visibleProperties : allProperties} />
    </div>
  );
}

function PropertyTypeBreakdown({ properties }: { properties: USProperty[] }) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of properties) {
      map[p.propertyType] = (map[p.propertyType] ?? 0) + 1;
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type: type.replace('_', ' '),
        count,
        pct: Math.round((count / properties.length) * 100),
      }));
  }, [properties]);

  if (!counts.length) return null;

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Property Types
      </h3>
      <div className="space-y-1.5">
        {counts.map(({ type, count, pct }) => (
          <div key={type} className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="capitalize">{type}</span>
              <span className="text-muted-foreground tabular-nums">{count.toLocaleString()} ({pct}%)</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
