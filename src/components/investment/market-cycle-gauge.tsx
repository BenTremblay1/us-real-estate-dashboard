'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { MarketCyclePhase } from '@/lib/types/analytics';

const PHASES = ['Recovery', 'Expansion', 'Peak', 'Recession', 'Hypersupply'] as const;

const PHASE_CONFIG: Record<
  string,
  { color: string; description: string; bgClass: string; textClass: string }
> = {
  Recovery:    { color: '#3b82f6', description: 'Prices stabilizing, inventory declining', bgClass: 'bg-blue-100 dark:bg-blue-950/30', textClass: 'text-blue-700 dark:text-blue-400' },
  Expansion:   { color: '#22c55e', description: 'Rising prices, strong demand, low days on market', bgClass: 'bg-green-100 dark:bg-green-950/30', textClass: 'text-green-700 dark:text-green-400' },
  Peak:        { color: '#f59e0b', description: 'Price growth slowing, affordability strained', bgClass: 'bg-amber-100 dark:bg-amber-950/30', textClass: 'text-amber-700 dark:text-amber-400' },
  Recession:   { color: '#ef4444', description: 'Prices declining, rising inventory', bgClass: 'bg-red-100 dark:bg-red-950/30', textClass: 'text-red-700 dark:text-red-400' },
  Hypersupply: { color: '#a855f7', description: 'Oversupply, rising vacancy, flat prices', bgClass: 'bg-purple-100 dark:bg-purple-950/30', textClass: 'text-purple-700 dark:text-purple-400' },
};

interface Props {
  cycle: MarketCyclePhase;
}

export function MarketCycleGauge({ cycle }: Props) {
  const config = PHASE_CONFIG[cycle.phase];
  const phaseIdx = PHASES.indexOf(cycle.phase);

  // Arc data — 5 equal segments
  const arcData = PHASES.map((phase, i) => ({
    name: phase,
    value: 1,
    color: i === phaseIdx ? PHASE_CONFIG[phase].color : 'hsl(var(--muted))',
  }));

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Half-donut gauge */}
      <div className="relative w-full max-w-[280px]">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={arcData}
              startAngle={180}
              endAngle={0}
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {arcData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2">
          <span className={`text-lg font-bold ${config.textClass}`}>{cycle.phase}</span>
          <span className="text-xs text-muted-foreground">{cycle.confidence}% confidence</span>
        </div>
      </div>

      {/* Phase labels below arc */}
      <div className="flex justify-between w-full max-w-[280px] text-xs text-muted-foreground px-2">
        {PHASES.map((phase) => (
          <span
            key={phase}
            className={phase === cycle.phase ? `font-semibold ${PHASE_CONFIG[phase].textClass}` : ''}
          >
            {phase.slice(0, 3)}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className={`w-full rounded-lg px-4 py-3 text-sm ${config.bgClass}`}>
        <p className={`font-medium ${config.textClass}`}>{cycle.phase}</p>
        <p className="text-muted-foreground text-xs mt-0.5">{config.description}</p>
        <p className="text-muted-foreground text-xs mt-1 italic">{cycle.description}</p>
      </div>
    </div>
  );
}
