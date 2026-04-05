'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, BarChart3 } from 'lucide-react';
import { MetroSelector } from './metro-selector';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Property Map', icon: Map },
  { href: '/investment', label: 'Investment Dashboard', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center px-4 gap-4">
        <span className="font-semibold text-lg tracking-tight mr-4">
          RE Analytics
        </span>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <MetroSelector />
        </div>
      </div>
    </header>
  );
}
