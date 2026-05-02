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
const targetSlug = args.find(a => !a.startsWith('--'));

async function run() {
  console.log('🚀 Starting Template Synchronization...');
  console.log(`Mode: ${isApply ? 'APPLY (Destructive)' : 'DRY-RUN (Preview)'}`);
  
  try {
    const summary = await syncTemplates(supabase, {
      dryRun: !isApply,
      targetSlug
    });

    for (const detail of summary.details) {
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

    console.log('\n' + '='.repeat(40));
    console.log('Summary:');
    console.log(`  New:       ${summary.creates}`);
    console.log(`  Updates:   ${summary.updates}`);
    console.log(`  Unchanged: ${summary.noChange}`);
    console.log(`  Errors:    ${summary.errors}`);
    console.log('='.repeat(40));

    if (isApply && summary.affectedSlugs.length > 0) {
      console.log('\n✅ Sync complete and audit log written.');
    } else if (!isApply) {
      console.log('\nRun with --apply to commit these changes.');
    }
  } catch (err: any) {
    console.error('Fatal error during sync:', err.message);
    process.exit(1);
  }
}

run();
