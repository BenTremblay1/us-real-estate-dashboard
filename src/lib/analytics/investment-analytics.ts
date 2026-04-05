import type { USProperty } from '@/lib/types/property';
import type { EconomicData } from '@/lib/types/economic';
import type {
  PropertyScore,
  ForecastData,
  CorrelationData,
  MarketCyclePhase,
  PortfolioSummary,
  StressScenario,
} from '@/lib/types/analytics';
import { economicDataByQuarter } from '@/lib/config/fred-data';
import { quarters } from '@/lib/config/constants';

// Scoring Weights — tuned for US market
const YIELD_WEIGHT = 0.35;
const APPRECIATION_WEIGHT = 0.35;
const VOLATILITY_WEIGHT = 0.15;
const LOCATION_WEIGHT = 0.10;
const AFFORDABILITY_WEIGHT = 0.05;

export function calculatePropertyScore(property: USProperty, economicData: EconomicData): PropertyScore {
  // Yield Score: lower price/sqft relative to median = better yield potential
  const priceRatio = property.priceToMedianRatio ?? (property.listPrice / 400000);
  const yieldScore = Math.max(0, Math.min(100, 100 - priceRatio * 40));

  // Appreciation Score: low days on market + newer build = strong demand
  const domFactor = Math.max(0, 100 - property.daysOnMarket);
  const ageFactor = property.yearBuilt > 2010 ? 20 : property.yearBuilt > 2000 ? 10 : 0;
  const appreciationScore = Math.max(0, Math.min(100, domFactor * 0.7 + ageFactor + 10));

  // Volatility Score: higher walk/transit score = more stable area
  const walkFactor = (property.walkScore ?? 50) / 100;
  const transitFactor = (property.transitScore ?? 30) / 100;
  const volatilityScore = Math.max(0, Math.min(100, (walkFactor * 60 + transitFactor * 40)));

  // Location Score: school rating as primary location quality signal
  const schoolFactor = (property.schoolRating ?? 5) / 10;
  const locationScore = Math.max(0, Math.min(100, schoolFactor * 100));

  // Affordability Score: price relative to area median
  const affordabilityScore = priceRatio < 0.8 ? 90
    : priceRatio < 1.0 ? 70
    : priceRatio < 1.2 ? 50
    : priceRatio < 1.5 ? 30
    : 10;

  const totalScore =
    yieldScore * YIELD_WEIGHT +
    appreciationScore * APPRECIATION_WEIGHT +
    volatilityScore * VOLATILITY_WEIGHT +
    locationScore * LOCATION_WEIGHT +
    affordabilityScore * AFFORDABILITY_WEIGHT;

  return {
    propertyId: property.id,
    score: Math.round(totalScore),
    yieldScore: Math.round(yieldScore),
    appreciationScore: Math.round(appreciationScore),
    volatilityScore: Math.round(volatilityScore),
    locationScore: Math.round(locationScore),
    affordabilityScore: Math.round(affordabilityScore),
  };
}

// Generate predictive forecast based on historical price average
export function generateForecast(baseAvgPrice: number, quartersAhead: number = 8): ForecastData[] {
  const result: ForecastData[] = [];

  // Build historical data from FRED HPI
  const historicalPrices: number[] = [];
  for (const quarter of quarters) {
    const econ = economicDataByQuarter[quarter];
    if (!econ) continue;
    const multiplier = econ.housePriceIndex / 300;
    const price = Math.round(baseAvgPrice * multiplier);
    historicalPrices.push(price);
    result.push({
      quarter,
      predictedPrice: price,
      lowerBound: price,
      upperBound: price,
      isForecast: false,
    });
  }

  const n = historicalPrices.length;
  if (n === 0) return result;

  // Linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += historicalPrices[i];
    sumXY += i * historicalPrices[i];
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return result;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Standard deviation for confidence intervals
  const stdDev = Math.sqrt(
    historicalPrices.reduce((sum, p, i) => sum + Math.pow(p - (slope * i + intercept), 2), 0) / n
  );

  const lastPrice = historicalPrices[n - 1];

  for (let i = 0; i < quartersAhead; i++) {
    const growthRate = 1 + (i * 0.005);
    const predictedPrice = lastPrice * growthRate;
    const uncertainty = stdDev * (1 + i * 0.3);

    const year = 2026 + Math.floor((i + 1) / 4);
    const q = ((i + 1) % 4) + 1;

    result.push({
      quarter: `${year}-Q${q}`,
      predictedPrice: Math.round(predictedPrice),
      lowerBound: Math.round(predictedPrice - uncertainty * 1.96),
      upperBound: Math.round(predictedPrice + uncertainty * 1.96),
      isForecast: true,
    });
  }

  return result;
}

