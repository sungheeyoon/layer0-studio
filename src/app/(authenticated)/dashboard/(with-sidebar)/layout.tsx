import Sidebar from "@/components/dashboard/Sidebar";
import TopNavBar from "@/components/dashboard/TopNavBar";
import { getCurrentUser, getCurrentUserSites } from "@/lib/auth/current-user";
import { DashboardDataProvider } from "./DashboardDataProvider"; // Updated path: it was in the same dir, now it's moved too
import { notFound } from "next/navigation";

export default async function DashboardWithSidebarLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    // This should be handled by the parent layout, but for type safety:
    return null;
  }

  const sites = await getCurrentUserSites(user.id);

  return (
    <DashboardDataProvider user={user} initialSites={sites}>
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col pt-0">
        <TopNavBar user={user} />
        <main className="flex-1 p-12 bg-surface grid-blueprint">
          {children}
        </main>
      </div>

      {/* Floating status indicator (Design System Signal) */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 z-50">
        <div className="w-1 h-1 bg-[#7d000c] animate-pulse"></div>
        <span className="font-['Inter'] font-medium uppercase tracking-[0.15em] text-[0.6rem]">System Online</span>
      </div>
    </DashboardDataProvider>
  );
}
