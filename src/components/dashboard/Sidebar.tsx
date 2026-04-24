"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "OVERVIEW", href: "/dashboard", icon: "grid_view", exact: true },
  { name: "TEMPLATES", href: "/dashboard/templates", icon: "layers" },
  { name: "PROJECTS", href: "/dashboard/projects", icon: "folder_open" },
  { name: "DOMAINS", href: "/dashboard/domains", icon: "language" },
  { name: "SETTINGS", href: "/dashboard/settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-full py-8 bg-[#f3f3f3] dark:bg-zinc-900 w-64 border-none z-50">
      <div className="px-6 mb-12">
        <h1 className="text-lg font-thin tracking-[0.15em] text-black dark:text-white uppercase">Layer0_Studio</h1>
        <p className="font-['Inter'] font-light uppercase tracking-[0.1em] text-[0.6875rem] text-zinc-500 mt-1">V.2.4.0_STABLE</p>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center px-6 py-3 font-['Inter'] font-light uppercase tracking-[0.1em] text-[0.6875rem] transition-colors duration-75 ${
                isActive
                  ? "bg-[#eeeeee] dark:bg-zinc-800 text-black dark:text-white font-medium before:content-[''] before:absolute before:right-4 before:w-1 before:h-1 before:bg-[#7d000c]"
                  : "text-zinc-500 dark:text-zinc-500 hover:bg-[#eeeeee] dark:hover:bg-zinc-800"
              }`}
            >
              <span className="material-symbols-outlined mr-4" data-icon={item.icon}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 py-4">
          <div className="w-8 h-8 bg-zinc-300 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzoZ6E-cCWlzDBn51jc5t-OIG0zOWXUTJlA1RfTxKaKnzXGElnQS2jV_Ms6OrDVpvSqSduOlSsLpcF2VL-Byn9bimapOcZwJ4JN8yzL7CPb152K63gwrr6XqbJ86tgfoq4vgbODo23QiyF5DTcR-S8N3cyzgArAbQgn1rykczNgPlZ16C8VI9899WhuVZMuuffIiuBjVImJvOqsNRdJxA5fOOeUIsxAS47oQrSXY6M2zzpoJOoqfZFr7bgQy6XAdgaMLlgBbeOdJd2"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-['Inter'] font-light uppercase tracking-[0.1em] text-[0.6875rem] truncate">User ID: 8829-X</p>
            <div className="w-1 h-1 bg-[#7d000c] mt-1"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
