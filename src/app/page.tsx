'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useData } from '@/lib/data/provider';
import type { USProperty, MetroArea } from '@/lib/types/property';
import type { PropertyScore } from '@/lib/types/analytics';
import type { MapBounds } from '@/lib/types/geo';
import { MapSidebar } from '@/components/map/map-sidebar';
import { TimeSlider } from '@/components/map/time-slider';
import { MapFilters, DEFAULT_FILTERS, type FilterState } from '@/components/map/map-filters';
import { quarters } from '@/lib/config/constants';
import { Activity } from 'lucide-react';
import { metroAreas } from '@/lib/data/metro-areas';

// Dynamic import — avoids SSR for maplibre-gl
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

function applyClientFilters(props: USProperty[], f: FilterState): USProperty[] {
  return props.filter((p) => {
    if (p.listPrice < f.priceRange[0] || p.listPrice > f.priceRange[1]) return false;
    if (f.propertyTypes.length > 0 && !f.propertyTypes.includes(p.propertyType)) return false;
    if (f.bedroomsMin > 0 && p.bedrooms < f.bedroomsMin) return false;
    if (f.domMax < 180 && p.daysOnMarket > f.domMax) return false;
    if (f.walkScoreMin > 0 && (p.walkScore ?? 0) < f.walkScoreMin) return false;
    return true;
  });
}

export default function MapPage() {
  const { repository, activeMetro } = useData();
  const [allProperties, setAllProperties] = useState<USProperty[]>([]);
  const [scores, setScores] = useState<PropertyScore[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [activeMetric, setActiveMetric] = useState('pricePerSqft');
  const [quarterIdx, setQuarterIdx] = useState(quarters.length - 1);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const metro = useMemo<MetroArea>(
    () => metroAreas.find((m) => m.id === activeMetro) ?? metroAreas[0],
    [activeMetro]
  );

  // Load properties and scores on metro change
  useEffect(() => {
    setLoading(true);
    setSelectedId(null);
    setVisibleIds(new Set());
    const metroFilter = { metro: activeMetro };
    Promise.all([
      repository.getProperties(metroFilter),
      repository.getPropertyScores(metroFilter),
    ]).then(([props, sc]) => {
      setAllProperties(props);
      setScores(sc);
      setLoading(false);
    });
  }, [repository, activeMetro]);

  const handleBoundsChange = useCallback((_bounds: MapBounds, ids: Set<string>) => {
    setVisibleIds(ids);
  }, []);

  // Time-adjusted prices via HPI multiplier
  const timeAdjustedProperties = useMemo(() => {
    if (!allProperties.length) return allProperties;
    const currentIdx = quarters.length - 1;
    const ratio = (quarterIdx - currentIdx) * 0.012;
    if (Math.abs(ratio) < 0.001) return allProperties;
    const mult = 1 + ratio;
    return allProperties.map((p) => ({
      ...p,
      listPrice: Math.round(p.listPrice * mult),
      pricePerSqft: Math.round(p.pricePerSqft * mult),
    }));
  }, [allProperties, quarterIdx]);

  // Apply client-side filters
  const filteredProperties = useMemo(
    () => applyClientFilters(timeAdjustedProperties, filters),
    [timeAdjustedProperties, filters]
  );

  // Properties visible in current map bounds
  const visibleProperties = useMemo(
    () =>
      visibleIds.size > 0
        ? filteredProperties.filter((p) => visibleIds.has(p.id))
        : filteredProperties,
    [filteredProperties, visibleIds]
  );

  // Score lookup map
  const scoreMap = useMemo(() => {
    const m = new Map<string, PropertyScore>();
    for (const s of scores) m.set(s.propertyId, s);
    return m;
  }, [scores]);

  const selectedProperty = selectedId ? allProperties.find((p) => p.id === selectedId) ?? null : null;
  const selectedScore = selectedId ? (scoreMap.get(selectedId) ?? null) : null;

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
      {/* Toolbar */}
      <div className="border-b bg-background px-4 py-2 flex items-center gap-3">
        <MapFilters filters={filters} onChange={setFilters} />
        <span className="text-xs text-muted-foreground">
          {filteredProperties.length.toLocaleString()} of {allProperties.length.toLocaleString()} properties
        </span>
      </div>

      {/* Map + sidebar split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative min-w-0">
          <PropertyMap
            properties={filteredProperties}
            activeMetric={activeMetric}
            center={metro.center}
            zoom={metro.zoom}
            onBoundsChange={handleBoundsChange}
            onPropertySelect={setSelectedId}
            selectedPropertyId={selectedId}
          />
        </div>

        {/* Sidebar — swaps between stats/layers and property detail */}
        <div className="w-72 shrink-0 border-l bg-background overflow-hidden flex flex-col">
          <MapSidebar
            allProperties={filteredProperties}
            visibleProperties={visibleProperties}
            activeMetric={activeMetric}
            onMetricChange={(m) => { setActiveMetric(m); setSelectedId(null); }}
            selectedProperty={selectedProperty}
            selectedScore={selectedScore}
            onClearSelection={() => setSelectedId(null)}
          />
        </div>
      </div>

      {/* Time slider footer */}
      <div className="border-t bg-background px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">Time Period</span>
          <div className="flex-1">
            <TimeSlider value={quarterIdx} onChange={setQuarterIdx} />
          </div>
        </div>
      </div>
    </div>
  );
}
