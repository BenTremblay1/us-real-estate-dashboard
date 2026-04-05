'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/lib/data/provider';
import type { PropertyScore, ForecastData, CorrelationData, MarketCyclePhase, PortfolioSummary } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Shield, Target } from 'lucide-react';

export default function InvestmentPage() {
  const { repository, activeMetro } = useData();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [cycle, setCycle] = useState<MarketCyclePhase | null>(null);
  const [scores, setScores] = useState<PropertyScore[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filters = { metro: activeMetro };
    Promise.all([
      repository.getPortfolioSummary(filters),
      repository.getMarketCycle(),
      repository.getPropertyScores(filters),
      repository.getForecast(activeMetro),
      repository.getCorrelations(activeMetro),
    ]).then(([sum, cyc, sc, fc, cor]) => {
      setSummary(sum);
      setCycle(cyc);
      setScores(sc);
      setForecast(fc);
      setCorrelations(cor);
      setLoading(false);
    });
  }, [repository, activeMetro]);

  if (loading || !summary || !cycle) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const phaseColors: Record<string, string> = {
    Recovery: 'bg-blue-100 text-blue-800',
    Expansion: 'bg-green-100 text-green-800',
    Peak: 'bg-amber-100 text-amber-800',
    Recession: 'bg-red-100 text-red-800',
    Hypersupply: 'bg-purple-100 text-purple-800',
  };

  const topDeals = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="flex-1 p-4 space-y-6 overflow-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Market Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={phaseColors[cycle.phase] ?? ''}>
              {cycle.phase}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{cycle.confidence}% confidence</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgScore}</div>
            <p className="text-xs text-muted-foreground">{summary.propertyCount.toLocaleString()} properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Projected Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.projectedGrowth}%</div>
            <p className="text-xs text-muted-foreground">8-quarter forecast</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={summary.marketRisk === 'Low' ? 'default' : summary.marketRisk === 'Medium' ? 'secondary' : 'destructive'}>
              {summary.marketRisk}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.highValueAssets} high / {summary.mediumValueAssets} med / {summary.lowValueAssets} low
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Investment Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Yield</th>
                  <th className="pb-2 pr-4">Appreciation</th>
                  <th className="pb-2 pr-4">Volatility</th>
                  <th className="pb-2 pr-4">Location</th>
                  <th className="pb-2">Affordability</th>
                </tr>
              </thead>
              <tbody>
                {topDeals.map((deal) => (
                  <tr key={deal.propertyId} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{deal.propertyId}</td>
                    <td className="py-2 pr-4">
                      <Badge
                        variant={deal.score >= 70 ? 'default' : deal.score >= 50 ? 'secondary' : 'destructive'}
                      >
                        {deal.score}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">{deal.yieldScore}</td>
                    <td className="py-2 pr-4">{deal.appreciationScore}</td>
                    <td className="py-2 pr-4">{deal.volatilityScore}</td>
                    <td className="py-2 pr-4">{deal.locationScore}</td>
                    <td className="py-2">{deal.affordabilityScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Correlations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Economic Correlations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {correlations.map((c) => (
              <div key={c.y} className="flex items-center gap-3">
                <span className="text-sm w-32 text-muted-foreground">{c.y}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.value >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.abs(c.value) * 50 + 50}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">{c.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {forecast.filter((f) => !f.isForecast).length} historical quarters,{' '}
            {forecast.filter((f) => f.isForecast).length} forecasted
          </p>
          <Badge variant="outline">Phase 2: Recharts integration for full forecast visualization</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
