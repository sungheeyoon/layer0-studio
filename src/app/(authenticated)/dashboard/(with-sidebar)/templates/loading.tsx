export default function Loading() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-12">
        <div className="h-10 w-80 bg-zinc-200 dark:bg-zinc-800 mb-4" />
        <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="border border-zinc-200 dark:border-zinc-800">
            <div className="aspect-video bg-zinc-100 dark:bg-zinc-900" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
