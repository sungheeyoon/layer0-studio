import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

/**
 * ADR-0008's registry-isolation rule, as a test rather than as prose.
 *
 * The data layer implements repository interfaces the domain owns; it must not
 * reach outward into `@/lib` or `@/templates`. The rule had already been broken
 * once — `SupabaseUserSiteRepositoryImpl.updateContent` imported
 * `collectAssetUsages` from `@/lib/template` — and nothing failed, because a
 * type-checked import is invisible to every other gate. ADR-0016 §5 is what made
 * it bite: the schema-driven collector needs the Template library, so that one
 * import would have dragged `loadTemplate()` into the data layer, and from there
 * onto every read path that shares the module.
 *
 * `@/domain` and `@/types` are the allowed inward/shared dependencies.
 */
const FORBIDDEN = /from\s+'@\/(lib|templates|components|app)\b/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === '__tests__' ? [] : sourceFiles(full);
    }
    return full.endsWith('.ts') || full.endsWith('.tsx') ? [full] : [];
  });
}

describe('data layer imports (ADR-0008)', () => {
  const files = sourceFiles(path.join(process.cwd(), 'src/data'));

  it('finds the data layer sources to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => path.relative(process.cwd(), f)))(
    '%s imports nothing outward from the data layer',
    (rel) => {
      const offending = readFileSync(path.join(process.cwd(), rel), 'utf8')
        .split('\n')
        .filter((line) => FORBIDDEN.test(line));
      expect(offending).toEqual([]);
    },
  );
});
