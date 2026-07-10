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
 *   3. `validateContent`       derived from preset
 *   4. `validateTemplateFiles`      file-level scan (#8 rules)
 *   5. fieldsSchema ↔ JSX consistency (declared vs referenced field keys)
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
import { pathToFileURL } from 'url';

import { validateContent } from '../../src/lib/template/validate';
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
    | 'thumbnail-path'
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

// ─── Step 3: validateContent ────────────────────────────────────────────

export async function runValidateJson(templateKey: string): Promise<StepResult> {
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

  // The Preset carries the full content verbatim (code is source of truth).
  const content = preset.content;

  const result = validateContent(content, {
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
  return { name: 'validate-json', ok: true, messages: ['validateContent clean', ...warns] };
}

// ─── Step 4: validateTemplateFiles (#8 file-level rules) ─────────────────────

export function runValidateFiles(templateRoot: string): StepResult {
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
 * Find the `fieldsSchema: { … }` literal in a TypeScript source string and
 * return the contents *between* the outermost braces (or null if no
 * `fieldsSchema:` is present). Uses brace-balanced scanning so single-line
 * and multi-line literals both work, and nested object values don't
 * truncate the capture.
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractObjectBlock(source: string, key: string): string | null {
  const headerRe = new RegExp(`${key}\\s*:\\s*\\{`, 'g');
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

function extractDataSchemaBlock(source: string): string | null {
  return extractObjectBlock(source, 'fieldsSchema');
}

/**
 * Given the inside of `fieldsSchema: { … }`, return the top-level property
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

/**
 * Classify the top-level fields of a `fieldsSchema` block into:
 *   - `scalarKeys` — ordinary fields (read via `getFieldValue(fields, 'key')`)
 *   - `arrayKeys`  — `type: 'array'` fields (iterated via `fields['key'].items`,
 *                    NOT read as a scalar)
 *   - `itemKeys`   — the union of every array field's `itemSchema` keys (each
 *                    read via `getFieldValue(item.subkey)` inside a `.map`)
 *
 * Brace-tracks at depth 0 so nested `type`/`label`/`itemSchema` entries are not
 * mistaken for top-level fields. See `checkFieldsSchemaJsxConsistency`.
 */
function parseSchemaFields(block: string): {
  scalarKeys: Set<string>;
  arrayKeys: Set<string>;
  itemKeys: Set<string>;
} {
  const scalarKeys = new Set<string>();
  const arrayKeys = new Set<string>();
  const itemKeys = new Set<string>();

  let i = 0;
  let depth = 0;
  while (i < block.length) {
    const ch = block[i];
    if (ch === '{' || ch === '[' || ch === '(') { depth++; i++; continue; }
    if (ch === '}' || ch === ']' || ch === ')') { depth--; i++; continue; }
    if (depth === 0 && /[a-zA-Z_$]/.test(ch)) {
      const objMatch = /^([a-zA-Z_$][\w$]*)\s*:\s*\{/.exec(block.slice(i));
      if (objMatch) {
        const key = objMatch[1];
        // Capture the field's value object (brace-balanced).
        const braceStart = i + objMatch[0].length - 1;
        let d = 1;
        let j = braceStart + 1;
        while (j < block.length && d > 0) {
          if (block[j] === '{') d++;
          else if (block[j] === '}') d--;
          j++;
        }
        const valueBlock = block.slice(braceStart + 1, j - 1);
        if (/type\s*:\s*['"]array['"]/.test(valueBlock)) {
          arrayKeys.add(key);
          const itemSchemaBlock = extractObjectBlock(valueBlock, 'itemSchema');
          if (itemSchemaBlock) {
            for (const k of extractTopLevelKeys(itemSchemaBlock)) itemKeys.add(k);
          }
        } else {
          scalarKeys.add(key);
        }
        i = j;
        continue;
      }
      // Identifier not followed by `: {` (shorthand) — treat as a scalar key.
      const idOnly = /^([a-zA-Z_$][\w$]*)\s*:/.exec(block.slice(i));
      if (idOnly) {
        scalarKeys.add(idOnly[1]);
        i += idOnly[0].length;
        continue;
      }
    }
    i++;
  }
  return { scalarKeys, arrayKeys, itemKeys };
}

// ─── Step 5: fieldsSchema ↔ JSX consistency ────────────────────────────────────

/**
 * For each `library/<Section>.tsx`, find:
 *   - Declared field keys in the inline `<Component>.meta.fieldsSchema` literal
 *   - Referenced field keys in `getFieldValue(fields, 'key')` calls
 * Cross-check both directions. Catches typos / forgotten field migrations.
 *
 * Regex-based — not an AST walk. Good enough since fieldsSchema is always a
 * literal in our codegen and `getFieldValue(fields, '...')` is the only
 * canonical accessor. Components that use `.meta.ts` siblings (client
 * components) are handled too.
 */
export function checkFieldsSchemaJsxConsistency(templateRoot: string): StepResult {
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

    // Find the fieldsSchema literal — either inline `<C>.meta = { fieldsSchema: { … } }`
    // or sibling `<C>.meta.ts` exporting `fieldsSchema: { … }`.
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

    // Classify declared fields: scalars, `type:'array'` fields, and the item
    // sub-keys nested in each array's `itemSchema`. Arrays and their items are
    // accessed differently than scalars, so they need separate checks (a single
    // flat key-set produced false positives on every array field — #array-gate).
    const { scalarKeys, arrayKeys, itemKeys } = parseSchemaFields(schemaBlock);
    const topLevelDeclared = new Set([...scalarKeys, ...arrayKeys]);

    // Scalars: `getFieldValue(<accessor>, 'key')` (two-arg). Any accessor — both
    // `fields` (destructured) and `section.fields` are common.
    const refScalar = new Set<string>();
    for (const m of src.matchAll(/getFieldValue\s*\(\s*[\w$.[\]]+\s*,\s*['"]([\w$]+)['"]\s*\)/g)) {
      refScalar.add(m[1]);
    }

    // Computed-key reads — `getFieldValue(fields, `stat${n}Value`)` inside a
    // `[1,2,3].map(...)`. The numbered fields (`stat1Value`, `stat2Value`, …)
    // are referenced dynamically, so a literal-key match never sees them. Turn
    // each template literal into a pattern (`${…}` → `[\w$]+`) and treat any
    // declared key it matches as referenced. Permissive on purpose — we can't
    // statically enumerate which indices exist.
    const refScalarPatterns: RegExp[] = [];
    for (const m of src.matchAll(/getFieldValue\s*\(\s*[\w$.[\]]+\s*,\s*`([^`]*)`\s*\)/g)) {
      const literalParts = m[1].split(/\$\{[^}]*\}/).map(escapeRegExp);
      refScalarPatterns.push(new RegExp(`^${literalParts.join('[\\w$]+')}$`));
    }
    const isReferencedScalar = (k: string) =>
      refScalar.has(k) || refScalarPatterns.some(re => re.test(k));

    // Dynamic-key components read fields by enumeration — `Object.entries(fields)`
    // or `getFieldValue(fields, key)` with a bare variable. We can't statically
    // know which declared keys are read, so for these files we back off the
    // "declared but unused" direction rather than false-flag every field. The
    // "referenced but undeclared" direction stays valid.
    const hasDynamicScalarKeys =
      /getFieldValue\s*\(\s*[\w$.[\]]+\s*,\s*[\w$]+\s*\)/.test(src) ||
      /Object\.(?:entries|keys|values)\s*\(\s*(?:section\s*\.\s*)?fields\b/.test(src);

    // Array fields: member/bracket access on the fields object — `fields.items`,
    // `fields['items']`, `section.fields.items`, `section.fields['items']`. (`\bfields`
    // also matches the `fields` inside `section.fields`.)
    const refArray = new Set<string>();
    for (const m of src.matchAll(/\bfields\s*(?:\.\s*([\w$]+)|\[\s*['"]([\w$]+)['"]\s*\])/g)) {
      const k = m[1] ?? m[2];
      if (k) refArray.add(k);
    }

    // Array item sub-fields: `getFieldValue(item.subkey)` (one-arg member form).
    const refItem = new Set<string>();
    for (const m of src.matchAll(/getFieldValue\s*\(\s*[\w$]+\s*\.\s*([\w$]+)\s*\)/g)) {
      refItem.add(m[1]);
    }

    const rel = path.relative(templateRoot, file);

    // Scalar fields ↔ two-arg getFieldValue (both directions).
    if (!hasDynamicScalarKeys) {
      for (const k of scalarKeys) {
        if (!isReferencedScalar(k)) {
          violations.push(`${rel}: field "${k}" declared in fieldsSchema but never read via getFieldValue`);
        }
      }
    }
    for (const k of refScalar) {
      // An array read via `getFieldValue(fields,'items')` is also legitimate.
      if (!topLevelDeclared.has(k)) {
        violations.push(`${rel}: field "${k}" read via getFieldValue but not declared in fieldsSchema`);
      }
    }

    // Array fields: must be iterated somewhere (member access) or read scalar.
    for (const k of arrayKeys) {
      if (!refArray.has(k) && !refScalar.has(k)) {
        violations.push(`${rel}: array field "${k}" declared in fieldsSchema but never read (no fields.${k} / fields['${k}'] access)`);
      }
    }

    // Array item sub-fields ↔ getFieldValue(item.subkey) (both directions).
    for (const k of itemKeys) {
      if (!refItem.has(k)) {
        violations.push(`${rel}: item field "${k}" declared in itemSchema but never read via getFieldValue(item.${k})`);
      }
    }
    for (const k of refItem) {
      if (!itemKeys.has(k)) {
        violations.push(`${rel}: item field "${k}" read via getFieldValue(item.${k}) but not declared in any itemSchema`);
      }
    }
  }

  if (violations.length > 0) {
    return { name: 'schema-jsx-consistency', ok: false, messages: violations };
  }
  return { name: 'schema-jsx-consistency', ok: true, messages: [`schema-JSX consistent across ${tsxFiles.length} files`] };
}

// ─── Step 5.5: thumbnailPath ↔ config output ↔ file on disk ──────────────────

/**
 * Guard against the regression that broke every catalog thumbnail (see
 * docs/template-authoring-friction.md TODO-2): a preset's `thumbnailPath`
 * silently drifting from the `thumbnail.config.ts` `output` (or pointing at a
 * file that doesn't exist). When that happens `template:sync` would try to
 * upload a missing file and, pre-#92, overwrote the live storage URL with a
 * broken local path string.
 *
 * Two assertions, both blocking:
 *   1. `preset.thumbnailPath` === `thumbnail.config.ts` `output` (they describe
 *      the same file — capture writes `output`, sync reads `thumbnailPath`).
 *   2. that file actually exists on disk.
 */
export async function runThumbnailPath(templateKey: string, templateRoot: string): Promise<StepResult> {
  const presetLoader = (presetMap as Record<string, () => Promise<{ default: import('../../src/templates/types').TemplatePreset }>>)[templateKey];
  if (!presetLoader) {
    return { name: 'thumbnail-path', ok: false, messages: [`presetMap has no entry for "${templateKey}".`] };
  }
  const preset = (await presetLoader()).default;
  const presetPath = preset.thumbnailPath;

  const configPath = path.join(templateRoot, 'thumbnail.config.ts');
  if (!fs.existsSync(configPath)) {
    return {
      name: 'thumbnail-path',
      ok: false,
      messages: [`no thumbnail.config.ts at ${path.relative(process.cwd(), configPath)} — capture cannot produce a thumbnail.`],
    };
  }
  const config = (await import(pathToFileURL(configPath).href)).default as { output?: string };
  const configOutput = config.output;

  const messages: string[] = [];
  let ok = true;

  if (presetPath !== configOutput) {
    ok = false;
    messages.push(
      `preset.thumbnailPath ("${presetPath}") ≠ thumbnail.config.ts output ("${configOutput}"). ` +
      `They must name the same file — capture writes output, sync reads thumbnailPath.`,
    );
  }

  const fileAbs = path.join(process.cwd(), presetPath);
  if (!fs.existsSync(fileAbs)) {
    ok = false;
    messages.push(
      `thumbnail file does not exist: ${presetPath}. Run \`pnpm template:capture ${templateKey}\` and commit the webp.`,
    );
  }

  if (ok) messages.push(`thumbnailPath OK: ${presetPath}`);
  return { name: 'thumbnail-path', ok, messages };
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
  const schemaJsx = checkFieldsSchemaJsxConsistency(opts.templateRoot);
  steps.push(schemaJsx);
  if (!schemaJsx.ok) return halt(schemaJsx);

  // 6: optional, slow (Chromium). Skipped in CI/dry-run; thumbnails can also be
  // re-generated independently after the fact via `pnpm template:capture`.
  let thumbnailPath: string | null = null;
  if (opts.skipCapture) {
    steps.push({ name: 'capture', ok: true, messages: ['skipped (skipCapture: true)'] });
  } else {
    const capture = runCapture(opts.templateKey);
    steps.push(capture);
    // Capture failure is reported but does NOT halt the gate on its own.
    thumbnailPath = capture.ok ? capture.artifact ?? null : null;
  }

  // 7: thumbnailPath guard — runs AFTER capture so a freshly-authored template's
  //    webp already exists on disk. Blocking: a drifted/missing thumbnailPath is
  //    exactly the regression that broke the whole catalog (friction-doc TODO-2).
  const thumb = await runThumbnailPath(opts.templateKey, opts.templateRoot);
  steps.push(thumb);
  if (!thumb.ok) return { ok: false, steps, thumbnailPath };

  return { ok: true, steps, thumbnailPath };
}
