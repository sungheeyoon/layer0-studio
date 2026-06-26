import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <Skeleton className="h-8 w-48" />
      {[0, 1].map((i) => (
        <div key={i} className="space-y-4 rounded-lg border border-border p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}
