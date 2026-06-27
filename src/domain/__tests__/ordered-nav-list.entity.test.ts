import { describe, it, expect } from 'vitest';
import {
  moveItem,
  reorderItem,
  toggleVisible,
  toggleNavVisible,
  relabelNav,
  isSinglePinned,
  moveNavItem,
  reorderNavItem,
  toggleNavItemVisible,
  toggleNavItemNavVisible,
  relabelNavItem,
} from '../entities/ordered-nav-list';
import {
  SinglePageTemplate,
  MultiPageTemplate,
  SingleSection,
  TemplatePage,
} from '../entities/template.entity';

const globalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '16px',
  layout: 'wide',
};

function section(id: string, type: string, visible = true, navVisible = true): SingleSection {
  return { id, type, visible, nav: { visible: navVisible, label: id }, data: {} };
}

function page(id: string, visible = true, navVisible = true): TemplatePage {
  return { id, slug: id, visible, nav: { visible: navVisible, label: id }, sections: [] };
}

// Single shape: nav pinned top, footer pinned bottom, three middle sections.
const singleSections = (): SingleSection[] => [
  section('nav', 'nav'),
  section('a', 'hero'),
  section('b', 'about'),
  section('c', 'contact'),
  section('footer', 'footer'),
];

const ids = (items: { id: string }[]) => items.map((x) => x.id);

describe('moveItem — reorder with pin enforcement', () => {
  it('moves a middle item up and down', () => {
    const arr = singleSections();
    expect(ids(moveItem(arr, 'b', 'up', isSinglePinned))).toEqual([
      'nav', 'b', 'a', 'c', 'footer',
    ]);
    expect(ids(moveItem(arr, 'b', 'down', isSinglePinned))).toEqual([
      'nav', 'a', 'c', 'b', 'footer',
    ]);
  });

  it('will not swap a middle item past a pin (nav stays top / footer stays bottom)', () => {
    const arr = singleSections();
    // 'a' is adjacent to the pinned nav; moving up would cross it → no-op.
    expect(moveItem(arr, 'a', 'up', isSinglePinned)).toBe(arr);
    // 'c' is adjacent to the pinned footer; moving down would cross it → no-op.
    expect(moveItem(arr, 'c', 'down', isSinglePinned)).toBe(arr);
  });

  it('will not move a pinned item itself', () => {
    const arr = singleSections();
    expect(moveItem(arr, 'nav', 'down', isSinglePinned)).toBe(arr);
    expect(moveItem(arr, 'footer', 'up', isSinglePinned)).toBe(arr);
  });

  it('no-ops at the list boundary (no pin rule)', () => {
    const arr = [page('p1'), page('p2')];
    expect(moveItem(arr, 'p1', 'up')).toBe(arr);
    expect(moveItem(arr, 'p2', 'down')).toBe(arr);
  });

  it('no-ops on an unknown id', () => {
    const arr = singleSections();
    expect(moveItem(arr, 'nope', 'up', isSinglePinned)).toBe(arr);
  });

  it('reorders freely with no pin predicate (Multi pages)', () => {
    const arr = [page('p1'), page('p2'), page('p3')];
    expect(ids(moveItem(arr, 'p1', 'down'))).toEqual(['p2', 'p1', 'p3']);
  });

  it('does not mutate the input array', () => {
    const arr = singleSections();
    const before = ids(arr);
    moveItem(arr, 'b', 'up', isSinglePinned);
    expect(ids(arr)).toEqual(before);
  });
});

describe('reorderItem — drag-and-drop reorder with pin enforcement', () => {
  it('moves an item to another slot (arrayMove semantics)', () => {
    const arr = singleSections();
    expect(ids(reorderItem(arr, 'a', 'c', isSinglePinned))).toEqual([
      'nav', 'b', 'c', 'a', 'footer',
    ]);
    expect(ids(reorderItem(arr, 'c', 'a', isSinglePinned))).toEqual([
      'nav', 'c', 'a', 'b', 'footer',
    ]);
  });

  it('will not move a pinned item itself', () => {
    const arr = singleSections();
    expect(reorderItem(arr, 'nav', 'b', isSinglePinned)).toBe(arr);
    expect(reorderItem(arr, 'footer', 'b', isSinglePinned)).toBe(arr);
  });

  it('will not displace a pin (cannot drop onto nav/footer slot)', () => {
    const arr = singleSections();
    expect(reorderItem(arr, 'a', 'footer', isSinglePinned)).toBe(arr);
    expect(reorderItem(arr, 'c', 'nav', isSinglePinned)).toBe(arr);
  });

  it('no-ops when active === over or on an unknown id', () => {
    const arr = singleSections();
    expect(reorderItem(arr, 'b', 'b', isSinglePinned)).toBe(arr);
    expect(reorderItem(arr, 'nope', 'b', isSinglePinned)).toBe(arr);
  });

  it('reorders freely with no pin predicate (Multi pages)', () => {
    const arr = [page('p1'), page('p2'), page('p3')];
    expect(ids(reorderItem(arr, 'p1', 'p3'))).toEqual(['p2', 'p3', 'p1']);
  });

  it('does not mutate the input array', () => {
    const arr = singleSections();
    const before = ids(arr);
    reorderItem(arr, 'a', 'c', isSinglePinned);
    expect(ids(arr)).toEqual(before);
  });
});

