/**
 * template:delete — the reverse of `new-template` / `template:sync`.
 *
 * Cleans up everything a Template owns (DB row, `template_assets`,
 * `template-thumbnails`, public webp, `_generated.ts`) by templateKey. The
 * source dir is left for `git rm` (the `delete-template` skill, or you). Mirrors
 * the sync CLI UX: dry-run by default, `--apply` to commit.
 *
 * Usage:
 *   pnpm template:delete <templateKey>            # dry-run (default)
 *   pnpm template:delete <templateKey> --apply    # actually delete
 *   pnpm template:delete <templateKey> --apply --force   # also delete when user_sites reference it
 */
import { createClient } from '@supabase/supabase-js';
import { deleteTemplate, buildDeletePlan, type DeleteTemplatePlan } from '../src/lib/template/delete';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isForce = args.includes('--force');
const templateKey = args.find((a) => !a.startsWith('--'));

if (!templateKey) {
  console.error('Usage: pnpm template:delete <templateKey> [--apply] [--force]');
  process.exit(1);
}

function printPlan(plan: DeleteTemplatePlan) {
  const src = plan.sourceDir ? plan.sourceDirRel : '(absent — orphan cleanup)';
  console.log(`\n  template          : ${plan.templateKey}`);
  console.log(`  source dir        : ${src}`);
  console.log(`  user_sites refs   : ${plan.userSiteCount}`);
  console.log(`  db row            : ${plan.dbRowId ? 1 : 0}`);
  console.log(`  template_assets   : ${plan.assetPaths.length} file(s)`);
  console.log(`  storage thumbnail : ${plan.thumbnailPaths.length} file(s)`);
  console.log(`  public thumbnail  : ${plan.publicThumbnail ? 1 : 0}`);
  console.log(`  code references   : ${plan.codeReferences.length} file(s)`);
  console.log(`  _generated.ts     : ${plan.sourceDir ? 'no change until git rm' : 'will drop stale key'}`);
}

function warnCodeReferences(plan: DeleteTemplatePlan) {
  if (plan.codeReferences.length === 0) return;
  console.warn(
    `\n⚠️  ${plan.codeReferences.length} file(s) reference this template's source — they will break tsc\n` +
      '   once the source dir is removed. Update (repoint or remove) them in the same change:',
  );
  for (const f of plan.codeReferences) console.warn(`     - ${f}`);
}

async function run() {
  console.log(`🗑  template:delete — ${isApply ? 'APPLY' : 'DRY-RUN (Preview)'}`);

  try {
    // Always preview first so guards report against real state.
    const plan = await buildDeletePlan(supabase, templateKey!);
    printPlan(plan);

    // Empty-match guard (typo protection).
    const matchesNothing =
      !plan.dbRowId &&
      !plan.sourceDir &&
      plan.assetPaths.length === 0 &&
      plan.thumbnailPaths.length === 0 &&
      !plan.publicThumbnail;
    if (matchesNothing) {
      console.error(`\n❌ Nothing matches "${templateKey}". Check the templateKey for typos. Aborting.`);
      process.exit(1);
    }

    // user_sites hard block (unless --force).
    if (plan.userSiteCount > 0 && !isForce) {
      console.error(
        `\n❌ ${plan.userSiteCount} user site(s) reference "${templateKey}".\n` +
          '   Deleting would break every live site on this template (they load the\n' +
          "   renderer code at serve time). Take it down with the admin catalog's\n" +
          '   Archive instead, or re-run with --force if you truly mean it.',
      );
      process.exit(1);
    }

    warnCodeReferences(plan);

    if (!isApply) {
      console.log('\n💡 Nothing deleted. Re-run with --apply to commit.');
      if (plan.sourceDir) {
        console.log(`   Source dir is left for git: after --apply, run  git rm -r ${plan.sourceDirRel}`);
      }
      return;
    }

    // Plan summary as a log line right before the irreversible work (grilling Q4).
    console.log('\nApplying deletion:');
    console.log(
      `  ${templateKey} — db:${plan.dbRowId ? 1 : 0} assets:${plan.assetPaths.length} ` +
        `thumb:${plan.thumbnailPaths.length} public:${plan.publicThumbnail ? 1 : 0}` +
        `${plan.userSiteCount > 0 ? `  (FORCED over ${plan.userSiteCount} user site(s))` : ''}`,
    );

    const result = await deleteTemplate(supabase, {
      templateKey: templateKey!,
      dryRun: false,
      force: isForce,
      performedBy: 'CLI',
    });

    console.log('\n✅ Done.');
    console.log(`   db row removed     : ${result.removed.dbRow}`);
    console.log(`   assets removed     : ${result.removed.assets}`);
    console.log(`   thumbnails removed : ${result.removed.thumbnails}`);
    console.log(`   public removed     : ${result.removed.publicThumbnail}`);
    console.log(`   _generated.ts      : ${result.removed.regenerated ? 'regenerated' : 'NOT regenerated (run pnpm generate:templates)'}`);
    console.log('   Audit log written to template_sync_audit.');

    if (result.plan.sourceDir) {
      console.log('\n👉 Source dir still on disk. Remove it and re-generate:');
      console.log(`   git rm -r ${result.plan.sourceDirRel}`);
      console.log('   pnpm generate:templates');
      console.log('   Then review the diff and commit.');
    }
  } catch (err: unknown) {
    console.error('\nFatal error during delete:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

run();
