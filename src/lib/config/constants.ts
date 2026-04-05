// Quarter generation: 2020-Q1 through 2026-Q1 (25 quarters)
export const quarters: string[] = [];
for (let year = 2020; year <= 2026; year++) {
  const maxQ = year === 2026 ? 1 : 4;
  for (let q = 1; q <= maxQ; q++) {
    quarters.push(`${year}-Q${q}`);
  }
}

export function getQuarterLabel(quarter: string): string {
  const [year, q] = quarter.split('-');
  return `${q} ${year}`;
}

export function getQuarterIndex(quarter: string): number {
  return quarters.indexOf(quarter);
}
