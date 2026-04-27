import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f9f9f9] dark:bg-[#121212] border-t border-[#eeeeee] dark:border-[#222222] flex flex-col md:flex-row justify-between items-center px-10 py-10 w-full mt-auto font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-[#777777] dark:text-[#999999]">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <span className="text-on-surface font-medium flex items-center gap-1 before:content-[''] before:w-1 before:h-1 before:bg-[#7d000c]">
          Layer0 Studio
        </span>
        <span>© 2024 LAYER0 STUDIO. ALL RIGHTS RESERVED.</span>
      </div>
      <div className="flex gap-8 mt-6 md:mt-0">
        <Link className="hover:text-[#1a1a1a] dark:hover:text-[#ffffff]" href="/legal/terms">
          Terms
        </Link>
        <Link className="hover:text-[#1a1a1a] dark:hover:text-[#ffffff]" href="/legal/privacy">
          Privacy
        </Link>
        <span className="opacity-40 cursor-not-allowed select-none" aria-disabled="true">
          Security
        </span>
        <span className="opacity-40 cursor-not-allowed select-none" aria-disabled="true">
          Status
        </span>
      </div>
    </footer>
  );
}
