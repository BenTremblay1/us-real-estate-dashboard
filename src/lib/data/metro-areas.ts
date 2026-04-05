import type { MetroArea } from '@/lib/types/property';

export const metroAreas: MetroArea[] = [
  {
    id: 'denver',
    name: 'Denver',
    state: 'CO',
    center: { latitude: 39.7392, longitude: -104.9903 },
    zoom: 11,
    medianPrice: 550000,
    medianPricePerSqft: 295,
  },
  {
    id: 'austin',
    name: 'Austin',
    state: 'TX',
    center: { latitude: 30.2672, longitude: -97.7431 },
    zoom: 11,
    medianPrice: 450000,
    medianPricePerSqft: 245,
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    state: 'AZ',
    center: { latitude: 33.4484, longitude: -112.074 },
    zoom: 11,
    medianPrice: 400000,
    medianPricePerSqft: 235,
  },
];

export function getMetroById(id: string): MetroArea | undefined {
  return metroAreas.find((m) => m.id === id);
}
