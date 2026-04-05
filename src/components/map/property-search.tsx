'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onSearch: (query: string) => void;
  resultCount?: number;
  active?: boolean;
}

export function PropertySearch({ onSearch, resultCount, active }: Props) {
  const [query, setQuery] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  }, [onSearch]);

  const clear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search address, city, zip…"
        className={cn(
          'h-8 pl-8 pr-8 rounded-md border bg-background text-xs',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          'w-44 sm:w-52 placeholder:text-muted-foreground',
          query ? 'border-primary' : 'border-border'
        )}
      />
      {query && (
        <button onClick={clear} className="absolute right-2 text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
