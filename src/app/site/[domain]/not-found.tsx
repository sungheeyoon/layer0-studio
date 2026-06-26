import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SiteNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-semibold tracking-tight">404</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          This site doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Go to Layer0 Studio</Link>
        </Button>
      </div>
    </div>
  );
}
