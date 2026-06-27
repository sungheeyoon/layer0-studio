/**
 * Final integration gate for template authoring — run via `pnpm template:verify`
 * (and used by the `new-template` skill's verify loop).
 *
 * Runs after a template's files are written + image-hosted. Halts on the first
 * failure — there's no auto-retry because integration-level fixes need a
 * human (or Claude Code) to look at the diff.
 *
 * Steps:
 *   1. `tsc --noEmit`              global type check (errors filtered to template dir)
 *   2. `eslint src/templates/<key>/` Issue #8 token enforcement included
 *   3. `validateTemplateJson`       derived from preset
 *   4. `validateTemplateFiles`      file-level scan (#8 rules)
 *   5. dataSchema ↔ JSX consistency (declared vs referenced field keys)
 *   6. `template:capture <key>`     Playwright thumbnail capture
 *
 * Steps 1-5 are fast (in-process or small spawn). Step 6 spawns a Chromium
 * via `pnpm template:capture` — skipped silently if Playwright isn't
 * available (we surface a warning, not a hard fail, because thumbnails
 * can be re-generated independently).
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { validateTemplateJson } from '../../src/lib/template/validate';
import { validateTemplateFiles } from '../../src/lib/template/inline-tokens';
import {
  presetMap,
  templateMap,
  getAvailableTemplateKeys,
} from '../../src/templates/_generated';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StepResult {
  /** Short, lowercase + hyphen id for the step (used in CLI output and exit codes). */
  name:
    | 'tsc'
    | 'eslint'
    | 'validate-json'
    | 'validate-files'
    | 'schema-jsx-consistency'
    | 'capture';
  ok: boolean;
  /** Human-readable lines (errors when !ok, summary when ok). */
  messages: string[];
  /** Optional artifact path produced by the step (capture → thumbnail webp). */
  artifact?: string;
}

export interface ValidateAndCaptureResult {
  ok: boolean;
  steps: StepResult[];
  /** Thumbnail file path when capture succeeded. */
  thumbnailPath: string | null;
}

export interface ValidateAndCaptureOptions {
  templateKey: string;
  /** Absolute path to `src/templates/<category>/<leaf>/`. */
  templateRoot: string;
  /** Skip the (slow) thumbnail step — useful for CI / dry-run. */
  skipCapture?: boolean;
}

// ─── Step 1: tsc ─────────────────────────────────────────────────────────────

function runTsc(templateRoot: string): StepResult {
  // No per-dir tsc, so run global and filter diagnostics to those that touch
  // the template's path. Other (unrelated) errors are reported separately at
  // the end so the user still sees them.
  const proc = spawnSync('pnpm', ['exec', 'tsc', '--noEmit'], { encoding: 'utf-8' });
  const allOut = (proc.stdout ?? '') + (proc.stderr ?? '');
  if (proc.status === 0) return { name: 'tsc', ok: true, messages: ['tsc clean'] };

  const lines = allOut.split('\n').filter(l => l.trim());
  const relative = path.relative(process.cwd(), templateRoot);
  const templateErrors = lines.filter(l => l.includes(relative));
  if (templateErrors.length === 0) {
    // Failure but no diagnostic touches our template — pre-existing global issue.
    return {
      name: 'tsc',
      ok: false,
      messages: [
        'tsc failed but no diagnostic mentions the template dir.',
        '(Likely a pre-existing repo issue — fix unrelated errors before retrying.)',
        ...lines.slice(0, 10),
      ],
    };
  }
  return { name: 'tsc', ok: false, messages: templateErrors };
}

// ─── Step 2: eslint ──────────────────────────────────────────────────────────

function runEslint(templateRoot: string): StepResult {
  const relative = path.relative(process.cwd(), templateRoot);
  const proc = spawnSync('pnpm', ['exec', 'eslint', relative], { encoding: 'utf-8' });
  const out = (proc.stdout ?? '') + (proc.stderr ?? '');
  if (proc.status === 0) return { name: 'eslint', ok: true, messages: ['eslint clean'] };
  return {
    name: 'eslint',
    ok: false,
    messages: out.split('\n').filter(l => l.trim()),
  };
}

// ─── Step 3: validateTemplateJson ────────────────────────────────────────────

