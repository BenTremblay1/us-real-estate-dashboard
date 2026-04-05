/**
 * SnowflakeDataRepository — Phase 4 placeholder.
 *
 * Implements DataRepository using Snowflake REST API via server-side fetch.
 * Uncomment and populate SQL queries when Snowflake access is available.
 *
 * Environment variables required:
 *   SNOWFLAKE_ACCOUNT        — e.g. "xy12345.us-east-1"
 *   SNOWFLAKE_USER           — service account username
 *   SNOWFLAKE_PASSWORD       — service account password (or use PAT below)
 *   SNOWFLAKE_PAT            — personal access token (preferred over password)
 *   SNOWFLAKE_WAREHOUSE      — compute warehouse name
 *   SNOWFLAKE_DATABASE       — database name
 *   SNOWFLAKE_SCHEMA         — schema name (default: PUBLIC)
 *
 * Table schemas will be mapped through TransformPipeline implementations
 * in src/lib/data/transforms/ once schemas are known.
 */

import type { DataRepository, PropertyFilter } from './repository';
import type { USProperty, MetroArea } from '@/lib/types/property';
import type { EconomicData } from '@/lib/types/economic';
import type { PropertyScore, ForecastData, CorrelationData, MarketCyclePhase, PortfolioSummary } from '@/lib/types/analytics';
import type { PropertyGeoJSON, HeatmapPoint } from '@/lib/types/geo';
import { metroAreas } from './metro-areas';

interface SnowflakeConfig {
  account: string;
  user: string;
  pat?: string;
  password?: string;
  warehouse: string;
  database: string;
  schema: string;
}

export class SnowflakeDataRepository implements DataRepository {
  private config: SnowflakeConfig;
  private baseUrl: string;

  constructor(config: SnowflakeConfig) {
    this.config = config;
    this.baseUrl = `https://${config.account}.snowflakecomputing.com/api/v2`;
  }

  /** Execute a SQL query via Snowflake REST API */
  private async query<T>(sql: string): Promise<T[]> {
    const token = this.config.pat ?? Buffer.from(`${this.config.user}:${this.config.password}`).toString('base64');
    const authHeader = this.config.pat
      ? `Bearer ${token}`
      : `Basic ${token}`;

    const response = await fetch(`${this.baseUrl}/statements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
        'X-Snowflake-Authorization-Token-Type': this.config.pat ? 'KEYPAIR_JWT' : 'BASIC',
      },
      body: JSON.stringify({
        statement: sql,
        warehouse: this.config.warehouse,
        database: this.config.database,
        schema: this.config.schema,
        timeout: 30,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Snowflake query failed: ${err}`);
    }

    const result = await response.json() as { data: T[] };
    return result.data;
  }

  async getMetroAreas(): Promise<MetroArea[]> {
    // Return static config — metro list is app-defined, not from Snowflake
    return metroAreas;
  }

  async getProperties(_filters: PropertyFilter): Promise<USProperty[]> {
    // TODO: Replace with actual table/column names once schemas are known
    // Example:
    // const rows = await this.query<RawMLSRow>(`
    //   SELECT listing_id, address, city, state, zip_code, county,
    //          ST_Y(location) AS latitude, ST_X(location) AS longitude,
    //          list_price, sold_price, sqft, lot_size_sqft,
    //          bedrooms, bathrooms, year_built, property_type,
    //          list_date, sold_date, days_on_market,
    //          walk_score, transit_score, school_rating
    //   FROM ${this.config.database}.${this.config.schema}.MLS_LISTINGS
    //   WHERE metro_area = '${_filters.metro ?? 'denver'}'
    //   LIMIT 5000
    // `);
    // return new MLSTransform().transformBatch(rows);
    throw new Error('SnowflakeDataRepository.getProperties: SQL not yet configured');
  }

  async getPropertyById(_id: string): Promise<USProperty | null> {
    throw new Error('SnowflakeDataRepository.getPropertyById: SQL not yet configured');
  }

  async getPropertyGeoJSON(_filters: PropertyFilter): Promise<PropertyGeoJSON> {
    throw new Error('SnowflakeDataRepository.getPropertyGeoJSON: SQL not yet configured');
  }

  async getHeatmapData(_metric: string, _filters: PropertyFilter): Promise<HeatmapPoint[]> {
    // TODO: Use Snowflake H3 hex binning for server-side aggregation
    // Example:
    // SELECT H3_POINT_TO_CELL_STRING(latitude, longitude, 8) AS hex,
    //        AVG(${_metric}) AS avg_value,
    //        COUNT(*) AS cnt
    // FROM listings WHERE metro = '${_filters.metro}'
    // GROUP BY hex
    throw new Error('SnowflakeDataRepository.getHeatmapData: SQL not yet configured');
  }

  async getMarketTimeSeries(_metro: string, _metric: string): Promise<{ quarter: string; value: number }[]> {
    throw new Error('SnowflakeDataRepository.getMarketTimeSeries: SQL not yet configured');
  }

  async getEconomicIndicators(_startQuarter?: string, _endQuarter?: string): Promise<EconomicData[]> {
    // TODO: Query FRED data table in Snowflake
    throw new Error('SnowflakeDataRepository.getEconomicIndicators: SQL not yet configured');
  }

  async getPropertyScores(_filters: PropertyFilter): Promise<PropertyScore[]> {
    throw new Error('SnowflakeDataRepository.getPropertyScores: SQL not yet configured');
  }

  async getForecast(_metro: string, _quartersAhead?: number): Promise<ForecastData[]> {
    throw new Error('SnowflakeDataRepository.getForecast: SQL not yet configured');
  }

  async getCorrelations(_metro: string): Promise<CorrelationData[]> {
    throw new Error('SnowflakeDataRepository.getCorrelations: SQL not yet configured');
  }

  async getMarketCycle(_quarter?: string): Promise<MarketCyclePhase> {
    throw new Error('SnowflakeDataRepository.getMarketCycle: SQL not yet configured');
  }

  async getPortfolioSummary(_filters: PropertyFilter): Promise<PortfolioSummary> {
    throw new Error('SnowflakeDataRepository.getPortfolioSummary: SQL not yet configured');
  }
}