// Pearson correlation between property prices and economic indicators
export function calculateCorrelations(properties: USProperty[]): CorrelationData[] {
  const correlations: CorrelationData[] = [];
  const economicMetrics: (keyof EconomicData)[] = [
    'mortgageRate30Y', 'unemploymentRate', 'cpi', 'housePriceIndex', 'federalFundsRate',
  ];

  const metricLabels: Record<string, string> = {
    mortgageRate30Y: 'Mortgage Rate',
    unemploymentRate: 'Unemployment',
    cpi: 'CPI',
    housePriceIndex: 'HPI',
    federalFundsRate: 'Fed Funds Rate',
  };

  // Simulated quarterly avg price from properties (adjusted by HPI)
  const avgPrice = properties.reduce((sum, p) => sum + p.pricePerSqft, 0) / (properties.length || 1);
  const priceData = quarters.map((q) => {
    const econ = economicDataByQuarter[q];
    return econ ? avgPrice * (econ.housePriceIndex / 300) : avgPrice;
  });

  for (const metric of economicMetrics) {
    const economicValues = quarters.map((q) => {
      const data = economicDataByQuarter[q];
      return data ? (data[metric] as number) : 0;
    });

    correlations.push({
      x: 'Property Price',
      y: metricLabels[metric] ?? metric,
      value: pearsonCorrelation(priceData, economicValues),
    });
  }

  return correlations;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
}

// Determine market cycle phase from economic indicators
export function determineMarketCycle(quarter: string = '2026-Q1'): MarketCyclePhase {
  const data = economicDataByQuarter[quarter];
  if (!data) {
    return { phase: 'Expansion', confidence: 50, description: 'Unable to determine' };
  }

  const { mortgageRate30Y, gdpGrowth, federalFundsRate } = data;

  const rateLevel = mortgageRate30Y > 7 ? 'high' : mortgageRate30Y > 5 ? 'medium' : 'low';
  const gdpMomentum = gdpGrowth > 3 ? 'strong' : gdpGrowth > 0 ? 'moderate' : 'weak';
  const fedStance = federalFundsRate > 4.5 ? 'restrictive' : federalFundsRate > 2 ? 'neutral' : 'accommodative';

  if (fedStance === 'restrictive' && rateLevel === 'high' && gdpMomentum === 'weak') {
    return {
      phase: 'Recession',
      confidence: 75,
      description: 'High rates and weak growth suggest market correction phase',
    };
  } else if (fedStance === 'restrictive' && rateLevel === 'high') {
    return {
      phase: 'Peak',
      confidence: 70,
      description: 'High rates may cool the market after expansion phase',
    };
  } else if (fedStance === 'accommodative' || gdpMomentum === 'strong') {
    return {
      phase: 'Expansion',
      confidence: 80,
      description: 'Favorable financing conditions support market growth',
    };
  } else if (gdpMomentum === 'moderate' && rateLevel === 'medium') {
    return {
      phase: 'Recovery',
      confidence: 65,
      description: 'Market stabilizing with moderate growth potential',
    };
  }

  return {
    phase: 'Expansion',
    confidence: 60,
    description: 'Market showing steady growth patterns',
  };
}

// Stress test scenario modeling
export function calculateStressScenario(
  baseValue: number,
  interestRateChange: number,
  vacancyChange: number,
  rentGrowthChange: number
): StressScenario {
  // Interest rate impact: +1% rate = -5% property value
  const interestImpact = interestRateChange * -5;
  // Vacancy impact: +1% vacancy = -2% property value
  const vacancyImpact = vacancyChange * -2;
  // Rent growth impact: +1% rent growth = +3% property value
  const rentImpact = rentGrowthChange * 3;

  const totalImpact = interestImpact + vacancyImpact + rentImpact;

  return {
    interestRateChange,
    vacancyChange,
    rentGrowthChange,
    projectedValueChange: Math.round(totalImpact * 10) / 10,
  };
}

// Portfolio summary from properties and their scores
export function getPortfolioSummary(properties: USProperty[], scores: PropertyScore[]): PortfolioSummary {
  const totalValue = properties.reduce((sum, p) => sum + p.listPrice, 0);
  const avgScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    : 0;
  const highValueAssets = scores.filter((s) => s.score >= 70).length;
  const mediumValueAssets = scores.filter((s) => s.score >= 40 && s.score < 70).length;
  const lowValueAssets = scores.filter((s) => s.score < 40).length;

  return {
    totalValue,
    avgScore: Math.round(avgScore),
    propertyCount: properties.length,
    highValueAssets,
    mediumValueAssets,
    lowValueAssets,
    projectedGrowth: 8.5,
    marketRisk: avgScore > 70 ? 'Low' : avgScore > 50 ? 'Medium' : 'High',
  };
}
