/**
 * Inline design-token scanner.
 *
 * Section components must reference visual tokens through `var(--*)` (or
 * Tailwind arbitrary values that resolve to the same CSS variables) so the
 * editor's `globalStyles` overrides propagate site-wide. Hex/rgb/hsl color
 * literals and inline `font-family` strings short-circuit that mechanism.
 *
 * This module provides the shared scanning logic used by:
 *   - `validateTemplateFiles()` — called from the template generation
 *     pipeline (text scan of `library/*.tsx` files on disk).
 *   - `eslint-rules/no-inline-design-tokens.mjs` — re-defines the same
 *     regex/whitelist against AST string Literal nodes for `pnpm lint`.
 */

import fs from 'fs';
import path from 'path';

import type { ValidationIssue } from './validate';

// ─── Regexes (also mirrored in eslint-rules/no-inline-design-tokens.mjs) ───
// 3, 4, 6, or 8 hex digits, bounded so we do not match longer hex words.
export const COLOR_HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
export const COLOR_FUNC_RE = /\b(?:rgb|rgba|hsl|hsla)\s*\(/g;
export const FONT_FAMILY_RE = /font-family\s*:\s*['"][^'"\n]+['"]/gi;
// JSX inline style — `fontFamily: '...'` (camelCase, JS object syntax).
export const FONT_FAMILY_JSX_RE = /\bfontFamily\s*:\s*['"][^'"\n]+['"]/g;

/** Strings that are not "design tokens" and so do not require var(--*). */
export const COLOR_WHITELIST = new Set([
  'transparent',
  'inherit',
  'currentColor',
  'currentcolor',
  'none',
  'initial',
  'unset',
  'revert',
]);

/**
 * Files exempt from the rule entirely. Both `tokens.ts` (CSS-var source of
 * truth) and `template.ts` (preset seed — its `globalStyles` block holds the
 * same role) are legitimate definition sites for color values.
 */
export function isTokensFile(filePath: string): boolean {
  const base = path.basename(filePath);
  return (
    base === 'tokens.ts'   || base === 'tokens.tsx'   ||
    base === 'template.ts' || base === 'template.tsx'
  );
}

export type InlineTokenViolationCode =
  | 'INLINE_COLOR_LITERAL'
  | 'INLINE_FONT_LITERAL';

export interface InlineTokenViolation {
  code: InlineTokenViolationCode;
  line: number;
  column: number;
  match: string;
  /** Surrounding line content, trimmed (for human-readable error output). */
  context: string;
}

/**
 * Strip `//` line comments and `/* … *​/` block comments. Naive — does not
 * understand strings — but good enough to suppress comment false positives
 * since string literals containing hex are the very thing we want to catch.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, m => m.replace(/[^\n]/g, ' '));
}

/**
 * Scan a single source file's text for inline color / font-family literals.
 * Returns one violation per match, with 1-based line/column.
 */
export function scanInlineTokens(source: string): InlineTokenViolation[] {
  const stripped = stripComments(source);
  const violations: InlineTokenViolation[] = [];

  const push = (
    code: InlineTokenViolationCode,
    matchText: string,
    absoluteIndex: number,
  ) => {
    const before = stripped.slice(0, absoluteIndex);
    const line = before.split('\n').length;
    const column = absoluteIndex - before.lastIndexOf('\n');
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineEnd = stripped.indexOf('\n', absoluteIndex);
    const lineText = stripped
      .slice(lineStart, lineEnd === -1 ? stripped.length : lineEnd)
      .trim();
    violations.push({ code, line, column, match: matchText, context: lineText });
  };

  for (const re of [COLOR_HEX_RE, COLOR_FUNC_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(stripped)) !== null) {
      push('INLINE_COLOR_LITERAL', m[0], m.index);
    }
  }

  for (const re of [FONT_FAMILY_RE, FONT_FAMILY_JSX_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(stripped)) !== null) {
      push('INLINE_FONT_LITERAL', m[0], m.index);
    }
  }

  return violations;
}

/**
 * Scan every `library/**​/*.tsx` file under a template directory and
 * return ValidationIssue[]. Used by the template generation pipeline so
 * AI-emitted section components are gated before they land in the registry.
 *
 *   const issues = validateTemplateFiles('src/templates/cafe/default');
 *   if (issues.length > 0) throw new Error(...);
 */
export function validateTemplateFiles(templateDir: string): ValidationIssue[] {
  const libraryDir = path.join(templateDir, 'library');
  if (!fs.existsSync(libraryDir)) return [];

  const files = fs
    .readdirSync(libraryDir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.tsx'))
    .map(d => path.join(libraryDir, d.name));

  const issues: ValidationIssue[] = [];
  for (const file of files) {
    if (isTokensFile(file)) continue;
    const source = fs.readFileSync(file, 'utf-8');
    for (const v of scanInlineTokens(source)) {
      issues.push({
        code: v.code,
        message:
          v.code === 'INLINE_COLOR_LITERAL'
            ? `Inline color literal "${v.match}" — use var(--*) tokens instead`
            : `Inline font-family "${v.match}" — use var(--font-*) tokens instead`,
        path: `${path.relative(templateDir, file)}:${v.line}:${v.column}`,
      });
    }
  }

  return issues;
}
