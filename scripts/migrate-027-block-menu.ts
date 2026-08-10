/**
 * Migration 027 — ADR-0016 §2–§3 vocabulary and menu model.
 *
 *   pnpm tsx --env-file=.env.local scripts/migrate-027-block-menu.ts
 *   pnpm tsx --env-file=.env.local scripts/migrate-027-block-menu.ts --apply
 */
import './lib/register-css-stub';
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'readline';
import { getAvailableTemplateKeys, loadTemplate } from '../src/templates/registry';
import { validateContent } from '../src/lib/template/validate';
import type { ContentModel } from '../src/domain/entities/template.entity';
import type { TemplateLibrary } from '../src/templates/types';
import {
  executeBlockMenuMigration,
  planBlockMenuMigration,
  type MigratedContent,
  type MigrationPayload,
  type SourceRows,
} from './lib/migrate-block-menu';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);
const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isYes = args.includes('--yes');
let writeAttempted = false;

async function confirm(): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => rl.question('Type "yes" to write: ', resolve));
  rl.close();
  return answer.trim().toLowerCase() === 'yes';
}

async function loadLibraries(): Promise<Map<string, TemplateLibrary>> {
  const libraries = new Map<string, TemplateLibrary>();
  for (const key of getAvailableTemplateKeys()) {
    const templateModule = await loadTemplate(key);
    if (templateModule) libraries.set(key, templateModule.library);
  }
  return libraries;
}

async function main() {
  console.log(`\n=== Migration 027 — Section/nav → Block/menu (${isApply ? 'APPLY' : 'DRY-RUN'}) ===\n`);
  const libraries = await loadLibraries();
  const availableTemplateKeys = getAvailableTemplateKeys();

  const [{ data: templates, error: templateError }, { data: userSites, error: siteError }] =
    await Promise.all([
      supabase.from('templates').select('id, slug, content'),
      supabase.from('user_sites').select('id, site_name, content, snapshot'),
    ]);
  if (templateError) throw new Error(`reading templates: ${templateError.message}`);
  if (siteError) throw new Error(`reading user_sites: ${siteError.message}`);

  const rows: SourceRows = {
    templates: (templates ?? []).map((row) => ({ id: row.id, slug: row.slug, content: row.content })),
    userSites: (userSites ?? []).map((row) => ({
      id: row.id,
      siteName: row.site_name ?? row.id,
      content: row.content,
      snapshot: row.snapshot,
    })),
  };
  console.log(`Read ${rows.templates.length} templates, ${rows.userSites.length} user_sites.`);

  const deps = {
    validate: (content: MigratedContent) => validateContent(content as unknown as ContentModel, {
      availableTemplateKeys,
      templateLibrary: libraries.get(content.templateKey as string),
    }).errors,
  };
  const plan = planBlockMenuMigration(rows, deps);
  const { stats } = plan;
  console.log('\n--- Reconciliation ---');
  console.log(`  rows             : templates ${stats.templateRows}, user_sites ${stats.userSiteRows}`);
  console.log(`  columns          : ${stats.columns} (changed ${stats.columnsChanged})`);
  console.log(`  sections→blocks  : ${stats.sectionsRenamed}`);
  console.log(`  shared→chrome    : ${stats.sharedRenamed}`);
  console.log(`  nav→menu         : ${stats.navConverted}`);
  console.log(`  page names added : ${stats.pageNamesAdded}`);
  console.log(`  skipped shapes   : ${stats.skippedShape}`);

  console.log('\n--- Per-column digest (sha256/16, before → after) ---');
  for (const item of plan.digests) {
    console.log(`  ${item.changed ? '~' : '='} ${item.ref}: ${item.before} → ${item.after}`);
  }

  if (!plan.ok) {
    console.error(`\n❌ ${plan.failures.length} column(s) failed validation. Nothing written.`);
    for (const failure of plan.failures) {
      console.error(`  ${failure.ref}`);
      for (const issue of failure.issues) {
        console.error(`    [${issue.code}] ${issue.message} (${issue.path ?? ''})`);
      }
    }
    process.exit(1);
  }
  console.log('\n✅ Every transformed column validates against the new libraries.');
  if (!isApply) {
    console.log('Dry-run complete — nothing written.');
    return;
  }
  if (!isYes && !(await confirm())) {
    console.log('Aborted — nothing written.');
    return;
  }

  const writer = async (payload: MigrationPayload) => {
    writeAttempted = true;
    const { data, error } = await supabase.rpc('apply_block_menu_migration', {
      p_templates: payload.templates,
      p_user_sites: payload.userSites,
    });
    if (error) throw new Error(`apply_block_menu_migration: ${error.message}`);
    console.log(`Wrote in one transaction: ${JSON.stringify(data)}`);
  };
  await executeBlockMenuMigration(rows, deps, writer);
  console.log('✅ Migration applied.');
}

main().catch((error) => {
  console.error('\n❌ Migration failed:', error);
  console.error(writeAttempted
    ? 'The RPC was issued; its transaction committed fully or rolled back fully.'
    : 'Failure occurred before the write; nothing changed.');
  process.exit(1);
});
