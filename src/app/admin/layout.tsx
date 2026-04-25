import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopNav from "@/components/admin/AdminTopNav";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Role check: Only users with 'admin' role in their metadata can access
  const role = user.app_metadata?.role;
  if (role !== 'admin') {
    redirect('/dashboard/templates');
  }

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <AdminTopNav />
      {/* Background Grid Simulation */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>
      {/* ml-64: sidebar width, pt-12: top nav height (h-12 = 3rem = 48px) */}
      <div className="ml-64 pt-12">
        {children}
      </div>
    </div>
  );
}
