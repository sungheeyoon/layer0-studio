export default function Loading() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <div className="h-10 w-96 bg-zinc-200 dark:bg-zinc-800 mb-4" />
          <div className="h-4 w-72 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-10 w-52 bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-12 gap-y-1">
        <div className="col-span-12 grid grid-cols-12 pb-4 border-b border-zinc-200 dark:border-zinc-800 px-4">
          <div className="col-span-5"><div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800" /></div>
          <div className="col-span-2"><div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800" /></div>
          <div className="col-span-2"><div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800" /></div>
          <div className="col-span-3 flex justify-end"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800" /></div>
        </div>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="col-span-12 grid grid-cols-12 py-6 items-center px-4 border-b border-zinc-100 dark:border-zinc-900">
            <div className="col-span-5 flex items-center gap-6">
              <div className="w-32 h-20 bg-zinc-100 dark:bg-zinc-900" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900" />
              </div>
            </div>
            <div className="col-span-2"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800" /></div>
            <div className="col-span-2"><div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800" /></div>
            <div className="col-span-3 flex justify-end gap-2">
              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-16 bg-zinc-300 dark:bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
