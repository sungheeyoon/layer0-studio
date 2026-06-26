import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-[1400px]">
      <section className="mb-16">
        <Skeleton className="mb-8 h-4 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-6"
            >
              <Skeleton className="mb-4 h-3 w-24" />
              <Skeleton className="h-16 w-32" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="mb-8 h-4 w-64" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
