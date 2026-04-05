export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

export interface ClusterPoint {
  latitude: number;
  longitude: number;
  count: number;
  properties: string[]; // property IDs
}

export interface PropertyGeoJSON {
  type: 'FeatureCollection';
  features: PropertyFeature[];
}

export interface PropertyFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    listPrice: number;
    pricePerSqft: number;
    sqft: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    propertyType: string;
    daysOnMarket: number;
    walkScore?: number;
    transitScore?: number;
    schoolRating?: number;
    [key: string]: unknown;
  };
}
