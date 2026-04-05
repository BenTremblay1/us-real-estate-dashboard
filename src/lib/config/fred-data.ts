import type { EconomicData } from '@/lib/types/economic';

// Synthetic FRED-like economic data by quarter (2020-Q1 through 2026-Q1)
// To be replaced with live Snowflake/FRED API data in Phase 4
export const economicDataByQuarter: Record<string, EconomicData> = {
  '2020-Q1': { quarter: '2020-Q1', mortgageRate30Y: 3.45, mortgageRate15Y: 2.95, unemploymentRate: 3.5, cpi: 258.8, housePriceIndex: 220.5, buildingPermits: 1450, gdpGrowth: 2.1, federalFundsRate: 1.55 },
  '2020-Q2': { quarter: '2020-Q2', mortgageRate30Y: 3.23, mortgageRate15Y: 2.75, unemploymentRate: 13.0, cpi: 256.4, housePriceIndex: 218.2, buildingPermits: 1050, gdpGrowth: -31.2, federalFundsRate: 0.05 },
  '2020-Q3': { quarter: '2020-Q3', mortgageRate30Y: 2.89, mortgageRate15Y: 2.45, unemploymentRate: 8.5, cpi: 259.9, housePriceIndex: 226.8, buildingPermits: 1340, gdpGrowth: 33.8, federalFundsRate: 0.09 },
  '2020-Q4': { quarter: '2020-Q4', mortgageRate30Y: 2.68, mortgageRate15Y: 2.25, unemploymentRate: 6.7, cpi: 260.5, housePriceIndex: 234.5, buildingPermits: 1520, gdpGrowth: 4.5, federalFundsRate: 0.09 },
  '2021-Q1': { quarter: '2021-Q1', mortgageRate30Y: 2.74, mortgageRate15Y: 2.30, unemploymentRate: 6.2, cpi: 263.0, housePriceIndex: 243.2, buildingPermits: 1610, gdpGrowth: 6.3, federalFundsRate: 0.07 },
  '2021-Q2': { quarter: '2021-Q2', mortgageRate30Y: 2.98, mortgageRate15Y: 2.35, unemploymentRate: 5.9, cpi: 269.2, housePriceIndex: 258.7, buildingPermits: 1680, gdpGrowth: 6.7, federalFundsRate: 0.08 },
  '2021-Q3': { quarter: '2021-Q3', mortgageRate30Y: 2.87, mortgageRate15Y: 2.20, unemploymentRate: 5.1, cpi: 273.6, housePriceIndex: 271.4, buildingPermits: 1630, gdpGrowth: 2.3, federalFundsRate: 0.08 },
  '2021-Q4': { quarter: '2021-Q4', mortgageRate30Y: 3.10, mortgageRate15Y: 2.40, unemploymentRate: 4.2, cpi: 278.8, housePriceIndex: 280.1, buildingPermits: 1700, gdpGrowth: 6.9, federalFundsRate: 0.08 },
  '2022-Q1': { quarter: '2022-Q1', mortgageRate30Y: 3.76, mortgageRate15Y: 3.01, unemploymentRate: 3.8, cpi: 284.6, housePriceIndex: 291.5, buildingPermits: 1730, gdpGrowth: -1.6, federalFundsRate: 0.33 },
  '2022-Q2': { quarter: '2022-Q2', mortgageRate30Y: 5.30, mortgageRate15Y: 4.50, unemploymentRate: 3.6, cpi: 292.3, housePriceIndex: 298.2, buildingPermits: 1560, gdpGrowth: -0.6, federalFundsRate: 1.58 },
  '2022-Q3': { quarter: '2022-Q3', mortgageRate30Y: 5.89, mortgageRate15Y: 5.10, unemploymentRate: 3.5, cpi: 296.2, housePriceIndex: 288.6, buildingPermits: 1480, gdpGrowth: 3.2, federalFundsRate: 3.08 },
  '2022-Q4': { quarter: '2022-Q4', mortgageRate30Y: 6.42, mortgageRate15Y: 5.68, unemploymentRate: 3.5, cpi: 298.4, housePriceIndex: 282.4, buildingPermits: 1380, gdpGrowth: 2.6, federalFundsRate: 4.33 },
  '2023-Q1': { quarter: '2023-Q1', mortgageRate30Y: 6.32, mortgageRate15Y: 5.56, unemploymentRate: 3.4, cpi: 301.8, housePriceIndex: 279.8, buildingPermits: 1350, gdpGrowth: 2.2, federalFundsRate: 4.83 },
  '2023-Q2': { quarter: '2023-Q2', mortgageRate30Y: 6.71, mortgageRate15Y: 6.06, unemploymentRate: 3.6, cpi: 304.1, housePriceIndex: 285.3, buildingPermits: 1400, gdpGrowth: 2.1, federalFundsRate: 5.08 },
  '2023-Q3': { quarter: '2023-Q3', mortgageRate30Y: 7.12, mortgageRate15Y: 6.42, unemploymentRate: 3.8, cpi: 307.2, housePriceIndex: 290.1, buildingPermits: 1370, gdpGrowth: 4.9, federalFundsRate: 5.33 },
  '2023-Q4': { quarter: '2023-Q4', mortgageRate30Y: 6.82, mortgageRate15Y: 6.10, unemploymentRate: 3.7, cpi: 308.7, housePriceIndex: 293.8, buildingPermits: 1420, gdpGrowth: 3.4, federalFundsRate: 5.33 },
  '2024-Q1': { quarter: '2024-Q1', mortgageRate30Y: 6.74, mortgageRate15Y: 6.02, unemploymentRate: 3.8, cpi: 311.2, housePriceIndex: 298.5, buildingPermits: 1440, gdpGrowth: 1.4, federalFundsRate: 5.33 },
  '2024-Q2': { quarter: '2024-Q2', mortgageRate30Y: 6.92, mortgageRate15Y: 6.18, unemploymentRate: 4.0, cpi: 313.8, housePriceIndex: 305.2, buildingPermits: 1410, gdpGrowth: 2.8, federalFundsRate: 5.33 },
  '2024-Q3': { quarter: '2024-Q3', mortgageRate30Y: 6.44, mortgageRate15Y: 5.72, unemploymentRate: 4.2, cpi: 315.1, housePriceIndex: 310.8, buildingPermits: 1460, gdpGrowth: 3.1, federalFundsRate: 5.00 },
  '2024-Q4': { quarter: '2024-Q4', mortgageRate30Y: 6.18, mortgageRate15Y: 5.48, unemploymentRate: 4.1, cpi: 316.4, housePriceIndex: 314.2, buildingPermits: 1490, gdpGrowth: 2.4, federalFundsRate: 4.50 },
  '2025-Q1': { quarter: '2025-Q1', mortgageRate30Y: 5.95, mortgageRate15Y: 5.28, unemploymentRate: 4.0, cpi: 318.2, housePriceIndex: 318.5, buildingPermits: 1520, gdpGrowth: 2.2, federalFundsRate: 4.25 },
  '2025-Q2': { quarter: '2025-Q2', mortgageRate30Y: 5.78, mortgageRate15Y: 5.12, unemploymentRate: 3.9, cpi: 319.8, housePriceIndex: 322.1, buildingPermits: 1550, gdpGrowth: 2.5, federalFundsRate: 4.00 },
  '2025-Q3': { quarter: '2025-Q3', mortgageRate30Y: 5.62, mortgageRate15Y: 4.98, unemploymentRate: 3.8, cpi: 321.1, housePriceIndex: 325.4, buildingPermits: 1580, gdpGrowth: 2.7, federalFundsRate: 3.75 },
  '2025-Q4': { quarter: '2025-Q4', mortgageRate30Y: 5.48, mortgageRate15Y: 4.85, unemploymentRate: 3.7, cpi: 322.5, housePriceIndex: 328.9, buildingPermits: 1610, gdpGrowth: 2.8, federalFundsRate: 3.50 },
  '2026-Q1': { quarter: '2026-Q1', mortgageRate30Y: 5.35, mortgageRate15Y: 4.72, unemploymentRate: 3.6, cpi: 324.0, housePriceIndex: 332.5, buildingPermits: 1640, gdpGrowth: 2.9, federalFundsRate: 3.25 },
};

export function getEconomicData(quarter: string): EconomicData | undefined {
  return economicDataByQuarter[quarter];
}

export function getAllEconomicData(): EconomicData[] {
  return Object.values(economicDataByQuarter);
}

export function getQoQChange(quarter: string, metric: keyof EconomicData): number | null {
  const quarters = Object.keys(economicDataByQuarter);
  const idx = quarters.indexOf(quarter);
  if (idx <= 0) return null;

  const current = economicDataByQuarter[quarter]?.[metric];
  const previous = economicDataByQuarter[quarters[idx - 1]]?.[metric];
  if (typeof current !== 'number' || typeof previous !== 'number' || previous === 0) return null;

  return ((current - previous) / previous) * 100;
}