describe('toggleVisible / toggleNavVisible — the two independent axes', () => {
  it('toggleVisible flips only the target item', () => {
    const arr = [page('p1', true), page('p2', true)];
    const out = toggleVisible(arr, 'p1');
    expect(out[0].visible).toBe(false);
    expect(out[1].visible).toBe(true);
  });

  it('toggleNavVisible flips nav.visible without touching visible', () => {
    const arr = [page('p1', true, true)];
    const out = toggleNavVisible(arr, 'p1');
    expect(out[0].nav.visible).toBe(false);
    expect(out[0].visible).toBe(true);
  });

  it('both toggles no-op on an unknown id', () => {
    const arr = [page('p1')];
    expect(toggleVisible(arr, 'nope')[0]).toEqual(arr[0]);
    expect(toggleNavVisible(arr, 'nope')[0]).toEqual(arr[0]);
  });

  it('does not mutate the input item', () => {
    const arr = [page('p1', true, true)];
    toggleVisible(arr, 'p1');
    toggleNavVisible(arr, 'p1');
    expect(arr[0].visible).toBe(true);
    expect(arr[0].nav.visible).toBe(true);
  });
});

describe('relabelNav', () => {
  it('sets nav.label on the target only', () => {
    const arr = [page('p1'), page('p2')];
    const out = relabelNav(arr, 'p1', 'Home');
    expect(out[0].nav.label).toBe('Home');
    expect(out[1].nav.label).toBe('p2');
  });

  it('no-ops on an unknown id and does not mutate', () => {
    const arr = [page('p1')];
    expect(relabelNav(arr, 'nope', 'X')[0]).toEqual(arr[0]);
    expect(arr[0].nav.label).toBe('p1');
  });
});

describe('isSinglePinned', () => {
  it('pins nav and footer only', () => {
    expect(isSinglePinned(section('nav', 'nav'))).toBe(true);
    expect(isSinglePinned(section('footer', 'footer'))).toBe(true);
    expect(isSinglePinned(section('a', 'hero'))).toBe(false);
  });
});

// ── Mode-agnostic dispatchers ────────────────────────────────────────────────

const singleJson = (): SinglePageTemplate => ({
  templateKey: 'cafe-default',
  globalStyles,
  mode: 'single',
  sections: singleSections(),
});

const multiJson = (): MultiPageTemplate => ({
  templateKey: 'corporate-multipage',
  globalStyles,
  mode: 'multi',
  shared: { header: [], footer: [] },
  pages: [page('home'), page('about'), page('contact')],
});

describe('dispatchers — pick sections vs pages by mode', () => {
  it('moveNavItem respects Single pins', () => {
    const json = singleJson();
    moveNavItem(json, 'a', 'up'); // blocked by pinned nav
    expect(ids(json.sections)).toEqual(['nav', 'a', 'b', 'c', 'footer']);
    moveNavItem(json, 'b', 'up');
    expect(ids(json.sections)).toEqual(['nav', 'b', 'a', 'c', 'footer']);
  });

  it('moveNavItem reorders Multi pages with no pins', () => {
    const json = multiJson();
    moveNavItem(json, 'home', 'down');
    expect(ids(json.pages)).toEqual(['about', 'home', 'contact']);
  });

  it('reorderNavItem respects Single pins', () => {
    const json = singleJson();
    reorderNavItem(json, 'a', 'footer'); // cannot displace the pinned footer
    expect(ids(json.sections)).toEqual(['nav', 'a', 'b', 'c', 'footer']);
    reorderNavItem(json, 'b', 'c');
    expect(ids(json.sections)).toEqual(['nav', 'a', 'c', 'b', 'footer']);
  });

  it('reorderNavItem reorders Multi pages with no pins', () => {
    const json = multiJson();
    reorderNavItem(json, 'home', 'contact');
    expect(ids(json.pages)).toEqual(['about', 'contact', 'home']);
  });

  it('toggle + relabel hit json.sections for Single', () => {
    const json = singleJson();
    toggleNavItemVisible(json, 'a');
    toggleNavItemNavVisible(json, 'a');
    relabelNavItem(json, 'a', 'Welcome');
    const a = json.sections.find((s) => s.id === 'a')!;
    expect(a.visible).toBe(false);
    expect(a.nav.visible).toBe(false);
    expect(a.nav.label).toBe('Welcome');
  });

  it('toggle + relabel hit json.pages for Multi', () => {
    const json = multiJson();
    toggleNavItemVisible(json, 'about');
    toggleNavItemNavVisible(json, 'about');
    relabelNavItem(json, 'about', 'Our Story');
    const p = json.pages.find((x) => x.id === 'about')!;
    expect(p.visible).toBe(false);
    expect(p.nav.visible).toBe(false);
    expect(p.nav.label).toBe('Our Story');
  });
});