async function runValidateJson(templateKey: string): Promise<StepResult> {
  const presetLoader = (presetMap as Record<string, () => Promise<{ default: import('../../src/templates/types').TemplatePreset }>>)[templateKey];
  const templateLoader = (templateMap as Record<string, () => Promise<import('../../src/templates/types').TemplateModule>>)[templateKey];
  if (!presetLoader) {
    return {
      name: 'validate-json',
      ok: false,
      messages: [`presetMap has no entry for "${templateKey}" — did pnpm generate:templates run?`],
    };
  }
  if (!templateLoader) {
    return {
      name: 'validate-json',
      ok: false,
      messages: [`templateMap has no entry for "${templateKey}" — did pnpm generate:templates run?`],
    };
  }
  const preset = (await presetLoader()).default;
  const templateModule = await templateLoader();

  // The Preset carries the full templateJson verbatim (code is source of truth).
  const templateJson = preset.templateJson;

  const result = validateTemplateJson(templateJson, {
    availableTemplateKeys: getAvailableTemplateKeys(),
    templateLibrary: templateModule.library,
  });

  if (result.errors.length > 0) {
    return {
      name: 'validate-json',
      ok: false,
      messages: result.errors.map(e => `[${e.code}] ${e.message} (${e.path ?? ''})`),
    };
  }
  const warns = result.warnings.length > 0
    ? result.warnings.map(w => `(warn) [${w.code}] ${w.message} (${w.path ?? ''})`)
    : ['no warnings'];
  return { name: 'validate-json', ok: true, messages: ['validateTemplateJson clean', ...warns] };
}

// ─── Step 4: validateTemplateFiles (#8 file-level rules) ─────────────────────

function runValidateFiles(templateRoot: string): StepResult {
  const issues = validateTemplateFiles(templateRoot);
  if (issues.length === 0) {
    return { name: 'validate-files', ok: true, messages: ['validateTemplateFiles clean'] };
  }
  return {
    name: 'validate-files',
    ok: false,
    messages: issues.map(i => `[${i.code}] ${i.message} (${i.path ?? ''})`),
  };
}

/**
 * Find the `dataSchema: { … }` literal in a TypeScript source string and
 * return the contents *between* the outermost braces (or null if no
 * `dataSchema:` is present). Uses brace-balanced scanning so single-line
 * and multi-line literals both work, and nested object values don't
 * truncate the capture.
 */
