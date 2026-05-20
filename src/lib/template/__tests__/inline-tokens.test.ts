import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  scanInlineTokens,
  validateTemplateFiles,
  isTokensFile,
  COLOR_WHITELIST,
} from '../inline-tokens';

describe('scanInlineTokens', () => {
  it('flags 6-digit hex literal', () => {
    const v = scanInlineTokens(`const c = "#ff0000";`);
    expect(v).toHaveLength(1);
    expect(v[0].code).toBe('INLINE_COLOR_LITERAL');
    expect(v[0].match).toBe('#ff0000');
  });

  it('flags 3-digit hex literal', () => {
    const v = scanInlineTokens(`<div style={{ color: '#fff' }} />`);
    expect(v.some(x => x.match === '#fff')).toBe(true);
  });

  it('flags 8-digit hex literal (with alpha)', () => {
    const v = scanInlineTokens(`const c = "#ff0000aa";`);
    expect(v.some(x => x.match === '#ff0000aa')).toBe(true);
  });

  it('flags rgb() / rgba() calls', () => {
    const v = scanInlineTokens(`<p style={{ color: 'rgba(0,0,0,0.5)' }} />`);
    expect(v.some(x => x.code === 'INLINE_COLOR_LITERAL' && /rgba/.test(x.match))).toBe(true);
  });

  it('flags hsl() / hsla() calls', () => {
    const v = scanInlineTokens(`const c = 'hsl(120, 50%, 50%)';`);
    expect(v.some(x => x.code === 'INLINE_COLOR_LITERAL' && /hsl/.test(x.match))).toBe(true);
  });

  it('flags font-family CSS string', () => {
    const v = scanInlineTokens(`const x = "font-family: 'Helvetica', sans-serif";`);
    expect(v.some(x => x.code === 'INLINE_FONT_LITERAL')).toBe(true);
  });

  it('flags fontFamily JSX inline-style', () => {
    const v = scanInlineTokens(`<div style={{ fontFamily: 'Inter' }} />`);
    expect(v.some(x => x.code === 'INLINE_FONT_LITERAL')).toBe(true);
  });

  it('does NOT flag CSS-wide keywords (inherit / initial / unset / revert) as font literals', () => {
    expect(scanInlineTokens(`<div style={{ fontFamily: 'inherit' }} />`)).toHaveLength(0);
    expect(scanInlineTokens(`<div style={{ fontFamily: 'initial' }} />`)).toHaveLength(0);
    expect(scanInlineTokens(`const x = "font-family: 'unset'";`)).toHaveLength(0);
  });

  it('does NOT flag var(--font-*) references as font literals', () => {
    expect(scanInlineTokens(`<div style={{ fontFamily: 'var(--font-base)' }} />`)).toHaveLength(0);
    expect(scanInlineTokens(`<div style={{ fontFamily: 'var(--font-serif, Georgia)' }} />`)).toHaveLength(0);
    expect(scanInlineTokens(`const x = "font-family: var(--font-base)";`)).toHaveLength(0);
  });

  it('passes var(--*) token references', () => {
    const v = scanInlineTokens(`<div style={{ color: 'var(--c-terra)', background: 'var(--c-bg)' }} />`);
    expect(v).toHaveLength(0);
  });

  it('does NOT flag a longer hex identifier-looking word', () => {
    // 9 chars after # — must not match.
    const v = scanInlineTokens(`const id = "#abcdef1234";`);
    expect(v.some(x => x.code === 'INLINE_COLOR_LITERAL')).toBe(false);
  });

  it('does NOT flag hex-shaped prefix of an anchor link / identifier', () => {
    // `#fac` is hex-shaped but followed by alpha char `i` — clearly an
    // anchor like `#facility`, not a color literal.
    expect(scanInlineTokens(`<a href="#facility">x</a>`)).toHaveLength(0);
    expect(scanInlineTokens(`const x = '#cafeteria';`)).toHaveLength(0);
    expect(scanInlineTokens(`<a href="#feed_me">x</a>`)).toHaveLength(0);
  });

  it('still flags hex followed by punctuation / quote / end-of-string', () => {
    expect(scanInlineTokens(`const c = '#fff';`)).toHaveLength(1);
    expect(scanInlineTokens(`color: #fff,`)).toHaveLength(1);
    expect(scanInlineTokens(`#fff`)).toHaveLength(1);
  });

  it('ignores literal text inside line comments', () => {
    const v = scanInlineTokens(`// brand was #ff0000\nconst c = 'var(--brand)';`);
    expect(v).toHaveLength(0);
  });

  it('ignores literal text inside block comments', () => {
    const v = scanInlineTokens(`/* swatch: #fff #000 */ const c = 'var(--brand)';`);
    expect(v).toHaveLength(0);
  });

  it('preserves line numbers across multi-line input', () => {
    const src = `line1\nline2 "#abc"\nline3`;
    const v = scanInlineTokens(src);
    expect(v[0].line).toBe(2);
  });

  // Whitelist values are CSS keywords, not "design tokens" — the scanner
  // only emits matches against the literal regex (hex/rgb/hsl/font-family),
  // so plain "transparent" never appears as a hit. The whitelist exists for
  // the ESLint rule's full-string equality check.
  describe('whitelist (CSS keyword) values are never matched by regex', () => {
    for (const keyword of COLOR_WHITELIST) {
      it(`"${keyword}" produces no violations`, () => {
        const v = scanInlineTokens(`const c = '${keyword}';`);
        expect(v).toHaveLength(0);
      });
    }
  });
});

