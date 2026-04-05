'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/lib/data/provider';
import type {
  PropertyScore,
  ForecastData,
  CorrelationData,
  MarketCyclePhase,
  PortfolioSummary,
} from '@/lib/types/analytics';
import type { EconomicData } from '@/lib/types/economic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Shield, Target, FlaskConical, LineChart, Activity } from 'lucide-react';
import { PredictiveForecastChart } from '@/components/investment/predictive-forecast-chart';
import { DealScoringTable } from '@/components/investment/deal-scoring-table';
import { StressTestPanel } from '@/components/investment/stress-test-panel';
import { EconomicIndicatorsPanel } from '@/components/investment/economic-indicators-panel';
import { MarketCycleGauge } from '@/components/investment/market-cycle-gauge';
import { CorrelationMatrix } from '@/components/investment/correlation-matrix';
import { InvestmentSkeleton } from '@/components/investment/investment-skeleton';

const PHASE_BADGE: Record<string, string> = {
  Recovery: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  Expansion: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  Peak: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Recession: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  Hypersupply: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
};

export default function InvestmentPage() {
  const { repository, activeMetro } = useData();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [cycle, setCycle] = useState<MarketCyclePhase | null>(null);
  const [scores, setScores] = useState<PropertyScore[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [economicData, setEconomicData] = useState<EconomicData[]>([]);
  const [fredSource, setFredSource] = useState<'fred' | 'mock'>('mock');
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
      repository.getEconomicIndicators(),
    ]).then(([sum, cyc, sc, fc, cor, econ]) => {
      setSummary(sum);
      setCycle(cyc);
      setScores(sc);
      setForecast(fc);
      setCorrelations(cor);
      setEconomicData(econ);
      setLoading(false);
    });

    // Fetch live FRED data (falls back to mock automatically if no API key)
    fetch('/api/economic/fred')
      .then((r) => r.json())
      .then((result: { source: 'fred' | 'mock'; data: EconomicData[] }) => {
        if (result.data?.length) {
          setEconomicData(result.data);
          setFredSource(result.source);
        }
      })
      .catch(() => { /* keep mock data */ });
  }, [repository, activeMetro]);

  if (loading || !summary || !cycle) {
    return <InvestmentSkeleton />;
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Market Cycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PHASE_BADGE[cycle.phase]}`}>
              {cycle.phase}
            </span>
            <p className="text-xs text-muted-foreground">{cycle.confidence}% confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              Avg Investment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{summary.avgScore}</div>
            <p className="text-xs text-muted-foreground">{summary.propertyCount.toLocaleString()} properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Projected Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{summary.projectedGrowth}%</div>
            <p className="text-xs text-muted-foreground">8-quarter forecast</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Badge
              variant={
                summary.marketRisk === 'Low'
                  ? 'default'
                  : summary.marketRisk === 'Medium'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {summary.marketRisk}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {summary.highValueAssets} high · {summary.mediumValueAssets} med · {summary.lowValueAssets} low
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="deals">
        <TabsList className="mb-4">
          <TabsTrigger value="deals">Deal Scoring</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="stress">Stress Test</TabsTrigger>
        </TabsList>

        {/* Deal Scoring */}
        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Investment Deal Scoring
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Ranked by composite score — Yield (35%) · Appreciation (35%) · Volatility (15%) · Location (10%) · Affordability (5%)
              </p>
            </CardHeader>
            <CardContent>
              <DealScoringTable scores={scores} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecast + Economic */}
        <TabsContent value="forecast">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Price/Sqft Forecast
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Historical trend + 8-quarter linear regression forecast with 95% confidence intervals
                </p>
              </CardHeader>
              <CardContent>
                <PredictiveForecastChart data={forecast} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Economic Indicators
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  FRED macroeconomic data — select an indicator to view its trend
                </p>
              </CardHeader>
              <CardContent>
                <EconomicIndicatorsPanel data={economicData} source={fredSource} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Cycle + Correlation */}
        <TabsContent value="market">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Cycle
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Current phase based on mortgage rates, GDP growth, and Fed stance
                </p>
              </CardHeader>
              <CardContent>
                <MarketCycleGauge cycle={cycle} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Economic Correlations
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Pearson correlation between property prices and macroeconomic indicators
                </p>
              </CardHeader>
              <CardContent>
                <CorrelationMatrix correlations={correlations} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stress Test */}
        <TabsContent value="stress">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Portfolio Stress Test
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Model the impact of macroeconomic shocks on portfolio value
              </p>
            </CardHeader>
            <CardContent>
              <StressTestPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
