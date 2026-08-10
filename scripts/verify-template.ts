/**
 * template:verify — run the full template gate against one template.
 *
 * Thin CLI wrapper around `validateAndCapture` (scripts/lib/validate-and-capture.ts).
 * This is the single command the `new-template` Skill runs in its verify loop:
 * it bundles the seven checks (tsc → eslint → validate-json → validate-files →
 * schema↔jsx consistency → capture → thumbnail-path) — including `checkFieldsSchemaJsxConsistency`,
 * which `pnpm test` / `pnpm lint` do NOT cover.
 *
 * Usage:
 *   pnpm template:verify <templateKey>                # full gate
 *   pnpm template:verify <templateKey> --skip-capture # skip the slow Chromium thumbnail
 *
 * Exit code 1 if any blocking step fails (capture failure is non-blocking).
 */
import './lib/register-css-stub'; // MUST be first — stubs .css so template modules load under tsx

import { join } from 'path';

import { validateAndCapture } from './lib/validate-and-capture';
import { templateCategories } from '../src/templates/_generated';

const ROOT = join(__dirname, '..');
const TEMPLATES_DIR = join(ROOT, 'src', 'templates');

async function main() {
  const args = process.argv.slice(2);
  const skipCapture = args.includes('--skip-capture');
  const templateKey = args.find(a => !a.startsWith('--'));

  if (!templateKey) {
    console.error('Usage: pnpm template:verify <templateKey> [--skip-capture]');
    console.error('\nAvailable templateKeys:');
    for (const key of Object.keys(templateCategories)) console.error(`  ${key}`);
    process.exit(1);
  }

  const category = templateCategories[templateKey];
  if (!category) {
    console.error(`Unknown templateKey: "${templateKey}"`);
    console.error('Run `pnpm generate:templates` first if you just added the directory.');
    console.error('\nAvailable templateKeys:');
    for (const key of Object.keys(templateCategories)) console.error(`  ${key}`);
    process.exit(1);
  }

  // leaf = templateKey with the `<category>-` prefix stripped.
  const leaf = templateKey.slice(category.length + 1);
  // templateCategories holds the Capitalized catalog form (e.g. `Cafe`), but the
  // directory on disk is lowercase (`src/templates/cafe/...`). Lowercase for the
  // filesystem path or this fails on case-sensitive FS (Linux/CI).
  const templateRoot = join(TEMPLATES_DIR, category.toLowerCase(), leaf);

  console.log(`\n🔎 Verifying ${templateKey}  (${category}/${leaf})${skipCapture ? '  [skip-capture]' : ''}\n`);

  const result = await validateAndCapture({ templateKey, templateRoot, skipCapture });

  for (const step of result.steps) {
    const mark = step.ok ? '✅' : '❌';
    console.log(`${mark} ${step.name}`);
    for (const line of step.messages) console.log(`     ${line}`);
    if (step.artifact) console.log(`     → ${step.artifact}`);
  }

  if (result.thumbnailPath) console.log(`\nthumbnail: ${result.thumbnailPath}`);

  if (!result.ok) {
    console.error('\n❌ Gate failed — fix the first ❌ step above and re-run.');
    process.exit(1);
  }
  console.log('\n✅ Gate passed.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
