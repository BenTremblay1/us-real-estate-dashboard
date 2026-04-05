import { NextResponse } from 'next/server';
import { getAllEconomicData } from '@/lib/config/fred-data';

const SERIES_MAP: Record<string, string> = {
  mortgageRate30Y: 'MORTGAGE30US',
  mortgageRate15Y: 'MORTGAGE15US',
  unemploymentRate: 'UNRATE',
  cpi: 'CPIAUCSL',
  housePriceIndex: 'CSUSHPINSA',
  federalFundsRate: 'FEDFUNDS',
  gdpGrowth: 'A191RL1Q225SBEA',
  buildingPermits: 'PERMIT',
};

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

async function fetchFredSeries(
  seriesId: string,
  apiKey: string
): Promise<{ date: string; value: number }[]> {
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${seriesId}&api_key=${apiKey}&file_type=json` +
    `&observation_start=2020-01-01&sort_order=asc`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`FRED fetch failed for ${seriesId}: ${res.status}`);
  const json = (await res.json()) as FredResponse;
  return json.observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ source: 'mock', data: getAllEconomicData() });
  }

  try {
    const results = await Promise.all(
      Object.entries(SERIES_MAP).map(async ([field, seriesId]) => {
        const obs = await fetchFredSeries(seriesId, apiKey);
        return { field, obs };
      })
    );

    const quarterMap = new Map<string, Record<string, number>>();

    for (const { field, obs } of results) {
      for (const { date, value } of obs) {
        const parts = date.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const q = Math.ceil(month / 3);
        const quarter = `${year}-Q${q}`;
        if (!quarterMap.has(quarter)) quarterMap.set(quarter, {});
        quarterMap.get(quarter)![field] = value;
      }
    }

    const data = Array.from(quarterMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([quarter, fields]) => ({ quarter, ...fields }));

    return NextResponse.json({ source: 'fred', data });
  } catch (err) {
    console.error('FRED API error, falling back to mock:', err);
    return NextResponse.json({ source: 'mock', data: getAllEconomicData() });
  }
}