describe('isTokensFile', () => {
  it('matches tokens.ts / tokens.tsx', () => {
    expect(isTokensFile('/x/y/tokens.ts')).toBe(true);
    expect(isTokensFile('/x/y/tokens.tsx')).toBe(true);
  });
  it('matches template.ts / template.tsx (preset seed = token definition site)', () => {
    expect(isTokensFile('/x/y/template.ts')).toBe(true);
    expect(isTokensFile('/x/y/template.tsx')).toBe(true);
  });
  it('rejects other filenames', () => {
    expect(isTokensFile('/x/y/Hero.tsx')).toBe(false);
    expect(isTokensFile('/x/y/my-tokens.ts')).toBe(false);
  });
});

describe('validateTemplateFiles', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-tokens-'));
    const libDir = path.join(tmpDir, 'library');
    fs.mkdirSync(libDir, { recursive: true });

    // Clean component — should produce zero violations.
    fs.writeFileSync(
      path.join(libDir, 'Clean.tsx'),
      `export default function C() { return <div style={{ color: 'var(--c-terra)' }} />; }\n`,
    );

    // Dirty component — two violations.
    fs.writeFileSync(
      path.join(libDir, 'Dirty.tsx'),
      `export default function C() {
  return <div style={{ color: '#ff0000', fontFamily: 'Inter' }} />;
}
`,
    );

    // tokens.ts at the template root — must be exempt.
    fs.writeFileSync(
      path.join(tmpDir, 'tokens.ts'),
      `export const c = '#ff0000';\n`,
    );

    // Non-tsx file in library — must be ignored (only *.tsx scanned).
    fs.writeFileSync(
      path.join(libDir, 'README.md'),
      `Use #ff0000 for brand.\n`,
    );
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('emits issues with code + relative path:line:column', () => {
    const issues = validateTemplateFiles(tmpDir);
    expect(issues.length).toBeGreaterThanOrEqual(2);
    const codes = issues.map(i => i.code).sort();
    expect(codes).toContain('INLINE_COLOR_LITERAL');
    expect(codes).toContain('INLINE_FONT_LITERAL');

    for (const i of issues) {
      expect(i.path).toMatch(/^library\/Dirty\.tsx:\d+:\d+$/);
    }
  });

  it('skips tokens.ts and non-tsx files', () => {
    const issues = validateTemplateFiles(tmpDir);
    expect(issues.every(i => !i.path?.includes('tokens.ts'))).toBe(true);
    expect(issues.every(i => !i.path?.includes('README.md'))).toBe(true);
  });

  it('returns empty array when library/ is absent', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-tokens-empty-'));
    try {
      expect(validateTemplateFiles(empty)).toEqual([]);
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});
