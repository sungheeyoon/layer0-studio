import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { checkDataSchemaJsxConsistency } from '../validate-and-capture';

function setupTemplate(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vac-test-'));
  fs.mkdirSync(path.join(root, 'library'));
  return root;
}

function writeTsx(root: string, name: string, content: string) {
  fs.writeFileSync(path.join(root, 'library', `${name}.tsx`), content);
}

function writeMetaSibling(root: string, name: string, content: string) {
  fs.writeFileSync(path.join(root, 'library', `${name}.meta.ts`), content);
}

describe('checkDataSchemaJsxConsistency', () => {
  let root: string;
  beforeEach(() => { root = setupTemplate(); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  it('passes when declared keys exactly match getFieldValue references', () => {
    writeTsx(root, 'Hero', `
      const Hero = ({ section }) => {
        const { data } = section;
        const title = getFieldValue(data, 'title');
        const subtitle = getFieldValue(data, 'subtitle');
        return <h1>{title}{subtitle}</h1>;
      };

      Hero.meta = {
        componentKey: 'hero',
        category: 'hero',
        label: 'Hero',
        dataSchema: {
          title: { type: 'text', label: '제목' },
          subtitle: { type: 'text', label: '부제' },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
  });

  it('FAILS when a field is declared but never read', () => {
    writeTsx(root, 'Hero', `
      const Hero = ({ section }) => {
        const title = getFieldValue(section.data, 'title');
        return <h1>{title}</h1>;
      };

      Hero.meta = {
        componentKey: 'hero',
        label: 'Hero',
        dataSchema: {
          title:    { type: 'text', label: '제목' },
          unused:   { type: 'text', label: '안 쓰는 필드' },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/"unused" declared in dataSchema but never read/);
  });

  it('FAILS when a getFieldValue references a key not in dataSchema', () => {
    writeTsx(root, 'Hero', `
      const Hero = ({ section }) => {
        const { data } = section;
        const title = getFieldValue(data, 'title');
        const stray = getFieldValue(data, 'mystery');
        return <h1>{title}{stray}</h1>;
      };

      Hero.meta = {
        componentKey: 'hero',
        label: 'Hero',
        dataSchema: {
          title: { type: 'text', label: '제목' },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/"mystery" read via getFieldValue but not declared/);
  });

  it('reads dataSchema from sibling .meta.ts when present (client component pattern)', () => {
    writeTsx(root, 'Nav', `
      'use client';
      const Nav = ({ section }) => {
        const { data } = section;
        const brand = getFieldValue(data, 'brand');
        return <nav>{brand}</nav>;
      };
      export default Nav;
    `);
    writeMetaSibling(root, 'Nav', `
      export const navMeta = {
        componentKey: 'nav',
        category: 'nav',
        label: 'Nav',
        dataSchema: {
          brand: { type: 'text', label: '브랜드' },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
  });

  it('skips files with no dataSchema literal (helper modules)', () => {
    writeTsx(root, 'helpers', `
      // helper module — no Component, no meta
      export function utility(x: string) { return x.toUpperCase(); }
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
    expect(r.messages.join('\n')).toMatch(/0 files|consistent/);
  });

  it('reports all violations across multiple files in a single pass', () => {
    writeTsx(root, 'Hero', `
      const Hero = ({ section }) => {
        const t = getFieldValue(section.data, 'title');
        return <h1>{t}</h1>;
      };
      Hero.meta = {
        componentKey: 'hero',
        label: 'Hero',
        dataSchema: { title: { type: 'text', label: '제목' }, unused: { type: 'text', label: '' } },
      };
    `);
    writeTsx(root, 'Footer', `
      const Footer = ({ section }) => {
        const t = getFieldValue(section.data, 'extra');
        return <footer>{t}</footer>;
      };
      Footer.meta = {
        componentKey: 'footer',
        label: 'Footer',
        dataSchema: { copyright: { type: 'text', label: '' } },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    const msg = r.messages.join('\n');
    expect(msg).toMatch(/Hero\.tsx.*"unused" declared/);
    expect(msg).toMatch(/Footer\.tsx.*"copyright" declared/);
    expect(msg).toMatch(/Footer\.tsx.*"extra" read .* not declared/);
  });

  it('handles missing library/ dir gracefully', () => {
    const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vac-empty-'));
    try {
      const r = checkDataSchemaJsxConsistency(emptyRoot);
      expect(r.ok).toBe(true);
      expect(r.messages.join('\n')).toMatch(/no library/);
    } finally {
      fs.rmSync(emptyRoot, { recursive: true, force: true });
    }
  });
});
