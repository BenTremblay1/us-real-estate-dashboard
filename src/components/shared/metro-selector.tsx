'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/lib/data/provider';
import type { MetroArea } from '@/lib/types/property';

export function MetroSelector() {
  const { repository, activeMetro, setActiveMetro } = useData();
  const [metros, setMetros] = useState<MetroArea[]>([]);

  useEffect(() => {
    repository.getMetroAreas().then(setMetros);
  }, [repository]);

  return (
    <Select value={activeMetro} onValueChange={(val) => { if (val) setActiveMetro(val); }}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select metro" />
      </SelectTrigger>
      <SelectContent>
        {metros.map((metro) => (
          <SelectItem key={metro.id} value={metro.id}>
            {metro.name}, {metro.state}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
