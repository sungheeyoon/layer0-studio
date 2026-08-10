// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { templateMap, presetMap, getAvailableTemplateKeys } from '@/templates/_generated';
import { isMultiContent } from '@/domain/entities/template.entity';

// @testing-library's auto-cleanup only self-registers under `globals: true`,
// which this repo does not use.
afterEach(cleanup);

/**
 * The gate the ADR-0016 conversion was missing.
 *
 * A Template whose renderer expects Values while its preset still holds `Field`
 * objects passes `tsc`, `test`, `lint` *and* `template:verify:ci` — every one of
 * those reads the two halves separately. Only putting the preset through the
 * real renderer catches it, and it catches it as a thrown `.map is not a
 * function` rather than a subtle diff.
 *
 * Runs over the whole registry, driven by `getAvailableTemplateKeys()` — a new
 * Template is covered the day its directory appears. While the ADR-0016
 * conversion was in flight this walked a hand-kept list of converted Templates;
 * #136 converted the last of them and deleted the list.
 */
describe('registry render smoke — a preset must render through its own renderer', () => {
  const keys = getAvailableTemplateKeys();

  it('covers every Template in the registry', () => {
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.every((k) => templateMap[k] && presetMap[k])).toBe(true);
  });

  for (const templateKey of keys) {
    it(`${templateKey} renders its preset`, async () => {
      const [{ default: Renderer }, { default: preset }] = await Promise.all([
        templateMap[templateKey](),
        presetMap[templateKey](),
      ]);
      const content = preset.content;

      // `renderSingleSite`/`renderMultiSite` swallow an unknown componentKey with
      // a console.warn and render nothing — which would let a whole Template pass
      // this test as blank markup. Fail on it instead.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Multi renders one page at a time, so every page has to be visited: a
      // broken block on page 5 is invisible from the home page.
      const pageIds = isMultiContent(content)
        ? content.pages.map((p) => p.id)
        : [undefined];

      for (const activePageId of pageIds) {
        const { container } = render(
          <Renderer content={content} selectedSectionId={null} activePageId={activePageId} />,
        );
        expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(0);
        cleanup();
      }

      const warnings = warn.mock.calls.map((c) => String(c[0]));
      warn.mockRestore();
      expect(warnings.filter((w) => w.includes('Component not found'))).toEqual([]);
    });
  }
});
