import { createClient } from '@supabase/supabase-js';
import { syncTemplates } from '../src/lib/template/sync';

// --- Configuration ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isYes = args.includes('--yes');
const targetSlug = args.find(a => !a.startsWith('--'));

async function countdown(seconds: number) {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r⚠️  Applying changes in ${i}s... (Ctrl+C to cancel) `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\r🚀 Applying changes now...                            ');
}

async function run() {
  console.log('🚀 Starting Template Synchronization...');
  console.log(`Mode: ${isApply ? (isYes ? 'APPLY (Direct)' : 'APPLY (Interactive)') : 'DRY-RUN (Preview)'}`);
  
  try {
    // If applying, we first do a dry-run to show what will happen
    const previewSummary = await syncTemplates(supabase, {
      dryRun: true,
      targetSlug
    });

    if (previewSummary.details.length === 0) {
      console.log('No templates found to sync.');
      return;
    }

    for (const detail of previewSummary.details) {
      if (detail.action === 'NO_CHANGE' && !targetSlug) continue;
      
      console.log(`\n--- [${detail.slug}] ---`);
      if (detail.action === 'ERROR') {
        console.error(`❌ Validation failed:`);
        detail.errors?.forEach(e => console.error(`  - ${e}`));
      } else if (detail.action === 'CREATE') {
        console.log(`[NEW] Will create with status=draft`);
      } else if (detail.action === 'UPDATE') {
        console.log(`[UPDATE]`);
        detail.changes?.forEach(c => console.log(`  ${c}`));
      } else {
        console.log(`[NO CHANGE]`);
      }
    }

    const totalChanges = previewSummary.creates + previewSummary.updates;

    console.log('\n' + '='.repeat(40));
    console.log('Change Summary:');
    console.log(`  New:       ${previewSummary.creates}`);
    console.log(`  Updates:   ${previewSummary.updates}`);
    console.log(`  Unchanged: ${previewSummary.noChange}`);
    console.log(`  Errors:    ${previewSummary.errors}`);
    console.log('='.repeat(40));

    if (!isApply) {
      console.log('\n💡 Run with --apply to commit these changes.');
      return;
    }

    if (previewSummary.errors > 0) {
      console.error('\n❌ Cannot apply changes while there are validation errors.');
      process.exit(1);
    }

    if (totalChanges === 0) {
      console.log('\n✨ No changes to apply.');
      return;
    }

    // Safety countdown
    if (!isYes) {
      await countdown(5);
    }

    const finalSummary = await syncTemplates(supabase, {
      dryRun: false,
      targetSlug,
      performedBy: 'CLI'
    });

    console.log(`\n✅ Successfully synchronized ${finalSummary.affectedSlugs.length} templates.`);
    console.log('   Audit log written to template_sync_audit table.');

  } catch (err: any) {
    console.error('Fatal error during sync:', err.message);
    process.exit(1);
  }
}

run();
