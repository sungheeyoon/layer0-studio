import Navbar from "@/components/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import Footer from "@/components/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Sidebar />
      <div className="flex flex-col flex-grow ml-64 mt-16">
        {children}
        <Footer />
      </div>
    </div>
  );
}
