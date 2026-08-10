import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} aria-hidden="true" />
);

/** Skeleton table used while complaints are loading. */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
    <div className="flex items-center gap-6 border-b border-slate-800 bg-slate-950 px-5 py-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-24' : 'flex-1'}`} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-6 border-b border-slate-800/60 px-5 py-4 last:border-0">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

/** Skeleton card grid used for work orders / dashboards. */
export const SkeletonCards: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);
