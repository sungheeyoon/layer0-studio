import Sidebar from "@/components/dashboard/Sidebar";
import TopNavBar from "@/components/dashboard/TopNavBar";
import { getCurrentUser, getCurrentUserSites } from "@/lib/auth/current-user";
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
      <div className="ml-64 flex min-h-screen flex-col bg-background">
        <TopNavBar user={user} />
        <main className="flex-1 p-8 md:p-12">
          {children}
        </main>
      </div>
    </DashboardDataProvider>
  );
}
