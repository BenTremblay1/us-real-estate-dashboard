'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterState {
  priceRange: [number, number];
  propertyTypes: string[];
  bedroomsMin: number;
  domMax: number;
  walkScoreMin: number;
}

export const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 2000000],
  propertyTypes: [],
  bedroomsMin: 0,
  domMax: 180,
  walkScoreMin: 0,
};

const PROPERTY_TYPES = [
  { key: 'single_family', label: 'Single Family' },
  { key: 'condo', label: 'Condo' },
  { key: 'townhouse', label: 'Townhouse' },
  { key: 'multi_family', label: 'Multi-Family' },
];

function formatPrice(v: number) {
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;
}

function hasActiveFilters(f: FilterState): boolean {
  return (
    f.priceRange[0] > 0 ||
    f.priceRange[1] < 2000000 ||
    f.propertyTypes.length > 0 ||
    f.bedroomsMin > 0 ||
    f.domMax < 180 ||
    f.walkScoreMin > 0
  );
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function MapFilters({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const active = hasActiveFilters(filters);

  function toggleType(key: string) {
    const types = filters.propertyTypes.includes(key)
      ? filters.propertyTypes.filter((t) => t !== key)
      : [...filters.propertyTypes, key];
    onChange({ ...filters, propertyTypes: types });
  }

  function reset() {
    onChange(DEFAULT_FILTERS);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors',
          open || active
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-background text-muted-foreground border-border hover:text-foreground'
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {active && (
          <span className="ml-0.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] leading-none">
            {[
              filters.priceRange[0] > 0 || filters.priceRange[1] < 2000000,
              filters.propertyTypes.length > 0,
              filters.bedroomsMin > 0,
              filters.domMax < 180,
              filters.walkScoreMin > 0,
            ].filter(Boolean).length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-72 rounded-lg border bg-background shadow-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Filters</span>
            <div className="flex gap-2">
              {active && (
                <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="h-3 w-3" /> Reset
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Price range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Price Range</span>
              <span className="text-muted-foreground tabular-nums">
                {formatPrice(filters.priceRange[0])} – {formatPrice(filters.priceRange[1])}
              </span>
            </div>
            <Slider
              value={filters.priceRange}
              onValueChange={(vals) => {
                if (Array.isArray(vals) && vals.length === 2) {
                  onChange({ ...filters, priceRange: [vals[0], vals[1]] });
                }
              }}
              min={0}
              max={2000000}
              step={25000}
              minStepsBetweenValues={1}
            />
          </div>

          {/* Property types */}
          <div className="space-y-2">
            <span className="text-xs font-medium">Property Type</span>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleType(key)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs border transition-colors',
                    filters.propertyTypes.includes(key)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {filters.propertyTypes.length > 0 && (
              <p className="text-xs text-muted-foreground">Showing selected types only</p>
            )}
          </div>

          {/* Min bedrooms */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Min Bedrooms</span>
              <span className="text-muted-foreground">{filters.bedroomsMin === 0 ? 'Any' : `${filters.bedroomsMin}+`}</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ ...filters, bedroomsMin: n })}
                  className={cn(
                    'flex-1 py-1 rounded text-xs border transition-colors',
                    filters.bedroomsMin === n
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
                  )}
                >
                  {n === 0 ? 'Any' : `${n}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Max days on market */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Max Days on Market</span>
              <span className="text-muted-foreground tabular-nums">{filters.domMax === 180 ? 'Any' : `≤${filters.domMax}d`}</span>
            </div>
            <Slider
              value={[filters.domMax]}
              onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; if (typeof v === 'number') onChange({ ...filters, domMax: v }); }}
              min={7}
              max={180}
              step={7}
            />
          </div>

          {/* Min walk score */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Min Walk Score</span>
              <span className="text-muted-foreground tabular-nums">{filters.walkScoreMin === 0 ? 'Any' : `≥${filters.walkScoreMin}`}</span>
            </div>
            <Slider
              value={[filters.walkScoreMin]}
              onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; if (typeof v === 'number') onChange({ ...filters, walkScoreMin: v }); }}
              min={0}
              max={90}
              step={10}
            />
          </div>

          <Button size="sm" className="w-full" onClick={() => setOpen(false)}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
