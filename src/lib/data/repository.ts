import type { USProperty, MetroArea } from '@/lib/types/property';
import type { EconomicData } from '@/lib/types/economic';
import type { PropertyScore, ForecastData, CorrelationData, MarketCyclePhase, PortfolioSummary } from '@/lib/types/analytics';
import type { MapBounds, PropertyGeoJSON, HeatmapPoint } from '@/lib/types/geo';

export interface PropertyFilter {
  bounds?: MapBounds;
  metro?: string;
  state?: string;
  zipCodes?: string[];
  priceRange?: [number, number];
  propertyTypes?: string[];
  dateRange?: [string, string];
  bedroomsMin?: number;
  bathroomsMin?: number;
  sqftRange?: [number, number];
}

export interface DataRepository {
  // Metro areas
  getMetroAreas(): Promise<MetroArea[]>;

  // Properties
  getProperties(filters: PropertyFilter): Promise<USProperty[]>;
  getPropertyById(id: string): Promise<USProperty | null>;

  // Geospatial
  getPropertyGeoJSON(filters: PropertyFilter): Promise<PropertyGeoJSON>;
  getHeatmapData(metric: string, filters: PropertyFilter): Promise<HeatmapPoint[]>;

  // Time series
  getMarketTimeSeries(metro: string, metric: string): Promise<{ quarter: string; value: number }[]>;
  getEconomicIndicators(startQuarter?: string, endQuarter?: string): Promise<EconomicData[]>;

  // Analytics
  getPropertyScores(filters: PropertyFilter): Promise<PropertyScore[]>;
  getForecast(metro: string, quartersAhead?: number): Promise<ForecastData[]>;
  getCorrelations(metro: string): Promise<CorrelationData[]>;
  getMarketCycle(quarter?: string): Promise<MarketCyclePhase>;
  getPortfolioSummary(filters: PropertyFilter): Promise<PortfolioSummary>;
}
