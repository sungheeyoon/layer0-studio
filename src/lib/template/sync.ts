import { SupabaseClient } from '@supabase/supabase-js';
import { presetMap } from '@/themes/_generated';
import { validateTemplateJson } from './validate';
import type { TemplatePreset } from '@/themes/types';

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

export async function syncTemplates(
  supabase: SupabaseClient,
  options: { dryRun: boolean; targetSlug?: string }
): Promise<SyncSummary> {
  const { dryRun, targetSlug } = options;
  const summary: SyncSummary = {
    creates: 0,
    updates: 0,
    noChange: 0,
    errors: 0,
    affectedSlugs: [],
    details: []
  };

  const presetKeys = Object.keys(presetMap);
  const presets: TemplatePreset[] = [];

  for (const key of presetKeys) {
    const preset = (await presetMap[key]()).default;
    if (targetSlug && preset.slug !== targetSlug && !key.startsWith(targetSlug)) continue;
    presets.push(preset);
  }

  if (presets.length === 0) return summary;

  // Pre-fetch existing templates
  const { data: existingTemplates, error: fetchError } = await supabase
    .from('templates')
    .select('*')
    .in('slug', presets.map(p => p.slug));

  if (fetchError) throw fetchError;

  const existingMap = new Map(existingTemplates?.map(t => [t.slug, t]));

  for (const preset of presets) {
    // 1. Validate
    const validation = validateTemplateJson(preset.templateJson);
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
          category: preset.defaults.category,
          template_json: preset.templateJson,
          version: preset.version,
          thumbnail_url: preset.thumbnailPath,
          status: 'draft'
        });
      }
    } else {
      // UPDATE?
      const changes: string[] = [];
      
      // Compare templateJson
      if (JSON.stringify(existing.template_json) !== JSON.stringify(preset.templateJson)) {
        changes.push('templateJson changed');
        // Note: For API, we might want more granular diffs, but for now let's keep it simple.
      }
      
      if (existing.version !== preset.version) {
        changes.push(`version: ${existing.version} -> ${preset.version}`);
      }
      
      if (existing.thumbnail_url !== preset.thumbnailPath) {
        changes.push(`thumbnail: ${existing.thumbnail_url} -> ${preset.thumbnailPath}`);
      }

      if (changes.length > 0) {
        summary.updates++;
        summary.affectedSlugs.push(preset.slug);
        summary.details.push({ slug: preset.slug, action: 'UPDATE', changes });

        if (!dryRun) {
          await supabase
            .from('templates')
            .update({
              template_json: preset.templateJson,
              version: preset.version,
              thumbnail_url: preset.thumbnailPath,
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
