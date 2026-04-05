import { Skeleton } from '@/components/ui/skeleton';

export function InvestmentSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
