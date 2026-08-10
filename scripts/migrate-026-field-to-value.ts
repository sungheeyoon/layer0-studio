/**
 * Migration 026 runner — convert every stored Block `fields` record from the
 * legacy `Field` object to the ADR-0016 Value, and give every array item an id.
 *
 *   pnpm tsx --env-file=.env.local scripts/migrate-026-field-to-value.ts          # dry-run
 *   pnpm tsx --env-file=.env.local scripts/migrate-026-field-to-value.ts --apply  # write (interactive)
 *   pnpm tsx --env-file=.env.local scripts/migrate-026-field-to-value.ts --apply --yes
 *
 * The transform is in `scripts/lib/migrate-field-to-value.ts` (pure, unit
 * tested); the procedure and rollback path are in
 * `docs/migrations/026_field_to_value.md`. **Read the runbook before --apply**:
 * this needs a write freeze, a backup, and a coordinated deploy.
 *
 * Order of operations (ADR-0016 §8-1) — validation comes *before* the write:
 *   1. read every row of `templates` + `user_sites`
 *   2. transform in memory
 *   3. reconcile row counts and per-column before/after digests
 *   4. validate every transformed payload against the new Template libraries
 *   5. one failure → write nothing, exit non-zero
 *   6. all clean → one RPC call → one transaction → all three columns
 *
 * Step 6 is `apply_field_value_migration` (migration 026 .sql) rather than N
 * `update()` calls: supabase-js has no transaction, and a half-written table is
 * a shape no deployed version of the code can read.
 */
import './lib/register-css-stub';
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'readline';
import { getAvailableTemplateKeys, loadTemplate } from '../src/templates/registry';
import { validateContent } from '../src/lib/template/validate';
import type { ContentModel, FieldsSchema } from '../src/domain/entities/template.entity';
import type { TemplateLibrary } from '../src/templates/types';
import {
  executeFieldValueMigration,
  planFieldValueMigration,
  type MigrationPayload,
  type SourceRows,
} from './lib/migrate-field-to-value';

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

/**
 * Set the instant before the RPC is issued. Everything up to that point is
 * read-only, so a failure carrying `false` cannot have changed the database —
 * which is what you want to know without inferring it from a stack trace.
 */
let writeAttempted = false;

async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => rl.question(question, resolve));
  rl.close();
  return answer.trim().toLowerCase() === 'yes';
}

/** Every Template library, loaded once, so the validator and `schemaFor` share them. */
async function loadLibraries(): Promise<Map<string, TemplateLibrary>> {
  const libraries = new Map<string, TemplateLibrary>();
  for (const key of getAvailableTemplateKeys()) {
    const mod = await loadTemplate(key);
    if (mod) libraries.set(key, mod.library);
  }
  return libraries;
}

