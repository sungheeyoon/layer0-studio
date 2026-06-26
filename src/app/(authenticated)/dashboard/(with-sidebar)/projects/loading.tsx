import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-[1400px]">
      <div className="mb-10 flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-12 border-b border-border bg-muted/50 px-4 py-3">
          <div className="col-span-5"><Skeleton className="h-3 w-32" /></div>
          <div className="col-span-2"><Skeleton className="h-3 w-16" /></div>
          <div className="col-span-2"><Skeleton className="h-3 w-24" /></div>
          <div className="col-span-3 flex justify-end"><Skeleton className="h-3 w-20" /></div>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="grid grid-cols-12 items-center border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="col-span-5 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="col-span-2"><Skeleton className="h-5 w-16 rounded-full" /></div>
            <div className="col-span-2"><Skeleton className="h-3 w-28" /></div>
            <div className="col-span-3 flex justify-end gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
