import { Loader2 } from 'lucide-react';

/**
 * Scoped replacement for the old root `loading.tsx` — the editor loads a Site
 * over the network before it can render anything, and the sibling dashboard
 * pages under `(with-sidebar)` already keep their own fallbacks.
 *
 * Safe here: the editor never calls `notFound()` (a missing Site renders inline
 * copy inside the page) and has no SEO stake, so streaming costs it nothing.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
