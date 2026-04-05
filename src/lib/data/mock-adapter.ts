import type { DataRepository, PropertyFilter } from './repository';
import type { USProperty, MetroArea } from '@/lib/types/property';
import type { EconomicData } from '@/lib/types/economic';
import type { PropertyScore, ForecastData, CorrelationData, MarketCyclePhase, PortfolioSummary } from '@/lib/types/analytics';
import type { PropertyGeoJSON, HeatmapPoint } from '@/lib/types/geo';
import { generateMockProperties } from './mock-generator';
import { metroAreas } from './metro-areas';
import { economicDataByQuarter, getAllEconomicData } from '@/lib/config/fred-data';
import { getMetricStats, getMetricIntensity, getMetricByKey } from '@/lib/config/metrics';
import { quarters } from '@/lib/config/constants';
import {
  calculatePropertyScore,
  generateForecast,
  calculateCorrelations,
  determineMarketCycle,
  calculateStressScenario,
  getPortfolioSummary,
} from '@/lib/analytics/investment-analytics';

export class MockDataRepository implements DataRepository {
  private propertiesByMetro: Map<string, USProperty[]> = new Map();

  constructor() {
    for (const metro of metroAreas) {
      this.propertiesByMetro.set(metro.id, generateMockProperties(metro.id, 1800));
    }
  }

  async getMetroAreas(): Promise<MetroArea[]> {
    return metroAreas;
  }

  async getProperties(filters: PropertyFilter): Promise<USProperty[]> {
    const metroId = filters.metro ?? 'denver';
    let props = this.propertiesByMetro.get(metroId) ?? [];

    if (filters.bounds) {
      const { north, south, east, west } = filters.bounds;
      props = props.filter(
        (p) => p.latitude >= south && p.latitude <= north && p.longitude >= west && p.longitude <= east
      );
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      props = props.filter((p) => p.listPrice >= min && p.listPrice <= max);
    }
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      props = props.filter((p) => filters.propertyTypes!.includes(p.propertyType));
    }
    if (filters.bedroomsMin) {
      props = props.filter((p) => p.bedrooms >= filters.bedroomsMin!);
    }
    if (filters.bathroomsMin) {
      props = props.filter((p) => p.bathrooms >= filters.bathroomsMin!);
    }
    if (filters.sqftRange) {
      const [min, max] = filters.sqftRange;
      props = props.filter((p) => p.sqft >= min && p.sqft <= max);
    }
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      props = props.filter((p) => filters.zipCodes!.includes(p.zipCode));
    }

    return props;
  }

  async getPropertyById(id: string): Promise<USProperty | null> {
    for (const props of this.propertiesByMetro.values()) {
      const found = props.find((p) => p.id === id);
      if (found) return found;
    }
    return null;
  }

  async getPropertyGeoJSON(filters: PropertyFilter): Promise<PropertyGeoJSON> {
    const props = await this.getProperties(filters);
    return {
      type: 'FeatureCollection',
      features: props.map((p) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [p.longitude, p.latitude] as [number, number],
        },
        properties: {
          id: p.id,
          listPrice: p.listPrice,
          pricePerSqft: p.pricePerSqft,
          sqft: p.sqft,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          yearBuilt: p.yearBuilt,
          propertyType: p.propertyType,
          daysOnMarket: p.daysOnMarket,
          walkScore: p.walkScore,
          transitScore: p.transitScore,
          schoolRating: p.schoolRating,
          address: p.address,
          city: p.city,
          zipCode: p.zipCode,
        },
      })),
    };
  }

  async getHeatmapData(metric: string, filters: PropertyFilter): Promise<HeatmapPoint[]> {
    const props = await this.getProperties(filters);
    const metricConfig = getMetricByKey(metric);
    if (!metricConfig) return [];

    const stats = getMetricStats(props as unknown as Record<string, unknown>[], metric);

    return props
      .filter((p) => (p as unknown as Record<string, unknown>)[metric] !== undefined)
      .map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        weight: getMetricIntensity(
          (p as unknown as Record<string, unknown>)[metric] as number,
          stats.min,
          stats.max,
          metricConfig.colorScheme
        ),
      }));
  }

  async getMarketTimeSeries(
    metro: string,
    metric: string
  ): Promise<{ quarter: string; value: number }[]> {
    const props = this.propertiesByMetro.get(metro) ?? [];

    // Simulate quarterly price trends using FRED data as multipliers
    return quarters.map((quarter, idx) => {
      const economicData = economicDataByQuarter[quarter];
      const hpiMultiplier = economicData ? economicData.housePriceIndex / 300 : 1;
      const stats = getMetricStats(props as unknown as Record<string, unknown>[], metric);
      return {
        quarter,
        value: Math.round(stats.avg * hpiMultiplier * (1 + idx * 0.008)),
      };
    });
  }

  async getEconomicIndicators(startQuarter?: string, endQuarter?: string): Promise<EconomicData[]> {
    let data = getAllEconomicData();
    if (startQuarter) {
      const startIdx = quarters.indexOf(startQuarter);
      if (startIdx >= 0) data = data.filter((_, i) => i >= startIdx);
    }
    if (endQuarter) {
      const endIdx = quarters.indexOf(endQuarter);
      if (endIdx >= 0) data = data.filter((_, i) => i <= endIdx);
    }
    return data;
  }

  async getPropertyScores(filters: PropertyFilter): Promise<PropertyScore[]> {
    const props = await this.getProperties(filters);
    const quarter = '2026-Q1';
    const economicData = economicDataByQuarter[quarter];
    if (!economicData) return [];

    return props.map((p) => calculatePropertyScore(p, economicData));
  }

  async getForecast(metro: string, quartersAhead: number = 8): Promise<ForecastData[]> {
    const props = this.propertiesByMetro.get(metro) ?? [];
    const avgPrice = props.reduce((sum, p) => sum + p.pricePerSqft, 0) / (props.length || 1);
    return generateForecast(avgPrice, quartersAhead);
  }

  async getCorrelations(metro: string): Promise<CorrelationData[]> {
    const props = this.propertiesByMetro.get(metro) ?? [];
    return calculateCorrelations(props);
  }

  async getMarketCycle(quarter: string = '2026-Q1'): Promise<MarketCyclePhase> {
    return determineMarketCycle(quarter);
  }

  async getPortfolioSummary(filters: PropertyFilter): Promise<PortfolioSummary> {
    const props = await this.getProperties(filters);
    const scores = await this.getPropertyScores(filters);
    return getPortfolioSummary(props, scores);
  }
}
