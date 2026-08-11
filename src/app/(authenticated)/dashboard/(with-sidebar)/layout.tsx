import Sidebar from "@/components/dashboard/Sidebar";
import TopNavBar from "@/components/dashboard/TopNavBar";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentUserSites } from "@/lib/auth/current-user-sites";
import { DashboardDataProvider } from "./DashboardDataProvider";

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
      <div className="flex min-h-screen flex-col bg-background lg:ml-72">
        <TopNavBar user={user} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </DashboardDataProvider>
  );
}
