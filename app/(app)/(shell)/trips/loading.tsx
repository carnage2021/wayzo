import { Skeleton } from "@/components/ui/skeleton";

export default function TripsLoading() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-label="Loading trips">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-56" />
        </div>
        <Skeleton className="h-[52px] w-36 rounded-full" />
      </div>
      <Skeleton className="h-[52px] w-80 rounded-full" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[300px] rounded-[28px]" />
        ))}
      </div>
    </div>
  );
}
