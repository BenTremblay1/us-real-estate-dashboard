import type { USProperty, MetroArea, PropertyType } from '@/lib/types/property';

// Seeded PRNG for reproducible mock data
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randomBetween(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randomBetween(rng, min, max + 1));
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function weightedPick<T>(rng: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// Normal distribution via Box-Muller
function randomNormal(rng: () => number, mean: number, stdDev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

interface MetroConfig {
  metro: MetroArea;
  neighborhoods: {
    name: string;
    centerLat: number;
    centerLng: number;
    spread: number; // degrees of spread
    priceMultiplier: number;
    walkScoreBase: number;
    transitScoreBase: number;
    schoolRatingBase: number;
    weight: number; // how many properties concentrate here
  }[];
  zipCodes: string[];
  streets: string[];
  countyName: string;
}

const denverConfig: MetroConfig = {
  metro: { id: 'denver', name: 'Denver', state: 'CO', center: { latitude: 39.7392, longitude: -104.9903 }, zoom: 11, medianPrice: 550000, medianPricePerSqft: 295 },
  neighborhoods: [
    { name: 'LoDo', centerLat: 39.753, centerLng: -104.999, spread: 0.012, priceMultiplier: 1.5, walkScoreBase: 92, transitScoreBase: 80, schoolRatingBase: 7, weight: 8 },
    { name: 'Cherry Creek', centerLat: 39.717, centerLng: -104.954, spread: 0.015, priceMultiplier: 1.6, walkScoreBase: 85, transitScoreBase: 65, schoolRatingBase: 9, weight: 7 },
    { name: 'Capitol Hill', centerLat: 39.731, centerLng: -104.979, spread: 0.013, priceMultiplier: 1.1, walkScoreBase: 90, transitScoreBase: 75, schoolRatingBase: 6, weight: 10 },
    { name: 'Highlands', centerLat: 39.762, centerLng: -105.012, spread: 0.014, priceMultiplier: 1.3, walkScoreBase: 82, transitScoreBase: 60, schoolRatingBase: 7, weight: 9 },
    { name: 'Park Hill', centerLat: 39.749, centerLng: -104.931, spread: 0.018, priceMultiplier: 0.9, walkScoreBase: 65, transitScoreBase: 45, schoolRatingBase: 7, weight: 8 },
    { name: 'Stapleton/Central Park', centerLat: 39.770, centerLng: -104.888, spread: 0.022, priceMultiplier: 1.0, walkScoreBase: 55, transitScoreBase: 40, schoolRatingBase: 8, weight: 10 },
    { name: 'Lakewood', centerLat: 39.705, centerLng: -105.081, spread: 0.025, priceMultiplier: 0.8, walkScoreBase: 45, transitScoreBase: 35, schoolRatingBase: 7, weight: 8 },
    { name: 'Aurora', centerLat: 39.729, centerLng: -104.831, spread: 0.030, priceMultiplier: 0.65, walkScoreBase: 35, transitScoreBase: 30, schoolRatingBase: 5, weight: 12 },
  ],
  zipCodes: ['80202', '80203', '80204', '80205', '80206', '80207', '80209', '80210', '80211', '80212', '80218', '80220', '80222', '80224', '80230', '80238', '80246'],
  streets: ['Colfax Ave', 'Broadway', 'Speer Blvd', 'Colorado Blvd', 'Federal Blvd', 'Alameda Ave', 'University Blvd', 'Downing St', 'York St', 'Vine St', 'Grape St', 'Cherry St', 'Elm St', 'Dahlia St', 'Birch St', 'Ash St', 'Bellaire St', 'Clermont St', 'Dexter St', 'Eudora St'],
  countyName: 'Denver County',
};

const austinConfig: MetroConfig = {
  metro: { id: 'austin', name: 'Austin', state: 'TX', center: { latitude: 30.2672, longitude: -97.7431 }, zoom: 11, medianPrice: 450000, medianPricePerSqft: 245 },
  neighborhoods: [
    { name: 'Downtown', centerLat: 30.267, centerLng: -97.743, spread: 0.012, priceMultiplier: 1.6, walkScoreBase: 90, transitScoreBase: 70, schoolRatingBase: 6, weight: 7 },
    { name: 'South Congress', centerLat: 30.245, centerLng: -97.750, spread: 0.015, priceMultiplier: 1.4, walkScoreBase: 82, transitScoreBase: 55, schoolRatingBase: 7, weight: 8 },
    { name: 'East Austin', centerLat: 30.262, centerLng: -97.715, spread: 0.018, priceMultiplier: 1.1, walkScoreBase: 70, transitScoreBase: 45, schoolRatingBase: 6, weight: 10 },
    { name: 'Zilker', centerLat: 30.264, centerLng: -97.773, spread: 0.013, priceMultiplier: 1.5, walkScoreBase: 75, transitScoreBase: 50, schoolRatingBase: 8, weight: 7 },
    { name: 'Mueller', centerLat: 30.298, centerLng: -97.704, spread: 0.014, priceMultiplier: 1.0, walkScoreBase: 65, transitScoreBase: 40, schoolRatingBase: 8, weight: 9 },
    { name: 'Cedar Park', centerLat: 30.505, centerLng: -97.820, spread: 0.025, priceMultiplier: 0.75, walkScoreBase: 35, transitScoreBase: 20, schoolRatingBase: 8, weight: 10 },
    { name: 'Round Rock', centerLat: 30.508, centerLng: -97.679, spread: 0.028, priceMultiplier: 0.7, walkScoreBase: 30, transitScoreBase: 15, schoolRatingBase: 9, weight: 12 },
    { name: 'Kyle/Buda', centerLat: 30.007, centerLng: -97.877, spread: 0.025, priceMultiplier: 0.6, walkScoreBase: 20, transitScoreBase: 10, schoolRatingBase: 7, weight: 9 },
  ],
  zipCodes: ['78701', '78702', '78703', '78704', '78705', '78712', '78721', '78722', '78723', '78731', '78741', '78745', '78748', '78753', '78758', '78613', '78664', '78640'],
  streets: ['Congress Ave', 'Lamar Blvd', 'Guadalupe St', 'Red River St', 'Cesar Chavez St', 'Barton Springs Rd', 'S 1st St', 'E Riverside Dr', 'Manor Rd', 'Airport Blvd', 'Burnet Rd', 'N Lamar Blvd', 'Oltorf St', 'Slaughter Ln', 'William Cannon Dr', 'Parmer Ln', 'Braker Ln', 'Duval St', 'Speedway', 'San Jacinto Blvd'],
  countyName: 'Travis County',
};

const phoenixConfig: MetroConfig = {
  metro: { id: 'phoenix', name: 'Phoenix', state: 'AZ', center: { latitude: 33.4484, longitude: -112.074 }, zoom: 11, medianPrice: 400000, medianPricePerSqft: 235 },
  neighborhoods: [
    { name: 'Downtown Phoenix', centerLat: 33.448, centerLng: -112.074, spread: 0.015, priceMultiplier: 1.2, walkScoreBase: 80, transitScoreBase: 65, schoolRatingBase: 5, weight: 7 },
    { name: 'Scottsdale', centerLat: 33.494, centerLng: -111.926, spread: 0.025, priceMultiplier: 1.7, walkScoreBase: 55, transitScoreBase: 30, schoolRatingBase: 9, weight: 10 },
    { name: 'Arcadia', centerLat: 33.488, centerLng: -111.981, spread: 0.013, priceMultiplier: 1.8, walkScoreBase: 60, transitScoreBase: 35, schoolRatingBase: 8, weight: 6 },
    { name: 'Tempe', centerLat: 33.425, centerLng: -111.940, spread: 0.020, priceMultiplier: 1.0, walkScoreBase: 65, transitScoreBase: 55, schoolRatingBase: 7, weight: 10 },
    { name: 'Chandler', centerLat: 33.302, centerLng: -111.842, spread: 0.028, priceMultiplier: 0.9, walkScoreBase: 40, transitScoreBase: 25, schoolRatingBase: 8, weight: 10 },
    { name: 'Gilbert', centerLat: 33.353, centerLng: -111.789, spread: 0.025, priceMultiplier: 0.85, walkScoreBase: 30, transitScoreBase: 15, schoolRatingBase: 9, weight: 10 },
    { name: 'Mesa', centerLat: 33.415, centerLng: -111.831, spread: 0.030, priceMultiplier: 0.7, walkScoreBase: 35, transitScoreBase: 30, schoolRatingBase: 6, weight: 12 },
    { name: 'Glendale', centerLat: 33.538, centerLng: -112.185, spread: 0.028, priceMultiplier: 0.6, walkScoreBase: 30, transitScoreBase: 25, schoolRatingBase: 5, weight: 10 },
  ],
  zipCodes: ['85003', '85004', '85006', '85008', '85012', '85013', '85014', '85016', '85018', '85020', '85022', '85028', '85251', '85257', '85281', '85282', '85224', '85225', '85233', '85234', '85301', '85302'],
  streets: ['Central Ave', 'Indian School Rd', 'Camelback Rd', 'Thomas Rd', 'McDowell Rd', 'Van Buren St', 'Roosevelt St', 'Osborn Rd', 'Bethany Home Rd', 'Glendale Ave', 'Northern Ave', 'Dunlap Ave', 'Thunderbird Rd', 'Bell Rd', 'Greenway Rd', 'Shea Blvd', 'Cactus Rd', 'Scottsdale Rd', 'Hayden Rd', 'Alma School Rd'],
  countyName: 'Maricopa County',
};

const metroConfigs: Record<string, MetroConfig> = {
  denver: denverConfig,
  austin: austinConfig,
  phoenix: phoenixConfig,
};

export function generateMockProperties(metroId: string, count: number = 1800): USProperty[] {
  const config = metroConfigs[metroId];
  if (!config) return [];

  const rng = createRng(metroId.length * 12345 + count);
  const properties: USProperty[] = [];
  const neighborhoodWeights = config.neighborhoods.map((n) => n.weight);

  for (let i = 0; i < count; i++) {
    const hood = weightedPick(rng, config.neighborhoods, neighborhoodWeights);

    const lat = randomNormal(rng, hood.centerLat, hood.spread);
    const lng = randomNormal(rng, hood.centerLng, hood.spread);

    const propertyType = weightedPick<PropertyType>(
      rng,
      ['single_family', 'condo', 'townhouse', 'multi_family'],
      [50, 25, 15, 10]
    );

    // Size varies by type
    let sqft: number, lotSizeSqft: number, bedrooms: number, bathrooms: number;
    switch (propertyType) {
      case 'condo':
        sqft = randomInt(rng, 600, 1800);
        lotSizeSqft = 0;
        bedrooms = randomInt(rng, 1, 3);
        bathrooms = randomInt(rng, 1, 2);
        break;
      case 'townhouse':
        sqft = randomInt(rng, 1000, 2400);
        lotSizeSqft = randomInt(rng, 1500, 3500);
        bedrooms = randomInt(rng, 2, 4);
        bathrooms = randomInt(rng, 1, 3);
        break;
      case 'multi_family':
        sqft = randomInt(rng, 1800, 4500);
        lotSizeSqft = randomInt(rng, 3000, 10000);
        bedrooms = randomInt(rng, 3, 8);
        bathrooms = randomInt(rng, 2, 5);
        break;
      default: // single_family
        sqft = randomInt(rng, 900, 4000);
        lotSizeSqft = randomInt(rng, 3000, 15000);
        bedrooms = randomInt(rng, 2, 6);
        bathrooms = randomInt(rng, 1, 4);
    }

    const yearBuilt = randomInt(rng, 1950, 2025);

    // Price calculation: median * neighborhood multiplier * size factor * age factor + noise
    const sizeFactor = 0.7 + (sqft / 2000) * 0.6;
    const ageFactor = yearBuilt > 2010 ? 1.15 : yearBuilt > 1990 ? 1.0 : yearBuilt > 1970 ? 0.9 : 0.8;
    const noise = randomNormal(rng, 1.0, 0.12);
    const pricePerSqft = Math.max(80, config.metro.medianPricePerSqft * hood.priceMultiplier * ageFactor * noise);
    const listPrice = Math.round(pricePerSqft * sqft);

    const soldChance = rng();
    const isSold = soldChance < 0.6;
    const daysOnMarket = isSold
      ? randomInt(rng, 3, 90)
      : randomInt(rng, 1, 180);

    const listMonth = randomInt(rng, 1, 12);
    const listYear = randomInt(rng, 2024, 2026);
    const listDate = `${listYear}-${String(listMonth).padStart(2, '0')}-${String(randomInt(rng, 1, 28)).padStart(2, '0')}`;

    const walkScore = Math.max(0, Math.min(100, Math.round(randomNormal(rng, hood.walkScoreBase, 10))));
    const transitScore = Math.max(0, Math.min(100, Math.round(randomNormal(rng, hood.transitScoreBase, 12))));
    const schoolRating = Math.max(1, Math.min(10, parseFloat(randomNormal(rng, hood.schoolRatingBase, 1.2).toFixed(1))));

    const medianAreaPrice = Math.round(config.metro.medianPrice * hood.priceMultiplier);

    properties.push({
      id: `${metroId}-${String(i + 1).padStart(5, '0')}`,
      address: `${randomInt(rng, 100, 9999)} ${pick(rng, config.streets)}`,
      city: hood.name.includes('/') ? hood.name.split('/')[0] : (hood.priceMultiplier < 0.8 ? hood.name : config.metro.name),
      state: config.metro.state,
      zipCode: pick(rng, config.zipCodes),
      county: config.countyName,
      latitude: lat,
      longitude: lng,
      listPrice,
      soldPrice: isSold ? Math.round(listPrice * randomBetween(rng, 0.95, 1.05)) : undefined,
      pricePerSqft: Math.round(pricePerSqft),
      sqft,
      lotSizeSqft,
      bedrooms,
      bathrooms,
      yearBuilt,
      propertyType,
      listDate,
      soldDate: isSold
        ? (() => {
            const d = new Date(listDate);
            d.setDate(d.getDate() + daysOnMarket);
            return d.toISOString().split('T')[0];
          })()
        : undefined,
      daysOnMarket,
      walkScore,
      transitScore,
      schoolRating,
      medianAreaPrice,
      priceToMedianRatio: parseFloat((listPrice / medianAreaPrice).toFixed(2)),
    });
  }

  return properties;
}
