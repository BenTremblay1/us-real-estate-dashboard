'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { DataRepository } from './repository';
import { MockDataRepository } from './mock-adapter';

interface DataContextValue {
  repository: DataRepository;
  activeMetro: string;
  setActiveMetro: (metro: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [activeMetro, setActiveMetro] = useState('denver');

  const repository = useMemo(() => {
    // In Phase 4, this will check NEXT_PUBLIC_DATA_SOURCE
    // and return SnowflakeDataRepository when configured
    return new MockDataRepository();
  }, []);

  return (
    <DataContext.Provider value={{ repository, activeMetro, setActiveMetro }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
