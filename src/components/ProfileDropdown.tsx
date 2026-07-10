"use client";

import { useTransition } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { CircleUserRound, Loader2, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { useDictionary } from "@/lib/i18n/provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileDropdownProps {
  user: User;
  children?: React.ReactNode;
}

export default function ProfileDropdown({ user, children }: ProfileDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const t = useDictionary().dashboard.profile;

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? (
          <button type="button" className="flex items-center outline-none">
            {children}
          </button>
        ) : (
          <button
            type="button"
            aria-label={t.menuLabel}
            className="flex items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CircleUserRound className="h-6 w-6" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" />
            {t.settings}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onSelect={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isPending ? t.loggingOut : t.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
