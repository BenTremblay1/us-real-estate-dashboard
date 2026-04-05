export interface MetricConfig {
  key: string;
  label: string;
  unit: string;
  description: string;
  colorScheme: 'ascending' | 'descending';
  format: (value: number) => string;
}

export const metrics: MetricConfig[] = [
  {
    key: 'pricePerSqft',
    label: 'Price per Sqft',
    unit: '$/sqft',
    description: 'List price per square foot',
    colorScheme: 'ascending',
    format: (v) => `$${v.toFixed(0)}`,
  },
  {
    key: 'listPrice',
    label: 'List Price',
    unit: '$',
    description: 'Current listing price',
    colorScheme: 'ascending',
    format: (v) => `$${(v / 1000).toFixed(0)}K`,
  },
  {
    key: 'daysOnMarket',
    label: 'Days on Market',
    unit: 'days',
    description: 'Days since listing',
    colorScheme: 'descending', // fewer days = hotter market = red
    format: (v) => `${v.toFixed(0)} days`,
  },
  {
    key: 'walkScore',
    label: 'Walk Score',
    unit: 'score',
    description: 'Walkability score (0-100)',
    colorScheme: 'ascending',
    format: (v) => `${v.toFixed(0)}`,
  },
  {
    key: 'yearBuilt',
    label: 'Year Built',
    unit: 'year',
    description: 'Year the property was built',
    colorScheme: 'ascending',
    format: (v) => `${Math.round(v)}`,
  },
  {
    key: 'schoolRating',
    label: 'School Rating',
    unit: '/10',
    description: 'Nearby school rating (1-10)',
    colorScheme: 'ascending',
    format: (v) => `${v.toFixed(1)}/10`,
  },
  {
    key: 'sqft',
    label: 'Living Area',
    unit: 'sqft',
    description: 'Interior living space',
    colorScheme: 'ascending',
    format: (v) => `${v.toLocaleString()} sqft`,
  },
];

export function getMetricByKey(key: string): MetricConfig | undefined {
  return metrics.find((m) => m.key === key);
}

export function getMetricStats(properties: Record<string, unknown>[], metricKey: string) {
  const values = properties
    .map((p) => p[metricKey] as number)
    .filter((v) => v !== undefined && v !== null);
  if (values.length === 0) return { min: 0, max: 1, avg: 0 };

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((sum, v) => sum + v, 0) / values.length,
  };
}

export function getMetricColor(
  value: number,
  min: number,
  max: number,
  colorScheme: 'ascending' | 'descending'
): string {
  let normalized = (value - min) / (max - min || 1);

  if (colorScheme === 'descending') {
    normalized = 1 - normalized;
  }

  if (normalized < 0.33) return '#22c55e'; // green
  if (normalized < 0.66) return '#eab308'; // yellow
  return '#ef4444'; // red
}

export function getMetricIntensity(
  value: number,
  min: number,
  max: number,
  colorScheme: 'ascending' | 'descending'
): number {
  let normalized = (value - min) / (max - min || 1);

  if (colorScheme === 'descending') {
    normalized = 1 - normalized;
  }

  return Math.max(0, Math.min(1, normalized));
}
