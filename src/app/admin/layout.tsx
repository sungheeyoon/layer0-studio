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
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <AdminTopNav />
      {/* ml-64: sidebar width, pt-14: top nav height (h-14 = 3.5rem = 56px) */}
      <div className="ml-64 pt-14">
        {children}
      </div>
    </div>
  );
}
