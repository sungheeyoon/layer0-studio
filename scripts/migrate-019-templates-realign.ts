/**
 * Migration 019 — realign the `templates` table to the ADR-0007 union and
 * finish the slug realignment (015–017).
 *
 * Background: the `templates` table holds two rows per templateKey — a curated
 * **active** row with a legacy brand slug (`mono-cafe`, …) that `user_sites` FK
 * to, and a sync-created **draft** duplicate with the preset slug
 * (`cafe-default`, …). All rows are still in the pre-#37 `{ pages:[home] }`
 * shape, so the deployed (`mode`-branched) catalog renders them blank.
 *
 * This makes `slug == templateKey`, one row per template, in the new shape:
 *   - Canonical row = the active row (preferred; keeps id/name/status/thumbnail
 *     and the user_sites FK), else the lone draft (cafe-cozy / cafe-modern).
 *   - Canonical: slug → templateKey, template_json → code preset (source of
 *     truth, ADR-0002), version → code preset version.
 *   - Duplicate draft rows → deleted (guarded: skipped if any user_sites FK
 *     references them). Deletes run before renames to free the unique slug.
 *
 * After this, plain `pnpm template:sync` becomes the canonical mechanism again.
 * Status is left untouched (cafe-cozy / cafe-modern stay draft — publishing is a
 * product decision). Dry-run by default; `--apply` to write, `--yes` to skip the
 * countdown. See docs/migrations/019_templates_realign_to_union.md.
 */
import { createClient } from '@supabase/supabase-js';
import { presetMap, presetSlugs } from '../src/templates/_generated';
import { isSingleContent, type ContentModel } from '../src/domain/entities/template.entity';
import { validateContent } from '../src/lib/template/validate';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isYes = args.includes('--yes');

interface PresetInfo {
  slug: string;
  version: string;
  content: ContentModel;
}
interface TemplateRow {
  id: string;
  slug: string;
  status: string;
  name: string;
  version: string | null;
  template_json: { templateKey?: string } | null;
}

async function buildPresets(): Promise<Map<string, PresetInfo>> {
  const presets = new Map<string, PresetInfo>();
  for (const tk of presetSlugs) {
    const { default: p } = await presetMap[tk]();
    presets.set(tk, { slug: p.slug, version: p.version, content: p.content });
  }
  return presets;
}

async function countdown(seconds: number) {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r⚠️  Applying changes in ${i}s... (Ctrl+C to cancel) `);
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log('\r🚀 Applying changes now...                            ');
}

async function run() {
  console.log('🚀 Migration 019 — templates realign to union (slug == templateKey)');
  console.log(`Mode: ${isApply ? (isYes ? 'APPLY (direct)' : 'APPLY (interactive)') : 'DRY-RUN (preview)'}\n`);

  const presets = await buildPresets();
  const availableTemplateKeys = [...presets.keys()];

  const { data: rowData, error } = await supabase
    .from('templates')
    .select('id, slug, status, name, version, template_json');
  if (error) {
    console.error('Failed to read templates:', error.message);
    process.exit(1);
  }
  const rows = (rowData ?? []) as TemplateRow[];

  const { data: siteData, error: siteErr } = await supabase
    .from('user_sites')
    .select('template_id');
  if (siteErr) {
    console.error('Failed to read user_sites:', siteErr.message);
    process.exit(1);
  }
  const referenced = new Set((siteData ?? []).map((s: { template_id: string | null }) => s.template_id));

  // Group rows by templateKey.
  const groups = new Map<string, TemplateRow[]>();
  for (const r of rows) {
    const tk = r.template_json?.templateKey ?? '(none)';
    (groups.get(tk) ?? groups.set(tk, []).get(tk)!).push(r);
  }

  const warnings: string[] = [];
  const updates: Array<{ id: string; fromSlug: string; toSlug: string; version: string; content: ContentModel; name: string; status: string }> = [];
  const deletes: Array<{ id: string; slug: string }> = [];

  for (const [tk, preset] of presets) {
    const group = groups.get(tk) ?? [];
    if (group.length === 0) {
      warnings.push(`no DB row found for templateKey "${tk}" — skipped`);
      continue;
    }
    const actives = group.filter((r) => r.status === 'active');
    if (actives.length > 1) {
      warnings.push(`templateKey "${tk}" has ${actives.length} active rows (${actives.map((a) => a.slug).join(', ')}); using "${actives[0].slug}"`);
    }
    const canonical = actives[0] ?? group[0];

    // Validate the code preset before planning a write.
    const res = validateContent(preset.content, { availableTemplateKeys });
    if (res.errors.length > 0) {
      warnings.push(`validation errors for "${tk}" preset — skipped: ${res.errors.map((e) => e.code).join(', ')}`);
      continue;
    }

    updates.push({
      id: canonical.id,
      fromSlug: canonical.slug,
      toSlug: preset.slug,
      version: preset.version,
      content: preset.content,
      name: canonical.name,
      status: canonical.status,
    });

    for (const r of group) {
      if (r.id === canonical.id) continue;
      if (referenced.has(r.id)) {
        warnings.push(`NOT deleting duplicate "${r.slug}" (${tk}) — referenced by user_sites`);
        continue;
      }
      deletes.push({ id: r.id, slug: r.slug });
    }
  }

  // Orphan rows whose templateKey is not in code.
  for (const tk of groups.keys()) {
    if (!presets.has(tk)) warnings.push(`orphan templateKey "${tk}" not in code registry — left untouched`);
  }

  console.log('=== DELETE (duplicate draft rows) ===');
  deletes.forEach((d) => console.log(`  🗑  ${d.slug}`));
  console.log(`\n=== UPDATE (canonical rows → slug==templateKey, new shape) ===`);
  for (const u of updates) {
    const mode = isSingleContent(u.content) ? 'single' : 'multi';
    const rename = u.fromSlug === u.toSlug ? u.toSlug : `${u.fromSlug} → ${u.toSlug}`;
    console.log(`  ✏️  [${u.status}] ${rename}  (v${u.version}, ${mode}, "${u.name}")`);
  }
  if (warnings.length) {
    console.log('\n=== WARNINGS ===');
    warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
  }
  console.log(`\nSummary: update=${updates.length}  delete=${deletes.length}  warnings=${warnings.length}`);

  if (!isApply) {
    console.log('\nDRY-RUN complete. Re-run with --apply to write. Back up templates first.');
    return;
  }
  if (!isYes) await countdown(5);

  let del = 0;
  for (const d of deletes) {
    const { error: e } = await supabase.from('templates').delete().eq('id', d.id);
    if (e) console.error(`  ✗ delete ${d.slug}: ${e.message}`);
    else del++;
  }
  let upd = 0;
  for (const u of updates) {
    const { error: e } = await supabase
      .from('templates')
      .update({ slug: u.toSlug, version: u.version, template_json: u.content, updated_at: new Date().toISOString() })
      .eq('id', u.id);
    if (e) console.error(`  ✗ update ${u.toSlug}: ${e.message}`);
    else upd++;
  }
  console.log(`\n✅ Deleted ${del}/${deletes.length}, updated ${upd}/${updates.length} row(s).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
