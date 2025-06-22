
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard = ({ className }: SkeletonCardProps) => (
  <div className={cn("p-4 bg-gray-800/40 border border-gray-700 rounded-lg", className)}>
    <Skeleton className="h-4 w-3/4 mb-2 bg-gray-700" />
    <Skeleton className="h-3 w-1/2 mb-4 bg-gray-700" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full bg-gray-700" />
      <Skeleton className="h-3 w-5/6 bg-gray-700" />
    </div>
  </div>
);

export const SkeletonStats = ({ className }: SkeletonCardProps) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-gray-800/40 border border-gray-700 rounded-lg p-6">
        <Skeleton className="h-6 w-24 mb-2 bg-gray-700" />
        <Skeleton className="h-8 w-16 bg-gray-700" />
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, className }: SkeletonCardProps & { rows?: number }) => (
  <div className={cn("space-y-3", className)}>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-gray-800/40 border border-gray-700 rounded-lg">
        <Skeleton className="h-4 w-1/4 bg-gray-700" />
        <Skeleton className="h-4 w-1/4 bg-gray-700" />
        <Skeleton className="h-4 w-1/4 bg-gray-700" />
        <Skeleton className="h-4 w-1/4 bg-gray-700" />
      </div>
    ))}
  </div>
);
