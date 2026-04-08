"use client";

export default function AdminTopNav() {
  return (
    <header className="flex justify-between items-center h-12 px-6 ml-64 w-[calc(100%-16rem)] bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 fixed top-0 z-40">
      <div className="flex items-center gap-4">
        <span className="font-['Inter'] font-medium text-neutral-900 dark:text-neutral-100 tracking-wider text-xs uppercase">
          PROJECT_ALPHA / REVISION_01
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <input
            className="bg-transparent border-none focus:ring-0 font-['Inter'] font-light tracking-wider text-[10px] uppercase w-48 text-neutral-900 dark:text-neutral-100 outline-none"
            placeholder="SEARCH_SYSTEM..."
            type="text"
          />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-neutral-300 dark:bg-neutral-800"></div>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <span
            className="material-symbols-outlined cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            data-icon="notifications"
          >
            notifications
          </span>
          <span
            className="material-symbols-outlined cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            data-icon="account_circle"
          >
            account_circle
          </span>
        </div>
        <button className="bg-primary text-on-primary px-4 py-1 font-['Inter'] font-medium tracking-[0.1em] text-[10px] uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all">
          PUBLISH
        </button>
      </div>
    </header>
  );
}
