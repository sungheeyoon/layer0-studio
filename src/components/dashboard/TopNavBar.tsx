"use client";

import type { User } from "@supabase/supabase-js";
import ProfileDropdown from "@/components/ProfileDropdown";

interface TopNavBarProps {
  user: User;
}

export default function TopNavBar({ user }: TopNavBarProps) {
  return (
    <header className="sticky top-0 flex justify-between items-center px-6 w-full h-12 bg-[#f9f9f9] dark:bg-zinc-950 border-b border-zinc-200/20 z-40">
      <span className="text-sm font-medium tracking-[0.2em] text-black dark:text-white font-['Inter']">WORKSPACE_CORE</span>
      <div className="flex items-center gap-6">
        <span className="font-['Inter'] font-light uppercase tracking-[0.1em] text-[0.6rem] text-zinc-400">PROJECT_ALPHA_01</span>
        <ProfileDropdown user={user}>
          <button className="text-zinc-400 hover:text-black dark:hover:text-white transition-opacity duration-150">
            <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
          </button>
        </ProfileDropdown>
      </div>
    </header>
  );
}
