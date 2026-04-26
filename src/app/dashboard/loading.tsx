export default function Loading() {
  return (
    <div className="max-w-[1400px] w-full animate-pulse">
      <section className="mb-24">
        <div className="h-4 w-72 bg-zinc-200 dark:bg-zinc-800 mb-8" />
        <div className="grid grid-cols-12 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
          <div className="col-span-4 bg-white dark:bg-zinc-900/50 py-8 px-12">
            <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 mb-4" />
            <div className="h-20 w-32 bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="col-span-4 bg-white dark:bg-zinc-900/50 py-8 px-12">
            <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 mb-4" />
            <div className="h-20 w-32 bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
          <div className="col-span-4 bg-white dark:bg-zinc-900/50 py-8 px-12">
            <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 mb-4" />
            <div className="h-20 w-32 bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        </div>
      </section>
      <section>
        <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 mb-8" />
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-900/50" />
          ))}
        </div>
      </section>
    </div>
  );
}
