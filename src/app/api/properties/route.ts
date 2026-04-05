import type { NextRequest } from 'next/server';
import { getServerRepository } from '@/lib/data/server-repository';
import type { PropertyFilter } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: PropertyFilter = {
      metro: searchParams.get('metro') ?? 'denver',
    };

    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    if (priceMin && priceMax) {
      filters.priceRange = [Number(priceMin), Number(priceMax)];
    }

    const types = searchParams.get('propertyTypes');
    if (types) {
      filters.propertyTypes = types.split(',');
    }

    const bedroomsMin = searchParams.get('bedroomsMin');
    if (bedroomsMin) {
      filters.bedroomsMin = Number(bedroomsMin);
    }

    const repository = getServerRepository();
    const properties = await repository.getProperties(filters);

    return Response.json({ data: properties, count: properties.length });
  } catch (error) {
    console.error('[/api/properties]', error);
    return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
