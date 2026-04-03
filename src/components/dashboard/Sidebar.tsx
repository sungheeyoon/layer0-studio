"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Editor", href: "/editor", icon: "edit_square" },
    { name: "Templates", href: "/templates", icon: "layers" },
    { name: "Domains", href: "/domains", icon: "domain" },
    { name: "Analytics", href: "/analytics", icon: "analytics" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#f3f3f3] border-r border-[#eeeeee] flex flex-col py-8 z-40">
      <div className="px-8 mb-10">
        <div className="font-['Inter'] font-medium text-xs tracking-widest uppercase text-[#1a1a1a]">Project Alpha</div>
        <div className="font-['Inter'] font-light text-[10px] tracking-widest uppercase text-[#777777] mt-1">
          Drafting Phase
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group cursor-pointer py-3 transition-all hover:bg-[#eeeeee] pl-4 flex items-center gap-3 ${
                isActive
                  ? "text-[#1a1a1a] font-medium border-l-2 border-[#7d000c]"
                  : "text-[#777777] border-l-2 border-transparent"
              }`}
            >
              <span className="material-symbols-outlined" data-icon={item.icon}>
                {item.icon}
              </span>
              <span className="font-['Inter'] font-light text-xs tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-8 flex items-center gap-3">
        <div className="w-1 h-1 bg-tertiary"></div>
        <span className="font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-primary">
          Live Status
        </span>
      </div>
    </aside>
  );
}
