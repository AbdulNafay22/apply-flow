import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function SkeletonPipeline() {
  return (
    <div className="flex gap-4 min-w-max">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="pipeline-column">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-3">
            <SkeletonCard />
            {i % 2 === 0 && <SkeletonCard />}
          </div>
        </div>
      ))}
    </div>
  );
}
