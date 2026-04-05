'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useData } from '@/lib/data/provider';
import type { USProperty, MetroArea } from '@/lib/types/property';
import type { MapBounds } from '@/lib/types/geo';
import { MapSidebar } from '@/components/map/map-sidebar';
import { TimeSlider } from '@/components/map/time-slider';
import { quarters } from '@/lib/config/constants';
import { Activity } from 'lucide-react';
import { metroAreas } from '@/lib/data/metro-areas';

// Dynamic import to avoid SSR issues with maplibre-gl
const PropertyMap = dynamic(
  () => import('@/components/map/property-map').then((m) => m.PropertyMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Activity className="h-8 w-8 animate-pulse" />
        <span className="text-sm">Loading map…</span>
      </div>
    </div>
  );
}

export default function MapPage() {
  const { repository, activeMetro } = useData();
  const [properties, setProperties] = useState<USProperty[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [activeMetric, setActiveMetric] = useState('pricePerSqft');
  const [quarterIdx, setQuarterIdx] = useState(quarters.length - 1);
  const [loading, setLoading] = useState(true);

  // Get metro config for center/zoom
  const metro = useMemo<MetroArea>(
    () => metroAreas.find((m) => m.id === activeMetro) ?? metroAreas[0],
    [activeMetro]
  );

  useEffect(() => {
    setLoading(true);
    repository.getProperties({ metro: activeMetro }).then((props) => {
      setProperties(props);
      setVisibleIds(new Set()); // reset visible set on metro change
      setLoading(false);
    });
  }, [repository, activeMetro]);

  const handleBoundsChange = useCallback((_bounds: MapBounds, ids: Set<string>) => {
    setVisibleIds(ids);
  }, []);

  // Apply quarterly price adjustment (simulated via HPI multiplier)
  const adjustedProperties = useMemo(() => {
    if (!properties.length) return properties;
    const quarter = quarters[quarterIdx];
    // 2026-Q1 is the "current" period (index 24), adjust relative to that
    const currentIdx = quarters.length - 1;
    const ratio = (quarterIdx - currentIdx) * 0.012; // ~1.2% per quarter drift
    const multiplier = 1 + ratio;
    if (Math.abs(ratio) < 0.001) return properties;
    return properties.map((p) => ({
      ...p,
      listPrice: Math.round(p.listPrice * multiplier),
      pricePerSqft: Math.round(p.pricePerSqft * multiplier),
    }));
  }, [properties, quarterIdx]);

  const visibleProperties = useMemo(
    () =>
      visibleIds.size > 0
        ? adjustedProperties.filter((p) => visibleIds.has(p.id))
        : adjustedProperties,
    [adjustedProperties, visibleIds]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Activity className="h-8 w-8 animate-pulse" />
          <span className="text-sm">Loading {metro.name} properties…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main split: map + sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map (fills remaining space) */}
        <div className="flex-1 relative">
          <PropertyMap
            properties={adjustedProperties}
            activeMetric={activeMetric}
            center={metro.center}
            zoom={metro.zoom}
            onBoundsChange={handleBoundsChange}
          />
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 border-l bg-background overflow-hidden">
          <MapSidebar
            allProperties={adjustedProperties}
            visibleProperties={visibleProperties}
            activeMetric={activeMetric}
            onMetricChange={setActiveMetric}
          />
        </div>
      </div>

      {/* Time slider footer */}
      <div className="border-t bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
            Time Period
          </span>
          <div className="flex-1">
            <TimeSlider value={quarterIdx} onChange={setQuarterIdx} />
          </div>
        </div>
      </div>
    </div>
  );
}
