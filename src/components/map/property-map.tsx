'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { USProperty } from '@/lib/types/property';
import type { MapBounds } from '@/lib/types/geo';
import { getMetricByKey, getMetricStats, getMetricIntensity, getMetricColor } from '@/lib/config/metrics';

const BASEMAP_STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

interface Props {
  properties: USProperty[];
  activeMetric: string;
  center: { latitude: number; longitude: number };
  zoom: number;
  onBoundsChange?: (bounds: MapBounds, visibleIds: Set<string>) => void;
}

export function PropertyMap({ properties, activeMetric, center, zoom, onBoundsChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [basemap, setBasemap] = useState<'light' | 'dark'>('light');
  const [mapReady, setMapReady] = useState(false);

  // Build GeoJSON from properties with pre-computed metric intensities
  const buildGeoJSON = useCallback(
    (props: USProperty[]): GeoJSON.FeatureCollection => {
      const metricConfig = getMetricByKey(activeMetric);
      const stats = getMetricStats(props as unknown as Record<string, unknown>[], activeMetric);

      return {
        type: 'FeatureCollection',
        features: props.map((p) => {
          const rawVal = (p as unknown as Record<string, unknown>)[activeMetric] as number | undefined;
          const intensity =
            rawVal !== undefined && metricConfig
              ? getMetricIntensity(rawVal, stats.min, stats.max, metricConfig.colorScheme)
              : 0.5;
          const color =
            rawVal !== undefined && metricConfig
              ? getMetricColor(rawVal, stats.min, stats.max, metricConfig.colorScheme)
              : '#94a3b8';

          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
            properties: {
              id: p.id,
              intensity,
              markerColor: color,
              listPrice: p.listPrice,
              pricePerSqft: p.pricePerSqft,
              sqft: p.sqft,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              yearBuilt: p.yearBuilt,
              propertyType: p.propertyType,
              daysOnMarket: p.daysOnMarket,
              walkScore: p.walkScore ?? 0,
              address: p.address,
              city: p.city,
            },
          };
        }),
      };
    },
    [activeMetric]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLES[basemap],
      center: [center.longitude, center.latitude],
      zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    map.on('load', () => {
      // --- GeoJSON source ---
      map.addSource('properties', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 40,
      });

      // --- Cluster circles ---
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#94a3b8', 20,
            '#64748b', 50,
            '#475569',
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            18, 20, 24, 50, 30,
          ],
          'circle-opacity': 0.85,
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: { 'text-color': '#ffffff' },
      });

      // --- Heatmap layer (visible at lower zooms) ---
      map.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 13, 2.5],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(34,197,94,0)',
            0.2, 'rgba(34,197,94,0.7)',
            0.4, 'rgba(234,179,8,0.8)',
            0.6, 'rgba(249,115,22,0.9)',
            0.8, 'rgba(239,68,68,0.95)',
            1, 'rgba(185,28,28,1)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 15, 13, 30],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.9, 14, 0],
        },
      });

      // --- Individual circles (high zoom) ---
      map.addLayer({
        id: 'property-points',
        type: 'circle',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        minzoom: 12,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 4, 16, 9],
          'circle-color': ['get', 'markerColor'],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      setMapReady(true);
    });

    // --- Click popup ---
    map.on('click', 'property-points', (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number];

      if (popupRef.current) popupRef.current.remove();

      const html = `
        <div style="font-size:12px;line-height:1.6;min-width:180px;">
          <div style="font-weight:600;margin-bottom:4px;">${props.address}</div>
          <div style="color:#64748b;margin-bottom:6px;">${props.city}</div>
          <div><b>$${Number(props.listPrice).toLocaleString()}</b> · ${props.bedrooms}bd/${props.bathrooms}ba</div>
          <div>${Number(props.sqft).toLocaleString()} sqft · $${props.pricePerSqft}/sqft</div>
          <div>Built ${props.yearBuilt} · ${props.daysOnMarket} DOM</div>
          <div>Walk score: ${props.walkScore}</div>
        </div>
      `;

      popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '260px' })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(map);
    });

    map.on('click', 'clusters', (e) => {
      if (!e.features?.length) return;
      const clusterId = e.features[0].properties.cluster_id as number;
      const source = map.getSource('properties') as maplibregl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId).then((z) => {
        map.easeTo({
          center: (e.features![0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: z,
        });
      }).catch(() => {/* ignore */});
    });

    map.on('mouseenter', 'property-points', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'property-points', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });

    // Bounds change callback
    const reportBounds = () => {
      const b = map.getBounds();
      if (!b || !onBoundsChange) return;
      const bounds: MapBounds = {
        north: b.getNorth(), south: b.getSouth(),
        east: b.getEast(), west: b.getWest(),
      };
      const visibleIds = new Set<string>();
      map.queryRenderedFeatures(undefined, { layers: ['property-points', 'heatmap'] })
        .forEach((f) => { if (f.properties?.id) visibleIds.add(f.properties.id as string); });
      onBoundsChange(bounds, visibleIds);
    };

    map.on('moveend', reportBounds);
    map.on('zoomend', reportBounds);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data when properties or metric changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const source = map.getSource('properties') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(buildGeoJSON(properties));
  }, [properties, mapReady, buildGeoJSON]);

  // Swap basemap style
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.setStyle(BASEMAP_STYLES[basemap]);
    map.once('styledata', () => {
      // Re-add layers after style swap
      if (!map.getSource('properties')) {
        map.addSource('properties', {
          type: 'geojson',
          data: buildGeoJSON(properties),
          cluster: true,
          clusterMaxZoom: 13,
          clusterRadius: 40,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  // Fly to new metro center when center prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [center.longitude, center.latitude], zoom, speed: 1.2 });
  }, [center, zoom]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Basemap toggle */}
      <div className="absolute top-3 left-3 flex rounded-md overflow-hidden shadow-sm border border-border bg-background text-xs font-medium">
        {(['light', 'dark'] as const).map((style) => (
          <button
            key={style}
            onClick={() => setBasemap(style)}
            className={`px-3 py-1.5 capitalize transition-colors ${
              basemap === style
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
}
