import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import ProfileDropdown from "./ProfileDropdown";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 w-full h-16 px-10 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#121212] border-b border-[#eeeeee] dark:border-[#222222] z-50">
      <div className="font-['Inter'] font-medium text-sm tracking-[0.1em] uppercase text-[#1a1a1a] dark:text-[#eeeeee] flex items-center gap-1 before:content-[''] before:w-1 before:h-1 before:bg-[#7d000c]">
        Layer0 Studio
      </div>
      <div className="hidden md:flex gap-10 font-['Inter'] font-light tracking-[0.05em] uppercase text-[0.6875rem]">
        <Link
          className="text-[#1a1a1a] dark:text-[#ffffff] border-b border-[#1a1a1a] dark:border-[#ffffff] pb-1 hover:text-[#1a1a1a] dark:hover:text-[#ffffff] transition-colors duration-150"
          href="#"
        >
          Features
        </Link>
        <Link
          className="text-[#777777] dark:text-[#999999] hover:text-[#1a1a1a] dark:hover:text-[#ffffff] transition-colors duration-150"
          href="#"
        >
          Solutions
        </Link>
        <Link
          className="text-[#777777] dark:text-[#999999] hover:text-[#1a1a1a] dark:hover:text-[#ffffff] transition-colors duration-150"
          href="#"
        >
          Pricing
        </Link>
        <Link
          className="text-[#777777] dark:text-[#999999] hover:text-[#1a1a1a] dark:hover:text-[#ffffff] transition-colors duration-150"
          href="#"
        >
          Docs
        </Link>
      </div>
      <div className="flex items-center gap-6 font-['Inter'] font-light tracking-[0.05em] uppercase text-[0.6875rem]">
        {user ? (
          <div className="flex items-center gap-6">
            <Link 
              className="flex items-center gap-2 group cursor-pointer"
              href="/templates"
            >
              <span className="w-[4px] h-[4px] bg-zinc-300 group-hover:bg-primary transition-colors"></span>
              <span className="font-sans font-light tracking-[0.1em] text-[11px] uppercase text-zinc-500 group-hover:text-zinc-900 transition-colors">GO_TO_DASHBOARD</span>
            </Link>
            <ProfileDropdown user={user} />
          </div>
        ) : (
          <>
            <Link className="text-[#777777] hover:text-[#1a1a1a]" href="/login">Sign In</Link>
            <Link className="bg-primary text-on-primary px-6 py-2" href="/signup">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
