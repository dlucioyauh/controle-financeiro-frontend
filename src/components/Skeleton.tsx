interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-4">
      <Skeleton className="h-4 w-48 mb-4" />
      <div className={`${height} flex items-end gap-2 px-4`}>
        <Skeleton className="h-1/2 w-8" />
        <Skeleton className="h-3/4 w-8" />
        <Skeleton className="h-full w-8" />
        <Skeleton className="h-2/3 w-8" />
        <Skeleton className="h-1/2 w-8" />
        <Skeleton className="h-4/5 w-8" />
        <Skeleton className="h-3/5 w-8" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 bg-white/5 rounded-lg">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}