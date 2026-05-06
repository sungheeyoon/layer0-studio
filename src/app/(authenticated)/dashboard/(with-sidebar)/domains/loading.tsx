export default function Loading() {
  return (
    <main className="p-10 min-h-[calc(100vh-124px)]">
      <div className="max-w-4xl mx-auto animate-pulse">
        <header className="mb-12">
          <div className="h-8 w-80 bg-zinc-200 dark:bg-zinc-800 mb-3" />
          <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800" />
        </header>
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    </main>
  );
}
