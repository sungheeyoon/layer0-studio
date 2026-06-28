import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { syncTemplates } from '@/lib/template/sync';
import { SITE_URL } from '@/lib/seo/base-url';

/**
 * Template registration endpoint (ADR-0012).
 *
 * Invoked AFTER a successful production deploy (Vercel "deployment succeeded"
 * webhook / post-deploy CI step) to register code presets into the `templates`
 * catalog. Runs `syncTemplates --apply`, so by the time it fires the renderer
 * code is already live (avoids the "row exists but renderer not deployed"
 * crash). Auth is a dedicated Bearer secret — separate from `CRON_SECRET` so a
 * leaked cron token can't write the catalog (ADR-0012 §3 key separation).
 *
 * Idempotent: re-running re-applies any code↔DB diff and is safe to retry.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  if (!process.env.TEMPLATE_SYNC_SECRET) {
    console.error('[Template Sync] TEMPLATE_SYNC_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  if (req.headers.get('Authorization') !== `Bearer ${process.env.TEMPLATE_SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createAdminClient();

  try {
    const summary = await syncTemplates(supabase, {
      dryRun: false,
      performedBy: 'deploy-webhook',
      // Committed thumbnails ship as static assets served at the production
      // origin (`<SITE_URL>/thumbnails/<file>`); fetch them from there since
      // `public/` is not reliably on the serverless function filesystem.
      thumbnailBaseUrl: SITE_URL,
    });

    console.log(
      `[Template Sync] done — creates:${summary.creates} updates:${summary.updates} errors:${summary.errors}`,
    );

    // A non-zero `errors` (e.g. a CREATE blocked by the thumbnail guard) is
    // surfaced as 422 so the webhook log flags it — without failing the deploy.
    const status = summary.errors > 0 ? 422 : 200;
    return NextResponse.json(
      {
        creates: summary.creates,
        updates: summary.updates,
        noChange: summary.noChange,
        errors: summary.errors,
        affectedSlugs: summary.affectedSlugs,
        details: summary.details,
      },
      { status },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Template Sync] failed:', message);
    return NextResponse.json({ error: 'Sync failed', details: message }, { status: 500 });
  }
}
