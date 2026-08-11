import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import ProfileDropdown from "./ProfileDropdown";
import { LocaleToggle } from "./LocaleToggle";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Messages } from "@/lib/i18n/messages/ko";

interface NavbarProps {
  user: User | null;
  copy: Messages["nav"];
}

export default function Navbar({ user, copy }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6 md:px-10">
      <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-lg font-semibold tracking-tight sm:text-xl">
          Layer0 Studio
        </span>
      </Link>

      <div className="hidden items-center gap-8 text-sm lg:flex">
        <Link
          href="/templates"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {copy.templates}
        </Link>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <LocaleToggle className="flex gap-1" />
        <ThemeToggle />
        <Separator orientation="vertical" className="h-5" />
        {user ? (
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">{copy.dashboard}</Link>
            </Button>
            <ProfileDropdown user={user} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{copy.signIn}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">{copy.getStarted}</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 lg:hidden">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-lg" aria-label={copy.menu}>
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuItem asChild className="min-h-11">
              <Link href="/templates">{copy.templates}</Link>
            </DropdownMenuItem>
            {user ? (
              <DropdownMenuItem asChild className="min-h-11">
                <Link href="/dashboard">{copy.dashboard}</Link>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem asChild className="min-h-11">
                  <Link href="/login">{copy.signIn}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="min-h-11 font-medium text-primary">
                  <Link href="/signup">{copy.getStarted}</Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <div className="flex min-h-11 items-center justify-between px-2">
              <span className="text-caption text-muted-foreground">Language</span>
              <LocaleToggle className="flex gap-1" />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {user && <ProfileDropdown user={user} />}
      </div>
    </nav>
  );
}
