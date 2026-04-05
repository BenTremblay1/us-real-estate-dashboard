'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/lib/data/provider';
import type { USProperty, MetroArea } from '@/lib/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Building2, DollarSign, TrendingUp } from 'lucide-react';

export default function MapPage() {
  const { repository, activeMetro } = useData();
  const [properties, setProperties] = useState<USProperty[]>([]);
  const [metro, setMetro] = useState<MetroArea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      repository.getProperties({ metro: activeMetro }),
      repository.getMetroAreas(),
    ]).then(([props, metros]) => {
      setProperties(props);
      setMetro(metros.find((m) => m.id === activeMetro) ?? null);
      setLoading(false);
    });
  }, [repository, activeMetro]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading properties...</div>
      </div>
    );
  }

  const avgPrice = properties.reduce((s, p) => s + p.listPrice, 0) / (properties.length || 1);
  const avgPpsf = properties.reduce((s, p) => s + p.pricePerSqft, 0) / (properties.length || 1);
  const avgDom = properties.reduce((s, p) => s + p.daysOnMarket, 0) / (properties.length || 1);

  return (
    <div className="flex-1 flex flex-col">
      {/* Map placeholder — Phase 3 will add Mapbox GL JS here */}
      <div className="flex-1 bg-muted/30 flex items-center justify-center border-b min-h-[400px] relative">
        <div className="text-center space-y-3">
          <Map className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <div>
            <h2 className="text-lg font-semibold">
              {metro?.name}, {metro?.state} — Property Map
            </h2>
            <p className="text-sm text-muted-foreground">
              Mapbox GL JS map with heatmap layers coming in Phase 3
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {properties.length.toLocaleString()} properties loaded
            </p>
          </div>
        </div>
        <Badge variant="outline" className="absolute top-4 right-4">
          Phase 3: Mapbox
        </Badge>
      </div>

      {/* Summary stats panel */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Avg List Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(avgPrice / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg $/sqft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgPpsf.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Map className="h-4 w-4" />
              Avg Days on Market
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDom.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
