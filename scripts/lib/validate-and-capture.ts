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
 *   7. thumbnail-path guard         preset/config/file agreement
 *
 * Steps 1-5 are fast (in-process or small spawn). Step 6 spawns a Chromium
 * via `pnpm template:capture`; `--skip-capture` omits it in CI/dry-runs.
 * Step 7 remains blocking, so a committed thumbnail must already exist when
 * capture is skipped.
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

/**
 * On Windows `spawnSync('pnpm', …)` throws ENOENT (status null) because the
 * executable is `pnpm.cmd`, and spawning `pnpm.cmd` directly now throws EINVAL
 * (Node's CVE-2024-27980 mitigation blocks `.cmd`/`.bat` without a shell). The
 * runTsc/runEslint/runCapture steps would then misreport this as a failing gate
 * ("tsc failed but no diagnostic mentions the template dir"). Running through a
 * shell on Windows resolves the launcher correctly; Linux CI keeps the direct
 * spawn. Args here are static/whitespace-free, so shell concatenation is safe.
 */
const SPAWN_WIN_SHELL = process.platform === 'win32';

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
  const proc = spawnSync('pnpm', ['exec', 'tsc', '--noEmit'], { encoding: 'utf-8', shell: SPAWN_WIN_SHELL });
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
  const proc = spawnSync('pnpm', ['exec', 'eslint', relative], { encoding: 'utf-8', shell: SPAWN_WIN_SHELL });
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
 * Classify the top-level fields of a schema block into:
 *   - `scalarKeys` — ordinary fields, read as `<content>.key`
 *   - `arrayKeys`  — `type: 'array'` fields, mapped over as `<content>.key`
 *   - `itemKeys`   — the union of every array field's `itemSchema` keys, read as
 *                    `item.fields.subkey` inside the `.map`
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

/**
 * Every `{ start, end }` span of a schema literal in `source` — the block
 * `as const satisfies FieldsSchema` is attached to (the ADR-0016 form), plus a
 * legacy inline `fieldsSchema: { … }` literal if one is still written that way.
 *
 * Found by scanning *backwards* from `satisfies FieldsSchema` to the `}` that
 * precedes it and brace-balancing to its `{`, which is robust to however the
 * declaration is spelled (`const x =`, `export const x =`, a direct property).
 */
function findSchemaBlocks(source: string): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];

  for (const m of source.matchAll(/satisfies\s+FieldsSchema\b/g)) {
    const close = source.lastIndexOf('}', m.index!);
    if (close < 0) continue;
    let depth = 1;
    let i = close - 1;
    while (i >= 0 && depth > 0) {
      if (source[i] === '}') depth++;
      else if (source[i] === '{') depth--;
      if (depth === 0) break;
      i--;
    }
    if (depth === 0) spans.push({ start: i + 1, end: close });
  }

  const inlineHeader = /fieldsSchema\s*:\s*\{/g;
  const header = inlineHeader.exec(source);
  if (header) {
    const inline = extractObjectBlock(source, 'fieldsSchema');
    if (inline) spans.push({ start: inlineHeader.lastIndex, end: inlineHeader.lastIndex + inline.length });
  }

  return spans;
}

// ─── Step 5: fieldsSchema ↔ JSX consistency ────────────────────────────────────

