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

async function uploadThumbnail(supabase: SupabaseClient, localPath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
  const ext = path.extname(localPath);
  const fileName = `${path.basename(localPath, ext)}-${hash}${ext}`;
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

export async function syncTemplates(
  supabase: SupabaseClient,
  options: { dryRun: boolean; targetSlug?: string; performedBy?: string }
): Promise<SyncSummary> {
  const { dryRun, targetSlug, performedBy } = options;
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

    // Determine thumbnail URL (local path -> storage URL)
    let thumbnailUrl = preset.thumbnailPath;
    if (preset.thumbnailPath.startsWith('public/thumbnails/')) {
      const localPath = path.join(process.cwd(), preset.thumbnailPath);
      if (fs.existsSync(localPath)) {
        if (!dryRun) {
          thumbnailUrl = await uploadThumbnail(supabase, localPath);
        } else {
          thumbnailUrl = `[will-be-uploaded]/${path.basename(localPath)}`;
        }
      }
    }

    // Guard (friction doc TODO-2): if the local thumbnail file was missing, the
    // upload never ran and `thumbnailUrl` is still the raw `public/thumbnails/…`
    // path — a non-URL. Writing that to the DB clobbers a previously-good stored
    // URL with a broken relative path (every catalog/admin thumbnail 404s). So
    // when unresolved, keep the existing row's URL (or null on a brand-new row),
    // never persist the local path.
    const thumbnailResolved = !thumbnailUrl.startsWith('public/thumbnails/');
    if (!thumbnailResolved) {
      console.warn(
        `[sync] thumbnail source missing for "${preset.slug}" (${preset.thumbnailPath}) — keeping existing thumbnail, not overwriting.`,
      );
    }
    const effectiveThumbnailUrl = thumbnailResolved
      ? thumbnailUrl
      : (existing?.thumbnail_url ?? null);

    if (!existing) {
      // NEW
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
          status: 'draft'
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

      if (changes.length > 0) {
        summary.updates++;
        summary.affectedSlugs.push(preset.slug);
        summary.details.push({ slug: preset.slug, action: 'UPDATE', changes });

        if (!dryRun) {
          await supabase
            .from('templates')
            .update({
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
