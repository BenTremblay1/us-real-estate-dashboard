import { Skeleton } from '@/components/ui/skeleton';

export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-2.5 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-24 w-full rounded-md" />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
