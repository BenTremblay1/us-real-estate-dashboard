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
import { PropertySearch } from '@/components/map/property-search';
import { SidebarSkeleton } from '@/components/map/sidebar-skeleton';
import { quarters } from '@/lib/config/constants';
import { PanelRight, X, Activity } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Apply address/city/zip search on top of filters
  const searchFilteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return filteredProperties;
    const q = searchQuery.toLowerCase();
    return filteredProperties.filter(
      (p) =>
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.zipCode.includes(q)
    );
  }, [filteredProperties, searchQuery]);

  // Properties visible in current map bounds
  const visibleProperties = useMemo(
    () =>
      visibleIds.size > 0
        ? searchFilteredProperties.filter((p) => visibleIds.has(p.id))
        : searchFilteredProperties,
    [searchFilteredProperties, visibleIds]
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-background px-4 py-2 flex items-center gap-3">
          <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-36 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-muted/20 animate-pulse" />
          <div className="hidden md:block w-72 border-l">
            <SidebarSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-background px-4 py-2 flex items-center gap-3 overflow-x-auto">
        <MapFilters filters={filters} onChange={setFilters} />
        <PropertySearch onSearch={setSearchQuery} />
        <span className="text-xs text-muted-foreground shrink-0">
          {searchFilteredProperties.length.toLocaleString()} of {allProperties.length.toLocaleString()} properties
        </span>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        className="fixed bottom-4 right-4 z-40 md:hidden flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-4 py-2.5 shadow-lg text-xs font-medium"
        onClick={() => setSidebarOpen((o) => !o)}
      >
        <PanelRight className="h-4 w-4" />
        {sidebarOpen ? 'Close' : 'Stats'}
      </button>

      {/* Map + sidebar split */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map — full width on mobile, shrinks on desktop */}
        <div className="flex-1 relative min-w-0">
          <PropertyMap
            properties={searchFilteredProperties}
            activeMetric={activeMetric}
            center={metro.center}
            zoom={metro.zoom}
            onBoundsChange={handleBoundsChange}
            onPropertySelect={setSelectedId}
            selectedPropertyId={selectedId}
          />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:flex w-72 shrink-0 border-l bg-background overflow-hidden flex-col">
          <MapSidebar
            allProperties={searchFilteredProperties}
            visibleProperties={visibleProperties}
            activeMetric={activeMetric}
            onMetricChange={(m) => { setActiveMetric(m); setSelectedId(null); }}
            selectedProperty={selectedProperty}
            selectedScore={selectedScore}
            onClearSelection={() => setSelectedId(null)}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <span className="text-sm font-semibold">Market Stats</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <MapSidebar
                  allProperties={searchFilteredProperties}
                  visibleProperties={visibleProperties}
                  activeMetric={activeMetric}
                  onMetricChange={(m) => { setActiveMetric(m); setSelectedId(null); setSidebarOpen(false); }}
                  selectedProperty={selectedProperty}
                  selectedScore={selectedScore}
                  onClearSelection={() => { setSelectedId(null); setSidebarOpen(false); }}
                />
              </div>
            </div>
          </>
        )}
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
