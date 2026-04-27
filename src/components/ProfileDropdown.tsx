"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

interface ProfileDropdownProps {
  user: User;
  children?: React.ReactNode;
}

export default function ProfileDropdown({ user, children }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex items-center">
        {children || (
          <span
            className="material-symbols-outlined text-zinc-500 dark:text-zinc-500 active:opacity-80 transition-opacity"
            data-icon="account_circle"
          >
            account_circle
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-10 right-0 w-64 bg-surface-container-lowest border border-primary z-[60] shadow-none bg-white dark:bg-zinc-950">
          {/* Dropdown Header */}
          <div className="p-4 border-b border-outline-variant/30">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-medium tracking-[0.1em] text-outline uppercase">Active_Session</span>
              <div className="w-1 h-1 bg-[#7d000c]"></div> {/* Technical Pixel Dot */}
            </div>
            <p className="text-xs font-light tracking-wider mt-1 text-black dark:text-white truncate">
              {user.email}
            </p>
          </div>
          {/* Dropdown Links */}
          <ul className="py-2">
            <li>
              <Link className="flex items-center px-4 py-3 gap-3 font-['Inter'] font-light tracking-[0.1em] uppercase text-[11px] text-primary dark:text-white hover:bg-surface-container transition-colors duration-75" href="#">
                <span className="material-symbols-outlined text-sm">person</span>
                USER_PROFILE
              </Link>
            </li>
            <li>
              <Link className="flex items-center px-4 py-3 gap-3 font-['Inter'] font-light tracking-[0.1em] uppercase text-[11px] text-primary dark:text-white hover:bg-surface-container transition-colors duration-75" href="#">
                <span className="material-symbols-outlined text-sm">encrypted</span>
                SECURITY_SETTINGS
              </Link>
            </li>
            <li>
              <Link className="flex items-center px-4 py-3 gap-3 font-['Inter'] font-light tracking-[0.1em] uppercase text-[11px] text-primary dark:text-white hover:bg-surface-container transition-colors duration-75" href="#">
                <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                BILLING_PROTOCOL
              </Link>
            </li>
            <li className="mt-2 border-t border-outline-variant/20">
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="w-full flex items-center justify-between px-4 py-4 font-['Inter'] font-medium tracking-[0.1em] uppercase text-[11px] text-[#7d000c] hover:bg-[#7d000c]/5 transition-colors duration-75 text-left disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-3">
                  {isPending ? (
                    <span className="w-[12px] h-[12px] border border-[#7d000c] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">power_settings_new</span>
                  )}
                  {isPending ? "TERMINATING..." : "TERMINATE_SESSION"}
                </span>
                <div className="w-[4px] h-[4px] bg-[#7d000c]"></div>
              </button>
            </li>
          </ul>
          {/* Dropdown Footer Metadata */}
          <div className="bg-[#f3f3f3] dark:bg-zinc-900 p-4 flex flex-col gap-1 border-t border-outline-variant/30">
            <div className="flex justify-between text-[9px] font-medium tracking-widest text-[#777777] uppercase">
              <span>LAST_LOGIN</span>
              <span>RECENT_SYS_CHECK</span>
            </div>
            <div className="flex justify-between text-[9px] font-medium tracking-widest text-[#777777] uppercase">
              <span>NODE_ID</span>
              <span>L0-SERVER</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
