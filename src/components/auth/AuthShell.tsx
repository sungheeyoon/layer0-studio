import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function BrandMark() {
  return (
    <Link href="/" className="flex items-center justify-center gap-2">
      <span className="h-2 w-2 rounded-full bg-primary" />
      <span className="text-title font-semibold tracking-tight">Layer0 Studio</span>
    </Link>
  );
}

/**
 * Shared chrome for the auth surface (ADR-0011): a centered, conventional card.
 * Replaces the per-page blueprint-grid / ghost-"L0" / techno-metadata layouts.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <BrandMark />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-title">{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        {footer && (
          <div className="mt-6 text-center text-caption text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Centered status panel for terminal auth states (signup sent, link expired, …):
 * an icon badge, title, message, and a single action.
 */
export function AuthStatus({
  icon,
  title,
  children,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <h1 className="text-title mb-3">{title}</h1>
        <div className="mb-8 text-body text-muted-foreground">{children}</div>
        {action}
      </div>
    </main>
  );
}
