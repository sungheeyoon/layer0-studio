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

  // ── array fields (the #array-gate false positive these tests lock out) ──────

  it('passes an array field accessed via data["items"] + item sub-keys', () => {
    writeTsx(root, 'Menu', `
      const Menu = ({ section }) => {
        const { data } = section;
        const title = getFieldValue(data, 'title');
        const itemsField = data['items'];
        const items = itemsField?.type === 'array' ? itemsField.items : [];
        return <ul>{items.map(item => (
          <li>{getFieldValue(item.name)}{getFieldValue(item.price)}</li>
        ))}</ul>;
      };

      Menu.meta = {
        componentKey: 'menu', category: 'menu', label: 'Menu',
        dataSchema: {
          title: { type: 'text', label: '제목' },
          items: {
            type: 'array', label: '항목',
            itemSchema: {
              name: { type: 'text', label: '이름' },
              price: { type: 'text', label: '가격' },
            },
          },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
  });

  it('passes an array accessed via section.data.items member form', () => {
    writeTsx(root, 'Grid', `
      const Grid = ({ section }) => {
        const heading = getFieldValue(section.data, 'heading');
        const items = (section.data.items)?.items ?? [];
        return <div>{items.map(item => <span>{getFieldValue(item.label)}</span>)}</div>;
      };

      Grid.meta = {
        componentKey: 'grid', category: 'grid', label: 'Grid',
        dataSchema: {
          heading: { type: 'text', label: '제목' },
          items: { type: 'array', label: '항목', itemSchema: { label: { type: 'text', label: '라벨' } } },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
  });

  it('FAILS when an array is declared but never iterated', () => {
    writeTsx(root, 'Dead', `
      const Dead = ({ section }) => {
        const { data } = section;
        return <h2>{getFieldValue(data, 'heading')}</h2>;
      };

      Dead.meta = {
        componentKey: 'dead', category: 'x', label: 'Dead',
        dataSchema: {
          heading: { type: 'text', label: '제목' },
          items: { type: 'array', label: '항목', itemSchema: { label: { type: 'text', label: '라벨' } } },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/array field "items" declared .* never read/);
  });

  it('FAILS when an item sub-field is declared but never read, and when one is read but not declared', () => {
    writeTsx(root, 'Items', `
      const Items = ({ section }) => {
        const items = (section.data.items)?.items ?? [];
        return <ul>{items.map(item => (
          <li>{getFieldValue(item.title)}{getFieldValue(item.stray)}</li>
        ))}</ul>;
      };

      Items.meta = {
        componentKey: 'items', category: 'x', label: 'Items',
        dataSchema: {
          items: {
            type: 'array', label: '항목',
            itemSchema: {
              title: { type: 'text', label: '제목' },
              unusedSub: { type: 'text', label: '안씀' },
            },
          },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    const msg = r.messages.join('\n');
    expect(msg).toMatch(/item field "unusedSub" declared in itemSchema but never read/);
    expect(msg).toMatch(/item field "stray" read .* but not declared in any itemSchema/);
  });

  // ── computed & dynamic key access (legacy numbered-field patterns) ───────────

  it('passes numbered fields read via a computed template-literal key', () => {
    writeTsx(root, 'Stats', `
      const Stats = ({ section }) => {
        const { data } = section;
        const stats = [1, 2, 3].map(n => ({
          value: getFieldValue(data, \`stat\${n}Value\`),
          label: getFieldValue(data, \`stat\${n}Label\`),
        }));
        return <div>{stats.length}</div>;
      };

      Stats.meta = {
        componentKey: 'stats', category: 'x', label: 'Stats',
        dataSchema: {
          stat1Value: { type: 'text', label: '' }, stat1Label: { type: 'text', label: '' },
          stat2Value: { type: 'text', label: '' }, stat2Label: { type: 'text', label: '' },
          stat3Value: { type: 'text', label: '' }, stat3Label: { type: 'text', label: '' },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
  });

  it('backs off "declared but unused" for components that enumerate data dynamically', () => {
    writeTsx(root, 'Features', `
      const Features = ({ section }) => {
        const { data } = section;
        const features = Object.entries(data).filter(([key]) => !['title'].includes(key));
        return <div>{features.map(([key, field]) => (
          <p key={key}>{field.label}{getFieldValue(data, key)}</p>
        ))}</div>;
      };

      Features.meta = {
        componentKey: 'features', category: 'x', label: 'Features',
        dataSchema: {
          title: { type: 'text', label: '제목' },
          strategy: { type: 'text', label: 'Strategy' },
          design: { type: 'text', label: 'Design' },
        },
      };
    `);

    const r = checkDataSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
  });
});
