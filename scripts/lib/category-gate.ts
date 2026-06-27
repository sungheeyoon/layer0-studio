/**
 * New-category slug guard + approval gate for template authoring.
 *
 * Most new templates slot into an existing category dir (cafe, corporate, …).
 * When a new template proposes a category that doesn't exist on disk, we don't
 * silently bootstrap a new top-level dir — that's a structural change worth
 * a human "yes". This module is the gate.
 *
 * No fuzzy matching: `cafe-studio` is treated as a brand-new category,
 * NOT a variant of `cafe`. Strict slug regex enforces lowercase + hyphen
 * conventions so a malformed LLM output (e.g. `Cafe`, `cafe_bar`) fails
 * loudly instead of poisoning the filesystem.
 */

import fs from 'fs';
import path from 'path';

/**
 * AC slug guard: `^[a-z][a-z0-9-]{0,39}$` — must start with a letter,
 * lowercase alphanumeric + hyphen only, max 40 chars.
 */
export const CATEGORY_SLUG_RE = /^[a-z][a-z0-9-]{0,39}$/;

export function validateCategorySlug(slug: string): { ok: true } | { ok: false; reason: string } {
  if (!slug) return { ok: false, reason: 'category slug is empty' };
  if (!CATEGORY_SLUG_RE.test(slug)) {
    return {
      ok: false,
      reason: `category "${slug}" violates slug rule ^[a-z][a-z0-9-]{0,39}$ — must start with lowercase letter, contain only lowercase letters / digits / hyphens, ≤ 40 chars`,
    };
  }
  return { ok: true };
}

/**
 * Return true if `src/templates/<category>/` exists as a directory.
 * Strict equality — no fuzzy match. `cafe-studio` won't satisfy `cafe`.
 */
export function isExistingCategory(category: string, templatesDir = defaultTemplatesDir()): boolean {
  if (!validateCategorySlug(category).ok) return false; // malformed → treat as new
  const target = path.join(templatesDir, category);
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

/**
 * List all existing category dirs (for UX — show alternatives when the user
 * rejects a new-category proposal).
 */
export function listExistingCategories(templatesDir = defaultTemplatesDir()): string[] {
  try {
    return fs
      .readdirSync(templatesDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && validateCategorySlug(d.name).ok)
      .map(d => d.name)
      .sort();
  } catch {
    return [];
  }
}

function defaultTemplatesDir(): string {
  return path.join(process.cwd(), 'src', 'templates');
}