/**
 * Every field a component's schema declares must be read somewhere in that
 * component — a declared-but-unread field is a live editor input whose edits
 * change nothing on screen.
 *
 * **Only this direction is checked, and only since ADR-0016.** The other one —
 * a renderer reading a key the schema never declared — used to be the more
 * valuable half, and it is now a *compile* error: the Content type is derived
 * from the schema (`ValuesOf<typeof schema>`), so `content.mystery` does not
 * type-check. `tsc` does it structurally, for every key, with no regex.
 *
 * That rewrite is also why this step needed one. It matched
 * `getFieldValue(fields, 'key')` calls, of which there are now zero, against a
 * `fieldsSchema: { … }` literal, of which there are also now zero (schemas are
 * declared as a const and referenced by name). It reported every template green
 * while skipping every file — a gate that had quietly stopped being one.
 *
 * Regex-based, not an AST walk, and deliberately permissive about what counts
 * as a read: a false positive blocks an author on a correct template, while a
 * false negative only means a dead field survives to the next reviewer.
 * Issue #129's schema manifest is the strict, AST-level successor.
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
  let checked = 0;

  for (const file of tsxFiles) {
    const src = fs.readFileSync(file, 'utf-8');
    const base = path.basename(file, '.tsx');

    // A client component ('use client') cannot expose static meta to the server,
    // so its schema lives in a `<C>.meta.ts` sibling — declared once there and
    // imported back by the .tsx for its `ValuesOf`. Either way the *reads* are
    // in the .tsx.
    const metaSibling = path.join(libraryDir, `${base}.meta.ts`);
    const schemaSource = fs.existsSync(metaSibling) ? fs.readFileSync(metaSibling, 'utf-8') : src;

    const spans = findSchemaBlocks(schemaSource);
    if (spans.length === 0) {
      // No declared schema — a helper module, not a Block component.
      continue;
    }
    checked++;

    const { scalarKeys, arrayKeys, itemKeys } = parseSchemaFields(
      spans.map(sp => schemaSource.slice(sp.start, sp.end)).join('\n'),
    );

    // Search the reads in the .tsx with the schema declaration cut out of it —
    // otherwise every key "references" itself and nothing is ever flagged.
    let body = src;
    if (schemaSource === src) {
      for (const sp of [...spans].sort((a, b) => b.start - a.start)) {
        body = body.slice(0, sp.start) + body.slice(sp.end);
      }
    }

    // Numbered fields (`stat1Value`, `q1`, …) are read through a template literal
    // inside a `.map` — `content[`stat${n}Value`]` — so no literal key ever
    // appears. Turn each such read into a pattern (`${…}` → `[\w$]+`) and count
    // any declared key it matches as read. Permissive on purpose: which indices
    // exist is not statically knowable.
    const computedPatterns: RegExp[] = [];
    for (const m of body.matchAll(/\[\s*`([^`]*)`\s*\]/g)) {
      const literalParts = m[1].split(/\$\{[^}]*\}/).map(escapeRegExp);
      computedPatterns.push(new RegExp(`^${literalParts.join('[\\w$]+')}$`));
    }

    // A component that reads its fields by enumeration (`content[key]`,
    // `Object.entries(content)`) tells us nothing statically about which keys it
    // touches. Back off on the whole file rather than flag every field on it.
    const readsFieldsDynamically =
      /\b(?:content|fields)\s*\[\s*[\w$]+\s*\]/.test(body) ||
      /Object\.(?:entries|keys|values)\s*\(\s*(?:section\s*\.\s*)?(?:content|fields)\b/.test(body);

    // What a read looks like after ADR-0016: `content.key`, `item.fields.key`,
    // `content['key']`, or a destructure (`const { key } = content`). The last
    // one is why a bare `key` between braces/commas counts too.
    const isRead = (key: string) =>
      readsFieldsDynamically ||
      new RegExp(`\\.\\s*${key}\\b`).test(body) ||
      new RegExp(`\\[\\s*['"\`]${key}['"\`]\\s*\\]`).test(body) ||
      new RegExp(`[{,]\\s*${key}\\s*[,}:]`).test(body) ||
      computedPatterns.some(re => re.test(key));

    const rel = path.relative(templateRoot, file);
    for (const k of [...scalarKeys, ...arrayKeys]) {
      if (!isRead(k)) {
        violations.push(`${rel}: field "${k}" declared in fieldsSchema but never read (no \`.${k}\` in the component)`);
      }
    }
    for (const k of itemKeys) {
      if (!isRead(k)) {
        violations.push(`${rel}: item field "${k}" declared in itemSchema but never read (no \`.${k}\` in the component)`);
      }
    }
  }

  if (violations.length > 0) {
    return { name: 'schema-jsx-consistency', ok: false, messages: violations };
  }
  return {
    name: 'schema-jsx-consistency',
    ok: true,
    messages: [`every declared field is read across ${checked} component(s)`],
  };
}

// ─── Step 5.5: thumbnailPath ↔ config output ↔ file on disk ──────────────────

/**
 * Guard against the regression that broke every catalog thumbnail (fixed in
 * PR #92): a preset's `thumbnailPath` silently drifting from the
 * `thumbnail.config.ts` `output` (or pointing at a file that doesn't
 * exist). When that happens `template:sync` would try to
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
    shell: SPAWN_WIN_SHELL,
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
  //    exactly the regression that broke the whole catalog (fixed in PR #92).
  const thumb = await runThumbnailPath(opts.templateKey, opts.templateRoot);
  steps.push(thumb);
  if (!thumb.ok) return { ok: false, steps, thumbnailPath };

  return { ok: true, steps, thumbnailPath };
}