function extractDataSchemaBlock(source: string): string | null {
  const headerRe = /dataSchema\s*:\s*\{/g;
  const header = headerRe.exec(source);
  if (!header) return null;
  let depth = 1;
  let i = headerRe.lastIndex;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  if (depth !== 0) return null;
  return source.slice(headerRe.lastIndex, i);
}

/**
 * Given the inside of `dataSchema: { … }`, return the top-level property
 * keys only. Brace-tracks so nested keys (`type`, `label`, etc.) are skipped.
 */
function extractTopLevelKeys(block: string): Set<string> {
  const out = new Set<string>();
  let depth = 0;
  let i = 0;
  while (i < block.length) {
    const ch = block[i];
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    else if (ch === '}' || ch === ']' || ch === ')') depth--;
    else if (depth === 0 && /[a-zA-Z_$]/.test(ch)) {
      // Try to read an identifier here.
      const idMatch = /^([a-zA-Z_$][\w$]*)\s*:/.exec(block.slice(i));
      if (idMatch) {
        out.add(idMatch[1]);
        i += idMatch[0].length;
        continue;
      }
    }
    i++;
  }
  return out;
}

// ─── Step 5: dataSchema ↔ JSX consistency ────────────────────────────────────

/**
 * For each `library/<Section>.tsx`, find:
 *   - Declared field keys in the inline `<Component>.meta.dataSchema` literal
 *   - Referenced field keys in `getFieldValue(data, 'key')` calls
 * Cross-check both directions. Catches typos / forgotten field migrations.
 *
 * Regex-based — not an AST walk. Good enough since dataSchema is always a
 * literal in our codegen and `getFieldValue(data, '...')` is the only
 * canonical accessor. Components that use `.meta.ts` siblings (client
 * components) are handled too.
 */
export function checkDataSchemaJsxConsistency(templateRoot: string): StepResult {
  const libraryDir = path.join(templateRoot, 'library');
  if (!fs.existsSync(libraryDir)) {
    return { name: 'schema-jsx-consistency', ok: true, messages: ['no library/ dir — skipped'] };
  }

  const tsxFiles = fs
    .readdirSync(libraryDir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => path.join(libraryDir, f));

  const violations: string[] = [];

  for (const file of tsxFiles) {
    const src = fs.readFileSync(file, 'utf-8');
    const base = path.basename(file, '.tsx');

    // Find the dataSchema literal — either inline `<C>.meta = { dataSchema: { … } }`
    // or sibling `<C>.meta.ts` exporting `dataSchema: { … }`.
    let schemaSource = src;
    const metaSibling = path.join(libraryDir, `${base}.meta.ts`);
    if (fs.existsSync(metaSibling)) {
      schemaSource = fs.readFileSync(metaSibling, 'utf-8');
    }

    const schemaBlock = extractDataSchemaBlock(schemaSource);
    if (!schemaBlock) {
      // No declared schema — skip this file (e.g. helper module).
      continue;
    }

    // Property keys at depth 1 only (skip nested type/label/itemSchema entries).
    const declaredKeys = extractTopLevelKeys(schemaBlock);

    // Find all `getFieldValue(<accessor>, 'key')` calls in the TSX itself.
    // Permit any accessor expression for the first arg — both `data` (destructured)
    // and `section.data`, `item` (array-field item callbacks), etc. are common.
    const referencedKeys = new Set<string>();
    for (const m of src.matchAll(/getFieldValue\s*\(\s*[\w$.[\]]+\s*,\s*['"]([\w$]+)['"]\s*\)/g)) {
      referencedKeys.add(m[1]);
    }

    const declaredButUnused = [...declaredKeys].filter(k => !referencedKeys.has(k));
    const referencedButUndeclared = [...referencedKeys].filter(k => !declaredKeys.has(k));

    const rel = path.relative(templateRoot, file);
    for (const k of declaredButUnused) {
      violations.push(`${rel}: field "${k}" declared in dataSchema but never read via getFieldValue`);
    }
    for (const k of referencedButUndeclared) {
      violations.push(`${rel}: field "${k}" read via getFieldValue but not declared in dataSchema`);
    }
  }

  if (violations.length > 0) {
    return { name: 'schema-jsx-consistency', ok: false, messages: violations };
  }
  return { name: 'schema-jsx-consistency', ok: true, messages: [`schema-JSX consistent across ${tsxFiles.length} files`] };
}

// ─── Step 6: capture thumbnail ───────────────────────────────────────────────

function runCapture(templateKey: string): StepResult {
  const proc = spawnSync('pnpm', ['template:capture', templateKey], {
    encoding: 'utf-8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  const out = (proc.stdout ?? '') + (proc.stderr ?? '');
  if (proc.status !== 0) {
    return {
      name: 'capture',
      ok: false,
      messages: [
        `template:capture exited ${proc.status}`,
        ...out.split('\n').slice(-20).filter(l => l.trim()),
      ],
    };
  }
  // Locate the produced webp (matches the thumbnail.config.ts output path convention).
  const expected = path.join(process.cwd(), 'public', 'thumbnails', `template-${templateKey}.webp`);
  const exists = fs.existsSync(expected);
  return {
    name: 'capture',
    ok: true,
    messages: exists
      ? [`thumbnail captured: ${path.relative(process.cwd(), expected)}`]
      : [`template:capture succeeded but expected webp not found at ${expected}`],
    artifact: exists ? expected : undefined,
  };
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

export async function validateAndCapture(
  opts: ValidateAndCaptureOptions,
): Promise<ValidateAndCaptureResult> {
  const steps: StepResult[] = [];
  const halt = (s: StepResult) => ({ ok: false, steps: [...steps, s], thumbnailPath: null });

  // 1-2: spawn-based, fastest to surface compile/lint errors first.
  const tsc = runTsc(opts.templateRoot);
  steps.push(tsc);
  if (!tsc.ok) return halt(tsc);

  const eslint = runEslint(opts.templateRoot);
  steps.push(eslint);
  if (!eslint.ok) return halt(eslint);

  // 3-4: in-process domain validators (fast).
  const json = await runValidateJson(opts.templateKey);
  steps.push(json);
  if (!json.ok) return halt(json);

  const files = runValidateFiles(opts.templateRoot);
  steps.push(files);
  if (!files.ok) return halt(files);

  // 5: in-process structural check.
  const schemaJsx = checkDataSchemaJsxConsistency(opts.templateRoot);
  steps.push(schemaJsx);
  if (!schemaJsx.ok) return halt(schemaJsx);

  // 6: optional, slow (Chromium).
  if (opts.skipCapture) {
    steps.push({ name: 'capture', ok: true, messages: ['skipped (skipCapture: true)'] });
    return { ok: true, steps, thumbnailPath: null };
  }
  const capture = runCapture(opts.templateKey);
  steps.push(capture);
  // Capture failure is reported but does NOT halt the gate — thumbnails can
  // be re-generated independently after the fact via `pnpm template:capture`.
  // The overall .ok stays true so the CLI proceeds to the next-steps message.

  return {
    ok: true,
    steps,
    thumbnailPath: capture.ok ? capture.artifact ?? null : null,
  };
}
