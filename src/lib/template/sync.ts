import { SupabaseClient } from '@supabase/supabase-js';
import { presetMap, templateMap, getAvailableTemplateKeys, templateCategories } from '@/templates/_generated';
import { validateTemplateJson } from './validate';
import type { TemplatePreset } from '@/templates/types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SyncResult {
  slug: string;
  action: 'CREATE' | 'UPDATE' | 'NO_CHANGE' | 'ERROR';
  changes?: string[];
  errors?: string[];
}

export interface SyncSummary {
  creates: number;
  updates: number;
  noChange: number;
  errors: number;
  affectedSlugs: string[];
  details: SyncResult[];
}

async function uploadThumbnail(
  supabase: SupabaseClient,
  fileBuffer: Buffer,
  sourceName: string,
): Promise<string> {
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
  const ext = path.extname(sourceName);
  const fileName = `${path.basename(sourceName, ext)}-${hash}${ext}`;
  const storagePath = `thumbnails/${fileName}`;

  // Check if file already exists in storage
  const { data: existingFiles } = await supabase.storage
    .from('template-thumbnails')
    .list('thumbnails', { search: fileName });

  if (existingFiles && existingFiles.length > 0) {
    // Already exists
    const { data } = supabase.storage.from('template-thumbnails').getPublicUrl(storagePath);
    return data.publicUrl;
  }

  // Upload
  const { error: uploadError } = await supabase.storage
    .from('template-thumbnails')
    .upload(storagePath, fileBuffer, {
      contentType: ext === '.webp' ? 'image/webp' : 'image/png',
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('template-thumbnails').getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Resolve a preset's thumbnail into a stored bucket URL.
 *
 * The thumbnail bytes come from one of two sources (ADR-0012 §썸네일 흐름):
 *   - `thumbnailBaseUrl` set (post-deploy registrar, serverless runtime) → fetch
 *     the committed webp from the just-deployed site's public CDN
 *     (`<baseUrl>/thumbnails/<file>`), because `public/` files are not reliably
 *     on the function filesystem.
 *   - otherwise (local CLI) → read `public/thumbnails/<file>` from disk.
 *
 * Returns `{ resolved:false }` when the source can't be found — the caller then
 * keeps the existing row's URL (UPDATE) or refuses the registration (CREATE).
 */
async function resolveThumbnail(
  supabase: SupabaseClient,
  preset: TemplatePreset,
  opts: { dryRun: boolean; thumbnailBaseUrl?: string },
): Promise<{ resolved: boolean; url: string | null }> {
  // Preset already carries an absolute URL — use verbatim.
  if (!preset.thumbnailPath.startsWith('public/thumbnails/')) {
    return { resolved: true, url: preset.thumbnailPath };
  }

  const basename = path.basename(preset.thumbnailPath);

  let buffer: Buffer | null = null;
  if (opts.thumbnailBaseUrl) {
    const url = `${opts.thumbnailBaseUrl.replace(/\/$/, '')}/thumbnails/${basename}`;
    try {
      const res = await fetch(url);
      if (res.ok) buffer = Buffer.from(await res.arrayBuffer());
    } catch {
      // network error / unreachable → treated as unresolved below
    }
  } else {
    const localPath = path.join(process.cwd(), preset.thumbnailPath);
    if (fs.existsSync(localPath)) buffer = fs.readFileSync(localPath);
  }

  if (!buffer) return { resolved: false, url: null };
  if (opts.dryRun) return { resolved: true, url: `[will-be-uploaded]/${basename}` };

  const uploadedUrl = await uploadThumbnail(supabase, buffer, basename);
  return { resolved: true, url: uploadedUrl };
}

export async function syncTemplates(
  supabase: SupabaseClient,
  options: { dryRun: boolean; targetSlug?: string; performedBy?: string; thumbnailBaseUrl?: string }
): Promise<SyncSummary> {
  const { dryRun, targetSlug, performedBy, thumbnailBaseUrl } = options;
  const summary: SyncSummary = {
    creates: 0,
    updates: 0,
    noChange: 0,
    errors: 0,
    affectedSlugs: [],
    details: []
  };

  // Each entry: { templateKey, preset } — templateKey comes from presetMap iteration key
  // (post-β: templateMap and presetMap share keys, so templateKey identifies both).
  const entries: Array<{ templateKey: string; preset: TemplatePreset }> = [];

  for (const templateKey of Object.keys(presetMap)) {
    const preset = (await presetMap[templateKey]()).default;
    if (targetSlug && preset.slug !== targetSlug && !templateKey.startsWith(targetSlug)) continue;
    entries.push({ templateKey, preset });
  }

  if (entries.length === 0) return summary;

  // Pre-fetch existing templates
  const { data: existingTemplates, error: fetchError } = await supabase
    .from('templates')
    .select('*')
    .in('slug', entries.map(e => e.preset.slug));

  if (fetchError) throw fetchError;

  const existingMap = new Map(existingTemplates?.map(t => [t.slug, t]));

  for (const { templateKey, preset } of entries) {
    // templateKey known from presetMap iteration; category derived from codegen layout.
    const category = templateCategories[templateKey];
    if (!category) {
      summary.errors++;
      summary.details.push({ slug: preset.slug, action: 'ERROR', errors: [`No category derivable for templateKey ${templateKey}`] });
      continue;
    }

    const templateModuleLoader = templateMap[templateKey];
    const templateModule = templateModuleLoader ? await templateModuleLoader() : null;

    // 2. The Preset carries the full templateJson verbatim (code is source of truth).
    const effectiveTemplateJson = preset.templateJson;

    // 3. Validate
    const validation = validateTemplateJson(effectiveTemplateJson, {
      availableTemplateKeys: getAvailableTemplateKeys(),
      templateLibrary: templateModule?.library
    });
    if (validation.errors.length > 0) {
      summary.errors++;
      summary.details.push({
        slug: preset.slug,
        action: 'ERROR',
        errors: validation.errors.map(e => `[${e.code}] ${e.message} (${e.path})`)
      });
      continue;
    }

    const existing = existingMap.get(preset.slug);

    // Resolve thumbnail bytes → bucket URL (ADR-0012). Guard (friction doc
    // TODO-2): on an UPDATE miss, keep the existing row's URL rather than
    // clobbering it with a non-URL / null.
    const thumb = await resolveThumbnail(supabase, preset, { dryRun, thumbnailBaseUrl });
    if (!thumb.resolved) {
      console.warn(
        `[sync] thumbnail source missing for "${preset.slug}" (${preset.thumbnailPath}) — keeping existing thumbnail, not overwriting.`,
      );
    }
    const effectiveThumbnailUrl = thumb.resolved
      ? thumb.url
      : (existing?.thumbnail_url ?? null);

    if (!existing) {
      // NEW
      // CREATE thumbnail-required guard (ADR-0012 §6): a new row registers as
      // `active` and is therefore user-visible immediately, so we refuse to
      // publish a thumbnail-less catalog card. (UPDATE keeps the existing one.)
      if (!thumb.resolved) {
        summary.errors++;
        summary.details.push({
          slug: preset.slug,
          action: 'ERROR',
          errors: [
            `thumbnail source missing for new template "${preset.slug}" (${preset.thumbnailPath}) — refusing to register a thumbnail-less template`,
          ],
        });
        continue;
      }

      summary.creates++;
      summary.affectedSlugs.push(preset.slug);
      summary.details.push({ slug: preset.slug, action: 'CREATE' });

      if (!dryRun) {
        await supabase.from('templates').insert({
          slug: preset.slug,
          name: preset.defaults.name,
          description: preset.defaults.description,
          category,
          template_json: effectiveTemplateJson,
          version: preset.version,
          thumbnail_url: effectiveThumbnailUrl,
          status: 'active'
        });
      }
    } else {
      // UPDATE?
      const changes: string[] = [];

      // Compare templateJson
      if (JSON.stringify(existing.template_json) !== JSON.stringify(effectiveTemplateJson)) {
        changes.push('templateJson changed');
      }

      if (existing.version !== preset.version) {
        changes.push(`version: ${existing.version} -> ${preset.version}`);
      }

      if (existing.thumbnail_url !== effectiveThumbnailUrl) {
        changes.push(`thumbnail: ${existing.thumbnail_url} -> ${effectiveThumbnailUrl}`);
      }

      // Category is derived from the directory layout (code = source of truth).
      // It used to be set only on INSERT, so a slug renamed in code never
      // reached existing rows — reconcile it on UPDATE too.
      if (existing.category !== category) {
        changes.push(`category: ${existing.category} -> ${category}`);
      }

      if (changes.length > 0) {
        summary.updates++;
        summary.affectedSlugs.push(preset.slug);
        summary.details.push({ slug: preset.slug, action: 'UPDATE', changes });

        if (!dryRun) {
          await supabase
            .from('templates')
            .update({
              category,
              template_json: effectiveTemplateJson,
              version: preset.version,
              thumbnail_url: effectiveThumbnailUrl,
              updated_at: new Date().toISOString()
            })
            .eq('slug', preset.slug);
        }
      } else {
        summary.noChange++;
        summary.details.push({ slug: preset.slug, action: 'NO_CHANGE' });
      }
    }
  }

  // Record audit log if not dry run
  if (!dryRun && summary.affectedSlugs.length > 0) {
    await supabase.from('template_sync_audit').insert({
      performed_by: performedBy,
      affected_slugs: summary.affectedSlugs,
      dry_run: false,
      summary: {
        creates: summary.creates,
        updates: summary.updates,
        errors: summary.errors,
        details: summary.details
      }
    });
  }

  return summary;
}
