'use client';

import type { USProperty } from '@/lib/types/property';
import type { PropertyScore } from '@/lib/types/analytics';
import { Badge } from '@/components/ui/badge';
import {
  Bed, Bath, Maximize2, Calendar, MapPin,
  TrendingUp, Footprints, Train, GraduationCap, X, Clock
} from 'lucide-react';

interface Props {
  property: USProperty;
  score?: PropertyScore;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  single_family: 'Single Family',
  condo: 'Condo',
  townhouse: 'Townhouse',
  multi_family: 'Multi-Family',
};

function ScoreRow({ label, value, weight }: { label: string; value: number; weight: string }) {
  const color = value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono w-6 text-right">{value}</span>
      <span className="text-xs text-muted-foreground w-8 text-right">{weight}</span>
    </div>
  );
}

export function PropertyDetail({ property: p, score, onClose }: Props) {
  const priceChangeVsMedian = p.priceToMedianRatio
    ? ((p.priceToMedianRatio - 1) * 100).toFixed(1)
    : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between p-3 border-b shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{p.address}</p>
          <p className="text-xs text-muted-foreground">{p.city}, {p.state} {p.zipCode}</p>
        </div>
        <button onClick={onClose} className="shrink-0 ml-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Price + type */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-2xl font-bold tabular-nums">
              ${p.listPrice.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              ${p.pricePerSqft}/sqft
              {priceChangeVsMedian && (
                <span className={`ml-1.5 font-medium ${Number(priceChangeVsMedian) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Number(priceChangeVsMedian) > 0 ? '+' : ''}{priceChangeVsMedian}% vs median
                </span>
              )}
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            {TYPE_LABELS[p.propertyType] ?? p.propertyType}
          </Badge>
        </div>

        {/* Key specs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Bed, label: 'Bedrooms', value: p.bedrooms },
            { icon: Bath, label: 'Bathrooms', value: p.bathrooms },
            { icon: Maximize2, label: 'Living Area', value: `${p.sqft.toLocaleString()} sqft` },
            { icon: Calendar, label: 'Year Built', value: p.yearBuilt },
            { icon: Clock, label: 'Days on Market', value: `${p.daysOnMarket}d` },
            { icon: MapPin, label: 'Zip Code', value: p.zipCode },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2.5 py-2">
              <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">{label}</div>
                <div className="text-xs font-medium tabular-nums truncate">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Neighborhood scores */}
        {(p.walkScore !== undefined || p.transitScore !== undefined || p.schoolRating !== undefined) && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</p>
            <div className="grid grid-cols-3 gap-2">
              {p.walkScore !== undefined && (
                <div className="text-center rounded-lg bg-muted/40 py-2">
                  <Footprints className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                  <div className="text-sm font-bold">{p.walkScore}</div>
                  <div className="text-[10px] text-muted-foreground">Walk</div>
                </div>
              )}
              {p.transitScore !== undefined && (
                <div className="text-center rounded-lg bg-muted/40 py-2">
                  <Train className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                  <div className="text-sm font-bold">{p.transitScore}</div>
                  <div className="text-[10px] text-muted-foreground">Transit</div>
                </div>
              )}
              {p.schoolRating !== undefined && (
                <div className="text-center rounded-lg bg-muted/40 py-2">
                  <GraduationCap className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                  <div className="text-sm font-bold">{p.schoolRating}</div>
                  <div className="text-[10px] text-muted-foreground">Schools</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Investment score breakdown */}
        {score && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Investment Score</p>
              <Badge variant={score.score >= 70 ? 'default' : score.score >= 50 ? 'secondary' : 'destructive'}>
                {score.score} / 100
              </Badge>
            </div>
            <div className="space-y-1.5 pt-1">
              <ScoreRow label="Yield" value={score.yieldScore} weight="35%" />
              <ScoreRow label="Appreciation" value={score.appreciationScore} weight="35%" />
              <ScoreRow label="Volatility" value={score.volatilityScore} weight="15%" />
              <ScoreRow label="Location" value={score.locationScore} weight="10%" />
              <ScoreRow label="Affordability" value={score.affordabilityScore} weight="5%" />
            </div>
          </div>
        )}

        {/* Sold info */}
        {p.soldPrice && p.soldDate && (
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs font-semibold">Last Sale</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Sold Price</span>
              <span className="font-medium">${p.soldPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Sold Date</span>
              <span className="font-medium">{p.soldDate}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Sale vs List</span>
              <span className={`font-medium ${p.soldPrice >= p.listPrice ? 'text-green-600' : 'text-red-500'}`}>
                {p.soldPrice >= p.listPrice ? '+' : ''}
                {(((p.soldPrice - p.listPrice) / p.listPrice) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