async function main() {
  console.log(`\n=== Migration 026 — Field → Value (${isApply ? 'APPLY' : 'DRY-RUN'}) ===\n`);

  const libraries = await loadLibraries();
  const availableTemplateKeys = getAvailableTemplateKeys();
  console.log(`Loaded ${libraries.size} Template libraries.`);

  // ── 1. read ────────────────────────────────────────────────────────────────
  const { data: templateRows, error: templateError } = await supabase
    .from('templates')
    .select('id, slug, content');
  if (templateError) throw new Error(`reading templates: ${templateError.message}`);

  const { data: siteRows, error: siteError } = await supabase
    .from('user_sites')
    .select('id, site_name, content, snapshot');
  if (siteError) throw new Error(`reading user_sites: ${siteError.message}`);

  const rows: SourceRows = {
    templates: (templateRows ?? []).map((r) => ({ id: r.id, slug: r.slug, content: r.content })),
    userSites: (siteRows ?? []).map((r) => ({
      id: r.id,
      siteName: r.site_name,
      content: r.content,
      snapshot: r.snapshot,
    })),
  };
  console.log(`Read ${rows.templates.length} templates, ${rows.userSites.length} user_sites.\n`);

  // ── 2-5. transform, reconcile, validate ────────────────────────────────────
  const deps = {
    schemaFor: (templateKey: string, blockType: string): FieldsSchema | undefined =>
      libraries.get(templateKey)?.[blockType]?.meta.fieldsSchema,
    validate: (content: ContentModel) =>
      // Blocking errors only. A warning does not hold a save (ADR-0015 rule 4),
      // so it must not hold a migration either — it would make the whole thing
      // un-runnable over a single `INSECURE_URL` somebody pasted last year.
      validateContent(content, {
        availableTemplateKeys,
        templateLibrary: libraries.get(content?.templateKey),
      }).errors,
  };

  const writer = async (payload: MigrationPayload) => {
    writeAttempted = true;
    const { data, error } = await supabase.rpc('apply_field_value_migration', {
      p_templates: payload.templates,
      p_user_sites: payload.userSites,
    });
    if (error) throw new Error(`apply_field_value_migration: ${error.message}`);
    console.log(`\nWrote in one transaction: ${JSON.stringify(data)}`);
  };

  // A dry-run plans and reports but is structurally incapable of writing: it
  // never reaches `executeFieldValueMigration`, which is the only caller of the
  // writer.
  const plan = planFieldValueMigration(rows, deps);

  // ── report ─────────────────────────────────────────────────────────────────
  const { stats } = plan;
  console.log('--- Reconciliation ---');
  console.log(`  rows read        : templates ${stats.templateRows}, user_sites ${stats.userSiteRows}`);
  console.log(`  columns walked   : ${stats.columns}  (changed ${stats.columnsChanged})`);
  console.log(`  fields unwrapped : ${stats.fieldsUnwrapped}`);
  console.log(`  array ids minted : ${stats.idsAssigned}`);
  if (stats.skippedShape > 0) {
    console.log(`  ⚠ unrecognised shape, left untouched: ${stats.skippedShape} column(s)`);
  }

  console.log('\n--- Per-column digest (sha256/16, before → after) ---');
  for (const d of plan.digests) {
    console.log(`  ${d.changed ? '~' : '='} ${d.ref}: ${d.before} → ${d.after}`);
  }

  if (plan.notes.length > 0) {
    console.log('\n--- Notes ---');
    for (const note of plan.notes) console.log(`  · ${note}`);
  }

  if (!plan.ok) {
    console.error(`\n❌ ${plan.failures.length} column(s) failed validation. NOTHING will be written.\n`);
    for (const failure of plan.failures) {
      console.error(`  ${failure.ref}`);
      for (const issue of failure.issues) {
        console.error(`    [${issue.code}] ${issue.message} (${issue.path ?? ''})`);
      }
    }
    console.error('\nFix the transform or the source data and re-run. See the runbook.\n');
    process.exit(1);
  }

  console.log('\n✅ Every transformed column validates against its Template library.');

  if (!isApply) {
    console.log('\nDry-run — nothing written. Re-run with --apply after reading the runbook.\n');
    return;
  }

  if (!isYes) {
    console.log('\n⚠️  This overwrites templates.content, user_sites.content and user_sites.snapshot.');
    console.log('   The runbook requires a write freeze and a pg_dump backup FIRST.');
    console.log('   Rollback is restore-from-backup — there is no reverse transform.');
    const proceed = await confirm('\n   Type "yes" to write: ');
    if (!proceed) {
      console.log('\nAborted — nothing written.\n');
      return;
    }
  }

  // ── 6. write ───────────────────────────────────────────────────────────────
  const { written } = await executeFieldValueMigration(rows, deps, writer);
  console.log(written ? '\n✅ Migration applied.\n' : '\n❌ Not written.\n');
  if (!written) process.exit(1);
}

main().catch((err) => {
  console.error('\n❌ Migration failed:\n', err);
  console.error(
    writeAttempted
      ? '\n⚠ The write RPC had been issued. It is one transaction, so it either fully committed\n' +
          '  or fully rolled back — check `templates.content` on any row before re-running.\n'
      : '\n✔ The failure is before the write. Nothing was changed.\n',
  );
  process.exit(1);
});
