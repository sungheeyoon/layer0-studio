import Sidebar from "@/components/dashboard/Sidebar";
import TopNavBar from "@/components/dashboard/TopNavBar";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
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
    </>
  );
}
