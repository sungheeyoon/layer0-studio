import Link from "next/link";

export default function Navbar() {
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
        <button className="text-[#777777] hover:text-[#1a1a1a]">Sign In</button>
        <button className="bg-primary text-on-primary px-6 py-2">Get Started</button>
      </div>
    </nav>
  );
}
