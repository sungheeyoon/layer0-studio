/**
 * Migration 018 runner — convert existing Single `user_sites` rows to the new
 * `{ mode:'single', sections }` union (ADR-0007). Dry-run by default; pass
 * `--apply` to write (`--yes` to skip the countdown). See the transform in
 * `scripts/lib/migrate-single-site.ts` and the doc at
 * `docs/migrations/018_single_site_type.md`.
 *
 *   pnpm tsx scripts/migrate-018-single-site-type.ts            # dry-run
 *   pnpm tsx scripts/migrate-018-single-site-type.ts --apply    # write (interactive)
 *   pnpm tsx scripts/migrate-018-single-site-type.ts --apply --yes
 *
 * Code is the source of truth for the per-section nav (ADR-0002): the
 * authoritative `nav:{visible,label}` is read from the template presets, so this
 * runner does NOT depend on `template:sync` having run first.
 */
import { createClient } from '@supabase/supabase-js';
import { presetMap, presetSlugs } from '../src/templates/_generated';
import { isSingleContent, NavMeta } from '../src/domain/entities/template.entity';
import {
  migrateSingleSiteJson,
  type SeedNavMap,
  type MigrateStatus,
} from './lib/migrate-single-site';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isYes = args.includes('--yes');

/** Build templateKey → (sectionId → NavMeta) from the authoritative code seeds. */
async function buildSeedNavMap(): Promise<SeedNavMap> {
  const map: SeedNavMap = new Map();
  for (const slug of presetSlugs) {
    const { default: preset } = await presetMap[slug]();
    const tj = preset.content;
    if (!isSingleContent(tj)) continue; // Multi seeds have no single sections
    const byId = new Map<string, NavMeta>();
    for (const s of tj.sections) {
      byId.set(s.id, { visible: s.nav.visible, label: s.nav.label });
    }
    map.set(tj.templateKey, byId);
  }
  return map;
}

async function countdown(seconds: number) {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r⚠️  Applying changes in ${i}s... (Ctrl+C to cancel) `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log('\r🚀 Applying changes now...                            ');
}

interface UserSiteRow {
  id: string;
  site_name: string | null;
  site_json: unknown;
  template_snapshot: unknown;
}

async function run() {
  console.log('🚀 Migration 018 — Single Site Type (pages → mode:single)');
  console.log(`Mode: ${isApply ? (isYes ? 'APPLY (direct)' : 'APPLY (interactive)') : 'DRY-RUN (preview)'}\n`);

  const seedNav = await buildSeedNavMap();

  const { data, error } = await supabase
    .from('user_sites')
    .select('id, site_name, site_json, template_snapshot');

  if (error) {
    console.error('Failed to read user_sites:', error.message);
    process.exit(1);
  }

  const rows = (data ?? []) as UserSiteRow[];
  console.log(`Found ${rows.length} user_sites row(s).\n`);

  const tally: Record<MigrateStatus, number> = {
    migrated: 0,
    'skipped-already': 0,
    'skipped-shape': 0,
  };
  const updates: Array<{ id: string; site_json: unknown; template_snapshot: unknown }> = [];

  for (const row of rows) {
    const site = migrateSingleSiteJson(row.site_json, seedNav);
    const snap = migrateSingleSiteJson(row.template_snapshot, seedNav);

    // Row status is driven by site_json (snapshot follows the same shape).
    tally[site.status]++;

    const label = row.site_name || row.id;
    const allNotes = [
      ...site.notes.map((n) => `site_json: ${n}`),
      ...snap.notes.map((n) => `template_snapshot: ${n}`),
    ];

    if (site.status === 'migrated' || snap.status === 'migrated') {
      const beforeSections = sectionCount(row.site_json);
      const afterSections = isSingleContent(site.json as never)
        ? (site.json as { sections: unknown[] }).sections.length
        : 0;
      console.log(
        `  ✏️  ${label}  [${site.status}]  sections ${beforeSections} → ${afterSections}`,
      );
      allNotes.forEach((n) => console.log(`        - ${n}`));
      updates.push({
        id: row.id,
        site_json: site.json,
        template_snapshot: snap.json,
      });
    } else {
      console.log(`  ⏭️  ${label}  [${site.status}]`);
      allNotes.forEach((n) => console.log(`        - ${n}`));
    }
  }

  console.log(
    `\nSummary: migrated=${tally.migrated}  already=${tally['skipped-already']}  unrecognised=${tally['skipped-shape']}`,
  );

  if (!isApply) {
    console.log('\nDRY-RUN complete. Re-run with --apply to write. Back up user_sites first.');
    return;
  }

  if (updates.length === 0) {
    console.log('\nNothing to apply.');
    return;
  }

  if (!isYes) await countdown(5);

  let written = 0;
  for (const u of updates) {
    const { error: upErr } = await supabase
      .from('user_sites')
      .update({ site_json: u.site_json, template_snapshot: u.template_snapshot })
      .eq('id', u.id);
    if (upErr) {
      console.error(`  ✗ ${u.id}: ${upErr.message}`);
    } else {
      written++;
    }
  }
  console.log(`\n✅ Applied ${written}/${updates.length} row(s).`);
}

function sectionCount(json: unknown): number {
  if (json && typeof json === 'object') {
    const j = json as { pages?: Array<{ sections?: unknown[] }>; sections?: unknown[] };
    if (Array.isArray(j.sections)) return j.sections.length;
    if (Array.isArray(j.pages) && j.pages[0]?.sections) return j.pages[0].sections!.length;
  }
  return 0;
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
