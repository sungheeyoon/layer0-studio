import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  CATEGORY_SLUG_RE,
  validateCategorySlug,
  isExistingCategory,
  listExistingCategories,
} from '../category-gate';

describe('CATEGORY_SLUG_RE / validateCategorySlug', () => {
  for (const valid of ['cafe', 'a', 'real-estate', 'medical-2', 'fitness-pro-x', 'a' + '1'.repeat(39)]) {
    it(`accepts "${valid}"`, () => {
      expect(CATEGORY_SLUG_RE.test(valid)).toBe(true);
      expect(validateCategorySlug(valid).ok).toBe(true);
    });
  }

  for (const bad of [
    '',
    'Cafe',          // uppercase
    '-cafe',         // starts with hyphen
    '1cafe',         // starts with digit
    'cafe_bar',      // underscore
    'cafe bar',      // space
    'a' + '1'.repeat(40), // 41 chars
    'cafe!',
    'café',          // non-ASCII
  ]) {
    it(`rejects "${bad}"`, () => {
      expect(CATEGORY_SLUG_RE.test(bad)).toBe(false);
      const r = validateCategorySlug(bad);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBeTruthy();
    });
  }
});

describe('isExistingCategory / listExistingCategories', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cat-gate-'));
    // Mimic src/templates/<cat>/ layout — only dirs, names are categories.
    for (const cat of ['cafe', 'wedding', 'real-estate']) {
      fs.mkdirSync(path.join(tmpRoot, cat));
    }
    // A non-directory entry should be ignored by listExistingCategories.
    fs.writeFileSync(path.join(tmpRoot, 'README.md'), '# templates');
    // A dir whose name violates the slug rule should NOT count as a category.
    fs.mkdirSync(path.join(tmpRoot, 'Bad_Name'));
  });
  afterEach(() => { fs.rmSync(tmpRoot, { recursive: true, force: true }); });

  it('reports existing categories as existing', () => {
    expect(isExistingCategory('cafe', tmpRoot)).toBe(true);
    expect(isExistingCategory('wedding', tmpRoot)).toBe(true);
    expect(isExistingCategory('real-estate', tmpRoot)).toBe(true);
  });

  it('reports non-existing categories as new', () => {
    expect(isExistingCategory('legal', tmpRoot)).toBe(false);
    expect(isExistingCategory('newcategory', tmpRoot)).toBe(false);
  });

  it('uses exact match only — no fuzzy', () => {
    // "cafe-studio" exists nowhere — treated as new even though "cafe" exists.
    expect(isExistingCategory('cafe-studio', tmpRoot)).toBe(false);
  });

  it('treats slug-violating input as new (defensive)', () => {
    expect(isExistingCategory('Bad_Name', tmpRoot)).toBe(false); // even though dir exists
    expect(isExistingCategory('CAFE', tmpRoot)).toBe(false);
  });

  it('listExistingCategories returns sorted valid-slug dirs only', () => {
    const list = listExistingCategories(tmpRoot);
    expect(list).toEqual(['cafe', 'real-estate', 'wedding']); // sorted, Bad_Name excluded
  });

  it('returns [] when templates dir does not exist', () => {
    expect(listExistingCategories(path.join(tmpRoot, '__missing__'))).toEqual([]);
  });
});
