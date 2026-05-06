import Link from 'next/link';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col bg-surface">
      <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <Link 
          href="/dashboard" 
          className="text-xs uppercase tracking-widest font-medium hover:text-primary transition-colors flex items-center gap-2"
        >
          <span className="text-lg">←</span> Back to Dashboard
        </Link>
        <div className="flex items-center gap-4">
          {/* We can add editor-specific top bar items here if needed */}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
