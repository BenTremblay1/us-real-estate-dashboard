'use client';

import { useState, useMemo } from 'react';
import type { PropertyScore } from '@/lib/types/analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type SortKey = keyof PropertyScore;
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'propertyId', label: 'Property' },
  { key: 'score', label: 'Score' },
  { key: 'yieldScore', label: 'Yield' },
  { key: 'appreciationScore', label: 'Appreciation' },
  { key: 'volatilityScore', label: 'Volatility' },
  { key: 'locationScore', label: 'Location' },
  { key: 'affordabilityScore', label: 'Affordability' },
];

function ScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 70 ? 'default' : score >= 50 ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{score}</Badge>;
}

function ScoreBar({ value }: { value: number }) {
  const color =
    value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums">{value}</span>
    </div>
  );
}

interface Props {
  scores: PropertyScore[];
  showAll?: boolean;
}

export function DealScoringTable({ scores, showAll = false }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState(showAll);

  const sorted = useMemo(() => {
    return [...scores].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? bv - av : av - bv;
      }
      return sortDir === 'desc'
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }, [scores, sortKey, sortDir]);

  const displayed = expanded ? sorted : sorted.slice(0, 50);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'desc' ? (
      <ChevronDown className="h-3 w-3" />
    ) : (
      <ChevronUp className="h-3 w-3" />
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((deal, i) => (
              <tr
                key={deal.propertyId}
                className={`border-t transition-colors hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
              >
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  {deal.propertyId}
                </td>
                <td className="px-3 py-2">
                  <ScoreBadge score={deal.score} />
                </td>
                <td className="px-3 py-2">
                  <ScoreBar value={deal.yieldScore} />
                </td>
                <td className="px-3 py-2">
                  <ScoreBar value={deal.appreciationScore} />
                </td>
                <td className="px-3 py-2">
                  <ScoreBar value={deal.volatilityScore} />
                </td>
                <td className="px-3 py-2">
                  <ScoreBar value={deal.locationScore} />
                </td>
                <td className="px-3 py-2">
                  <ScoreBar value={deal.affordabilityScore} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {displayed.length} of {scores.length} properties
        </span>
        {!showAll && scores.length > 50 && (
          <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Show top 50' : `Show all ${scores.length}`}
          </Button>
        )}
      </div>
    </div>
  );
}
