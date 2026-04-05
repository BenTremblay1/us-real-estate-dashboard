import type { NextRequest } from 'next/server';
import { getServerRepository } from '@/lib/data/server-repository';
import type { PropertyFilter } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const metro = searchParams.get('metro') ?? 'denver';
    const type = searchParams.get('type') ?? 'summary';

    const filters: PropertyFilter = { metro };
    const repository = getServerRepository();

    switch (type) {
      case 'summary': {
        const summary = await repository.getPortfolioSummary(filters);
        return Response.json({ data: summary });
      }
      case 'scores': {
        const scores = await repository.getPropertyScores(filters);
        return Response.json({ data: scores, count: scores.length });
      }
      case 'forecast': {
        const quartersAhead = Number(searchParams.get('quartersAhead') ?? 8);
        const forecast = await repository.getForecast(metro, quartersAhead);
        return Response.json({ data: forecast });
      }
      case 'correlations': {
        const correlations = await repository.getCorrelations(metro);
        return Response.json({ data: correlations });
      }
      case 'cycle': {
        const quarter = searchParams.get('quarter') ?? '2026-Q1';
        const cycle = await repository.getMarketCycle(quarter);
        return Response.json({ data: cycle });
      }
      default:
        return Response.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[/api/analytics]', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
