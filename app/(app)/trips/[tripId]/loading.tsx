import { Skeleton } from "@/components/ui/skeleton";

export default function TripLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading trip">
      <Skeleton className="h-[240px] rounded-[32px]" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[360px] rounded-[32px]" />
          <Skeleton className="h-[300px] rounded-[28px]" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <Skeleton className="h-[180px] rounded-[28px]" />
            <Skeleton className="h-[180px] rounded-[28px]" />
          </div>
          <Skeleton className="h-[200px] rounded-[28px]" />
          <Skeleton className="h-[240px] rounded-[28px]" />
        </div>
      </div>
    </div>
  );
}
