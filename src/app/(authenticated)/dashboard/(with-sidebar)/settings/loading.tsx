export default function Loading() {
  return (
    <div className="w-full max-w-3xl animate-pulse">
      <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 mb-12" />
      <div className="space-y-8">
        {[0, 1, 2].map(i => (
          <div key={i}>
            <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 mb-4" />
            <div className="h-24 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
