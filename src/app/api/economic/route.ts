import type { NextRequest } from 'next/server';
import { getServerRepository } from '@/lib/data/server-repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const startQuarter = searchParams.get('start') ?? undefined;
    const endQuarter = searchParams.get('end') ?? undefined;

    const repository = getServerRepository();
    const data = await repository.getEconomicIndicators(startQuarter, endQuarter);

    return Response.json({ data, count: data.length });
  } catch (error) {
    console.error('[/api/economic]', error);
    return Response.json({ error: 'Failed to fetch economic data' }, { status: 500 });
  }
}
