import './lib/register-css-stub'; // MUST be first — stubs .css so template modules load under tsx

import { join } from 'path';

import {
  runValidateJson,
  runValidateFiles,
  checkFieldsSchemaJsxConsistency,
  runThumbnailPath,
  type StepResult,
} from './lib/validate-and-capture';
import { templateCategories } from '../src/templates/_generated';

const ROOT = join(__dirname, '..');
const TEMPLATES_DIR = join(ROOT, 'src', 'templates');

/**
 * CI gate — runs the template-specific structural checks across EVERY template
 * in one pass (ADR-0012 §4). Equivalent to `template:verify --skip-capture` for
 * all templates, minus the per-template tsc/eslint (those run project-wide as
 * separate CI steps) and minus capture (thumbnails are committed at authoring
 * time). Exits 1 if any template fails — this is a blocking merge gate.
 */
async function main() {
  const keys = Object.keys(templateCategories);
  console.log(`🔎 Verifying ${keys.length} templates (structural checks)\n`);

  let failed = 0;

  for (const templateKey of keys) {
    const category = templateCategories[templateKey];
    const leaf = templateKey.slice(category.length + 1);
    // templateCategories holds the Capitalized catalog form (e.g. `Cafe`), but
    // the directory on disk is lowercase (`src/templates/cafe/...`). Lowercase
    // for the filesystem path or this fails on case-sensitive FS (Linux/CI).
    const templateRoot = join(TEMPLATES_DIR, category.toLowerCase(), leaf);

    const steps: StepResult[] = [
      await runValidateJson(templateKey),
      runValidateFiles(templateRoot),
      checkFieldsSchemaJsxConsistency(templateRoot),
      await runThumbnailPath(templateKey, templateRoot),
    ];

    const ok = steps.every(s => s.ok);
    console.log(`${ok ? '✅' : '❌'} ${templateKey}`);
    if (!ok) {
      failed++;
      for (const step of steps.filter(s => !s.ok)) {
        console.log(`   ✗ ${step.name}`);
        for (const m of step.messages) console.log(`     ${m}`);
      }
    }
  }

  if (failed > 0) {
    console.error(`\n❌ ${failed}/${keys.length} templates failed structural verification.`);
    process.exit(1);
  }
  console.log(`\n✅ All ${keys.length} templates pass.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
