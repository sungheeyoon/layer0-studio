import { Loader2 } from 'lucide-react';

/**
 * Scoped replacement for the old root `loading.tsx`. This fallback used to sit
 * at `src/app/`, where it wrapped *every* route in a Suspense boundary — which
 * meant the public Site and Preview routes started streaming on their first
 * `await` and could no longer set a 404 status (see the comment in
 * `src/app/site/[domain]/[[...slug]]/page.tsx`).
 *
 * Safe here: this catalog is a fixed route that never calls `notFound()`, so a
 * 200 is always the honest status, and it does fetch templates on every request.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
