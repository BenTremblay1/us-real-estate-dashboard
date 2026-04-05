'use client';

import { Slider } from '@/components/ui/slider';
import { quarters, getQuarterLabel } from '@/lib/config/constants';
import { Play, Pause } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Props {
  value: number; // index into quarters[]
  onChange: (index: number) => void;
}

export function TimeSlider({ value, onChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        onChange(Math.min(value + 1, quarters.length - 1));
        if (value >= quarters.length - 2) setPlaying(false);
      }, 600);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, value, onChange]);

  const yearMarks = quarters.reduce<{ label: string; idx: number }[]>((acc, q, i) => {
    if (q.endsWith('Q1')) acc.push({ label: q.split('-')[0], idx: i });
    return acc;
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="shrink-0 rounded-full p-1.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
        <div className="flex-1">
          <Slider
            value={[value]}
            onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; if (typeof v === 'number') onChange(v); }}
            min={0}
            max={quarters.length - 1}
            step={1}
          />
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums w-20 text-right">
          {getQuarterLabel(quarters[value])}
        </span>
      </div>

      {/* Year marks */}
      <div className="flex justify-between text-xs text-muted-foreground px-6">
        {yearMarks.map(({ label }) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
