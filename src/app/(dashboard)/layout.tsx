import Sidebar from "@/components/dashboard/Sidebar";
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
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow ml-64 mt-16">
        {children}
        <Footer />
      </div>
    </div>
  );
}
