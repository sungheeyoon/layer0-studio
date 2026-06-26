import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-10 space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </header>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
