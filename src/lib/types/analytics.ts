export interface PropertyScore {
  propertyId: string;
  score: number;
  yieldScore: number;
  appreciationScore: number;
  volatilityScore: number;
  locationScore: number;
  affordabilityScore: number;
}

export interface ForecastData {
  quarter: string;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  isForecast: boolean;
}

export interface CorrelationData {
  x: string;
  y: string;
  value: number;
}

export interface StressScenario {
  interestRateChange: number;
  vacancyChange: number;
  rentGrowthChange: number;
  projectedValueChange: number;
}

export type MarketCyclePhaseType = 'Recovery' | 'Expansion' | 'Peak' | 'Recession' | 'Hypersupply';

export interface MarketCyclePhase {
  phase: MarketCyclePhaseType;
  confidence: number;
  description: string;
}

export interface PortfolioSummary {
  totalValue: number;
  avgScore: number;
  propertyCount: number;
  highValueAssets: number;
  mediumValueAssets: number;
  lowValueAssets: number;
  projectedGrowth: number;
  marketRisk: 'Low' | 'Medium' | 'High';
}
