'use client';

import { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { calculateStressScenario } from '@/lib/analytics/investment-analytics';
import { TrendingDown, TrendingUp } from 'lucide-react';

export function StressTestPanel() {
  const [interestRate, setInterestRate] = useState(0);
  const [vacancy, setVacancy] = useState(0);
  const [rentGrowth, setRentGrowth] = useState(0);

  const scenario = useMemo(
    () => calculateStressScenario(400000, interestRate, vacancy, rentGrowth),
    [interestRate, vacancy, rentGrowth]
  );

  const isPositive = scenario.projectedValueChange >= 0;

  const sliders: {
    label: string;
    value: number;
    setter: (v: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
    description: string;
  }[] = [
    {
      label: 'Interest Rate',
      value: interestRate,
      setter: setInterestRate,
      min: -2,
      max: 4,
      step: 0.25,
      unit: '%',
      description: '+1% rate = −5% value',
    },
    {
      label: 'Vacancy Rate',
      value: vacancy,
      setter: setVacancy,
      min: -5,
      max: 10,
      step: 0.5,
      unit: '%',
      description: '+1% vacancy = −2% value',
    },
    {
      label: 'Rent Growth',
      value: rentGrowth,
      setter: setRentGrowth,
      min: -5,
      max: 10,
      step: 0.5,
      unit: '%',
      description: '+1% growth = +3% value',
    },
  ];

  return (
    <div className="space-y-6">
      {sliders.map((s) => (
        <div key={s.label} className="space-y-2">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-sm font-medium">{s.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">{s.description}</span>
            </div>
            <span
              className={`text-sm font-mono font-semibold ${s.value > 0 ? 'text-red-500' : s.value < 0 ? 'text-green-500' : 'text-muted-foreground'}`}
            >
              {s.value > 0 ? '+' : ''}
              {s.value.toFixed(2)}{s.unit}
            </span>
          </div>
          <Slider
            value={[s.value]}
            onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; if (typeof v === 'number') s.setter(v); }}
            min={s.min}
            max={s.max}
            step={s.step}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{s.min}{s.unit}</span>
            <span>0{s.unit}</span>
            <span>+{s.max}{s.unit}</span>
          </div>
        </div>
      ))}

      {/* Impact result */}
      <div
        className={`rounded-lg border p-4 flex items-center gap-4 ${
          isPositive ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-8 w-8 text-green-600 shrink-0" />
        ) : (
          <TrendingDown className="h-8 w-8 text-red-600 shrink-0" />
        )}
        <div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            {isPositive ? '+' : ''}{scenario.projectedValueChange.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">
            Projected portfolio value change
          </div>
        </div>
      </div>
    </div>
  );
}
