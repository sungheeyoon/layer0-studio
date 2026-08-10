import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { checkFieldsSchemaJsxConsistency } from '../validate-and-capture';

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

/**
 * The check's one remaining direction after ADR-0016: a field the schema
 * declares (so the editor renders an input for it) that the component never
 * reads (so editing it changes nothing on screen).
 *
 * The opposite direction — reading a key the schema does not declare — is not
 * tested here because it is no longer this function's job: `ValuesOf<typeof
 * schema>` makes it a compile error.
 */
describe('checkFieldsSchemaJsxConsistency', () => {
  let root: string;
  beforeEach(() => { root = setupTemplate(); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  it('passes when every declared field is read off the cast Content', () => {
    writeTsx(root, 'Hero', `
      const heroSchema = {
        title: { type: 'text', label: '제목' },
        subtitle: { type: 'text', label: '부제' },
      } as const satisfies FieldsSchema;

      const Hero = ({ section }) => {
        const content = section.fields as ValuesOf<typeof heroSchema>;
        return <h1>{content.title}<span>{content.subtitle}</span></h1>;
      };
      Hero.meta = { componentKey: 'hero', category: 'hero', label: 'Hero', fieldsSchema: heroSchema };
      export default Hero;
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
    expect(r.messages.join('\n')).toMatch(/across 1 component/);
  });

  it('FAILS when a declared field is never read', () => {
    writeTsx(root, 'Hero', `
      const heroSchema = {
        title: { type: 'text', label: '제목' },
        mystery: { type: 'text', label: '아무도 안 읽음' },
      } as const satisfies FieldsSchema;

      const Hero = ({ section }) => {
        const content = section.fields as ValuesOf<typeof heroSchema>;
        return <h1>{content.title}</h1>;
      };
      Hero.meta = { componentKey: 'hero', category: 'hero', label: 'Hero', fieldsSchema: heroSchema };
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/"mystery" declared in fieldsSchema but never read/);
  });

  // The bug that made the pre-ADR-0016 version of this check inert: it matched
  // key names against the whole file, and the schema declaration is *in* the
  // file — so every key trivially "referenced" itself.
  it('does not count the schema declaration itself as a read', () => {
    writeTsx(root, 'Hero', `
      const heroSchema = {
        deadOne: { type: 'text', label: 'deadOne appears only here' },
      } as const satisfies FieldsSchema;

      const Hero = () => <h1>nothing</h1>;
      Hero.meta = { componentKey: 'hero', category: 'hero', label: 'Hero', fieldsSchema: heroSchema };
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/"deadOne" declared/);
  });

  it('reads the schema from a sibling .meta.ts (client component pattern)', () => {
    writeTsx(root, 'Nav', `
      'use client';
      import { navigationSchema } from './Nav.meta';
      const Nav = ({ section }) => {
        const content = section.fields as ValuesOf<typeof navigationSchema>;
        return <nav>{content.brand}</nav>;
      };
      export default Nav;
    `);
    writeMetaSibling(root, 'Nav', `
      export const navigationSchema = {
        brand: { type: 'text', label: '브랜드' },
      } as const satisfies FieldsSchema;

      export const navMeta = { componentKey: 'nav', category: 'nav', label: 'Nav', fieldsSchema: navigationSchema };
    `);

    expect(checkFieldsSchemaJsxConsistency(root).ok).toBe(true);

    // …and a dead field declared over there is still caught, even though the
    // .tsx that must read it is a different file.
    writeMetaSibling(root, 'Nav', `
      export const navigationSchema = {
        brand: { type: 'text', label: '브랜드' },
        tagline: { type: 'text', label: '안 읽힘' },
      } as const satisfies FieldsSchema;
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/Nav\.tsx.*"tagline" declared/);
  });

  it('skips files with no schema (helper modules)', () => {
    writeTsx(root, 'helpers', `
      // helper module — no Component, no meta
      export function utility(x: string) { return x.toUpperCase(); }
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(true);
    expect(r.messages.join('\n')).toMatch(/across 0 component/);
  });

  it('reports violations across multiple files in a single pass', () => {
    writeTsx(root, 'Hero', `
      const heroSchema = { title: { type: 'text', label: '' }, unused: { type: 'text', label: '' } } as const satisfies FieldsSchema;
      const Hero = ({ section }) => <h1>{(section.fields as X).title}</h1>;
    `);
    writeTsx(root, 'Footer', `
      const footerSchema = { copyright: { type: 'text', label: '' } } as const satisfies FieldsSchema;
      const Footer = () => <footer>©</footer>;
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    const msg = r.messages.join('\n');
    expect(msg).toMatch(/Hero\.tsx.*"unused" declared/);
    expect(msg).toMatch(/Footer\.tsx.*"copyright" declared/);
  });

  it('handles missing library/ dir gracefully', () => {
    const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vac-empty-'));
    try {
      const r = checkFieldsSchemaJsxConsistency(emptyRoot);
      expect(r.ok).toBe(true);
      expect(r.messages.join('\n')).toMatch(/no library/);
    } finally {
      fs.rmSync(emptyRoot, { recursive: true, force: true });
    }
  });

  // ── array fields ────────────────────────────────────────────────────────────
  //
  // An array Value is a plain `{ id, fields }[]`, so its item keys are read as
  // `item.fields.<key>` — one level deeper than the array key itself.

  it('passes an array whose items are mapped and whose sub-keys are read', () => {
    writeTsx(root, 'Menu', `
      const menuSchema = {
        title: { type: 'text', label: '제목' },
        items: {
          type: 'array', label: '항목',
          itemSchema: { name: { type: 'text', label: '이름' }, price: { type: 'text', label: '가격' } },
        },
      } as const satisfies FieldsSchema;

      const Menu = ({ section }) => {
        const content = section.fields as ValuesOf<typeof menuSchema>;
        return <><h2>{content.title}</h2><ul>{(content.items ?? []).map(item => (
          <li key={item.id}>{item.fields.name}{item.fields.price}</li>
        ))}</ul></>;
      };
    `);

    expect(checkFieldsSchemaJsxConsistency(root).ok).toBe(true);
  });

  it('FAILS when an array is declared but never iterated', () => {
    writeTsx(root, 'Dead', `
      const deadSchema = {
        heading: { type: 'text', label: '제목' },
        items: { type: 'array', label: '항목', itemSchema: { label: { type: 'text', label: '라벨' } } },
      } as const satisfies FieldsSchema;

      const Dead = ({ section }) => <h2>{(section.fields as X).heading}</h2>;
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/"items" declared in fieldsSchema but never read/);
  });

  it('FAILS when an item sub-field is declared but never read', () => {
    writeTsx(root, 'Items', `
      const itemsSchema = {
        items: {
          type: 'array', label: '항목',
          itemSchema: { title: { type: 'text', label: '제목' }, unusedSub: { type: 'text', label: '안씀' } },
        },
      } as const satisfies FieldsSchema;

      const Items = ({ section }) => {
        const content = section.fields as ValuesOf<typeof itemsSchema>;
        return <ul>{content.items.map(item => <li key={item.id}>{item.fields.title}</li>)}</ul>;
      };
    `);

    const r = checkFieldsSchemaJsxConsistency(root);
    expect(r.ok).toBe(false);
    expect(r.messages.join('\n')).toMatch(/item field "unusedSub" declared in itemSchema but never read/);
  });

  // ── computed & dynamic key access ───────────────────────────────────────────

  it('passes numbered fields read via a computed template-literal key', () => {
    writeTsx(root, 'Stats', `
      const statsSchema = {
        stat1Value: { type: 'text', label: '' }, stat1Label: { type: 'text', label: '' },
        stat2Value: { type: 'text', label: '' }, stat2Label: { type: 'text', label: '' },
      } as const satisfies FieldsSchema;

      const Stats = ({ section }) => {
        const content = section.fields as ValuesOf<typeof statsSchema>;
        const stats = ([1, 2] as const).map(n => ({
          value: content[\`stat\${n}Value\`],
          label: content[\`stat\${n}Label\`],
        }));
        return <div>{stats.length}</div>;
      };
    `);

    expect(checkFieldsSchemaJsxConsistency(root).ok).toBe(true);
  });

  it('backs off entirely for components that enumerate their fields dynamically', () => {
    writeTsx(root, 'Features', `
      const featuresSchema = {
        title: { type: 'text', label: '제목' },
        strategy: { type: 'text', label: 'Strategy' },
        design: { type: 'text', label: 'Design' },
      } as const satisfies FieldsSchema;

      const Features = ({ section }) => {
        const content = section.fields as ValuesOf<typeof featuresSchema>;
        const rows = Object.entries(content).filter(([key]) => key !== 'title');
        return <div>{rows.map(([key]) => <p key={key}>{content[key]}</p>)}</div>;
      };
    `);

    expect(checkFieldsSchemaJsxConsistency(root).ok).toBe(true);
  });
});
