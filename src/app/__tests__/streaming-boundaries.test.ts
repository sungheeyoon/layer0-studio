import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import path from 'path';

/**
 * A route that calls `notFound()` must not stream before it decides.
 *
 * Next flushes the response headers as soon as a Suspense fallback renders, and
 * the status is frozen from that moment. A `loading.tsx` in any *ancestor*
 * segment therefore downgrades every `notFound()` beneath it to a soft 404 —
 * the 404 body arrives with a 200 status. A root `src/app/loading.tsx` did this
 * to `/site/**` and `/preview/**` for as long as those routes existed; the
 * fallback now sits on the individual segments that want it.
 *
 * Prose does not survive the next person who adds a global spinner, so the rule
 * is a test: find the pages that call `notFound()`, walk their segment paths
 * back to `src/app`, and require every step to be free of a fallback.
 *
 * See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`
 * ("Status Codes").
 */

const APP_DIR = path.join(process.cwd(), 'src/app');

function pageFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === '__tests__' ? [] : pageFiles(full);
    }
    return entry === 'page.tsx' ? [full] : [];
  });
}

/** Every directory from the page's own segment up to `src/app`, inclusive. */
function segmentChain(pageFile: string): string[] {
  const chain: string[] = [];
  let dir = path.dirname(pageFile);
  while (dir.startsWith(APP_DIR)) {
    chain.push(dir);
    if (dir === APP_DIR) break;
    dir = path.dirname(dir);
  }
  return chain;
}

const notFoundPages = pageFiles(APP_DIR).filter((file) =>
  readFileSync(file, 'utf8').includes('notFound()'),
);

describe('routes that 404 must not be under a streaming boundary', () => {
  it('finds the pages that call notFound()', () => {
    // Sanity check on the discovery above: if this ever hits zero the suite
    // below would pass vacuously while the app went right on soft-404ing.
    expect(notFoundPages.length).toBeGreaterThan(0);
  });

  it.each(notFoundPages.map((f) => path.relative(process.cwd(), f)))(
    '%s has no loading.tsx in its own or any ancestor segment',
    (rel) => {
      const offending = segmentChain(path.join(process.cwd(), rel))
        .filter((dir) => existsSync(path.join(dir, 'loading.tsx')))
        .map((dir) => path.relative(process.cwd(), path.join(dir, 'loading.tsx')));

      expect(offending).toEqual([]);
    },
  );
});
