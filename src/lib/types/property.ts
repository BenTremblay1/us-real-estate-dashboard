export type PropertyType = 'single_family' | 'condo' | 'townhouse' | 'multi_family';

export interface USProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;

  // Pricing
  listPrice: number;
  soldPrice?: number;
  pricePerSqft: number;
  assessedValue?: number;

  // Physical
  sqft: number;
  lotSizeSqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  propertyType: PropertyType;

  // Temporal
  listDate: string;
  soldDate?: string;
  daysOnMarket: number;

  // Scores & derived
  walkScore?: number;
  transitScore?: number;
  schoolRating?: number;

  // Market context
  medianAreaPrice?: number;
  priceToMedianRatio?: number;
}

export interface MetroArea {
  id: string;
  name: string;
  state: string;
  center: { latitude: number; longitude: number };
  zoom: number;
  medianPrice: number;
  medianPricePerSqft: number;
}
